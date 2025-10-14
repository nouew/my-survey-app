
"use server";

import { generatePerfectAnswer } from "@/ai/flows/generate-perfect-answer";
import type { ProfileData } from "@/lib/data";

// =================================================================
// In-memory database for user status and device binding
// In a real production app, you MUST use a persistent database like Firestore.
// =================================================================
interface UserRecord {
  uid: string;
  email: string | null;
  status: 'active' | 'inactive';
  deviceId: string | null; // Will store the first device ID upon activation
}

const userDatabase: { [uid: string]: UserRecord } = {};

// Helper function to get a unique device identifier from request headers
async function getDeviceId(): Promise<string> {
    const { headers } = await import('next/headers');
    const userAgent = headers().get('user-agent') || 'unknown';
    const ip = headers().get('x-forwarded-for') || 'unknown-ip';
    // Simple hash for demonstration. In production, consider a more robust hashing algorithm.
    const deviceId = `${userAgent}-${ip}`; 
    return deviceId;
}

// Action to create a user record in our "database"
export async function createUserRecord(uid: string, email: string | null) {
  if (!userDatabase[uid]) {
    userDatabase[uid] = {
      uid,
      email,
      status: 'inactive', // All new users are inactive by default
      deviceId: null,
    };
    console.log(`Created record for user: ${uid}`);
  }
}

// Action to get a user's status
export async function getUserStatus(uid: string): Promise<{ status: 'active' | 'inactive' | 'not_found' }> {
  const user = userDatabase[uid];
  return { status: user ? user.status : 'not_found' };
}

// Action to verify a device and bind it if necessary
export async function verifyDevice(uid: string): Promise<{ isVerified: boolean }> {
    const user = userDatabase[uid];
    if (!user) return { isVerified: false };
    
    // If user is inactive, device check is irrelevant.
    if (user.status === 'inactive') return { isVerified: true }; 

    const currentDeviceId = await getDeviceId();

    // If user is active but has no deviceId, this is their first login post-activation. Bind the device.
    if (user.status === 'active' && !user.deviceId) {
        user.deviceId = currentDeviceId;
        console.log(`Device bound for user ${uid}: ${currentDeviceId}`);
        return { isVerified: true };
    }

    // If user is active and has a deviceId, check for a match.
    if (user.deviceId === currentDeviceId) {
        return { isVerified: true };
    }

    // Device mismatch.
    console.warn(`Device mismatch for user ${uid}. Expected ${user.deviceId}, got ${currentDeviceId}`);
    return { isVerified: false };
}


// Admin actions
export async function getAllUsers(): Promise<UserRecord[]> {
  // In a real app, you would add authentication to ensure only an admin can call this.
  return Object.values(userDatabase);
}

export async function activateUser(uid: string): Promise<{ success: boolean }> {
  // In a real app, you would add authentication to ensure only an admin can call this.
  const user = userDatabase[uid];
  if (user) {
    user.status = 'active';
    console.log(`Activated user: ${uid}`);
    return { success: true };
  }
  return { success: false };
}

// --- Original Actions ---

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
