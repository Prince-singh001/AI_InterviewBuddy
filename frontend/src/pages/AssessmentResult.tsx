import StickyBackButton from "@/components/practice/StickyBackButton";
import { AssessmentEvaluation } from "@/types/assessment";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type FilterType = "all" | "correct" | "incorrect" | "unanswered";

const BLUE = {
  light: "#E3F2FD",
  soft: "#90CAF9",
  primary: "#2196F3",
  deep: "#0D47A1",
  white: "#FFFFFF",
};

export default function AssessmentResult() {
  const location = useLocation();

  /* -------------------------------------------------------
     RESULT
  ------------------------------------------------------- */

  const result: AssessmentEvaluation | null = useMemo(() => {
    if (location.state?.result) {
      return location.state.result as AssessmentEvaluation;
    }

    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("assessment_result_"),
      );

      if (keys.length > 0) {
        const lastKey = keys[keys.length - 1];
        const data = localStorage.getItem(lastKey);

        if (data) {
          return JSON.parse(data) as AssessmentEvaluation;
        }
      }
    } catch {
      // Ignore localStorage parsing errors.
    }

    return null;
  }, [location.state]);

  const [filterType, setFilterType] = useState<FilterType>("all");

  /* -------------------------------------------------------
     EMPTY RESULT
  ------------------------------------------------------- */

  if (!result) {
    return (
      <>
        <style>{`
          .assessment-result-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at 10% 10%, rgba(144, 202, 249, 0.20), transparent 30%),
              radial-gradient(circle at 90% 20%, rgba(33, 150, 243, 0.10), transparent 28%),
              linear-gradient(180deg, #E3F2FD 0%, #F7FBFF 42%, #FFFFFF 100%);
            color: #0D47A1;
          }

          .result-empty-card {
            background: rgba(255,255,255,0.94);
            border: 1px solid rgba(33,150,243,0.18);
            box-shadow:
              0 20px 60px rgba(13,71,161,0.10),
              0 4px 18px rgba(33,150,243,0.08);
            backdrop-filter: blur(16px);
          }

          .result-primary-btn {
            background: #2196F3;
            color: white;
            box-shadow: 0 8px 22px rgba(33,150,243,0.24);
          }

          .result-primary-btn:hover {
            background: #0D47A1;
            transform: translateY(-1px);
          }

          .result-primary-btn:focus-visible,
          .result-secondary-btn:focus-visible,
          .result-filter-btn:focus-visible {
            outline: 3px solid rgba(33,150,243,0.25);
            outline-offset: 2px;
          }

          .assessment-watermark {
            position: fixed;
            right: 18px;
            bottom: 14px;
            z-index: 20;
            pointer-events: none;
            user-select: none;
            color: rgba(13,71,161,0.12);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          @media (max-width: 640px) {
            .assessment-watermark {
              right: 10px;
              bottom: 9px;
              font-size: 9px;
            }
          }
        `}</style>

        <div className="assessment-result-page min-h-screen px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            <StickyBackButton
              label="Back to Assessment"
              to="/practice/assessment"
            />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="result-empty-card mt-5 rounded-[28px] p-7 text-center sm:p-10"
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: BLUE.light,
                  color: BLUE.primary,
                  border: `1px solid ${BLUE.soft}`,
                }}
              >
                <HelpCircle size={34} />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight text-[#0D47A1] sm:text-2xl">
                No Assessment Result Available
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Please complete an assessment test first to view your score
                report and detailed question analytics.
              </p>

              <Link
                to="/practice/assessment"
                className="result-primary-btn mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all"
              >
                Go to Assessments
                <ChevronRight size={17} />
              </Link>
            </motion.div>
          </div>

          <div className="assessment-watermark">AI InterviewBuddy</div>
        </div>
      </>
    );
  }

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  const formatSeconds = (sec: number) => {
    const safeSeconds = Math.max(0, Number(sec) || 0);
    const mins = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;

    return `${mins}m ${remaining}s`;
  };

  const totalQuestions = result.questions.length;

  const accuracy =
    totalQuestions > 0
      ? Math.round((result.correctAnswers / totalQuestions) * 100)
      : 0;

  const filteredQuestions = result.questions.filter((question) => {
    if (filterType === "correct") {
      return question.isCorrect;
    }

    if (filterType === "incorrect") {
      return !question.isCorrect && question.selectedOption !== null;
    }

    if (filterType === "unanswered") {
      return question.selectedOption === null;
    }

    return true;
  });

  const filters: {
    label: string;
    value: FilterType;
    count: number;
  }[] = [
    {
      label: "All",
      value: "all",
      count: totalQuestions,
    },
    {
      label: "Correct",
      value: "correct",
      count: result.correctAnswers,
    },
    {
      label: "Incorrect",
      value: "incorrect",
      count: result.incorrectAnswers,
    },
    {
      label: "Unanswered",
      value: "unanswered",
      count: result.unanswered,
    },
  ];

  /* -------------------------------------------------------
     MAIN UI
  ------------------------------------------------------- */

  return (
    <>
      <style>{`
        .assessment-result-page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 8% 4%,
              rgba(144, 202, 249, 0.22),
              transparent 28%
            ),
            radial-gradient(
              circle at 92% 12%,
              rgba(33, 150, 243, 0.10),
              transparent 25%
            ),
            linear-gradient(
              180deg,
              #E3F2FD 0%,
              #F7FBFF 34%,
              #FFFFFF 100%
            );
          color: #0D47A1;
        }

        .assessment-result-container {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 24px 0 80px;
        }

        .result-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(33,150,243,0.16);
          box-shadow:
            0 18px 55px rgba(13,71,161,0.08),
            0 3px 15px rgba(33,150,243,0.05);
          backdrop-filter: blur(14px);
        }

        .result-card-soft {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(144,202,249,0.42);
          box-shadow: 0 12px 35px rgba(13,71,161,0.06);
        }

        .score-hero {
          position: relative;
          overflow: hidden;
        }

        .score-hero::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          right: -150px;
          top: -160px;
          border-radius: 999px;
          background: rgba(144,202,249,0.16);
          pointer-events: none;
        }

        .score-hero::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          left: -100px;
          bottom: -100px;
          border-radius: 999px;
          background: rgba(33,150,243,0.06);
          pointer-events: none;
        }

        .score-ring {
          filter: drop-shadow(0 8px 18px rgba(33,150,243,0.15));
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 999px;
          padding: 6px 10px;
          background: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          font-size: 11px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .status-badge.passed {
          background: rgba(16,185,129,0.09);
          border-color: rgba(16,185,129,0.25);
          color: #047857;
        }

        .status-badge.revise {
          background: rgba(245,158,11,0.10);
          border-color: rgba(245,158,11,0.25);
          color: #B45309;
        }

        .primary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #2196F3;
          color: #FFFFFF;
          border: 1px solid #2196F3;
          box-shadow: 0 8px 20px rgba(33,150,243,0.20);
          transition:
            transform 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .primary-action:hover {
          background: #0D47A1;
          border-color: #0D47A1;
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(13,71,161,0.20);
        }

        .secondary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #0D47A1;
          background: #FFFFFF;
          border: 1px solid rgba(33,150,243,0.22);
          transition:
            transform 160ms ease,
            background 160ms ease,
            border-color 160ms ease;
        }

        .secondary-action:hover {
          background: #E3F2FD;
          border-color: #90CAF9;
          transform: translateY(-1px);
        }

        .metric-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(144,202,249,0.35);
          box-shadow: 0 10px 28px rgba(13,71,161,0.05);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .metric-card:hover {
          transform: translateY(-3px);
          border-color: rgba(33,150,243,0.30);
          box-shadow: 0 15px 34px rgba(13,71,161,0.09);
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
        }

        .review-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(144,202,249,0.35);
          box-shadow: 0 15px 42px rgba(13,71,161,0.06);
        }

        .filter-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .filter-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-button {
          white-space: nowrap;
          border: 1px solid rgba(144,202,249,0.42);
          background: #FFFFFF;
          color: #475569;
          transition:
            background 150ms ease,
            color 150ms ease,
            border-color 150ms ease,
            transform 150ms ease;
        }

        .filter-button:hover {
          background: #E3F2FD;
          border-color: #90CAF9;
          color: #0D47A1;
        }

        .filter-button.active {
          background: #2196F3;
          border-color: #2196F3;
          color: #FFFFFF;
          box-shadow: 0 7px 17px rgba(33,150,243,0.20);
        }

        .question-card {
          background: #F8FBFF;
          border: 1px solid rgba(144,202,249,0.34);
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .question-card:hover {
          border-color: rgba(33,150,243,0.28);
          box-shadow: 0 10px 30px rgba(13,71,161,0.05);
        }

        .question-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 26px;
          padding: 0 8px;
          border-radius: 8px;
          background: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          font-size: 11px;
          font-weight: 800;
        }

        .option-card {
          min-width: 0;
          border: 1px solid rgba(144,202,249,0.30);
          background: #FFFFFF;
          color: #475569;
          transition:
            border-color 150ms ease,
            background 150ms ease;
        }

        .option-card.correct {
          background: rgba(16,185,129,0.07);
          border-color: rgba(16,185,129,0.30);
          color: #047857;
        }

        .option-card.selected-wrong {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.28);
          color: #B91C1C;
        }

        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          border-radius: 8px;
          background: #E3F2FD;
          color: #0D47A1;
          font-size: 11px;
          font-weight: 800;
        }

        .option-card.correct .option-letter {
          background: rgba(16,185,129,0.12);
          color: #047857;
        }

        .option-card.selected-wrong .option-letter {
          background: rgba(239,68,68,0.10);
          color: #B91C1C;
        }

        .explanation-box {
          background: #E3F2FD;
          border: 1px solid rgba(144,202,249,0.42);
        }

        .watermark {
          position: fixed;
          right: 18px;
          bottom: 14px;
          z-index: 30;
          pointer-events: none;
          user-select: none;
          color: rgba(13,71,161,0.12);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .watermark::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          margin-right: 6px;
          vertical-align: middle;
          border-radius: 999px;
          background: rgba(33,150,243,0.20);
        }

        .focus-blue:focus-visible {
          outline: 3px solid rgba(33,150,243,0.25);
          outline-offset: 2px;
        }

        @media (max-width: 900px) {
          .assessment-result-container {
            width: min(100% - 24px, 760px);
            padding-top: 20px;
          }
        }

        @media (max-width: 640px) {
          .assessment-result-container {
            width: calc(100% - 20px);
            padding-top: 16px;
            padding-bottom: 60px;
          }

          .watermark {
            right: 10px;
            bottom: 9px;
            font-size: 9px;
          }

          .score-hero::before {
            width: 180px;
            height: 180px;
            right: -100px;
            top: -80px;
          }

          .score-hero::after {
            width: 120px;
            height: 120px;
            left: -70px;
            bottom: -70px;
          }
        }

        @media (max-width: 480px) {
          .assessment-result-container {
            width: calc(100% - 16px);
          }

          .metric-card {
            padding: 13px !important;
          }

          .question-card {
            padding: 14px !important;
          }

          .option-card {
            padding: 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-action,
          .secondary-action,
          .metric-card,
          .filter-button,
          .question-card,
          .option-card {
            transition: none !important;
          }
        }
      `}</style>

      <div className="assessment-result-page">
        <main className="assessment-result-container">
          {/* -------------------------------------------------
              BACK BUTTON
          ------------------------------------------------- */}

          <StickyBackButton
            label="Back to Assessment"
            to="/practice/assessment"
          />

          {/* -------------------------------------------------
              SCORE HERO
          ------------------------------------------------- */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="result-card score-hero mt-5 mb-6 rounded-[28px] p-5 sm:p-7 lg:p-8"
          >
            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              {/* Score */}

              <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row">
                <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
                  <svg
                    className="score-ring h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                    aria-label={`Assessment score ${result.score}%`}
                    role="img"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="rgba(144,202,249,0.30)"
                      strokeWidth="8"
                      fill="none"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke={BLUE.primary}
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={
                        264 -
                        (264 * Math.min(100, Math.max(0, result.score))) / 100
                      }
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black tracking-tight text-[#0D47A1] sm:text-4xl">
                      {result.score}%
                    </span>

                    <span
                      className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        result.passed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {result.passed ? "Passed" : "Revise"}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span
                      className={`status-badge ${
                        result.passed ? "passed" : "revise"
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <AlertCircle size={13} />
                      )}

                      {result.passed
                        ? "Assessment Passed"
                        : "Assessment Needs Review"}
                    </span>

                    <span className="text-xs font-semibold text-slate-500">
                      {result.category}
                    </span>
                  </div>

                  <h1 className="break-words text-xl font-extrabold tracking-tight text-[#0D47A1] sm:text-2xl lg:text-[28px]">
                    {result.assessmentTitle}
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Review your assessment performance, answer accuracy, and
                    detailed explanations below.
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto lg:shrink-0 lg:flex-col">
                <Link
                  to={`/practice/assessment/${result.assessmentId}`}
                  className="primary-action focus-blue min-h-[44px] w-full rounded-xl px-4 py-2.5 text-sm font-bold sm:flex-1 lg:w-[190px]"
                >
                  <RotateCcw size={16} />
                  Retry Assessment
                </Link>

                <Link
                  to="/practice/assessment"
                  className="secondary-action focus-blue min-h-[44px] w-full rounded-xl px-4 py-2.5 text-sm font-bold sm:flex-1 lg:w-[190px]"
                >
                  <ArrowLeft size={16} />
                  Back to Assessment
                </Link>
              </div>
            </div>
          </motion.section>

          {/* -------------------------------------------------
              QUICK METRICS
          ------------------------------------------------- */}

          <section
            aria-label="Assessment performance metrics"
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          >
            <MetricCard
              icon={<CheckCircle2 size={18} />}
              value={result.correctAnswers}
              label="Correct"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <MetricCard
              icon={<XCircle size={18} />}
              value={result.incorrectAnswers}
              label="Incorrect"
              iconClass="bg-rose-50 text-rose-600"
            />

            <MetricCard
              icon={<HelpCircle size={18} />}
              value={result.unanswered}
              label="Unanswered"
              iconClass="bg-amber-50 text-amber-600"
            />

            <MetricCard
              icon={<Clock size={18} />}
              value={formatSeconds(result.timeTakenSeconds)}
              label="Time Taken"
              compact
              iconClass="bg-[#E3F2FD] text-[#2196F3]"
            />
          </section>

          {/* -------------------------------------------------
              PERFORMANCE SUMMARY
          ------------------------------------------------- */}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="result-card mb-6 rounded-2xl p-5 sm:p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#2196F3]">
                <BarChart3 size={20} />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#0D47A1] sm:text-lg">
                  Performance Summary
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                  A quick overview of your assessment accuracy.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <SummaryItem
                label="Accuracy"
                value={`${accuracy}%`}
                progress={accuracy}
              />

              <SummaryItem
                label="Attempted"
                value={`${result.correctAnswers + result.incorrectAnswers}/${totalQuestions}`}
                progress={
                  totalQuestions
                    ? ((result.correctAnswers + result.incorrectAnswers) /
                        totalQuestions) *
                      100
                    : 0
                }
              />

              <SummaryItem
                label="Completion"
                value={`${
                  totalQuestions > 0
                    ? Math.round(
                        ((totalQuestions - result.unanswered) /
                          totalQuestions) *
                          100,
                      )
                    : 0
                }%`}
                progress={
                  totalQuestions
                    ? ((totalQuestions - result.unanswered) / totalQuestions) *
                      100
                    : 0
                }
              />
            </div>
          </motion.section>

          {/* -------------------------------------------------
              QUESTION REVIEW
          ------------------------------------------------- */}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35 }}
            className="review-card rounded-[26px] p-4 sm:p-6 lg:p-7"
          >
            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-[#90CAF9]/30 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#2196F3]">
                    <Target size={18} />
                  </div>

                  <h2 className="text-lg font-extrabold text-[#0D47A1]">
                    Question Review
                  </h2>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                  Inspect your answers and review the correct solutions.
                </p>
              </div>

              <div className="rounded-full border border-[#90CAF9]/40 bg-[#E3F2FD] px-3 py-1.5 text-xs font-bold text-[#0D47A1]">
                {filteredQuestions.length} of {totalQuestions} questions
              </div>
            </div>

            {/* Filters */}

            <div className="filter-scroll mt-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setFilterType(filter.value)}
                  aria-pressed={filterType === filter.value}
                  className={`filter-button focus-blue rounded-xl px-3 py-2 text-xs font-bold ${
                    filterType === filter.value ? "active" : ""
                  }`}
                >
                  {filter.label}
                  <span
                    className={`ml-1 ${
                      filterType === filter.value
                        ? "text-white/80"
                        : "text-slate-400"
                    }`}
                  >
                    ({filter.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Questions */}

            <div className="mt-6 space-y-5">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question, index) => {
                  const prefixes = ["A", "B", "C", "D"];

                  return (
                    <motion.article
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(index * 0.025, 0.2),
                        duration: 0.25,
                      }}
                      className="question-card rounded-2xl p-4 sm:p-5"
                    >
                      {/* Question Header */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="question-number">
                            Q{question.id}
                          </span>

                          {question.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600">
                              <CheckCircle2 size={14} />
                              Correct
                            </span>
                          ) : question.selectedOption !== null ? (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600">
                              <XCircle size={14} />
                              Incorrect
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600">
                              <AlertCircle size={14} />
                              Skipped
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question */}

                      <p className="mt-4 break-words text-sm font-bold leading-6 text-[#0D47A1] sm:text-[15px]">
                        {question.question}
                      </p>

                      {/* Options */}

                      <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect =
                            optionIndex === question.correctAnswer;

                          const isSelected =
                            optionIndex === question.selectedOption;

                          let optionClass = "";

                          if (isCorrect) {
                            optionClass = "correct";
                          } else if (isSelected) {
                            optionClass = "selected-wrong";
                          }

                          return (
                            <div
                              key={`${question.id}-${optionIndex}`}
                              className={`option-card flex items-start gap-3 rounded-xl p-3 ${
                                optionClass
                              }`}
                            >
                              <span className="option-letter">
                                {prefixes[optionIndex] ?? "?"}
                              </span>

                              <span className="min-w-0 flex-1 break-words pt-0.5 text-xs font-semibold leading-5">
                                {option}
                              </span>

                              {isCorrect && (
                                <CheckCircle2
                                  size={16}
                                  className="mt-1 shrink-0 text-emerald-600"
                                />
                              )}

                              {!isCorrect && isSelected && (
                                <XCircle
                                  size={16}
                                  className="mt-1 shrink-0 text-rose-600"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}

                      {question.explanation && (
                        <div className="explanation-box mt-4 rounded-xl p-3.5 sm:p-4">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D47A1]">
                            <HelpCircle size={14} />
                            Solution Explanation
                          </div>

                          <p className="mt-2 break-words text-xs leading-5 text-slate-600 sm:text-sm">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </motion.article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-[#90CAF9]/35 bg-[#F8FBFF] px-5 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3F2FD] text-[#2196F3]">
                    <HelpCircle size={23} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-[#0D47A1]">
                    No Questions Found
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    There are no questions matching the selected filter.
                  </p>

                  <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className="primary-action focus-blue mt-5 rounded-xl px-4 py-2.5 text-xs font-bold"
                  >
                    Show All Questions
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        </main>

        {/* -------------------------------------------------
            WATERMARK
        ------------------------------------------------- */}

        <div className="watermark">AI InterviewBuddy</div>
      </div>
    </>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

interface MetricCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  iconClass: string;
  compact?: boolean;
}

function MetricCard({
  icon,
  value,
  label,
  iconClass,
  compact = false,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="metric-card rounded-2xl p-4 text-center sm:p-5"
    >
      <div className="flex flex-col items-center">
        <div className={`metric-icon ${iconClass}`}>{icon}</div>

        <div
          className={`mt-2 font-black tracking-tight text-[#0D47A1] ${
            compact ? "text-base sm:text-lg" : "text-2xl sm:text-[26px]"
          }`}
        >
          {value}
        </div>

        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

interface SummaryItemProps {
  label: string;
  value: string;
  progress: number;
}

function SummaryItem({ label, value, progress }: SummaryItemProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500">{label}</span>

        <span className="text-sm font-extrabold text-[#0D47A1]">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#E3F2FD]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full bg-[#2196F3]"
        />
      </div>
    </div>
  );
}
