
import * as admin from 'firebase-admin';

// This prevents errors if you hot-reload on the server.
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
}

const adminApp = admin.app();
const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminApp, adminAuth, adminDb };
