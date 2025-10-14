
"use server";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, type Firestore } from "firebase/firestore";
import type { ProfileData } from "@/lib/data";
import { generatePerfectAnswer } from "@/ai/flows/generate-perfect-answer";

// SERVER-SIDE ONLY: Firebase initialization for Server Actions
const serverConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let serverApp: FirebaseApp;
let db: Firestore;

function initializeServerFirebase() {
    if (!serverConfig.projectId) {
        throw new Error("Firebase server configuration is missing. Check environment variables.");
    }
    if (getApps().some(app => app.name === 'server')) {
        serverApp = getApp('server');
    } else {
        serverApp = initializeApp(serverConfig, 'server');
    }
    db = getFirestore(serverApp);
}


async function getDeviceIdFromHeaders(): Promise<string> {
    const { headers } = await import('next/headers');
    const userAgent = headers().get('user-agent') || 'unknown';
    return userAgent;
}

export async function createUserRecord(uid: string, email: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    initializeServerFirebase();
  } catch (e: any) {
    console.error("Server Firebase initialization failed:", e);
    return { success: false, error: "Server configuration error. Contact support." };
  }
  
  const userDocRef = doc(db, "users", uid);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const isAdmin = email === 'hakwa7952@gmail.com';

      const userData: {
        uid: string;
        email: string | null;
        status: 'inactive' | 'active';
        deviceId: string | null;
        isAdmin?: boolean;
      } = {
        uid,
        email,
        status: isAdmin ? 'active' : 'inactive',
        deviceId: null, 
      };

      if (isAdmin) {
        userData.isAdmin = true;
      }
      
      await setDoc(userDocRef, userData);
      console.log(`Created Firestore record for new user: ${uid}. Admin status: ${isAdmin}`);
      return { success: true };
    } else {
      console.log(`User record for ${uid} already exists. Skipping creation.`);
      return { success: true };
    }
  } catch (e: any) {
      console.error("Firestore operation failed in createUserRecord:", e);
      if (e.code === 'permission-denied' || e.code === 7) {
          return { success: false, error: "Firestore permission denied. Please check your Firestore rules or ensure the database is created." };
      }
       if (e.message.includes('Could not reach Cloud Firestore backend')) {
        return { success: false, error: 'Could not connect to the database. It might not be created yet. Please contact support.' };
      }
      return { success: false, error: `An unexpected database error occurred: ${e.message}` };
  }
}


// --- Original AI Actions ---

interface ActionResult {
  answer?: string;
  error?: string;
}

// Function to calculate age from date of birth
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function buildProfileString(userProfile: ProfileData | null): string {
    if (!userProfile) return "";
    const age = calculateAge(userProfile.dob);
    return `
      Income: ${userProfile.income}
      Occupation: ${userProfile.occupation}
      Country: ${userProfile.country}
      State/Region: ${userProfile.state}
      Gender: ${userProfile.gender}
      Date of Birth: ${userProfile.dob}
      Age: ${age}
      Marital Status: ${userProfile.maritalStatus}
      Education: ${userProfile.education}
      Employment: ${userProfile.employment}
      Ethnicity: ${userProfile.ethnicity}
    `;
}

export async function generateAnswerAction(
  userId: string,
  questionData: string,
  imageFile: string | null,
  userProfile: ProfileData | null
): Promise<ActionResult> {
  if (!questionData && !imageFile) {
    return { error: "Please provide a question." };
  }
  if (!userProfile) {
    return { error: "Please complete your profile first." };
  }
  if (!userId) {
    return { error: "User session not found. Please refresh the page."}
  }

  try {
    const profileString = buildProfileString(userProfile);
    const input = {
      userId,
      questionData: questionData || '',
      ...(imageFile && { imageFile }),
      userProfile: profileString,
    };
    
    const result = await generatePerfectAnswer(input);
    
    if (!result.answer) {
      return { error: "The AI could not generate an answer. Please try again." };
    }

    return { answer: result.answer };
  } catch (error) {
    console.error("Error generating perfect answer:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function generateAnswerFromScreenshot(
  userId: string,
  screenshotDataUri: string,
  userProfile: ProfileData | null
): Promise<ActionResult> {
  if (!screenshotDataUri) {
    return { error: "No screenshot provided." };
  }
  if (!userProfile) {
    return { error: "User profile is missing." };
  }
   if (!userId) {
    return { error: "User session not found. Please refresh the page."}
  }

  try {
    const profileString = buildProfileString(userProfile);
    const input = {
      userId,
      questionData: 'The user has provided a screenshot of the survey question. Analyze the image to identify the question and its options.',
      imageFile: screenshotDataUri,
      userProfile: profileString,
    };
    
    const result = await generatePerfectAnswer(input);
    
    if (!result.answer) {
      return { error: "The AI could not determine an answer from the screenshot." };
    }

    return { answer: result.answer };
  } catch (error) {
    console.error("Error generating answer from screenshot:", error);
    return { error: "An unexpected error occurred while analyzing the screenshot." };
  }
}
