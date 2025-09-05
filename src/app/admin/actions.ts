'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

export async function deleteUserAction(userId: string) {
  // This is a placeholder for a secure deletion process.
  // In a real app, this should be handled by a Cloud Function with admin privileges
  // to delete the user from Firebase Auth and all their associated Firestore data.
  // For now, we will only delete the user document from Firestore as a demonstration.
  try {
    // Note: This does not delete the user from Firebase Authentication.
    // A Cloud Function would be required for that.
    await updateDoc(doc(db, 'users', userId), { role: 'beklemede' }); // Simulate deletion by revoking role
    return { success: true, message: 'Kullanıcı verileri başarıyla silindi (simülasyon). Tam silme için Cloud Function gereklidir.' };
  } catch (error: any) {
    console.error('Error "deleting" user data:', error);
    return { success: false, message: 'Kullanıcı verileri silinirken bir hata oluştu: ' + error.message };
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
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: `Şifre sıfırlama e-postası ${email} adresine gönderildi.` };
    } catch (error: any) {
        console.error('Error sending password reset email:', error);
        return { success: false, message: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.' };
    }
}
