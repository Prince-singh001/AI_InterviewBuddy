import { dashboardApi, type RecentInterview } from "@/services/apiService";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock3,
  FileText,
  Flame,
  Lightbulb,
  RefreshCw,
  Route,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const BLUE = {
  light: "#E3F2FD",
  soft: "#90CAF9",
  primary: "#2196F3",
  deep: "#0D47A1",
  white: "#FFFFFF",
};

const clamp = (value: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100);

function formatDate(value?: string) {
  if (!value) return "Recent session";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent session";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(value?: string) {
  if (!value) return "Session";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Session";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({ score, size = 150 }: { score: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamp(score) / 100);

  return (
    <div
      className="ai-score-ring"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={BLUE.light}
          strokeWidth={stroke}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={BLUE.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="ring-value">
        <strong>{Math.round(score)}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

/* =========================================================
   TREND CHART
========================================================= */

function TrendChart({
  interviews,
}: {
  interviews: Array<RecentInterview & { numericScore: number }>;
}) {
  const width = 800;
  const height = 270;

  const left = 48;
  const right = 22;
  const top = 24;
  const bottom = 48;

  const innerW = width - left - right;
  const innerH = height - top - bottom;

  const points = interviews.map((item, index) => ({
    x:
      interviews.length === 1
        ? left + innerW / 2
        : left + (index / (interviews.length - 1)) * innerW,

    y: top + (1 - clamp(item.numericScore) / 100) * innerH,

    item,
  }));

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const area =
    points.length > 1
      ? `${path} L ${points[points.length - 1].x} ${
          height - bottom
        } L ${points[0].x} ${height - bottom} Z`
      : "";

  return (
    <div className="trend-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="trend-svg"
        role="img"
        aria-label="Interview score progression"
      >
        <defs>
          <linearGradient id="aiTrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#90CAF9" stopOpacity=".48" />

            <stop offset="100%" stopColor="#E3F2FD" stopOpacity=".04" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((value) => {
          const y = top + (1 - value / 100) * innerH;

          return (
            <g key={value}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="#E3F2FD"
                strokeWidth="1"
              />

              <text
                x={left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#627D98"
              >
                {value}
              </text>
            </g>
          );
        })}

        {area && <path d={area} fill="url(#aiTrendFill)" />}

        {path && (
          <motion.path
            d={path}
            fill="none"
            stroke={BLUE.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: 1,
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          />
        )}

        {points.map(({ x, y, item }, index) => (
          <g key={`${item.id}-${index}`}>
            <circle
              cx={x}
              cy={y}
              r="9"
              fill="#FFFFFF"
              stroke={BLUE.primary}
              strokeWidth="3"
            />

            <circle cx={x} cy={y} r="3" fill={BLUE.deep} />

            <text
              x={x}
              y={height - 15}
              textAnchor="middle"
              fontSize="11"
              fill="#627D98"
            >
              {formatShortDate(item.date)}
            </text>
          </g>
        ))}
      </svg>

      {interviews.length < 2 && (
        <div className="chart-note">
          Complete another interview to unlock a meaningful performance trend.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <motion.div
      className="stat-card"
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
    >
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </motion.div>
  );
}

/* =========================================================
   METRIC BAR
========================================================= */

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <div className="metric-heading">
        <span>{label}</span>
        <b>{Math.round(value)}%</b>
      </div>

      <div className="metric-track">
        <motion.i
          initial={{
            width: 0,
          }}
          animate={{
            width: `${clamp(value)}%`,
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SESSION ROW
========================================================= */

function SessionRow({
  interview,
}: {
  interview: RecentInterview & {
    numericScore: number;
  };
}) {
  const score = interview.numericScore;

  const tone = score >= 80 ? "good" : score >= 60 ? "mid" : "low";

  const label =
    score >= 80
      ? "Excellent"
      : score >= 70
        ? "Strong"
        : score >= 60
          ? "Developing"
          : "Needs practice";

  return (
    <motion.div
      className="session-row"
      whileHover={{
        x: 3,
      }}
    >
      <div className={`session-score ${tone}`}>{Math.round(score)}</div>

      <div className="session-info">
        <strong>{interview.role || "Interview Session"}</strong>

        <span>
          {interview.type || "General"} · {interview.difficulty || "Standard"}
        </span>
      </div>

      <div className="session-date">
        <span>{formatDate(interview.date)}</span>
        <b>{label}</b>
      </div>
    </motion.div>
  );
}

/* =========================================================
   ACTION CARD
========================================================= */

function ActionCard({
  icon,
  title,
  text,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="action-card"
      whileHover={{
        y: -5,
      }}
      onClick={onClick}
    >
      <div className="action-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        {action}
        <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}

/* =========================================================
   PANEL HEADER
========================================================= */

function PanelHead({
  kicker,
  title,
  text,
  icon,
}: {
  kicker: string;
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div className="panel-head">
      <div>
        <span className="eyebrow">{kicker}</span>

        <h2>{title}</h2>

        <p>{text}</p>
      </div>

      <div className="panel-icon">{icon}</div>
    </div>
  );
}

/* =========================================================
   BREAKDOWN
========================================================= */

function Break({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="break">
      <div>{icon}</div>

      <span>{label}</span>

      <b>{Math.round(value)}%</b>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="placeholder">
      <Lightbulb size={17} />
      {text}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AIInsights() {
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (isLoading) {
    return (
      <PageShell>
        <div className="loading-hero">
          <div>
            <div className="skeleton skeleton-small" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-buttons" />
          </div>

          <div className="skeleton skeleton-image" />
        </div>

        <div className="loading-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="skeleton loading-card" key={item} />
          ))}
        </div>

        <div className="loading-large">
          <div className="skeleton skeleton-large" />
          <div className="skeleton skeleton-large" />
        </div>
      </PageShell>
    );
  }

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  if (isError || !dashboard) {
    return (
      <PageShell>
        <div className="empty-state">
          <div className="empty-icon">
            <AlertCircle size={36} />
          </div>

          <span className="eyebrow">AI PERFORMANCE CENTER</span>

          <h2>Unable to load insights</h2>

          <p>
            We couldn't fetch your interview performance right now. Please try
            again.
          </p>

          <button className="primary" onClick={() => refetch()}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </PageShell>
    );
  }

  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const recent = Array.isArray(dashboard.recent_interviews)
    ? dashboard.recent_interviews
    : [];

  const completed = recent.filter(
    (interview) =>
      interview.status?.toLowerCase() === "completed" &&
      interview.score != null &&
      Number.isFinite(Number(interview.score)),
  );

  /* -------------------------------------------------------
     EMPTY
  ------------------------------------------------------- */

  if (!completed.length) {
    return (
      <PageShell>
        <div className="empty-state empty-insights">
          <div className="empty-image">
            <img
              src="/images/landing/history.png"
              alt="Interview performance history"
            />
          </div>

          <span className="eyebrow">AI PERFORMANCE CENTER</span>

          <h2>No AI insights yet</h2>

          <p>
            Complete your first interview and InterviewerBuddy AI will transform
            your performance into actionable preparation insights.
          </p>

          <button
            className="primary"
            onClick={() => navigate("/interview/setup")}
          >
            <Zap size={17} />
            Start Your First Interview
            <ArrowRight size={16} />
          </button>
        </div>
      </PageShell>
    );
  }

  /* -------------------------------------------------------
     CALCULATIONS
  ------------------------------------------------------- */

  const scored = completed.map((interview) => ({
    ...interview,
    numericScore: Number(interview.score),
  }));

  const chronological = [...scored].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
  );

  const scores = scored.map((interview) => interview.numericScore);

  const avg = Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length,
  );

  const best = Math.max(...scores);
  const lowest = Math.min(...scores);

  const first = chronological[0]?.numericScore || 0;

  const latest = chronological[chronological.length - 1]?.numericScore || 0;

  const delta = chronological.length > 1 ? Math.round(latest - first) : 0;

  const strongTypes = [
    ...new Set(
      scored
        .filter((interview) => interview.numericScore >= 80)
        .map((interview) => interview.type)
        .filter(Boolean),
    ),
  ];

  const weakTypes = [
    ...new Set(
      scored
        .filter((interview) => interview.numericScore < 70)
        .map((interview) => interview.type)
        .filter(Boolean),
    ),
  ];

  const consistency =
    scores.length > 1
      ? clamp(
          Math.round(
            100 -
              scores.reduce((sum, score) => sum + Math.abs(score - avg), 0) /
                scores.length,
          ),
        )
      : avg;

  const readiness = clamp(
    Math.round(
      avg * 0.65 +
        (best >= 80 ? 20 : best >= 70 ? 14 : 8) +
        (completed.length >= 5 ? 15 : completed.length >= 3 ? 10 : 5),
    ),
  );

  const latestInterview = chronological[chronological.length - 1];

  return (
    <PageShell>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="page-header">
        <div>
          <span className="eyebrow">
            AI PERFORMANCE CENTER
          </span>

          <h1>Interview Insights</h1>

          <p>
            Understand your performance, track progress, and turn every
            interview into a smarter preparation plan.
          </p>
        </div>

        <div className="header-actions">
          <button className="outline" onClick={() => refetch()}>
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            className="primary"
            onClick={() => navigate("/interview/setup")}
          >
            <Zap size={15} />
            New Interview
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-badge">
            AI-powered analysis
          </span>

          <h2>
            Your interview
            <br />
            <span>intelligence.</span>
          </h2>

          <p>
            Every completed session becomes a signal you can use to improve.
            Your current average is <b>{avg}%</b> with a best score of{" "}
            <b>{best}%</b>.
          </p>

          <div className="hero-kpis">
            <div>
              <b>{completed.length}</b>
              <span>Sessions</span>
            </div>

            <div>
              <b>{avg}%</b>
              <span>Average</span>
            </div>

            <div>
              <b>{best}%</b>
              <span>Best</span>
            </div>

            <div>
              <b>{delta > 0 ? `+${delta}` : delta}%</b>
              <span>Trend</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="primary" onClick={() => navigate("/practice")}>
              <BookOpen size={16} />
              Practice Now
              <ArrowRight size={15} />
            </button>

            <button className="secondary" onClick={() => navigate("/reports")}>
              <FileText size={16} />
              View Reports
            </button>
          </div>
        </div>

        {/* IMAGE FEATURE */}
        <div className="hero-image-area">
          <div className="image-glow" />

          <motion.div
            className="insight-image-card"
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <div className="image-card-top">
              <span>
                <span className="status-dot" />
                AI Analysis
              </span>
            </div>

            <img
              src="/images/landing/history.png"
              alt="Interview performance analytics"
              className="insight-main-image"
            />

            <div className="image-card-footer">
              <div>
                <small>Current score</small>
                <strong>{latest}%</strong>
              </div>

              <div className="mini-progress">
                <i
                  style={{
                    width: `${clamp(latest)}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          <div className="floating-card floating-one">
            <BarChart3 size={15} />
            <span>Performance</span>
          </div>

          <div className="floating-card floating-two">
            <Brain size={15} />
            <span>AI Analysis</span>
          </div>

          <div className="floating-card floating-three">
            <Target size={15} />
            <span>Growth</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="stats">
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Average Score"
          value={`${avg}%`}
          note={`Across ${completed.length} session${
            completed.length > 1 ? "s" : ""
          }`}
        />

        <StatCard
          icon={<Trophy size={20} />}
          label="Best Score"
          value={`${best}%`}
          note="Highest recorded result"
        />

        <StatCard
          icon={
            delta > 0 ? (
              <TrendingUp size={20} />
            ) : delta < 0 ? (
              <TrendingDown size={20} />
            ) : (
              <Target size={20} />
            )
          }
          label="Performance Trend"
          value={
            completed.length > 1 ? `${delta > 0 ? "+" : ""}${delta}%` : "—"
          }
          note="First vs latest session"
        />

        <StatCard
          icon={<Target size={20} />}
          label="Readiness"
          value={`${readiness}%`}
          note="Practice-based indicator"
        />
      </section>

      {/* =====================================================
          TREND + READINESS
      ===================================================== */}

      <section className="main-grid">
        <div className="panel">
          <PanelHead
            kicker="PERFORMANCE TREND"
            title="Score progression"
            text="Your interview scores across completed sessions."
            icon={<TrendingUp size={19} />}
          />

          <TrendChart interviews={chronological} />
        </div>

        <div className="panel">
          <PanelHead
            kicker="PREPARATION"
            title="Readiness snapshot"
            text="A simple view based on recorded performance."
            icon={<Target size={19} />}
          />

          <div className="readiness">
            <ScoreRing score={readiness} />

            <b>
              {readiness >= 80
                ? "Interview ready"
                : readiness >= 65
                  ? "Building confidence"
                  : "Keep practicing"}
            </b>

            <span>
              {completed.length} analyzed session
              {completed.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="metrics">
            <MetricBar label="Average performance" value={avg} />

            <MetricBar label="Best performance" value={best} />

            <MetricBar label="Consistency" value={consistency} />
          </div>
        </div>
      </section>

      {/* =====================================================
          PERFORMANCE BREAKDOWN
      ===================================================== */}

      <section className="panel">
        <PanelHead
          kicker="PERFORMANCE BREAKDOWN"
          title="What your numbers say"
          text="Key markers from your completed interviews."
          icon={<BarChart3 size={19} />}
        />

        <div className="breakdown">
          <Break label="Average" value={avg} icon={<BarChart3 size={17} />} />

          <Break label="Best" value={best} icon={<Trophy size={17} />} />

          <Break label="Lowest" value={lowest} icon={<Target size={17} />} />

          <Break
            label="Consistency"
            value={consistency}
            icon={<CheckCircle size={17} />}
          />
        </div>
      </section>

      {/* =====================================================
          STRENGTHS + FOCUS AREAS
      ===================================================== */}

      <section className="two-col">
        <div className="panel">
          <PanelHead
            kicker="STRENGTHS"
            title="Where you're performing well"
            text="Categories with stronger recorded results."
            icon={<CheckCircle size={19} />}
          />

          {strongTypes.length ? (
            <div className="type-list">
              {strongTypes.map((type) => (
                <div className="type-row" key={type}>
                  <div className="type-icon good">
                    <CheckCircle size={17} />
                  </div>

                  <div>
                    <b>{type}</b>
                    <span>Strong performance area</span>
                  </div>

                  <ChevronRight size={16} />
                </div>
              ))}
            </div>
          ) : (
            <Placeholder text="Keep practicing to identify consistently strong categories." />
          )}
        </div>

        <div className="panel">
          <PanelHead
            kicker="FOCUS AREAS"
            title="Where to improve"
            text="Categories that may benefit from more repetition."
            icon={<AlertTriangle size={19} />}
          />

          {weakTypes.length ? (
            <div className="type-list">
              {weakTypes.map((type) => (
                <div className="type-row warning-row" key={type}>
                  <div className="type-icon warn">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <b>{type}</b>
                    <span>Additional practice recommended</span>
                  </div>

                  <ChevronRight size={16} />
                </div>
              ))}
            </div>
          ) : (
            <Placeholder text="No clear weak category is visible yet. Continue collecting sessions." />
          )}
        </div>
      </section>

      {/* =====================================================
          AI COACH
      ===================================================== */}

      <section className="coach">
        <div className="coach-image">
          <img src="/images/landing/confi.png" alt="AI interview coaching" />
        </div>

        <div className="coach-content">
          <span className="eyebrow">
            AI COACH SUMMARY
          </span>

          <h2>Your next best move</h2>

          <p>
            {weakTypes.length
              ? `Prioritize ${weakTypes[0]} in your next practice session.`
              : "Keep rotating interview types to maintain balanced preparation."}{" "}
            Your latest score is <b>{latest}%</b>.
          </p>
        </div>

        <button
          className="primary"
          onClick={() =>
            navigate(weakTypes.length ? "/practice" : "/interview/setup")
          }
        >
          {weakTypes.length ? "Practice Focus Area" : "Start Next Interview"}

          <ArrowRight size={15} />
        </button>
      </section>

      {/* =====================================================
          INTERVIEW HISTORY
      ===================================================== */}

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">RECENT ACTIVITY</span>

            <h2>Interview history</h2>

            <p>Your completed sessions and their results.</p>
          </div>

          <button className="text-btn" onClick={() => navigate("/reports")}>
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="sessions">
          {[...chronological]
            .reverse()
            .slice(0, 6)
            .map((interview) => (
              <SessionRow interview={interview} key={interview.id} />
            ))}
        </div>
      </section>

      {/* =====================================================
          RECOMMENDATIONS
      ===================================================== */}

      <section className="recommendations">
        <div className="panel-head">
          <div>
            <span className="eyebrow">NEXT STEPS</span>

            <h2>Recommended for you</h2>

            <p>Turn insights into your next preparation action.</p>
          </div>

          <Route size={20} color={BLUE.primary} />
        </div>

        <div className="actions-grid">
          <ActionCard
            icon={<Zap size={19} />}
            title="New interview"
            text="Test your progress with another AI-powered interview."
            action="Start"
            onClick={() => navigate("/interview/setup")}
          />

          <ActionCard
            icon={<BookOpen size={19} />}
            title={
              weakTypes.length ? `Practice ${weakTypes[0]}` : "Practice skills"
            }
            text="Build stronger interview consistency."
            action="Practice"
            onClick={() => navigate("/practice")}
          />

          <ActionCard
            icon={<FileText size={19} />}
            title="Review reports"
            text="Look back at detailed interview evaluations."
            action="Open reports"
            onClick={() => navigate("/reports")}
          />

          <ActionCard
            icon={<Route size={19} />}
            title="Career roadmap"
            text="Structure your preparation around your goals."
            action="Open roadmap"
            onClick={() => navigate("/career-roadmap")}
          />
        </div>
      </section>

      {/* =====================================================
          FOOTER STATUS
      ===================================================== */}

      <footer className="footer-status">
        <span>
          <i />
          AI Insights synced
        </span>

        <span>
          <CalendarDays size={13} />
          Latest: {formatDate(latestInterview?.date)}
        </span>

        {/* IMPORTANT:
            RecentInterview uses duration, NOT duration_minutes
        */}
        <span>
          <Clock3 size={13} />
          {latestInterview?.duration || "—"}
          {latestInterview?.duration ? "" : " session"}
        </span>

        <span>
          <Flame size={13} />
          Keep practicing
        </span>
      </footer>
    </PageShell>
  );
}

/* =========================================================
   PAGE SHELL
========================================================= */

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="ai-insights-shell">
      <style>{CSS}</style>
      {children}
    </div>
  );
}

/* =========================================================
   CSS
========================================================= */

const CSS = `
.ai-insights-shell{
  min-height:100%;
  width:100%;
  padding:28px clamp(14px,3vw,42px) 42px;
  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(144,202,249,.20),
      transparent 28%
    ),
    linear-gradient(
      180deg,
      #f8fcff 0%,
      #ffffff 48%,
      #f7fbff 100%
    );
  color:#102a43;
}

.ai-insights-shell *,
.ai-insights-shell *::before,
.ai-insights-shell *::after{
  box-sizing:border-box;
}

.page-header,
.hero,
.stats,
.main-grid,
.two-col,
.panel,
.coach,
.recommendations,
.footer-status{
  width:min(1480px,100%);
  margin-left:auto;
  margin-right:auto;
}

.page-header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:20px;
  margin-bottom:20px;
}

.eyebrow{
  display:inline-flex;
  align-items:center;
  gap:6px;
  color:#2196f3;
  font-size:10px;
  font-weight:850;
  letter-spacing:.14em;
  text-transform:uppercase;
}

.page-header h1{
  margin:7px 0 7px;
  color:#0d47a1;
  font-size:clamp(30px,3vw,42px);
  line-height:1;
  font-weight:900;
  letter-spacing:-.04em;
}

.page-header p{
  margin:0;
  color:#627d98;
  font-size:13px;
  line-height:1.6;
}

.header-actions,
.hero-actions{
  display:flex;
  gap:9px;
  flex-wrap:wrap;
}

.primary,
.secondary,
.outline,
.text-btn{
  border:0;
  cursor:pointer;
  font:inherit;
  font-size:12px;
  font-weight:800;
  border-radius:12px;
  min-height:41px;
  padding:0 15px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.primary{
  color:#fff;
  background:
    linear-gradient(
      135deg,
      #2196f3,
      #0d47a1
    );
  box-shadow:
    0 10px 25px
    rgba(33,150,243,.20);
}

.primary:hover{
  transform:translateY(-2px);
  box-shadow:
    0 14px 30px
    rgba(33,150,243,.27);
}

.secondary,
.outline{
  color:#0d47a1;
  background:#fff;
  border:1px solid
    rgba(33,150,243,.16);
}

.secondary:hover,
.outline:hover{
  transform:translateY(-2px);
  border-color:#90caf9;
}

.text-btn{
  padding:0;
  color:#2196f3;
  background:transparent;
  min-height:30px;
}

/* =====================================================
   HERO
===================================================== */

.hero{
  min-height:400px;
  margin-bottom:18px;
  padding:clamp(24px,4vw,44px);
  border-radius:27px;
  display:grid;
  grid-template-columns:1.1fr .9fr;
  align-items:center;
  overflow:hidden;

  background:
    radial-gradient(
      circle at 82% 50%,
      rgba(144,202,249,.32),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff,
      #edf8ff 60%,
      #e3f2fd
    );

  border:1px solid
    rgba(33,150,243,.14);

  box-shadow:
    0 18px 50px
    rgba(13,71,161,.09);
}

.hero-copy{
  max-width:760px;
  position:relative;
  z-index:2;
}

.hero-badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:7px 11px;
  border-radius:99px;
  background:#fff;
  border:1px solid
    rgba(33,150,243,.13);
  color:#0d47a1;
  font-size:10px;
  font-weight:800;
}

.hero h2{
  margin:16px 0 10px;
  color:#0d47a1;
  font-size:clamp(37px,5vw,62px);
  line-height:.96;
  letter-spacing:-.055em;
}

.hero h2 span{
  color:#2196f3;
}

.hero-copy>p{
  max-width:670px;
  margin:0;
  color:#627d98;
  font-size:14px;
  line-height:1.7;
}

.hero-copy>p b{
  color:#0d47a1;
}

.hero-kpis{
  display:grid;
  grid-template-columns:
    repeat(4,minmax(80px,110px));
  gap:8px;
  margin:20px 0;
}

.hero-kpis div{
  padding:10px 12px;
  border-radius:13px;
  background:
    rgba(255,255,255,.72);
  border:1px solid
    rgba(33,150,243,.10);
}

.hero-kpis b,
.hero-kpis span{
  display:block;
}

.hero-kpis b{
  font-size:19px;
  color:#0d47a1;
}

.hero-kpis span{
  margin-top:2px;
  font-size:9px;
  color:#627d98;
}

/* =====================================================
   IMAGE HERO
===================================================== */

.hero-image-area{
  min-height:320px;
  position:relative;
  display:grid;
  place-items:center;
}

.image-glow{
  position:absolute;
  width:260px;
  height:260px;
  border-radius:50%;
  background:
    radial-gradient(
      circle,
      rgba(33,150,243,.20),
      transparent 70%
    );
  filter:blur(3px);
}

.insight-image-card{
  width:min(390px,92%);
  position:relative;
  z-index:2;
  padding:10px;
  border-radius:22px;
  background:
    rgba(255,255,255,.90);
  border:1px solid
    rgba(33,150,243,.16);
  box-shadow:
    0 25px 65px
    rgba(13,71,161,.15);
}

.image-card-top{
  height:36px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 8px;
  color:#0d47a1;
  font-size:10px;
  font-weight:800;
}

.image-card-top span{
  display:flex;
  align-items:center;
  gap:6px;
}

.status-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#27ae60;
  box-shadow:
    0 0 0 4px
    rgba(39,174,96,.10);
}

.insight-main-image{
  width:100%;
  height:205px;
  display:block;
  object-fit:cover;
  object-position:center;
  border-radius:15px;
  background:#e3f2fd;
}

.image-card-footer{
  display:grid;
  grid-template-columns:auto 1fr;
  align-items:center;
  gap:15px;
  padding:12px 8px 5px;
}

.image-card-footer small,
.image-card-footer strong{
  display:block;
}

.image-card-footer small{
  color:#627d98;
  font-size:9px;
}

.image-card-footer strong{
  color:#0d47a1;
  font-size:21px;
}

.mini-progress{
  height:8px;
  border-radius:99px;
  background:#e3f2fd;
  overflow:hidden;
}

.mini-progress i{
  display:block;
  height:100%;
  border-radius:99px;
  background:
    linear-gradient(
      90deg,
      #90caf9,
      #2196f3,
      #0d47a1
    );
}

.floating-card{
  position:absolute;
  z-index:4;
  padding:9px 12px;
  border-radius:12px;
  display:flex;
  align-items:center;
  gap:6px;
  background:#fff;
  color:#0d47a1;
  border:1px solid
    rgba(33,150,243,.12);
  box-shadow:
    0 12px 26px
    rgba(13,71,161,.10);
  font-size:10px;
  font-weight:800;
}

.floating-one{
  left:1%;
  top:16%;
}

.floating-two{
  right:0;
  top:13%;
}

.floating-three{
  right:4%;
  bottom:13%;
}

/* =====================================================
   STATS
===================================================== */

.stats{
  display:grid;
  grid-template-columns:
    repeat(4,1fr);
  gap:12px;
  margin-bottom:18px;
}

.stat-card{
  padding:17px;
  border-radius:18px;
  background:#fff;
  border:1px solid
    rgba(33,150,243,.13);
  box-shadow:
    0 10px 30px
    rgba(13,71,161,.05);
  display:flex;
  gap:11px;
  align-items:center;
}

.stat-icon{
  width:43px;
  height:43px;
  flex:0 0 43px;
  border-radius:13px;
  display:grid;
  place-items:center;
  color:#2196f3;
  background:#e3f2fd;
}

.stat-content{
  min-width:0;
}

.stat-card span,
.stat-card strong,
.stat-card small{
  display:block;
}

.stat-card span{
  font-size:10px;
  color:#627d98;
  font-weight:700;
}

.stat-card strong{
  font-size:24px;
  color:#0d47a1;
  font-weight:900;
}

.stat-card small{
  font-size:9px;
  color:#829ab1;
}

/* =====================================================
   PANELS
===================================================== */

.main-grid{
  display:grid;
  grid-template-columns:1.65fr .8fr;
  gap:18px;
  margin-bottom:18px;
}

.panel{
  padding:22px;
  border-radius:21px;
  background:#fff;
  border:1px solid
    rgba(33,150,243,.13);
  box-shadow:
    0 11px 34px
    rgba(13,71,161,.05);
  margin-bottom:18px;
}

.main-grid .panel{
  margin-bottom:0;
}

.panel-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:14px;
  margin-bottom:18px;
}

.panel-head h2{
  margin:4px 0;
  color:#0d47a1;
  font-size:20px;
  letter-spacing:-.025em;
}

.panel-head p{
  margin:0;
  color:#627d98;
  font-size:11px;
  line-height:1.55;
}

.panel-icon{
  width:40px;
  height:40px;
  flex:0 0 40px;
  display:grid;
  place-items:center;
  border-radius:12px;
  color:#2196f3;
  background:#e3f2fd;
}

/* =====================================================
   TREND
===================================================== */

.trend-wrap{
  width:100%;
  overflow:hidden;
}

.trend-svg{
  width:100%;
  height:auto;
  display:block;
}

.chart-note{
  text-align:center;
  color:#829ab1;
  font-size:10px;
  margin-top:5px;
}

/* =====================================================
   READINESS
===================================================== */

.readiness{
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  padding:2px 0 17px;
}

.readiness>b{
  margin-top:10px;
  color:#0d47a1;
  font-size:16px;
}

.readiness>span{
  margin-top:3px;
  color:#627d98;
  font-size:10px;
}

.ai-score-ring{
  position:relative;
  display:grid;
  place-items:center;
}

.ai-score-ring svg{
  position:absolute;
  inset:0;
}

.ring-value{
  display:flex;
  align-items:baseline;
  gap:1px;
}

.ring-value strong{
  color:#0d47a1;
  font-size:30px;
}

.ring-value span{
  color:#627d98;
  font-size:9px;
}

.metrics{
  display:grid;
  gap:12px;
}

.metric-heading{
  display:flex;
  justify-content:space-between;
  margin-bottom:5px;
}

.metric span{
  color:#627d98;
  font-size:10px;
}

.metric b{
  color:#0d47a1;
  font-size:10px;
}

.metric-track{
  height:7px;
  border-radius:99px;
  background:#e3f2fd;
  overflow:hidden;
}

.metric-track i{
  display:block;
  height:100%;
  border-radius:99px;
  background:
    linear-gradient(
      90deg,
      #90caf9,
      #2196f3,
      #0d47a1
    );
}

/* =====================================================
   BREAKDOWN
===================================================== */

.breakdown{
  display:grid;
  grid-template-columns:
    repeat(4,1fr);
  gap:10px;
}

.break{
  padding:15px;
  border-radius:14px;
  background:#f8fcff;
  border:1px solid
    rgba(33,150,243,.09);
}

.break div{
  width:34px;
  height:34px;
  display:grid;
  place-items:center;
  border-radius:10px;
  color:#2196f3;
  background:#e3f2fd;
}

.break span{
  display:block;
  margin-top:9px;
  color:#627d98;
  font-size:10px;
}

.break b{
  display:block;
  margin-top:2px;
  color:#0d47a1;
  font-size:20px;
}

/* =====================================================
   TYPES
===================================================== */

.two-col{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
}

.two-col .panel{
  margin-bottom:0;
}

.type-list{
  display:grid;
  gap:8px;
}

.type-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px;
  border-radius:13px;
  background:#f8fcff;
  border:1px solid
    rgba(33,150,243,.09);
}

.type-icon{
  width:36px;
  height:36px;
  flex:0 0 36px;
  display:grid;
  place-items:center;
  border-radius:10px;
}

.type-icon.good{
  color:#18864b;
  background:#e9f8ef;
}

.type-icon.warn{
  color:#a86b00;
  background:#fff5dc;
}

.type-row>div:nth-child(2){
  min-width:0;
  flex:1;
}

.type-row b,
.type-row span{
  display:block;
}

.type-row b{
  font-size:12px;
  color:#0d47a1;
}

.type-row span{
  margin-top:2px;
  font-size:9px;
  color:#627d98;
}

.warning-row{
  background:#fffaf0;
  border-color:
    rgba(255,193,7,.13);
}

.placeholder{
  min-height:80px;
  padding:15px;
  border:1px dashed
    rgba(33,150,243,.18);
  border-radius:13px;
  display:flex;
  align-items:center;
  gap:9px;
  color:#627d98;
  font-size:11px;
  line-height:1.5;
}

/* =====================================================
   AI COACH
===================================================== */

.coach{
  padding:18px 21px;
  margin-bottom:18px;
  border-radius:21px;
  display:grid;
  grid-template-columns:74px 1fr auto;
  align-items:center;
  gap:15px;
  background:
    linear-gradient(
      135deg,
      #f2faff,
      #ffffff
    );
  border:1px solid
    rgba(33,150,243,.13);
  overflow:hidden;
}

.coach-image{
  width:70px;
  height:70px;
  border-radius:18px;
  overflow:hidden;
  background:#e3f2fd;
  border:1px solid
    rgba(33,150,243,.15);
}

.coach-image img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}

.coach-content h2{
  margin:4px 0;
  color:#0d47a1;
  font-size:20px;
}

.coach-content p{
  margin:0;
  color:#627d98;
  font-size:11px;
  line-height:1.6;
}

.coach-content p b{
  color:#0d47a1;
}

/* =====================================================
   SESSIONS
===================================================== */

.sessions{
  display:grid;
  gap:8px;
}

.session-row{
  display:grid;
  grid-template-columns:
    46px minmax(0,1fr) auto;
  align-items:center;
  gap:11px;
  padding:10px;
  border-radius:13px;
  background:#f8fcff;
  border:1px solid
    rgba(33,150,243,.08);
  transition:
    background .2s ease;
}

.session-row:hover{
  background:#f1f9ff;
}

.session-score{
  width:42px;
  height:42px;
  display:grid;
  place-items:center;
  border-radius:11px;
  font-size:13px;
  font-weight:900;
  color:#0d47a1;
  background:#e3f2fd;
}

.session-score.good{
  color:#18794e;
  background:#e9f8ef;
}

.session-score.mid{
  color:#8a6100;
  background:#fff5dc;
}

.session-score.low{
  color:#a33a3a;
  background:#fff0f0;
}

.session-info{
  min-width:0;
}

.session-info strong{
  display:block;
  color:#0d47a1;
  font-size:12px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.session-info span{
  display:block;
  margin-top:2px;
  color:#627d98;
  font-size:9px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.session-date{
  text-align:right;
  min-width:105px;
}

.session-date span,
.session-date b{
  display:block;
}

.session-date span{
  font-size:9px;
  color:#627d98;
}

.session-date b{
  margin-top:2px;
  color:#2196f3;
  font-size:9px;
}

/* =====================================================
   RECOMMENDATIONS
===================================================== */

.recommendations{
  margin-bottom:18px;
}

.actions-grid{
  display:grid;
  grid-template-columns:
    repeat(4,1fr);
  gap:11px;
}

.action-card{
  min-height:165px;
  padding:17px;
  border-radius:17px;
  background:#fff;
  border:1px solid
    rgba(33,150,243,.12);
  box-shadow:
    0 9px 28px
    rgba(13,71,161,.04);
  cursor:pointer;
}

.action-icon{
  width:39px;
  height:39px;
  display:grid;
  place-items:center;
  border-radius:11px;
  color:#2196f3;
  background:#e3f2fd;
}

.action-card h3{
  margin:11px 0 5px;
  color:#0d47a1;
  font-size:13px;
}

.action-card p{
  min-height:38px;
  margin:0;
  color:#627d98;
  font-size:10px;
  line-height:1.55;
}

.action-card button{
  margin-top:11px;
  border:0;
  background:transparent;
  padding:0;
  color:#2196f3;
  display:inline-flex;
  align-items:center;
  gap:5px;
  cursor:pointer;
  font:inherit;
  font-size:10px;
  font-weight:800;
}

/* =====================================================
   FOOTER
===================================================== */

.footer-status{
  display:flex;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:9px;
  color:#829ab1;
  font-size:9px;
}

.footer-status span{
  display:inline-flex;
  align-items:center;
  gap:5px;
}

.footer-status i{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#2eaf68;
  box-shadow:
    0 0 0 4px
    rgba(46,175,104,.1);
}

/* =====================================================
   EMPTY STATE
===================================================== */

.empty-state{
  width:min(680px,100%);
  min-height:450px;
  margin:55px auto;
  padding:40px 25px;
  border-radius:24px;
  background:#fff;
  border:1px solid
    rgba(33,150,243,.13);
  box-shadow:
    0 18px 50px
    rgba(13,71,161,.09);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
}

.empty-icon{
  width:72px;
  height:72px;
  display:grid;
  place-items:center;
  border-radius:21px;
  color:#2196f3;
  background:#e3f2fd;
  margin-bottom:15px;
}

.empty-image{
  width:230px;
  height:135px;
  margin-bottom:22px;
  overflow:hidden;
  border-radius:18px;
  border:1px solid
    rgba(33,150,243,.12);
  box-shadow:
    0 15px 35px
    rgba(13,71,161,.08);
}

.empty-image img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.empty-state h2{
  margin:8px 0;
  color:#0d47a1;
  font-size:25px;
}

.empty-state p{
  max-width:480px;
  margin:0 0 20px;
  color:#627d98;
  font-size:12px;
  line-height:1.7;
}

/* =====================================================
   LOADING
===================================================== */

.loading-hero{
  min-height:380px;
  width:min(1480px,100%);
  margin:0 auto 18px;
  padding:35px;
  border-radius:25px;
  background:#fff;
  display:grid;
  grid-template-columns:1fr 380px;
  gap:30px;
  align-items:center;
}

.skeleton{
  border-radius:14px;
  background:
    linear-gradient(
      90deg,
      #edf7fd,
      #f8fcff,
      #edf7fd
    );
  background-size:200% 100%;
  animation:aiSkeleton 1.3s linear infinite;
}

.skeleton-small{
  width:120px;
  height:15px;
  margin-bottom:14px;
}

.skeleton-title{
  width:65%;
  height:45px;
  margin-bottom:15px;
}

.skeleton-text{
  width:80%;
  height:60px;
  margin-bottom:18px;
}

.skeleton-buttons{
  width:210px;
  height:40px;
}

.skeleton-image{
  width:100%;
  height:260px;
}

.loading-grid{
  width:min(1480px,100%);
  margin:auto;
  display:grid;
  grid-template-columns:
    repeat(4,1fr);
  gap:12px;
}

.loading-card{
  height:100px;
}

.loading-large{
  width:min(1480px,100%);
  margin:18px auto;
  display:grid;
  grid-template-columns:1.5fr 1fr;
  gap:18px;
}

.skeleton-large{
  height:300px;
}

@keyframes aiSkeleton{
  from{
    background-position:200% 0;
  }

  to{
    background-position:-200% 0;
  }
}

/* =====================================================
   TABLET
===================================================== */

@media(max-width:1180px){

  .hero{
    grid-template-columns:1fr;
  }

  .hero-image-area{
    min-height:330px;
  }

  .main-grid{
    grid-template-columns:1fr;
  }

  .stats{
    grid-template-columns:
      repeat(2,1fr);
  }

  .actions-grid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .breakdown{
    grid-template-columns:
      repeat(2,1fr);
  }

  .loading-grid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .loading-hero{
    grid-template-columns:1fr;
  }

  .skeleton-image{
    width:70%;
    justify-self:center;
  }
}

/* =====================================================
   MOBILE TABLET
===================================================== */

@media(max-width:820px){

  .ai-insights-shell{
    padding:20px 14px 30px;
  }

  .page-header{
    align-items:flex-start;
    flex-direction:column;
  }

  .header-actions{
    width:100%;
  }

  .header-actions button{
    flex:1;
  }

  .hero{
    padding:25px 20px;
    border-radius:22px;
  }

  .hero-image-area{
    min-height:290px;
  }

  .hero-kpis{
    grid-template-columns:
      repeat(2,1fr);
    max-width:420px;
  }

  .two-col{
    grid-template-columns:1fr;
  }

  .coach{
    grid-template-columns:74px 1fr;
  }

  .coach>.primary{
    grid-column:1/-1;
    width:100%;
  }

  .panel{
    padding:18px;
  }

  .footer-status{
    flex-direction:column;
    align-items:flex-start;
  }

  .actions-grid{
    grid-template-columns:
      repeat(2,1fr);
  }
}

/* =====================================================
   MOBILE
===================================================== */

@media(max-width:560px){

  .ai-insights-shell{
    padding:14px 10px 25px;
  }

  .page-header h1{
    font-size:30px;
  }

  .page-header p{
    font-size:11px;
  }

  .header-actions{
    flex-direction:column;
  }

  .header-actions button{
    width:100%;
  }

  .hero{
    padding:21px 16px;
  }

  .hero h2{
    font-size:42px;
  }

  .hero-copy>p{
    font-size:12px;
  }

  .hero-actions{
    flex-direction:column;
  }

  .hero-actions button{
    width:100%;
  }

  .hero-kpis{
    grid-template-columns:
      repeat(2,1fr);
  }

  .hero-image-area{
    min-height:240px;
  }

  .insight-image-card{
    width:96%;
  }

  .insight-main-image{
    height:170px;
  }

  .floating-card{
    padding:7px 9px;
    font-size:8px;
  }

  .floating-one{
    left:-3%;
  }

  .floating-two{
    right:-3%;
  }

  .floating-three{
    right:0;
    bottom:8%;
  }

  .stats{
    grid-template-columns:
      repeat(2,1fr);
    gap:8px;
  }

  .stat-card{
    padding:12px;
    gap:8px;
  }

  .stat-icon{
    width:36px;
    height:36px;
    flex-basis:36px;
  }

  .stat-card strong{
    font-size:20px;
  }

  .stat-card small{
    font-size:8px;
  }

  .breakdown{
    grid-template-columns:
      repeat(2,1fr);
  }

  .actions-grid{
    grid-template-columns:1fr;
  }

  .session-row{
    grid-template-columns:
      42px minmax(0,1fr);
  }

  .session-date{
    grid-column:2;
    text-align:left;
    display:flex;
    gap:8px;
    align-items:center;
  }

  .session-date b{
    margin-top:0;
  }

  .panel-head h2{
    font-size:18px;
  }

  .coach{
    grid-template-columns:58px 1fr;
    gap:11px;
  }

  .coach-image{
    width:58px;
    height:58px;
  }

  .coach-content h2{
    font-size:17px;
  }

  .empty-state{
    margin:30px auto;
    min-height:380px;
    padding:30px 17px;
  }

  .empty-image{
    width:200px;
    height:115px;
  }

  .loading-grid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .loading-large{
    grid-template-columns:1fr;
  }

  .skeleton-image{
    width:100%;
  }
}

/* =====================================================
   VERY SMALL DEVICES
===================================================== */

@media(max-width:380px){

  .hero h2{
    font-size:36px;
  }

  .stats{
    grid-template-columns:1fr;
  }

  .hero-kpis{
    grid-template-columns:1fr 1fr;
  }

  .hero-kpis div{
    padding:9px;
  }

  .breakdown{
    grid-template-columns:1fr;
  }

  .coach{
    grid-template-columns:1fr;
  }

  .coach-image{
    width:64px;
    height:64px;
  }
}

/* =====================================================
   ACCESSIBILITY
===================================================== */

@media(prefers-reduced-motion:reduce){

  .ai-insights-shell *,
  .ai-insights-shell *::before,
  .ai-insights-shell *::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
    scroll-behavior:auto!important;
  }
}
`;
