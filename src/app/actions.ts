
"use server";
import 'dotenv/config';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase-admin';
import { getAuth as getClientAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase-client';

const serverAuth = getAuth(adminApp);
const db = getFirestore(adminApp);
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
    const userRecord = await serverAuth.createUser({
        email: email,
        password: password,
        displayName: cleanUsername,
    });
    
    const uid = userRecord.uid;

    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({
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
    return safelyReturn({ status: 'error', message: error.message || 'An unexpected error occurred during signup.' });
  }
}

export async function signInUser(username: string, password: string): Promise<AuthResult> {
    const cleanUsername = username.toLowerCase().trim();
    const email = formatEmail(cleanUsername);

    try {
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const uid = userCredential.user.uid;

        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return safelyReturn({ status: 'error', message: 'User data not found in database.' });
        }

        const userData = userDoc.data();

        if (userData?.status !== 'active') {
            return safelyReturn({ status: 'pending', message: 'Your account has not been activated by an administrator.' });
        }
        
        const customToken = await serverAuth.createCustomToken(uid);

        return safelyReturn({ status: 'success', message: customToken, uid: uid });

    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            return safelyReturn({ status: 'error', message: 'Invalid username or password.' });
        }
        return safelyReturn({ status: 'error', message: error.message || 'An unexpected error occurred during login.' });
    }
}
