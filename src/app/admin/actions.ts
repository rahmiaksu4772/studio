'use server';

import { db } from '@/lib/firebase';
import { getFirestore, doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { sendPasswordResetEmail } from 'firebase/auth';


/**
 * Recursively deletes a collection and all its subcollections.
 * A batched write can contain up to 500 operations. We chunk the deletions.
 */
async function deleteCollection(collectionPath: string, batchSize: number = 499) {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, limit(batchSize));

    return new Promise<void>((resolve, reject) => {
        deleteQueryBatch(q, resolve).catch(reject);
    });

    async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void) {
        const snapshot = await getDocs(query);

        if (snapshot.size === 0) {
            resolve();
            return;
        }

        const batch = writeBatch(db);
        for (const doc of snapshot.docs) {
            const subcollections = await doc.ref.listCollections();
            for (const subcollection of subcollections) {
                // Recursively delete subcollections first
                await deleteCollection(subcollection.path, batchSize);
            }
            batch.delete(doc.ref);
        }
        await batch.commit();

        process.nextTick(() => {
            deleteQueryBatch(query, resolve);
        });
    }
}


/**
 * A server-side action to completely delete a user and all their associated data from Firestore and Auth.
 * @param userId The ID of the user to delete.
 */
export async function deleteUserAction(userId: string) {
  // This action requires Admin SDK to delete from Auth. We'll leave it as is for now,
  // but it will likely face the same issues until the root cause is fixed.
  // For now, the focus is on updateUserRoleAction.
  console.error("deleteUserAction requires Admin SDK and is currently disabled pending auth fix.");
  return { success: false, message: 'Kullanıcı silme işlemi şu anda devre dışı.' };
}


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    // Firestore security rules will reject this if the user is not an admin.
    if (error.code === 'permission-denied') {
        return { success: false, message: 'Bu işlemi yapma yetkiniz yok. Lütfen yönetici hesabıyla giriş yaptığınızdan emin olun.' };
    }
    return { success: false, message: error.message || 'Kullanıcı rolü güncellenirken bir hata oluştu.' };
  }
}


export async function sendNotificationToAllUsersAction(title: string, body: string, author: { uid: string, name: string, avatarUrl?: string }) {
    // This action requires Admin SDK to work reliably and send notifications.
    console.error("sendNotificationToAllUsersAction requires Admin SDK and is currently disabled pending auth fix.");
    return { success: false, message: 'Bildirim gönderme işlemi şu anda devre dışı.' };
}

export async function deleteNotificationAction(notificationId: string) {
    console.error("deleteNotificationAction requires Admin SDK and is currently disabled pending auth fix.");
    return { success: false, message: 'Bildirim silme işlemi şu anda devre dışı.' };
}

export async function sendPasswordResetEmailAction(email: string) {
    try {
      // This is a client-side action that does not require admin privileges.
      // We are using the client auth instance for this.
      const { auth: clientAuth } = await import('@/lib/firebase');
      await sendPasswordResetEmail(clientAuth, email);
      return { success: true, message: `"${email}" adresine şifre sıfırlama e-postası başarıyla gönderildi.` };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      // It's better to return a generic error message to avoid leaking user existence info.
      return { success: false, message: 'Şifre sıfırlama e-postası gönderilemedi. Lütfen girdiğiniz e-postanın doğru olduğundan emin olun.' };
    }
  }