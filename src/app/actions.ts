'use server';

import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, UserCredential } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { ProfileData } from '@/lib/data';
import type { AnswerRecord } from '@/components/answer-history';

// --- Firebase Admin Initialization ---
let adminApp: App;
if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please check your .env file.');
    }
    const serviceAccount = JSON.parse(serviceAccountKey);

    adminApp = initializeApp({
        credential: require('firebase-admin').credential.cert(serviceAccount)
    });
} else {
    adminApp = getApp();
}

const adminAuth = getAuth(adminApp);
const db = getFirestore(adminApp);

const SESSION_COOKIE_NAME = 'user_session';
const USERNAME_COOKIE_NAME = 'username';


// --- Authentication Actions ---

export async function createSession(uid: string, username: string) {
  const sessionCookie = await adminAuth.createSessionCookie(uid, { expiresIn: 60 * 60 * 24 * 7 * 1000 });
  cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
  cookies().set(USERNAME_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
  cookies().delete(USERNAME_COOKIE_NAME);
}


// --- Firestore Data Actions ---

async function getUserIdFromSession(): Promise<string | null> {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedClaims.uid;
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return null;
    }
}

export async function saveProfileToFirestore(profileData: ProfileData): Promise<{ success: boolean; error?: string }> {
    const userId = await getUserIdFromSession();
    if (!userId) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        const userDocRef = db.collection('users').doc(userId);
        await userDocRef.set({ profile: profileData }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error saving profile to Firestore:", error);
        return { success: false, error: "Could not save profile." };
    }
}

export async function loadProfileFromFirestore(): Promise<ProfileData | null> {
    const userId = await getUserIdFromSession();
    if (!userId) return null;

    try {
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();

        if (docSnap.exists && docSnap.data()?.profile) {
            return docSnap.data()?.profile as ProfileData;
        }
        return null;
    } catch (error) {
        console.error("Error loading profile from Firestore:", error);
        return null;
    }
}

export async function saveHistoryToFirestore(history: AnswerRecord[]): Promise<{ success: boolean; error?: string }> {
    const userId = await getUserIdFromSession();
    if (!userId) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        const userDocRef = db.collection('users').doc(userId);
        await userDocRef.set({ history: history }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error saving history to Firestore:", error);
        return { success: false, error: "Could not save history." };
    }
}

export async function loadHistoryFromFirestore(): Promise<AnswerRecord[]> {
    const userId = await getUserIdFromSession();
    if (!userId) return [];

    try {
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();

        if (docSnap.exists && Array.isArray(docSnap.data()?.history)) {
            return docSnap.data()?.history as AnswerRecord[];
        }
        return [];
    } catch (error) {
        console.error("Error loading history from Firestore:", error);
        return [];
    }
}