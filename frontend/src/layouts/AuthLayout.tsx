import { useThemeStore } from '@/store/themeStore'
import { motion } from 'framer-motion'
import { Bot, Moon, Sun } from 'lucide-react'

interface AuthLayoutProps { children: React.ReactNode }

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { theme, toggle: toggleTheme } = useThemeStore()
  const features = [
    { icon: '🎯', text: 'AI-powered adaptive interviews' },
    { icon: '📊', text: 'Real-time performance analytics' },
    { icon: '🧠', text: 'Resume intelligence & job matching' },
    { icon: '🗺️', text: 'Personalized career roadmaps' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-base)',
      position: 'relative',
    }}>
      {/* Theme toggle — top-right corner */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '3rem', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', top: -100, left: -100,
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', bottom: -50, right: -50,
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, textAlign: 'center' }}>
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
            }}>
              <Bot size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Interview Buddy
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--purple-light)' }}>
                Buddy AI
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem' }}
          >
            Your AI Interview{' '}
            <span className="gradient-text">Partner</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2.5rem' }}
          >
            Practice Smarter. Interview Better. Get Hired.
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1rem',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{f.icon}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              marginTop: '2.5rem',
              padding: '1rem',
              background: 'rgba(99,102,241,0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Trusted by</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>10,000+ candidates</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>preparing for their dream roles</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '3rem 2rem',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          {children}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="borderRight"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
