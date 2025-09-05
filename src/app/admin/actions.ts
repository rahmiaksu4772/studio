
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase-admin';
import type { UserRole, ForumAuthor } from '@/lib/types';
import { getMessaging } from 'firebase-admin/messaging';
import { addDoc, collection, doc, deleteDoc, query, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth as clientAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';


// Initialize Firebase Admin SDK
const adminApp = initializeAdmin();
const auth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);
const messaging = getMessaging(adminApp);

async function deleteCollection(collectionPath: string, batch: FirebaseFirestore.WriteBatch) {
    const collectionRef = adminDb.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        return;
    }

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
}

export async function deleteUserAction(userId: string) {
  try {
    const batch = writeBatch(db);

    // --- Delete all user-related data from Firestore ---

    // 1. Delete all subcollections for each class
    const classesRef = collection(db, `users/${userId}/classes`);
    const classesSnapshot = await getDocs(classesRef);
    for (const classDoc of classesSnapshot.docs) {
      // Delete records and students for each class
      await deleteCollection(`users/${userId}/classes/${classDoc.id}/records`, batch);
      await deleteCollection(`users/${userId}/classes/${classDoc.id}/students`, batch);
      // Delete the class doc itself
      batch.delete(classDoc.ref);
    }
    
    // 2. Delete top-level subcollections (notes, plans, schedules)
    await deleteCollection(`users/${userId}/notes`, batch);
    await deleteCollection(`users/${userId}/plans`, batch);
    await deleteCollection(`users/${userId}/schedules`, batch);

    // Commit the deletions for subcollections
    await batch.commit();

    // 3. Delete the main user document after subcollections are handled
    await adminDb.collection('users').doc(userId).delete();

    // 4. Delete user from Firebase Authentication
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


export async function sendNotificationToAllUsersAction(title: string, body: string, author: ForumAuthor) {
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