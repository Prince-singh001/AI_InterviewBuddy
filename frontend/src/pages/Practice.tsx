import PracticeNavigation from "@/components/practice/PracticeNavigation";
import { practiceApi } from "@/services/apiService";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Database,
  Eye,
  GitBranch,
  Languages,
  Layers,
  Lightbulb,
  Loader2,
  LucideIcon,
  MessageSquare,
  Mic,
  Network,
  RotateCcw,
  Send,
  Server,
  Target,
  Terminal,
  Trophy,
  Volume2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* =========================================================
   TYPES
========================================================= */

interface PracticeCategory {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
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
    icon: GitBranch,
    description: "Arrays, strings, trees, graphs & algorithms",
  },
  {
    id: "python",
    name: "Python",
    shortName: "Python",
    icon: Terminal,
    description: "Core Python, OOP, functions & advanced concepts",
  },
  {
    id: "ml",
    name: "Machine Learning",
    shortName: "Machine Learning",
    icon: BarChart3,
    description: "ML algorithms, evaluation & practical concepts",
  },
  {
    id: "dl",
    name: "Deep Learning",
    shortName: "Deep Learning",
    icon: Network,
    description: "Neural networks, CNNs, RNNs & optimization",
  },
  {
    id: "genai",
    name: "Generative AI",
    shortName: "GenAI",
    icon: Layers,
    description: "LLMs, prompting, embeddings & AI applications",
  },
  {
    id: "nlp",
    name: "Natural Language Processing",
    shortName: "NLP",
    icon: Languages,
    description: "Text processing, transformers & language models",
  },
  {
    id: "cv",
    name: "Computer Vision",
    shortName: "Computer Vision",
    icon: Eye,
    description: "OpenCV, image processing & vision models",
  },
  {
    id: "sql",
    name: "SQL & Databases",
    shortName: "SQL",
    icon: Database,
    description: "Queries, joins, indexes & database concepts",
  },
  {
    id: "system-design",
    name: "System Design",
    shortName: "System Design",
    icon: Server,
    description: "Architecture, scalability & distributed systems",
  },
  {
    id: "behavioral",
    name: "Behavioral",
    shortName: "Behavioral",
    icon: Target,
    description: "Leadership, teamwork & problem solving",
  },
  {
    id: "hr",
    name: "HR Questions",
    shortName: "HR",
    icon: Briefcase,
    description: "Introduction, strengths, goals & HR rounds",
  },
  {
    id: "rag",
    name: "RAG & LangChain",
    shortName: "RAG",
    icon: Layers,
    description: "Retrieval, embeddings, vector databases & agents",
  },
  {
    id: "agentic",
    name: "Agentic AI",
    shortName: "Agentic AI",
    icon: Workflow,
    description: "AI agents, tools, workflows & orchestration",
  },
  {
    id: "communication",
    name: "Communication",
    shortName: "Communication",
    icon: MessageSquare,
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
  const navigate = useNavigate();

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
       * Java -> "java"
       * C++ -> "cpp"
       * C -> "c"
       * JavaScript -> "javascript"
       * ML  -> "ml"
       * Python -> "python"
       * 
      
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
        currentQuestion.difficulty,
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
          PRACTICE NAVIGATION & HEADER
      ===================================================== */}
      <PracticeNavigation
        title="Practice Center"
        subtitle="Practice interview questions and improve your skills"
        badge="Practice Mode"
        actions={
          <div className="header-stat">
            <div className="header-stat-icon">
              <Target size={18} />
            </div>

            <div>
              <span>Current Focus</span>
              <strong>{selectedCategory?.shortName || "Choose a topic"}</strong>
            </div>
          </div>
        }
      />

      {/* =====================================================
          MAIN PRACTICE TRACKS
      ===================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="practice-tracks-grid"
      >
        {/* Track 1: DSA Practice */}
        <div className="practice-track-card">
          <div className="track-card-header">
            <div className="track-icon-wrapper dsa-track">
              <GitBranch size={20} />
            </div>
            <span className="track-difficulty-badge">Intermediate</span>
          </div>

          <h3 className="track-title">DSA Practice</h3>
          <p className="track-description">
            Algorithmic problem solving, data structures, recursion, and time
            complexity with AI answer evaluation.
          </p>

          <div className="track-meta">
            <span className="track-count">140+ Questions</span>
            <span className="track-status">0% Prepared</span>
          </div>

          <div className="track-progress-bar">
            <div style={{ width: "0%" }} />
          </div>

          <button
            type="button"
            onClick={() => {
              handleCategorySelect("dsa");
              setShowCategories(true);
              toast.info("Selected Data Structures & Algorithms topic");
            }}
            className="track-action-btn"
          >
            <span>Start Practice</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Track 2: Coding Practice */}
        <div className="practice-track-card">
          <div className="track-card-header">
            <div className="track-icon-wrapper coding-track">
              <Code2 size={20} />
            </div>
            <span className="track-difficulty-badge">7 Languages</span>
          </div>

          <h3 className="track-title">Coding Practice</h3>
          <p className="track-description">
            Hands-on code challenges in Python, Java, C++, JS, Go & C# with
            interactive test runners and starter code. Get live feedback on your
            code from AI interviewer. Practice with real interview scenarios.
            Perfect for beginners to experienced developers.
          </p>

          <div className="track-meta">
            <span className="track-count">6 Challenges</span>
            <span className="track-status">Full IDE</span>
          </div>

          <div className="track-progress-bar">
            <div style={{ width: "35%" }} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/practice/coding")}
            className="track-action-btn"
          >
            <span>Explore Challenges</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Track 3: SQL Practice */}
        <div className="practice-track-card">
          <div className="track-card-header">
            <div className="track-icon-wrapper sql-track">
              <Database size={20} />
            </div>
            <span className="track-difficulty-badge">Intermediate</span>
          </div>

          <h3 className="track-title">SQL Practice</h3>
          <p className="track-description">
            Database architecture, window functions, indexing, subqueries, ACID
            properties and query optimization. Get live feedback on your SQL
            queries from AI interviewer. Practice with real interview scenarios.
            Perfect for beginners to experienced developers.
          </p>

          <div className="track-meta">
            <span className="track-count">90+ Questions</span>
            <span className="track-status">0% Prepared</span>
          </div>

          <div className="track-progress-bar">
            <div style={{ width: "0%" }} />
          </div>

          <button
            type="button"
            onClick={() => {
              handleCategorySelect("sql");
              setShowCategories(true);
              toast.info("Selected SQL & Databases topic");
            }}
            className="track-action-btn"
          >
            <span>Start Practice</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Track 4: Aptitude */}
        <div className="practice-track-card">
          <div className="track-card-header">
            <div className="track-icon-wrapper aptitude-track">
              <Calculator size={20} />
            </div>
            <span className="track-difficulty-badge">Quantitative</span>
          </div>

          <h3 className="track-title">Aptitude</h3>
          <p className="track-description">
            Quantitative speed math, number sequences, probability, time-work
            logic, and campus placement exams.
          </p>

          <div className="track-meta">
            <span className="track-count">50+ Questions</span>
            <span className="track-status">Timed Test</span>
          </div>

          <div className="track-progress-bar">
            <div style={{ width: "70%" }} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/practice/assessment")}
            className="track-action-btn"
          >
            <span>Take Assessment</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Track 5: Company Wise Practice */}
        <div className="practice-track-card">
          <div className="track-card-header">
            <div className="track-icon-wrapper company-track">
              <Building2 size={20} />
            </div>
            <span className="track-difficulty-badge">Multi-Tier</span>
          </div>

          <h3 className="track-title">Company Wise Practice</h3>
          <p className="track-description">
            Targeted interview prep, hiring timelines, assessments, and coding
            problems for Google, Microsoft, Amazon, etc.
          </p>

          <div className="track-meta">
            <span className="track-count">370+ Questions</span>
            <span className="track-status">5 Companies</span>
          </div>

          <div className="track-progress-bar">
            <div style={{ width: "25%" }} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/practice/company")}
            className="track-action-btn"
          >
            <span>Explore Companies</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>

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
                      className={`category-card ${isSelected ? "selected" : ""
                        }`}
                    >
                      <div className="category-card-top">
                        <div className="category-icon">
                          <category.icon size={20} />
                        </div>

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
                        className={`category-arrow ${isHovered || isSelected ? "visible" : ""
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
                  className={`difficulty-button ${difficulty === item.id ? "active" : ""
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
                  PRACTICE QUESTION
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
                    <Send size={16} />
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
                      EVALUATION COMPLETE
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
                  <selectedCategory.icon size={20} />
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
  /* =========================================================
     PRACTICE PAGE — PROFESSIONAL BLUE / WHITE UI
  ========================================================= */

  .practice-page {
    --blue-50: #E3F2FD;
    --blue-200: #90CAF9;
    --blue-500: #2196F3;
    --blue-900: #0D47A1;

    --white: #FFFFFF;
    --text-primary: #0F2742;
    --text-secondary: #52657A;
    --text-muted: #7890A6;

    --border: rgba(33, 150, 243, 0.18);
    --border-strong: rgba(33, 150, 243, 0.32);

    --surface: #FFFFFF;
    --surface-soft: #F7FBFF;
    --surface-blue: #F0F8FF;

    --shadow-sm: 0 3px 12px rgba(13, 71, 161, 0.06);
    --shadow-md: 0 8px 26px rgba(13, 71, 161, 0.09);
    --shadow-lg: 0 16px 42px rgba(13, 71, 161, 0.13);

    width: 100%;
    max-width: 1440px;
    min-height: 100vh;
    margin: 0 auto;
    padding: 1.5rem 1.5rem 4rem;

    color: var(--text-primary);

    background:
      radial-gradient(
        circle at 10% 0%,
        rgba(144, 202, 249, 0.20),
        transparent 30%
      ),
      radial-gradient(
        circle at 90% 10%,
        rgba(33, 150, 243, 0.08),
        transparent 28%
      ),
      linear-gradient(
        180deg,
        #F8FCFF 0%,
        #FFFFFF 45%,
        #F8FCFF 100%
      );

    overflow-x: hidden;
  }

  .practice-page *,
  .practice-page *::before,
  .practice-page *::after {
    box-sizing: border-box;
  }

  /* =========================================================
     PRACTICE NAVIGATION
  ========================================================= */

  .practice-page .practice-nav-container {
    margin-bottom: 1.4rem;
  }

  .practice-page .practice-nav-container .border-b {
    border-bottom-color: var(--border) !important;
  }

  .practice-page .practice-nav-container h1 {
    color: var(--blue-900) !important;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .practice-page .practice-nav-container p {
    color: var(--text-secondary) !important;
  }

  .practice-page .practice-nav-container .rounded-full.uppercase {
    background: var(--blue-50) !important;
    color: var(--blue-900) !important;
    border: 1px solid var(--blue-200) !important;
  }

  .practice-page .practice-nav-container nav[role="tablist"] {
    background: rgba(255, 255, 255, 0.94) !important;
    border-color: var(--border) !important;
    box-shadow: var(--shadow-sm) !important;
    backdrop-filter: blur(14px);
  }

  .practice-page .practice-nav-container nav[role="tablist"] a {
    color: var(--text-secondary) !important;
    transition: all 0.2s ease;
  }

  .practice-page .practice-nav-container nav[role="tablist"] a:hover {
    color: var(--blue-900) !important;
    background: var(--blue-50) !important;
  }

  .practice-page .practice-nav-container
    nav[role="tablist"]
    a[aria-selected="true"] {
    color: var(--white) !important;
    background: var(--blue-500) !important;
    box-shadow: 0 5px 15px rgba(33, 150, 243, 0.25);
  }

  /* =========================================================
     HEADER STAT
  ========================================================= */

  .header-stat {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    min-width: 190px;
    padding: 0.8rem 1rem;

    border: 1px solid var(--border);
    border-radius: 15px;

    background: rgba(255, 255, 255, 0.92);

    box-shadow: var(--shadow-sm);

    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .header-stat:hover {
    transform: translateY(-2px);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-md);
  }

  .header-stat-icon {
    display: grid;
    place-items: center;

    width: 40px;
    height: 40px;

    flex-shrink: 0;

    border-radius: 12px;

    color: var(--blue-900);
    background: linear-gradient(
      145deg,
      var(--blue-50),
      #FFFFFF
    );

    border: 1px solid var(--blue-200);

    transition: all 0.2s ease;
  }

  .header-stat:hover .header-stat-icon {
    color: var(--white);
    background: var(--blue-500);
    border-color: var(--blue-500);
  }

  .header-stat span,
  .header-stat strong {
    display: block;
  }

  .header-stat span {
    color: var(--text-muted);
    font-size: 0.67rem;
    font-weight: 700;
  }

  .header-stat strong {
    margin-top: 0.12rem;
    color: var(--text-primary);
    font-size: 0.84rem;
    font-weight: 800;
  }

  /* =========================================================
     PRACTICE TRACKS
  ========================================================= */

  .practice-tracks-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(230px, 1fr)
    );

    gap: 1rem;
    margin-bottom: 1.8rem;
  }

  .practice-track-card {
    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    min-height: 220px;

    padding: 1.3rem;

    overflow: hidden;

    border: 1px solid var(--border);
    border-radius: 20px;

    background:
      linear-gradient(
        145deg,
        #FFFFFF 0%,
        #FBFDFF 100%
      );

    box-shadow: var(--shadow-sm);

    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      border-color 0.25s ease;
  }

  .practice-track-card::before {
    content: "";

    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    height: 3px;

    background: linear-gradient(
      90deg,
      var(--blue-200),
      var(--blue-500),
      var(--blue-900)
    );

    opacity: 0.75;
  }

  .practice-track-card:hover {
    transform: translateY(-5px);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-lg);
  }

  .track-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 0.9rem;
  }

  .track-icon-wrapper {
    display: grid;
    place-items: center;

    width: 44px;
    height: 44px;

    border-radius: 13px;

    color: var(--blue-900);

    background: var(--blue-50);

    border: 1px solid var(--blue-200);

    transition: all 0.2s ease;
  }

  .practice-track-card:hover .track-icon-wrapper {
    color: var(--white);
    background: var(--blue-500);
    border-color: var(--blue-500);
    transform: translateY(-2px);
  }

  .track-difficulty-badge {
    padding: 0.3rem 0.65rem;

    border-radius: 999px;

    font-size: 0.65rem;
    font-weight: 800;

    color: var(--blue-900);

    background: var(--blue-50);
    border: 1px solid var(--blue-200);
  }

  .track-title {
    margin: 0;

    color: var(--text-primary);

    font-size: 1.03rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .track-description {
    margin: 0.45rem 0 0;

    min-height: 3.6em;

    color: var(--text-secondary);

    font-size: 0.78rem;
    line-height: 1.55;
  }

  .track-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-top: 1rem;
    margin-bottom: 0.4rem;

    font-size: 0.7rem;
    font-weight: 700;
  }

  .track-count {
    color: var(--blue-500);
  }

  .track-status {
    color: var(--text-muted);
  }

  .track-progress-bar {
    width: 100%;
    height: 6px;

    margin-bottom: 1rem;

    overflow: hidden;

    border-radius: 999px;

    background: var(--blue-50);
    border: 1px solid rgba(144, 202, 249, 0.4);
  }

  .track-progress-bar div {
    height: 100%;

    border-radius: inherit;

    background: linear-gradient(
      90deg,
      var(--blue-200),
      var(--blue-500)
    );
  }

  /* =========================================================
     BUTTON SYSTEM
  ========================================================= */

  .track-action-btn,
  .generate-button,
  .submit-button,
  .next-question-button {
    background: linear-gradient(
      135deg,
      var(--blue-500),
      var(--blue-900)
    );

    color: var(--white);

    box-shadow:
      0 7px 20px rgba(33, 150, 243, 0.24);

    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      filter 0.2s ease;
  }

  .track-action-btn:hover,
  .generate-button:hover:not(:disabled),
  .submit-button:hover:not(:disabled),
  .next-question-button:hover:not(:disabled) {
    transform: translateY(-2px);

    filter: brightness(1.04);

    box-shadow:
      0 11px 28px rgba(13, 71, 161, 0.28);
  }

  .track-action-btn:active,
  .generate-button:active:not(:disabled),
  .submit-button:active:not(:disabled),
  .next-question-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .track-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    gap: 0.4rem;

    padding: 0.68rem 1rem;

    border: 0;
    border-radius: 11px;

    font-size: 0.78rem;
    font-weight: 800;

    cursor: pointer;
  }

  /* =========================================================
     BASE CARDS
  ========================================================= */

  .practice-card {
    overflow: hidden;

    border: 1px solid var(--border);
    border-radius: 18px;

    background: rgba(255, 255, 255, 0.94);

    box-shadow: var(--shadow-sm);

    backdrop-filter: blur(12px);

    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .practice-card:hover {
    border-color: rgba(33, 150, 243, 0.24);
    box-shadow: var(--shadow-md);
  }

  /* =========================================================
     CATEGORY SECTION
  ========================================================= */

  .category-section {
    margin-bottom: 1.35rem;
  }

  .section-heading {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 1rem;

    padding: 1.05rem 1.2rem;

    border: 0;

    background: transparent;

    color: var(--text-primary);

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

    flex-shrink: 0;

    border-radius: 12px;

    color: var(--blue-900);

    background: var(--blue-50);

    border: 1px solid var(--blue-200);
  }

  .section-heading h2 {
    margin: 0;

    color: var(--text-primary);

    font-size: 0.95rem;
    font-weight: 800;
  }

  .section-heading p {
    margin: 0.15rem 0 0;

    color: var(--text-secondary);

    font-size: 0.72rem;
  }

  .category-grid-wrapper {
    overflow: hidden;
  }

  .category-grid {
    display: grid;

    grid-template-columns:
      repeat(4, minmax(0, 1fr));

    gap: 0.7rem;

    padding: 0 1.2rem 1.15rem;
  }

  .category-card {
    position: relative;

    min-height: 142px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 0.9rem;

    overflow: hidden;

    border: 1px solid var(--border);
    border-radius: 15px;

    background: #FFFFFF;

    color: var(--text-primary);

    text-align: left;

    cursor: pointer;

    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .category-card:hover {
    transform: translateY(-3px);

    border-color: var(--blue-200);

    background: var(--surface-blue);

    box-shadow: var(--shadow-md);
  }

  .category-card.selected {
    border: 2px solid var(--blue-500);

    background:
      linear-gradient(
        145deg,
        #FFFFFF,
        var(--blue-50)
      );

    box-shadow:
      0 0 0 3px rgba(33, 150, 243, 0.09),
      var(--shadow-md);
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

    color: var(--blue-900);

    background: var(--blue-50);

    border: 1px solid var(--blue-200);

    transition:
      transform 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;
  }

  .category-card:hover .category-icon {
    transform: scale(1.06);

    color: var(--white);

    background: var(--blue-500);
    border-color: var(--blue-500);
  }

  .category-card.selected .category-icon {
    color: var(--white);

    background: var(--blue-500);

    border-color: var(--blue-500);
  }

  .category-check {
    display: grid;
    place-items: center;

    width: 24px;
    height: 24px;

    border-radius: 50%;

    background: var(--blue-500);

    color: var(--white);

    box-shadow:
      0 4px 10px rgba(33, 150, 243, 0.25);
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
    color: var(--text-primary);

    font-size: 0.78rem;
    font-weight: 800;
  }

  .category-content span {
    margin-top: 0.28rem;

    color: var(--text-secondary);

    font-size: 0.66rem;
    line-height: 1.45;
  }

  .category-arrow {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: flex-end;

    color: var(--blue-200);

    opacity: 0;

    transform: translateX(-4px);

    transition: all 0.2s ease;
  }

  .category-arrow.visible {
    opacity: 1;

    transform: translateX(0);

    color: var(--blue-500);
  }

  /* =========================================================
     CONTROLS
  ========================================================= */

  .practice-controls {
    display: flex;
    align-items: flex-end;

    gap: 1rem;

    padding: 1.05rem 1.2rem;

    border-top: 1px solid var(--border);

    background:
      linear-gradient(
        180deg,
        #F8FCFF,
        #F3F9FE
      );
  }

  .control-group {
    min-width: 0;
  }

  .control-group label {
    display: block;

    margin-bottom: 0.4rem;

    color: var(--text-secondary);

    font-size: 0.65rem;
    font-weight: 800;

    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .difficulty-list {
    display: flex;
    gap: 0.35rem;
  }

  .difficulty-button {
    min-width: 95px;

    padding: 0.5rem 0.7rem;

    border: 1px solid var(--border);
    border-radius: 10px;

    background: #FFFFFF;

    color: var(--text-secondary);

    cursor: pointer;
    text-align: left;

    transition: all 0.18s ease;
  }

  .difficulty-button:hover {
    border-color: var(--blue-200);

    background: var(--blue-50);

    color: var(--blue-900);
  }

  .difficulty-button.active {
    border-color: var(--blue-500);

    background: var(--blue-500);

    color: var(--white);

    box-shadow:
      0 5px 15px rgba(33, 150, 243, 0.25);
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

    opacity: 0.8;
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

    padding: 0.58rem 0.78rem;

    border: 1px solid var(--border);
    border-radius: 10px;

    background: #FFFFFF;

    color: var(--text-secondary);

    font-size: 0.7rem;
    font-weight: 800;

    cursor: pointer;

    transition: all 0.18s ease;
  }

  .mode-button:hover {
    border-color: var(--blue-200);

    background: var(--blue-50);

    color: var(--blue-900);
  }

  .mode-button.active {
    border-color: var(--blue-500);

    background: var(--blue-500);

    color: var(--white);

    box-shadow:
      0 5px 15px rgba(33, 150, 243, 0.25);
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

    font-size: 0.76rem;
    font-weight: 800;

    cursor: pointer;

    white-space: nowrap;
  }

  .generate-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* =========================================================
     MAIN LAYOUT
  ========================================================= */

  .practice-layout {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      310px;

    gap: 1.25rem;

    align-items: start;
  }

  .practice-main {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 1.15rem;
  }

  .practice-sidebar {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    position: sticky;
    top: 1rem;
  }

  /* =========================================================
     QUESTION CARD
  ========================================================= */

  .question-card {
    min-height: 320px;
  }

  .question-header {
    display: flex;
    justify-content: space-between;

    gap: 1rem;

    padding: 1.1rem 1.2rem;

    border-bottom: 1px solid var(--border);

    background:
      linear-gradient(
        180deg,
        #FFFFFF,
        #FBFDFF
      );
  }

  .question-label {
    display: flex;
    align-items: center;

    gap: 0.4rem;

    color: var(--blue-900);

    font-size: 0.65rem;
    font-weight: 800;

    letter-spacing: 0.06em;
  }

  .live-dot {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: var(--blue-500);

    box-shadow:
      0 0 0 4px rgba(33, 150, 243, 0.12);

    animation: live-pulse 1.8s ease-in-out infinite;
  }

  @keyframes live-pulse {
    0%,
    100% {
      box-shadow:
        0 0 0 4px rgba(33, 150, 243, 0.10);
    }

    50% {
      box-shadow:
        0 0 0 7px rgba(33, 150, 243, 0.04);
    }
  }

  .question-meta {
    display: flex;

    flex-wrap: wrap;

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
    background: var(--blue-50);

    color: var(--blue-900);

    border: 1px solid var(--blue-200);
  }

  .meta-badge.light {
    background: #F5F9FD;

    color: var(--text-secondary);

    border: 1px solid var(--border);
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

    color: var(--text-primary);

    font-size: 0.78rem;
    font-weight: 800;
  }

  .timer.danger {
    color: #D97706;
  }

  .timer-progress {
    width: 100%;
    height: 4px;

    margin: 0.45rem 0;

    overflow: hidden;

    border-radius: 999px;

    background: var(--blue-50);
  }

  .timer-progress div {
    height: 100%;

    border-radius: inherit;

    background:
      linear-gradient(
        90deg,
        var(--blue-200),
        var(--blue-500)
      );

    transition: width 1s linear;
  }

  .timer-button {
    padding: 0;

    border: 0;

    background: transparent;

    color: var(--blue-500);

    font-size: 0.65rem;
    font-weight: 800;

    cursor: pointer;
  }

  .timer-button:hover {
    color: var(--blue-900);
  }

  .timer-button:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .question-body {
    min-height: 225px;

    display: flex;
    align-items: center;

    padding: 2rem;

    background:
      radial-gradient(
        circle at 95% 10%,
        rgba(144, 202, 249, 0.12),
        transparent 25%
      );
  }

  .question-body h2 {
    max-width: 850px;

    margin: 0.5rem 0 0;

    color: var(--text-primary);

    font-size: clamp(
      1.15rem,
      2vw,
      1.5rem
    );

    line-height: 1.6;

    font-weight: 750;

    letter-spacing: -0.015em;
  }

  .question-number {
    color: var(--text-muted);

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

    background: var(--blue-50);

    color: var(--blue-500);

    border: 1px solid var(--blue-200);
  }

  .loading-circle {
    animation: soft-float 2s ease-in-out infinite;
  }

  @keyframes soft-float {
    0%,
    100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-4px);
    }
  }

  .question-loading strong,
  .question-empty h3 {
    color: var(--text-primary);

    font-size: 0.9rem;
  }

  .question-loading span,
  .question-empty p {
    margin: 0.35rem 0 0;

    color: var(--text-secondary);

    font-size: 0.75rem;
  }

  .question-empty h3 {
    margin: 0;
  }

  .question-empty p {
    max-width: 380px;

    line-height: 1.6;
  }

  /* =========================================================
     ANSWER CARD
  ========================================================= */

  .answer-card {
    padding: 1.2rem;
  }

  .answer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    gap: 1rem;

    margin-bottom: 0.85rem;
  }

  .answer-header h2 {
    margin: 0;

    color: var(--text-primary);

    font-size: 0.95rem;
    font-weight: 800;
  }

  .answer-header p {
    margin: 0.25rem 0 0;

    color: var(--text-secondary);

    font-size: 0.7rem;
  }

  .voice-button {
    display: flex;
    align-items: center;

    gap: 0.4rem;

    padding: 0.55rem 0.75rem;

    border: 1px solid var(--border);
    border-radius: 9px;

    background: #FFFFFF;

    color: var(--text-secondary);

    font-size: 0.7rem;
    font-weight: 800;

    cursor: pointer;

    transition: all 0.2s ease;
  }

  .voice-button:hover {
    color: var(--blue-900);

    background: var(--blue-50);

    border-color: var(--blue-200);

    transform: translateY(-1px);
  }

  .textarea-wrapper {
    overflow: hidden;

    border: 1px solid var(--border);
    border-radius: 14px;

    background: #FFFFFF;

    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .textarea-wrapper:focus-within {
    border-color: var(--blue-500);

    box-shadow:
      0 0 0 4px rgba(33, 150, 243, 0.10);
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

    color: var(--text-primary);

    font-family: inherit;
    font-size: 0.86rem;

    line-height: 1.7;
  }

  .textarea-wrapper textarea::placeholder {
    color: #9AAEC0;
  }

  .textarea-wrapper textarea:disabled {
    background: #F6FAFD;
    cursor: not-allowed;
  }

  .textarea-footer {
    display: flex;
    justify-content: space-between;

    padding: 0.55rem 0.8rem;

    border-top: 1px solid var(--border);

    background: var(--surface-blue);

    color: var(--text-muted);

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

    padding: 0.6rem 0.9rem;

    border-radius: 10px;

    font-size: 0.72rem;
    font-weight: 800;

    cursor: pointer;

    transition: all 0.2s ease;
  }

  .secondary-button {
    border: 1px solid var(--border);

    background: #FFFFFF;

    color: var(--text-secondary);
  }

  .secondary-button:hover {
    border-color: var(--blue-200);

    background: var(--blue-50);

    color: var(--blue-900);

    transform: translateY(-1px);
  }

  .submit-button {
    border: 0;

    min-width: 120px;

    background:
      linear-gradient(
        135deg,
        var(--blue-500),
        var(--blue-900)
      );

    color: var(--white);

    box-shadow:
      0 6px 18px rgba(33, 150, 243, 0.23);
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);

    box-shadow:
      0 10px 24px rgba(13, 71, 161, 0.27);
  }

  .submit-button:disabled,
  .secondary-button:disabled {
    opacity: 0.45;

    cursor: not-allowed;

    box-shadow: none;
  }

  /* =========================================================
     EVALUATION
  ========================================================= */

  .evaluation-card {
    padding: 1.2rem;

    border: 1px solid var(--border);

    background: #FFFFFF;
  }

  .evaluation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 1rem;
  }

  .evaluation-header h2 {
    margin: 0.25rem 0 0;

    color: var(--text-primary);

    font-size: 1rem;
    font-weight: 800;
  }

  .score-circle {
    display: flex;
    align-items: baseline;

    gap: 0.1rem;

    padding: 0.55rem 0.8rem;

    border-radius: 13px;

    background: var(--blue-50);

    color: var(--blue-900);

    border: 1px solid var(--blue-200);
  }

  .score-circle span {
    font-size: 1.6rem;
    font-weight: 900;
  }

  .score-circle small {
    color: var(--text-secondary);

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

    background: var(--blue-50);

    border: 1px solid rgba(144, 202, 249, 0.4);
  }

  .score-bar div {
    height: 100%;

    border-radius: inherit;

    background:
      linear-gradient(
        90deg,
        var(--blue-200),
        var(--blue-500),
        var(--blue-900)
      );

    transition: width 0.7s ease;
  }

  .score-label {
    display: flex;
    justify-content: space-between;

    gap: 1rem;

    margin-top: 0.5rem;
  }

  .score-label strong {
    color: var(--text-primary);

    font-size: 0.72rem;
  }

  .score-label span {
    color: var(--text-secondary);

    font-size: 0.65rem;
  }

  .feedback-box {
    display: flex;

    gap: 0.75rem;

    margin-top: 1.1rem;

    padding: 0.9rem;

    border: 1px solid var(--border);

    border-radius: 13px;

    background: var(--surface-soft);
  }

  .feedback-icon {
    display: grid;
    place-items: center;

    flex-shrink: 0;

    width: 34px;
    height: 34px;

    border-radius: 10px;

    background: var(--blue-50);

    color: var(--blue-500);

    border: 1px solid var(--blue-200);
  }

  .feedback-box strong {
    color: var(--text-primary);

    font-size: 0.72rem;
  }

  .feedback-box p {
    margin: 0.25rem 0 0;

    color: var(--text-secondary);

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
    padding: 0.9rem;

    border-radius: 13px;

    background: var(--surface-soft);

    border: 1px solid var(--border);
  }

  .evaluation-column-title {
    display: flex;
    align-items: center;

    gap: 0.45rem;

    margin-bottom: 0.65rem;

    color: var(--text-primary);

    font-size: 0.72rem;
    font-weight: 800;
  }

  .evaluation-column-title div {
    display: grid;
    place-items: center;

    width: 25px;
    height: 25px;

    border-radius: 8px;

    background: var(--blue-50);

    color: var(--blue-500);

    border: 1px solid var(--blue-200);
  }

  .evaluation-item {
    display: flex;

    gap: 0.5rem;

    align-items: flex-start;

    margin-top: 0.5rem;

    color: var(--text-secondary);

    font-size: 0.7rem;

    line-height: 1.5;
  }

  .evaluation-item svg {
    flex-shrink: 0;

    margin-top: 2px;

    color: var(--blue-500);
  }

  .empty-feedback {
    margin: 0;

    color: var(--text-muted);

    font-size: 0.7rem;
  }

  /* =========================================================
     MODEL ANSWER
  ========================================================= */

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

    border: 1px solid var(--border);

    border-radius: 10px;

    background: #FFFFFF;

    color: var(--text-secondary);

    font-size: 0.7rem;
    font-weight: 800;

    cursor: pointer;

    transition: all 0.2s ease;
  }

  .model-answer-button:hover {
    background: var(--blue-50);

    border-color: var(--blue-200);

    color: var(--blue-900);
  }

  .model-answer {
    overflow: hidden;

    margin-top: 0.65rem;

    padding: 0.95rem;

    border-radius: 11px;

    background: var(--surface-soft);

    border: 1px solid var(--border);

    color: var(--text-secondary);
  }

  .model-answer-title {
    display: flex;
    align-items: center;

    gap: 0.4rem;

    color: var(--blue-900);

    font-size: 0.72rem;
    font-weight: 800;
  }

  .model-answer p {
    margin: 0.6rem 0 0;

    white-space: pre-line;

    font-size: 0.74rem;

    line-height: 1.7;
  }

  /* =========================================================
     SIDEBAR
  ========================================================= */

  .sidebar-card {
    padding: 1rem;

    border: 1px solid var(--border);

    border-radius: 15px;

    background: rgba(255, 255, 255, 0.94);

    box-shadow: var(--shadow-sm);

    backdrop-filter: blur(12px);
  }

  .sidebar-card-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: var(--text-primary);

    font-size: 0.75rem;
    font-weight: 800;
  }

  .sidebar-card-heading svg {
    color: var(--blue-500);
  }

  .selected-topic {
    display: flex;
    align-items: center;

    gap: 0.7rem;

    margin-top: 0.85rem;

    padding: 0.7rem;

    border-radius: 11px;

    background: var(--surface-blue);

    border: 1px solid var(--border);
  }

  .selected-topic-icon {
    display: grid;
    place-items: center;

    width: 38px;
    height: 38px;

    flex-shrink: 0;

    border-radius: 10px;

    background: var(--blue-50);

    color: var(--blue-500);

    border: 1px solid var(--blue-200);
  }

  .selected-topic strong,
  .selected-topic span {
    display: block;
  }

  .selected-topic strong {
    color: var(--text-primary);

    font-size: 0.75rem;
  }

  .selected-topic span {
    margin-top: 0.15rem;

    color: var(--text-secondary);

    font-size: 0.62rem;
  }

  .sidebar-empty {
    display: flex;
    align-items: center;

    gap: 0.5rem;

    margin-top: 0.75rem;

    padding: 0.7rem;

    border-radius: 10px;

    background: var(--surface-soft);

    color: var(--text-secondary);

    font-size: 0.68rem;

    border: 1px dashed var(--blue-200);
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

    background: var(--blue-50);

    color: var(--blue-900);

    border: 1px solid var(--blue-200);

    font-size: 0.62rem;
    font-weight: 800;
  }

  .tip-item p {
    margin: 0.15rem 0 0;

    color: var(--text-secondary);

    font-size: 0.68rem;

    line-height: 1.5;
  }

  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  .next-question-button {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 0.75rem;

    padding: 0.9rem 1rem;

    border: 0;

    border-radius: 14px;

    text-align: left;

    cursor: pointer;
  }

  .next-question-button:disabled {
    opacity: 0.45;

    cursor: not-allowed;

    box-shadow: none;
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

    color: rgba(255, 255, 255, 0.78);

    font-size: 0.62rem;
  }

  /* =========================================================
     PROGRESS CARD
  ========================================================= */

  .progress-card {
    display: flex;

    align-items: flex-start;

    gap: 0.7rem;

    background: var(--surface-blue);

    border: 1px solid var(--border);

    border-radius: 14px;
  }

  .progress-icon {
    display: grid;
    place-items: center;

    flex-shrink: 0;

    width: 34px;
    height: 34px;

    border-radius: 9px;

    background: var(--blue-50);

    color: var(--blue-500);

    border: 1px solid var(--blue-200);
  }

  .progress-card strong {
    color: var(--text-primary);

    font-size: 0.7rem;
  }

  .progress-card p {
    margin: 0.25rem 0 0;

    color: var(--text-secondary);

    font-size: 0.64rem;

    line-height: 1.5;
  }

  /* =========================================================
     FOCUS ACCESSIBILITY
  ========================================================= */

  .practice-page button:focus-visible,
  .practice-page textarea:focus-visible,
  .practice-page a:focus-visible {
    outline: 3px solid rgba(33, 150, 243, 0.25);
    outline-offset: 2px;
  }

  /* =========================================================
     LOADING SPINNER
  ========================================================= */

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

  /* =========================================================
     LARGE TABLET
  ========================================================= */

  @media (max-width: 1150px) {
    .category-grid {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }

    .practice-layout {
      grid-template-columns:
        minmax(0, 1fr)
        280px;
    }
  }

  /* =========================================================
     TABLET
  ========================================================= */

  @media (max-width: 950px) {
    .practice-page {
      padding-left: 1.15rem;
      padding-right: 1.15rem;
    }

    .practice-layout {
      grid-template-columns: 1fr;
    }

    .practice-sidebar {
      position: static;

      display: grid;

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 0.85rem;
    }

    .next-question-button {
      min-height: 70px;
    }

    .practice-tracks-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  /* =========================================================
     MOBILE LANDSCAPE / SMALL TABLET
  ========================================================= */

  @media (max-width: 760px) {
    .practice-page {
      padding: 1rem 0.9rem 3rem;
    }

    .practice-tracks-grid {
      grid-template-columns: 1fr;
    }

    .category-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 0.6rem;
    }

    .practice-controls {
      flex-direction: column;

      align-items: stretch;

      gap: 0.85rem;
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

      padding: 1.5rem;
    }

    .evaluation-grid {
      grid-template-columns: 1fr;
    }

    .score-label {
      flex-direction: column;

      gap: 0.25rem;
    }

    .header-stat {
      min-width: 0;
    }
  }

  /* =========================================================
     MOBILE
  ========================================================= */

  @media (max-width: 560px) {
    .practice-page {
      padding:
        0.85rem
        0.7rem
        2.2rem;
    }

    .practice-card,
    .sidebar-card {
      border-radius: 14px;
    }

    .category-grid {
      grid-template-columns: 1fr;

      padding:
        0 0.8rem
        0.9rem;
    }

    .category-card {
      min-height: 116px;

      padding: 0.85rem;
    }

    .section-heading {
      padding:
        0.95rem 0.85rem;
    }

    .section-icon {
      width: 36px;
      height: 36px;
    }

    .difficulty-list {
      display: grid;

      grid-template-columns:
        repeat(3, 1fr);
    }

    .difficulty-button {
      padding:
        0.55rem
        0.35rem;

      text-align: center;
    }

    .difficulty-button strong {
      font-size: 0.62rem;
    }

    .difficulty-button span {
      display: none;
    }

    .question-body {
      min-height: 205px;

      padding: 1.2rem;
    }

    .question-body h2 {
      font-size: 1.04rem;

      line-height: 1.55;
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

    .score-circle {
      padding: 0.5rem 0.7rem;
    }

    .score-circle span {
      font-size: 1.35rem;
    }

    .evaluation-grid {
      gap: 0.7rem;
    }

    .question-meta {
      gap: 0.3rem;
    }

    .meta-badge {
      font-size: 0.6rem;
    }
  }

  /* =========================================================
     EXTRA SMALL DEVICES
  ========================================================= */

  @media (max-width: 380px) {
    .practice-page {
      padding-left: 0.55rem;
      padding-right: 0.55rem;
    }

    .category-grid {
      padding-left: 0.65rem;
      padding-right: 0.65rem;
    }

    .practice-controls {
      padding:
        0.9rem
        0.85rem;
    }

    .difficulty-button strong {
      font-size: 0.58rem;
    }

    .mode-button {
      padding:
        0.55rem
        0.45rem;

      font-size: 0.64rem;
    }

    .question-body h2 {
      font-size: 0.98rem;
    }

    .score-circle span {
      font-size: 1.2rem;
    }
  }

  /* =========================================================
     REDUCED MOTION
  ========================================================= */

  @media (prefers-reduced-motion: reduce) {
    .practice-page *,
    .practice-page *::before,
    .practice-page *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
`}</style>
    </div>
  );
}
