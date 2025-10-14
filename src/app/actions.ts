
"use server";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { app, db } from '@/lib/firebase-client';

const auth = getAuth(app);

interface AuthResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  uid?: string;
}

// Helper to create a dummy email from a username
const formatEmail = (username: string) => `${username.toLowerCase().trim()}@survey-app.com`;

// Function to create a new user
export async function createUser(username: string, password: string): Promise<AuthResult> {
  const usersRef = collection(db, 'users');
  // Firestore IDs are case-sensitive, so we use toLowerCase for the query.
  const q = query(usersRef, where("id", "==", username.toLowerCase().trim()));
  
  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { status: 'error', message: 'Username already exists.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, formatEmail(username), password);
    const user = userCredential.user;

    // The document ID in Firestore MUST be the user's auth UID.
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: username.toLowerCase().trim(), // Store the username for display/query purposes
      uid: user.uid,
      status: 'inactive'
    });

    return { status: 'pending', message: 'Account created. Awaiting admin activation.' };

  } catch (error: any) {
    console.error("Error in createUser:", error.message);
    if (error.code === 'auth/email-already-in-use') {
      // This can happen if the username logic has a flaw, so we map it to a user-friendly message.
      return { status: 'error', message: 'This username is already taken.' };
    }
    if (error.code === 'auth/weak-password') {
      return { status: 'error', message: 'Password should be at least 6 characters.' };
    }
    return { status: 'error', message: error.message || 'An unexpected error occurred.' };
  }
}

// Function to sign in a user
export async function signInUser(username: string, password: string): Promise<AuthResult> {
  try {
    // Step 1: Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, formatEmail(username), password);
    const user = userCredential.user;

    // Step 2: Use the UID from Auth to get the user's document from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // Step 3: Check if the document exists and what the status is
    if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === 'active') {
            // SUCCESS: User is authenticated and active
            return { status: 'success', message: 'Login successful.', uid: user.uid };
        } else {
            // PENDING: User is authenticated but not yet activated by an admin
            return { status: 'pending', message: 'Your account has not been activated by an administrator.' };
        }
    } else {
        // This is a rare fallback. It means authentication succeeded but their Firestore record is missing.
        // We will treat this as a pending case and ask them to contact support.
        return { status: 'pending', message: 'Your account record is not found, please contact support.' };
    }

  } catch (error: any) {
    console.error("Error in signInUser:", error.message);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { status: 'error', message: 'Invalid username or password.' };
    }
    // Return the actual Firebase error message for any other issues
    return { status: 'error', message: error.message || 'An unexpected error occurred.' };
  }
}

// This function can be used on the main page to validate the session
export async function validateSession(uid: string): Promise<{ status: 'valid' | 'invalid' }> {
    if (!uid) {
        return { status: 'invalid' };
    }
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().status === 'active') {
            return { status: 'valid' };
        } else {
            return { status: 'invalid' };
        }
    } catch (error) {
        console.error("Session validation error:", error);
        return { status: 'invalid' };
    }
}
