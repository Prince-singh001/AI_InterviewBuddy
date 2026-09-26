import {
  Company,
  CompanyQuestion,
  InterviewRoundStep,
} from '@/types/companyPractice';

export const companies: Company[] = [
  {
    id: 'google',
    name: 'Google',
    slug: 'google',
    shortName: 'Google',
    logoText: 'G',
    brandColor: '#4285F4',
    accentColor: '#EA4335',
    badgeBg: 'rgba(66, 133, 244, 0.1)',
    tier: 'Tier 1 / FAANG',
    description:
      'Focuses heavily on core computer science foundations, algorithmic problem solving, clean scalable design, and Googleyness & leadership principles.',
    hq: 'Mountain View, CA',
    questionCount: 85,
    codingCount: 42,
    assessmentCount: 3,
    popularTopics: [
      'Graphs & Trees',
      'Dynamic Programming',
      'Distributed Systems',
      'Bit Manipulation',
      'Trie & Strings',
    ],
    difficultyDistribution: {
      easy: 15,
      medium: 55,
      hard: 30,
    },
    prepProgress: 24,
    recommendedFocus: 'Graph algorithms & edge-case analysis',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    slug: 'microsoft',
    shortName: 'Microsoft',
    logoText: 'MS',
    brandColor: '#00A4EF',
    accentColor: '#7FBA00',
    badgeBg: 'rgba(0, 164, 239, 0.1)',
    tier: 'Tier 1 / Big Tech',
    description:
      'Emphasizes clean code structure, data structures, recursion, cloud architectural thinking, and real-world system resilience.',
    hq: 'Redmond, WA',
    questionCount: 78,
    codingCount: 38,
    assessmentCount: 2,
    popularTopics: [
      'Binary Trees & BST',
      'Arrays & Hash Maps',
      'Linked Lists',
      'Object Oriented Design',
      'System Architecture',
    ],
    difficultyDistribution: {
      easy: 25,
      medium: 55,
      hard: 20,
    },
    prepProgress: 35,
    recommendedFocus: 'Tree traversals & Object-Oriented design',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    shortName: 'Amazon',
    logoText: 'AMZN',
    brandColor: '#FF9900',
    accentColor: '#146EB4',
    badgeBg: 'rgba(255, 153, 0, 0.1)',
    tier: 'Tier 1 / FAANG',
    description:
      'Known for rigorous behavioral evaluation mapped directly to Amazon 16 Leadership Principles combined with LeetCode medium-to-hard coding and low-level design.',
    hq: 'Seattle, WA',
    questionCount: 92,
    codingCount: 48,
    assessmentCount: 4,
    popularTopics: [
      'Leadership Principles (STAR)',
      'Priority Queues & Heaps',
      'Two Pointers & Sliding Window',
      'BFS / DFS',
      'Low Level Design',
    ],
    difficultyDistribution: {
      easy: 20,
      medium: 60,
      hard: 20,
    },
    prepProgress: 40,
    recommendedFocus: 'STAR format behavioral stories & Heap/Priority Queues',
  },
  {
    id: 'tcs',
    name: 'Tata Consultancy Services',
    slug: 'tcs',
    shortName: 'TCS',
    logoText: 'TCS',
    brandColor: '#0070AD',
    accentColor: '#002D62',
    badgeBg: 'rgba(0, 112, 173, 0.1)',
    tier: 'IT Services / Global',
    description:
      'Recruits through the TCS NQT national qualifying exam with emphasis on quantitative aptitude, logical reasoning, programming logic (C/Java/Python), and technical fundamentals.',
    hq: 'Mumbai, India',
    questionCount: 65,
    codingCount: 28,
    assessmentCount: 2,
    popularTopics: [
      'Quantitative Aptitude',
      'Data Interpretation',
      'Basic Strings & Arrays',
      'SQL & DBMS Queries',
      'Core Java / C Basics',
    ],
    difficultyDistribution: {
      easy: 55,
      medium: 40,
      hard: 5,
    },
    prepProgress: 60,
    recommendedFocus: 'Speed math, time-and-work, and string manipulation',
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    slug: 'deloitte',
    shortName: 'Deloitte',
    logoText: 'D',
    brandColor: '#86BC25',
    accentColor: '#000000',
    badgeBg: 'rgba(134, 188, 37, 0.12)',
    tier: 'Big 4 / Consulting & Tech',
    description:
      'Evaluates business-technology acumen, database querying, scenario-based problem solving, communication skills, and situational judgment.',
    hq: 'London, UK / Global',
    questionCount: 54,
    codingCount: 22,
    assessmentCount: 2,
    popularTopics: [
      'SQL Joins & Aggregations',
      'Data Modeling',
      'Logical Reasoning',
      'Consulting Case Studies',
      'Behavioral & Fitment',
    ],
    difficultyDistribution: {
      easy: 40,
      medium: 50,
      hard: 10,
    },
    prepProgress: 18,
    recommendedFocus: 'Complex SQL queries and business case communication',
  },
];

