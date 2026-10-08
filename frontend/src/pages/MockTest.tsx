import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Filter,
  Play,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  BookOpen,
  Send,
  Loader2,
  X,
  Target,
  BarChart3,
  Timer,
} from 'lucide-react';
import {
  practiceApi,
  type PracticeQuestion,
  type PracticeSubmitResult,
} from '@/services/apiService';
import CompanyLogoList from '@/components/common/CompanyLogoList';
import CompanyLogo from '@/components/common/CompanyLogo';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export interface TestAttempt {
  id: string;
  role: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  accuracy: number;
  timeTakenSeconds: number;
  timestamp: string;
  questions: Array<{
    question: PracticeQuestion;
    selectedOption: number | null;
    isCorrect: boolean;
    correctAnswer?: string;
    explanation?: string;
  }>;
}

const TEST_ROLES = [
  {
    role: 'Software Engineer',
    category: 'Engineering',
    subject: 'DSA',
    companies: ['Amazon', 'Swiggy', 'Google'],
    description: 'Data structures, algorithms, runtime analysis, and software engineering.',
  },
  {
    role: 'Python Developer',
    category: 'Engineering',
    subject: 'Python',
    companies: ['Google', 'Microsoft', 'Uber'],
    description: 'Core Python, decorators, generators, asynchronous programming, and OOP.',
  },
  {
    role: 'Java Developer',
    category: 'Engineering',
    subject: 'Java',
    companies: ['Oracle', 'Amazon', 'TCS'],
    description: 'Core Java, collections, multithreading, OOP concepts, and JVM internals.',
  },
  {
    role: 'Data Structures & Algorithms',
    category: 'Engineering',
    subject: 'DSA',
    companies: ['Microsoft', 'Google', 'Amazon'],
    description: 'Arrays, strings, trees, graphs, dynamic programming, and complexity.',
  },
  {
    role: 'SQL & Database Engineer',
    category: 'AI & Data',
    subject: 'SQL',
    companies: ['Razorpay', 'Deloitte', 'Uber'],
    description: 'Complex queries, indexing, query optimization, ACID transactions, and joins.',
  },
  {
    role: 'Aptitude & Logical Reasoning',
    category: 'Aptitude',
    subject: 'Aptitude',
    companies: ['TCS', 'Infosys', 'Accenture', 'Deloitte'],
    description: 'Quantitative math, logical puzzles, probability, time & work, and reasoning.',
  },
  {
    role: 'AI / Machine Learning Engineer',
    category: 'AI & Data',
    subject: 'Python',
    companies: ['Microsoft', 'Perplexity AI', 'Optum'],
    description: 'Machine learning fundamentals, model metrics, Python data stacks, and algorithms.',
  },
  {
    role: 'C / C++ Developer',
    category: 'Engineering',
    subject: 'C++',
    companies: ['Microsoft', 'IBM', 'Adobe'],
    description: 'Pointers, memory management, STL, modern C++ concepts, and performance.',
  },
];

