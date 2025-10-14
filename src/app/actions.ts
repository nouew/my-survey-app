
"use server";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { app, db } from '@/lib/firebase-client';

const auth = getAuth(app);

interface AuthResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  uid?: string;
}

// Helper to create a dummy email from a username
const formatEmail = (username: string) => `${username.toLowerCase().trim()}@survey-app.com`;

// Helper to ensure the returned object is a plain JSON object
const safelyReturn = (result: AuthResult): AuthResult => {
    return JSON.parse(JSON.stringify(result));
}

// Function to create a new user
export async function createUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.toLowerCase().trim();
  const email = formatEmail(cleanUsername);

  // Check if username (id) already exists in Firestore first
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("id", "==", cleanUsername));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return safelyReturn({ status: 'error', message: 'Username already exists.' });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Use the UID from Auth as the document ID in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: cleanUsername,
      uid: user.uid,
      status: 'inactive' // Always inactive by default
    });

    return safelyReturn({ status: 'pending', message: 'Account created. Awaiting admin activation.' });

  } catch (error: any) {
    console.error("Error in createUser:", error.code, error.message);
    if (error.code === 'auth/email-already-in-use') {
      return safelyReturn({ status: 'error', message: 'This username is already taken.' });
    }
    if (error.code === 'auth/weak-password') {
      return safelyReturn({ status: 'error', message: 'Password should be at least 6 characters.' });
    }
    return safelyReturn({ status: 'error', message: 'An unexpected error occurred during signup.' });
  }
}

// Function to sign in a user
export async function signInUser(username: string, password: string): Promise<AuthResult> {
    const cleanUsername = username.toLowerCase().trim();
    const email = formatEmail(cleanUsername);

    try {
        // 1. Authenticate with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Use the UID to fetch the user document directly from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        // 3. Check if document exists and what the status is
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.status === 'active') {
                // SUCCESS: User is authenticated and active
                return safelyReturn({ status: 'success', message: 'Login successful.', uid: user.uid });
            } else {
                // PENDING: User is authenticated but not active
                return safelyReturn({ status: 'pending', message: 'Your account has not been activated by an administrator.' });
            }
        } else {
            // ERROR: Should not happen if signup is correct.
            // This means an auth user exists without a corresponding Firestore document.
            return safelyReturn({ status: 'error', message: 'User data not found in database. Please contact support.' });
        }

    } catch (error: any) {
        console.error("Error in signInUser:", error.code, error.message);
        if (error.code === 'auth/invalid-credential') {
            return safelyReturn({ status: 'error', message: 'Invalid username or password.' });
        }
        return safelyReturn({ status: 'error', message: 'An unexpected error occurred during login.' });
    }
}
