import { practiceApi } from "@/services/apiService";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  Lightbulb,
  Loader2,
  Mic,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/* =========================================================
   TYPES
========================================================= */

interface PracticeCategory {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
}

interface EvalResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggested_answer: string;
}

interface PracticeQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
}

/* =========================================================
   DATA
========================================================= */

const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    shortName: "DSA",
    icon: "🧮",
    description: "Arrays, strings, trees, graphs & algorithms",
  },
  {
    id: "python",
    name: "Python",
    shortName: "Python",
    icon: "🐍",
    description: "Core Python, OOP, functions & advanced concepts",
  },
  {
    id: "ml",
    name: "Machine Learning",
    shortName: "Machine Learning",
    icon: "🤖",
    description: "ML algorithms, evaluation & practical concepts",
  },
  {
    id: "dl",
    name: "Deep Learning",
    shortName: "Deep Learning",
    icon: "🧠",
    description: "Neural networks, CNNs, RNNs & optimization",
  },
  {
    id: "genai",
    name: "Generative AI",
    shortName: "GenAI",
    icon: "✨",
    description: "LLMs, prompting, embeddings & AI applications",
  },
  {
    id: "nlp",
    name: "Natural Language Processing",
    shortName: "NLP",
    icon: "💬",
    description: "Text processing, transformers & language models",
  },
  {
    id: "cv",
    name: "Computer Vision",
    shortName: "Computer Vision",
    icon: "👁️",
    description: "OpenCV, image processing & vision models",
  },
  {
    id: "sql",
    name: "SQL & Databases",
    shortName: "SQL",
    icon: "🗄️",
    description: "Queries, joins, indexes & database concepts",
  },
  {
    id: "system-design",
    name: "System Design",
    shortName: "System Design",
    icon: "🏗️",
    description: "Architecture, scalability & distributed systems",
  },
  {
    id: "behavioral",
    name: "Behavioral",
    shortName: "Behavioral",
    icon: "🎯",
    description: "Leadership, teamwork & problem solving",
  },
  {
    id: "hr",
    name: "HR Questions",
    shortName: "HR",
    icon: "👥",
    description: "Introduction, strengths, goals & HR rounds",
  },
  {
    id: "rag",
    name: "RAG & LangChain",
    shortName: "RAG",
    icon: "🔗",
    description: "Retrieval, embeddings, vector databases & agents",
  },
  {
    id: "agentic",
    name: "Agentic AI",
    shortName: "Agentic AI",
    icon: "⚡",
    description: "AI agents, tools, workflows & orchestration",
  },
  {
    id: "communication",
    name: "Communication",
    shortName: "Communication",
    icon: "🗣️",
    description: "Clarity, confidence & professional communication",
  },
];

