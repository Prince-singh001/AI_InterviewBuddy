import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Check,
  X,
  Building2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  interviewsApi,
  type InterviewListItem,
} from '@/services/apiService';

import {
  formatDate,
  getScoreBadgeClass,
  getScoreColor,
  getScoreLabel,
} from '@/lib/utils';
import type { TestAttempt } from '@/pages/MockTest';
import { historyHeroMockup, historyEmptyIllustration } from '@/assets/illustrations';
import CompanyLogo from '@/components/common/CompanyLogo';

export interface PracticeHistoryItem {
  id: string;
  topicId: string;
  topicName: string;
  difficulty: string;
  question: string;
  status: 'Correct' | 'Needs Improvement' | 'Incorrect';
  score?: number;
  explanation: string;
  suggestedImprovement?: string;
  timestamp: string;
}

export type HistoryFilterType = 'all' | 'interviews' | 'tests' | 'practice';

interface UnifiedHistoryRecord {
  id: string;
  sessionType: 'Mock Interview' | 'Mock Test' | 'Practice';
  filterCategory: 'interviews' | 'tests' | 'practice';
  role: string;
  company?: string;
  date: string;
  timestamp: number;
  status: 'Completed' | 'In Progress' | 'Incomplete';
  score?: number | null;
  rawInterview?: InterviewListItem;
  rawTest?: TestAttempt;
  rawPractice?: PracticeHistoryItem;
}

