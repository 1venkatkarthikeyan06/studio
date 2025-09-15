'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating interview questions.
 *
 * It exports:
 * - `generateInterviewQuestion`: A function that generates an interview question.
 * - `GenerateInterviewQuestionInput`: The input type for the flow.
 * - `GenerateInterviewQuestionOutput`: The output type, containing the generated question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionInputSchema = z.object({
  askedQuestions: z
    .array(z.string())
    .optional()
    .describe(
      'A list of questions that have already been asked in this interview session.'
    ),
});

export type GenerateInterviewQuestionInput = z.infer<
  typeof GenerateInterviewQuestionInputSchema
>;

const GenerateInterviewQuestionOutputSchema = z.object({
  question: z.string().describe('The generated interview question.'),
});

export type GenerateInterviewQuestionOutput = z.infer<
  typeof GenerateInterviewQuestionOutputSchema
>;

export async function generateInterviewQuestion(
  input: GenerateInterviewQuestionInput
): Promise<GenerateInterviewQuestionOutput> {
  return generateInterviewQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionPrompt',
  input: {schema: GenerateInterviewQuestionInputSchema},
  output: {schema: GenerateInterviewQuestionOutputSchema},
  prompt: `You are an expert interviewer. Generate a relevant HR interview question.

{{#if askedQuestions}}
Avoid asking the following questions that have already been asked:
{{#each askedQuestions}}
- {{{this}}}
{{/each}}
{{/if}}

Generate one new, insightful question. The question should be a standard behavioral or situational HR question.
`,
});

const generateInterviewQuestionFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionFlow',
    inputSchema: GenerateInterviewQuestionInputSchema,
    outputSchema: GenerateInterviewQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
