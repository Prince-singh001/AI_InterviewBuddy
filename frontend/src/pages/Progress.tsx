import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { interviewsApi, type InterviewListItem } from '@/services/apiService'
import { getScoreColor } from '@/lib/utils'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--blue-light)' }}>
          {p.value}{p.name === 'score' ? '%' : ''}
        </div>
      ))}
    </div>
  )
}

function EmptyProgress({ onStart }: { onStart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
      <BarChart2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem' }} />
      <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem' }}>No performance analytics yet</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
        Complete interviews to generate your performance analytics.
      </p>
      <button onClick={onStart} className="btn btn-purple btn-lg" style={{ gap: '0.5rem' }}>
        <Zap size={18} /> Start Your First Interview
      </button>
    </motion.div>
  )
}

export default function Progress() {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--red)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Unable to load progress data</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>There was a problem fetching your data.</p>
        <button onClick={() => refetch()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  const completed = interviews.filter((i) => i.status === 'completed' && i.score != null)
  if (completed.length === 0) {
    return <EmptyProgress onStart={() => navigate('/interview/setup')} />
  }

  // Build timeline data from completed interviews (most recent first → reverse for chart)
  const timelineData = [...completed]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-14) // last 14
    .map((iv, idx) => ({
      label: `#${idx + 1}`,
      score: iv.score as number,
      role: iv.role,
    }))

  const avgScore = Math.round(completed.reduce((a, i) => a + (i.score ?? 0), 0) / completed.length)
  const best = Math.max(...completed.map((i) => i.score ?? 0))
  const totalQuestions = completed.length * 8

  // Skill radar: derive from available interview types
  const typeMap: Record<string, number[]> = {}
  completed.forEach((i) => {
    const t = i.type || 'General'
    if (!typeMap[t]) typeMap[t] = []
    if (i.score != null) typeMap[t].push(i.score)
  })
  const radarData = Object.entries(typeMap).map(([subject, scores]) => ({
    subject: subject.length > 12 ? subject.slice(0, 12) + '…' : subject,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    fullMark: 100,
  }))

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Progress Tracking</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your improvement over {completed.length} completed interviews</p>
      </motion.div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Average Score',      value: `${avgScore}%` },
          { label: 'Best Score',         value: `${best}%` },
          { label: 'Interviews Done',    value: completed.length },
          { label: 'Questions Answered', value: totalQuestions },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Line chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Score Progression</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" name="score" stroke="var(--blue)" strokeWidth={2.5}
                dot={{ fill: 'var(--blue)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar — per interview type */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Score by Interview Type</h2>
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="var(--purple)" fill="var(--purple)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                Complete interviews in 3+ different types to see the skill radar.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bar chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Score per Interview</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="score" name="Score" fill="var(--purple)" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Score heatmap */}
      {timelineData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Recent Scores</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(timelineData.length, 7)}, 1fr)`, gap: '0.75rem' }}>
            {timelineData.slice(-7).map((d, i) => {
              const color = getScoreColor(d.score)
              return (
                <div key={i} style={{ textAlign: 'center', padding: '1rem 0.5rem', background: `${color}12`, borderRadius: 'var(--radius-md)', border: `1px solid ${color}25` }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{d.label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color }}>{d.score}%</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.role}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
