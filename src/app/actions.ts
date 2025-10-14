
"use server";
import 'dotenv/config';

import { getAuth as getClientAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db as clientDb } from '@/lib/firebase-client';

const clientAuth = getClientAuth(app);

interface AuthResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  uid?: string;
}

const formatEmail = (username: string) => `${username.toLowerCase().trim()}@survey-app.com`;

const safelyReturn = (result: AuthResult): AuthResult => {
    return JSON.parse(JSON.stringify(result));
}

export async function createUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.toLowerCase().trim();
  const email = formatEmail(cleanUsername);

  try {
    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    const userDocRef = doc(clientDb, "users", uid);
    await setDoc(userDocRef, {
      id: cleanUsername,
      uid: uid,
      status: 'inactive'
    });

    return safelyReturn({ status: 'pending', message: 'Account created. Awaiting admin activation.' });

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return safelyReturn({ status: 'error', message: 'This username is already taken.' });
    }
    if (error.code === 'auth/weak-password') {
      return safelyReturn({ status: 'error', message: 'Password should be at least 6 characters.' });
    }
    console.error("Error creating user:", error);
    return safelyReturn({ status: 'error', message: error.message || 'An unexpected error occurred during signup.' });
  }
}

export async function signInUser(username: string, password: string): Promise<AuthResult> {
    const cleanUsername = username.toLowerCase().trim();
    const email = formatEmail(cleanUsername);

    try {
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        const userDocRef = doc(clientDb, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
             // This case should ideally not happen if createUser is working correctly.
            return safelyReturn({ status: 'error', message: 'User data not found in database. Please contact support.' });
        }

        const userData = userDoc.data();
        if (userData?.status !== 'active') {
            return safelyReturn({ status: 'pending', message: 'Your account has not been activated by an administrator.' });
        }
        
        // At this point, login is successful and user is active.
        // We will generate a custom token for the user to sign in with on the client.
        // But for this simplified flow, we'll just return the UID.
        return safelyReturn({ status: 'success', message: 'Login successful!', uid: uid });

    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            return safelyReturn({ status: 'error', message: 'Invalid username or password.' });
        }
        console.error("Sign in error:", error);
        return safelyReturn({ status: 'error', message: error.message || 'An unexpected error occurred during login.' });
    }
}