export const defaultCompanyRounds: InterviewRoundStep[] = [
  {
    step: 1,
    title: 'Round 1: Online Assessment (OA)',
    subtitle: 'Screening & Aptitude / Coding Challenge',
    type: 'Assessment',
    duration: '60 - 90 mins',
    description:
      'Initial automated evaluation consisting of MCQs (CS fundamentals, aptitude) and 1 to 2 coding problems on automated platforms like HackerRank or Codility.',
    keyAreas: [
      'Data structures (Arrays, Strings, Hash Tables)',
      'Basic algorithmic complexity',
      'Aptitude & quantitative speed',
      'Edge case validation',
    ],
    tips: [
      'Practice writing bug-free code quickly under time constraints',
      'Test for boundary inputs (empty arrays, negative numbers, large constraints)',
      'Review Big-O time and space complexity beforehand',
    ],
  },
  {
    step: 2,
    title: 'Round 2: Technical Interview I',
    subtitle: 'Data Structures & Core Problem Solving',
    type: 'Technical',
    duration: '45 - 60 mins',
    description:
      'Live 1-on-1 coding session with a software engineer. You will be expected to talk through your thought process, write clean code in a shared editor, and analyze runtime.',
    keyAreas: [
      'Problem breakdown & verbal communication',
      'Trees, Graphs, Recursion, Dynamic Programming',
      'Time & Space complexity analysis',
      'Code modularity and naming',
    ],
    tips: [
      'Always clarify requirements and ask clarifying questions before writing code',
      'Start with a brute force idea, then optimize iteratively with the interviewer',
      'Dry run your code with a sample test case manually before declaring completion',
    ],
  },
  {
    step: 3,
    title: 'Round 3: Technical Interview II / System Design',
    subtitle: 'Advanced DSA & Architectural Thinking',
    type: 'System Design',
    duration: '45 - 60 mins',
    description:
      'Depending on seniority, this round delves into advanced algorithmic challenges, low-level object-oriented design (LLD), or high-level distributed systems design (HLD).',
    keyAreas: [
      'Object Oriented Design (Design Patterns, SOLID)',
      'Scalability, Caching, Database choices (SQL vs NoSQL)',
      'API Design & Data flow modeling',
      'Concurrency & failure modes',
    ],
    tips: [
      'Drive the conversation by listing functional and non-functional requirements',
      'Discuss trade-offs (e.g. latency vs consistency, read vs write heavy)',
      'Draw clear block diagrams and explain data lifecycles',
    ],
  },
  {
    step: 4,
    title: 'Round 4: Managerial & Fitment Round',
    subtitle: 'Scenario Handling & Cultural Alignment',
    type: 'Managerial',
    duration: '45 mins',
    description:
      'Conducted by an Engineering Manager or Director to assess past project experience, conflict resolution, technical decision-making, and teamwork mindset.',
    keyAreas: [
      'Past project deep dives and architectural choices',
      'Conflict management and handling missed deadlines',
      'Ownership and delivery under ambiguity',
      'Team collaboration and mentorship',
    ],
    tips: [
      'Structure all answers using the STAR method (Situation, Task, Action, Result)',
      'Quantify results wherever possible (e.g., improved latency by 35%)',
      'Be honest about mistakes and highlight what you learned from them',
    ],
  },
  {
    step: 5,
    title: 'Round 5: HR & Behavioral Round',
    subtitle: 'Culture, Values & Final Discussions',
    type: 'HR',
    duration: '30 mins',
    description:
      'Final conversation discussing company culture, motivation, compensation expectations, work logistics, and answering your questions about the organization.',
    keyAreas: [
      'Why this company and why this specific role?',
      'Career trajectory and professional growth goals',
      'Adaptability to organizational values',
      'Relocation, compensation, and onboarding',
    ],
    tips: [
      'Research company culture, recent news, and mission statement thoroughly',
      'Prepare 2-3 thoughtful questions to ask the interviewer about team culture',
      'Maintain an enthusiastic, professional, and positive demeanor',
    ],
  },
];

