'use server';

import {
  generateInterviewQuestion,
  GenerateInterviewQuestionInput,
} from '@/ai/flows/generate-interview-question';
import {z} from 'zod';

const FormSchema = z.object({
  jobTitle: z.string().min(3, {
    message: 'Please provide a valid job title.',
  }),
  jobDescription: z.string().min(20, {
    message: 'Please provide a job description of at least 20 characters.',
  }),
});

export type State = {
  message?: string | null;
  question?: string | null;
  jobDetails?: {
    jobTitle: string;
    jobDescription: string;
  };
};

export async function getQuestionAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    jobTitle: formData.get('jobTitle'),
    jobDescription: formData.get('jobDescription'),
  });

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return {
      message: firstError,
    };
  }

  const {jobTitle, jobDescription} = validatedFields.data;

  try {
    const input: GenerateInterviewQuestionInput = {
      job: {
        title: jobTitle,
        description: jobDescription,
      },
      // You can add previously asked questions here to avoid repetition
      // askedQuestions: [],
    };
    const result = await generateInterviewQuestion(input);
    return {
      message: null,
      question: result.question,
      jobDetails: { jobTitle, jobDescription },
    };
  } catch (error) {
    console.error('Failed to generate question:', error);
    return {
      message: 'Failed to generate a new question. Please try again later.',
    };
  }
}
