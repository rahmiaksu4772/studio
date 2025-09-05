'use server';

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import type { UserRole } from '@/lib/types';
import { app, db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    const message = error.message || 'Bir hata oluştu.';
    // Firestore security rules will throw a "permission-denied" or "PERMISSION_DENIED" error
    if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
         return { success: false, message: 'Bu işlemi yapmak için admin yetkiniz bulunmuyor.' };
    }
    return { success: false, message: `Kullanıcı rolü güncellenirken bir hata oluştu: ${message}` };
  }
}


export async function deleteUserAction(userId: string) {
    try {
        // This action now only deletes the Firestore document.
        // Deleting from Auth requires a Cloud Function, which is on a paid plan.
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        return { success: true, message: `Kullanıcının Firestore verileri başarıyla silindi.` };
    } catch (error: any) {
        console.error('Error deleting user document:', error);
        const message = error.message || 'Bir hata oluştu.';
        if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
            return { success: false, message: 'Bu işlemi yapmak için admin yetkiniz bulunmuyor.' };
        }
        return { success: false, message: `Kullanıcı verileri silinirken bir hata oluştu: ${message}` };
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
    // This action requires admin privileges defined in security rules.
    // However, sending to ALL users efficiently and securely requires a Cloud Function.
    // For now, this action is disabled to prevent client-side loops.
    return { success: false, message: "Bu özellik güvenlik ve verimlilik nedeniyle bir sunucu fonksiyonu gerektirir ve şu anda devre dışıdır." };
};

export const deleteNotificationAction = async (notificationId: string) => {
    // This action requires admin privileges defined in security rules.
    const notificationRef = doc(db, 'notifications', notificationId);
    try {
        await deleteDoc(notificationRef);
        return { success: true, message: "Duyuru başarıyla silindi." };
    } catch (error: any) {
        console.error("Error deleting notification:", error);
        return { success: false, message: "Duyuru silinirken bir hata oluştu." };
    }
}
