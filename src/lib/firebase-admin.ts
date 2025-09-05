
import admin from 'firebase-admin';

let adminApp: admin.app.App;

/**
 * Initializes the Firebase Admin SDK, ensuring it's only done once per server instance.
 * In a Google Cloud environment (like App Hosting), calling initializeApp() 
 * without arguments allows the SDK to automatically find the service account credentials.
 * This is the recommended approach.
 * @returns The initialized Firebase admin app instance.
 */
export function initializeAdmin() {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  adminApp = admin.initializeApp();
  return adminApp;
}
