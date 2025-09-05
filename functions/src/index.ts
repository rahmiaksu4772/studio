import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const messaging = admin.messaging();

// This function sets a custom claim on a user to grant/revoke admin privileges.
// It can only be called by an already authenticated admin.
export const setAdminClaim = functions.region('europe-west1').https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Bu işlemi yapmak için kimliğinizin doğrulanması gerekiyor.'
        );
    }

    // 1. Check if the caller is an admin.
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Bu işlemi yalnızca admin yetkisine sahip kullanıcılar yapabilir.'
        );
    }
    
    // 2. Get the target user's UID and the claim to set from the data payload.
    const { uid, isAdmin } = data;
    if (typeof uid !== 'string' || typeof isAdmin !== 'boolean') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Veri yükü "uid" (string) ve "isAdmin" (boolean) alanlarını içermelidir.'
        );
    }

    try {
        // 3. Set the custom claim on the target user.
        await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
        
        // 4. Return a success message.
        return { 
            message: `Başarılı! Kullanıcı ${uid} için admin yetkisi ${isAdmin ? 'verildi' : 'kaldırıldı'}.`
        };

    } catch (error: any) {
        console.error(`Admin claim ayarlanırken hata oluştu: uid=${uid}, isAdmin=${isAdmin}`, error);
        throw new functions.https.HttpsError(
            'internal',
            'Kullanıcı yetkileri ayarlanırken bir sunucu hatası oluştu: ' + error.message
        );
    }
});

// This function deletes a user from Firebase Authentication
// It can only be called by an authenticated admin.
export const deleteUser = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (context.auth?.token.admin !== true) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Bu işlemi yalnızca admin yetkisine sahip kullanıcılar yapabilir.'
        );
    }
    
    const { uid } = data;
    if (typeof uid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Veri yükü "uid" (string) alanını içermelidir.'
        );
    }

    try {
        await adminAuth.deleteUser(uid);
        return { message: `Kullanıcı ${uid} başarıyla kimlik doğrulama sisteminden silindi.` };
    } catch (error: any) {
        console.error(`Kullanıcı silinirken hata oluştu: uid=${uid}`, error);
        throw new functions.https.HttpsError(
            'internal',
            'Kullanıcı silinirken bir sunucu hatası oluştu: ' + error.message
        );
    }
});


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
        const usersSnapshot = await adminDb.collection("users").get();
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
                    const allUsers = await adminDb.collection('users').get();
                    const batch = adminDb.batch();
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

// Cloud function to bootstrap the first admin user
export const bootstrapAdmin = functions.region('europe-west1').https.onCall(async (data, context) => {
    // This function should have minimal security, only checking if the caller is the designated first admin.
    // In a real app, this might be triggered by a more secure mechanism or run only once.
    if (context.auth?.token.email !== 'rahmi.aksu.47@gmail.com') {
         throw new functions.https.HttpsError(
            'permission-denied',
            'Bu işlemi yalnızca özel yetkili kullanıcı yapabilir.'
        );
    }
     const uid = context.auth.uid;
     try {
        await adminAuth.setCustomUserClaims(uid, { admin: true });
        return { message: 'İlk admin başarıyla atandı.' };
    } catch (error: any) {
        console.error('İlk admin atanırken hata oluştu', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
