// ============================================================
// MOCK DATA — All demo data for Interviewer Buddy AI
// ============================================================

export const mockDashboardStats = {
  overallScore: 78,
  interviewsCompleted: 12,
  averageScore: 74,
  bestScore: 89,
  currentStreak: 5,
  questionsAnswered: 147,
  practiceHours: 23.5,
}

export const mockPerformanceData = [
  { week: 'Week 1', score: 61, interviews: 2 },
  { week: 'Week 2', score: 68, interviews: 3 },
  { week: 'Week 3', score: 74, interviews: 2 },
  { week: 'Week 4', score: 78, interviews: 3 },
  { week: 'Week 5', score: 81, interviews: 2 },
  { week: 'Week 6', score: 79, interviews: 2 },
]

export const mockRecentInterviews = [
  {
    id: 'int-001',
    role: 'AIML Engineer',
    type: 'Technical + Behavioral',
    date: '2026-08-24',
    score: 82,
    duration: '32 min',
    status: 'Completed',
    difficulty: 'Intermediate',
  },
  {
    id: 'int-002',
    role: 'Python Developer',
    type: 'Technical',
    date: '2026-08-22',
    score: 76,
    duration: '28 min',
    status: 'Completed',
    difficulty: 'Advanced',
  },
  {
    id: 'int-003',
    role: 'Data Scientist',
    type: 'Machine Learning',
    date: '2026-08-20',
    score: 71,
    duration: '35 min',
    status: 'Completed',
    difficulty: 'Intermediate',
  },
  {
    id: 'int-004',
    role: 'Backend Developer',
    type: 'System Design',
    date: '2026-08-18',
    score: 68,
    duration: '40 min',
    status: 'Completed',
    difficulty: 'Advanced',
  },
]

export const mockAIRecommendation = {
  text: 'Your technical performance is strong, but behavioral answers need improvement. Focus on structuring your answers using the STAR framework.',
  recommended: 'Practice 10 behavioral questions using STAR methodology. Focus on measurable outcomes and specific examples.',
  priority: 'high' as const,
}

export const mockResumeData = {
  score: 84,
  sections: {
    atsCompatibility: 91,
    skillsRelevance: 88,
    experience: 79,
    projects: 82,
    keywords: 90,
    formatting: 93,
  },
  name: 'Prince Kumar',
  email: 'prince@example.com',
  phone: '+91 98765 43210',
  location: 'Mumbai, India',
  education: [
    { degree: 'B.Tech in Computer Science', institution: 'IIT Bombay', year: '2023–2027', cgpa: '8.2' },
  ],
  skills: ['Python', 'Machine Learning', 'Deep Learning', 'FastAPI', 'SQL', 'Git', 'TensorFlow', 'PyTorch', 'Docker', 'NumPy', 'Pandas', 'Scikit-learn'],
  experience: [
    {
      title: 'ML Engineer Intern',
      company: 'TechCorp AI',
      duration: 'June 2025 – Present',
      description: 'Developed NLP pipelines for text classification. Improved model accuracy by 12%.',
    },
  ],
  projects: [
    { name: 'AI Resume Analyzer', tech: 'Python, FastAPI, LangChain', description: 'Built a resume parsing and scoring system using LLMs.' },
    { name: 'Real-time Object Detection', tech: 'PyTorch, YOLO, OpenCV', description: 'Implemented real-time object detection with 95% accuracy.' },
  ],
  strengths: [
    'Strong Python experience (3+ years)',
    'Relevant AI/ML projects with measurable outcomes',
    'Good technical skills across the ML stack',
    'Clean formatting with proper section structure',
  ],
  improvements: [
    'Add measurable project impact metrics (e.g., % accuracy, latency reduction)',
    'Improve project descriptions with business context',
    'Add missing cloud technologies (AWS, GCP, Azure)',
    'Include certifications or online courses',
  ],
}

