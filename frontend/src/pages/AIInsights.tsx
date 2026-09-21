import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle,
  FileText,
  Lightbulb,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { interviewsApi, type InterviewListItem } from "@/services/apiService";

/* =========================================================
   AI VISUAL
========================================================= */

function AIInsightVisual() {
  return (
    <div className="ai-insight-visual">
      <div className="ai-orbit ai-orbit-one" />
      <div className="ai-orbit ai-orbit-two" />

      <div className="ai-glow" />

      <motion.div
        className="ai-brain-container"
        animate={{
          y: [0, -8, 0],
          rotate: [0, 1.5, 0, -1.5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Brain size={74} strokeWidth={1.5} />

        <div className="ai-pulse-dot dot-one" />
        <div className="ai-pulse-dot dot-two" />
        <div className="ai-pulse-dot dot-three" />
      </motion.div>

      <motion.div
        className="ai-floating-card card-one"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      >
        <BarChart3 size={17} />
        <span>Performance</span>
      </motion.div>

      <motion.div
        className="ai-floating-card card-two"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity }}
      >
        <Sparkles size={17} />
        <span>AI Analysis</span>
      </motion.div>

      <motion.div
        className="ai-floating-card card-three"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity }}
      >
        <Target size={17} />
        <span>Growth</span>
      </motion.div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyInsights({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="insights-empty-state"
    >
      <div className="empty-icon-wrapper">
        <Lightbulb size={38} />
      </div>

      <h2>No AI insights yet</h2>

      <p>
        Complete your first interview and InterviewerBuddy AI will analyze your
        performance, strengths, weaknesses, and improvement areas.
      </p>

      <button onClick={onStart} className="insights-primary-btn">
        <Zap size={18} />
        Start Your First Interview
        <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="insight-stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
    >
      <div className="insight-stat-icon">{icon}</div>

      <div className="insight-stat-content">
        <span>{label}</span>

        <strong>{value}</strong>

        <small>{description}</small>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AIInsights() {
  const navigate = useNavigate();

  const {
    data: interviews = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InterviewListItem[]>({
    queryKey: ["interviews"],
    queryFn: interviewsApi.list,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="ai-insights-page">
        <div className="insights-loading-hero">
          <div>
            <div className="skeleton loading-title" />
            <div className="skeleton loading-subtitle" />
          </div>

          <div className="skeleton loading-visual" />
        </div>

        <div className="loading-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton loading-card" />
          ))}
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="insights-error-state">
        <div className="error-icon-wrapper">
          <AlertCircle size={38} />
        </div>

        <h2>Unable to load insights</h2>

        <p>
          We couldn't fetch your interview data right now. Please try again.
        </p>

        <button onClick={() => refetch()} className="insights-primary-btn">
          <RefreshCw size={17} />
          Retry
        </button>
      </div>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const completed = interviews.filter(
    (i) => i.status === "completed" && i.score != null,
  );

  if (completed.length === 0) {
    return (
      <div className="ai-insights-page">
        <EmptyInsights onStart={() => navigate("/interview/setup")} />
      </div>
    );
  }

  const scores = completed.map((i) => i.score ?? 0);

  const avgScore = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length,
  );

  const best = Math.max(...scores);

  const improving =
    completed.length >= 2
      ? (completed[completed.length - 1].score ?? 0) > (completed[0].score ?? 0)
      : false;

  const highScoreInterviews = completed.filter((i) => (i.score ?? 0) >= 80);

  const lowScoreInterviews = completed.filter((i) => (i.score ?? 0) < 70);

  const strongTypes = [...new Set(highScoreInterviews.map((i) => i.type))];

  const weakTypes = [...new Set(lowScoreInterviews.map((i) => i.type))];

  /* =======================================================
     SCORE LABEL
  ======================================================= */

  const getScoreMessage = () => {
    if (avgScore >= 80) {
      return "Your interview performance is consistently strong.";
    }

    if (avgScore >= 70) {
      return "You have a solid foundation with room to improve.";
    }

    return "Focus on consistent practice to strengthen your performance.";
  };

  return (
    <div className="ai-insights-page">
      {/* =================================================
          HERO
      ================================================= */}

      <motion.section
        className="insights-hero"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            AI-Powered Performance Analysis
          </div>

          <h1>
            Your Interview
            <span> Intelligence</span>
          </h1>

          <p className="hero-description">
            Get a clearer picture of your interview performance, discover your
            strengths, and identify where you can improve.
          </p>

          <div className="hero-session-info">
            <div className="hero-session-icon">
              <CheckCircle size={17} />
            </div>

            <div>
              <strong>
                {completed.length} completed session
                {completed.length !== 1 ? "s" : ""}
              </strong>

              <span>{getScoreMessage()}</span>
            </div>
          </div>

          <div className="hero-actions">
            <button
              onClick={() => navigate("/practice")}
              className="insights-primary-btn"
            >
              <Zap size={17} />
              Practice Now
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="insights-secondary-btn"
            >
              <FileText size={17} />
              View Reports
            </button>
          </div>
        </div>

        <AIInsightVisual />
      </motion.section>

      {/* =================================================
          QUICK STATS
      ================================================= */}

      <section className="insights-stats-grid">
        <StatCard
          icon={<BarChart3 size={21} />}
          label="Average Score"
          value={`${avgScore}%`}
          description={`Across ${completed.length} session${completed.length !== 1 ? "s" : ""}`}
          delay={0.1}
        />

        <StatCard
          icon={<Trophy size={21} />}
          label="Best Session"
          value={`${best}%`}
          description="Your highest score"
          delay={0.15}
        />

        <StatCard
          icon={<TrendingUp size={21} />}
          label="Current Trend"
          value={
            completed.length >= 2
              ? improving
                ? "↑ Improving"
                : "↓ Review"
              : "—"
          }
          description={
            completed.length >= 2
              ? "Based on recent sessions"
              : "Complete another session"
          }
          delay={0.2}
        />

        <StatCard
          icon={<Target size={21} />}
          label="Sessions"
          value={completed.length}
          description="Completed interviews"
          delay={0.25}
        />
      </section>

      {/* =================================================
          SCORE OVERVIEW
      ================================================= */}

      <motion.section
        className="score-overview-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">PERFORMANCE</span>

            <h2>Overall performance</h2>

            <p>Your average score across completed interviews.</p>
          </div>

          <div className="large-score">
            <strong>{avgScore}</strong>
            <span>/100</span>
          </div>
        </div>

        <div className="score-progress-wrapper">
          <div className="score-progress-track">
            <motion.div
              className="score-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${avgScore}%` }}
              transition={{
                duration: 1.2,
                delay: 0.5,
                ease: "easeOut",
              }}
            />
          </div>

          <div className="score-progress-labels">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </motion.section>

      {/* =================================================
          STRENGTHS
      ================================================= */}

      {strongTypes.length > 0 && (
        <motion.section
          className="insight-section strengths-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">STRENGTHS</span>

              <h2>Where you're performing well</h2>

              <p>Interview categories where you've achieved strong scores.</p>
            </div>

            <div className="section-heading-icon">
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="insight-types-grid">
            {strongTypes.map((type, index) => (
              <motion.div
                key={type}
                className="insight-type-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.08 }}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
              >
                <div className="type-icon success">
                  <CheckCircle size={18} />
                </div>

                <div>
                  <strong>{type}</strong>
                  <span>Strong performance area</span>
                </div>

                <ArrowRight size={16} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* =================================================
          IMPROVEMENTS
      ================================================= */}

      {weakTypes.length > 0 && (
        <motion.section
          className="insight-section improvement-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">FOCUS AREAS</span>

              <h2>Areas to improve</h2>

              <p>Categories where additional practice may help.</p>
            </div>

            <div className="section-heading-icon warning">
              <AlertTriangle size={22} />
            </div>
          </div>

          <div className="insight-types-grid">
            {weakTypes.map((type, index) => (
              <motion.div
                key={type}
                className="insight-type-card improvement-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + index * 0.08 }}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
              >
                <div className="type-icon warning">
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <strong>{type}</strong>
                  <span>Consider more practice</span>
                </div>

                <ArrowRight size={16} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* =================================================
          RECOMMENDATIONS
      ================================================= */}

      <motion.section
        className="recommendations-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">NEXT STEPS</span>

            <h2>Recommended for you</h2>

            <p>Continue building your interview skills.</p>
          </div>

          <div className="section-heading-icon">
            <Target size={22} />
          </div>
        </div>

        <div className="recommendations-grid">
          <RecommendationCard
            icon={<Zap size={20} />}
            title="Start a new interview"
            description="Test your skills with another AI-powered interview."
            action="New Interview"
            onClick={() => navigate("/interview/setup")}
          />

          <RecommendationCard
            icon={<BookOpen size={20} />}
            title={
              weakTypes.length > 0
                ? `Practice ${weakTypes[0]}`
                : "Practice your skills"
            }
            description={
              weakTypes.length > 0
                ? "Spend more time on one of your improvement areas."
                : "Keep practicing to build stronger interview consistency."
            }
            action="Practice Now"
            onClick={() => navigate("/practice")}
          />

          <RecommendationCard
            icon={<FileText size={20} />}
            title="Review your reports"
            description="Look back at previous interview evaluations."
            action="View Reports"
            onClick={() => navigate("/reports")}
          />

          <RecommendationCard
            icon={<Route size={20} />}
            title="Follow your roadmap"
            description="Use your career roadmap to structure your preparation."
            action="View Roadmap"
            onClick={() => navigate("/career-roadmap")}
          />
        </div>
      </motion.section>

      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      <motion.section
        className="insights-bottom-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        <div className="cta-icon">
          <Brain size={25} />
        </div>

        <div className="cta-content">
          <h3>Ready for your next interview?</h3>
          <p>Practice consistently and use your AI insights to improve.</p>
        </div>

        <button
          onClick={() => navigate("/practice")}
          className="insights-primary-btn"
        >
          Start Practice
          <ArrowRight size={16} />
        </button>
      </motion.section>
    </div>
  );
}

/* =========================================================
   RECOMMENDATION CARD
========================================================= */

function RecommendationCard({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="recommendation-card"
      whileHover={{
        y: -6,
      }}
      onClick={onClick}
    >
      <div className="recommendation-icon">{icon}</div>

      <div className="recommendation-content">
        <h3>{title}</h3>

        <p>{description}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="recommendation-action"
        >
          {action}
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
