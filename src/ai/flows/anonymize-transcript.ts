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

const EntityMapEntrySchema = z.object({
  original: z.string().describe('The original sensitive information.'),
  anonymized: z.string().describe('The anonymized ID for the entity.'),
  type: z
    .string()
    .describe(
      'The type of entity (e.g., Name, Email, Location, Organization).'
    ),
});

const AnonymizeTranscriptOutputSchema = z.object({
  anonymizedTranscript: z
    .string()
    .describe('The transcript with sensitive data replaced by random IDs.'),
  entityMap: z
    .array(EntityMapEntrySchema)
    .describe(
      'A mapping of the original sensitive information to its anonymized ID.'
    ),
});
export type AnonymizeTranscriptOutput = z.infer<
  typeof AnonymizeTranscriptOutputSchema
>;

export async function anonymizeTranscript(
  input: AnonymizeTranscriptInput
): Promise<AnonymizeTranscriptOutput | null> {
  return anonymizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'anonymizeTranscriptPrompt',
  input: { schema: AnonymizeTranscriptInputSchema },
  output: { schema: AnonymizeTranscriptOutputSchema },
  prompt: `You are a data security expert. Your task is to perform Named Entity Recognition (NER) on the given transcript and anonymize it.

1.  Identify any personally identifiable information (PII) such as: Name, Age, Date of birth, Phone number, Email address, Location/address, Organization/Company.
2.  For each detected entity, generate a unique random identifier using the following format: Name → N001, Age → AGE023, Phone → P045, Email → E001, Location → L001, Organization → O001, Date of birth -> DOB001. Ensure the numbers are unique for each entity of the same type.
3.  Replace the detected entities in the transcript with their corresponding unique identifiers.
4.  Create a mapping table (entityMap) that links the original entity to its anonymized ID and includes the entity type.

Transcript to anonymize:
"{{{transcript}}}"
`,
});

const anonymizeTranscriptFlow = ai.defineFlow(
  {
    name: 'anonymizeTranscriptFlow',
    inputSchema: AnonymizeTranscriptInputSchema,
    outputSchema: AnonymizeTranscriptOutputSchema.nullable(),
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        console.error('Anonymization failed: no output from AI model.');
        return null;
      }
      return output;
    } catch (error) {
      console.error('Anonymization flow failed:', error);
      return null;
    }
  }
);
