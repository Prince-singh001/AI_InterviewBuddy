import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, AlertTriangle, Target, TrendingUp, ArrowRight, Zap, Lightbulb, AlertCircle, RefreshCw } from 'lucide-react'
import { interviewsApi, type InterviewListItem } from '@/services/apiService'

function EmptyInsights({ onStart }: { onStart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
      <Lightbulb size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem' }} />
      <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem' }}>No AI insights available</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
        Complete an interview to unlock personalized AI-powered insights.
      </p>
      <button onClick={onStart} className="btn btn-purple btn-lg" style={{ gap: '0.5rem' }}>
        <Zap size={18} /> Start Your First Interview
      </button>
    </motion.div>
  )
}

export default function AIInsights() {
  const navigate = useNavigate()

  const { data: interviews = [], isLoading, isError, refetch } = useQuery<InterviewListItem[]>({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100 }}>
        <div className="skeleton" style={{ height: 36, width: 220, borderRadius: 8, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--red)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Unable to load insights</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>There was a problem fetching your data.</p>
        <button onClick={() => refetch()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  const completed = interviews.filter((i) => i.status === 'completed' && i.score != null)
  if (completed.length === 0) {
    return <EmptyInsights onStart={() => navigate('/interview/setup')} />
  }

  const avgScore = Math.round(completed.reduce((a, i) => a + (i.score ?? 0), 0) / completed.length)
  const best = Math.max(...completed.map((i) => i.score ?? 0))
  const worst = Math.min(...completed.map((i) => i.score ?? 0))
  const improving = completed.length >= 2
    ? (completed[completed.length - 1].score ?? 0) > (completed[0].score ?? 0)
    : false

  // Derive strengths/improvements from actual score data
  const highScoreInterviews = completed.filter((i) => (i.score ?? 0) >= 80)
  const lowScoreInterviews  = completed.filter((i) => (i.score ?? 0) < 70)
  const strongTypes  = [...new Set(highScoreInterviews.map((i) => i.type))]
  const weakTypes    = [...new Set(lowScoreInterviews.map((i) => i.type))]

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>AI Insights</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Analysis based on your {completed.length} completed interview{completed.length !== 1 ? 's' : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <div className="badge badge-purple">AI Evaluation</div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Based on {completed.length} session{completed.length !== 1 ? 's' : ''}</span>
        </div>
      </motion.div>

      {/* Strengths */}
      {strongTypes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card" style={{ marginBottom: '1.5rem', background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.12)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--green-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} /> Strong Interview Types
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {strongTypes.map((type, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.12)' }}>
                <CheckCircle size={16} color="var(--green)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {type} — scoring ≥80%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Improvements */}
      {weakTypes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card" style={{ marginBottom: '1.5rem', background: 'rgba(245,158,11,0.03)', borderColor: 'rgba(245,158,11,0.12)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--orange-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> Areas Needing Improvement
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {weakTypes.map((type, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(245,158,11,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: 'var(--orange)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {type} — scoring below 70%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card" style={{ marginBottom: '1.5rem', background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--blue-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} /> Recommendations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          {[
            { text: 'Practice more interviews to get richer AI insights', action: 'New Interview', link: '/interview/setup' },
            { text: weakTypes.length > 0 ? `Focus on ${weakTypes[0]} — your lowest-scoring type` : 'Try different interview types to diversify your skills', action: 'Practice Now', link: '/practice' },
            { text: 'Review your past interview reports to identify patterns', action: 'View Reports', link: '/reports' },
            { text: 'Follow a structured study plan with the career roadmap', action: 'View Roadmap', link: '/career-roadmap' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="card card-interactive"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
              onClick={() => navigate(item.link)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🎯</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '0.625rem' }}>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                      {item.action} <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick stats — derived from real data */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Average Score',    value: `${avgScore}%`,          color: 'var(--blue)',   desc: `Over ${completed.length} sessions` },
          { label: 'Best Session',     value: `${best}%`,              color: 'var(--green)',  desc: 'All time high' },
          { label: 'Trend',            value: improving ? '↑ Up' : completed.length >= 2 ? '↓ Down' : '—', color: improving ? 'var(--green)' : completed.length >= 2 ? 'var(--orange)' : 'var(--text-muted)', desc: 'Recent direction' },
          { label: 'Sessions',         value: completed.length,        color: 'var(--purple)', desc: 'Completed interviews' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, marginBottom: '0.25rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.desc}</div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        <button onClick={() => navigate('/practice')} className="btn btn-primary btn-lg">
          Start Practice Session
        </button>
        <button onClick={() => navigate('/career-roadmap')} className="btn btn-ghost btn-lg">
          <TrendingUp size={18} /> View Career Roadmap
        </button>
      </motion.div>
    </div>
  )
}