export const mockJobData = {
  title: 'AI/ML Engineer',
  company: 'Google DeepMind',
  matchScore: 78,
  skills: [
    { name: 'Python', status: 'matched' as const, level: 95 },
    { name: 'Machine Learning', status: 'matched' as const, level: 82 },
    { name: 'SQL', status: 'matched' as const, level: 70 },
    { name: 'Git', status: 'matched' as const, level: 88 },
    { name: 'TensorFlow/PyTorch', status: 'matched' as const, level: 78 },
    { name: 'AWS / GCP', status: 'missing' as const, level: 0 },
    { name: 'Docker / Kubernetes', status: 'partial' as const, level: 45 },
    { name: 'System Design', status: 'missing' as const, level: 0 },
    { name: 'MLOps', status: 'missing' as const, level: 0 },
  ],
  requiredExp: '1–3 years',
  seniority: 'Junior to Mid',
  interviewTopics: ['ML Algorithms', 'Python DSA', 'System Design basics', 'Model Deployment', 'Statistics'],
  preparationStrategy: 'Focus on ML fundamentals, Python coding questions, and basic system design. Be ready to discuss your projects in depth.',
}

export const mockInterviewQuestions = [
  {
    id: 'q-001',
    text: 'Can you explain the difference between supervised and unsupervised learning? Give examples of each.',
    type: 'technical',
    difficulty: 'medium',
    topic: 'Machine Learning Fundamentals',
  },
  {
    id: 'q-002',
    text: 'How would you handle class imbalance in a classification problem?',
    type: 'technical',
    difficulty: 'medium',
    topic: 'Machine Learning',
  },
  {
    id: 'q-003',
    text: 'Describe a challenging project you worked on. How did you overcome the challenges?',
    type: 'behavioral',
    difficulty: 'medium',
    topic: 'Behavioral',
  },
  {
    id: 'q-004',
    text: 'Explain how backpropagation works in neural networks.',
    type: 'technical',
    difficulty: 'hard',
    topic: 'Deep Learning',
  },
  {
    id: 'q-005',
    text: 'What is the difference between CNN and RNN? When would you use each?',
    type: 'technical',
    difficulty: 'medium',
    topic: 'Deep Learning',
  },
  {
    id: 'q-006',
    text: 'Tell me about yourself and why you are interested in this role.',
    type: 'hr',
    difficulty: 'easy',
    topic: 'HR',
  },
  {
    id: 'q-007',
    text: 'How would you design a recommendation system for an e-commerce platform?',
    type: 'technical',
    difficulty: 'hard',
    topic: 'System Design',
  },
  {
    id: 'q-008',
    text: 'What is overfitting and how do you prevent it?',
    type: 'technical',
    difficulty: 'easy',
    topic: 'Machine Learning',
  },
]

export const mockEvaluationResult = {
  overall: 78,
  technical: 84,
  communicationScore: 76,
  confidence: 72,
  clarity: 81,
  problemSolving: 79,
  behavioral: 75,
  strengths: [
    'Strong Python and ML fundamentals',
    'Good technical reasoning and problem-solving approach',
    'Clear and structured explanations',
    'Good use of real-world examples',
  ],
  improvements: [
    'Behavioral answers need more structure (use STAR framework)',
    'Some answers were too long — practice conciseness',
    'Several filler words detected (um, uh, like)',
    'System design answers lacked depth',
  ],
  recommendations: [
    'Practice 10 behavioral questions using STAR framework',
    'Complete 20 advanced Python + DSA questions',
    'Study system design fundamentals (week 3)',
    'Focus on concise, measurable answers',
  ],
  communication: {
    speakingSpeed: 142,
    fillerWords: 8,
    avgPause: 1.2,
    clarity: 86,
    vocabulary: 82,
    answerStructure: 78,
  },
  star: {
    overall: 76,
    situation: 85,
    task: 70,
    action: 79,
    result: 68,
    feedback: 'Your Situation and Action were strong. Improve the Result section by including measurable impact wherever possible.',
  },
  questionAnalysis: [
    {
      question: 'Explain the difference between supervised and unsupervised learning.',
      yourAnswer: 'Supervised learning uses labeled data where the model learns from input-output pairs. For example, classification and regression. Unsupervised learning works with unlabeled data to find patterns, like clustering.',
      score: 88,
      evaluation: 'Technically correct and well-explained.',
      strengths: ['Correct core concepts', 'Good examples provided'],
      improvements: ['Could mention semi-supervised learning', 'Include real-world applications'],
      suggestedAnswer: 'Supervised learning trains on labeled data (X → y pairs), enabling tasks like classification (spam detection) and regression (price prediction). Unsupervised learning discovers hidden patterns in unlabeled data through clustering (K-means), dimensionality reduction (PCA), or density estimation.',
    },
    {
      question: 'How would you handle class imbalance?',
      yourAnswer: 'I would use oversampling like SMOTE or undersampling. Also change the loss function or use class weights.',
      score: 74,
      evaluation: 'Good basic understanding, but answer lacked depth.',
      strengths: ['Mentioned SMOTE correctly', 'Aware of class weights'],
      improvements: ['Mention evaluation metrics (F1, AUC-ROC)', 'Discuss when to use each technique', 'Mention ensemble methods like balanced random forest'],
      suggestedAnswer: 'Handle class imbalance through: (1) Resampling — SMOTE oversampling or random undersampling; (2) Algorithm-level — class_weight parameter, cost-sensitive learning; (3) Metrics — use F1-score, AUC-ROC instead of accuracy; (4) Ensemble — BalancedRandomForest, EasyEnsemble.',
    },
  ],
}

