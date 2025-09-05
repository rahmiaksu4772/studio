import 'server-only';
import admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK, ensuring it's only done once.
 * This function is designed to be called at the beginning of each server-side
 * action or function that needs to interact with Firebase services as an admin.
 * @returns An object containing the initialized admin app, auth, and firestore instances.
 */
export function initializeAdmin() {
  // Check if an app is already initialized. This is the robust way to prevent
  // "The default Firebase app already exists" errors in serverless environments
  // where code might be re-initialized in different contexts.
  if (admin.apps.length > 0 && admin.apps[0]) {
    const adminApp = admin.apps[0];
    return {
      adminApp,
      adminAuth: admin.auth(adminApp),
      adminDb: admin.firestore(adminApp),
    };
  }

  // If no app is initialized, initialize one.
  // Calling initializeApp() without arguments in a Google Cloud environment
  // (like App Hosting or Cloud Functions) allows the SDK to automatically
  // find the service account credentials. This is the recommended approach.
  const adminApp = admin.initializeApp();
  
  return {
    adminApp,
    adminAuth: admin.auth(adminApp),
    adminDb: admin.firestore(adminApp),
  };
}
