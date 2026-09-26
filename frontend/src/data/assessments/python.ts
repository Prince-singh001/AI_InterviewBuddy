import { Assessment } from '@/types/assessment';

export const pythonAssessment: Assessment = {
  id: 'python-assessment',
  title: 'Python Core & Advanced Assessment',
  category: 'Python',
  description:
    'Test your knowledge on Python data types, OOP principles, generators, decorators, and memory management.',
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
        'What is the output of the following Python expression: type(lambda: None)?',
      options: [
        '<class \'function\'>',
        '<class \'lambda\'>',
        '<class \'type\'>',
        'SyntaxError',
      ],
      correctAnswer: 0,
      explanation:
        'In Python, anonymous functions created with lambda expressions are instances of the built-in function class, just like functions created with def.',
      difficulty: 'Easy',
      topic: 'Functions & Lambdas',
      timeLimit: 60,
    },
  ],
};
