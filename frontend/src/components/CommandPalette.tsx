import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Zap, FileText, Briefcase, Dumbbell, BarChart3,
  LayoutDashboard, Map, Settings, LogOut, Moon, Sun, X,
  MessageSquare, TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const COMMANDS = [
  { id: 'interview', label: 'Start New Interview', icon: Zap, path: '/interview/setup', group: 'Actions', color: 'var(--blue)' },
  { id: 'resume', label: 'Upload Resume', icon: FileText, path: '/resume', group: 'Actions', color: 'var(--purple)' },
  { id: 'job', label: 'Analyze Job Description', icon: Briefcase, path: '/job-analyzer', group: 'Actions', color: 'var(--green)' },
  { id: 'practice', label: 'Open Practice Center', icon: Dumbbell, path: '/practice', group: 'Navigate', color: 'var(--blue)' },
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', group: 'Navigate', color: 'var(--blue)' },
  { id: 'interviews', label: 'My Interviews', icon: MessageSquare, path: '/interviews', group: 'Navigate', color: 'var(--blue)' },
  { id: 'roadmap', label: 'View Career Roadmap', icon: Map, path: '/career-roadmap', group: 'Navigate', color: 'var(--purple)' },
  { id: 'reports', label: 'View Reports', icon: BarChart3, path: '/reports', group: 'Navigate', color: 'var(--blue)' },
  { id: 'progress', label: 'Track Progress', icon: TrendingUp, path: '/progress', group: 'Navigate', color: 'var(--green)' },
  { id: 'settings', label: 'Open Settings', icon: Settings, path: '/settings', group: 'System', color: 'var(--text-muted)' },
  { id: 'theme', label: 'Toggle Dark / Light Mode', icon: Moon, path: null, group: 'System', color: 'var(--orange)' },
  { id: 'logout', label: 'Logout', icon: LogOut, path: null, group: 'System', color: 'var(--red)' },
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  const execute = useCallback(
    (cmd: (typeof COMMANDS)[0]) => {
      if (cmd.id === 'logout') {
        logout()
        navigate('/')
      } else if (cmd.id === 'theme') {
        const root = document.documentElement
        root.classList.toggle('light-theme')
      } else if (cmd.path) {
        navigate(cmd.path)
      }
      onClose()
    },
    [navigate, logout, onClose]
  )

  useEffect(() => {
    if (!open) { setQuery(''); setSelected(0) }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[selected]) execute(filtered[selected]) }
      if (e.key === 'Escape')    { onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selected, execute, onClose])

  const groups = Array.from(new Set(filtered.map((c) => c.group)))

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 200,
            }}
          />
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: 560, zIndex: 201,
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
                }}
              />
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0.5rem' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No commands found
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem 0.25rem' }}>
                      {group}
                    </div>
                    {filtered.filter((c) => c.group === group).map((cmd) => {
                      const isSelected = filtered.indexOf(cmd) === selected
                      const Icon = cmd.icon
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setSelected(filtered.indexOf(cmd))}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
                            padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                            border: isSelected ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.1s',
                          }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: cmd.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={15} style={{ color: cmd.color }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                            {cmd.label}
                          </span>
                          {isSelected && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '0.125rem 0.375rem', borderRadius: 4 }}>
                              ↵ Enter
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.625rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
              <span style={{ marginLeft: 'auto' }}>Ctrl + K</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