export default function Interviews() {
  const navigate = useNavigate();

  // Filters State: 'all' | 'interviews' | 'tests' | 'practice'
  const [activeFilter, setActiveFilter] = useState<HistoryFilterType>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  // Test Review Modal State
  const [selectedTestReview, setSelectedTestReview] = useState<TestAttempt | null>(null);
  // Practice Review Modal State
  const [selectedPracticeReview, setSelectedPracticeReview] = useState<PracticeHistoryItem | null>(null);

  // 1. Mock Interviews from Backend API (strictly real data)
  const {
    data: interviews = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InterviewListItem[]>({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // 2. Mock Tests from Local Storage (strictly real completed attempts)
  const testAttempts = useMemo<TestAttempt[]>(() => {
    try {
      const stored = localStorage.getItem('ib_mock_test_attempts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // 3. Mock Practice from Local Storage (strictly real practice attempts)
  const practiceItems = useMemo<PracticeHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('ib_mock_practice_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // ------------------------------------------------------------
  // UNIFIED RECORD MAPPING (Only actual recorded data)
  // ------------------------------------------------------------
  const unifiedRecords = useMemo<UnifiedHistoryRecord[]>(() => {
    const list: UnifiedHistoryRecord[] = [];

    // Map interviews
    interviews.forEach((i) => {
      let status: 'Completed' | 'In Progress' | 'Incomplete' = 'Incomplete';
      if (i.status === 'completed') status = 'Completed';
      else if (i.status === 'in_progress' || i.status === 'active') status = 'In Progress';

      list.push({
        id: `interview-${i.id}`,
        sessionType: 'Mock Interview',
        filterCategory: 'interviews',
        role: i.role || 'Software Engineer',
        company: (i as any).company_name || (i as any).company || undefined,
        date: i.created_at,
        timestamp: new Date(i.created_at).getTime() || 0,
        status,
        score: i.score ?? null,
        rawInterview: i,
      });
    });

    // Map tests
    testAttempts.forEach((t) => {
      list.push({
        id: `test-${t.id || t.timestamp}`,
        sessionType: 'Mock Test',
        filterCategory: 'tests',
        role: t.role || 'Assessment',
        company: (t as any).company || undefined,
        date: t.timestamp,
        timestamp: new Date(t.timestamp).getTime() || 0,
        status: 'Completed',
        score: t.score,
        rawTest: t,
      });
    });

    // Map practice
    practiceItems.forEach((p) => {
      list.push({
        id: `practice-${p.id || p.timestamp}`,
        sessionType: 'Practice',
        filterCategory: 'practice',
        role: p.topicName || 'Technical Practice',
        company: undefined,
        date: p.timestamp,
        timestamp: new Date(p.timestamp).getTime() || 0,
        status: p.status === 'Correct' ? 'Completed' : 'Incomplete',
        score: p.score ?? (p.status === 'Correct' ? 100 : p.status === 'Needs Improvement' ? 65 : 30),
        rawPractice: p,
      });
    });

    return list;
  }, [interviews, testAttempts, practiceItems]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return unifiedRecords
      .filter((rec) => {
        // Tab category filter
        if (activeFilter !== 'all' && rec.filterCategory !== activeFilter) {
          return false;
        }

        // Search filter
        if (q) {
          const matchRole = rec.role.toLowerCase().includes(q);
          const matchType = rec.sessionType.toLowerCase().includes(q);
          const matchCompany = rec.company ? rec.company.toLowerCase().includes(q) : false;
          if (!matchRole && !matchType && !matchCompany) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return b.timestamp - a.timestamp;
        }
        return (b.score ?? 0) - (a.score ?? 0);
      });
  }, [unifiedRecords, activeFilter, search, sortBy]);

  // Overall Statistics from actual backend / storage records
  const totalCount = unifiedRecords.length;
  const completedCount = unifiedRecords.filter((r) => r.status === 'Completed').length;
  const recordsWithScores = unifiedRecords.filter((r) => r.score !== null && r.score !== undefined);
  const averageScore = recordsWithScores.length
    ? Math.round(recordsWithScores.reduce((acc, r) => acc + (r.score ?? 0), 0) / recordsWithScores.length)
    : 0;

  // ------------------------------------------------------------
  // LOADING / ERROR STATES
  // ------------------------------------------------------------
  if (isLoading && unifiedRecords.length === 0) {
    return (
      <div style={{ width: '100%', maxWidth: 1140, margin: '0 auto', padding: '1rem 0 3rem' }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 24, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError && unifiedRecords.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="card"
          style={{ width: '100%', maxWidth: 480, textAlign: 'center', padding: '3rem 2rem' }}
        >
          <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)' }}>
            <AlertCircle size={30} style={{ color: 'var(--red)' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
            Unable to load interview history
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Please check your connection and try again.
          </p>
          <button onClick={() => refetch()} className="btn btn-primary" style={{ gap: 8, margin: '0 auto' }}>
            <RefreshCw size={16} />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 1140, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ======================================================
          5. HISTORY HERO SECTION (Professional & Realistic Visual)
      ====================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CDF5FD]/40 via-white to-[#A0E9FF]/20 border border-[#89CFF3]/40 p-6 sm:p-10 shadow-sm mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Heading, subtitle, and primary actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A9FF]/10 border border-[#00A9FF]/30 text-[#00A9FF] text-xs font-bold tracking-wide uppercase">
              <Clock size={13} className="text-[#00A9FF]" />
              <span>Session History</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your <span className="text-[#00A9FF]">Interview History</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Review your previous interviews, practice sessions and assessments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/practice/mock-interview')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all cursor-pointer"
              >
                <Zap size={16} />
                <span>Start Interview</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/practice/mock-tests')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <Award size={16} className="text-[#00A9FF]" />
                <span>Take Mock Test</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Subtle Professional Activity/Timeline Visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={historyHeroMockup}
                alt="Interview activity history illustration"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-md"
                style={{ width: '100%', height: 'auto', maxHeight: 310, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SUMMARY STATS BAR (Real Recorded Data Only)
      ====================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Recorded Sessions</div>
            <div className="text-xl font-extrabold text-slate-900">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Completed Sessions</div>
            <div className="text-xl font-extrabold text-slate-900">{completedCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Average Performance</div>
            <div className="text-xl font-extrabold text-slate-900">
              {averageScore > 0 ? `${averageScore}%` : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          6. HISTORY FILTERS (All, Mock Interviews, Mock Tests, Practice)
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Clean Pill / Tab Controls */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 max-w-full overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: unifiedRecords.length },
            { id: 'interviews', label: 'Mock Interviews', count: interviews.length },
            { id: 'tests', label: 'Mock Tests', count: testAttempts.length },
            { id: 'practice', label: 'Practice', count: practiceItems.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as HistoryFilterType)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-white text-[#00A9FF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === tab.id
                    ? 'bg-[#CDF5FD] text-[#00A9FF]'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Area */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search role or type..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#00A9FF]"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setSortBy('date')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                sortBy === 'date' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Date
            </button>
            <button
              type="button"
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                sortBy === 'score' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Score
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          7. HISTORY CARDS & 8. EMPTY STATE
      ====================================================== */}
      {filteredRecords.length === 0 ? (
        /* ====================================================
           8. HISTORY EMPTY STATE (Clean SVG, No Cartoon/Robots)
        ==================================================== */
        <div className="p-12 sm:p-16 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <div className="w-28 h-24 mx-auto mb-4 flex items-center justify-center">
            <img
              src={historyEmptyIllustration}
              alt="No interview history yet"
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No interview history yet
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Start your first mock interview or assessment to begin building your preparation history.
          </p>

          <button
            type="button"
            onClick={() => navigate('/practice/mock-interview')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00A9FF]/20 cursor-pointer"
          >
            <Zap size={15} />
            <span>Start Interview</span>
          </button>
        </div>
      ) : (
        /* ====================================================
           7. HISTORY RECORD CARDS
        ==================================================== */
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const hasScore = record.score !== null && record.score !== undefined;
            const scoreNum = hasScore ? Math.round(record.score as number) : null;
            const isCompleted = record.status === 'Completed';

            return (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#89CFF3] shadow-xs transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Left info: Role, Session type, Company, Date, Status */}
                <div className="flex items-start gap-4 min-w-0">
                  {/* Company Logo or Session Type Icon */}
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {record.company ? (
                      <CompanyLogo name={record.company} size={28} showName={false} />
                    ) : record.sessionType === 'Mock Interview' ? (
                      <MessageSquare size={22} className="text-[#00A9FF]" />
                    ) : record.sessionType === 'Mock Test' ? (
                      <Award size={22} className="text-amber-500" />
                    ) : (
                      <BookOpen size={22} className="text-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {record.role}
                      </h4>

                      {/* Session Type Badge */}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {record.sessionType}
                      </span>

                      {/* Company Name if present */}
                      {record.company && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#00A9FF]">
                          {record.company}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {formatDate(record.date)}
                      </span>

                      {/* Status Badge (Subtle badges as specified: Completed, In Progress, Incomplete) */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : record.status === 'In Progress'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        {record.status === 'Completed' && <CheckCircle2 size={11} />}
                        {record.status === 'In Progress' && <Clock size={11} />}
                        {record.status === 'Incomplete' && <XCircle size={11} />}
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right info: Score + Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {scoreNum !== null && (
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Result</div>
                      <div
                        className="text-base font-extrabold"
                        style={{ color: getScoreColor(scoreNum) }}
                      >
                        {scoreNum}%
                      </div>
                    </div>
                  )}

                  {/* View Details button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (record.rawInterview) {
                          if (record.status === 'Completed') {
                            navigate(`/interview/complete/${record.rawInterview.id}`);
                          } else {
                            navigate('/practice/mock-interview');
                          }
                        } else if (record.rawTest) {
                          setSelectedTestReview(record.rawTest);
                        } else if (record.rawPractice) {
                          setSelectedPracticeReview(record.rawPractice);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    {record.sessionType === 'Mock Interview' && isCompleted && (
                      <button
                        type="button"
                        onClick={() => navigate('/practice/mock-interview')}
                        title="Retake Interview"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================
          MODAL: TEST REVIEW
      ====================================================== */}
      <AnimatePresence>
        {selectedTestReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedTestReview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedTestReview.role} Mock Test Review
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Difficulty: {selectedTestReview.difficulty} • Score: {selectedTestReview.score}% • Total: {selectedTestReview.totalQuestions} questions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTestReview(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedTestReview.questions && selectedTestReview.questions.length > 0 ? (
                  selectedTestReview.questions.map((qItem, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs ${
                        qItem.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5 font-bold">
                        <span className="text-slate-900">Q{idx + 1}: {qItem.question.question}</span>
                        <span className={`text-[10px] shrink-0 font-bold ${qItem.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {qItem.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <div className="text-slate-600 mb-1">
                        <strong>Your Answer:</strong>{' '}
                        {qItem.selectedOption !== null && qItem.question.options
                          ? qItem.question.options[qItem.selectedOption] || `Option ${qItem.selectedOption + 1}`
                          : 'Unanswered'}
                      </div>
                      {qItem.explanation && (
                        <div className="p-2 rounded bg-white border border-slate-200 text-slate-600 mt-1.5">
                          <strong>Explanation:</strong> {qItem.explanation}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No question breakdown recorded for this attempt.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTestReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          MODAL: PRACTICE REVIEW
      ====================================================== */}
      <AnimatePresence>
        {selectedPracticeReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedPracticeReview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPracticeReview.topicName} Practice Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Difficulty: {selectedPracticeReview.difficulty} • Date: {formatDate(selectedPracticeReview.timestamp)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPracticeReview(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-900 mb-1">Question</div>
                  <p>{selectedPracticeReview.question}</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="font-bold text-[#00A9FF] mb-1">AI Feedback &amp; Insight</div>
                  <p>{selectedPracticeReview.explanation}</p>
                </div>

                {selectedPracticeReview.suggestedImprovement && (
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="font-bold text-amber-700 mb-1">Suggested Improvement</div>
                    <p>{selectedPracticeReview.suggestedImprovement}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPracticeReview(null);
                    navigate('/practice/mock-practice');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00A9FF] text-white text-xs font-semibold cursor-pointer"
                >
                  Practice Topic Again
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPracticeReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}