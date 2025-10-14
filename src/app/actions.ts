
"use server";

import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase-client'; // Use client DB connection

interface UserActionResult {
  status: 'created' | 'exists' | 'error';
  message?: string;
}

interface ValidationResult {
  status: 'valid' | 'invalid' | 'inactive' | 'error';
  message: string;
}

// Function to find a user by username or create a new one
export async function findOrCreateUser(username: string): Promise<UserActionResult> {
  if (username.toLowerCase() === 'admin') {
     return { status: 'exists' };
  }
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("id", "==", username));
  
  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // User exists
      return { status: 'exists' };
    } else {
      // User does not exist, create a new one
      const newUserUid = uuidv4();
      const userDocRef = doc(db, 'users', username);
      await setDoc(userDocRef, {
        id: username,
        uid: newUserUid, // This is the activation key
        status: 'inactive'
      });
      return { status: 'created' };
    }
  } catch (error: any) {
    console.error("Error in findOrCreateUser:", error.message);
    if (error.code === 'permission-denied') {
        return { status: 'error', message: 'Permission denied. Check your Firestore security rules.' };
    }
    return { status: 'error', message: 'An unexpected error occurred on the server.' };
  }
}

// Function to validate the activation key for a given username
export async function validateActivationKey(username: string, activationKey: string): Promise<ValidationResult> {
    
    // Handle admin login separately
    if (username.toLowerCase() === 'admin' && activationKey === process.env.ADMIN_ACTIVATION_KEY) {
        const adminRef = doc(db, 'users', 'admin');
        const adminDoc = await getDoc(adminRef);
        if (!adminDoc.exists()) {
             await setDoc(adminRef, { id: 'admin', uid: activationKey, status: 'active' });
        }
        return { status: 'valid', message: 'Admin login successful.' };
    }


  const userDocRef = doc(db, 'users', username);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { status: 'invalid', message: 'Username not found.' };
    }

    const userData = userDoc.data();

    if (userData.uid !== activationKey) {
      return { status: 'invalid', message: 'Invalid activation key.' };
    }
    
    if (userData.status !== 'active') {
        return { status: 'inactive', message: 'This account has not been activated by an administrator.' };
    }

    // If key is valid and status is active
    return { status: 'valid', message: 'Login successful.' };
  } catch (error: any) {
    console.error("Error in validateActivationKey:", error.message);
     if (error.code === 'permission-denied') {
        return { status: 'error', message: 'Permission denied. Check your Firestore security rules.' };
    }
    return { status: 'error', message: 'An unexpected error occurred during validation.' };
  }
}
