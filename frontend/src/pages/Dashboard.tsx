import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import {
  Zap, Target, BarChart2, Brain, Sparkles,
  CheckCircle2, AlertCircle, RefreshCw,
  ArrowRight, Award, Flame,
  Clock, ArrowUpRight, Activity
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { dashboardApi, type DashboardStats } from '@/services/apiService'
import { formatDate } from '@/lib/utils'

// ── STATISTIC CARDS ────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  subtext: string
  accentColor: string
  icon: React.ElementType
  delay?: number
}

function StatCard({ label, value, subtext, accentColor, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="voxa-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: `${accentColor}18`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--voxa-card-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {subtext}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          opacity: 0.6,
        }}
      />
    </motion.div>
  )
}

// ── SKELETON LOADER ────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Stats Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="voxa-card" style={{ height: 110, padding: '1.25rem', opacity: 0.6 }}>
            <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 12, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 6 }} />
          </div>
        ))}
      </div>

      {/* 2-Column Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <div className="voxa-card" style={{ height: 260, opacity: 0.6 }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 20 }} />
        </div>
        <div className="voxa-card" style={{ height: 260, opacity: 0.6 }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 20 }} />
        </div>
      </div>
    </div>
  )
}

// ── MAIN DASHBOARD COMPONENT ────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Real backend query for authenticated user's stats
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

  const hasCompletedInterviews = Boolean(stats && stats.interviews_completed > 0)
  const totalInterviews = stats?.interviews_completed ?? 0
  const avgScoreDisplay = hasCompletedInterviews && stats?.average_score ? `${stats.average_score}%` : 'No data yet'
  const bestScoreDisplay = hasCompletedInterviews && stats?.best_score ? `${stats.best_score}%` : 'No data yet'
  const streakDisplay = hasCompletedInterviews && stats?.current_streak ? `${stats.current_streak} days` : '0 days'

  const actualName = user?.name ? user.name.trim() : 'Candidate'

  // Calculate profile completion strictly from actual user data
  const profileFields = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.targetRole),
    Boolean(user?.skills && user.skills.length > 0),
    Boolean(user?.college),
    Boolean(user?.github || user?.linkedin),
  ]
  const completedProfileCount = profileFields.filter(Boolean).length
  const profilePercent = Math.round((completedProfileCount / profileFields.length) * 100)

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
      {/* =====================================================
          DASHBOARD HEADER: Greeting + Profile Status + Actions
      ====================================================== */}
      <div
        className="voxa-card"
        style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        {/* Left: Title, Contextual Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 280 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--voxa-card-text)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Dashboard
              </h1>
              {hasCompletedInterviews ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10B981',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={11} />
                  Active Candidate
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    color: '#8B5CF6',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={11} />
                  New Candidate
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
              Welcome, <strong style={{ color: 'var(--voxa-card-text)' }}>{actualName}</strong> — Track your interview progress and AI-powered insights.
            </p>
          </div>
        </div>

        {/* Right: Profile Completeness & New Interview CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              cursor: 'pointer',
            }}
            title="View & complete your candidate profile"
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8B5CF6' }}>
              Profile {profilePercent}%
            </div>
            <div style={{ width: 44, height: 6, borderRadius: 999, backgroundColor: 'rgba(139, 92, 246, 0.15)', overflow: 'hidden' }}>
              <div style={{ width: `${profilePercent}%`, height: '100%', backgroundColor: '#8B5CF6', borderRadius: 999 }} />
            </div>
          </div>

          <button
            onClick={() => navigate('/interview/setup')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.35rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Zap size={16} />
            <span>+ New Interview</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          LOADING & ERROR STATES
      ====================================================== */}
      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="voxa-card" style={{ maxWidth: 520, margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--voxa-card-text)', marginBottom: '0.5rem' }}>
            Unable to load your interview data.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN DASHBOARD BODY
      ====================================================== */}
      {!isLoading && !isError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* ── 1. 4 STATISTICS CARDS (REAL DATA ONLY) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <StatCard
              label="Total Interviews"
              value={totalInterviews}
              subtext={hasCompletedInterviews ? 'Completed sessions' : '0 sessions registered'}
              accentColor="#8B5CF6"
              icon={Target}
              delay={0}
            />

            <StatCard
              label="Completed Interviews"
              value={totalInterviews}
              subtext={hasCompletedInterviews ? 'Finished evaluations' : '0 completed so far'}
              accentColor="#10B981"
              icon={CheckCircle2}
              delay={0.08}
            />

            <StatCard
              label="Average Score"
              value={avgScoreDisplay}
              subtext={hasCompletedInterviews ? 'Across completed sessions' : 'Pending first session'}
              accentColor="#06B6D4"
              icon={BarChart2}
              delay={0.16}
            />

            <StatCard
              label="Best Score"
              value={bestScoreDisplay}
              subtext={hasCompletedInterviews ? 'Highest AI evaluation' : 'Pending first session'}
              accentColor="#F59E0B"
              icon={Award}
              delay={0.24}
            />
          </div>

          {/* ── 2. PERFORMANCE ANALYTICS & AI INSIGHTS ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* PERFORMANCE OVERVIEW */}
            <div
              className="voxa-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: 'rgba(6, 182, 212, 0.12)',
                        color: '#06B6D4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Activity size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--voxa-card-text)', margin: 0 }}>
                        Performance Analytics
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Real Performance Trends
                      </span>
                    </div>
                  </div>

                  {hasCompletedInterviews && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        fontWeight: 600,
                      }}
                    >
                      {stats?.average_score}% Avg
                    </span>
                  )}
                </div>

                {hasCompletedInterviews && stats?.weekly_performance && stats.weekly_performance.length > 0 ? (
                  <div style={{ height: 180, width: '100%', marginTop: '0.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.weekly_performance}>
                        <defs>
                          <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--voxa-card-bg)',
                            borderColor: 'var(--voxa-card-border)',
                            borderRadius: '10px',
                            fontSize: '12px',
                          }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#perfGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  /* Professional Empty Analytics State */
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        color: '#06B6D4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <BarChart2 size={24} />
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--voxa-card-text)', marginBottom: '0.35rem' }}>
                      No analytics available yet
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto 1.25rem' }}>
                      Complete interviews to generate your performance analytics.
                    </p>
                    <button
                      onClick={() => navigate('/interview/setup')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 1.15rem',
                        borderRadius: '999px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: '#06B6D4',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>Take an Interview</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI INSIGHTS */}
            <div
              className="voxa-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(139, 92, 246, 0.12)',
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--voxa-card-text)', margin: 0 }}>
                      AI Insights
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Adaptive Intelligence
                    </span>
                  </div>
                </div>

                {hasCompletedInterviews ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      You have completed {stats?.interviews_completed} interview session{stats?.interviews_completed !== 1 ? 's' : ''}. View detailed evaluation breakdowns and question feedback in your reports.
                    </p>
                    <button
                      onClick={() => navigate('/ai-insights')}
                      style={{
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 1rem',
                        borderRadius: '999px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#8B5CF6',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>Explore AI Insights</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  /* Professional Empty AI Insights State */
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        color: '#8B5CF6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <Brain size={24} />
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--voxa-card-text)', marginBottom: '0.35rem' }}>
                      No AI insights available
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto 1.25rem' }}>
                      Complete an interview to unlock AI-powered insights.
                    </p>
                    <button
                      onClick={() => navigate('/interview/setup')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 1.15rem',
                        borderRadius: '999px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#8B5CF6',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>Unlock AI Insights</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 3. RECENT INTERVIEWS (REAL DATA ONLY) ── */}
          <div className="voxa-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--voxa-card-text)', margin: 0 }}>
                    Recent Interviews
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Your Authenticated Activity
                  </span>
                </div>
              </div>

              {hasCompletedInterviews && (
                <button
                  onClick={() => navigate('/interviews')}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#8B5CF6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {hasCompletedInterviews && stats?.recent_interviews && stats.recent_interviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.recent_interviews.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.status === 'completed' ? navigate(`/interview/complete/${item.id}`) : undefined}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--voxa-card-border)',
                      backgroundColor: 'rgba(139, 92, 246, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      cursor: item.status === 'completed' ? 'pointer' : 'default',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--voxa-card-text)' }}>
                        {item.role}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.type} • {item.difficulty} • {item.duration}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(item.date)}
                      </span>
                      {item.score !== null ? (
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 800,
                            color: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '8px',
                          }}
                        >
                          {item.score}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Professional Empty State */
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Clock size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.6 }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--voxa-card-text)', marginBottom: '0.35rem' }}>
                  No interview history yet
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                  Your interview activity will appear here after you complete your first interview.
                </p>
                <button
                  onClick={() => navigate('/interview/setup')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.35rem',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
                  }}
                >
                  <Zap size={16} />
                  <span>Start Your First Interview</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
