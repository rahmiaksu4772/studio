
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { getAuth, sendPasswordResetEmail, deleteUser as deleteAuthUser } from 'firebase/auth';
import { app } from '@/lib/firebase';

// WARNING: This delete action only removes the user from Firestore, but not from
// Firebase Authentication due to security restrictions on the client-side SDK.
// For a complete deletion, you must manually delete the user from the Firebase Console's
// Authentication tab, or implement a Cloud Function.
export async function deleteUserAction(userId: string) {
  try {
    // This only deletes the Firestore document, not the Auth user.
    await deleteDoc(doc(db, 'users', userId));
    return { success: true, message: 'Kullanıcı kaydı Firestore veritabanından silindi. Lütfen Firebase Authentication panelinden de silmeyi unutmayın.' };
  } catch (error: any) {
    console.error('Error deleting user document:', error);
    return { success: false, message: 'Kullanıcı veritabanından silinirken bir hata oluştu: ' + error.message };
  }
}


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, message: 'Kullanıcı rolü güncellenirken bir hata oluştu: ' + error.message };
  }
}


export async function sendPasswordResetEmailAction(email: string) {
    const auth = getAuth(app);
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: `Şifre sıfırlama e-postası ${email} adresine gönderildi.` };
    } catch (error: any) {
        console.error('Error sending password reset email:', error);
        return { success: false, message: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.' };
    }
}

export const sendNotificationToAllUsersAction = async (data: { title: string; body: string; author: any; }) => {
    // This function can't be implemented securely on the client-side.
    // It requires a Cloud Function to prevent abuse.
    return { success: false, message: "Bu özellik güvenlik nedeniyle sunucu fonksiyonu gerektirir ve şu anda devre dışıdır." };
};

export const deleteNotificationAction = async (notificationId: string) => {
    try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        return { success: true, message: "Duyuru başarıyla silindi." };
    } catch (error: any) {
        console.error("Error deleting notification:", error);
        return { success: false, message: "Duyuru silinirken bir hata oluştu." };
    }
}
