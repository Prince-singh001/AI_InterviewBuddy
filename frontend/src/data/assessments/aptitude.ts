import { Assessment } from '@/types/assessment';

export const aptitudeAssessment: Assessment = {
  id: 'aptitude-assessment',
  title: 'Quantitative & Logical Aptitude Assessment',
  category: 'Aptitude',
  description:
    'Assess analytical aptitude, probability, time-and-work, speed-distance-time, and deductive logic essential for campus and company placement tests.',
  durationMinutes: 20,
  duration: 20,
  totalQuestions: 0,
  difficulty: 'Medium',
  passingPercentage: 65,
  color: 'from-[#7C3AED]/20 to-[#4F46E5]/10',
  // Questions will be manually populated by user later
  questions: [
    {
      id: 1,
      question:
        'A can complete a project in 12 days and B can complete it in 24 days. If they work together, in how many days will the project be finished?',
      options: ['6 days', '8 days', '10 days', '16 days'],
      correctAnswer: 1,
      explanation:
        'Combined work rate = 1/12 + 1/24 = 2/24 + 1/24 = 3/24 = 1/8 of the project per day. Hence, together they need 8 days.',
      difficulty: 'Easy',
      topic: 'Time and Work',
      timeLimit: 60,
    },
  ],
};
