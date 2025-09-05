
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/types';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';


// Initialize functions for the correct region
const functions = getFunctions(getApp(), 'europe-west1');

const setAdminClaimFunction = httpsCallable(functions, 'setAdminClaim');
const deleteUserFunction = httpsCallable(functions, 'deleteUser');


export async function deleteUserAction(userId: string) {
  try {
    // This single Cloud Function call handles deleting the user from both Auth and Firestore.
    const result = await deleteUserFunction({ uid: userId });
    return { success: true, message: (result.data as any).message };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Kullanıcı silinirken bir hata oluştu: ' + (error.details?.message || error.message || 'Bilinmeyen sunucu hatası.') };
  }
}


export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);

    // Set the role in the Firestore document
    await updateDoc(userRef, { role: newRole });

    // Set a custom claim using the Cloud Function for Auth-level role
    // We only set the 'admin' claim, other roles don't need special claims
    await setAdminClaimFunction({ uid: userId, isAdmin: newRole === 'admin' });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, message: 'Kullanıcı rolü güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen sunucu hatası.') };
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
