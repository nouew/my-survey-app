
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure you have the correct service account credentials in your .env file
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const requiredCredentials = [serviceAccount.projectId, serviceAccount.clientEmail, serviceAccount.privateKey];

if (!admin.apps.length) {
    // Check if all required environment variables for the service account are present
    if (requiredCredentials.every(cred => cred)) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            });
        } catch (error: any) {
            console.error('Firebase admin initialization error:', error.stack);
        }
    } else {
        console.warn('Firebase admin credentials are not fully configured in .env. Server-side operations will fail.');
    }
}

// Initialize Firestore only if the app was successfully initialized
let db: admin.firestore.Firestore;
if (admin.apps.length > 0) {
    db = getFirestore();
} else {
    // This is a fallback to prevent the app from crashing.
    // It will throw an error when any database operation is attempted.
    db = new Proxy({} as admin.firestore.Firestore, {
        get(target, prop) {
            throw new Error('Firebase Admin SDK is not initialized. Please check your server environment variables.');
        }
    });
}


export { db };
