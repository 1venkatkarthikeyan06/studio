'use server';

import {
  anonymizeInterviewTranscript,
  AnonymizeInterviewTranscriptOutput,
} from '@/ai/flows/anonymize-interview-transcript';
import { z } from 'zod';

const FormSchema = z.object({
  transcript: z.string().min(50, {
    message: 'Please provide a transcript of at least 50 characters.',
  }),
});

export type State = {
  message?: string | null;
  data?: AnonymizeInterviewTranscriptOutput & { originalTranscript: string };
};

export async function anonymizeAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    transcript: formData.get('transcript'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.transcript?.[0],
    };
  }
  
  const transcript = validatedFields.data.transcript;

  try {
    const result = await anonymizeInterviewTranscript({ transcript });
    return {
      message: null,
      data: { ...result, originalTranscript: transcript },
    };
  } catch (error) {
    console.error('Anonymization failed:', error);
    return {
      message: 'Failed to anonymize transcript. Please try again later.',
    };
  }
}
