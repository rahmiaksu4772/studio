'use server';

import { db } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, writeBatch, deleteDoc, collection, getDocs } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { getFunctions, httpsCallable }from 'firebase/functions';
import { auth } from '@/lib/firebase';

/**
 * Recursively deletes a collection and all its subcollections.
 * A batched write can contain up to 500 operations. We chunk the deletions.
 */
async function deleteCollection(collectionPath: string, batchSize: number = 499) {
    const collectionRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(collectionRef);

    if (querySnapshot.size === 0) {
        return;
    }

    const batch = writeBatch(db);
    for (const docSnapshot of querySnapshot.docs) {
        // Recursively delete subcollections
        const subcollections = await docSnapshot.ref.listCollections();
        for (const subcollection of subcollections) {
            await deleteCollection(subcollection.path, batchSize);
        }
        batch.delete(docSnapshot.ref);
    }
    await batch.commit();

    if (querySnapshot.size >= batchSize) {
        return deleteCollection(collectionPath, batchSize);
    }
}


/**
 * A server-side action to completely delete a user and all their associated data from Firestore.
 * This function CANNOT delete the user from Firebase Auth without the Admin SDK.
 * For full deletion including Auth, a Cloud Function triggered by this action would be necessary.
 * @param userId The ID of the user to delete.
 */
export async function deleteUserAction(userId: string) {
  try {
    // Delete all subcollections for the user first
    await deleteCollection(`users/${userId}/classes`);
    await deleteCollection(`users/${userId}/notes`);
    await deleteCollection(`users/${userId}/plans`);
    await deleteCollection(`users/${userId}/schedules`);

    // Finally, delete the main user document
    await deleteDoc(doc(db, 'users', userId));
    
    // We also need to delete the user from auth, which requires a cloud function
    const functions = getFunctions();
    const deleteUserFn = httpsCallable(functions, 'deleteUser');
    await deleteUserFn({ uid: userId });

    return { success: true, message: 'Kullanıcının tüm verileri ve kimlik doğrulaması başarıyla silindi.' };
  } catch (error: any) {
    console.error('Error deleting user data:', error);
    return { success: false, message: 'Kullanıcı verileri silinirken bir hata oluştu: ' + error.message };
  }
}


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    const functions = getFunctions();

    // The setAdminClaim function is now the primary driver.
    // It will handle setting the custom claim which security rules rely on.
    const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
    await setAdminClaim({ uid: userId, isAdmin: newRole === 'admin' });
    
    // After the custom claim is successfully set, we also update the
    // role in the Firestore document to keep the UI consistent.
    await updateDoc(userRef, { role: newRole });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi ve yetkileri ayarlandı.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    // Cloud function errors are often wrapped. We check for permission-denied.
    if (error.code === 'functions/permission-denied' || (error.details && error.details.code === 'permission-denied')) {
        return { success: false, message: 'Bu işlemi yapma yetkiniz yok. Lütfen yönetici hesabıyla giriş yaptığınızdan emin olun.' };
    }
    return { success: false, message: error.message || 'Kullanıcı rolü güncellenirken bir hata oluştu.' };
  }
}


export async function sendPasswordResetEmailAction(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: `Şifre sıfırlama e-postası ${email} adresine gönderildi.` };
    } catch (error: any) {
        console.error('Error sending password reset email:', error);
        return { success: false, message: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.' };
    }
}
