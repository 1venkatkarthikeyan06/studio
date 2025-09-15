'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise summary of an anonymized interview transcript.
 *
 * The flow takes an anonymized transcript as input and returns a summary of the interview.
 * It exports the following:
 * - `generateInterviewSummary`: A function that triggers the interview summary generation flow.
 * - `GenerateInterviewSummaryInput`: The input type for the `generateInterviewSummary` function.
 * - `GenerateInterviewSummaryOutput`: The output type for the `generateInterviewSummary` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the generateInterviewSummary flow
const GenerateInterviewSummaryInputSchema = z.object({
  anonymizedTranscript: z
    .string()
    .describe('The anonymized transcript of the interview.'),
});

export type GenerateInterviewSummaryInput = z.infer<
  typeof GenerateInterviewSummaryInputSchema
>;

// Define the output schema for the generateInterviewSummary flow
const GenerateInterviewSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the interview.'),
});

export type GenerateInterviewSummaryOutput = z.infer<
  typeof GenerateInterviewSummaryOutputSchema
>;

// Define the generateInterviewSummary function
export async function generateInterviewSummary(
  input: GenerateInterviewSummaryInput
): Promise<GenerateInterviewSummaryOutput> {
  return generateInterviewSummaryFlow(input);
}

// Define the prompt for generating the interview summary
const generateInterviewSummaryPrompt = ai.definePrompt({
  name: 'generateInterviewSummaryPrompt',
  input: {schema: GenerateInterviewSummaryInputSchema},
  output: {schema: GenerateInterviewSummaryOutputSchema},
  prompt: `You are an AI assistant designed to summarize interview transcripts.
  Please provide a concise summary of the following anonymized interview transcript:
  \n
  Transcript:
  {{anonymizedTranscript}}
  \n
  Summary:
  `,
});

// Define the Genkit flow for generating the interview summary
const generateInterviewSummaryFlow = ai.defineFlow(
  {
    name: 'generateInterviewSummaryFlow',
    inputSchema: GenerateInterviewSummaryInputSchema,
    outputSchema: GenerateInterviewSummaryOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewSummaryPrompt(input);
    return output!;
  }
);
