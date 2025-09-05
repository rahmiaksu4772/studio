
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
 * @param collectionRef The reference to the collection to delete.
 * @param batch The WriteBatch to add the delete operations to.
 */
async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference, batch: FirebaseFirestore.WriteBatch) {
    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
        return;
    }

    for (const doc of snapshot.docs) {
        // Recursively delete subcollections
        const subcollections = await doc.ref.listCollections();
        for (const subcollection of subcollections) {
            await deleteCollection(subcollection, batch);
        }
        batch.delete(doc.ref);
    }
}

/**
 * A server-side action to completely delete a user and all their associated data from Firestore and Auth.
 * @param userId The ID of the user to delete.
 */
export async function deleteUserAction(userId: string) {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const batch = adminDb.batch();

    // 1. Delete all top-level subcollections for the user (notes, plans, schedules, classes)
    const subcollectionsToDelete = ['notes', 'plans', 'schedules', 'classes'];
    for (const subcollectionName of subcollectionsToDelete) {
        const subcollectionRef = userRef.collection(subcollectionName);
        await deleteCollection(subcollectionRef, batch);
    }

    // 2. Delete user's forum posts and all associated replies and comments
    // CORRECTED: Use 'author.uid' instead of 'author.id'
    const userForumPostsQuery = adminDb.collection('forum').where('author.uid', '==', userId);
    const userForumPostsSnapshot = await userForumPostsQuery.get();
    
    for (const postDoc of userForumPostsSnapshot.docs) {
        // Delete all subcollections (replies and their comments) for each post
        await deleteCollection(postDoc.ref.collection('replies'), batch);
        batch.delete(postDoc.ref); // Delete the post itself
    }
    
    // 3. Delete the main user document
    batch.delete(userRef);

    // Commit all Firestore deletions
    await batch.commit();

    // 4. Delete user from Firebase Authentication
    // This is done last to ensure data is cleaned up first.
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

