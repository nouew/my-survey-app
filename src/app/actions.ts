"use server";

import { generatePerfectAnswer } from "@/ai/flows/generate-perfect-answer";
import type { ProfileData } from "@/lib/data";

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
