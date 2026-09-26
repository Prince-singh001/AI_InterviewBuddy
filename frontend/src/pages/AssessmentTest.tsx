import AssessmentProgress from "@/components/practice/assessment/AssessmentProgress";
import AssessmentTimer from "@/components/practice/assessment/AssessmentTimer";
import MCQQuestion from "@/components/practice/assessment/MCQQuestion";
import QuestionNavigator from "@/components/practice/assessment/QuestionNavigator";
import StickyBackButton from "@/components/practice/StickyBackButton";
import { getAssessmentById } from "@/data/assessments";
import { AssessmentEvaluation } from "@/types/assessment";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HelpCircle,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const BLUE = {
  light: "#E3F2FD",
  soft: "#90CAF9",
  primary: "#2196F3",
  deep: "#0D47A1",
  white: "#FFFFFF",
};

export default function AssessmentTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const assessment = getAssessmentById(id || "dsa-assessment");

  /* =========================================================
     MISSING ASSESSMENT
  ========================================================= */

  if (!assessment) {
    return (
      <>
        <style>{`
          .assessment-test-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 10% 5%,
                rgba(144, 202, 249, 0.22),
                transparent 30%
              ),
              radial-gradient(
                circle at 90% 15%,
                rgba(33, 150, 243, 0.10),
                transparent 28%
              ),
              linear-gradient(
                180deg,
                #E3F2FD 0%,
                #F7FBFF 45%,
                #FFFFFF 100%
              );
          }

          .assessment-error-card {
            background: rgba(255,255,255,0.96);
            border: 1px solid rgba(33,150,243,0.18);
            box-shadow:
              0 20px 60px rgba(13,71,161,0.10),
              0 5px 20px rgba(33,150,243,0.06);
          }

          .assessment-primary-btn {
            background: #2196F3;
            color: #FFFFFF;
            box-shadow: 0 8px 22px rgba(33,150,243,0.22);
          }

          .assessment-primary-btn:hover {
            background: #0D47A1;
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
            font-weight: 900;
            letter-spacing: .08em;
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

        <div className="assessment-test-page min-h-screen px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <div className="assessment-error-card rounded-[28px] p-7 text-center sm:p-10">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: BLUE.light,
                  color: BLUE.primary,
                  border: `1px solid ${BLUE.soft}`,
                }}
              >
                <AlertTriangle size={34} />
              </div>

              <h2 className="text-xl font-extrabold text-[#0D47A1] sm:text-2xl">
                Assessment Not Found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                The assessment ID requested could not be located.
              </p>

              <Link
                to="/practice/assessment"
                className="assessment-primary-btn mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-colors"
              >
                Back to Assessment Center
              </Link>
            </div>
          </div>

          <div className="assessment-watermark">AI InterviewBuddy</div>
        </div>
      </>
    );
  }

  /* =========================================================
     EMPTY QUESTIONS
  ========================================================= */

  if (!assessment.questions || assessment.questions.length === 0) {
    return (
      <>
        <style>{`
          .assessment-test-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 8% 5%,
                rgba(144, 202, 249, 0.22),
                transparent 30%
              ),
              linear-gradient(
                180deg,
                #E3F2FD 0%,
                #F7FBFF 45%,
                #FFFFFF 100%
              );
          }

          .empty-question-card {
            background: rgba(255,255,255,0.96);
            border: 1px solid rgba(33,150,243,0.18);
            box-shadow:
              0 20px 60px rgba(13,71,161,0.09),
              0 5px 20px rgba(33,150,243,0.06);
          }

          .blue-button {
            background: #2196F3;
            color: white;
            box-shadow: 0 8px 20px rgba(33,150,243,0.20);
          }

          .blue-button:hover {
            background: #0D47A1;
          }

          .assessment-watermark {
            position: fixed;
            right: 18px;
            bottom: 14px;
            z-index: 20;
            pointer-events: none;
            color: rgba(13,71,161,0.12);
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .08em;
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

        <div className="assessment-test-page min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <StickyBackButton
              label="Back to Assessment"
              to="/practice/assessment"
            />

            <div className="mx-auto mt-5 max-w-xl">
              <div className="empty-question-card rounded-[28px] p-7 text-center sm:p-10">
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

                <h2 className="text-xl font-extrabold text-[#0D47A1] sm:text-2xl">
                  Questions Will Be Added Soon
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  The questionnaire for{" "}
                  <strong className="text-[#0D47A1]">
                    &quot;{assessment.title}&quot;
                  </strong>{" "}
                  is currently being prepared. Check back shortly.
                </p>

                <Link
                  to="/practice/assessment"
                  className="blue-button mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-colors"
                >
                  Back to Assessment Center
                </Link>
              </div>
            </div>
          </div>

          <div className="assessment-watermark">AI InterviewBuddy</div>
        </div>
      </>
    );
  }

  /* =========================================================
     ASSESSMENT STATE
  ========================================================= */

  const totalQuestions = assessment.questions.length;

  const initialSeconds =
    (assessment.durationMinutes || assessment.duration || 20) * 60;

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<number, number | null>>({});

  const [markedForReview, setMarkedForReview] = useState<
    Record<number, boolean>
  >({});

  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [showExitModal, setShowExitModal] = useState(false);

  const currentQuestion = assessment.questions[currentIndex];

  const qId = currentQuestion.id;

  /* =========================================================
     ANSWER HANDLERS
  ========================================================= */

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  const handleToggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  /* =========================================================
     SUBMIT ASSESSMENT
  ========================================================= */

  const handleSubmitAssessment = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const reviewItems = assessment.questions.map((q) => {
      const selected = answers[q.id];

      const isAnswered = selected !== null && selected !== undefined;

      const isCorrect = isAnswered && selected === q.correctAnswer;

      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        id: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedOption: selected ?? null,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const attemptedCount = totalQuestions - unansweredCount;

    const score = Math.round((correctCount / totalQuestions) * 100);

    const accuracy =
      attemptedCount > 0
        ? Math.round((correctCount / attemptedCount) * 100)
        : 0;

    const timeTaken = initialSeconds - remainingSeconds;

    const evaluationResult: AssessmentEvaluation = {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      category: assessment.category,
      totalQuestions,
      attempted: attemptedCount,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unanswered: unansweredCount,
      score,
      percentage: score,
      timeTakenSeconds: timeTaken,
      accuracy,
      passed: score >= assessment.passingPercentage,
      questions: reviewItems,
    };

    try {
      localStorage.setItem(
        `assessment_result_${assessment.id}`,
        JSON.stringify(evaluationResult),
      );
    } catch {
      // LocalStorage fallback
    }

    setShowSubmitModal(false);

    toast.success("Assessment submitted successfully!");

    navigate("/practice/assessment/result", {
      state: {
        result: evaluationResult,
      },
    });
  };

  /* =========================================================
     TIME UP
  ========================================================= */

  const handleTimeUp = () => {
    toast.error("Time limit reached! Submitting assessment automatically.");

    handleSubmitAssessment();
  };

  /* =========================================================
     ANSWERED COUNT
  ========================================================= */

  const answeredCount = Object.values(answers).filter(
    (value) => value !== null && value !== undefined,
  ).length;

  const unansweredCount = totalQuestions - answeredCount;

  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <>
      <style>{`
        .assessment-test-page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 7% 3%,
              rgba(144, 202, 249, 0.24),
              transparent 27%
            ),
            radial-gradient(
              circle at 94% 10%,
              rgba(33, 150, 243, 0.10),
              transparent 24%
            ),
            linear-gradient(
              180deg,
              #E3F2FD 0%,
              #F7FBFF 34%,
              #FFFFFF 100%
            );
          color: #0D47A1;
        }

        .assessment-shell {
          width: min(1240px, calc(100% - 32px));
          margin: 0 auto;
          padding: 22px 0 70px;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .assessment-header {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(33,150,243,0.18);
          box-shadow:
            0 16px 45px rgba(13,71,161,0.07),
            0 3px 14px rgba(33,150,243,0.05);
          backdrop-filter: blur(14px);
        }

        .assessment-header::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: -130px;
          top: -150px;
          border-radius: 999px;
          background: rgba(144,202,249,0.14);
          pointer-events: none;
        }

        .assessment-title {
          color: #0D47A1;
        }

        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 5px 9px;
          border-radius: 999px;
          background: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          font-size: 10px;
          font-weight: 800;
        }

        .submit-header-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 42px;
          border-radius: 12px;
          padding: 0 15px;
          background: #2196F3;
          color: #FFFFFF;
          border: 1px solid #2196F3;
          box-shadow: 0 8px 20px rgba(33,150,243,0.20);
          font-size: 12px;
          font-weight: 800;
          transition:
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .submit-header-btn:hover {
          background: #0D47A1;
          border-color: #0D47A1;
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(13,71,161,0.18);
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .question-section {
          min-width: 0;
        }

        .bottom-navigation {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(144,202,249,0.34);
          box-shadow: 0 10px 30px rgba(13,71,161,0.05);
        }

        .nav-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 42px;
          border-radius: 12px;
          padding: 0 15px;
          background: #FFFFFF;
          color: #0D47A1;
          border: 1px solid rgba(144,202,249,0.45);
          font-size: 12px;
          font-weight: 700;
          transition:
            background 150ms ease,
            border-color 150ms ease,
            transform 150ms ease;
        }

        .nav-secondary-btn:hover:not(:disabled) {
          background: #E3F2FD;
          border-color: #90CAF9;
          transform: translateY(-1px);
        }

        .nav-secondary-btn:disabled {
          cursor: not-allowed;
          opacity: 0.38;
        }

        .nav-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 42px;
          border-radius: 12px;
          padding: 0 18px;
          background: #2196F3;
          color: #FFFFFF;
          border: 1px solid #2196F3;
          box-shadow: 0 8px 20px rgba(33,150,243,0.18);
          font-size: 12px;
          font-weight: 800;
          transition:
            background 150ms ease,
            transform 150ms ease,
            box-shadow 150ms ease;
        }

        .nav-primary-btn:hover {
          background: #0D47A1;
          border-color: #0D47A1;
          transform: translateY(-1px);
        }

        /* =====================================================
           PROGRESS INFO
        ===================================================== */

        .progress-info-card {
          background: rgba(255,255,255,0.90);
          border: 1px solid rgba(144,202,249,0.32);
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(13,71,161,0.04);
        }

        .progress-number {
          color: #0D47A1;
        }

        .progress-track {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: #E3F2FD;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #2196F3,
            #0D47A1
          );
        }

        /* =====================================================
           MODALS
        ===================================================== */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(13,71,161,0.28);
          backdrop-filter: blur(7px);
        }

        .modal-card {
          width: 100%;
          max-width: 440px;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          background: #FFFFFF;
          border: 1px solid rgba(33,150,243,0.18);
          border-radius: 24px;
          box-shadow:
            0 30px 90px rgba(13,71,161,0.20),
            0 8px 25px rgba(33,150,243,0.08);
        }

        .modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #E3F2FD;
          color: #2196F3;
          border: 1px solid #90CAF9;
        }

        .modal-cancel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 11px;
          padding: 0 14px;
          color: #475569;
          background: #FFFFFF;
          border: 1px solid rgba(144,202,249,0.40);
          font-size: 12px;
          font-weight: 700;
          transition: background 150ms ease;
        }

        .modal-cancel:hover {
          background: #E3F2FD;
          color: #0D47A1;
        }

        .modal-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 42px;
          border-radius: 11px;
          padding: 0 15px;
          background: #2196F3;
          color: #FFFFFF;
          border: 1px solid #2196F3;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 7px 18px rgba(33,150,243,0.20);
          transition: background 150ms ease;
        }

        .modal-submit:hover {
          background: #0D47A1;
          border-color: #0D47A1;
        }

        .modal-exit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 11px;
          padding: 0 15px;
          background: #0D47A1;
          color: #FFFFFF;
          border: 1px solid #0D47A1;
          font-size: 12px;
          font-weight: 800;
        }

        .modal-exit:hover {
          background: #2196F3;
          border-color: #2196F3;
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: #64748B;
          background: #F8FBFF;
          border: 1px solid rgba(144,202,249,0.30);
        }

        .modal-close:hover {
          background: #E3F2FD;
          color: #0D47A1;
        }

        /* =====================================================
           WATERMARK
        ===================================================== */

        .assessment-watermark {
          position: fixed;
          right: 18px;
          bottom: 14px;
          z-index: 90;
          pointer-events: none;
          user-select: none;
          color: rgba(13,71,161,0.12);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .assessment-watermark::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          margin-right: 6px;
          vertical-align: middle;
          border-radius: 999px;
          background: rgba(33,150,243,0.20);
        }

        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        .blue-focus:focus-visible {
          outline: 3px solid rgba(33,150,243,0.25);
          outline-offset: 2px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {
          .assessment-shell {
            width: min(100% - 24px, 1000px);
          }
        }

        @media (max-width: 1023px) {
          .assessment-shell {
            padding-top: 18px;
          }
        }

        @media (max-width: 640px) {
          .assessment-shell {
            width: calc(100% - 16px);
            padding-top: 14px;
            padding-bottom: 55px;
          }

          .assessment-header {
            border-radius: 20px;
          }

          .submit-header-btn {
            width: 100%;
          }

          .bottom-navigation {
            border-radius: 18px;
          }

          .nav-secondary-btn,
          .nav-primary-btn {
            min-height: 40px;
            padding-left: 12px;
            padding-right: 12px;
          }

          .modal-card {
            border-radius: 20px;
          }

          .assessment-watermark {
            right: 9px;
            bottom: 8px;
            font-size: 9px;
          }
        }

        @media (max-width: 400px) {
          .assessment-shell {
            width: calc(100% - 12px);
          }

          .nav-secondary-btn span,
          .nav-primary-btn span {
            font-size: 11px;
          }

          .modal-card {
            padding: 18px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition: none !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="assessment-test-page">
        <main className="assessment-shell">
          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <StickyBackButton
            label="Back to Assessment"
            to="/practice/assessment"
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="assessment-header mt-5 rounded-[24px] p-4 sm:p-5 lg:p-6">
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Title */}

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="category-badge">
                    <CheckCircle2 size={12} />
                    {assessment.category}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500">
                    Passing: {assessment.passingPercentage}%
                  </span>
                </div>

                <h1 className="assessment-title break-words text-lg font-extrabold tracking-tight sm:text-xl lg:text-2xl">
                  {assessment.title}
                </h1>

                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                  <span>{totalQuestions} Questions</span>

                  <span className="hidden text-[#90CAF9] sm:inline">•</span>

                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={13} />
                    {Math.round(initialSeconds / 60)} min
                  </span>

                  <span className="hidden text-[#90CAF9] sm:inline">•</span>

                  <span>
                    {answeredCount}/{totalQuestions} answered
                  </span>
                </p>
              </div>

              {/* Timer + Submit */}

              <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto lg:items-center">
                <div className="flex justify-center">
                  <AssessmentTimer
                    totalSeconds={initialSeconds}
                    remainingSeconds={remainingSeconds}
                    setRemainingSeconds={setRemainingSeconds}
                    onTimeUp={handleTimeUp}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="submit-header-btn blue-focus w-full cursor-pointer sm:w-auto"
                >
                  <Send size={15} />
                  Submit Assessment
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              SMALL PROGRESS INFO
          ================================================= */}

          <div className="progress-info-card mt-4 p-4 sm:mt-5">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Assessment Progress
                </span>

                <div className="mt-0.5 text-sm font-extrabold text-[#0D47A1]">
                  {answeredCount} of {totalQuestions} answered
                </div>
              </div>

              <span className="progress-number text-sm font-black">
                {progressPercentage}%
              </span>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercentage}
              aria-label="Assessment completion"
            >
              <div
                className="progress-fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          {/* =================================================
              EXISTING ASSESSMENT PROGRESS
          ================================================= */}

          <div className="mt-4 sm:mt-5">
            <AssessmentProgress
              currentQuestion={currentIndex + 1}
              totalQuestions={totalQuestions}
              answeredCount={answeredCount}
            />
          </div>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-4 lg:gap-6">
            {/* QUESTION */}

            <div className="question-section flex min-w-0 flex-col space-y-4 lg:col-span-3">
              <MCQQuestion
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={totalQuestions}
                selectedOption={answers[qId] ?? null}
                onSelectOption={handleSelectOption}
                isMarkedForReview={!!markedForReview[qId]}
                onToggleMarkForReview={handleToggleMarkForReview}
              />

              {/* Bottom Navigation */}

              <div className="bottom-navigation flex items-center justify-between gap-3 rounded-2xl p-3 sm:p-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="nav-secondary-btn blue-focus cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="hidden items-center gap-1.5 text-xs font-bold text-slate-400 sm:flex">
                  <span className="text-[#0D47A1]">{currentIndex + 1}</span>
                  <span>/</span>
                  <span>{totalQuestions}</span>
                </div>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="nav-primary-btn blue-focus cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="nav-primary-btn blue-focus cursor-pointer"
                  >
                    <span>Finish Assessment</span>
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* QUESTION NAVIGATOR */}

            <aside className="min-w-0 lg:sticky lg:top-5">
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentIndex={currentIndex}
                answers={answers}
                markedForReview={markedForReview}
                onSelectQuestion={handleSelectQuestion}
                onSubmitAssessment={() => setShowSubmitModal(true)}
              />
            </aside>
          </div>
        </main>

        {/* ===================================================
            SUBMIT MODAL
        =================================================== */}

        {showSubmitModal && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-assessment-title"
          >
            <div className="modal-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="modal-icon">
                  <Send size={22} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="modal-close blue-focus cursor-pointer"
                  aria-label="Close submit dialog"
                >
                  <X size={17} />
                </button>
              </div>

              <h3
                id="submit-assessment-title"
                className="mt-5 text-lg font-extrabold text-[#0D47A1]"
              >
                Ready to Submit Assessment?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You have answered{" "}
                <strong className="text-[#0D47A1]">{answeredCount}</strong> out
                of <strong className="text-[#0D47A1]">{totalQuestions}</strong>{" "}
                questions.
              </p>

              {unansweredCount > 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-xs font-semibold leading-5 text-amber-700">
                    You still have {unansweredCount} unanswered{" "}
                    {unansweredCount === 1 ? "question" : "questions"}.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-[#90CAF9]/25 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="modal-cancel blue-focus cursor-pointer"
                >
                  Continue Test
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  className="modal-submit blue-focus cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  Yes, Submit Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            EXIT MODAL
        =================================================== */}

        {showExitModal && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-assessment-title"
          >
            <div className="modal-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="modal-icon"
                  style={{
                    background: "#FFF7ED",
                    borderColor: "#FED7AA",
                    color: "#EA580C",
                  }}
                >
                  <AlertTriangle size={22} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="modal-close blue-focus cursor-pointer"
                  aria-label="Close exit dialog"
                >
                  <X size={17} />
                </button>
              </div>

              <h3
                id="exit-assessment-title"
                className="mt-5 text-lg font-extrabold text-[#0D47A1]"
              >
                Leave Assessment?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your test progress will not be saved if you leave before
                completing the assessment.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-[#90CAF9]/25 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="modal-cancel blue-focus cursor-pointer"
                >
                  Keep Practicing
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/practice/assessment")}
                  className="modal-exit blue-focus cursor-pointer"
                >
                  Exit Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            WATERMARK
        =================================================== */}

        <div className="assessment-watermark">AI InterviewBuddy</div>
      </div>
    </>
  );
}
