
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// This configuration is for the CLIENT-SIDE (browser environment)
// It uses NEXT_PUBLIC_ variables which are exposed to the browser.
const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Initialize Firebase for the client-side
// We check if getApps().length is 0 to prevent re-initializing the app.
// This code only runs in the browser.
if (typeof window !== 'undefined') {
    if (clientFirebaseConfig.apiKey && getApps().length === 0) {
        try {
            app = initializeApp(clientFirebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
        } catch (e) {
            console.error("Failed to initialize Firebase", e)
        }
    } else if (clientFirebaseConfig.apiKey) {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    }
}


// We export the client-side instances.
export { app, auth, db };
