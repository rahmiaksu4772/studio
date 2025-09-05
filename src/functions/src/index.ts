
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const adminDb = admin.firestore();
const adminAuth = admin.auth();

// This is the master admin email that can grant the first admin role.
const MASTER_ADMIN_EMAIL = "rahmi.aksu.47@gmail.com";

// This function sets a custom claim on a user to grant/revoke admin privileges.
export const setAdminClaim = functions.region('europe-west1').https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Bu işlemi yapmak için kimliğinizin doğrulanması gerekiyor.'
        );
    }
    
    // The caller must be an admin to set claims for others,
    // UNLESS they are the master admin, who can assign the first admin role.
    const isMasterAdmin = context.auth.token.email === MASTER_ADMIN_EMAIL;
    const isCallerAdmin = context.auth.token.admin === true;

    if (!isCallerAdmin && !isMasterAdmin) {
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
        // Set the custom claim on the user's Auth token
        await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });

        // Also update the role in the user's Firestore document for UI consistency
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.update({ role: isAdmin ? 'admin' : 'teacher' });

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
        // Delete user from Auth first.
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
    } catch (error: any) {
        console.error(`Kullanıcı Firestore'dan silinirken hata oluştu: uid=${uid}`, error);
        throw new functions.https.HttpsError(
            'internal',
            'Kullanıcı verileri silinirken bir sunucu hatası oluştu: ' + error.message
        );
    }
});
