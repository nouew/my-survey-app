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
  tools: [answerHistoryTool],
  input: {schema: GeneratePerfectAnswerInputSchema},
  output: {schema: GeneratePerfectAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide the most accurate and consistent answer to survey questions based on a user's profile and past answers.

Your PRIMARY goal is CONSISTENCY.

Follow these rules STRICTLY:
1.  First, ALWAYS use the 'answerHistoryTool' to check if this exact question has been answered before.
2.  If the tool finds a previous answer ('found: true'), you MUST use that 'previousAnswer' as your response. Do NOT generate a new one.
3.  If the tool does NOT find a previous answer ('found: false'), you must generate a new, plausible answer based on the user's profile.
4.  CRITICAL RULE: When generating a new answer, NEVER say "I do not have this information," "I don't know," or any similar phrase. You MUST invent a consistent and believable answer that fits the user's persona based on their profile.
5.  If it's a multiple-choice question, your answer must be one of the provided options.

User Profile:
{{{userProfile}}}

{{#if questionData}}
Question Text: {{{questionData}}}
{{/if}}

{{#if imageFile}}
Question Image: {{media url=imageFile}}
{{/if}}

Generate the perfect, most CONSISTENT answer based on these strict rules.
`,
});

const generatePerfectAnswerFlow = ai.defineFlow(
  {
    name: 'generatePerfectAnswerFlow',
    inputSchema: GeneratePerfectAnswerInputSchema,
    outputSchema: GeneratePerfectAnswerOutputSchema,
  },
  async (input) => {
    // We will let the model decide whether to use the tool.
    // If it uses it and finds an answer, it will use it.
    // If not, it will generate one.
    const { output } = await generateAnswerPrompt(input);

    if (!output) {
      throw new Error("AI failed to generate an answer.");
    }
    
    const newAnswer = output.answer;
    
    // Save the newly generated answer to our "database" for future exact matches,
    // but only if the question was text-based and doesn't already exist.
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