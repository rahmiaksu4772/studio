'use server';

import { db, auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, writeBatch, deleteDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
    
    // First, update the role in Firestore document
    await updateDoc(userRef, { role: newRole });
    
    // Then, call the cloud function to set the custom claim
    const functions = getFunctions();
    const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
    await setAdminClaim({ uid: userId, isAdmin: newRole === 'admin' });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi ve yetkileri ayarlandı.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    // Firestore security rules will reject this if the user is not an admin.
    if (error.code === 'permission-denied' || (error.details && error.details.code === 'permission-denied')) {
        return { success: false, message: 'Bu işlemi yapma yetkiniz yok. Lütfen yönetici hesabıyla giriş yaptığınızdan emin olun veya Firestore kurallarınızı kontrol edin.' };
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
