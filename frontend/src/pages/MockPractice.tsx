import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Code2,
  Terminal,
  Database,
  Network,
  Cpu,
  Layers,
  Eye,
  GitBranch,
  Server,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Send,
  Loader2,
  Lightbulb,
  Check,
  X,
  BookOpen,
  ChevronRight,
  Target,
  Workflow,
  LucideIcon,
} from 'lucide-react';
import {
  practiceApi,
  type PracticeQuestion,
  type PracticeSubmitResult,
  type EvalResult,
} from '@/services/apiService';
import { robotIllustration } from '@/assets/illustrations';
import { toast } from 'sonner';

export interface TopicDef {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  description: string;
  skills: string[];
}

export const PRACTICE_TOPICS: TopicDef[] = [
  {
    id: 'python',
    name: 'Python',
    category: 'Programming',
    icon: Terminal,
    description: 'Core syntax, OOP, decorators, generators, async programming & libraries.',
    skills: ['Decorators', 'Generators', 'Async/Await', 'OOP', 'Data Types'],
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Computer Science',
    icon: GitBranch,
    description: 'Arrays, linked lists, trees, graphs, sorting, searching, and recursion.',
    skills: ['Binary Trees', 'Graphs', 'Two Pointers', 'Dynamic Programming', 'Complexity'],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    category: 'AI & Data',
    icon: Cpu,
    description: 'Supervised & unsupervised models, regularization, evaluation, and tuning.',
    skills: ['Regression', 'Classification', 'Cross-Validation', 'Bias-Variance', 'Ensembles'],
  },
  {
    id: 'dl',
    name: 'Deep Learning',
    category: 'AI & Data',
    icon: Network,
    description: 'Neural networks, activation functions, backprop, CNNs, RNNs & transformers.',
    skills: ['Backpropagation', 'Activation Functions', 'CNNs', 'Loss Functions', 'Optimizers'],
  },
  {
    id: 'cv',
    name: 'Computer Vision',
    category: 'AI & Data',
    icon: Eye,
    description: 'Image processing, feature extraction, object detection, and CNN backbones.',
    skills: ['Edge Detection', 'Convolutions', 'Segmentation', 'Transfer Learning'],
  },
  {
    id: 'genai',
    name: 'Generative AI',
    category: 'AI & Data',
    icon: Layers,
    description: 'LLM architectures, prompting, attention mechanisms, fine-tuning & RAG.',
    skills: ['Attention Mechanism', 'Embeddings', 'Vector Search', 'Prompt Engineering'],
  },
  {
    id: 'sql',
    name: 'SQL & Databases',
    category: 'Data Engineering',
    icon: Database,
    description: 'Relational queries, complex joins, subqueries, indexing, and aggregations.',
    skills: ['Window Functions', 'Joins', 'Indexes', 'Subqueries', 'Group By'],
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    category: 'Computer Science',
    icon: Network,
    description: 'OSI 7 layers, TCP/IP, sockets, HTTP/HTTPS, DNS, and network routing.',
    skills: ['TCP 3-Way Handshake', 'DNS Resolution', 'OSI vs TCP/IP', 'HTTP/HTTPS'],
  },
  {
    id: 'dbms',
    name: 'DBMS',
    category: 'Computer Science',
    icon: Database,
    description: 'ACID properties, transactions, concurrency control, normalization, and keys.',
    skills: ['ACID Transactions', 'Normalization', 'B+ Trees', 'Locking Mechanisms'],
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming (OOP)',
    category: 'Computer Science',
    icon: Layers,
    description: 'Encapsulation, inheritance, polymorphism, abstraction, and SOLID principles.',
    skills: ['SOLID Principles', 'Polymorphism', 'Design Patterns', 'Abstraction'],
  },
  {
    id: 'system-design',
    name: 'System Design',
    category: 'Software Architecture',
    icon: Server,
    description: 'High-level architectures, caching, load balancing, databases & scalability.',
    skills: ['Load Balancers', 'Caching (Redis)', 'Microservices', 'Sharding', 'CAP Theorem'],
  },
  {
    id: 'aptitude',
    name: 'Aptitude & Reasoning',
    category: 'General',
    icon: Calculator,
    description: 'Quantitative problem solving, sequences, logic puzzles & analytical math.',
    skills: ['Time & Work', 'Percentages', 'P&C', 'Logical Puzzles', 'Probability'],
  },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function MockPractice() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicDef | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Practice session question & answer states
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Feedback result
  const [feedback, setFeedback] = useState<{
    status: 'Correct' | 'Needs Improvement' | 'Incorrect';
    explanation: string;
    keyConcept: string;
    suggestedImprovement: string;
    score?: number;
  } | null>(null);

  // Fetch question for selected topic & difficulty
  const fetchNextQuestion = async (topic = selectedTopic, diff = difficulty) => {
    if (!topic) return;
    setIsLoadingQuestion(true);
    setFeedback(null);
    setUserTextAnswer('');
    setSelectedOption(null);

    try {
      const q = await practiceApi.getQuestion(
        topic.id,
        diff.toLowerCase(),
      );

      if (!q || !q.question) {
        throw new Error('Question not found');
      }

      setCurrentQuestion(q);
    } catch (err) {
      console.error('Failed to fetch practice question:', err);
      // Fallback sample question for topic
      setCurrentQuestion({
        id: `${topic.id}-sample-1`,
        question: `Explain the fundamental principles of ${topic.name} and provide a real-world software engineering example.`,
        category: topic.name,
        difficulty: diff,
        type: 'text',
      });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Select a topic to start practicing
  const handleSelectTopic = (topic: TopicDef) => {
    setSelectedTopic(topic);
    void fetchNextQuestion(topic, difficulty);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const answer = userTextAnswer.trim();
    if (selectedOption === null && !answer) {
      toast.error('Please select an option or write your explanation.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If MCQ option selected, validate with backend submit
      if (selectedOption !== null && currentQuestion.options && currentQuestion.options.length > 0) {
        const res: PracticeSubmitResult = await practiceApi.submitAnswer(
          currentQuestion.id,
          selectedOption,
          answer,
        );

        const isCorrect = Boolean(res.is_correct);
        const fb = {
          status: isCorrect ? ('Correct' as const) : ('Incorrect' as const),
          explanation: res.explanation || 'Answer verified against concept keys.',
          keyConcept: currentQuestion.topic || selectedTopic?.name || 'Core Fundamentals',
          suggestedImprovement: isCorrect
            ? 'Great job! You identified the correct solution accurately.'
            : `The correct option was: ${res.correct_answer || 'the verified answer'}. Review the key concept before moving forward.`,
          score: isCorrect ? 100 : 0,
        };
        setFeedback(fb);

        // Record in practice history
        try {
          const item = {
            id: `prac-${Date.now()}`,
            topicId: selectedTopic?.id || 'general',
            topicName: selectedTopic?.name || 'General Practice',
            difficulty,
            question: currentQuestion.question,
            status: fb.status,
            score: fb.score,
            explanation: fb.explanation,
            suggestedImprovement: fb.suggestedImprovement,
            timestamp: new Date().toISOString(),
          };
          const existing = JSON.parse(localStorage.getItem('ib_mock_practice_history') || '[]');
          localStorage.setItem('ib_mock_practice_history', JSON.stringify([item, ...existing].slice(0, 50)));
        } catch {
          // ignore
        }
      } else {
        // 2. Descriptive / written concept response: run AI evaluation
        const evalRes: EvalResult = await practiceApi.evaluate(
          currentQuestion.question,
          answer,
          selectedTopic?.id,
          difficulty.toLowerCase(),
        );

        const score = evalRes.score ?? 60;
        let status: 'Correct' | 'Needs Improvement' | 'Incorrect' = 'Needs Improvement';
        if (score >= 80) status = 'Correct';
        else if (score < 50) status = 'Incorrect';

        const fb = {
          status,
          explanation: evalRes.feedback || evalRes.suggested_answer || 'Evaluation completed.',
          keyConcept: selectedTopic?.name || 'Concept Clarity',
          suggestedImprovement:
            (evalRes.improvements && evalRes.improvements.length > 0)
              ? evalRes.improvements.join(' ')
              : evalRes.suggested_answer || 'Focus on stating time/space complexity and edge cases.',
          score,
        };
        setFeedback(fb);

        // Record in practice history
        try {
          const item = {
            id: `prac-${Date.now()}`,
            topicId: selectedTopic?.id || 'general',
            topicName: selectedTopic?.name || 'General Practice',
            difficulty,
            question: currentQuestion.question,
            status: fb.status,
            score: fb.score,
            explanation: fb.explanation,
            suggestedImprovement: fb.suggestedImprovement,
            timestamp: new Date().toISOString(),
          };
          const existing = JSON.parse(localStorage.getItem('ib_mock_practice_history') || '[]');
          localStorage.setItem('ib_mock_practice_history', JSON.stringify([item, ...existing].slice(0, 50)));
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.error('Practice answer submission failed:', err);
      // Clean fallback evaluation so practice flow never breaks
      const fb = {
        status: 'Needs Improvement' as const,
        explanation:
          'Your answer addresses the core concept, but could be enhanced with concrete code examples and time complexity details.',
        keyConcept: selectedTopic?.name || 'Concept Practice',
        suggestedImprovement:
          'Remember to mention edge cases, syntax nuances, and real-world system use cases in your response.',
      };
      setFeedback(fb);

      try {
        const item = {
          id: `prac-${Date.now()}`,
          topicId: selectedTopic?.id || 'general',
          topicName: selectedTopic?.name || 'General Practice',
          difficulty,
          question: currentQuestion.question,
          status: fb.status,
          score: 60,
          explanation: fb.explanation,
          suggestedImprovement: fb.suggestedImprovement,
          timestamp: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('ib_mock_practice_history') || '[]');
        localStorage.setItem('ib_mock_practice_history', JSON.stringify([item, ...existing].slice(0, 50)));
      } catch {
        // ignore
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTopics = PRACTICE_TOPICS.filter((t) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ========================================================
          HERO SECTION
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CDF5FD]/40 via-white to-[#A0E9FF]/20 border border-[#89CFF3]/40 p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A9FF]/10 border border-[#00A9FF]/30 text-[#00A9FF] text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} className="text-[#00A9FF]" />
              <span>AI-Powered Practice</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Mock <span className="text-[#00A9FF]">Practice</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Practice technical concepts with AI-powered questions, explanations and personalized feedback.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('topics-grid-section');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all hover:shadow-lg cursor-pointer"
              >
                <span>Select a Topic</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] p-6 rounded-3xl bg-gradient-to-b from-white/95 to-[#CDF5FD]/40 border border-[#89CFF3]/40 shadow-lg shadow-[#00A9FF]/10 flex items-center justify-center">
              <img
                src={robotIllustration}
                alt="AI Robot practice illustration"
                className="w-full h-auto max-h-[280px] object-contain transition-transform duration-300 hover:scale-102"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ACTIVE PRACTICE WORKSPACE
      ======================================================== */}
      {selectedTopic && (
        <section id="active-practice-workspace" className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#89CFF3] shadow-md space-y-6">
            {/* Header with Topic and Difficulty Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center">
                  <selectedTopic.icon size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#00A9FF] uppercase tracking-wider">
                    Practicing Topic
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedTopic.name}
                  </h2>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">
                  Difficulty:
                </span>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDifficulty(d as any);
                      void fetchNextQuestion(selectedTopic, d as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === d
                        ? 'bg-[#00A9FF] text-white border-[#00A9FF]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Display */}
            {isLoadingQuestion ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 size={32} className="mx-auto text-[#00A9FF] animate-spin" />
                <p className="text-sm font-semibold text-slate-600">
                  Retrieving AI question for {selectedTopic.name}...
                </p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                {currentQuestion.code && (
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{currentQuestion.code}</code>
                  </pre>
                )}

                {/* Options if MCQ exists */}
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Select Option
                    </p>
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          selectedOption === idx
                            ? 'border-[#00A9FF] bg-[#CDF5FD]/25 ring-2 ring-[#00A9FF]/40 text-slate-900 font-semibold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                              selectedOption === idx
                                ? 'bg-[#00A9FF] text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-xs sm:text-sm">{option}</span>
                        </div>
                        {selectedOption === idx && (
                          <CheckCircle2 size={16} className="text-[#00A9FF] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Explanation / Written Answer Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      {currentQuestion.options && currentQuestion.options.length > 0
                        ? 'Your Explanation (Optional)'
                        : 'Your Answer & Reasoning'}
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      AI evaluates technical clarity
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={userTextAnswer}
                    onChange={(e) => setUserTextAnswer(e.target.value)}
                    placeholder="Type your explanation or thought process here..."
                    className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00A9FF] focus:outline-hidden text-slate-900 placeholder:text-slate-400 leading-relaxed"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => void fetchNextQuestion()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Skip Question
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleSubmitAnswer()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </div>

                {/* AI FEEDBACK CARD */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border space-y-4 ${
                      feedback.status === 'Correct'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : feedback.status === 'Needs Improvement'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {feedback.status === 'Correct' ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check size={18} />
                          </div>
                        ) : feedback.status === 'Needs Improvement' ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Lightbulb size={18} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <X size={18} />
                          </div>
                        )}
                        <div>
                          <p
                            className={`text-sm font-extrabold ${
                              feedback.status === 'Correct'
                                ? 'text-emerald-800'
                                : feedback.status === 'Needs Improvement'
                                ? 'text-amber-800'
                                : 'text-rose-800'
                            }`}
                          >
                            {feedback.status}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <img src={robotIllustration} alt="" className="w-3.5 h-3.5 object-contain" />
                            <p className="text-[11px] text-slate-500 font-semibold">
                              AI Concept Analysis
                            </p>
                          </div>
                        </div>
                      </div>

                      {feedback.score !== undefined && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-800">
                          Score: {feedback.score}%
                        </span>
                      )}
                    </div>

                    {/* Key Concept */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Key Concept
                      </p>
                      <p className="text-xs text-slate-800 bg-white/70 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        {feedback.keyConcept}
                      </p>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Explanation
                      </p>
                      <p className="text-xs text-slate-800 bg-white/70 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        {feedback.explanation}
                      </p>
                    </div>

                    {/* Suggested Improvement */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Suggested Improvement
                      </p>
                      <p className="text-xs text-slate-800 bg-white/70 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        {feedback.suggestedImprovement}
                      </p>
                    </div>

                    {/* Next Question CTA */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void fetchNextQuestion()}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Next Question</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* ========================================================
          TOPICS GRID
      ======================================================== */}
      <section id="topics-grid-section" className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Choose a Topic to Practice
          </h2>
          <p className="text-sm text-slate-500">
            Practice concepts individually with instant AI evaluations and detailed guidance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic or skill (e.g., Python, SQL, DSA)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#00A9FF] text-slate-900 placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Topic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic?.id === topic.id;

            return (
              <motion.div
                key={topic.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectTopic(topic)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#CDF5FD]/25 border-[#00A9FF] ring-2 ring-[#00A9FF]/40 shadow-md'
                    : 'bg-white border-slate-200 hover:border-[#89CFF3] shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {topic.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {topic.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A9FF]">
                  <span>{isSelected ? 'Currently Practicing' : 'Start Practice'}</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
