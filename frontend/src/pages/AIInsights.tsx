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
      <div className="ai-visual-glow" />

      <motion.div
        className="ai-insight-image-card"
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="ai-image-badge">
          <Sparkles size={14} />
          AI Analysis
        </div>

        <div className="ai-image-wrapper">
          <img
            src="/images/landing/tech.png"
            alt="AI powered interview analysis"
            className="ai-insight-image"
          />
        </div>

        <div className="ai-image-overlay">
          <div className="ai-image-title">
            <span>Interview Intelligence</span>
            <strong>AI-powered insights</strong>
          </div>

          <div className="ai-image-status">
            <span />
            Active
          </div>
        </div>
      </motion.div>

      <motion.div
        className="ai-floating-card card-one"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <BarChart3 size={17} />
        <span>Performance</span>
      </motion.div>

      <motion.div
        className="ai-floating-card card-two"
        animate={{ y: [0, 7, 0] }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={17} />
        <span>AI Analysis</span>
      </motion.div>

      <motion.div
        className="ai-floating-card card-three"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
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
          RESPONSIVE / IMAGE STYLES
      ================================================= */}

      <style>{`
        .ai-insights-page {
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
        }

        .insights-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
          align-items: center;
          gap: 40px;
        }

        .hero-content {
          min-width: 0;
        }

        .hero-description {
          max-width: 680px;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* IMAGE */

        .ai-insight-visual {
          position: relative;
          width: min(100%, 520px);
          min-height: 390px;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        .ai-visual-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(33, 150, 243, 0.22) 0%,
            rgba(144, 202, 249, 0.12) 42%,
            transparent 72%
          );
          filter: blur(12px);
          z-index: -1;
        }

        .ai-insight-image-card {
          position: relative;
          width: min(100%, 390px);
          padding: 12px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(144, 202, 249, 0.45);
          box-shadow:
            0 25px 60px rgba(13, 71, 161, 0.12),
            0 8px 25px rgba(33, 150, 243, 0.08);
          backdrop-filter: blur(18px);
        }

        .ai-image-badge {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 3;

          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 7px 11px;
          border-radius: 999px;

          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(33, 150, 243, 0.2);

          color: #0D47A1;
          font-size: 12px;
          font-weight: 700;

          box-shadow: 0 8px 20px rgba(13, 71, 161, 0.1);
        }

        .ai-image-wrapper {
          position: relative;
          width: 100%;
          height: 310px;
          overflow: hidden;
          border-radius: 20px;
          background: #E3F2FD;
        }

        .ai-insight-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s ease;
        }

        .ai-insight-image-card:hover .ai-insight-image {
          transform: scale(1.035);
        }

        .ai-image-overlay {
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 24px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;

          padding: 13px 15px;
          border-radius: 16px;

          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(144, 202, 249, 0.4);

          box-shadow: 0 10px 25px rgba(13, 71, 161, 0.1);
          backdrop-filter: blur(12px);
        }

        .ai-image-title {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .ai-image-title span {
          color: #64748B;
          font-size: 11px;
          font-weight: 600;
        }

        .ai-image-title strong {
          color: #0D47A1;
          font-size: 14px;
          font-weight: 800;
        }

        .ai-image-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          color: #0D47A1;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .ai-image-status span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2196F3;
          box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.12);
        }

        /* FLOATING CARDS */

        .ai-floating-card {
          position: absolute;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 10px 13px;

          border-radius: 13px;

          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(144, 202, 249, 0.42);

          color: #0D47A1;
          font-size: 12px;
          font-weight: 700;

          box-shadow: 0 12px 30px rgba(13, 71, 161, 0.12);
          backdrop-filter: blur(12px);

          z-index: 4;
        }

        .ai-floating-card svg {
          color: #2196F3;
        }

        .ai-floating-card.card-one {
          top: 58px;
          left: 0;
        }

        .ai-floating-card.card-two {
          top: 50%;
          right: -5px;
        }

        .ai-floating-card.card-three {
          bottom: 50px;
          left: 15px;
        }

        /* TABLET */

        @media (max-width: 1100px) {
          .insights-hero {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .ai-insight-visual {
            width: 100%;
            min-height: 350px;
            margin: 0 auto;
          }

          .ai-insight-image-card {
            width: min(100%, 430px);
          }

          .insights-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .recommendations-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* MOBILE */

        @media (max-width: 720px) {
          .ai-insights-page {
            width: 100%;
            padding: 0;
            overflow-x: hidden;
          }

          .insights-hero {
            padding: 22px 18px;
            border-radius: 22px;
            gap: 18px;
          }

          .hero-content h1 {
            font-size: clamp(28px, 8vw, 40px);
            line-height: 1.08;
          }

          .hero-description {
            font-size: 14px;
            line-height: 1.6;
          }

          .hero-actions {
            width: 100%;
            flex-direction: column;
          }

          .hero-actions button {
            width: 100%;
            justify-content: center;
          }

          .ai-insight-visual {
            min-height: 315px;
            margin-top: 5px;
          }

          .ai-insight-image-card {
            width: min(100%, 360px);
            padding: 9px;
            border-radius: 22px;
          }

          .ai-image-wrapper {
            height: 245px;
            border-radius: 16px;
          }

          .ai-image-badge {
            top: 18px;
            left: 18px;
          }

          .ai-image-overlay {
            left: 18px;
            right: 18px;
            bottom: 18px;
            padding: 10px 12px;
          }

          .ai-floating-card {
            padding: 8px 10px;
            font-size: 10px;
          }

          .ai-floating-card.card-one {
            top: 35px;
            left: -3px;
          }

          .ai-floating-card.card-two {
            top: auto;
            right: -2px;
            bottom: 68px;
          }

          .ai-floating-card.card-three {
            bottom: 18px;
            left: 4px;
          }

          .insights-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .insight-stat-card {
            min-height: auto;
          }

          .section-heading {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .large-score {
            align-self: flex-start;
          }

          .insight-types-grid {
            grid-template-columns: 1fr;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .insights-bottom-cta {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .insights-bottom-cta .insights-primary-btn {
            width: 100%;
            justify-content: center;
          }
        }

        /* SMALL MOBILE */

        @media (max-width: 460px) {
          .insights-hero {
            padding: 18px 14px;
            border-radius: 18px;
          }

          .hero-badge {
            font-size: 10px;
            padding: 6px 9px;
          }

          .hero-session-info {
            padding: 11px;
          }

          .ai-insight-visual {
            min-height: 280px;
          }

          .ai-insight-image-card {
            width: calc(100% - 30px);
          }

          .ai-image-wrapper {
            height: 210px;
          }

          .ai-floating-card.card-one {
            left: -5px;
          }

          .ai-floating-card.card-two {
            right: -5px;
          }

          .ai-floating-card.card-three {
            display: none;
          }

          .ai-image-title strong {
            font-size: 12px;
          }

          .ai-image-status {
            display: none;
          }

          .recommendation-card {
            padding: 16px;
          }
        }
      `}</style>

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
          description={`Across ${completed.length} session${
            completed.length !== 1 ? "s" : ""
          }`}
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
