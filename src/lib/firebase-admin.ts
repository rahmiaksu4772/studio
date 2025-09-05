
import admin from 'firebase-admin';

let adminApp: admin.app.App;

/**
 * Initializes the Firebase Admin SDK, ensuring it's only done once.
 * In a Google Cloud environment (like App Hosting), calling initializeApp() 
 * without arguments allows the SDK to automatically find the service account credentials.
 * @returns The initialized Firebase admin app instance.
 */
export function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  adminApp = admin.initializeApp();
  return adminApp;
}
