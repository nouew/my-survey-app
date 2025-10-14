'use server';

/**
 * @fileOverview Generates the most accurate answer to a survey question based on the user profile.
 *
 * - generatePerfectAnswer - A function that handles the generation of the perfect answer.
 * - GeneratePerfectAnswerInput - The input type for the generatePerfectAnswer function.
 * - GeneratePerfectAnswerOutput - The return type for the generatePerfectAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Dummy in-memory storage. In a real app, you'd use a database like Firestore.
// This is now only used to demonstrate saving, not for retrieval by the AI.
const userAnswers: { [key: string]: { question: string, answer: string }[] } = {};


// == Main Answer Generation Flow ==

const GeneratePerfectAnswerInputSchema = z.object({
  userId: z.string().describe("The user's unique ID."),
  questionData: z.string().describe('The survey question text.'),
  imageFile: z.string().optional().describe(
    'An image of the survey question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
  ),
  userProfile: z.string().describe('The user profile information, including demographics like age.'),
});
export type GeneratePerfectAnswerInput = z.infer<typeof GeneratePerfectAnswerInputSchema>;

const GeneratePerfectAnswerOutputSchema = z.object({
  answer: z.string().describe('The generated perfect answer to the survey question.'),
});
export type GeneratePerfectAnswerOutput = z.infer<typeof GeneratePerfectAnswerOutputSchema>;

export async function generatePerfectAnswer(input: GeneratePerfectAnswerInput): Promise<GeneratePerfectAnswerOutput> {
  return generatePerfectAnswerFlow(input);
}

const generateAnswerPrompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  // The tool has been removed to prevent inconsistencies.
  tools: [], 
  input: {schema: GeneratePerfectAnswerInputSchema},
  output: {schema: GeneratePerfectAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide the most accurate and consistent answer to survey questions based *only* on the user's profile provided below.

Your PRIMARY goal is ACCURACY and CONSISTENCY with the provided profile.

Follow these rules STRICTLY:
1.  **Analyze the Question:** Determine if the question is a direct query about the user's profile (e.g., "What is your age?") or a general survey question.
2.  **Base Your Answer on the Profile:** Your answer MUST be derived directly from the user profile data. Do not invent information or use any outside knowledge.
3.  **Handle Attention Checks:** If the question is an "attention check" (e.g., "Select 'Agree' to show you are paying attention"), you MUST follow its instruction exactly. This is your highest priority.
4.  **CRITICAL RULE:** NEVER say "I do not have this information," "I don't know," or any similar phrase. You MUST ALWAYS provide a direct and confident answer based on the persona in the profile.
5.  **Multiple Choice:** If it's a multiple-choice question, your answer must be one of the provided options that best fits the user profile.

This is the only information you should use:
User Profile:
{{{userProfile}}}

{{#if questionData}}
Question Text: {{{questionData}}}
{{/if}}

{{#if imageFile}}
Question Image: {{media url=imageFile}}
{{/if}}

Generate the perfect, most CONSISTENT answer based on these strict rules and the provided profile.
`,
});

const generatePerfectAnswerFlow = ai.defineFlow(
  {
    name: 'generatePerfectAnswerFlow',
    inputSchema: GeneratePerfectAnswerInputSchema,
    outputSchema: GeneratePerfectAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await generateAnswerPrompt(input);

    if (!output) {
      throw new Error("AI failed to generate an answer.");
    }
    
    const newAnswer = output.answer;
    
    // Although the AI doesn't use history anymore, we can still save the answer
    // for the user's reference in the UI.
    if (input.questionData) {
        if (!userAnswers[input.userId]) {
            userAnswers[input.userId] = [];
        }
        
        const alreadyExists = userAnswers[input.userId].some(qa => qa.question.toLowerCase() === input.questionData!.toLowerCase());

        if (!alreadyExists) {
          userAnswers[input.userId].push({ question: input.questionData, answer: newAnswer });
        }
    }

    return { answer: newAnswer };
  }
);
