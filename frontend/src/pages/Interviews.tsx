import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MessageSquare, Filter, Search, TrendingUp, Clock,
  Calendar, ChevronRight, ArrowUpRight, RotateCcw, Zap, AlertCircle, RefreshCw,
} from 'lucide-react'
import { interviewsApi, type InterviewListItem } from '@/services/apiService'
import { getScoreColor, getScoreBadgeClass, getScoreLabel, formatDate } from '@/lib/utils'

export default function Interviews() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')

  const { data: interviews = [], isLoading, isError, refetch } = useQuery<InterviewListItem[]>({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

  const completed = interviews.filter((i) => i.status === 'completed')
  const avg = completed.length
    ? Math.round(completed.reduce((acc, i) => acc + (i.score ?? 0), 0) / completed.length)
    : 0
  const best = completed.length ? Math.max(...completed.map((i) => i.score ?? 0)) : 0

  const filtered = interviews
    .filter((i) => {
      const q = search.toLowerCase()
      return i.role.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
    })
    .sort((a, b) =>
      sortBy === 'date'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : (b.score ?? 0) - (a.score ?? 0),
    )

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 18, width: 160, borderRadius: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)', marginBottom: '0.875rem' }} />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--red)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Unable to load interviews</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please check your connection and try again.</p>
        <button onClick={() => refetch()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            My Interviews
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {interviews.length} interview{interviews.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={() => navigate('/interview/setup')} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Zap size={15} /> New Interview
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: MessageSquare, label: 'Total Interviews', value: interviews.length,                          color: 'stat-card-blue' },
          { icon: TrendingUp,    label: 'Average Score',    value: avg > 0 ? `${avg}%` : 'No data yet',       color: 'stat-card-purple' },
          { icon: ArrowUpRight,  label: 'Best Score',       value: best > 0 ? `${best}%` : 'No data yet',     color: 'stat-card-green' },
        ].map((s, i) => (
          <div key={i} className={`card ${s.color}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="icon-box" style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} style={{ color: 'var(--blue-light)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Empty state */}
      {interviews.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card"
          style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No interview history yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your interview activity will appear here after you complete your first interview.
          </p>
          <button onClick={() => navigate('/interview/setup')} className="btn btn-purple btn-lg" style={{ gap: '0.5rem' }}>
            <Zap size={18} /> Start Your First Interview
          </button>
        </motion.div>
      ) : (
        <>
          {/* Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="card" style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search role or type..." className="input"
                style={{ paddingLeft: '2rem', fontSize: '0.8125rem', height: 36 }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Filter size={13} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
              {(['date', 'score'] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`btn btn-sm${sortBy === s ? ' btn-primary' : ' btn-ghost'}`}>
                  {s === 'date' ? <><Calendar size={12} /> Date</> : <><TrendingUp size={12} /> Score</>}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Interview cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <MessageSquare size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No interviews match your search</p>
              </div>
            ) : (
              filtered.map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card card-interactive"
                  style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.125rem 1.5rem' }}
                  onClick={() => inv.status === 'completed' ? navigate(`/interview/complete/${inv.id}`) : undefined}>
                  {/* Score ring */}
                  <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                    <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={28} cy={28} r={22} fill="none" stroke="var(--bg-muted)" strokeWidth={5} />
                      {inv.score != null && (
                        <circle cx={28} cy={28} r={22} fill="none" stroke={getScoreColor(inv.score)} strokeWidth={5}
                          strokeLinecap="round" strokeDasharray={138.2}
                          strokeDashoffset={138.2 - (inv.score / 100) * 138.2}
                          style={{ transition: 'stroke-dashoffset 1s ease' }} />
                      )}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800,
                      color: inv.score != null ? getScoreColor(inv.score) : 'var(--text-muted)' }}>
                      {inv.score ?? '—'}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{inv.role}</span>
                      {inv.score != null && (
                        <span className={`badge ${getScoreBadgeClass(inv.score)}`}>{getScoreLabel(inv.score)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <span className="badge badge-muted">{inv.type}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />{formatDate(inv.created_at)}
                      </span>
                      <span className={`badge ${inv.status === 'completed' ? 'badge-green' : 'badge-muted'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  {inv.status === 'completed' && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/interview/complete/${inv.id}`) }}
                        className="btn btn-ghost btn-sm">
                        View Report <ChevronRight size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate('/interview/setup') }}
                        className="btn btn-outline btn-sm">
                        <RotateCcw size={13} /> Retake
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
