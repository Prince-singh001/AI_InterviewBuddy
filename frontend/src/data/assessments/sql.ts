import { Assessment } from '@/types/assessment';

export const sqlAssessment: Assessment = {
  id: 'sql-assessment',
  title: 'SQL & Database Architecture Assessment',
  category: 'SQL',
  description:
    'Test relational database mastery including indexing, window functions, ACID guarantees, and query optimization.',
  durationMinutes: 20,
  duration: 20,
  totalQuestions: 0,
  difficulty: 'Medium',
  passingPercentage: 70,
  color: 'from-[#7C3AED]/20 to-[#4F46E5]/10',
  // Questions will be manually populated by user later
  questions: [
    {
      id: 1,
      question:
        'What is the fundamental difference between the RANK() and DENSE_RANK() window functions in SQL?',
      options: [
        'RANK() leaves gaps in ranking numbers after ties, while DENSE_RANK() produces consecutive rank values',
        'DENSE_RANK() only works on unique numeric columns',
        'RANK() executes before WHERE clauses while DENSE_RANK() executes after',
        'There is no functional difference; they are aliases',
      ],
      correctAnswer: 0,
      explanation:
        'When ties occur (e.g. two items tied at rank 2), RANK() assigns rank 4 to the next item, whereas DENSE_RANK() assigns rank 3 without skipping numbers.',
      difficulty: 'Easy',
      topic: 'Window Functions',
      timeLimit: 60,
    },
  ],
};
