
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const adminDb = admin.firestore();
const adminAuth = admin.auth();

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
    
    // Allow the first admin to set claims without being an admin yet
    const isFirstAdmin = context.auth.token.email === 'rahmi.aksu.47@gmail.com';
    
    if (context.auth.token.admin !== true && !isFirstAdmin) {
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
        await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
        
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

// This function deletes a user from Firebase Authentication and their Firestore document.
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
        // Attempt to delete user from Auth first
        await adminAuth.deleteUser(uid);
    } catch (error: any) {
        console.error(`Kullanıcı Auth'dan silinirken hata oluştu: uid=${uid}`, error);
        // If the user is not found in Auth, it might have been already deleted.
        // We can proceed to delete the Firestore data.
        if (error.code !== 'auth/user-not-found') {
            throw new functions.https.HttpsError(
                'internal',
                'Kullanıcı kimliği silinirken bir sunucu hatası oluştu: ' + error.message
            );
        }
    }

    try {
        // Then delete the user document from Firestore
        await adminDb.collection('users').doc(uid).delete();
        return { message: `Kullanıcı ${uid} ve tüm verileri başarıyla silindi.` };
    } catch(error: any) {
        console.error(`Kullanıcı Firestore'dan silinirken hata oluştu: uid=${uid}`, error);
        throw new functions.https.HttpsError(
            'internal',
            'Kullanıcı verileri silinirken bir sunucu hatası oluştu: ' + error.message
        );
    }
});
