export interface MCQQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0-indexed: 0 -> A, 1 -> B, 2 -> C, 3 -> D
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  topic?: string;
  timeLimit?: number; // seconds per question
}

export type AssessmentCategory =
  | 'DSA'
  | 'Python'
  | 'SQL'
  | 'Aptitude'
  | 'Machine Learning'
  | 'General Technical'
  | 'Company Specific';

export interface Assessment {
  id: string;
  title: string;
  category: AssessmentCategory;
  description: string;
  durationMinutes: number;
  duration?: number; // alias in minutes
  totalQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  passingPercentage: number;
  questions: MCQQuestion[];
  company?: string;
  attemptsCount?: number;
  color?: string;
}

export interface UserAssessmentAnswer {
  questionId: number;
  selectedOption: number | null; // null if unanswered
  isMarkedForReview: boolean;
}

export interface AssessmentState {
  assessment: Assessment;
  currentQuestionIndex: number;
  answers: Record<number, number | null>; // questionId -> selectedOption (0, 1, 2, 3 or null)
  markedForReview: Record<number, boolean>;
  timeRemainingSeconds: number;
  isFinished: boolean;
  startedAt: number;
}

export interface AssessmentReviewItem {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  selectedOption: number | null;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentEvaluation {
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  totalQuestions: number;
  attempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  timeTakenSeconds: number;
  accuracy: number;
  passed: boolean;
  questions: AssessmentReviewItem[];
}
