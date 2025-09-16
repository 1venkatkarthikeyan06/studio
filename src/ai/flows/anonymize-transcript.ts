'use server';
/**
 * @fileOverview A flow to analyze an interview answer and anonymize sensitive data.
 *
 * - analyzeAnswer - A function that handles the analysis and anonymization process.
 * - AnalyzeAnswerInput - The input type for the analyzeAnswer function.
 * - AnalyzeAnswerOutput - The return type for the analyzeAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeAnswerInputSchema = z.object({
  question: z.string().describe('The interview question that was asked.'),
  answer: z.string().describe("The candidate's answer to the question."),
  role: z
    .string()
    .describe(
      'The job role the candidate is interviewing for (e.g., "Software Engineer").'
    ),
});
export type AnalyzeAnswerInput = z.infer<typeof AnalyzeAnswerInputSchema>;

const AnalyzeAnswerOutputSchema = z.object({
  anonymizedAnswer: z
    .string()
    .describe('The transcript with sensitive data replaced by random IDs.'),
  feedback: z
    .object({
      clarity: z
        .string()
        .describe('Feedback on the clarity and conciseness of the answer.'),
      relevance: z
        .string()
        .describe(
          'Feedback on how relevant the answer is to the question and the specified job role.'
        ),
      speechPace: z
        .string()
        .describe(
          "Feedback on the candidate's pace of speech. Assume a standard speaking rate. This is only applicable for voice-based interviews."
        ),
    })
    .describe("Constructive feedback on the candidate's answer."),
});
export type AnalyzeAnswerOutput = z.infer<typeof AnalyzeAnswerOutputSchema>;

export async function analyzeAnswer(
  input: AnalyzeAnswerInput
): Promise<AnalyzeAnswerOutput | null> {
  return analyzeAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAnswerPrompt',
  input: { schema: AnalyzeAnswerInputSchema },
  output: { schema: AnalyzeAnswerOutputSchema },
  prompt: `You are an expert interview coach providing feedback to a candidate. The candidate is interviewing for the role of {{{role}}}.

Your tasks are:
1.  Provide constructive feedback on the candidate's answer based on clarity, conciseness, and relevance to the question and the role. Also, comment on the speech pace.
2.  Perform Named Entity Recognition (NER) on the given answer transcript and anonymize it.
    - Identify any personally identifiable information (PII) such as: Name, Age, Date of birth, Phone number, Email address, Location/address, Organization/Company.
    - For each detected entity, generate a unique random identifier using the following format: Name → N001, Age → AGE023, Phone → P045, Email → E001, Location → L001, Organization → O001, Date of birth -> DOB001. Ensure the numbers are unique for each entity of the same type.
    - Replace the detected entities in the transcript with their corresponding unique identifiers.

Interview Question:
"{{{question}}}"

Candidate's Answer:
"{{{answer}}}"
`,
});

const analyzeAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeAnswerFlow',
    inputSchema: AnalyzeAnswerInputSchema,
    outputSchema: AnalyzeAnswerOutputSchema.nullable(),
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        return null;
      }
      return output;
    } catch (error) {
      console.error('Analysis flow failed:', error);
      return null;
    }
  }
);
