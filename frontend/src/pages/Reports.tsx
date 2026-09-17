import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, Eye, RotateCcw, Filter, Zap, AlertCircle, RefreshCw, FileText } from 'lucide-react'
import { interviewsApi, type InterviewListItem } from '@/services/apiService'
import { getScoreColor, getScoreBadgeClass, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const SORT_OPTIONS = ['Latest First', 'Highest Score', 'Lowest Score']

export default function Reports() {
  const navigate = useNavigate()
  const [sort, setSort] = useState('Latest First')

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
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)', marginBottom: '0.875rem' }} />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--red)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Unable to load reports</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>There was a problem fetching your data.</p>
        <button onClick={() => refetch()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  const completed = interviews.filter((i) => i.status === 'completed')
  const avg = completed.length
    ? Math.round(completed.reduce((a, i) => a + (i.score ?? 0), 0) / completed.length)
    : 0
  const best = completed.length ? Math.max(...completed.map((i) => i.score ?? 0)) : 0

  const sorted = [...completed].sort((a, b) => {
    if (sort === 'Highest Score') return (b.score ?? 0) - (a.score ?? 0)
    if (sort === 'Lowest Score')  return (a.score ?? 0) - (b.score ?? 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Reports & History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View, analyze, and download your interview reports</p>
      </motion.div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Interviews', value: interviews.length,                        color: 'var(--blue)' },
          { label: 'Completed',        value: completed.length,                          color: 'var(--green)' },
          { label: 'Avg Score',        value: avg > 0 ? `${avg}%` : 'No data yet',      color: 'var(--purple)' },
          { label: 'Best Score',       value: best > 0 ? `${best}%` : 'No data yet',    color: 'var(--orange)' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {completed.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card"
          style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No reports yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Complete your first interview to generate a report
          </p>
          <button onClick={() => navigate('/interview/setup')} className="btn btn-primary btn-lg">
            <Zap size={18} /> Start Interview
          </button>
        </motion.div>
      ) : (
        <>
          {/* Sort */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Filter size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sort:</span>
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="input" style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Interview list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {sorted.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="card card-interactive" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{inv.role}</h3>
                      <span className="badge badge-muted">{inv.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📅 {formatDate(inv.created_at)}</span>
                      <span className="badge badge-green">{inv.status}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 70 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: inv.score != null ? getScoreColor(inv.score) : 'var(--text-muted)', lineHeight: 1 }}>
                      {inv.score != null ? `${inv.score}%` : '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => navigate(`/interview/complete/${inv.id}`)} className="btn btn-ghost btn-sm">
                      <Eye size={15} /> View
                    </button>
                    <button onClick={() => toast.info('PDF download will be available in a future update.')} className="btn btn-ghost btn-sm">
                      <Download size={15} />
                    </button>
                    <button onClick={() => navigate('/interview/setup')} className="btn btn-primary btn-sm">
                      <RotateCcw size={15} /> Retry
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
