import { Assessment } from '@/types/assessment';
import { aptitudeAssessment } from './aptitude';
import { dsaAssessment } from './dsa';
import { pythonAssessment } from './python';
import { sqlAssessment } from './sql';

export const machineLearningAssessment: Assessment = {
  id: 'ml-assessment',
  title: 'Machine Learning & AI Assessment',
  category: 'Machine Learning',
  description:
    'Evaluate your understanding of regression, classification, bias-variance tradeoff, neural architecture, and evaluation metrics.',
  durationMinutes: 20,
  totalQuestions: 5,
  difficulty: 'Medium',
  passingPercentage: 70,
  color: 'from-pink-500/20 to-rose-500/10',
  questions: [
    {
      id: 1,
      question:
        'Which metric is preferred over accuracy when evaluating a binary classifier on an extremely imbalanced dataset (e.g. 99% negative cases)?',
      options: [
        'F1-Score / PR-AUC',
        'Mean Squared Error (MSE)',
        'R-squared score',
        'Accuracy Score',
      ],
      correctAnswer: 0,
      explanation:
        'On heavily skewed distributions, raw accuracy is deceptive (a dummy classifier guessing negative gets 99%). F1-score balances precision and recall for the minority class.',
      difficulty: 'Easy',
      topic: 'Evaluation Metrics',
    },
    {
      id: 2,
      question:
        'What is the primary effect of adding L1 regularization (Lasso) to a linear regression model?',
      options: [
        'It drives non-essential feature weights strictly to zero, performing automatic feature selection',
        'It guarantees zero training error on any dataset',
        'It scales all weights proportionally without inducing sparsity',
        'It removes collinearity by duplicating correlated features',
      ],
      correctAnswer: 0,
      explanation:
        'The diamond geometry of the L1 penalty induces sharp corners at coordinate axes, causing irrelevant weights to shrink exactly to zero.',
      difficulty: 'Medium',
      topic: 'Regularization',
    },
    {
      id: 3,
      question:
        'Which activation function mitigates the vanishing gradient problem in deep feedforward networks compared to Sigmoid?',
      options: ['ReLU', 'Tanh', 'Step Function', 'Softmax'],
      correctAnswer: 0,
      explanation:
        'ReLU has a constant derivative of 1 for positive inputs, avoiding gradient saturation and vanishing gradients during backpropagation.',
      difficulty: 'Easy',
      topic: 'Deep Learning',
    },
    {
      id: 4,
      question:
        'In the Bias-Variance tradeoff, a model with very high variance typically exhibits which symptom?',
      options: [
        'Severe overfitting with low training error but poor generalization on validation sets',
        'High underfitting with bad performance on both train and test',
        'Inability to capture non-linear relationships',
        'Excessive regularization penalty',
      ],
      correctAnswer: 0,
      explanation:
        'High variance means the model is hypersensitive to statistical fluctuations in the training set, causing overfitting and poor generalization.',
      difficulty: 'Easy',
      topic: 'Model Optimization',
    },
    {
      id: 5,
      question:
        'What is the key mechanism that enables the Transformer architecture to process entire sequences in parallel without recurrence?',
      options: [
        'Multi-Head Self-Attention',
        'Hidden Markov Transitions',
        'Convolutional Max-Pooling',
        'Recurrent LSTM Gates',
      ],
      correctAnswer: 0,
      explanation:
        'Multi-head self-attention computes pairwise relation scores between all tokens simultaneously, allowing complete parallelization across GPUs.',
      difficulty: 'Medium',
      topic: 'Transformers & LLMs',
    },
  ],
};

