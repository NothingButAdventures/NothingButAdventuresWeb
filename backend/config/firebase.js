const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// When running on Firebase Cloud Functions, this auto-initializes using
// the service account of the Cloud Functions project automatically.
// For local development, set GOOGLE_APPLICATION_CREDENTIALS env variable
// or provide the serviceAccount JSON via FIREBASE_SERVICE_ACCOUNT env variable.

let app;

if (!admin.apps.length) {
    try {
        // If FIREBASE_SERVICE_ACCOUNT env var is set (local dev), use it
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.GCS_STORAGE_BUCKET || 'nothing-but-adventures.firebasestorage.app',
            });
        } else {
            // Auto-initialize (works on Firebase Cloud Functions & GCP environments)
            app = admin.initializeApp({
                storageBucket: process.env.GCS_STORAGE_BUCKET || 'nothing-but-adventures.firebasestorage.app',
            });
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        throw error;
    }
} else {
    app = admin.apps[0];
}

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
