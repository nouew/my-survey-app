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

const prompt = ai.definePrompt({
  name: 'generatePerfectAnswerPrompt',
  input: {schema: GeneratePerfectAnswerInputSchema},
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
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