// Placeholder Reported Questions structure for each company (User will add more questions later)
export const companyQuestionsData: Record<string, CompanyQuestion[]> = {
  google: [
    {
      id: 'goog-q1',
      companyId: 'google',
      number: 1,
      question:
        'Given a directed graph, how would you detect a cycle and return the topological order of nodes if no cycle exists?',
      topic: 'Graphs & Topological Sort',
      difficulty: 'Medium',
      questionType: 'Coding',
      frequency: 'Very High',
    },
    {
      id: 'goog-q2',
      companyId: 'google',
      number: 2,
      question:
        'Design a distributed rate limiter that restricts API calls to 100 requests per minute per IP across a global server cluster.',
      topic: 'Distributed Systems',
      difficulty: 'Hard',
      questionType: 'System Design',
      frequency: 'High',
    },
    {
      id: 'goog-q3',
      companyId: 'google',
      number: 3,
      question:
        'Explain a time when you received pushback on a technical proposal from senior engineers. How did you handle the discussion and reach consensus?',
      topic: 'Googleyness & Leadership',
      difficulty: 'Medium',
      questionType: 'Behavioral',
      frequency: 'Very High',
    },
  ],
  microsoft: [
    {
      id: 'msft-q1',
      companyId: 'microsoft',
      number: 1,
      question:
        'Write an algorithm to serialize and deserialize a binary tree efficiently with minimal memory overhead.',
      topic: 'Trees & Serialization',
      difficulty: 'Hard',
      questionType: 'Coding',
      frequency: 'Very High',
    },
    {
      id: 'msft-q2',
      companyId: 'microsoft',
      number: 2,
      question:
        'How would you design the backend storage and synchronization system for Microsoft OneDrive file changes across devices?',
      topic: 'Cloud Storage Architecture',
      difficulty: 'Hard',
      questionType: 'System Design',
      frequency: 'High',
    },
    {
      id: 'msft-q3',
      companyId: 'microsoft',
      number: 3,
      question:
        'What is the difference between synchronous and asynchronous I/O at the OS kernel level, and how does event-driven polling work?',
      topic: 'Operating Systems',
      difficulty: 'Medium',
      questionType: 'Technical',
      frequency: 'Medium',
    },
  ],
  amazon: [
    {
      id: 'amzn-q1',
      companyId: 'amazon',
      number: 1,
      question:
        'Find the median from a continuous data stream of incoming integers with O(1) retrieval time.',
      topic: 'Heaps & Two Priority Queues',
      difficulty: 'Hard',
      questionType: 'Coding',
      frequency: 'Very High',
    },
    {
      id: 'amzn-q2',
      companyId: 'amazon',
      number: 2,
      question:
        'Tell me about a time you had to make an important architectural decision with incomplete data under tight deadlines (Bias for Action).',
      topic: 'Leadership Principles',
      difficulty: 'Medium',
      questionType: 'Behavioral',
      frequency: 'Very High',
    },
    {
      id: 'amzn-q3',
      companyId: 'amazon',
      number: 3,
      question:
        'Design Amazon Locker delivery fulfillment system including locker assignment, customer pickup PIN generation, and expiration handling.',
      topic: 'Low Level Design / OOP',
      difficulty: 'Medium',
      questionType: 'System Design',
      frequency: 'High',
    },
  ],
  tcs: [
    {
      id: 'tcs-q1',
      companyId: 'tcs',
      number: 1,
      question:
        'Given an array of positive integers, rearrange the elements such that all even numbers appear before odd numbers while preserving relative order.',
      topic: 'Arrays & Sorting',
      difficulty: 'Easy',
      questionType: 'Coding',
      frequency: 'Very High',
    },
    {
      id: 'tcs-q2',
      companyId: 'tcs',
      number: 2,
      question:
        'Write an SQL query to find the 2nd highest salary from an Employee table without using the LIMIT / TOP keyword.',
      topic: 'SQL & DBMS',
      difficulty: 'Medium',
      questionType: 'SQL',
      frequency: 'Very High',
    },
    {
      id: 'tcs-q3',
      companyId: 'tcs',
      number: 3,
      question:
        'Explain the four pillars of Object-Oriented Programming (OOPS) with a real-life banking system example.',
      topic: 'Core OOPS Concepts',
      difficulty: 'Easy',
      questionType: 'Technical',
      frequency: 'High',
    },
  ],
  deloitte: [
    {
      id: 'del-q1',
      companyId: 'deloitte',
      number: 1,
      question:
        'Write an SQL query using Window Functions to calculate the 3-month running average revenue for each client account.',
      topic: 'SQL Window Functions',
      difficulty: 'Medium',
      questionType: 'SQL',
      frequency: 'Very High',
    },
    {
      id: 'del-q2',
      companyId: 'deloitte',
      number: 2,
      question:
        'A retail client wants to migrate their legacy monolithic inventory database to cloud microservices. What risk assessment and phased approach would you recommend?',
      topic: 'Enterprise Architecture & Cloud',
      difficulty: 'Medium',
      questionType: 'Technical',
      frequency: 'High',
    },
    {
      id: 'del-q3',
      companyId: 'deloitte',
      number: 3,
      question:
        'Describe a situation where a client changed project requirements drastically halfway through the sprint. How did you manage scope creep?',
      topic: 'Client Management & Agile',
      difficulty: 'Medium',
      questionType: 'Behavioral',
      frequency: 'High',
    },
  ],
};

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getQuestionsByCompany(companySlug: string): CompanyQuestion[] {
  return companyQuestionsData[companySlug.toLowerCase()] || [];
}