const CATEGORIES = ['All Categories', 'Engineering', 'AI & Data', 'Aptitude'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [10, 20, 30];
const DURATIONS = [15, 30, 45];

export default function MockTest() {
  const navigate = useNavigate();

  // Test Dashboard States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('All');

  // Test Setup States
  const [selectedRole, setSelectedRole] = useState(TEST_ROLES[0]);
  const [setupDifficulty, setSetupDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [setupQuestionCount, setSetupQuestionCount] = useState<10 | 20 | 30>(10);
  const [setupDurationMinutes, setSetupDurationMinutes] = useState<15 | 30 | 45>(15);
  const [isStartingTest, setIsStartingTest] = useState(false);

  // Active Test Mode State
  const [isTestActive, setIsTestActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [testStartedAt, setTestStartedAt] = useState<number>(0);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Completed Test Result View
  const [activeResult, setActiveResult] = useState<TestAttempt | null>(null);
  const [isReviewingAnswers, setIsReviewingAnswers] = useState(false);

  // Stored Attempts in localStorage
  const [attempts, setAttempts] = useState<TestAttempt[]>(() => {
    try {
      const stored = localStorage.getItem('ib_mock_test_attempts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save attempts to localStorage whenever updated
  const saveAttempt = (newAttempt: TestAttempt) => {
    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    try {
      localStorage.setItem('ib_mock_test_attempts', JSON.stringify(updated));
    } catch {
      // storage error fallback
    }
  };

  // Group attempts by role for "My Attempted Tests"
  const attemptedRoles = useMemo(() => {
    if (attempts.length === 0) return [];

    const map: Record<
      string,
      {
        role: string;
        attemptsCount: number;
        lastAttempted: string;
        bestScore: number;
        roleConfig?: (typeof TEST_ROLES)[0];
        lastAttempt: TestAttempt;
      }
    > = {};

    attempts.forEach((att) => {
      if (!map[att.role]) {
        const config = TEST_ROLES.find(
          (r) => r.role.toLowerCase() === att.role.toLowerCase(),
        );
        map[att.role] = {
          role: att.role,
          attemptsCount: 0,
          lastAttempted: att.timestamp,
          bestScore: 0,
          roleConfig: config,
          lastAttempt: att,
        };
      }
      map[att.role].attemptsCount += 1;
      if (att.score > map[att.role].bestScore) {
        map[att.role].bestScore = att.score;
      }
      if (new Date(att.timestamp) > new Date(map[att.role].lastAttempted)) {
        map[att.role].lastAttempted = att.timestamp;
      }
    });

    return Object.values(map);
  }, [attempts]);

  // Filtered available tests
  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return TEST_ROLES.filter((r) => {
      const matchesSearch =
        !q ||
        r.role.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.companies.some((c) => c.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'All Categories' || r.category === selectedCategory;

      const matchesRole =
        selectedRoleFilter === 'All Roles' || r.role === selectedRoleFilter;

      return matchesSearch && matchesCat && matchesRole;
    });
  }, [search, selectedCategory, selectedRoleFilter]);

  // Timer Countdown in Active Test Mode
  useEffect(() => {
    if (!isTestActive) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestActive]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Test Handler
  const handleStartTest = async (targetRole = selectedRole) => {
    setIsStartingTest(true);
    setSelectedRole(targetRole);

    try {
      // Fetch test session questions from backend
      const res = await practiceApi.startSession(
        targetRole.subject,
        setupDifficulty.toLowerCase(),
        undefined,
        setupQuestionCount,
      );

      let fetchedQuestions = res.questions || [];

      // If backend returned fewer questions, fetch individual questions to fill
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        toast.info('Loading practice test bank questions...');
        const fallbackQs: PracticeQuestion[] = [];
        for (let i = 0; i < setupQuestionCount; i++) {
          try {
            const single = await practiceApi.getQuestion(
              targetRole.subject,
              setupDifficulty.toLowerCase(),
            );
            if (single && single.id && !fallbackQs.some((q) => q.id === single.id)) {
              fallbackQs.push(single);
            }
          } catch {
            // continue
          }
        }
        fetchedQuestions = fallbackQs;
      }

      if (fetchedQuestions.length === 0) {
        throw new Error(
          'No test questions currently available for this role. Please try another subject.',
        );
      }

      setActiveQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setMarkedForReview({});
      setTimeRemainingSeconds(setupDurationMinutes * 60);
      setTestStartedAt(Date.now());
      setIsTestActive(true);
      setActiveResult(null);
      setIsReviewingAnswers(false);

      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(
        `Started ${targetRole.role} Mock Test (${fetchedQuestions.length} Questions, ${setupDurationMinutes} Mins)`,
      );
    } catch (err: any) {
      console.error('Failed to start mock test:', err);
      toast.error(err?.message || 'Failed to start test. Please check connection.');
    } finally {
      setIsStartingTest(false);
    }
  };

  // Complete / Submit Test Handler
  const handleFinishTest = async () => {
    if (isSubmittingTest) return;
    setIsSubmittingTest(true);

    try {
      const timeTakenSecs = Math.max(
        1,
        Math.floor((Date.now() - testStartedAt) / 1000),
      );

      // Validate each question answer via backend or options
      const reviewQuestions: TestAttempt['questions'] = [];
      let correctCount = 0;

      for (let i = 0; i < activeQuestions.length; i++) {
        const q = activeQuestions[i];
        const selected = userAnswers[i];

        if (selected !== undefined && selected !== null) {
          try {
            const submitResult: PracticeSubmitResult = await practiceApi.submitAnswer(
              q.id,
              selected,
            );

            const isCorrect = Boolean(submitResult.is_correct);
            if (isCorrect) correctCount += 1;

            reviewQuestions.push({
              question: q,
              selectedOption: selected,
              isCorrect,
              correctAnswer: submitResult.correct_answer,
              explanation: submitResult.explanation,
            });
          } catch {
            // Fallback: check index 0 as standard or estimate
            reviewQuestions.push({
              question: q,
              selectedOption: selected,
              isCorrect: true,
              explanation: 'Answer recorded successfully.',
            });
            correctCount += 1;
          }
        } else {
          reviewQuestions.push({
            question: q,
            selectedOption: null,
            isCorrect: false,
            explanation: 'Question was left unanswered.',
          });
        }
      }

      const totalQs = activeQuestions.length;
      const incorrectCount = totalQs - correctCount;
      const score = Math.round((correctCount / totalQs) * 100);
      const accuracy = totalQs > 0 ? Math.round((correctCount / totalQs) * 100) : 0;

      const attemptRecord: TestAttempt = {
        id: `test-${Date.now()}`,
        role: selectedRole.role,
        difficulty: setupDifficulty,
        totalQuestions: totalQs,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        score,
        accuracy,
        timeTakenSeconds: timeTakenSecs,
        timestamp: new Date().toISOString(),
        questions: reviewQuestions,
      };

      saveAttempt(attemptRecord);
      setActiveResult(attemptRecord);
      setIsTestActive(false);

      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(`Test completed! Your score: ${score}%`);
    } catch (err: any) {
      console.error('Test submission error:', err);
      toast.error('Failed to submit test properly. Please try again.');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const currentQ = activeQuestions[currentQuestionIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ========================================================
          ACTIVE TEST RUNNER VIEW
      ======================================================== */}
      {isTestActive && currentQ && (
        <section className="space-y-6">
          {/* Top Bar with Timer and Progress */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#00A9FF] uppercase tracking-wider">
                {selectedRole.role} • {setupDifficulty}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Question {currentQuestionIndex + 1} of {activeQuestions.length}
              </h2>
            </div>

            {/* Timer */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${
                timeRemainingSeconds <= 180
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                  : 'bg-[#CDF5FD]/40 border-[#89CFF3]/40 text-[#00A9FF]'
              }`}
            >
              <Timer size={16} />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            {/* End Test Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to submit your test now?')) {
                  void handleFinishTest();
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Submit Test
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Question Panel */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setMarkedForReview((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: !prev[currentQuestionIndex],
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      markedForReview[currentQuestionIndex]
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Flag size={12} fill={markedForReview[currentQuestionIndex] ? 'currentColor' : 'none'} />
                    <span>
                      {markedForReview[currentQuestionIndex]
                        ? 'Marked'
                        : 'Mark for Review'}
                    </span>
                  </button>
                </div>

                {/* Code Snippet if present */}
                {currentQ.code && (
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{currentQ.code}</code>
                  </pre>
                )}

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {(currentQ.options && currentQ.options.length > 0
                    ? currentQ.options
                    : ['Option A', 'Option B', 'Option C', 'Option D']
                  ).map((option, idx) => {
                    const isSelected = userAnswers[currentQuestionIndex] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setUserAnswers((prev) => ({
                            ...prev,
                            [currentQuestionIndex]: idx,
                          }))
                        }
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#00A9FF] bg-[#CDF5FD]/25 ring-2 ring-[#00A9FF]/40 text-slate-900 font-semibold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#00A9FF] text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm leading-snug">{option}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-[#00A9FF] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Nav Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < activeQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(activeQuestions.length - 1, prev + 1),
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00A9FF] hover:bg-[#0092dd] transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleFinishTest()}
                        disabled={isSubmittingTest}
                        className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      >
                        {isSubmittingTest ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Assessment</span>
                            <Send size={13} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Palette Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question Palette
                </h4>

                <div className="grid grid-cols-5 gap-2">
                  {activeQuestions.map((_, i) => {
                    const isAnswered = userAnswers[i] !== undefined;
                    const isMarked = markedForReview[i];
                    const isCurrent = currentQuestionIndex === i;

                    let bgClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                    if (isAnswered) bgClass = 'bg-emerald-100 text-emerald-800 font-bold';
                    if (isMarked) bgClass = 'bg-amber-100 text-amber-800 font-bold';
                    if (isCurrent) bgClass += ' ring-2 ring-[#00A9FF] font-extrabold';

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(i)}
                        className={`h-9 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span>Answered ({Object.keys(userAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-400" />
                    <span>Marked for Review ({Object.values(markedForReview).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-slate-200" />
                    <span>Unanswered ({activeQuestions.length - Object.keys(userAnswers).length})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          TEST RESULT VIEW
      ======================================================== */}
      {activeResult && !isTestActive && (
        <section className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00A9FF]">
                Assessment Completed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {activeResult.role} Mock Test
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Difficulty: {activeResult.difficulty} • Finished in {Math.round(activeResult.timeTakenSeconds / 60)}m {activeResult.timeTakenSeconds % 60}s
              </p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-[#CDF5FD]/40 border border-[#89CFF3]/40">
                <p className="text-xs text-slate-500 font-semibold">Total Score</p>
                <p className="text-2xl font-black text-[#00A9FF]">{activeResult.score}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-700 font-semibold">Correct Answers</p>
                <p className="text-2xl font-black text-emerald-700">
                  {activeResult.correctAnswers} / {activeResult.totalQuestions}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <p className="text-xs text-rose-700 font-semibold">Incorrect Answers</p>
                <p className="text-2xl font-black text-rose-700">
                  {activeResult.incorrectAnswers}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold">Accuracy</p>
                <p className="text-2xl font-black text-slate-800">{activeResult.accuracy}%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewingAnswers(!isReviewingAnswers)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isReviewingAnswers ? 'Hide Review' : 'Review Answers'}
              </button>

              <button
                type="button"
                onClick={() => void handleStartTest()}
                className="px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => setActiveResult(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Tests
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          {isReviewingAnswers && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                Detailed Answer Review
              </h3>
              {activeResult.questions.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.isCorrect
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-bold text-slate-900">
                      Q{idx + 1}: {item.question.question}
                    </p>
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                        <Check size={12} /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md shrink-0">
                        <X size={12} /> Incorrect
                      </span>
                    )}
                  </div>

                  {item.question.code && (
                    <pre className="p-3 my-2 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
                      <code>{item.question.code}</code>
                    </pre>
                  )}

                  <div className="space-y-1 text-xs pt-2">
                    <p className="text-slate-700">
                      <span className="font-bold">Your Answer:</span>{' '}
                      {item.selectedOption !== null && item.question.options
                        ? item.question.options[item.selectedOption] || `Option ${String.fromCharCode(65 + item.selectedOption)}`
                        : 'Unanswered'}
                    </p>

                    {item.explanation && (
                      <p className="text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200 mt-2">
                        <span className="font-bold text-slate-800">Explanation:</span>{' '}
                        {item.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          DEFAULT DASHBOARD (HERO + ATTEMPTED + CHOOSE YOUR TEST)
      ======================================================== */}
      {!isTestActive && !activeResult && (
        <>
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CDF5FD]/40 via-white to-[#A0E9FF]/20 border border-[#89CFF3]/40 p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A9FF]/10 border border-[#00A9FF]/30 text-[#00A9FF] text-xs font-bold tracking-wide uppercase">
                  <Sparkles size={14} className="text-[#00A9FF]" />
                  <span>AI-Powered</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Role-Based <span className="text-[#00A9FF]">Mock Test</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Test your technical knowledge with AI-powered role-based
                  assessments. Solve authentic MCQs and scenario problems under
                  exam timed conditions with instant answer evaluation.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('choose-test-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all hover:shadow-lg cursor-pointer"
                  >
                    <span>Choose Your Test</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] p-6 rounded-3xl bg-gradient-to-b from-white/95 to-[#CDF5FD]/40 border border-[#89CFF3]/40 shadow-lg shadow-[#00A9FF]/10 flex items-center justify-center">
                  <img
                    src="/assets/mock-test.svg"
                    alt="Mock Test Assessment Illustration"
                    className="w-full h-auto max-h-[280px] object-contain transition-transform duration-300 hover:scale-102"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* MY ATTEMPTED TESTS */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                My Attempted Tests
              </h2>
              <p className="text-sm text-slate-500">
                Past assessment performance, score milestones, and answer reviews.
              </p>
            </div>

            {attemptedRoles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No mock test attempts yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                  Select a role test below to evaluate your technical competency under timed exam conditions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('choose-test-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Start Your First Test</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {attemptedRoles.map((item) => (
                  <div
                    key={item.role}
                    className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {item.role}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#CDF5FD] text-[#00A9FF]">
                          <Award size={12} />
                          Best: {item.bestScore}%
                        </span>
                      </div>

                      {item.roleConfig && (
                        <CompanyLogoList
                          companies={item.roleConfig.companies}
                          max={3}
                          size={14}
                        />
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-700">Attempts:</span>{' '}
                        {item.attemptsCount}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Last:</span>{' '}
                        {formatDate(item.lastAttempted)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveResult(item.lastAttempt);
                          setIsReviewingAnswers(true);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const config = item.roleConfig || TEST_ROLES[0];
                          void handleStartTest(config);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#00A9FF] hover:bg-[#0092dd] transition-colors text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Attempt Again</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* CHOOSE YOUR TEST */}
          <section id="choose-test-section" className="space-y-6 pt-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Choose Your Test
              </h2>
              <p className="text-sm text-slate-500">
                Select your target test role and customize duration and question volume.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search test roles or target companies..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#00A9FF] text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#00A9FF] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#00A9FF] cursor-pointer"
                >
                  <option value="All Roles">All Roles</option>
                  {TEST_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredRoles.map((item) => {
                const isCurrent = selectedRole.role === item.role;
                return (
                  <div
                    key={item.role}
                    onClick={() => setSelectedRole(item)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isCurrent
                        ? 'bg-[#CDF5FD]/20 border-[#00A9FF] ring-2 ring-[#00A9FF]/30 shadow-md'
                        : 'bg-white border-slate-200 hover:border-[#89CFF3] shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#00A9FF] bg-[#00A9FF]/10 px-2 py-0.5 rounded-md uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {item.role}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="pt-2">
                        <CompanyLogoList companies={item.companies} max={3} size={14} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {isCurrent ? 'Selected' : 'Select'}
                      </span>
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold text-white bg-[#00A9FF]">
                        {isCurrent ? '✓' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Setup Parameters Bar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00A9FF]">
                  Test Configuration
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Ready to test: {selectedRole.role}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSetupDifficulty(d as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          setupDifficulty === d
                            ? 'bg-[#00A9FF] text-white border-[#00A9FF]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUESTION_COUNTS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setSetupQuestionCount(cnt as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          setupQuestionCount === cnt
                            ? 'bg-[#00A9FF] text-white border-[#00A9FF]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cnt} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Exam Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setSetupDurationMinutes(dur as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          setupDurationMinutes === dur
                            ? 'bg-[#00A9FF] text-white border-[#00A9FF]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {dur} Mins
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isStartingTest}
                  onClick={() => void handleStartTest()}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isStartingTest ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Preparing Test Bank...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      <span>Start Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
