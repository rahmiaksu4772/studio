
'use server';

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app, db } from '@/lib/firebase';


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    if (error.code === 'permission-denied') {
        return { success: false, message: 'Bu işlemi yapmak için yönetici yetkiniz bulunmuyor.' };
    }
    return { success: false, message: 'Kullanıcı rolü güncellenirken bir hata oluştu: ' + error.message };
  }
}


export async function deleteUserAction(userId: string) {
    try {
        // This only deletes the Firestore document. Deleting from Auth requires a Cloud Function (Admin SDK).
        // This is a limitation of the client-side only approach.
        await deleteDoc(doc(db, 'users', userId));
        return { success: true, message: 'Kullanıcı veritabanından başarıyla silindi.' };
    } catch (error: any) {
        console.error('Error deleting user from Firestore:', error);
        if (error.code === 'permission-denied') {
            return { success: false, message: 'Bu işlemi yapmak için admin yetkiniz bulunmuyor.' };
        }
        return { success: false, message: 'Kullanıcı silinirken bir hata oluştu: ' + error.message };
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
