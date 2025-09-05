
import admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let adminApp: admin.app.App;

export function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const credential = serviceAccountJson
    ? admin.credential.cert(JSON.parse(serviceAccountJson))
    : admin.credential.applicationDefault();

  adminApp = admin.initializeApp({
    credential,
    projectId: 'takip-k0hdb', 
  });

  return adminApp;
}
