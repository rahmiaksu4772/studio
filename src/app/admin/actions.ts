
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase-admin';
import type { UserRole } from '@/lib/types';
import { sendPasswordResetEmail } from 'firebase/auth'; // Client auth for one specific action

// Initialize Firebase Admin SDK ONCE at the module level.
// This ensures that all functions in this file share the same initialized instance.
const adminApp = initializeAdmin();
const auth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

/**
 * Recursively deletes a collection and all its subcollections.
 * A batched write can contain up to 500 operations. We chunk the deletions.
 */
async function deleteCollection(collectionPath: string, batchSize: number = 499) {
    const collectionRef = adminDb.collection(collectionPath);
    const q = collectionRef.limit(batchSize);

    return new Promise<void>((resolve, reject) => {
        deleteQueryBatch(q, resolve).catch(reject);
    });

    async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void) {
        const snapshot = await query.get();

        if (snapshot.size === 0) {
            resolve();
            return;
        }

        const batch = adminDb.batch();
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
  try {
    // 1. Delete all posts and replies authored by the user from the 'forum' collection
    const userForumPostsQuery = adminDb.collection('forum').where('author.uid', '==', userId);
    const userForumPostsSnapshot = await userForumPostsQuery.get();
    const postDeletionBatch = adminDb.batch();
    for (const postDoc of userForumPostsSnapshot.docs) {
        // Delete all subcollections (replies and their comments) within each post
        await deleteCollection(`forum/${postDoc.id}/replies`);
        postDeletionBatch.delete(postDoc.ref);
    }
    await postDeletionBatch.commit();
    
    // 2. Delete all replies and comments from the user on other people's posts
    // This requires iterating through all posts and their replies
    const allPostsSnapshot = await adminDb.collection('forum').get();
    for (const postDoc of allPostsSnapshot.docs) {
        // Delete user's replies on this post
        const userRepliesQuery = adminDb.collection(`forum/${postDoc.id}/replies`).where('author.uid', '==', userId);
        const userRepliesSnapshot = await userRepliesQuery.get();
        for (const replyDoc of userRepliesSnapshot.docs) {
            await deleteCollection(`forum/${postDoc.id}/replies/${replyDoc.id}/comments`);
            await replyDoc.ref.delete(); // Delete the reply doc itself
        }
        
        // Delete user's comments on remaining replies
        const remainingRepliesSnapshot = await adminDb.collection(`forum/${postDoc.id}/replies`).get();
        for(const replyDoc of remainingRepliesSnapshot.docs) {
            const userCommentsQuery = adminDb.collection(`forum/${postDoc.id}/replies/${replyDoc.id}/comments`).where('author.uid', '==', userId);
            const userCommentsSnapshot = await userCommentsQuery.get();
            const commentDeletionBatch = adminDb.batch();
            userCommentsSnapshot.forEach(commentDoc => commentDeletionBatch.delete(commentDoc.ref));
            await commentDeletionBatch.commit();
        }
    }

    // 3. Delete all top-level subcollections for the user (notes, plans, schedules, classes)
    const userSubcollections = ['notes', 'plans', 'schedules', 'classes'];
    for (const subcollectionName of userSubcollections) {
        await deleteCollection(`users/${userId}/${subcollectionName}`);
    }
    
    // 4. Delete the main user document from the 'users' collection
    await adminDb.collection('users').doc(userId).delete();

    // 5. Delete user from Firebase Authentication
    // This is done last to ensure all data is cleaned up first.
    await auth.deleteUser(userId);

    return { success: true, message: 'Kullanıcı ve ilişkili tüm verileri başarıyla silindi.' };
  } catch (error: any) {
    console.error('Error deleting user and their data:', error);
    return { success: false, message: error.message || 'Kullanıcı silinirken bir hata oluştu.' };
  }
}


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({ role: newRole });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, message: error.message || 'Kullanıcı rolü güncellenirken bir hata oluştu.' };
  }
}


export async function sendNotificationToAllUsersAction(title: string, body: string, author: { uid: string, name: string, avatarUrl?: string }) {
    try {
        const notificationsRef = adminDb.collection('notifications');
        await notificationsRef.add({
            title,
            body,
            author,
            createdAt: new Date().toISOString(),
        });

        return { 
            success: true, 
            message: `Bildirim, tüm kullanıcılara gönderilmek üzere sıraya alındı.` 
        };

    } catch (error: any) {
        console.error('Error queueing notification:', error);
        return { success: false, message: error.message || 'Bildirim sıraya alınırken bir hata oluştu.' };
    }
}

export async function deleteNotificationAction(notificationId: string) {
    try {
        // This action can be called from the client, so it should use the client SDK
        // But since it's a delete action on a top-level collection, it's safer with admin access.
        await adminDb.collection('notifications').doc(notificationId).delete();
        return { success: true, message: 'Bildirim başarıyla silindi.' };
    } catch(error: any) {
        console.error('Error deleting notification: ', error);
        return { success: false, message: 'Bildirim silinirken bir hata oluştu.'}
    }
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
