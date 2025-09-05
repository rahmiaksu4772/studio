
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Lesson, Day } from "../../src/lib/types";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

const dayOrder: Day[] = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

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
                
                // Optional: Clean up invalid tokens
                const tokensToDelete: Promise<any>[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && resp.error) {
                       const errorCode = resp.error.code;
                       if (errorCode === 'messaging/invalid-registration-token' ||
                           errorCode === 'messaging/registration-token-not-registered') {
                           const failedToken = uniqueTokens[idx];
                           console.log('Invalid token found:', failedToken, 'Error:', errorCode);
                           // Here you would implement logic to find which user has this token and remove it.
                           // This is complex, so for now we'll just log it.
                       }
                    }
                });
            }
        } catch (error) {
            console.error("Error sending notifications:", error);
        }
    });

// This function runs every 5 minutes to check for upcoming lessons and send notifications.
export const sendLessonStartNotifications = functions.region('europe-west1').pubsub
    .schedule('every 5 minutes')
    .timeZone('Europe/Istanbul') // Set the timezone for the function
    .onRun(async (context) => {
        const now = new Date();
        const currentDayName = dayOrder[now.getDay()];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        console.log(`Running job for: ${currentDayName} at ${currentTime}`);

        const usersSnapshot = await db.collection('users').get();
        
        if (usersSnapshot.empty) {
            console.log("No users found.");
            return;
        }

        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            if (!user.fcmTokens || user.fcmTokens.length === 0) {
                // console.log(`User ${user.fullName} has no FCM tokens. Skipping.`);
                continue;
            }

            const scheduleDocRef = db.collection(`users/${userDoc.id}/schedules`).doc('weekly-lessons-schedule');
            const scheduleDoc = await scheduleDocRef.get();

            if (!scheduleDoc.exists) {
                // console.log(`User ${user.fullName} has no schedule. Skipping.`);
                continue;
            }
            
            const scheduleData = scheduleDoc.data();
            if (!scheduleData) {
                // console.log(`User ${user.fullName} has an empty schedule document. Skipping.`);
                continue;
            }

            const todaysLessons: Lesson[] = scheduleData[currentDayName] || [];

            for (const lesson of todaysLessons) {
                // Only send notification if the lesson start time matches the current time exactly.
                if (lesson.time === currentTime) {
                    console.log(`MATCH FOUND: Sending notification to ${user.fullName} for lesson ${lesson.subject} at ${lesson.time}`);

                    const message = {
                        notification: {
                            title: 'İyi Dersler',
                            body: `${lesson.class} ${lesson.subject} dersi zamanı geldi. Kazanımlara ulaşmak için tıklayınız.`
                        },
                        tokens: user.fcmTokens,
                        webpush: {
                            notification: {
                                icon: "https://takip-k0hdb.web.app/favicon.ico",
                            },
                        },
                    };
                    
                    try {
                        await messaging.sendEachForMulticast(message);
                        console.log(`Notification sent successfully to ${user.fullName} for lesson ${lesson.subject}.`);
                    } catch (error) {
                        console.error(`Error sending notification to ${user.fullName}:`, error);
                    }
                }
            }
        }
        
        console.log("Finished lesson notification job.");
        return null;
    });

