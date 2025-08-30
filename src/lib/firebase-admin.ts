
import * as admin from 'firebase-admin';

// Check if the service account JSON is available in environment variables
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let adminApp: admin.app.App;

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
    if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
    } else {
        // Fallback for local development or environments without the JSON string
        // This will use Application Default Credentials if available.
        adminApp = admin.initializeApp({
            projectId: 'takip-k0hdb', // Manually set your project ID here
        });
        console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not found. Initializing with Project ID only. This may not work for all services.");
    }
} else {
    adminApp = admin.app();
}


export function initializeAdmin() {
  return adminApp;
}
