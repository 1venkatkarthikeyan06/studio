'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating interview questions.
 *
 * It exports:
 * - `generateInterviewQuestion`: A function that generates an interview question based on job details.
 * - `GenerateInterviewQuestionInput`: The input type, including job title and description.
 * - `GenerateInterviewQuestionOutput`: The output type, containing the generated question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionInputSchema = z.object({
  job: z.object({
    title: z.string().describe('The title of the job for the interview.'),
    description: z
      .string()
      .describe('The description of the job for the interview.'),
  }),
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
  prompt: `You are an expert interviewer. Generate a relevant interview question for the following job role.

Job Title: {{{job.title}}}
Job Description: {{{job.description}}}

{{#if askedQuestions}}
Avoid asking the following questions that have already been asked:
{{#each askedQuestions}}
- {{{this}}}
{{/each}}
{{/if}}

Generate one new, insightful question. The question should be behavioral, situational, or technical, depending on what is most appropriate for the role.
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
