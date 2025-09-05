import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const adminAuth = admin.auth();

// This function sets a custom claim on a user to grant/revoke admin privileges.
// It can only be called by an already authenticated admin.
export const setAdminClaim = functions.region('europe-west1').https.onCall(async (data, context) => {
    // Check if the caller is authenticated and is an admin.
    // The very first admin is an exception and can call this on anyone.
    const isFirstAdmin = context.auth?.token.email === 'rahmi.aksu.47@gmail.com';
    
    if (!context.auth || (!context.auth.token.admin && !isFirstAdmin)) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Bu işlemi yalnızca admin yetkisine sahip kullanıcılar yapabilir.'
        );
    }
    
    const { uid, isAdmin } = data;
    if (typeof uid !== 'string' || typeof isAdmin !== 'boolean') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Veri yükü "uid" (string) ve "isAdmin" (boolean) alanlarını içermelidir.'
        );
    }

    try {
        // Set the custom claim on the target user.
        await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
        
        // Return a success message.
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
    if (!context.auth?.token.admin) {
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
