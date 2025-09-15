'use server';
/**
 * @fileOverview A flow to anonymize sensitive data from a transcript.
 *
 * - anonymizeTranscript - A function that handles the anonymization process.
 * - AnonymizeTranscriptInput - The input type for the anonymizeTranscript function.
 * - AnonymizeTranscriptOutput - The return type for the anonymizeTranscript function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnonymizeTranscriptInputSchema = z.object({
  transcript: z.string().describe('The interview answer transcript.'),
});
export type AnonymizeTranscriptInput = z.infer<
  typeof AnonymizeTranscriptInputSchema
>;

const AnonymizeTranscriptOutputSchema = z.object({
  anonymizedTranscript: z
    .string()
    .describe('The transcript with sensitive data replaced by random IDs.'),
});
export type AnonymizeTranscriptOutput = z.infer<
  typeof AnonymizeTranscriptOutputSchema
>;

export async function anonymizeTranscript(
  input: AnonymizeTranscriptInput
): Promise<AnonymizeTranscriptOutput> {
  return anonymizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'anonymizeTranscriptPrompt',
  input: { schema: AnonymizeTranscriptInputSchema },
  output: { schema: AnonymizeTranscriptOutputSchema },
  prompt: `You are a data security expert. Your task is to anonymize the given transcript.
Identify any personally identifiable information (PII) such as names, email addresses, phone numbers, physical addresses, or any other sensitive details.
Replace each piece of PII with a randomly generated, unique ID (e.g., [ID-XXXXXXXX]). Do not explain your reasoning, just provide the anonymized text.

Transcript to anonymize:
"{{{transcript}}}"
`,
});

const anonymizeTranscriptFlow = ai.defineFlow(
  {
    name: 'anonymizeTranscriptFlow',
    inputSchema: AnonymizeTranscriptInputSchema,
    outputSchema: AnonymizeTranscriptOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('Anonymization failed: no output from AI model.');
      }
      return output;
    } catch (error) {
      console.error('Anonymization flow failed:', error);
      throw new Error('The AI service is currently unavailable. Please try again later.');
    }
  }
);
