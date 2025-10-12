'use server';

/**
 * @fileOverview Generates the most accurate answer to a survey question based on the question and user profile.
 *
 * - generatePerfectAnswer - A function that handles the generation of the perfect answer.
 * - GeneratePerfectAnswerInput - The input type for the generatePerfectAnswer function.
 * - GeneratePerfectAnswerOutput - The return type for the generatePerfectAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Dummy in-memory storage. In a real app, you'd use a database like Firestore.
const userAnswers: { [key: string]: { question: string, answer: string }[] } = {};

const answerHistoryTool = ai.defineTool(
  {
    name: 'answerHistoryTool',
    description: 'Check if this exact question has been answered before. Returns the previous answer if found.',
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID."),
      question: z.string().describe('The current survey question being asked.'),
    }),
    outputSchema: z.object({
      found: z.boolean().describe('Whether the question was found.'),
      previousAnswer: z.string().optional().describe('The previously given answer.'),
    }),
  },
  async ({ userId, question }) => {
    if (!userAnswers[userId] || !question) {
      return { found: false };
    }
    
    // Use a simple case-insensitive comparison for an exact match.
    const existing = userAnswers[userId].find(qa => qa.question.toLowerCase() === question.toLowerCase());

    if (existing) {
      return { found: true, previousAnswer: existing.answer };
    }
    
    return { found: false };
  }
);


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
  input: {schema: GeneratePerfectAnswerInputSchema},
  output: {schema: GeneratePerfectAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide the most accurate and consistent answer to survey questions based on a user's profile.

Your primary goal is consistency and accuracy based ONLY on the provided profile.

Analyze the question from the text and/or image.
Based on the user's profile, determine the most fitting answer.

- If the question asks for information available in the user profile, provide it.
- If the question asks for personal information or a preference NOT available in the user profile (e.g., "What is your favorite color?", "What car do you drive?"), you MUST respond with "I do not have this information in my profile."
- Do NOT invent or make up any information that is not explicitly in the user profile.
- If it's a multiple-choice question, your answer must be one of the provided options that best fits the profile. If no option fits, state that you cannot answer.

User Profile:
{{{userProfile}}}

{{#if questionData}}
Question Text: {{{questionData}}}
{{/if}}

{{#if imageFile}}
Question Image: {{media url=imageFile}}
{{/if}}

Generate the perfect, most consistent answer based on these strict rules.
`,
});

const generatePerfectAnswerFlow = ai.defineFlow(
  {
    name: 'generatePerfectAnswerFlow',
    inputSchema: GeneratePerfectAnswerInputSchema,
    outputSchema: GeneratePerfectAnswerOutputSchema,
  },
  async (input) => {
    // First, check the history tool for an exact match.
    const history = await answerHistoryTool({userId: input.userId, question: input.questionData});

    if (history.found && history.previousAnswer) {
      return { answer: history.previousAnswer };
    }

    // If not found in history, generate a new answer.
    const { output } = await generateAnswerPrompt(input);

    if (!output) {
      throw new Error("AI failed to generate an answer.");
    }
    
    const newAnswer = output.answer;
    
    // Save the newly generated answer to our "database" for future exact matches.
    if (input.questionData) {
        if (!userAnswers[input.userId]) {
            userAnswers[input.userId] = [];
        }
        // Avoid duplicates just in case
        if (!userAnswers[input.userId].some(qa => qa.question.toLowerCase() === input.questionData!.toLowerCase())) {
          userAnswers[input.userId].push({ question: input.questionData, answer: newAnswer });
        }
    }

    return { answer: newAnswer };
  }
);
