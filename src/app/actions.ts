'use server';

const questions = [
  'Tell me about yourself.',
  'Why do you want to work with our company?',
  'What are your strengths and weaknesses?',
  'Where do you see yourself in the next 5 years?',
  'Can you describe a challenge you faced at work or school and how you handled it?',
];

export type State = {
  message?: string | null;
  question?: string | null;
  questionIndex?: number;
};

export async function getQuestionAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const currentIndex = prevState.questionIndex ?? -1;
    const nextIndex = (currentIndex + 1) % questions.length;
    
    return {
      message: null,
      question: questions[nextIndex],
      questionIndex: nextIndex,
    };
  } catch (error) {
    console.error('Failed to get question:', error);
    return {
      message: 'Failed to get a new question. Please try again later.',
      questionIndex: prevState.questionIndex,
    };
  }
}
