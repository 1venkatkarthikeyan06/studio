'use server';

const questions: Record<string, string[]> = {
  'Software Engineer': [
    'Tell me about a challenging project you worked on.',
    'How do you stay updated with the latest technologies?',
    'Describe your experience with version control systems like Git.',
    'Explain the difference between SQL and NoSQL databases.',
    'Walk me through your process for debugging a complex issue.',
  ],
  'Product Manager': [
    'How do you decide which features to prioritize?',
    'Describe a time you had to say "no" to a stakeholder.',
    'What is your favorite product and how would you improve it?',
    'How do you work with engineering teams?',
    'How do you measure the success of a product?',
  ],
  'Sales': [
    'How do you handle objections from a potential customer?',
    'Describe your sales process from lead generation to closing.',
    'Tell me about a time you missed a sales quota.',
    'What motivates you in a sales role?',
    'How do you research a potential client before a meeting?',
  ]
};

export type State = {
  message?: string | null;
  question?: string | null;
  questionIndex?: number;
  role?: string;
};

export async function getQuestionAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const role = (formData.get('role') as string) || prevState.role || 'Software Engineer';
    const questionBank = questions[role] || questions['Software Engineer'];
    
    let currentIndex = prevState.questionIndex ?? -1;
    if(prevState.role !== role) {
      currentIndex = -1; // Reset index if role changes
    }
    
    const nextIndex = (currentIndex + 1) % questionBank.length;
    
    return {
      message: null,
      question: questionBank[nextIndex],
      questionIndex: nextIndex,
      role: role,
    };
  } catch (error) {
    console.error('Failed to get question:', error);
    return {
      ...prevState,
      message: 'Failed to get a new question. Please try again later.',
    };
  }
}
