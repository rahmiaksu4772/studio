
'use server';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import type { UserRole } from '@/lib/types';
import { app, db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';


// Initialize functions, specifying the correct region.
const functions = getFunctions(getApp(), 'europe-west1');

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const roleToSet = newRole === 'admin' ? true : (newRole === 'teacher' ? false : null);
    if (roleToSet === null) {
         return { success: false, message: 'Geçersiz rol ataması.' };
    }

    // Call the Cloud Function to set the custom claim for security rules.
    const setAdminClaimFunction = httpsCallable(functions, 'setAdminClaim');
    await setAdminClaimFunction({ uid: userId, isAdmin: roleToSet });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    const message = error.message || 'Bir hata oluştu.';
    if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
         return { success: false, message: 'Bu işlemi yapmak için yönetici yetkiniz bulunmuyor.' };
    }
    return { success: false, message: `Kullanıcı rolü güncellenirken bir hata oluştu: ${message}` };
  }
}


export async function deleteUserAction(userId: string) {
    try {
        const deleteUserFunction = httpsCallable(functions, 'deleteUser');
        const result = await deleteUserFunction({ uid: userId });
        return { success: true, message: (result.data as any).message || 'Kullanıcı başarıyla silindi.' };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        const message = error.message || 'Bir hata oluştu.';
        if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
            return { success: false, message: 'Bu işlemi yapmak için admin yetkiniz bulunmuyor.' };
        }
        return { success: false, message: `Kullanıcı silinirken bir hata oluştu: ${message}` };
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

