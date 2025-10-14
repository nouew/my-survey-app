
"use server";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { app, db } from '@/lib/firebase-client';
import { cookies } from 'next/headers';

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
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("id", "==", cleanUsername));
  
  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return safelyReturn({ status: 'error', message: 'Username already exists.' });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, formatEmail(cleanUsername), password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: cleanUsername,
      uid: user.uid,
      status: 'inactive'
    });

    return safelyReturn({ status: 'pending', message: 'Account created. Awaiting admin activation.' });

  } catch (error: any) {
    console.error("Error in createUser:", error.message);
    if (error.code === 'auth/email-already-in-use') {
      return safelyReturn({ status: 'error', message: 'This username is already taken.' });
    }
    if (error.code === 'auth/weak-password') {
      return safelyReturn({ status: 'error', message: 'Password should be at least 6 characters.' });
    }
    return safelyReturn({ status: 'error', message: error.message || 'An unexpected error occurred.' });
  }
}

// Function to sign in a user
export async function signInUser(username: string, password: string): Promise<AuthResult> {
    const cleanUsername = username.toLowerCase().trim();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, formatEmail(cleanUsername), password);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.status === 'active') {
                return safelyReturn({ status: 'success', message: 'Login successful.', uid: user.uid });
            } else {
                return safelyReturn({ status: 'pending', message: 'Your account has not been activated by an administrator.' });
            }
        } else {
            // This case should ideally not happen if createUser works correctly
            return safelyReturn({ status: 'error', message: 'User data not found. Please contact support.' });
        }

    } catch (error: any) {
        console.error("Error in signInUser:", error.message);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            return safelyReturn({ status: 'error', message: 'Invalid username or password.' });
        }
        return safelyReturn({ status: 'error', message: error.message || 'An unexpected error occurred.' });
    }
}