const DIFFICULTIES = [
  {
    id: "Beginner",
    description: "Fundamentals",
  },
  {
    id: "Intermediate",
    description: "Interview ready",
  },
  {
    id: "Advanced",
    description: "Deep technical",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getCategoryById(id: string | null) {
  return PRACTICE_CATEGORIES.find((category) => category.id === id);
}

function getScoreColor(score: number) {
  if (score >= 80) return "#0D47A1";
  if (score >= 60) return "#2196F3";
  return "#1565C0";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good Progress";
  if (score >= 40) return "Needs Improvement";
  return "Keep Practicing";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Practice() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [difficulty, setDifficulty] = useState("Intermediate");

  const [mode, setMode] = useState<"text" | "voice">("text");

  const [answer, setAnswer] = useState("");

  const [evaluating, setEvaluating] = useState(false);

  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);

  const [showModel, setShowModel] = useState(false);

  const [timer, setTimer] = useState(120);

  const [timerStarted, setTimerStarted] = useState(false);

  const [showCategories, setShowCategories] = useState(true);

  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState<PracticeQuestion | null>(null);

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => getCategoryById(selectedCategoryId),
    [selectedCategoryId],
  );

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (!timerStarted) return;

    const interval = window.setInterval(() => {
      setTimer((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          setTimerStarted(false);
          toast.info("Time is up!");
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerStarted]);

  /* =========================================================
     LOAD QUESTION
  ========================================================= */

  const handleLoadQuestion = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a practice category first.");
      return;
    }

    const category = getCategoryById(selectedCategoryId);

    if (!category) {
      toast.error("Invalid practice category.");
      return;
    }

    setLoadingQuestion(true);
    setCurrentQuestion(null);
    setAnswer("");
    setEvalResult(null);
    setShowModel(false);

    // Reset timer for every new question
    setTimer(120);
    setTimerStarted(false);

    try {
      /*Example:
       * DSA -> "dsa"
       * ML  -> "ml"
       * Python -> "python"
      
       */

      const response = await practiceApi.getQuestion(category.id, difficulty);

      const question: PracticeQuestion = {
        id: response.id,
        question: response.question,
        category: category.shortName,
        difficulty: response.difficulty || difficulty,
      };

      setCurrentQuestion(question);

      toast.success(`${category.shortName} question loaded`);
    } catch (error) {
      console.error("Practice question error:", error);

      toast.error(
        `Failed to load ${category.shortName} question. Please try again.`,
      );
    } finally {
      setLoadingQuestion(false);
    }
  };

  /* =========================================================
     EVALUATE
  ========================================================= */

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      toast.error("Please write your answer first.");
      return;
    }

    if (!currentQuestion) {
      toast.error("Please load a question first.");
      return;
    }

    setEvaluating(true);

    try {
      const result = await practiceApi.evaluate(
        currentQuestion.question,
        answer,
        currentQuestion.category,
        currentQuestion.difficulty
      );

      setEvalResult(result);
      setTimerStarted(false);

      toast.success("Your answer has been evaluated!");
    } catch (error) {
      console.error("Evaluation error:", error);

      toast.error("Failed to evaluate answer. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    setAnswer("");
    setEvalResult(null);
    setShowModel(false);
    setTimer(120);
    setTimerStarted(false);
  };

  /* =========================================================
     CATEGORY
  ========================================================= */

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    // Clear previous question when changing category
    setCurrentQuestion(null);
    setAnswer("");
    setEvalResult(null);
    setShowModel(false);
    setTimer(120);
    setTimerStarted(false);
  };

  /* =========================================================
     TIMER
  ========================================================= */

  const startTimer = () => {
    if (timerStarted || !currentQuestion) return;

    setTimerStarted(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const timerPercentage = Math.max(0, Math.min(100, (timer / 120) * 100));

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="practice-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="practice-header"
      >
        <div>
          <div className="practice-eyebrow">
            <Sparkles size={14} />
            AI POWERED PRACTICE
          </div>

          <h1>Practice Center</h1>

          <p>
            Practice interview questions, submit your answers, and get instant
            AI feedback.
          </p>
        </div>

        <div className="header-stat">
          <div className="header-stat-icon">
            <Target size={18} />
          </div>

          <div>
            <span>Current Focus</span>
            <strong>{selectedCategory?.shortName || "Choose a topic"}</strong>
          </div>
        </div>
      </motion.header>

      {/* =====================================================
          CATEGORY SECTION
      ===================================================== */}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="practice-card category-section"
      >
        <button
          className="section-heading"
          onClick={() => setShowCategories((value) => !value)}
        >
          <div className="section-title-wrapper">
            <div className="section-icon">
              <BarChart3 size={18} />
            </div>

            <div>
              <h2>Choose Practice Topic</h2>

              <p>Select the exact skill you want to practice</p>
            </div>
          </div>

          {showCategories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence initial={false}>
          {showCategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="category-grid-wrapper"
            >
              <div className="category-grid">
                {PRACTICE_CATEGORIES.map((category) => {
                  const isSelected = selectedCategoryId === category.id;

                  const isHovered = hoveredCategory === category.id;

                  return (
                    <motion.button
                      key={category.id}
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`category-card ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <div className="category-card-top">
                        <div className="category-icon">{category.icon}</div>

                        {isSelected && (
                          <div className="category-check">
                            <Check size={13} />
                          </div>
                        )}
                      </div>

                      <div className="category-content">
                        <strong>{category.shortName}</strong>

                        <span>{category.description}</span>
                      </div>

                      <div
                        className={`category-arrow ${
                          isHovered || isSelected ? "visible" : ""
                        }`}
                      >
                        <ArrowRight size={15} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            CONTROLS
        =================================================== */}

        <div className="practice-controls">
          {/* Difficulty */}

          <div className="control-group">
            <label>Difficulty</label>

            <div className="difficulty-list">
              {DIFFICULTIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDifficulty(item.id)}
                  className={`difficulty-button ${
                    difficulty === item.id ? "active" : ""
                  }`}
                >
                  <strong>{item.id}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}

          <div className="control-group mode-control">
            <label>Answer Mode</label>

            <div className="mode-list">
              <button
                type="button"
                onClick={() => setMode("text")}
                className={`mode-button ${mode === "text" ? "active" : ""}`}
              >
                <span>⌨️</span>
                Text
              </button>

              <button
                type="button"
                onClick={() => setMode("voice")}
                className={`mode-button ${mode === "voice" ? "active" : ""}`}
              >
                <span>🎤</span>
                Voice
              </button>
            </div>
          </div>

          {/* Get question */}

          <button
            type="button"
            onClick={handleLoadQuestion}
            disabled={loadingQuestion || !selectedCategoryId}
            className="generate-button"
          >
            {loadingQuestion ? (
              <>
                <Loader2 size={17} className="spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap size={17} />
                Get Question
              </>
            )}
          </button>
        </div>
      </motion.section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="practice-layout">
        {/* ===================================================
            LEFT
        =================================================== */}

        <main className="practice-main">
          {/* QUESTION CARD */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="practice-card question-card"
          >
            <div className="question-header">
              <div>
                <div className="question-label">
                  <span className="live-dot" />
                  AI PRACTICE QUESTION
                </div>

                <div className="question-meta">
                  <span className="meta-badge blue">
                    {currentQuestion?.category ||
                      selectedCategory?.shortName ||
                      "General"}
                  </span>

                  <span className="meta-badge light">
                    {currentQuestion?.difficulty || difficulty}
                  </span>
                </div>
              </div>

              {/* Timer */}

              <div className="timer-wrapper">
                <div className={`timer ${timer < 30 ? "danger" : ""}`}>
                  <Clock3 size={16} />
                  {formatTime(timer)}
                </div>

                <div className="timer-progress">
                  <div
                    style={{
                      width: `${timerPercentage}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={startTimer}
                  disabled={timerStarted || !currentQuestion || !!evalResult}
                  className="timer-button"
                >
                  {timerStarted ? "Running" : "Start Timer"}
                </button>
              </div>
            </div>

            {/* Question */}

            <div className="question-body">
              {loadingQuestion ? (
                <div className="question-loading">
                  <div className="loading-circle">
                    <Loader2 size={24} className="spin" />
                  </div>

                  <strong>Generating your question...</strong>

                  <span>
                    AI is preparing a question for{" "}
                    {selectedCategory?.shortName || "your topic"}.
                  </span>
                </div>
              ) : currentQuestion ? (
                <>
                  <div className="question-number">QUESTION</div>

                  <h2>{currentQuestion.question}</h2>
                </>
              ) : (
                <div className="question-empty">
                  <div className="empty-icon">
                    <Lightbulb size={26} />
                  </div>

                  <h3>Ready when you are</h3>

                  <p>
                    Select a category above and click{" "}
                    <strong>Get Question</strong> to begin.
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          {/* =================================================
              ANSWER CARD
          ================================================= */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="practice-card answer-card"
          >
            <div className="answer-header">
              <div>
                <h2>Your Answer</h2>

                <p>
                  Explain your answer clearly and use examples where possible.
                </p>
              </div>

              {mode === "voice" && (
                <button
                  type="button"
                  className="voice-button"
                  onClick={() =>
                    toast.info(
                      "Voice recording can be connected to your speech-to-text service.",
                    )
                  }
                >
                  <Mic size={16} />
                  Record Answer
                </button>
              )}
            </div>

            <div className="textarea-wrapper">
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={!!evalResult || !currentQuestion || evaluating}
                placeholder={
                  currentQuestion
                    ? "Write your answer here... Explain your approach, reasoning, examples, and trade-offs."
                    : "Load a question first to start answering."
                }
              />

              <div className="textarea-footer">
                <span>{answer.length} characters</span>

                <span>AI will evaluate your response</span>
              </div>
            </div>

            <div className="answer-actions">
              <button
                type="button"
                onClick={handleReset}
                className="secondary-button"
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={
                  evaluating ||
                  !!evalResult ||
                  !answer.trim() ||
                  !currentQuestion
                }
                className="submit-button"
              >
                {evaluating ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Evaluate with AI
                  </>
                )}
              </button>
            </div>
          </motion.section>

          {/* =================================================
              EVALUATION
          ================================================= */}

          <AnimatePresence>
            {evalResult && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="practice-card evaluation-card"
              >
                <div className="evaluation-header">
                  <div>
                    <div className="question-label">
                      <CheckCircle2 size={16} />
                      AI EVALUATION COMPLETE
                    </div>

                    <h2>Your Performance</h2>
                  </div>

                  <div className="score-circle">
                    <span>{evalResult.score}</span>
                    <small>/100</small>
                  </div>
                </div>

                <div className="score-summary">
                  <div className="score-bar">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, evalResult.score),
                        )}%`,
                        background: getScoreColor(evalResult.score),
                      }}
                    />
                  </div>

                  <div className="score-label">
                    <strong>{getScoreLabel(evalResult.score)}</strong>

                    <span>
                      AI evaluated your answer based on clarity, correctness and
                      relevance.
                    </span>
                  </div>
                </div>

                {/* Feedback */}

                <div className="feedback-box">
                  <div className="feedback-icon">
                    <Volume2 size={17} />
                  </div>

                  <div>
                    <strong>AI Feedback</strong>

                    <p>{evalResult.feedback}</p>
                  </div>
                </div>

                {/* Strengths + Improvements */}

                <div className="evaluation-grid">
                  <div className="evaluation-column strengths">
                    <div className="evaluation-column-title">
                      <div>
                        <Check size={15} />
                      </div>
                      Strengths
                    </div>

                    {evalResult.strengths?.length ? (
                      evalResult.strengths.map((strength, index) => (
                        <div key={index} className="evaluation-item">
                          <CheckCircle2 size={15} />
                          <span>{strength}</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-feedback">
                        No strengths were returned.
                      </p>
                    )}
                  </div>

                  <div className="evaluation-column improvements">
                    <div className="evaluation-column-title">
                      <div>
                        <ArrowRight size={15} />
                      </div>
                      Improvements
                    </div>

                    {evalResult.improvements?.length ? (
                      evalResult.improvements.map((improvement, index) => (
                        <div key={index} className="evaluation-item">
                          <X size={15} />
                          <span>{improvement}</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-feedback">
                        No improvements were returned.
                      </p>
                    )}
                  </div>
                </div>

                {/* Model answer */}

                {evalResult.suggested_answer && (
                  <div className="model-answer-section">
                    <button
                      type="button"
                      onClick={() => setShowModel((value) => !value)}
                      className="model-answer-button"
                    >
                      <Eye size={16} />

                      {showModel ? "Hide Model Answer" : "View Model Answer"}

                      {showModel ? (
                        <ChevronUp size={15} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                    </button>

                    <AnimatePresence>
                      {showModel && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="model-answer"
                        >
                          <div className="model-answer-title">
                            <Lightbulb size={16} />
                            Suggested Answer
                          </div>

                          <p>{evalResult.suggested_answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="practice-sidebar">
          {/* Current selection */}

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="sidebar-card selected-topic-card"
          >
            <div className="sidebar-card-heading">
              <span>Current Topic</span>
              <Target size={16} />
            </div>

            {selectedCategory ? (
              <div className="selected-topic">
                <div className="selected-topic-icon">
                  {selectedCategory.icon}
                </div>

                <div>
                  <strong>{selectedCategory.shortName}</strong>

                  <span>{difficulty} difficulty</span>
                </div>
              </div>
            ) : (
              <div className="sidebar-empty">
                <Lightbulb size={18} />
                <span>Select a topic to begin.</span>
              </div>
            )}
          </motion.div>

          {/* Tips */}

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sidebar-card"
          >
            <div className="sidebar-card-heading">
              <span>Answer Strategy</span>
              <Lightbulb size={16} />
            </div>

            <div className="tips-list">
              {[
                "Start with the core concept.",
                "Explain your reasoning clearly.",
                "Use a practical example.",
                "Mention edge cases when relevant.",
                "Discuss trade-offs and limitations.",
              ].map((tip, index) => (
                <div key={index} className="tip-item">
                  <span>{index + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Next Question */}

          <motion.button
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleLoadQuestion}
            disabled={loadingQuestion || !selectedCategoryId}
            className="next-question-button"
          >
            <div>
              <strong>Next Question</strong>
              <span>Continue practicing</span>
            </div>

            {loadingQuestion ? (
              <Loader2 size={19} className="spin" />
            ) : (
              <ArrowRight size={19} />
            )}
          </motion.button>

          {/* Progress */}

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sidebar-card progress-card"
          >
            <div className="progress-icon">
              <Trophy size={18} />
            </div>

            <div>
              <strong>Practice makes progress</strong>

              <p>
                Try different difficulty levels to improve your interview
                readiness.
              </p>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`
        /* ===================================================
           ROOT
        =================================================== */

        .practice-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 0 3rem;
          color: #0D47A1;
        }

        .practice-page *,
        .practice-page *::before,
        .practice-page *::after {
          box-sizing: border-box;
        }

        /* ===================================================
           HEADER
        =================================================== */

        .practice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .practice-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.45rem;
          color: #2196F3;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .practice-header h1 {
          margin: 0;
          color: #0D47A1;
          font-size: clamp(1.7rem, 3vw, 2.25rem);
          font-weight: 800;
          letter-spacing: -0.035em;
        }

        .practice-header p {
          margin: 0.45rem 0 0;
          color: #55708F;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .header-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 190px;
          padding: 0.8rem 1rem;
          border: 1px solid rgba(144, 202, 249, 0.5);
          border-radius: 14px;
          background: #FFFFFF;
          box-shadow: 0 8px 24px rgba(13, 71, 161, 0.06);
        }

        .header-stat-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          color: #0D47A1;
          background: #E3F2FD;
        }

        .header-stat span,
        .header-stat strong {
          display: block;
        }

        .header-stat span {
          color: #71869D;
          font-size: 0.68rem;
          font-weight: 600;
        }

        .header-stat strong {
          margin-top: 0.1rem;
          color: #0D47A1;
          font-size: 0.82rem;
        }

        /* ===================================================
           CARD
        =================================================== */

        .practice-card {
          overflow: hidden;
          border: 1px solid rgba(144, 202, 249, 0.45);
          border-radius: 18px;
          background: #FFFFFF;
          box-shadow:
            0 8px 30px rgba(13, 71, 161, 0.055),
            0 1px 3px rgba(13, 71, 161, 0.04);
        }

        /* ===================================================
           CATEGORY
        =================================================== */

        .category-section {
          margin-bottom: 1.5rem;
        }

        .section-heading {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.2rem;
          border: 0;
          background: transparent;
          color: #0D47A1;
          cursor: pointer;
          text-align: left;
        }

        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          color: #0D47A1;
          background: #E3F2FD;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .section-heading p {
          margin: 0.15rem 0 0;
          color: #71869D;
          font-size: 0.72rem;
        }

        .category-grid-wrapper {
          overflow: hidden;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.7rem;
          padding: 0 1.2rem 1.1rem;
        }

        .category-card {
          position: relative;
          min-height: 142px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.85rem;
          border: 1px solid rgba(144, 202, 249, 0.4);
          border-radius: 14px;
          background: #FFFFFF;
          color: #0D47A1;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .category-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(227, 242, 253, 0.75),
            rgba(255, 255, 255, 0)
          );
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .category-card:hover::before,
        .category-card.selected::before {
          opacity: 1;
        }

        .category-card:hover {
          border-color: #2196F3;
          box-shadow: 0 12px 28px rgba(33, 150, 243, 0.13);
        }

        .category-card.selected {
          border: 2px solid #2196F3;
          background: #E3F2FD;
          box-shadow: 0 10px 25px rgba(33, 150, 243, 0.12);
        }

        .category-card-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .category-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #E3F2FD;
          font-size: 1.25rem;
          transition: transform 0.2s ease;
        }

        .category-card:hover .category-icon {
          transform: scale(1.08) rotate(-2deg);
        }

        .category-check {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #2196F3;
          color: #FFFFFF;
        }

        .category-content {
          position: relative;
          z-index: 1;
          margin-top: 0.7rem;
        }

        .category-content strong,
        .category-content span {
          display: block;
        }

        .category-content strong {
          color: #0D47A1;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .category-content span {
          margin-top: 0.28rem;
          color: #71869D;
          font-size: 0.66rem;
          line-height: 1.45;
        }

        .category-arrow {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: flex-end;
          color: #90CAF9;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
        }

        .category-arrow.visible {
          opacity: 1;
          transform: translateX(0);
          color: #2196F3;
        }

        /* ===================================================
           CONTROLS
        =================================================== */

        .practice-controls {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          padding: 1rem 1.2rem;
          border-top: 1px solid #E3F2FD;
          background: #FAFDFF;
        }

        .control-group {
          min-width: 0;
        }

        .control-group label {
          display: block;
          margin-bottom: 0.4rem;
          color: #71869D;
          font-size: 0.67rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .difficulty-list {
          display: flex;
          gap: 0.35rem;
        }

        .difficulty-button {
          min-width: 95px;
          padding: 0.48rem 0.65rem;
          border: 1px solid rgba(144, 202, 249, 0.5);
          border-radius: 9px;
          background: #FFFFFF;
          color: #0D47A1;
          cursor: pointer;
          text-align: left;
          transition: all 0.18s ease;
        }

        .difficulty-button:hover {
          border-color: #2196F3;
          background: #E3F2FD;
        }

        .difficulty-button.active {
          border-color: #2196F3;
          background: #2196F3;
          color: #FFFFFF;
          box-shadow: 0 5px 14px rgba(33, 150, 243, 0.2);
        }

        .difficulty-button strong,
        .difficulty-button span {
          display: block;
        }

        .difficulty-button strong {
          font-size: 0.7rem;
        }

        .difficulty-button span {
          margin-top: 0.1rem;
          font-size: 0.56rem;
          opacity: 0.72;
        }

        .mode-control {
          margin-left: auto;
        }

        .mode-list {
          display: flex;
          gap: 0.35rem;
        }

        .mode-button {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.58rem 0.75rem;
          border: 1px solid rgba(144, 202, 249, 0.5);
          border-radius: 9px;
          background: #FFFFFF;
          color: #55708F;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .mode-button:hover {
          border-color: #2196F3;
          color: #0D47A1;
          background: #E3F2FD;
        }

        .mode-button.active {
          border-color: #0D47A1;
          background: #0D47A1;
          color: #FFFFFF;
        }

        .generate-button {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          margin-left: auto;
          padding: 0.65rem 1rem;
          border: 0;
          border-radius: 10px;
          background: #0D47A1;
          color: #FFFFFF;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(13, 71, 161, 0.18);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .generate-button:hover:not(:disabled) {
          background: #2196F3;
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(33, 150, 243, 0.2);
        }

        .generate-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ===================================================
           MAIN LAYOUT
        =================================================== */

        .practice-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 1.25rem;
          align-items: start;
        }

        .practice-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .practice-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: sticky;
          top: 1rem;
        }

        /* ===================================================
           QUESTION
        =================================================== */

        .question-card {
          min-height: 320px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.2rem;
          border-bottom: 1px solid #E3F2FD;
        }

        .question-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #2196F3;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2196F3;
          box-shadow: 0 0 0 4px #E3F2FD;
        }

        .question-meta {
          display: flex;
          gap: 0.4rem;
          margin-top: 0.65rem;
        }

        .meta-badge {
          display: inline-flex;
          align-items: center;
          min-height: 25px;
          padding: 0.25rem 0.55rem;
          border-radius: 7px;
          font-size: 0.64rem;
          font-weight: 800;
        }

        .meta-badge.blue {
          background: #E3F2FD;
          color: #0D47A1;
        }

        .meta-badge.light {
          background: #F4F9FD;
          color: #55708F;
          border: 1px solid #E3F2FD;
        }

        .timer-wrapper {
          min-width: 145px;
          text-align: right;
        }

        .timer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.35rem;
          color: #55708F;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .timer.danger {
          color: #0D47A1;
        }

        .timer-progress {
          width: 100%;
          height: 4px;
          margin: 0.45rem 0;
          overflow: hidden;
          border-radius: 20px;
          background: #E3F2FD;
        }

        .timer-progress div {
          height: 100%;
          border-radius: inherit;
          background: #2196F3;
          transition: width 1s linear;
        }

        .timer-button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #2196F3;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
        }

        .timer-button:disabled {
          cursor: default;
          opacity: 0.65;
        }

        .question-body {
          min-height: 225px;
          display: flex;
          align-items: center;
          padding: 2rem;
        }

        .question-body h2 {
          max-width: 850px;
          margin: 0.5rem 0 0;
          color: #0D47A1;
          font-size: clamp(1.15rem, 2vw, 1.5rem);
          line-height: 1.6;
          font-weight: 750;
          letter-spacing: -0.015em;
        }

        .question-number {
          color: #90A9C0;
          font-size: 0.64rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .question-loading,
        .question-empty {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-circle,
        .empty-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin-bottom: 0.9rem;
          border-radius: 17px;
          background: #E3F2FD;
          color: #2196F3;
        }

        .question-loading strong,
        .question-empty h3 {
          color: #0D47A1;
          font-size: 0.9rem;
        }

        .question-loading span,
        .question-empty p {
          margin: 0.35rem 0 0;
          color: #71869D;
          font-size: 0.75rem;
        }

        .question-empty h3 {
          margin: 0;
        }

        .question-empty p {
          max-width: 380px;
          line-height: 1.6;
        }

        /* ===================================================
           ANSWER
        =================================================== */

        .answer-card {
          padding: 1.2rem;
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.85rem;
        }

        .answer-header h2 {
          margin: 0;
          color: #0D47A1;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .answer-header p {
          margin: 0.25rem 0 0;
          color: #71869D;
          font-size: 0.7rem;
        }

        .voice-button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 0.75rem;
          border: 1px solid #90CAF9;
          border-radius: 9px;
          background: #E3F2FD;
          color: #0D47A1;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .voice-button:hover {
          background: #90CAF9;
          transform: translateY(-1px);
        }

        .textarea-wrapper {
          overflow: hidden;
          border: 1px solid #90CAF9;
          border-radius: 13px;
          background: #FFFFFF;
          transition: all 0.2s ease;
        }

        .textarea-wrapper:focus-within {
          border-color: #2196F3;
          box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.09);
        }

        .textarea-wrapper textarea {
          width: 100%;
          min-height: 190px;
          display: block;
          padding: 1rem;
          border: 0;
          outline: 0;
          resize: vertical;
          background: transparent;
          color: #0D47A1;
          font-family: inherit;
          font-size: 0.86rem;
          line-height: 1.7;
        }

        .textarea-wrapper textarea::placeholder {
          color: #9BAEC1;
        }

        .textarea-wrapper textarea:disabled {
          background: #F7FBFE;
          cursor: not-allowed;
        }

        .textarea-footer {
          display: flex;
          justify-content: space-between;
          padding: 0.55rem 0.8rem;
          border-top: 1px solid #E3F2FD;
          background: #FAFDFF;
          color: #8BA0B5;
          font-size: 0.61rem;
        }

        .answer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.55rem;
          margin-top: 0.85rem;
        }

        .secondary-button,
        .submit-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          min-height: 40px;
          padding: 0.6rem 0.85rem;
          border-radius: 9px;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .secondary-button {
          border: 1px solid #90CAF9;
          background: #FFFFFF;
          color: #55708F;
        }

        .secondary-button:hover {
          border-color: #2196F3;
          background: #E3F2FD;
          color: #0D47A1;
        }

        .submit-button {
          border: 0;
          background: #0D47A1;
          color: #FFFFFF;
          box-shadow: 0 7px 18px rgba(13, 71, 161, 0.18);
        }

        .submit-button:hover:not(:disabled) {
          background: #2196F3;
          transform: translateY(-1px);
        }

        .submit-button:disabled,
        .secondary-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ===================================================
           EVALUATION
        =================================================== */

        .evaluation-card {
          padding: 1.2rem;
          border-color: #90CAF9;
        }

        .evaluation-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
        }

        .evaluation-header h2 {
          margin: 0.25rem 0 0;
          color: #0D47A1;
          font-size: 1rem;
          font-weight: 800;
        }

        .score-circle {
          display: flex;
          align-items: baseline;
          gap: 0.1rem;
          padding: 0.6rem 0.8rem;
          border-radius: 12px;
          background: #E3F2FD;
          color: #0D47A1;
        }

        .score-circle span {
          font-size: 1.6rem;
          font-weight: 900;
        }

        .score-circle small {
          color: #55708F;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .score-summary {
          margin-top: 1.15rem;
        }

        .score-bar {
          width: 100%;
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #E3F2FD;
        }

        .score-bar div {
          height: 100%;
          border-radius: inherit;
          transition: width 0.7s ease;
        }

        .score-label {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .score-label strong {
          color: #0D47A1;
          font-size: 0.72rem;
        }

        .score-label span {
          color: #71869D;
          font-size: 0.65rem;
        }

        .feedback-box {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.1rem;
          padding: 0.85rem;
          border: 1px solid #E3F2FD;
          border-radius: 12px;
          background: #FAFDFF;
        }

        .feedback-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #E3F2FD;
          color: #2196F3;
        }

        .feedback-box strong {
          color: #0D47A1;
          font-size: 0.72rem;
        }

        .feedback-box p {
          margin: 0.25rem 0 0;
          color: #55708F;
          font-size: 0.74rem;
          line-height: 1.6;
        }

        .evaluation-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-top: 1rem;
        }

        .evaluation-column {
          padding: 0.85rem;
          border-radius: 12px;
          background: #FAFDFF;
          border: 1px solid #E3F2FD;
        }

        .evaluation-column-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.65rem;
          color: #0D47A1;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .evaluation-column-title div {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 7px;
          background: #E3F2FD;
          color: #2196F3;
        }

        .evaluation-item {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          margin-top: 0.5rem;
          color: #55708F;
          font-size: 0.7rem;
          line-height: 1.5;
        }

        .evaluation-item svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #2196F3;
        }

        .empty-feedback {
          margin: 0;
          color: #8BA0B5;
          font-size: 0.7rem;
        }

        .model-answer-section {
          margin-top: 1rem;
        }

        .model-answer-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.7rem;
          border: 1px solid #90CAF9;
          border-radius: 9px;
          background: #FFFFFF;
          color: #0D47A1;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .model-answer-button:hover {
          background: #E3F2FD;
          border-color: #2196F3;
        }

        .model-answer {
          overflow: hidden;
          margin-top: 0.65rem;
          padding: 0.9rem;
          border-radius: 10px;
          background: #E3F2FD;
          color: #55708F;
        }

        .model-answer-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #0D47A1;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .model-answer p {
          margin: 0.6rem 0 0;
          white-space: pre-line;
          font-size: 0.74rem;
          line-height: 1.7;
        }

        /* ===================================================
           SIDEBAR
        =================================================== */

        .sidebar-card {
          padding: 1rem;
          border: 1px solid rgba(144, 202, 249, 0.45);
          border-radius: 15px;
          background: #FFFFFF;
          box-shadow: 0 8px 25px rgba(13, 71, 161, 0.045);
        }

        .sidebar-card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #0D47A1;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .sidebar-card-heading svg {
          color: #2196F3;
        }

        .selected-topic {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-top: 0.85rem;
          padding: 0.7rem;
          border-radius: 11px;
          background: #E3F2FD;
        }

        .selected-topic-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #FFFFFF;
          font-size: 1.15rem;
        }

        .selected-topic strong,
        .selected-topic span {
          display: block;
        }

        .selected-topic strong {
          color: #0D47A1;
          font-size: 0.75rem;
        }

        .selected-topic span {
          margin-top: 0.15rem;
          color: #55708F;
          font-size: 0.62rem;
        }

        .sidebar-empty {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.7rem;
          border-radius: 10px;
          background: #FAFDFF;
          color: #71869D;
          font-size: 0.68rem;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-top: 0.85rem;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
        }

        .tip-item > span {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: #E3F2FD;
          color: #2196F3;
          font-size: 0.62rem;
          font-weight: 800;
        }

        .tip-item p {
          margin: 0.15rem 0 0;
          color: #55708F;
          font-size: 0.68rem;
          line-height: 1.45;
        }

        .next-question-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          border: 0;
          border-radius: 14px;
          background: #0D47A1;
          color: #FFFFFF;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(13, 71, 161, 0.18);
          transition: all 0.2s ease;
        }

        .next-question-button:hover:not(:disabled) {
          background: #2196F3;
          box-shadow: 0 12px 27px rgba(33, 150, 243, 0.22);
        }

        .next-question-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .next-question-button strong,
        .next-question-button span {
          display: block;
        }

        .next-question-button strong {
          font-size: 0.75rem;
        }

        .next-question-button span {
          margin-top: 0.15rem;
          color: #90CAF9;
          font-size: 0.62rem;
        }

        .progress-card {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          background: #E3F2FD;
          border-color: #90CAF9;
        }

        .progress-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #FFFFFF;
          color: #2196F3;
        }

        .progress-card strong {
          color: #0D47A1;
          font-size: 0.7rem;
        }

        .progress-card p {
          margin: 0.25rem 0 0;
          color: #55708F;
          font-size: 0.64rem;
          line-height: 1.5;
        }

        /* ===================================================
           ANIMATIONS
        =================================================== */

        .spin {
          animation: practice-spin 1s linear infinite;
        }

        @keyframes practice-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (max-width: 1150px) {
          .category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .practice-layout {
            grid-template-columns: minmax(0, 1fr) 280px;
          }
        }

        @media (max-width: 950px) {
          .practice-layout {
            grid-template-columns: 1fr;
          }

          .practice-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .next-question-button {
            min-height: 70px;
          }
        }

        @media (max-width: 760px) {
          .practice-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-stat {
            width: 100%;
          }

          .category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .practice-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .mode-control {
            margin-left: 0;
          }

          .generate-button {
            width: 100%;
            margin-left: 0;
          }

          .difficulty-list {
            width: 100%;
          }

          .difficulty-button {
            flex: 1;
            min-width: 0;
          }

          .mode-list {
            width: 100%;
          }

          .mode-button {
            flex: 1;
            justify-content: center;
          }

          .question-header {
            flex-direction: column;
          }

          .timer-wrapper {
            width: 100%;
            text-align: left;
          }

          .timer {
            justify-content: flex-start;
          }

          .question-body {
            min-height: 220px;
            padding: 1.4rem;
          }

          .evaluation-grid {
            grid-template-columns: 1fr;
          }

          .score-label {
            flex-direction: column;
            gap: 0.25rem;
          }
        }

        @media (max-width: 560px) {
          .practice-page {
            padding-bottom: 2rem;
          }

          .practice-card,
          .sidebar-card {
            border-radius: 13px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            min-height: 118px;
          }

          .difficulty-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .difficulty-button {
            padding: 0.5rem 0.35rem;
          }

          .difficulty-button strong {
            font-size: 0.62rem;
          }

          .difficulty-button span {
            display: none;
          }

          .question-body h2 {
            font-size: 1.05rem;
          }

          .answer-header {
            flex-direction: column;
          }

          .voice-button {
            width: 100%;
            justify-content: center;
          }

          .textarea-wrapper textarea {
            min-height: 170px;
          }

          .answer-actions {
            flex-direction: column-reverse;
          }

          .secondary-button,
          .submit-button {
            width: 100%;
          }

          .practice-sidebar {
            grid-template-columns: 1fr;
          }

          .evaluation-header {
            align-items: flex-start;
          }

          .score-circle span {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </div>
  );
}
