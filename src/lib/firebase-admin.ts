
import admin from 'firebase-admin';

// This file is the single source of truth for initializing the Firebase Admin SDK.
// It ensures the SDK is initialized only once, using a specific service account
// provided via an environment variable, which is the most secure and reliable method.

let adminApp: admin.app.App;

try {
  // Check if the app is already initialized. This is crucial to prevent re-initialization errors.
  adminApp = admin.apps.length > 0 && admin.apps[0] ? admin.apps[0] : admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)),
      projectId: 'takip-k0hdb', // Explicitly setting the projectId is a good practice.
  });
} catch (error: any) {
  console.error("Firebase Admin SDK initialization failed:", error);
  // If initialization fails, we might not be in a server environment with the env var.
  // We'll proceed, and subsequent calls to adminAuth or adminDb will fail,
  // which is expected on the client-side.
  if (!admin.apps.length) {
    // A dummy app initialization to prevent crashing when this module is imported client-side.
    // Client-side code should never use the admin SDK exports.
    adminApp = admin.initializeApp(); 
  } else {
    adminApp = admin.apps[0]!;
  }
}

const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

export { adminApp, adminAuth, adminDb };
