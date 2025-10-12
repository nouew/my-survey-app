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
    description: 'Check if a similar question has been answered before. Returns the previous answer if found.',
    inputSchema: z.object({
      userId: z.string().describe("The user's unique ID."),
      currentQuestion: z.string().describe('The current survey question being asked.'),
    }),
    outputSchema: z.object({
      found: z.boolean().describe('Whether a similar question was found.'),
      answer: z.string().optional().describe('The previously given answer.'),
    }),
  },
  async ({ userId, currentQuestion }) => {
    // In a real app, you would implement a similarity search (e.g., using vector embeddings)
    // against a database of previously answered questions for that user.
    // For this demo, we'll use a simple exact match for the concept.
    if (!userAnswers[userId]) {
      userAnswers[userId] = [];
      return { found: false };
    }

    // A real implementation would use vector similarity search.
    // This is a simplified example.
    const similar = userAnswers[userId].find(qa => qa.question.toLowerCase() === currentQuestion.toLowerCase());

    if (similar) {
      return { found: true, answer: similar.answer };
    }
    
    return { found: false };
  }
);


const GeneratePerfectAnswerInputSchema = z.object({
  userId: z.string().describe("The user's unique ID."),
  questionData: z.string().optional().describe('The survey question text.'),
  imageFile: z.string().optional().describe(
    'An image of the survey question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
  ),
  userProfile: z.string().describe('The user profile information.'),
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
  input: {schema: z.object({
      questionData: z.string().optional(),
      imageFile: z.string().optional(),
      userProfile: z.string(),
  })},
  output: {schema: GeneratePerfectAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide the most accurate and consistent answer to survey questions based on a user's profile.

You will receive the survey question, which can be provided as text, an image, or both. Your task is to analyze all the provided information (text and/or image) to understand the question and any multiple-choice options.

Based on the user's profile, determine the most fitting answer.

- If it's a multiple-choice question, your answer must be one of the provided options.
- If it's a text-based/open-ended question, generate a concise and relevant answer.

User Profile:
{{{userProfile}}}

{{#if questionData}}
Question Text: {{{questionData}}}
{{/if}}

{{#if imageFile}}
Question Image: {{media url=imageFile}}
{{/if}}

Generate the perfect answer based on all the information.
`,
});

const generatePerfectAnswerFlow = ai.defineFlow(
  {
    name: 'generatePerfectAnswerFlow',
    inputSchema: GeneratePerfectAnswerInputSchema,
    outputSchema: GeneratePerfectAnswerOutputSchema,
    tools: [answerHistoryTool],
  },
  async (input) => {
     const { history } = await ai.run({
      prompt: `Check if a similar question has been answered before for user ${input.userId}. Current question: ${input.questionData}`,
      tools: [answerHistoryTool],
      model: 'googleai/gemini-2.5-flash',
    });

    const toolResponse = history[history.length - 1]?.toolRequest?.output;
    if (toolResponse?.answer) {
        return { answer: `(From History) ${toolResponse.answer}` };
    }

    const { output } = await generateAnswerPrompt({
        questionData: input.questionData,
        imageFile: input.imageFile,
        userProfile: input.userProfile
    });

    const newAnswer = output!.answer;
    
    // Save the new answer to our "database"
    if (input.questionData) {
        if (!userAnswers[input.userId]) {
            userAnswers[input.userId] = [];
        }
        userAnswers[input.userId].push({ question: input.questionData, answer: newAnswer });
    }

    return { answer: newAnswer };
  }
);
