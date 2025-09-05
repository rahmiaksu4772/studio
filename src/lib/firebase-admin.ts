
import 'server-only';
import admin from 'firebase-admin';

// This file provides a centralized and robust way to initialize the Firebase Admin SDK.
// It ensures that the SDK is initialized only once, leveraging Google Cloud's
// Application Default Credentials (ADC) for authentication, which is the recommended
// and most secure method in a managed environment like App Hosting or Cloud Functions.

let adminApp: admin.app.App;

// Check if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  // If not initialized, initialize the app.
  // Calling initializeApp() without arguments in a Google Cloud environment
  // allows the SDK to automatically find the service account credentials.
  adminApp = admin.initializeApp();
} else {
  // If already initialized, use the existing app instance.
  adminApp = admin.app();
}

const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

export { adminApp, adminAuth, adminDb };
