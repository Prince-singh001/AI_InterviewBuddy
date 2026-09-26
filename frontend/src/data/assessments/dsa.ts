import { Assessment } from '@/types/assessment';

export const dsaAssessment: Assessment = {
  id: 'dsa-assessment',
  title: 'Data Structures & Algorithms Assessment',
  category: 'DSA',
  description:
    'Evaluate core competencies in algorithm design, asymptotic complexity, tree traversals, and dynamic programming.',
  durationMinutes: 25,
  duration: 25,
  totalQuestions: 0,
  difficulty: 'Hard',
  passingPercentage: 75,
  color: 'from-[#7C3AED]/20 to-[#4F46E5]/10',
  // Questions will be manually populated by user later
  questions: [
    {
      id: 1,
      question:
        'What is the worst-case time complexity of QuickSort when the pivot chosen is always the extreme element (smallest or largest)?',
      options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(2^N)'],
      correctAnswer: 2,
      explanation:
        'When the selected pivot partitions the array into subproblems of size 0 and N-1, the recurrence relation becomes T(N) = T(N-1) + O(N), yielding O(N²) worst-case time.',
      difficulty: 'Medium',
      topic: 'Sorting & Divide and Conquer',
      timeLimit: 90,
    },
  ],
};
