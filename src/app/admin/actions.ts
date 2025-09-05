
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase-admin';
import type { UserRole } from '@/lib/types';
import { collection, doc, query, getDocs, writeBatch, where, collectionGroup, deleteDoc } from 'firebase/firestore';
import { db, auth as clientAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { deletePost } from '@/hooks/use-forum';


// Initialize Firebase Admin SDK
const adminApp = initializeAdmin();
const auth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);


async function deleteUserSubcollection(userId: string, subcollectionName: string, batch: FirebaseFirestore.WriteBatch) {
    const subcollectionRef = adminDb.collection('users').doc(userId).collection(subcollectionName);
    const snapshot = await subcollectionRef.get();

    if (snapshot.empty) {
        return;
    }

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
}

export async function deleteUserAction(userId: string) {
  try {
    const batch = adminDb.batch();

    // --- Delete all user-related data from Firestore ---

    // 1. Delete all class-related subcollections
    const classesSnapshot = await adminDb.collection('users').doc(userId).collection('classes').get();
    for (const classDoc of classesSnapshot.docs) {
      await deleteUserSubcollection(userId, `classes/${classDoc.id}/records`, batch);
      await deleteUserSubcollection(userId, `classes/${classDoc.id}/students`, batch);
      batch.delete(classDoc.ref);
    }
    
    // 2. Delete top-level subcollections (notes, plans, schedules)
    await deleteUserSubcollection(userId, 'notes', batch);
    await deleteUserSubcollection(userId, 'plans', batch);
    await deleteUserSubcollection(userId, 'schedules', batch);
    
    // Commit subcollection deletions
    await batch.commit();

    // 3. Delete user's forum posts and associated data
    // This part has to run separately because it uses the client SDK for its logic
    const userForumPostsQuery = query(collection(db, 'forum'), where('author.uid', '==', userId));
    const userForumPostsSnapshot = await getDocs(userForumPostsQuery);
    for (const postDoc of userForumPostsSnapshot.docs) {
        await deletePost(postDoc.id); // This already handles replies and comments for a specific post
    }
    
    // 4. Delete the main user document
    await adminDb.collection('users').doc(userId).delete();

    // 5. Delete user from Firebase Authentication
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
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
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
