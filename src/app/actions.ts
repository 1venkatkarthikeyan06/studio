'use server';

import {
  generateInterviewQuestion,
  GenerateInterviewQuestionInput,
} from '@/ai/flows/generate-interview-question';

export type State = {
  message?: string | null;
  question?: string | null;
};

export async function getQuestionAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const input: GenerateInterviewQuestionInput = {
      // You can add previously asked questions here to avoid repetition
      // askedQuestions: [],
    };
    const result = await generateInterviewQuestion(input);
    return {
      message: null,
      question: result.question,
    };
  } catch (error) {
    console.error('Failed to generate question:', error);
    return {
      message: 'Failed to generate a new question. Please try again later.',
    };
  }
}
