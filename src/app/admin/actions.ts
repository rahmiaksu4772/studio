
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase-admin';
import type { UserRole } from '@/lib/types';
import { collection, doc, query, getDocs, writeBatch, where, deleteDoc } from 'firebase/firestore';
import { db, auth as clientAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';


// Initialize Firebase Admin SDK
const adminApp = initializeAdmin();
const auth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

/**
 * Recursively deletes a collection and all its subcollections.
 * A batched write can contain up to 500 operations. We chunk the deletions.
 */
async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference, batchSize: number = 499): Promise<void> {
    const q = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(q, resolve).catch(reject);
    });

    async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void) {
        const snapshot = await query.get();

        if (snapshot.size === 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        // Delete documents in a batch
        const batch = adminDb.batch();
        for (const doc of snapshot.docs) {
            // Recursively delete subcollections
            const subcollections = await doc.ref.listCollections();
            for (const subcollection of subcollections) {
                await deleteCollection(subcollection, batchSize);
            }
            batch.delete(doc.ref);
        }
        await batch.commit();

        // Recurse on the same query to process next batch
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
    const userRef = adminDb.collection('users').doc(userId);

    // 1. Delete all posts authored by the user and their subcollections
    const userForumPostsQuery = adminDb.collection('forum').where('author.uid', '==', userId);
    const userForumPostsSnapshot = await userForumPostsQuery.get();
    for (const postDoc of userForumPostsSnapshot.docs) {
        await deleteCollection(postDoc.ref.collection('replies'));
        await postDoc.ref.delete();
    }

    // 2. Delete all replies and comments from the user on other posts
    // This is a more complex operation and requires iterating through all posts/replies.
    // For simplicity and performance, we'll focus on direct data. A more robust solution
    // might involve a different data structure or Cloud Function triggers.
    // The current implementation will leave orphaned replies/comments on other's posts.
    // We will now address this by iterating.

    const allPostsSnapshot = await adminDb.collection('forum').get();
    for (const postDoc of allPostsSnapshot.docs) {
        const repliesRef = postDoc.ref.collection('replies');
        
        // Delete user's replies on this post
        const userRepliesQuery = repliesRef.where('author.uid', '==', userId);
        const userRepliesSnapshot = await userRepliesQuery.get();
        for (const replyDoc of userRepliesSnapshot.docs) {
            await deleteCollection(replyDoc.ref.collection('comments'));
            await replyDoc.ref.delete();
        }
        
        // Delete user's comments on remaining replies
        const remainingRepliesSnapshot = await repliesRef.get();
        for(const replyDoc of remainingRepliesSnapshot.docs) {
            const commentsRef = replyDoc.ref.collection('comments');
            const userCommentsQuery = commentsRef.where('author.uid', '==', userId);
            const userCommentsSnapshot = await userCommentsQuery.get();
            const batch = adminDb.batch();
            userCommentsSnapshot.forEach(commentDoc => batch.delete(commentDoc.ref));
            await batch.commit();
        }
    }


    // 3. Delete all top-level subcollections for the user
    const subcollectionsToDelete = ['notes', 'plans', 'schedules', 'classes'];
    for (const subcollectionName of subcollectionsToDelete) {
        const subcollectionRef = userRef.collection(subcollectionName);
        await deleteCollection(subcollectionRef);
    }
    
    // 4. Delete the main user document from the 'users' collection
    await userRef.delete();

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
        // Instead of sending from the server, we write to a Firestore collection
        // that a Cloud Function will listen to.
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
        const notificationRef = doc(db, 'notifications', notificationId);
        await deleteDoc(notificationRef);
        return { success: true, message: 'Bildirim başarıyla silindi.' };
    } catch(error: any) {
        console.error('Error deleting notification: ', error);
        return { success: false, message: 'Bildirim silinirken bir hata oluştu.'}
    }
}

export async function sendPasswordResetEmailAction(email: string) {
    try {
      await sendPasswordResetEmail(clientAuth, email);
      return { success: true, message: `"${email}" adresine şifre sıfırlama e-postası başarıyla gönderildi.` };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      return { success: false, message: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu. Lütfen kullanıcının e-posta adresinin doğru olduğundan emin olun.' };
    }
  }



