import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Brain,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from 'lucide-react'

import { formatDate } from '@/lib/utils'
import { dashboardApi, type DashboardStats } from '@/services/apiService'
import { useAuthStore } from '@/store/authStore'

/* =========================================================
   PROFESSIONAL STAT CARD
========================================================= */

interface StatCardProps {
  label: string
  value: string | number
  subtext: string
  accentColor: string
  icon: React.ElementType
  delay?: number
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="dashboard-stat-card"
    >
      <div className="stat-card-top">
        <div>
          <p className="stat-card-label">{label}</p>

          <h2 className="stat-card-value">{value}</h2>
        </div>

        <div
          className="stat-icon"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <Icon size={20} />
        </div>
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
          background: `radial-gradient(circle, ${accentColor}20, transparent 65%)`,
        }}
      />
    </motion.div>
  )
}

/* =========================================================
   SECTION TITLE
========================================================= */

interface SectionTitleProps {
  icon: React.ElementType
  title: string
  subtitle: string
  color?: string
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  color = '#8B5CF6',
}: SectionTitleProps) {
  return (
    <div className="section-title">
      <div
        className="section-icon"
        style={{
          color,
          backgroundColor: `${color}15`,
          border: `1px solid ${color}25`,
        }}
      >
        <Icon size={18} />
      </div>

      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

/* =========================================================
   SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <div className="dashboard-stat-card skeleton-card" key={item}>
            <div className="skeleton skeleton-small" />
            <div className="skeleton skeleton-large" />
            <div className="skeleton skeleton-medium" />
          </div>
        ))}
      </div>

      <div className="dashboard-two-column">
        <div className="dashboard-panel skeleton-panel">
          <div className="skeleton skeleton-full" />
        </div>

        <div className="dashboard-panel skeleton-panel">
          <div className="skeleton skeleton-full" />
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const { user } = useAuthStore()

  const navigate = useNavigate()

  /* ---------------------------------------------------------
     FETCH REAL DASHBOARD DATA
  --------------------------------------------------------- */

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard', user?.id],
    queryFn: dashboardApi.get,
    staleTime: 1000 * 60,
    retry: 1,
  })

  /* ---------------------------------------------------------
     REAL DATA CALCULATIONS
  --------------------------------------------------------- */

  const hasCompletedInterviews = Boolean(
    stats && stats.interviews_completed > 0
  )

  const totalInterviews = stats?.interviews_completed ?? 0

  const avgScoreDisplay =
    hasCompletedInterviews && stats?.average_score
      ? `${stats.average_score}%`
      : 'No data yet'

  const bestScoreDisplay =
    hasCompletedInterviews && stats?.best_score
      ? `${stats.best_score}%`
      : 'No data yet'

  const actualName = user?.name?.trim() || 'Candidate'

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
  ]

  const completedProfileCount = profileFields.filter(Boolean).length

  const profilePercent = Math.round(
    (completedProfileCount / profileFields.length) * 100
  )

  return (
    <>
      {/* =====================================================
          DASHBOARD STYLES
      ====================================================== */}

      <style>{`

        .professional-dashboard {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding-bottom: 4rem;
        }

        /* ================================================
           HERO
        ================================================ */

        .dashboard-hero {
          position: relative;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          min-height: 255px;

          border-radius: 24px;
          overflow: hidden;

          margin-bottom: 1.6rem;

          border: 1px solid var(--voxa-card-border);

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(139,92,246,0.22),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              var(--voxa-card-bg),
              rgba(139,92,246,0.08)
            );

          box-shadow:
            0 20px 50px rgba(0,0,0,0.08);

          transition:
            transform .35s ease,
            box-shadow .35s ease,
            border-color .35s ease;
        }

        .dashboard-hero:hover {
          transform: translateY(-3px);

          border-color:
            rgba(139,92,246,.35);

          box-shadow:
            0 25px 70px rgba(0,0,0,.13);
        }

        .dashboard-hero-content {
          padding: 2.4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 3;
        }

        .hero-badge {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 7px;

          padding: 7px 12px;

          border-radius: 999px;

          font-size: 12px;
          font-weight: 700;

          color: #8B5CF6;

          background:
            rgba(139,92,246,.1);

          border:
            1px solid rgba(139,92,246,.2);

          margin-bottom: 16px;
        }

        .dashboard-hero h1 {
          margin: 0;

          font-size:
            clamp(1.7rem, 3vw, 2.5rem);

          line-height: 1.15;

          letter-spacing: -.045em;

          color:
            var(--voxa-card-text);
        }

        .dashboard-hero h1 span {
          background:
            linear-gradient(
              135deg,
              #8B5CF6,
              #A78BFA,
              #06B6D4
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-hero-description {
          max-width: 630px;

          color:
            var(--text-secondary);

          line-height: 1.7;

          font-size: .92rem;

          margin:
            .9rem 0 1.5rem;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: .75rem;
        }

        .primary-dashboard-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          border: 0;
          outline: 0;

          border-radius: 12px;

          padding:
            .78rem 1.25rem;

          font-size: .875rem;
          font-weight: 700;

          cursor: pointer;

          color: white;

          background:
            linear-gradient(
              135deg,
              #8B5CF6,
              #7C3AED
            );

          box-shadow:
            0 10px 25px
            rgba(124,58,237,.3);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .primary-dashboard-button:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 14px 32px
            rgba(124,58,237,.4);
        }

        .secondary-dashboard-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding:
            .75rem 1.1rem;

          border-radius: 12px;

          border:
            1px solid var(--voxa-card-border);

          color:
            var(--voxa-card-text);

          background:
            var(--voxa-card-bg);

          font-size: .85rem;
          font-weight: 600;

          cursor: pointer;

          transition:
            background .2s ease,
            border-color .2s ease,
            transform .2s ease;
        }

        .secondary-dashboard-button:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(139,92,246,.4);

          background:
            rgba(139,92,246,.07);
        }

        /* ================================================
           IMAGE
        ================================================ */

        .dashboard-hero-image-wrapper {
          min-height: 255px;

          position: relative;

          overflow: hidden;
        }

        .dashboard-hero-image {
          width: 100%;
          height: 100%;

          min-height: 255px;

          object-fit: cover;

          transition:
            transform .7s
            cubic-bezier(.16,1,.3,1);
        }

        .dashboard-hero:hover
        .dashboard-hero-image {
          transform: scale(1.06);
        }

        .dashboard-image-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              var(--voxa-card-bg),
              transparent 45%
            );
        }

        .image-floating-card {
          position: absolute;

          right: 18px;
          bottom: 18px;

          padding:
            10px 14px;

          border-radius: 13px;

          background:
            rgba(15,15,25,.75);

          backdrop-filter:
            blur(15px);

          border:
            1px solid
            rgba(255,255,255,.15);

          color:
            white;

          font-size: 12px;

          display: flex;
          align-items: center;
          gap: 8px;

          box-shadow:
            0 10px 25px
            rgba(0,0,0,.2);
        }

        /* ================================================
           PROFILE BAR
        ================================================ */

        .dashboard-profile-row {
          display: flex;

          align-items: center;
          justify-content: space-between;

          flex-wrap: wrap;

          gap: 15px;

          padding:
            1rem 1.25rem;

          margin-bottom:
            1.6rem;

          border-radius:
            18px;

          border:
            1px solid
            var(--voxa-card-border);

          background:
            var(--voxa-card-bg);
        }

        .profile-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-avatar {
          width: 42px;
          height: 42px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #8B5CF6;

          background:
            rgba(139,92,246,.1);

          border:
            1px solid
            rgba(139,92,246,.18);
        }

        .profile-left strong {
          display: block;

          font-size: .88rem;

          color:
            var(--voxa-card-text);
        }

        .profile-left span {
          display: block;

          margin-top: 2px;

          color:
            var(--text-muted);

          font-size: .75rem;
        }

        .profile-completion {
          display: flex;
          align-items: center;

          gap: 10px;

          cursor: pointer;

          transition:
            transform .2s ease;
        }

        .profile-completion:hover {
          transform:
            translateX(-4px);
        }

        .profile-percent {
          color: #8B5CF6;

          font-size: .78rem;

          font-weight: 700;
        }

        .profile-progress {
          width: 100px;
          height: 7px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(139,92,246,.14);
        }

        .profile-progress-inner {
          height: 100%;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #8B5CF6,
              #A78BFA
            );

          transition:
            width .5s ease;
        }

        /* ================================================
           STATS
        ================================================ */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0,1fr));

          gap: 1.2rem;
        }

        .dashboard-stat-card {
          position: relative;

          overflow: hidden;

          border:
            1px solid
            var(--voxa-card-border);

          border-radius: 18px;

          background:
            var(--voxa-card-bg);

          padding: 1.25rem;

          min-height: 145px;

          box-shadow:
            0 8px 25px
            rgba(0,0,0,.035);

          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease;
        }

        .dashboard-stat-card:hover {
          transform:
            translateY(-6px);

          border-color:
            rgba(139,92,246,.3);

          box-shadow:
            0 18px 40px
            rgba(0,0,0,.1);
        }

        .stat-card-top {
          display: flex;

          align-items: flex-start;
          justify-content:
            space-between;

          position: relative;
          z-index: 2;
        }

        .stat-card-label {
          margin:
            0 0 8px;

          font-size: .78rem;

          color:
            var(--text-secondary);

          font-weight: 600;
        }

        .stat-card-value {
          margin: 0;

          color:
            var(--voxa-card-text);

          font-size: 1.65rem;

          letter-spacing:
            -.03em;

          font-weight: 800;
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          transition:
            transform .3s ease;
        }

        .dashboard-stat-card:hover
        .stat-icon {
          transform:
            rotate(-5deg)
            scale(1.1);
        }

        .stat-card-bottom {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-top: 20px;

          font-size: .72rem;

          color:
            var(--text-muted);

          position: relative;
          z-index: 2;
        }

        .stat-indicator {
          width: 6px;
          height: 6px;

          border-radius: 50%;
        }

        .stat-glow {
          width: 110px;
          height: 110px;

          position: absolute;

          right: -35px;
          bottom: -45px;

          pointer-events: none;

          transition:
            transform .4s ease;
        }

        .dashboard-stat-card:hover
        .stat-glow {
          transform:
            scale(1.4);
        }

        /* ================================================
           PANELS
        ================================================ */

        .dashboard-two-column {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0,1fr));

          gap: 1.5rem;

          margin-top: 1.6rem;
        }

        .dashboard-panel {
          border:
            1px solid
            var(--voxa-card-border);

          border-radius: 20px;

          background:
            var(--voxa-card-bg);

          padding: 1.5rem;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,.035);

          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .dashboard-panel:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(139,92,246,.25);

          box-shadow:
            0 18px 45px
            rgba(0,0,0,.07);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 11px;

          margin-bottom: 1.2rem;
        }

        .section-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;
        }

        .section-title h3 {
          margin: 0;

          font-size: .98rem;

          color:
            var(--voxa-card-text);
        }

        .section-title p {
          margin:
            3px 0 0;

          color:
            var(--text-muted);

          font-size: .72rem;
        }

        /* ================================================
           EMPTY STATE
        ================================================ */

        .professional-empty {
          min-height: 230px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 1.5rem;
        }

        .empty-icon {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          margin-bottom: 13px;

          background:
            rgba(139,92,246,.09);

          color: #8B5CF6;

          transition:
            transform .3s ease;
        }

        .professional-empty:hover
        .empty-icon {
          transform:
            translateY(-4px)
            rotate(-4deg);
        }

        .professional-empty h4 {
          margin: 0;

          color:
            var(--voxa-card-text);

          font-size: .95rem;
        }

        .professional-empty p {
          max-width: 350px;

          margin:
            8px auto 17px;

          line-height: 1.6;

          color:
            var(--text-secondary);

          font-size: .8rem;
        }

        .small-action-button {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding:
            8px 14px;

          border-radius: 10px;

          border:
            1px solid
            rgba(139,92,246,.25);

          background:
            rgba(139,92,246,.09);

          color: #8B5CF6;

          font-size: .78rem;
          font-weight: 700;

          cursor: pointer;

          transition:
            transform .2s ease,
            background .2s ease;
        }

        .small-action-button:hover {
          transform:
            translateY(-2px);

          background:
            rgba(139,92,246,.15);
        }

        /* ================================================
           AI INSIGHT
        ================================================ */

        .ai-info-box {
          padding: 1rem;

          border-radius: 14px;

          color:
            var(--text-secondary);

          font-size: .84rem;

          line-height: 1.7;

          border:
            1px solid
            rgba(139,92,246,.12);

          background:
            linear-gradient(
              135deg,
              rgba(139,92,246,.08),
              rgba(6,182,212,.04)
            );
        }

        /* ================================================
           RECENT INTERVIEWS
        ================================================ */

        .recent-panel {
          margin-top: 1.6rem;
        }

        .recent-heading {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 1rem;

          margin-bottom: 1.25rem;
        }

        .view-all-button {
          border: 0;

          background: transparent;

          color: #8B5CF6;

          display: flex;

          align-items: center;

          gap: 4px;

          font-size: .78rem;

          font-weight: 700;

          cursor: pointer;
        }

        .interview-list {
          display: flex;

          flex-direction: column;

          gap: .75rem;
        }

        .interview-item {
          display: flex;

          align-items: center;
          justify-content: space-between;

          flex-wrap: wrap;

          gap: 1rem;

          padding: 1rem 1.1rem;

          border-radius: 14px;

          border:
            1px solid
            var(--voxa-card-border);

          background:
            rgba(139,92,246,.025);

          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease;
        }

        .interview-item.clickable {
          cursor: pointer;
        }

        .interview-item.clickable:hover {
          transform:
            translateX(6px);

          border-color:
            rgba(139,92,246,.32);

          background:
            rgba(139,92,246,.065);
        }

        .interview-role {
          color:
            var(--voxa-card-text);

          font-size: .91rem;

          font-weight: 700;
        }

        .interview-details {
          margin-top: 4px;

          color:
            var(--text-muted);

          font-size: .73rem;
        }

        .interview-right {
          display: flex;
          align-items: center;

          gap: 1rem;
        }

        .interview-date {
          color:
            var(--text-muted);

          font-size: .72rem;
        }

        .interview-score {
          padding:
            5px 9px;

          border-radius: 8px;

          color: #10B981;

          background:
            rgba(16,185,129,.1);

          border:
            1px solid
            rgba(16,185,129,.15);

          font-size: .78rem;

          font-weight: 800;
        }

        /* ================================================
           ERROR
        ================================================ */

        .dashboard-error {
          max-width: 520px;

          margin: 4rem auto;

          text-align: center;

          padding: 3rem 2rem;

          border-radius: 20px;

          background:
            var(--voxa-card-bg);

          border:
            1px solid
            var(--voxa-card-border);
        }

        .error-icon {
          width: 58px;
          height: 58px;

          margin:
            0 auto 1rem;

          border-radius: 16px;

          color: #EF4444;

          background:
            rgba(239,68,68,.1);

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-error h2 {
          color:
            var(--voxa-card-text);

          font-size: 1.15rem;

          margin-bottom: .5rem;
        }

        .dashboard-error p {
          color:
            var(--text-secondary);

          font-size: .85rem;
        }

        /* ================================================
           SKELETON
        ================================================ */

        .dashboard-skeleton {
          display: flex;

          flex-direction: column;

          gap: 1.4rem;
        }

        .skeleton-card {
          opacity: .7;
        }

        .skeleton {
          border-radius: 7px;

          background:
            linear-gradient(
              90deg,
              rgba(128,128,128,.07),
              rgba(128,128,128,.15),
              rgba(128,128,128,.07)
            );

          background-size:
            200% 100%;

          animation:
            skeletonLoading
            1.4s infinite;
        }

        .skeleton-small {
          width: 40%;
          height: 14px;
        }

        .skeleton-large {
          width: 60%;
          height: 30px;

          margin-top: 15px;
        }

        .skeleton-medium {
          width: 70%;
          height: 12px;

          margin-top: 22px;
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
            background-position:
              200% 0;
          }

          100% {
            background-position:
              -200% 0;
          }
        }

        /* ================================================
           RESPONSIVE
        ================================================ */

        @media (max-width: 1100px) {

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dashboard-hero {
            grid-template-columns:
              1fr .7fr;
          }
        }

        @media (max-width: 850px) {

          .dashboard-hero {
            grid-template-columns: 1fr;
          }

          .dashboard-hero-image-wrapper {
            height: 210px;
            min-height: 210px;
          }

          .dashboard-hero-image {
            min-height: 210px;
          }

          .dashboard-image-overlay {
            background:
              linear-gradient(
                180deg,
                var(--voxa-card-bg),
                transparent 65%
              );
          }

          .dashboard-two-column {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {

          .dashboard-hero-content {
            padding:
              1.6rem 1.25rem;
          }

          .dashboard-hero h1 {
            font-size: 1.7rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-profile-row {
            align-items: flex-start;
          }

          .profile-completion {
            width: 100%;
            justify-content: space-between;
          }

          .profile-progress {
            flex: 1;
          }

          .interview-item {
            align-items: flex-start;
          }

          .interview-right {
            width: 100%;

            justify-content:
              space-between;
          }

          .hero-actions button {
            flex: 1;
          }
        }

      `}</style>

      <main className="professional-dashboard">

        {/* ===================================================
            PROFESSIONAL HERO
        ==================================================== */}

        <motion.section
          className="dashboard-hero"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >

          <div className="dashboard-hero-content">

            <div className="hero-badge">
              <Sparkles size={13} />
              AI Interview Intelligence
            </div>

            <h1>
              Welcome back, <span>{actualName}</span>
            </h1>

            <p className="dashboard-hero-description">
              Practice smarter, improve your interview performance and
              understand your strengths with personalized AI-powered
              interview feedback.
            </p>

            <div className="hero-actions">

              <button
                className="primary-dashboard-button"
                onClick={() => navigate('/interview/setup')}
              >
                <Zap size={16} />

                Start New Interview

                <ArrowUpRight size={15} />
              </button>

              <button
                className="secondary-dashboard-button"
                onClick={() => navigate('/ai-insights')}
              >
                <Brain size={16} />
                AI Insights
              </button>

            </div>

          </div>

          {/* IMAGE */}

          <div className="dashboard-hero-image-wrapper">

            <img
              className="dashboard-hero-image"
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85"
              alt="Professional interview preparation"
            />

            <div className="dashboard-image-overlay" />

            <div className="image-floating-card">
              <TrendingUp size={15} color="#10B981" />

              <span>
                Build interview confidence
              </span>
            </div>

          </div>

        </motion.section>

        {/* ===================================================
            PROFILE INFORMATION
        ==================================================== */}

        <div className="dashboard-profile-row">

          <div className="profile-left">

            <div className="profile-avatar">
              <UserRound size={20} />
            </div>

            <div>
              <strong>{actualName}</strong>

              <span>
                {hasCompletedInterviews
                  ? 'Active Candidate'
                  : 'New Candidate'}
              </span>
            </div>

          </div>

          <div
            className="profile-completion"
            onClick={() => navigate('/profile')}
            title="Complete your profile"
          >
            <span className="profile-percent">
              Profile {profilePercent}%
            </span>

            <div className="profile-progress">

              <div
                className="profile-progress-inner"
                style={{
                  width: `${profilePercent}%`,
                }}
              />

            </div>

            <ArrowRight
              size={14}
              color="#8B5CF6"
            />

          </div>

        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {isLoading && <DashboardSkeleton />}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {isError && (

          <div className="dashboard-error">

            <div className="error-icon">
              <AlertCircle size={27} />
            </div>

            <h2>
              Unable to load your interview data
            </h2>

            <p>
              Please check your connection and try again.
            </p>

            <button
              className="primary-dashboard-button"
              onClick={() => refetch()}
            >
              <RefreshCw size={15} />
              Retry
            </button>

          </div>

        )}

        {/* ===================================================
            MAIN DASHBOARD
        ==================================================== */}

        {!isLoading && !isError && (

          <>

            {/* ===============================================
                STATISTICS
            ================================================ */}

            <section className="stats-grid">

              <StatCard
                label="Total Interviews"
                value={totalInterviews}
                subtext={
                  hasCompletedInterviews
                    ? 'Completed interview sessions'
                    : 'No interview sessions yet'
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
                    ? 'Successfully evaluated'
                    : 'Start your first interview'
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
                    ? 'Across completed interviews'
                    : 'Waiting for performance data'
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
                    ? 'Your highest AI evaluation'
                    : 'Complete your first interview'
                }
                accentColor="#F59E0B"
                icon={Award}
                delay={0.24}
              />

            </section>

            {/* ===============================================
                PERFORMANCE + AI
            ================================================ */}

            <section className="dashboard-two-column">

              {/* PERFORMANCE */}

              <div className="dashboard-panel">

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
                      width: '100%',
                      height: 240,
                    }}
                  >

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <AreaChart
                        data={
                          stats.weekly_performance
                        }
                      >

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
                              stopOpacity={0.35}
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
                          stroke="rgba(128,128,128,.12)"
                        />

                        <XAxis
                          dataKey="week"
                          stroke="var(--text-muted)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          domain={[0, 100]}
                          stroke="var(--text-muted)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            background:
                              'var(--voxa-card-bg)',
                            border:
                              '1px solid var(--voxa-card-border)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            boxShadow:
                              '0 10px 30px rgba(0,0,0,.1)',
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          fill="url(#performanceGradient)"
                        />

                      </AreaChart>

                    </ResponsiveContainer>

                  </div>

                ) : (

                  <div className="professional-empty">

                    <div className="empty-icon">
                      <BarChart2 size={24} />
                    </div>

                    <h4>
                      No analytics available yet
                    </h4>

                    <p>
                      Complete your first interview and
                      your performance chart will
                      automatically appear here.
                    </p>

                    <button
                      className="small-action-button"
                      onClick={() =>
                        navigate('/interview/setup')
                      }
                    >
                      Take an Interview
                      <ArrowRight size={14} />
                    </button>

                  </div>

                )}

              </div>

              {/* AI INSIGHTS */}

              <div className="dashboard-panel">

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
                        You have completed{' '}
                        <strong
                          style={{
                            color:
                              'var(--voxa-card-text)',
                          }}
                        >
                          {stats?.interviews_completed}
                        </strong>{' '}
                        interview
                        {stats?.interviews_completed !== 1
                          ? 's'
                          : ''}.
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Explore your AI-generated
                        evaluation to identify strengths,
                        weak areas and opportunities for
                        improvement.
                      </div>

                    </div>

                    <button
                      className="small-action-button"
                      style={{
                        marginTop: 18,
                      }}
                      onClick={() =>
                        navigate('/ai-insights')
                      }
                    >
                      Explore AI Insights
                      <ArrowRight size={14} />
                    </button>

                  </div>

                ) : (

                  <div className="professional-empty">

                    <div className="empty-icon">
                      <Brain size={25} />
                    </div>

                    <h4>
                      Unlock AI Interview Insights
                    </h4>

                    <p>
                      Complete an interview to receive
                      AI-powered feedback and personalized
                      improvement suggestions.
                    </p>

                    <button
                      className="small-action-button"
                      onClick={() =>
                        navigate('/interview/setup')
                      }
                    >
                      Start Interview
                      <ArrowRight size={14} />
                    </button>

                  </div>

                )}

              </div>

            </section>

            {/* ===============================================
                RECENT INTERVIEWS
            ================================================ */}

            <section className="dashboard-panel recent-panel">

              <div className="recent-heading">

                <SectionTitle
                  icon={Clock}
                  title="Recent Interviews"
                  subtitle="Your latest interview activity"
                  color="#10B981"
                />

                {hasCompletedInterviews && (

                  <button
                    className="view-all-button"
                    onClick={() =>
                      navigate('/interviews')
                    }
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

                  {stats.recent_interviews.map(
                    (item) => (

                      <div
                        key={item.id}
                        className={`interview-item ${
                          item.status === 'completed'
                            ? 'clickable'
                            : ''
                        }`}
                        onClick={() => {
                          if (
                            item.status === 'completed'
                          ) {
                            navigate(
                              `/interview/complete/${item.id}`
                            )
                          }
                        }}
                      >

                        <div>

                          <div className="interview-role">
                            {item.role}
                          </div>

                          <div className="interview-details">
                            {item.type}
                            {' • '}
                            {item.difficulty}
                            {' • '}
                            {item.duration}
                          </div>

                        </div>

                        <div className="interview-right">

                          <span className="interview-date">
                            {formatDate(item.date)}
                          </span>

                          {item.score !== null ? (

                            <span className="interview-score">
                              {item.score}%
                            </span>

                          ) : (

                            <span className="interview-date">
                              {item.status}
                            </span>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="professional-empty">

                  <div className="empty-icon">
                    <Clock size={25} />
                  </div>

                  <h4>
                    No interview history yet
                  </h4>

                  <p>
                    Your completed interview sessions,
                    scores and evaluation history will
                    appear here.
                  </p>

                  <button
                    className="primary-dashboard-button"
                    onClick={() =>
                      navigate('/interview/setup')
                    }
                  >
                    <Zap size={15} />
                    Start Your First Interview
                  </button>

                </div>

              )}

            </section>

          </>

        )}

      </main>
    </>
  )
}