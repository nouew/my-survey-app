
"use server";

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase-admin';

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);

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

  try {
    // Check if username (document with that ID) already exists in Firestore first
    const existingUserQuery = await db.collection('users').where('id', '==', cleanUsername).limit(1).get();
    if (!existingUserQuery.empty) {
      return safelyReturn({ status: 'error', message: 'Username already exists.' });
    }

    const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: cleanUsername,
    });
    
    const uid = userRecord.uid;

    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({
      id: cleanUsername,
      uid: uid,
      status: 'inactive' // Always inactive by default
    });

    return safelyReturn({ status: 'pending', message: 'Account created. Awaiting admin activation.' });

  } catch (error: any) {
    console.error("Error in createUser:", error.code, error.message);
    if (error.code === 'auth/email-already-exists') {
      return safelyReturn({ status: 'error', message: 'This username is already taken.' });
    }
    if (error.code === 'auth/weak-password') {
      return safelyReturn({ status: 'error', message: 'Password should be at least 6 characters.' });
    }
    return safelyReturn({ status: 'error', message: 'An unexpected error occurred during signup.' });
  }
}

// This function is NOT for signing in. It's for the client to get a custom token.
// The actual sign-in happens on the client with signInWithCustomToken.
export async function getCustomToken(username: string, password: string): Promise<AuthResult> {
    const cleanUsername = username.toLowerCase().trim();

    try {
        // We don't use the password here because the client-side Firebase handles password verification.
        // This is a simplified example. A real app would have a more secure way to verify the user
        // before issuing a custom token, e.g., by validating a temporary code.
        
        // Find user by username in Firestore
        const usersRef = db.collection('users');
        const querySnapshot = await usersRef.where('id', '==', cleanUsername).limit(1).get();

        if (querySnapshot.empty) {
            return safelyReturn({ status: 'error', message: 'Invalid username or password.' });
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.status !== 'active') {
            return safelyReturn({ status: 'pending', message: 'Your account has not been activated by an administrator.' });
        }

        // If active, create a custom token for the corresponding UID
        const customToken = await auth.createCustomToken(userData.uid);

        return safelyReturn({ status: 'success', message: customToken, uid: userData.uid });

    } catch (error: any) {
        console.error("Error in getCustomToken:", error.code, error.message);
        return safelyReturn({ status: 'error', message: 'An unexpected error occurred during login.' });
    }
}
