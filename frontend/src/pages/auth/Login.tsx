import { authApi } from '@/services/apiService'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  // ============================================================
  // LOGIN
  // EMAIL + PASSWORD → DIRECT LOGIN
  // NO OTP
  // ============================================================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const res = await authApi.login(
        email.trim(),
        password,
      )

      // ========================================================
      // PREPARE USER FOR ZUSTAND
      // ========================================================

      const user = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        college: res.user.college,
        targetRole: res.user.target_role,
        experience: res.user.experience,
        skills: res.user.skills ?? [],
        github: res.user.github,
        linkedin: res.user.linkedin,
        portfolio: res.user.portfolio,
        profileComplete: res.user.profile_complete,
      }

      // ========================================================
      // SAVE USER + TOKENS
      // ========================================================

      login(
        user,
        res.access_token,
        res.refresh_token,
      )

      toast.success('Login successful!')

      // ========================================================
      // REDIRECT
      // ========================================================

      if (res.user.profile_complete) {
        navigate('/dashboard', {
          replace: true,
        })
      } else {
        navigate('/profile-setup', {
          replace: true,
        })
      }

    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials.'

      toast.error(message)

    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          Sign in to continue your interview prep journey
        </p>
      </div>

      {/* ======================================================
          LOGIN FORM
      ====================================================== */}

      <form
        onSubmit={handleLogin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* ====================================================
            EMAIL
        ==================================================== */}

        <div>
          <label
            htmlFor="login-email"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Email Address
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className="input"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            disabled={loading}
            required
          />
        </div>

        {/* ====================================================
            PASSWORD
        ==================================================== */}

        <div>
          <label
            htmlFor="login-password"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Password
          </label>

          <div
            style={{
              position: 'relative',
            }}
          >
            <input
              id="login-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Your password"
              className="input"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              disabled={loading}
              required
              style={{
                paddingRight: '2.75rem',
              }}
            />

            {/* SHOW / HIDE PASSWORD */}

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              disabled={loading}
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform:
                  'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {/* ==================================================
              FORGOT PASSWORD
          ================================================== */}

          <div
            style={{
              textAlign: 'right',
              marginTop: '0.375rem',
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--blue-light)',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* ====================================================
            LOGIN BUTTON
        ==================================================== */}

        <button
          id="login-submit"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                style={{
                  animation:
                    'login-spin 1s linear infinite',
                }}
              />

              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* ======================================================
          REGISTER
      ====================================================== */}

      <p
        style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        Don't have an account?{' '}

        <Link
          to="/register"
          style={{
            color: 'var(--blue-light)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Sign up free
        </Link>
      </p>

      {/* ======================================================
          ANIMATION
      ====================================================== */}

      <style>{`
        @keyframes login-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  )
}