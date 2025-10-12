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
      previousAnswer: z.string().optional().describe('The previously given answer.'),
    }),
  },
  async ({ userId, currentQuestion }) => {
    // A real implementation would use vector similarity search.
    // This is a simplified example for demonstration.
    if (!userAnswers[userId] || !currentQuestion) {
      return { found: false };
    }
    
    // Using a simple case-insensitive comparison for similarity.
    const similar = userAnswers[userId].find(qa => qa.question.toLowerCase() === currentQuestion.toLowerCase());

    if (similar) {
      return { found: true, previousAnswer: similar.answer };
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
  tools: [answerHistoryTool],
  input: {schema: GeneratePerfectAnswerInputSchema},
  output: {schema: GeneratePerfectAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide the most accurate and consistent answer to survey questions based on a user's profile and their past answers.

Your primary goal is consistency. Before generating a new answer, you MUST use the 'answerHistoryTool' to check if a similar question has been answered before.

- If the tool finds a previous answer ('found: true'), you MUST use that exact answer. You can optionally mention that it's from history.
- If the tool does not find a previous answer ('found: false'), you will generate a new, best possible answer based on the user's profile and the question provided.

Analyze the question from the text and/or image.
Based on the user's profile and the result from the history tool, determine the most fitting answer.

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

Generate the perfect answer based on all the information and the history check.
`,
});

const generatePerfectAnswerFlow = ai.defineFlow(
  {
    name: 'generatePerfectAnswerFlow',
    inputSchema: GeneratePerfectAnswerInputSchema,
    outputSchema: GeneratePerfectAnswerOutputSchema,
  },
  async (input) => {
    
    // Always run the prompt which will internally use the tool.
    const { output } = await generateAnswerPrompt({
      ...input,
      currentQuestion: input.questionData || '', // Pass current question to the tool via the prompt
    });

    if (!output) {
      throw new Error("AI failed to generate an answer.");
    }
    const newAnswer = output.answer;
    
    // Save the new answer to our "database" only if it's not a historical one.
    // A more robust check would be to see if the tool was used and returned found:true.
    // For now, we'll check if the answer contains the "(From History)" marker.
    if (input.questionData && !newAnswer.includes('(From History)')) {
        if (!userAnswers[input.userId]) {
            userAnswers[input.userId] = [];
        }
        // Avoid duplicates
        if (!userAnswers[input.userId].some(qa => qa.question.toLowerCase() === input.questionData!.toLowerCase())) {
          userAnswers[input.userId].push({ question: input.questionData, answer: newAnswer });
        }
    }

    return { answer: newAnswer };
  }
);
