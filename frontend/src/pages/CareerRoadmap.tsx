import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { dashboardApi, DashboardStats } from '@/services/apiService'

export default function CareerRoadmap() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null)

  useEffect(() => {
    let isMounted = true
    dashboardApi.get()
      .then((data) => {
        if (isMounted) setDashboard(data)
      })
      .catch(() => {
        // Handle error gracefully
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={28} color="var(--purple-light)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const hasCompletedInterviews = (dashboard?.interviews_completed || 0) > 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '2.5rem' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Career Roadmap
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Personalized career progression and skill development roadmap based on your real interview evaluations.
        </p>
      </motion.div>

      {!hasCompletedInterviews ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: 640, margin: '2rem auto' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <MapPin size={28} color="var(--purple-light)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No roadmap generated yet
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Complete interviews to generate your personalized career path and skill progression analytics.
          </p>
          <button
            onClick={() => navigate('/interview/setup')}
            className="btn btn-purple"
            style={{ padding: '0.75rem 1.5rem', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Sparkles size={16} /> Start Your First Interview <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Roadmap generation in progress based on your completed interview sessions.
          </p>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
