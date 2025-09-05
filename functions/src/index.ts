
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Lesson, Day } from "../../src/lib/types";
import { initializeAdmin } from "../../src/lib/firebase-admin";

// Initialize the SDK only once using the centralized function.
initializeAdmin();

const db = admin.firestore();
const messaging = admin.messaging();

// This function triggers when a new document is created in the /notifications collection.
export const sendNotificationOnCreate = functions.region('europe-west1').firestore
    .document("notifications/{notificationId}")
    .onCreate(async (snap, context) => {
        const notificationData = snap.data();

        if (!notificationData) {
            console.log("No data in notification document.");
            return;
        }

        const {title, body} = notificationData;

        // 1. Get all users
        const usersSnapshot = await db.collection("users").get();
        if (usersSnapshot.empty) {
            console.log("No users to send notifications to.");
            return;
        }

        // 2. Collect all FCM tokens
        const allTokens: string[] = [];
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
                allTokens.push(...userData.fcmTokens);
            }
        });

        if (allTokens.length === 0) {
            console.log("No FCM tokens found for any user.");
            return;
        }
        
        // Remove duplicates
        const uniqueTokens = [...new Set(allTokens)];

        console.log(`Sending notification to ${uniqueTokens.length} tokens.`);

        // 3. Construct and send the multicast message
        const message = {
            notification: {
                title: title || "Yeni Bildirim",
                body: body || "Yeni bir mesajınız var.",
            },
            tokens: uniqueTokens,
            // Optional: Webpush specific config
            webpush: {
                notification: {
                    icon: "https://takip-k0hdb.web.app/favicon.ico", // URL to your app's icon
                },
            },
        };

        try {
            const response = await messaging.sendEachForMulticast(message);
            console.log(`${response.successCount} messages were sent successfully.`);
            
            if (response.failureCount > 0) {
                console.log(`${response.failureCount} messages failed to send.`);
                
                const invalidTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && resp.error) {
                       const errorCode = resp.error.code;
                       if (errorCode === 'messaging/invalid-registration-token' ||
                           errorCode === 'messaging/registration-token-not-registered') {
                           const failedToken = uniqueTokens[idx];
                           invalidTokens.push(failedToken);
                           console.log('Invalid token found:', failedToken, 'Error:', errorCode);
                       }
                    }
                });

                // Clean up invalid tokens from Firestore
                if (invalidTokens.length > 0) {
                    const allUsers = await db.collection('users').get();
                    const batch = db.batch();
                    allUsers.forEach(userDoc => {
                        const userData = userDoc.data();
                        const userTokens = userData.fcmTokens || [];
                        const tokensToKeep = userTokens.filter((token: string) => !invalidTokens.includes(token));

                        // If the token array has changed, update the document
                        if (tokensToKeep.length < userTokens.length) {
                             batch.update(userDoc.ref, { fcmTokens: tokensToKeep });
                        }
                    });
                    await batch.commit();
                    console.log(`Cleaned up ${invalidTokens.length} invalid tokens from user profiles.`);
                }
            }
        } catch (error) {
            console.error("Error sending notifications:", error);
        }
    });

