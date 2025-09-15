'use server';
/**
 * @fileOverview This file defines a Genkit flow for anonymizing interview transcripts.
 *
 * It includes functions for:
 * - anonymizeInterviewTranscript: Anonymizes the interview transcript.
 * - AnonymizeInterviewTranscriptInput: Defines the input schema for the anonymization flow.
 * - AnonymizeInterviewTranscriptOutput: Defines the output schema for the anonymization flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnonymizeInterviewTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The interview transcript to be anonymized.'),
});
export type AnonymizeInterviewTranscriptInput = z.infer<
  typeof AnonymizeInterviewTranscriptInputSchema
>;

const AnonymizeInterviewTranscriptOutputSchema = z.object({
  anonymizedTranscript: z
    .string()
    .describe('The anonymized interview transcript.'),
  entityMappingTable: z.record(z.string(), z.string()).describe(
    'A mapping of original entities to their random identifiers.  This should be a JSON blob, with original values as keys, and anonymized values as values.'
  ),
});
export type AnonymizeInterviewTranscriptOutput = z.infer<
  typeof AnonymizeInterviewTranscriptOutputSchema
>;

export async function anonymizeInterviewTranscript(
  input: AnonymizeInterviewTranscriptInput
): Promise<AnonymizeInterviewTranscriptOutput> {
  return anonymizeInterviewTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'anonymizeInterviewTranscriptPrompt',
  input: {schema: AnonymizeInterviewTranscriptInputSchema},
  output: {schema: AnonymizeInterviewTranscriptOutputSchema},
  prompt: `You are an AI expert in de-identifying text.

  I will provide you with an interview transcript. Your job is to identify and anonymize any Personally Identifiable Information (PII) in the transcript.  PII includes names, ages, dates of birth, phone numbers, email addresses, locations/addresses, and organization/company names.

  Replace each detected entity with a unique random identifier. For example, replace all names with identifiers like 'N001', ages with 'AGE023', phone numbers with 'P045', etc.

  Do not change any text except the PII. Preserve the original structure and formatting of the transcript as much as possible.

  Return two things:
  1. Anonymized Transcript: The transcript with all PII replaced with random identifiers.
  2. Entity Mapping Table: A JSON object (use JSON.stringify) that maps the original PII entities to their corresponding random identifiers. The original PII should be the key in the JSON object, and the anonymized value should be the value. This mapping is crucial for internal record-keeping.

  Here is the interview transcript:
  {{{transcript}}}

  Make sure your response follows the schema specified.`,
});

const anonymizeInterviewTranscriptFlow = ai.defineFlow(
  {
    name: 'anonymizeInterviewTranscriptFlow',
    inputSchema: AnonymizeInterviewTranscriptInputSchema,
    outputSchema: AnonymizeInterviewTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
