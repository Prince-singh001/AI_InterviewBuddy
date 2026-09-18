import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  UserRound,
  Video,
  Zap,
} from "lucide-react";

import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate } from "@/lib/utils";
import { dashboardApi, type DashboardStats } from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  accentColor: string;
  icon: React.ElementType;
  delay?: number;
}

function StatCard({
  label,
  value,
  subtext,
  accentColor,
  icon: Icon,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      whileHover={{
        y: -7,
        scale: 1.015,
      }}
      className="dashboard-stat-card"
      style={
        {
          "--accent": accentColor,
        } as React.CSSProperties
      }
    >
      <div className="stat-card-shine" />

      <div className="stat-card-top">
        <div>
          <p className="stat-card-label">{label}</p>

          <motion.h2
            className="stat-card-value"
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: delay + 0.15,
              duration: 0.35,
            }}
          >
            {value}
          </motion.h2>
        </div>

        <motion.div
          className="stat-icon"
          whileHover={{
            rotate: -8,
            scale: 1.12,
          }}
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </motion.div>
      </div>

      <div className="stat-card-bottom">
        <span
          className="stat-indicator"
          style={{
            backgroundColor: accentColor,
          }}
        />

        <span>{subtext}</span>
      </div>

      <div
        className="stat-glow"
        style={{
          background: `radial-gradient(
            circle,
            ${accentColor}22,
            transparent 68%
          )`,
        }}
      />
    </motion.div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color?: string;
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  color = "#8B5CF6",
}: SectionTitleProps) {
  return (
    <div className="section-title">
      <motion.div
        className="section-icon"
        whileHover={{
          scale: 1.08,
          rotate: -5,
        }}
        style={{
          color,
          backgroundColor: `${color}12`,
          border: `1px solid ${color}25`,
        }}
      >
        <Icon size={18} />
      </motion.div>

      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

function QuickAction({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: QuickActionProps) {
  return (
    <motion.button
      type="button"
      className="quick-action-card"
      onClick={onClick}
      whileHover={{
        y: -5,
      }}
      whileTap={{
        scale: 0.98,
      }}
    >
      <div
        className="quick-action-icon"
        style={{
          color,
          background: `${color}12`,
          borderColor: `${color}25`,
        }}
      >
        <Icon size={19} />
      </div>

      <div className="quick-action-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ChevronRight size={17} className="quick-action-arrow" />
    </motion.button>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-stats">
        {[1, 2, 3, 4].map((item) => (
          <div className="dashboard-stat-card skeleton-card" key={item}>
            <div className="skeleton skeleton-small" />
            <div className="skeleton skeleton-large" />
            <div className="skeleton skeleton-medium" />
          </div>
        ))}
      </div>

      <div className="skeleton-grid">
        <div className="dashboard-panel skeleton-panel">
          <div className="skeleton skeleton-full" />
        </div>

        <div className="dashboard-panel skeleton-panel">
          <div className="skeleton skeleton-full" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  /* ---------------------------------------------------------
     FETCH DASHBOARD DATA
  --------------------------------------------------------- */

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard", user?.id],
    queryFn: dashboardApi.get,
    staleTime: 1000 * 60,
    retry: 1,
  });

  /* ---------------------------------------------------------
     REAL DATA
  --------------------------------------------------------- */

  const hasCompletedInterviews = Boolean(
    stats && stats.interviews_completed > 0,
  );

  const totalInterviews = stats?.interviews_completed ?? 0;

  const avgScoreDisplay =
    hasCompletedInterviews &&
    stats?.average_score !== null &&
    stats?.average_score !== undefined
      ? `${stats.average_score}%`
      : "No data";

  const bestScoreDisplay =
    hasCompletedInterviews &&
    stats?.best_score !== null &&
    stats?.best_score !== undefined
      ? `${stats.best_score}%`
      : "No data";

  const actualName = user?.name?.trim() || "Candidate";

  const firstName = actualName.split(" ")[0] || "Candidate";

  /* ---------------------------------------------------------
     PROFILE COMPLETION
  --------------------------------------------------------- */

  const profileFields = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.targetRole),
    Boolean(user?.skills && user.skills.length > 0),
    Boolean(user?.college),
    Boolean(user?.github || user?.linkedin),
  ];

  const completedProfileCount = profileFields.filter(Boolean).length;

  const profilePercent = Math.round(
    (completedProfileCount / profileFields.length) * 100,
  );

  return (
    <>
      <style>{`

        /* =====================================================
           ROOT
        ===================================================== */

        .professional-dashboard {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 0 0 5rem;
          color: var(--voxa-card-text);
        }

        .professional-dashboard * {
          box-sizing: border-box;
        }

        .professional-dashboard button {
          font-family: inherit;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .dashboard-hero {
          position: relative;
          min-height: 370px;
          display: grid;
          grid-template-columns: 1.18fr .82fr;
          overflow: hidden;
          border-radius: 28px;
          margin-bottom: 20px;
          border: 1px solid var(--voxa-card-border);

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(124,58,237,.18),
              transparent 38%
            ),
            radial-gradient(
              circle at 80% 100%,
              rgba(6,182,212,.12),
              transparent 32%
            ),
            var(--voxa-card-bg);

          box-shadow:
            0 20px 60px rgba(0,0,0,.07);

          isolation: isolate;
        }

        .dashboard-hero::before {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          top: -180px;
          left: 28%;
          border-radius: 50%;
          background: rgba(139,92,246,.08);
          filter: blur(30px);
          animation: heroFloat 8s ease-in-out infinite;
          pointer-events: none;
        }

        .dashboard-hero::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: 28%;
          bottom: -140px;
          border-radius: 50%;
          background: rgba(6,182,212,.08);
          filter: blur(35px);
          animation: heroFloatReverse 10s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes heroFloat {
          0%, 100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(25px, 20px);
          }
        }

        @keyframes heroFloatReverse {
          0%, 100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-20px, -18px);
          }
        }

        .dashboard-hero-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
        }

        .hero-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          margin-bottom: 17px;
          border-radius: 999px;

          color: #8B5CF6;
          background: rgba(139,92,246,.09);
          border: 1px solid rgba(139,92,246,.2);

          font-size: 12px;
          font-weight: 700;
          letter-spacing: .01em;

          box-shadow:
            0 5px 20px rgba(139,92,246,.08);
        }

        .hero-title {
          margin: 0;
          max-width: 720px;

          font-size: clamp(
            2rem,
            4vw,
            3.25rem
          );

          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 850;
        }

        .hero-title span {
          background:
            linear-gradient(
              120deg,
              #7C3AED 0%,
              #8B5CF6 38%,
              #06B6D4 100%
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-hero-description {
          max-width: 650px;
          margin: 18px 0 24px;

          color: var(--text-secondary);

          font-size: .95rem;
          line-height: 1.75;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .primary-dashboard-button,
        .secondary-dashboard-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 44px;
          padding: 0 17px;

          border-radius: 12px;
          cursor: pointer;

          font-size: .84rem;
          font-weight: 750;

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .primary-dashboard-button {
          border: 0;
          color: white;

          background:
            linear-gradient(
              135deg,
              #7C3AED,
              #4F46E5
            );

          box-shadow:
            0 12px 30px rgba(79,70,229,.28);
        }

        .primary-dashboard-button:hover {
          transform: translateY(-3px);

          box-shadow:
            0 17px 38px rgba(79,70,229,.38);
        }

        .secondary-dashboard-button {
          border: 1px solid var(--voxa-card-border);
          color: var(--voxa-card-text);
          background: var(--voxa-card-bg);
        }

        .secondary-dashboard-button:hover {
          transform: translateY(-3px);
          border-color: rgba(139,92,246,.35);
          background: rgba(139,92,246,.06);
        }

        /* =====================================================
           HERO IMAGE
        ===================================================== */

        .dashboard-hero-image-wrapper {
          position: relative;
          min-height: 370px;
          overflow: hidden;
        }

        .dashboard-hero-image {
          width: 100%;
          height: 100%;
          min-height: 370px;
          display: block;

          object-fit: cover;
          object-position: center;

          transition:
            transform 1s cubic-bezier(.16,1,.3,1),
            filter .5s ease;
        }

        .dashboard-hero:hover .dashboard-hero-image {
          transform: scale(1.055);
          filter: saturate(1.08);
        }

        .dashboard-image-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              var(--voxa-card-bg) 0%,
              rgba(255,255,255,.02) 48%,
              rgba(0,0,0,.04) 100%
            );

          pointer-events: none;
        }

        .image-grid-overlay {
          position: absolute;
          inset: 0;
          opacity: .15;

          background-image:
            linear-gradient(
              rgba(255,255,255,.7) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.7) 1px,
              transparent 1px
            );

          background-size: 32px 32px;

          mask-image:
            linear-gradient(
              90deg,
              transparent,
              black
            );

          pointer-events: none;
        }

        .image-floating-card {
          position: absolute;
          right: 22px;
          bottom: 22px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 12px 15px;
          border-radius: 15px;

          color: white;

          background: rgba(15,15,25,.76);
          border: 1px solid rgba(255,255,255,.16);

          backdrop-filter: blur(16px);

          box-shadow:
            0 15px 40px rgba(0,0,0,.25);

          font-size: 12px;
          font-weight: 650;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 auto;

          border-radius: 50%;

          background: #10B981;

          box-shadow:
            0 0 0 5px rgba(16,185,129,.12),
            0 0 16px rgba(16,185,129,.8);

          animation: livePulse 2s infinite;
        }

        @keyframes livePulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.18);
          }
        }

        /* =====================================================
           PROFILE
        ===================================================== */

        .dashboard-profile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
          flex-wrap: wrap;

          padding: 15px 18px;
          margin-bottom: 20px;

          border-radius: 18px;
          border: 1px solid var(--voxa-card-border);
          background: var(--voxa-card-bg);

          box-shadow:
            0 7px 25px rgba(0,0,0,.035);
        }

        .profile-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-avatar {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          color: #8B5CF6;
          background: rgba(139,92,246,.1);
          border: 1px solid rgba(139,92,246,.18);
        }

        .profile-left strong {
          display: block;
          color: var(--voxa-card-text);
          font-size: .88rem;
        }

        .profile-left span {
          display: block;
          margin-top: 3px;
          color: var(--text-muted);
          font-size: .73rem;
        }

        .profile-completion {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .profile-percent {
          color: #8B5CF6;
          font-size: .77rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .profile-progress {
          width: 130px;
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(139,92,246,.12);
        }

        .profile-progress-inner {
          height: 100%;
          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #7C3AED,
              #8B5CF6,
              #06B6D4
            );

          transition:
            width .8s cubic-bezier(.16,1,.3,1);
        }

        /* =====================================================
           QUICK ACTIONS
        ===================================================== */

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 12px;
          margin-bottom: 20px;
        }

        .quick-action-card {
          position: relative;

          display: flex;
          align-items: center;

          gap: 12px;

          width: 100%;
          min-height: 82px;

          padding: 14px;

          text-align: left;

          border-radius: 16px;
          border: 1px solid var(--voxa-card-border);

          background: var(--voxa-card-bg);

          cursor: pointer;
          overflow: hidden;

          color: var(--voxa-card-text);

          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .quick-action-card::before {
          content: "";

          position: absolute;

          width: 100px;
          height: 100px;

          right: -50px;
          top: -50px;

          border-radius: 50%;

          background: rgba(139,92,246,.06);

          transition:
            transform .4s ease;
        }

        .quick-action-card:hover {
          border-color: rgba(139,92,246,.28);

          box-shadow:
            0 15px 35px rgba(0,0,0,.07);

          background:
            linear-gradient(
              135deg,
              var(--voxa-card-bg),
              rgba(139,92,246,.035)
            );
        }

        .quick-action-card:hover::before {
          transform: scale(2.2);
        }

        .quick-action-icon {
          position: relative;
          z-index: 1;

          flex: 0 0 auto;

          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          border: 1px solid;

          transition:
            transform .3s ease;
        }

        .quick-action-card:hover .quick-action-icon {
          transform:
            rotate(-5deg)
            scale(1.08);
        }

        .quick-action-content {
          position: relative;
          z-index: 1;

          min-width: 0;
          flex: 1;
        }

        .quick-action-content strong {
          display: block;

          font-size: .83rem;
          font-weight: 750;
        }

        .quick-action-content span {
          display: block;

          margin-top: 3px;

          color: var(--text-muted);

          font-size: .7rem;
        }

        .quick-action-arrow {
          position: relative;
          z-index: 1;

          flex: 0 0 auto;

          color: var(--text-muted);

          transition:
            transform .25s ease,
            color .25s ease;
        }

        .quick-action-card:hover .quick-action-arrow {
          color: #8B5CF6;
          transform: translateX(4px);
        }

        /* =====================================================
           STATS
        ===================================================== */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 13px;
        }

        .dashboard-stat-card {
          position: relative;

          min-height: 155px;

          padding: 20px;

          overflow: hidden;

          border-radius: 18px;

          border: 1px solid var(--voxa-card-border);

          background: var(--voxa-card-bg);

          box-shadow:
            0 8px 25px rgba(0,0,0,.035);

          transition:
            border-color .3s ease,
            box-shadow .3s ease;

          isolation: isolate;
        }

        .dashboard-stat-card:hover {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 30%,
              var(--voxa-card-border)
            );

          box-shadow:
            0 20px 45px rgba(0,0,0,.10);
        }

        .stat-card-shine {
          position: absolute;

          top: -100px;
          right: -100px;

          width: 180px;
          height: 180px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              var(--accent),
              transparent 68%
            );

          opacity: .06;

          transition:
            transform .5s ease;

          pointer-events: none;
        }

        .dashboard-stat-card:hover
        .stat-card-shine {
          transform: scale(1.4);
        }

        .stat-card-top {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .stat-card-label {
          margin: 0 0 8px;

          color: var(--text-secondary);

          font-size: .76rem;
          font-weight: 650;
        }

        .stat-card-value {
          margin: 0;

          color: var(--voxa-card-text);

          font-size: 1.7rem;
          line-height: 1.1;

          font-weight: 850;
          letter-spacing: -.035em;
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          transition:
            transform .3s ease;
        }

        .stat-card-bottom {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;

          gap: 7px;

          margin-top: 23px;

          color: var(--text-muted);

          font-size: .7rem;
        }

        .stat-indicator {
          width: 6px;
          height: 6px;

          flex: 0 0 auto;

          border-radius: 50%;
        }

        .stat-glow {
          position: absolute;

          width: 130px;
          height: 130px;

          right: -50px;
          bottom: -60px;

          pointer-events: none;

          transition:
            transform .45s ease;
        }

        .dashboard-stat-card:hover
        .stat-glow {
          transform: scale(1.5);
        }

        /* =====================================================
           PANELS
        ===================================================== */

        .dashboard-two-column {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 15px;

          margin-top: 15px;
        }

        .dashboard-panel {
          position: relative;

          min-width: 0;

          padding: 20px;

          border-radius: 20px;

          border: 1px solid var(--voxa-card-border);

          background: var(--voxa-card-bg);

          box-shadow:
            0 8px 30px rgba(0,0,0,.035);

          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .dashboard-panel:hover {
          transform: translateY(-3px);

          border-color:
            rgba(139,92,246,.20);

          box-shadow:
            0 18px 45px rgba(0,0,0,.07);
        }

        .section-title {
          display: flex;
          align-items: center;

          gap: 11px;

          margin-bottom: 18px;
        }

        .section-icon {
          width: 39px;
          height: 39px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex: 0 0 auto;

          border-radius: 11px;

          transition:
            transform .3s ease;
        }

        .section-title h3 {
          margin: 0;

          color: var(--voxa-card-text);

          font-size: .94rem;
          font-weight: 780;
        }

        .section-title p {
          margin: 3px 0 0;

          color: var(--text-muted);

          font-size: .7rem;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .professional-empty {
          min-height: 245px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 20px;
        }

        .empty-icon {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 14px;

          border-radius: 17px;

          color: #8B5CF6;

          background:
            rgba(139,92,246,.08);

          border:
            1px solid rgba(139,92,246,.13);

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .professional-empty:hover
        .empty-icon {
          transform:
            translateY(-5px)
            rotate(-4deg);

          box-shadow:
            0 12px 25px
            rgba(139,92,246,.13);
        }

        .professional-empty h4 {
          margin: 0;

          color: var(--voxa-card-text);

          font-size: .92rem;
          font-weight: 760;
        }

        .professional-empty p {
          max-width: 360px;

          margin: 8px auto 17px;

          color: var(--text-secondary);

          font-size: .78rem;
          line-height: 1.65;
        }

        .small-action-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          padding: 8px 13px;

          border-radius: 10px;

          border:
            1px solid rgba(139,92,246,.22);

          color: #8B5CF6;

          background:
            rgba(139,92,246,.07);

          cursor: pointer;

          font-size: .75rem;
          font-weight: 750;

          transition:
            transform .2s ease,
            background .2s ease;
        }

        .small-action-button:hover {
          transform: translateY(-2px);

          background:
            rgba(139,92,246,.13);
        }

        /* =====================================================
           AI INSIGHTS
        ===================================================== */

        .ai-info-box {
          position: relative;

          padding: 17px;

          overflow: hidden;

          border-radius: 15px;

          color: var(--text-secondary);

          border:
            1px solid rgba(139,92,246,.13);

          background:
            linear-gradient(
              135deg,
              rgba(139,92,246,.08),
              rgba(6,182,212,.035)
            );

          font-size: .79rem;
          line-height: 1.7;
        }

        .ai-info-box::after {
          content: "";

          position: absolute;

          width: 100px;
          height: 100px;

          right: -45px;
          top: -45px;

          border-radius: 50%;

          background:
            rgba(139,92,246,.08);

          filter: blur(8px);
        }

        .ai-insight-metrics {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 10px;

          margin-top: 13px;
        }

        .ai-metric {
          padding: 12px;

          border-radius: 12px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid var(--voxa-card-border);
        }

        .ai-metric span {
          display: block;

          color: var(--text-muted);

          font-size: .66rem;
        }

        .ai-metric strong {
          display: block;

          margin-top: 3px;

          color: var(--voxa-card-text);

          font-size: .88rem;
        }

        /* =====================================================
           RECENT INTERVIEWS
        ===================================================== */

        .recent-panel {
          margin-top: 15px;
        }

        .recent-heading {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;
        }

        .view-all-button {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          border: 0;

          background: transparent;

          color: #8B5CF6;

          cursor: pointer;

          font-size: .75rem;
          font-weight: 750;

          transition:
            transform .2s ease;
        }

        .view-all-button:hover {
          transform: translateX(4px);
        }

        .interview-list {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .interview-item {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 13px;

          border-radius: 14px;

          border:
            1px solid var(--voxa-card-border);

          background:
            rgba(139,92,246,.018);

          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease,
            box-shadow .25s ease;
        }

        .interview-item.clickable {
          cursor: pointer;
        }

        .interview-item.clickable:hover {
          transform: translateX(5px);

          border-color:
            rgba(139,92,246,.28);

          background:
            rgba(139,92,246,.055);

          box-shadow:
            0 8px 25px
            rgba(0,0,0,.045);
        }

        .interview-item-main {
          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;
        }

        .interview-item-icon {
          width: 37px;
          height: 37px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #8B5CF6;

          background:
            rgba(139,92,246,.08);
        }

        .interview-role {
          color: var(--voxa-card-text);

          font-size: .82rem;
          font-weight: 750;
        }

        .interview-details {
          margin-top: 3px;

          color: var(--text-muted);

          font-size: .68rem;
        }

        .interview-right {
          display: flex;

          align-items: center;

          gap: 12px;

          flex: 0 0 auto;
        }

        .interview-date {
          color: var(--text-muted);

          font-size: .67rem;
        }

        .interview-score {
          padding: 5px 9px;

          border-radius: 8px;

          color: #10B981;

          background:
            rgba(16,185,129,.09);

          border:
            1px solid rgba(16,185,129,.15);

          font-size: .73rem;
          font-weight: 800;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .dashboard-error {
          max-width: 520px;

          margin: 4rem auto;

          padding: 3rem 2rem;

          text-align: center;

          border-radius: 20px;

          background:
            var(--voxa-card-bg);

          border:
            1px solid var(--voxa-card-border);

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.06);
        }

        .error-icon {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 15px;

          border-radius: 16px;

          color: #EF4444;

          background:
            rgba(239,68,68,.09);
        }

        .dashboard-error h2 {
          margin: 0 0 7px;

          color: var(--voxa-card-text);

          font-size: 1.1rem;
        }

        .dashboard-error p {
          margin: 0 0 20px;

          color: var(--text-secondary);

          font-size: .8rem;
        }

        /* =====================================================
           SKELETON
        ===================================================== */

        .dashboard-skeleton {
          display: flex;

          flex-direction: column;

          gap: 15px;
        }

        .skeleton-stats {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 13px;
        }

        .skeleton-card {
          opacity: .65;
        }

        .skeleton {
          border-radius: 7px;

          background:
            linear-gradient(
              90deg,
              rgba(128,128,128,.06),
              rgba(128,128,128,.14),
              rgba(128,128,128,.06)
            );

          background-size: 200% 100%;

          animation:
            skeletonLoading 1.4s infinite;
        }

        .skeleton-small {
          width: 40%;
          height: 13px;
        }

        .skeleton-large {
          width: 58%;
          height: 30px;

          margin-top: 15px;
        }

        .skeleton-medium {
          width: 70%;
          height: 11px;

          margin-top: 22px;
        }

        .skeleton-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 15px;
        }

        .skeleton-panel {
          height: 300px;
        }

        .skeleton-full {
          width: 100%;
          height: 100%;
        }

        @keyframes skeletonLoading {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1150px) {

          .dashboard-hero {
            grid-template-columns:
              1fr .72fr;
          }

          .dashboard-hero-content {
            padding: 2.4rem;
          }

          .stats-grid,
          .skeleton-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 900px) {

          .dashboard-hero {
            grid-template-columns:
              1fr;
          }

          .dashboard-hero-image-wrapper {
            height: 260px;
            min-height: 260px;
          }

          .dashboard-hero-image {
            min-height: 260px;
          }

          .dashboard-image-overlay {
            background:
              linear-gradient(
                180deg,
                var(--voxa-card-bg),
                transparent 55%
              );
          }

          .dashboard-two-column,
          .skeleton-grid {
            grid-template-columns:
              1fr;
          }

          .quick-actions-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {

          .professional-dashboard {
            padding-bottom: 3rem;
          }

          .dashboard-hero {
            border-radius: 20px;
          }

          .dashboard-hero-content {
            padding: 1.5rem;
          }

          .hero-title {
            font-size: 1.9rem;
          }

          .dashboard-hero-description {
            font-size: .82rem;
            line-height: 1.65;
          }

          .hero-actions {
            width: 100%;
          }

          .hero-actions button {
            flex: 1;
          }

          .dashboard-hero-image-wrapper {
            height: 220px;
            min-height: 220px;
          }

          .dashboard-hero-image {
            min-height: 220px;
          }

          .image-floating-card {
            right: 12px;
            bottom: 12px;
          }

          .dashboard-profile-row {
            align-items: flex-start;
          }

          .profile-completion {
            width: 100%;
          }

          .profile-progress {
            flex: 1;
          }

          .stats-grid,
          .skeleton-stats {
            grid-template-columns:
              1fr;
          }

          .quick-actions-grid {
            grid-template-columns:
              1fr;
          }

          .dashboard-panel {
            padding: 15px;
            border-radius: 17px;
          }

          .interview-item {
            align-items: flex-start;

            flex-direction: column;
          }

          .interview-right {
            width: 100%;

            justify-content:
              space-between;
          }

          .recent-heading {
            align-items:
              flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              .01ms !important;
          }
        }

      `}</style>

      <main className="professional-dashboard">
        {/* =====================================================
            HERO
        ===================================================== */}

        <motion.section
          className="dashboard-hero"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
        >
          <div className="dashboard-hero-content">
            <motion.div
              className="hero-badge"
              initial={{
                opacity: 0,
                x: -12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.4,
              }}
            >
              <Sparkles size={13} />
              AI Interview Intelligence
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
            >
              Welcome back, <span>{firstName}</span>
            </motion.h1>

            <motion.p
              className="dashboard-hero-description"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
              }}
            >
              Prepare for your next opportunity with AI-powered mock interviews,
              personalized feedback and performance insights designed around
              your goals.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.4,
              }}
            >
              <button
                type="button"
                className="primary-dashboard-button"
                onClick={() => navigate("/interview/setup")}
              >
                <Zap size={16} />
                Start New Interview
                <ArrowUpRight size={15} />
              </button>

              <button
                type="button"
                className="secondary-dashboard-button"
                onClick={() => navigate("/ai-insights")}
              >
                <Brain size={16} />
                AI Insights
              </button>
            </motion.div>
          </div>

          {/* HERO IMAGE */}

          <div className="dashboard-hero-image-wrapper">
            <img
              className="dashboard-hero-image"
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=90"
              alt="Professional interview preparation"
              loading="eager"
            />

            <div className="dashboard-image-overlay" />

            <div className="image-grid-overlay" />

            <motion.div
              className="image-floating-card"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.65,
                duration: 0.5,
              }}
            >
              <span className="live-dot" />

              <span>AI interview environment ready</span>
            </motion.div>
          </div>
        </motion.section>

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <motion.div
          className="dashboard-profile-row"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
            duration: 0.45,
          }}
        >
          <div className="profile-left">
            <motion.div
              className="profile-avatar"
              whileHover={{
                scale: 1.08,
                rotate: -5,
              }}
            >
              <UserRound size={20} />
            </motion.div>

            <div>
              <strong>{actualName}</strong>

              <span>
                {hasCompletedInterviews ? "Active Candidate" : "New Candidate"}
              </span>
            </div>
          </div>

          <motion.div
            className="profile-completion"
            onClick={() => navigate("/profile")}
            title="Complete your profile"
            whileHover={{
              x: -4,
            }}
          >
            <span className="profile-percent">Profile {profilePercent}%</span>

            <div className="profile-progress">
              <motion.div
                className="profile-progress-inner"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${profilePercent}%`,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
              />
            </div>

            <ArrowRight size={14} color="#8B5CF6" />
          </motion.div>
        </motion.div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <motion.section
          className="quick-actions-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <QuickAction
              icon={Video}
              title="Practice Interview"
              description="Start a realistic mock interview"
              color="#8B5CF6"
              onClick={() => navigate("/interview/setup")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickAction
              icon={Brain}
              title="AI Insights"
              description="Review your AI feedback"
              color="#06B6D4"
              onClick={() => navigate("/ai-insights")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickAction
              icon={FileText}
              title="Resume Intelligence"
              description="Improve your resume profile"
              color="#10B981"
              onClick={() => navigate("/resume")}
            />
          </motion.div>
        </motion.section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {isLoading && <DashboardSkeleton />}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {isError && (
          <motion.div
            className="dashboard-error"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
          >
            <div className="error-icon">
              <AlertCircle size={27} />
            </div>

            <h2>Unable to load your interview data</h2>

            <p>Please check your connection and try again.</p>

            <button
              type="button"
              className="primary-dashboard-button"
              onClick={() => refetch()}
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </motion.div>
        )}

        {/* =====================================================
            MAIN DASHBOARD
        ===================================================== */}

        {!isLoading && !isError && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* =================================================
                  STATISTICS
              ================================================= */}

            <motion.section className="stats-grid" variants={itemVariants}>
              <StatCard
                label="Total Interviews"
                value={totalInterviews}
                subtext={
                  hasCompletedInterviews
                    ? "Completed interview sessions"
                    : "No interview sessions yet"
                }
                accentColor="#8B5CF6"
                icon={Target}
                delay={0}
              />

              <StatCard
                label="Completed Interviews"
                value={totalInterviews}
                subtext={
                  hasCompletedInterviews
                    ? "Successfully evaluated"
                    : "Start your first interview"
                }
                accentColor="#10B981"
                icon={CheckCircle2}
                delay={0.08}
              />

              <StatCard
                label="Average Score"
                value={avgScoreDisplay}
                subtext={
                  hasCompletedInterviews
                    ? "Across completed interviews"
                    : "Waiting for performance data"
                }
                accentColor="#06B6D4"
                icon={BarChart2}
                delay={0.16}
              />

              <StatCard
                label="Best Score"
                value={bestScoreDisplay}
                subtext={
                  hasCompletedInterviews
                    ? "Your highest AI evaluation"
                    : "Complete your first interview"
                }
                accentColor="#F59E0B"
                icon={Award}
                delay={0.24}
              />
            </motion.section>

            {/* =================================================
                  PERFORMANCE + AI
              ================================================= */}

            <section className="dashboard-two-column">
              {/* PERFORMANCE */}

              <motion.div className="dashboard-panel" variants={itemVariants}>
                <SectionTitle
                  icon={Activity}
                  title="Performance Analytics"
                  subtitle="Your interview performance trends"
                  color="#06B6D4"
                />

                {hasCompletedInterviews &&
                stats?.weekly_performance &&
                stats.weekly_performance.length > 0 ? (
                  <div
                    style={{
                      width: "100%",
                      height: 250,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.weekly_performance}>
                        <defs>
                          <linearGradient
                            id="performanceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8B5CF6"
                              stopOpacity={0.38}
                            />

                            <stop
                              offset="95%"
                              stopColor="#8B5CF6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(128,128,128,.10)"
                        />

                        <XAxis
                          dataKey="week"
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          domain={[0, 100]}
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "var(--voxa-card-bg)",
                            border: "1px solid var(--voxa-card-border)",
                            borderRadius: "12px",
                            fontSize: "11px",
                            boxShadow: "0 12px 35px rgba(0,0,0,.12)",
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          fill="url(#performanceGradient)"
                          animationDuration={1200}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="professional-empty">
                    <motion.div
                      className="empty-icon"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <BarChart2 size={24} />
                    </motion.div>

                    <h4>No analytics available yet</h4>

                    <p>
                      Complete your first interview and your performance chart
                      will automatically appear here.
                    </p>

                    <button
                      type="button"
                      className="small-action-button"
                      onClick={() => navigate("/interview/setup")}
                    >
                      Take an Interview
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>

              {/* AI INSIGHTS */}

              <motion.div className="dashboard-panel" variants={itemVariants}>
                <SectionTitle
                  icon={Brain}
                  title="AI Insights"
                  subtitle="Personalized interview intelligence"
                  color="#8B5CF6"
                />

                {hasCompletedInterviews ? (
                  <div>
                    <div className="ai-info-box">
                      <Sparkles
                        size={18}
                        color="#8B5CF6"
                        style={{
                          marginBottom: 10,
                        }}
                      />

                      <div>
                        You have completed{" "}
                        <strong
                          style={{
                            color: "var(--voxa-card-text)",
                          }}
                        >
                          {stats?.interviews_completed}
                        </strong>{" "}
                        interview
                        {stats?.interviews_completed !== 1 ? "s" : ""}.
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Explore your AI-generated evaluation to identify
                        strengths, weak areas and opportunities for improvement.
                      </div>
                    </div>

                    <div className="ai-insight-metrics">
                      <div className="ai-metric">
                        <span>Average Performance</span>

                        <strong>{avgScoreDisplay}</strong>
                      </div>

                      <div className="ai-metric">
                        <span>Personal Best</span>

                        <strong>{bestScoreDisplay}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="small-action-button"
                      style={{
                        marginTop: 15,
                      }}
                      onClick={() => navigate("/ai-insights")}
                    >
                      Explore AI Insights
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="professional-empty">
                    <motion.div
                      className="empty-icon"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                      }}
                    >
                      <Brain size={25} />
                    </motion.div>

                    <h4>Unlock AI Interview Insights</h4>

                    <p>
                      Complete an interview to receive AI-powered feedback and
                      personalized improvement suggestions.
                    </p>

                    <button
                      type="button"
                      className="small-action-button"
                      onClick={() => navigate("/interview/setup")}
                    >
                      Start Interview
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            </section>

            {/* =================================================
                  RECENT INTERVIEWS
              ================================================= */}

            <motion.section
              className="dashboard-panel recent-panel"
              variants={itemVariants}
            >
              <div className="recent-heading">
                <SectionTitle
                  icon={Clock}
                  title="Recent Interviews"
                  subtitle="Your latest interview activity"
                  color="#10B981"
                />

                {hasCompletedInterviews && (
                  <button
                    type="button"
                    className="view-all-button"
                    onClick={() => navigate("/interviews")}
                  >
                    View All
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {hasCompletedInterviews &&
              stats?.recent_interviews &&
              stats.recent_interviews.length > 0 ? (
                <div className="interview-list">
                  {stats.recent_interviews.map((item) => (
                    <motion.div
                      key={item.id}
                      className={`interview-item ${
                        item.status === "completed" ? "clickable" : ""
                      }`}
                      whileHover={{
                        x: 4,
                      }}
                      onClick={() => {
                        if (item.status === "completed") {
                          navigate(`/interview/complete/${item.id}`);
                        }
                      }}
                    >
                      <div className="interview-item-main">
                        <div className="interview-item-icon">
                          <Video size={17} />
                        </div>

                        <div>
                          <div className="interview-role">{item.role}</div>

                          <div className="interview-details">
                            {item.type}

                            {" • "}

                            {item.difficulty}

                            {" • "}

                            {item.duration}
                          </div>
                        </div>
                      </div>

                      <div className="interview-right">
                        <span className="interview-date">
                          {formatDate(item.date)}
                        </span>

                        {item.score !== null ? (
                          <span className="interview-score">{item.score}%</span>
                        ) : (
                          <span className="interview-date">{item.status}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="professional-empty">
                  <motion.div
                    className="empty-icon"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    <Clock size={25} />
                  </motion.div>

                  <h4>No interview history yet</h4>

                  <p>
                    Your completed interview sessions, scores and evaluation
                    history will appear here.
                  </p>

                  <button
                    type="button"
                    className="primary-dashboard-button"
                    onClick={() => navigate("/interview/setup")}
                  >
                    <Rocket size={15} />
                    Start Your First Interview
                  </button>
                </div>
              )}
            </motion.section>
          </motion.div>
        )}
      </main>
    </>
  );
}
