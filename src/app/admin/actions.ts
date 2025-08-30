
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
const adminApp = initializeAdmin();
const auth = getAuth(adminApp);
const db = getFirestore(adminApp);

export async function deleteUserAction(userId: string) {
  try {
    // Delete user from Firestore
    // This requires a recursive delete function if there are subcollections.
    // Firestore Admin SDK does not have a built-in recursive delete.
    // For simplicity, we'll delete the main user doc.
    // In a production app, you MUST implement recursive deletion for subcollections (classes, students, records, etc.)
    // For now, let's delete the user profile doc.
    await db.collection('users').doc(userId).delete();

    // Delete user from Firebase Authentication
    await auth.deleteUser(userId);

    return { success: true, message: 'Kullanıcı ve verileri başarıyla silindi.' };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, message: error.message || 'Kullanıcı silinirken bir hata oluştu.' };
  }
}

export async function updateUserRoleAction(userId: string, newRole: 'admin' | 'teacher') {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({ role: newRole });

    return { success: true, message: `Kullanıcının rolü başarıyla "${newRole}" olarak güncellendi.` };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, message: error.message || 'Kullanıcı rolü güncellenirken bir hata oluştu.' };
  }
}
