
"use server";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase-client';

const auth = getAuth(app);

interface AuthResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  uid?: string;
}

// Helper to create a dummy email from a username
const formatEmail = (username: string) => `${username.toLowerCase()}@survey-app.com`;

// Function to create a new user
export async function createUser(username: string, password: string): Promise<AuthResult> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("id", "==", username.toLowerCase()));
  
  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { status: 'error', message: 'Username already exists.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, formatEmail(username), password);
    const user = userCredential.user;

    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: username,
      email: user.email,
      status: 'inactive'
    });

    return { status: 'pending', message: 'Account created. Awaiting admin activation.' };

  } catch (error: any) {
    console.error("Error in createUser:", error.message);
    if (error.code === 'auth/email-already-in-use') {
      return { status: 'error', message: 'This username is already taken.' };
    }
    if (error.code === 'auth/weak-password') {
      return { status: 'error', message: 'Password should be at least 6 characters.' };
    }
    return { status: 'error', message: 'An unexpected error occurred.' };
  }
}

// Function to sign in a user
export async function signInUser(username: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, formatEmail(username), password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // This is a fallback case, should not happen in normal flow
      await setDoc(userDocRef, {
        id: username,
        email: user.email,
        status: 'inactive'
      });
       return { status: 'pending', message: 'Your account is pending activation by an administrator.' };
    }

    const userData = userDoc.data();
    if (userData.status !== 'active') {
      return { status: 'pending', message: 'Your account has not been activated by an administrator.' };
    }

    return { status: 'success', message: 'Login successful.', uid: user.uid };

  } catch (error: any) {
    console.error("Error in signInUser:", error.message);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { status: 'error', message: 'Invalid username or password.' };
    }
    return { status: 'error', message: 'An unexpected error occurred.' };
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
        return { status: 'invalid' };
    }
}
