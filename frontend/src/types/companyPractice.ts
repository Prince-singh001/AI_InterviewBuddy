export interface CompanyDifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  logoText: string;
  brandColor: string;
  accentColor: string;
  badgeBg: string;
  tier: string;
  description: string;
  hq: string;
  questionCount: number;
  codingCount: number;
  assessmentCount: number;
  popularTopics: string[];
  difficultyDistribution: CompanyDifficultyDistribution;
  prepProgress: number; // 0 - 100 percentage
  recommendedFocus: string;
}

export type CompanyQuestionType =
  | 'Technical'
  | 'Coding'
  | 'System Design'
  | 'Behavioral'
  | 'SQL'
  | 'HR';

export interface CompanyQuestion {
  id: string;
  companyId: string;
  number: number;
  question: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionType: CompanyQuestionType;
  frequency?: 'Very High' | 'High' | 'Medium';
}

export interface InterviewRoundStep {
  step: number;
  title: string;
  subtitle: string;
  type: 'Assessment' | 'Technical' | 'System Design' | 'Managerial' | 'HR';
  duration: string;
  description: string;
  keyAreas: string[];
  tips: string[];
}
