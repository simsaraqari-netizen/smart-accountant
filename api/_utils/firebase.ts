import admin from 'firebase-admin';
import fs from 'fs';
import 'dotenv/config';

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (credsPath && fs.existsSync(credsPath)) {
        admin.initializeApp();
        console.log('Firebase Admin initialized successfully from GOOGLE_APPLICATION_CREDENTIALS');
      } else {
        // If GOOGLE_APPLICATION_CREDENTIALS is not present but the Vercel environment has FIREBASE_SERVICE_ACCOUNT
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccountEnv) {
          const serviceAccount = JSON.parse(serviceAccountEnv);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          console.log('Firebase Admin initialized successfully from FIREBASE_SERVICE_ACCOUNT env var');
        } else {
          // Fallback to default which works on GCP environments
          admin.initializeApp();
          console.log('Firebase Admin initialized with default credentials');
        }
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }
  return admin;
}
