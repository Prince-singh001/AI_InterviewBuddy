export type SupportedLanguage =
  | 'c'
  | 'cpp'
  | 'java'
  | 'python'
  | 'javascript'
  | 'go'
  | 'csharp';

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  extension: string;
  version: string;
}

export type CodingDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface CodingTestCase {
  id: number;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  number: number;
  title: string;
  slug: string;
  difficulty: CodingDifficulty;
  topics: string[];
  acceptance: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  starterCodes: Record<SupportedLanguage, string>;
  testCases: CodingTestCase[];
  companies?: string[];
  solved?: boolean;
}

export interface ExecutionResult {
  status:
    | 'Idle'
    | 'Running'
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Compilation Error';
  message: string;
  executionTimeMs?: number;
  memoryKb?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  output?: string;
  expectedOutput?: string;
  userInput?: string;
  details?: string;
  errorDetails?: string;
}
