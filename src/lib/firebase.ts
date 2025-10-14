
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Config for client-side (browser)
const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Config for server-side (actions)
const serverConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Determine which config to use based on the environment
const firebaseConfig = typeof window !== 'undefined' ? clientConfig : serverConfig;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase only if it hasn't been initialized yet
if (!getApps().length) {
    // We only initialize if the necessary config is present
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

// @ts-ignore - 'app' can be uninitialized here, which is intended if config is missing.
if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
}

// @ts-ignore
export { app, auth, db };
