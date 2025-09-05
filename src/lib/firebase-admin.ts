'use server';

import admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK, ensuring it's only done once per server instance.
 * This function is designed to be the single source of truth for the admin app instance
 * across the entire application (both Server Actions and Cloud Functions).
 * @returns The initialized Firebase admin app instance.
 */
export function initializeAdmin() {
  // Check if an app is already initialized. This is the robust way to prevent
  // "The default Firebase app already exists" errors.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  // If no app is initialized, initialize one.
  // Calling initializeApp() without arguments in a Google Cloud environment
  // (like App Hosting or Cloud Functions) allows the SDK to automatically
  // find the service account credentials. This is the recommended approach.
  return admin.initializeApp();
}