export const mockInsightsData = {
  strengths: [
    { text: 'Strong technical confidence in Python and ML fundamentals', category: 'Technical' },
    { text: 'Good problem-solving approach with clear reasoning', category: 'Problem Solving' },
    { text: 'Effective use of real-world examples in explanations', category: 'Communication' },
    { text: 'Consistent performance across multiple interview sessions', category: 'Performance' },
  ],
  improvements: [
    { text: 'Behavioral answers lack STAR structure', category: 'Behavioral', priority: 'high' as const },
    { text: 'Technical answers on system design need more depth', category: 'Technical', priority: 'high' as const },
    { text: 'Speaking pace increases during difficult questions', category: 'Communication', priority: 'medium' as const },
    { text: 'Use of filler words (um, uh) detected regularly', category: 'Communication', priority: 'medium' as const },
    { text: 'Result section in behavioral answers lacks metrics', category: 'Behavioral', priority: 'high' as const },
  ],
  recommendations: [
    { text: 'Practice STAR methodology with 10 behavioral questions', category: 'Behavioral', action: 'Practice Now', link: '/practice?category=behavioral' },
    { text: 'Complete advanced Python + DSA practice set', category: 'Technical', action: 'Practice Now', link: '/practice?category=python' },
    { text: 'Study system design fundamentals (week 3 roadmap)', category: 'System Design', action: 'View Roadmap', link: '/career-roadmap' },
    { text: 'Record yourself and review speaking patterns', category: 'Communication', action: 'Start Practice', link: '/practice?category=communication' },
  ],
}

export const mockRoadmapData = {
  targetRole: 'AIML Engineer',
  currentReadiness: 68,
  skills: [
    { name: 'Python', current: 95, target: 100 },
    { name: 'Machine Learning', current: 82, target: 95 },
    { name: 'Deep Learning', current: 61, target: 85 },
    { name: 'SQL', current: 70, target: 80 },
    { name: 'Cloud (AWS/GCP)', current: 48, target: 80 },
    { name: 'GenAI / LLMs', current: 65, target: 90 },
    { name: 'MLOps', current: 35, target: 75 },
    { name: 'System Design', current: 42, target: 70 },
  ],
  weeks: [
    {
      week: 1,
      title: 'Python + DSA Foundations',
      tasks: [
        { id: 't1', text: 'Complete 30 LeetCode medium problems', done: true },
        { id: 't2', text: 'Review Python advanced concepts (generators, decorators, async)', done: true },
        { id: 't3', text: 'Practice 5 Python interview questions daily', done: false },
      ],
    },
    {
      week: 2,
      title: 'Machine Learning Deep Dive',
      tasks: [
        { id: 't4', text: 'Review all supervised/unsupervised algorithms', done: false },
        { id: 't5', text: 'Practice ML system design problems', done: false },
        { id: 't6', text: 'Complete 2 Kaggle mini-competitions', done: false },
      ],
    },
    {
      week: 3,
      title: 'Deep Learning + Generative AI',
      tasks: [
        { id: 't7', text: 'Study transformer architecture in depth', done: false },
        { id: 't8', text: 'Build a RAG application project', done: false },
        { id: 't9', text: 'Practice GenAI interview questions', done: false },
      ],
    },
    {
      week: 4,
      title: 'Mock Interviews + Projects',
      tasks: [
        { id: 't10', text: 'Complete 5 full mock interviews', done: false },
        { id: 't11', text: 'Polish resume and GitHub portfolio', done: false },
        { id: 't12', text: 'Practice system design (5 problems)', done: false },
      ],
    },
  ],
}

