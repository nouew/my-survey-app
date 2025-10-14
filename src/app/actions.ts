
"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import type { ProfileData } from "@/lib/data";
import { generatePerfectAnswer } from "@/ai/flows/generate-perfect-answer";

// This file will now only contain server actions that DO NOT require Firebase Auth context,
// like the Genkit AI calls. User management actions are moved to the client.

async function getDeviceIdFromHeaders(): Promise<string> {
    const { headers } = await import('next/headers');
    const userAgent = headers().get('user-agent') || 'unknown';
    return userAgent;
}

export async function createUserRecord(uid: string, email: string | null) {
  if (!db) {
    console.error("Firestore not initialized for createUserRecord");
    return;
  }
  
  const usersCollectionRef = collection(db, "users");
  const userDocRef = doc(usersCollectionRef, uid);

  // Check if this is the first user to make them an admin automatically.
  let isAdmin = false;
  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    if (querySnapshot.empty) {
      isAdmin = true;
    }
  } catch (e) {
    // This might fail if rules are restrictive, but we proceed anyway.
    // The create rule should still work for the user creating their own doc.
    console.warn("Could not check for existing users, proceeding to create user record.");
  }

  // We use setDoc which will either create the doc or overwrite it.
  // This is safe because our Firestore rules only allow a user to write to their own doc.
  const userData: {
    uid: string;
    email: string | null;
    status: 'inactive' | 'active';
    deviceId: string | null;
    isAdmin?: boolean;
  } = {
    uid,
    email,
    status: 'inactive',
    deviceId: null, // Device ID will be bound on first activation by an admin
  };

  if (isAdmin) {
    userData.isAdmin = true;
    // The first user (admin) should be active by default.
    userData.status = 'active'; 
  }
  
  await setDoc(userDocRef, userData);
  console.log(`Created/updated Firestore record for user: ${uid}. Admin status: ${isAdmin}`);
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
    // There was a typo here, user.state should be userProfile.state
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