export const generalTechnicalAssessment: Assessment = {
  id: 'general-tech-assessment',
  title: 'General Technical & CS Fundamentals Assessment',
  category: 'General Technical',
  description:
    'Comprehensive test covering Operating Systems, Computer Networks, System Design principles, and software engineering practices.',
  durationMinutes: 25,
  totalQuestions: 5,
  difficulty: 'Medium',
  passingPercentage: 70,
  color: 'from-cyan-500/20 to-blue-500/10',
  questions: [
    {
      id: 1,
      question:
        'Which HTTP status code signifies that the client must authenticate itself to get the requested response?',
      options: [
        '401 Unauthorized',
        '403 Forbidden',
        '404 Not Found',
        '400 Bad Request',
      ],
      correctAnswer: 0,
      explanation:
        'HTTP 401 Unauthorized indicates that the request lacks valid authentication credentials. 403 Forbidden means the server understands the identity but refuses authorization.',
      difficulty: 'Easy',
      topic: 'Web & HTTP',
    },
    {
      id: 2,
      question:
        'What condition is NOT one of Coffman\'s four necessary conditions for deadlock in operating systems?',
      options: [
        'Preemption allowed',
        'Mutual Exclusion',
        'Hold and Wait',
        'Circular Wait',
      ],
      correctAnswer: 0,
      explanation:
        'Deadlock requires No Preemption (resources cannot be forcibly taken away). If preemption is allowed, deadlock cannot persist.',
      difficulty: 'Medium',
      topic: 'Operating Systems',
    },
    {
      id: 3,
      question:
        'Which layer in the OSI reference model is responsible for end-to-end communication, flow control, and error recovery via TCP?',
      options: [
        'Transport Layer (Layer 4)',
        'Network Layer (Layer 3)',
        'Data Link Layer (Layer 2)',
        'Session Layer (Layer 5)',
      ],
      correctAnswer: 0,
      explanation:
        'Layer 4 (Transport) manages host-to-host communication, segmentation, flow control, and reliable delivery (TCP).',
      difficulty: 'Easy',
      topic: 'Computer Networks',
    },
    {
      id: 4,
      question:
        'In distributed systems, the CAP theorem states that a distributed data store can simultaneously provide at most two of which three guarantees?',
      options: [
        'Consistency, Availability, Partition Tolerance',
        'Concurrency, Accuracy, Persistence',
        'Capacity, Availability, Performance',
        'Consistency, Atomicity, Privacy',
      ],
      correctAnswer: 0,
      explanation:
        'The CAP theorem (Eric Brewer) proves that under network partition (P), a distributed system must trade off between Consistency (C) and Availability (A).',
      difficulty: 'Easy',
      topic: 'System Design',
    },
    {
      id: 5,
      question:
        'What is the primary benefit of using a Reverse Proxy (such as NGINX or Envoy) in front of application microservices?',
      options: [
        'Load balancing, SSL termination, caching, and security isolation',
        'Directly executing SQL transactions in the browser',
        'Eliminating the need for backend business logic',
        'Increasing client-side CPU speed',
      ],
      correctAnswer: 0,
      explanation:
        'A reverse proxy handles load balancing across backend instances, terminates TLS/SSL, caches static assets, and shields origin services.',
      difficulty: 'Medium',
      topic: 'Architecture & DevOps',
    },
  ],
};

// Company Specific Assessments
export const companyAssessments: Assessment[] = [
  {
    id: 'google-assessment',
    title: 'Google Online Assessment (OA)',
    category: 'Company Specific',
    company: 'google',
    description:
      'Curated simulation of Google\'s Technical Assessment focusing on algorithmic complexity, graph theory, and edge-case handling.',
    durationMinutes: 30,
    totalQuestions: 5,
    difficulty: 'Hard',
    passingPercentage: 80,
    color: 'from-red-500/20 to-blue-500/10',
    questions: dsaAssessment.questions,
  },
  {
    id: 'microsoft-assessment',
    title: 'Microsoft Codility Assessment',
    category: 'Company Specific',
    company: 'microsoft',
    description:
      'Practice round modeled on Microsoft Codility benchmarks: arrays, strings, tree manipulation, and clean modular code standards.',
    durationMinutes: 25,
    totalQuestions: 5,
    difficulty: 'Medium',
    passingPercentage: 75,
    color: 'from-blue-500/20 to-teal-500/10',
    questions: dsaAssessment.questions,
  },
  {
    id: 'amazon-assessment',
    title: 'Amazon Online Assessment (OA)',
    category: 'Company Specific',
    company: 'amazon',
    description:
      'Practice technical assessment covering Amazon behavioral principles, data structures, and optimal time-space trade-offs.',
    durationMinutes: 30,
    totalQuestions: 5,
    difficulty: 'Hard',
    passingPercentage: 75,
    color: 'from-amber-500/20 to-orange-500/10',
    questions: dsaAssessment.questions,
  },
  {
    id: 'tcs-assessment',
    title: 'TCS NQT Assessment',
    category: 'Company Specific',
    company: 'tcs',
    description:
      'Modeled after the TCS National Qualifier Test: numerical ability, logical deduction, programming logic, and hands-on concepts.',
    durationMinutes: 20,
    totalQuestions: 5,
    difficulty: 'Easy',
    passingPercentage: 65,
    color: 'from-purple-500/20 to-indigo-500/10',
    questions: aptitudeAssessment.questions,
  },
  {
    id: 'deloitte-assessment',
    title: 'Deloitte Tech Assessment',
    category: 'Company Specific',
    company: 'deloitte',
    description:
      'Technical assessment for Deloitte analyst and developer roles: SQL data modeling, business logic, and quantitative aptitude.',
    durationMinutes: 20,
    totalQuestions: 5,
    difficulty: 'Medium',
    passingPercentage: 70,
    color: 'from-emerald-500/20 to-green-500/10',
    questions: sqlAssessment.questions,
  },
];

export const allAssessments: Assessment[] = [
  dsaAssessment,
  pythonAssessment,
  sqlAssessment,
  aptitudeAssessment,
  machineLearningAssessment,
  generalTechnicalAssessment,
  ...companyAssessments,
];

export function getAssessmentById(id: string): Assessment | undefined {
  return allAssessments.find((a) => a.id === id);
}

export function getAssessmentsByCompany(companySlug: string): Assessment[] {
  return companyAssessments.filter(
    (a) => a.company?.toLowerCase() === companySlug.toLowerCase(),
  );
}

export { aptitudeAssessment, dsaAssessment, pythonAssessment, sqlAssessment };
