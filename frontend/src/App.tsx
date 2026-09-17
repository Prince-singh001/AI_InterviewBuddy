import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { queryClient } from './main'

// Layouts
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Public pages
import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ProfileSetup from '@/pages/auth/ProfileSetup'

// App pages
import Dashboard from '@/pages/Dashboard'
import Resume from '@/pages/Resume'
import JobAnalyzer from '@/pages/JobAnalyzer'
import InterviewSetup from '@/pages/InterviewSetup'
import InterviewRoom from '@/pages/InterviewRoom'
import InterviewComplete from '@/pages/InterviewComplete'
import AIInsights from '@/pages/AIInsights'
import Practice from '@/pages/Practice'
import CareerRoadmap from '@/pages/CareerRoadmap'
import Progress from '@/pages/Progress'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Interviews from '@/pages/Interviews'
import Profile from '@/pages/Profile'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  const { theme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()
  const prevAuthRef = useRef(isAuthenticated)

  // Keep <html> class in sync if store hydrates after initTheme() call
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [theme])

  // Clear React Query cache when user logs out to prevent stale data leaking
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      queryClient.clear()
    }
    prevAuthRef.current = isAuthenticated
  }, [isAuthenticated])

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />

        {/* Protected App Routes */}
        <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
        <Route path="/interviews" element={<PrivateRoute><AppLayout><Interviews /></AppLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
        <Route path="/practice" element={<PrivateRoute><AppLayout><Practice /></AppLayout></PrivateRoute>} />
        <Route path="/ai-insights" element={<PrivateRoute><AppLayout><AIInsights /></AppLayout></PrivateRoute>} />
        <Route path="/career-roadmap" element={<PrivateRoute><AppLayout><CareerRoadmap /></AppLayout></PrivateRoute>} />
        <Route path="/resume" element={<PrivateRoute><AppLayout><Resume /></AppLayout></PrivateRoute>} />
        <Route path="/job-analyzer" element={<PrivateRoute><AppLayout><JobAnalyzer /></AppLayout></PrivateRoute>} />
        <Route path="/analysis" element={<PrivateRoute><AppLayout><Progress /></AppLayout></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><AppLayout><Progress /></AppLayout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><AppLayout><Reports /></AppLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>} />

        {/* Interview flow */}
        <Route path="/interview/setup" element={<PrivateRoute><AppLayout><InterviewSetup /></AppLayout></PrivateRoute>} />
        <Route path="/interview/room/:id" element={<PrivateRoute><InterviewRoom /></PrivateRoute>} />
        <Route path="/interview/complete/:id" element={<PrivateRoute><InterviewComplete /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
