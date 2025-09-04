
import admin from 'firebase-admin';

// Check if the service account JSON is available in environment variables
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let adminApp: admin.app.App;

function getCredential() {
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      return admin.credential.cert(serviceAccount);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }
  }
  // In a managed environment like App Hosting or Cloud Functions, 
  // the SDK will automatically discover the project's service account credentials.
  return admin.credential.applicationDefault();
}


// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
    // Explicitly provide the projectId to ensure the correct project is used.
    adminApp = admin.initializeApp({
        credential: getCredential(),
        projectId: 'takip-k0hdb', 
    });
} else {
    adminApp = admin.app();
}


export function initializeAdmin() {
  return adminApp;
}
