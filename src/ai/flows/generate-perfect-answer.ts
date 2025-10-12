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

const GeneratePerfectAnswerInputSchema = z.object({
  questionData: z.string().describe('The survey question text.'),
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

const prompt = ai.definePrompt({
  name: 'generatePerfectAnswerPrompt',
  input: {schema: GeneratePerfectAnswerInputSchema},
  output: {schema: GeneratePerfectAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide the most accurate answer to survey questions.

You will receive the question data, an optional image of the question, and the user's profile information.

Analyze the question and options (if any) from the text or image.
Determine the type of question (e.g., text-based, multiple-choice).
Consider the user's profile information to tailor the answer.

Question Data: {{{questionData}}}
{{#if imageFile}}
Image: {{media url=imageFile}}
{{/if}}
User Profile: {{{userProfile}}}

Generate the perfect answer:
`,
});

const generatePerfectAnswerFlow = ai.defineFlow(
  {
    name: 'generatePerfectAnswerFlow',
    inputSchema: GeneratePerfectAnswerInputSchema,
    outputSchema: GeneratePerfectAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