export const mockProgressData = {
  daily: [
    { date: '2026-08-19', score: 70, questions: 12, hours: 2.5 },
    { date: '2026-08-20', score: 68, questions: 10, hours: 2 },
    { date: '2026-08-21', score: 73, questions: 15, hours: 3 },
    { date: '2026-08-22', score: 76, questions: 11, hours: 2.5 },
    { date: '2026-08-23', score: 74, questions: 13, hours: 2.8 },
    { date: '2026-08-24', score: 82, questions: 18, hours: 4 },
    { date: '2026-08-25', score: 78, questions: 14, hours: 3.2 },
  ],
  skillProgress: [
    { subject: 'Python', score: 92, fullMark: 100 },
    { subject: 'ML', score: 78, fullMark: 100 },
    { subject: 'Deep Learning', score: 65, fullMark: 100 },
    { subject: 'Communication', score: 72, fullMark: 100 },
    { subject: 'System Design', score: 55, fullMark: 100 },
    { subject: 'Behavioral', score: 68, fullMark: 100 },
  ],
  weakTopics: ['System Design', 'Behavioral (STAR)', 'MLOps', 'Cloud Technologies'],
  strongTopics: ['Python', 'Machine Learning Basics', 'Deep Learning', 'Data Structures'],
}

export const mockPracticeCategories = [
  { id: 'dsa', name: 'DSA', icon: '🧮', count: 250, color: 'blue' },
  { id: 'python', name: 'Python', icon: '🐍', count: 180, color: 'blue' },
  { id: 'ml', name: 'Machine Learning', icon: '🤖', count: 120, color: 'purple' },
  { id: 'dl', name: 'Deep Learning', icon: '🧠', count: 85, color: 'purple' },
  { id: 'genai', name: 'Generative AI', icon: '✨', count: 60, color: 'purple' },
  { id: 'nlp', name: 'NLP', icon: '💬', count: 70, color: 'purple' },
  { id: 'cv', name: 'Computer Vision', icon: '👁️', count: 55, color: 'blue' },
  { id: 'sql', name: 'SQL', icon: '🗄️', count: 100, color: 'green' },
  { id: 'system-design', name: 'System Design', icon: '🏗️', count: 40, color: 'orange' },
  { id: 'behavioral', name: 'Behavioral', icon: '🎯', count: 90, color: 'green' },
  { id: 'hr', name: 'HR Questions', icon: '👥', count: 75, color: 'green' },
  { id: 'rag', name: 'RAG & LangChain', icon: '🔗', count: 45, color: 'purple' },
  { id: 'agentic', name: 'Agentic AI', icon: '⚡', count: 35, color: 'purple' },
  { id: 'java', name: 'Java', icon: '☕', count: 95, color: 'orange' },
  { id: 'cpp', name: 'C++', icon: '⚙️', count: 80, color: 'orange' },
  { id: 'communication', name: 'Communication', icon: '🗣️', count: 50, color: 'green' },
]

export const mockPracticeQuestion = {
  id: 'pq-001',
  category: 'Machine Learning',
  difficulty: 'Intermediate',
  text: 'Explain the concept of gradient descent and its variants (SGD, Adam, RMSprop). When would you use each?',
  timeLimit: 120,
  modelAnswer: `**Gradient Descent** is an optimization algorithm that minimizes the loss function by iteratively moving in the direction of steepest descent (negative gradient).

**Variants:**
- **Batch GD**: Uses entire dataset. Stable but slow for large data.
- **SGD (Stochastic)**: Updates per sample. Fast, noisy, good for large datasets.
- **Mini-batch GD**: Updates per batch (typical: 32–256). Balances speed and stability.

**Adaptive Methods:**
- **Adam**: Combines momentum + RMSprop. Best default choice. Adapts learning rate per parameter.
- **RMSprop**: Adapts learning rate by dividing by running average of squared gradients. Good for RNNs.
- **AdaGrad**: Accumulates squared gradients. Good for sparse data, can diminish learning rate too fast.

**When to use:**
- General purpose → Adam
- Large-scale NLP → AdamW
- Computer Vision fine-tuning → SGD with momentum
- RNNs/LSTMs → RMSprop`,
  evaluation: {
    score: 82,
    feedback: 'Good explanation of gradient descent variants. You correctly identified the use cases. Consider adding the mathematical intuition behind adaptive learning rates.',
    strengths: ['Correct understanding of SGD vs Adam', 'Good practical recommendations'],
    improvements: ['Add mathematical formulas', 'Mention learning rate scheduling'],
  },
}
