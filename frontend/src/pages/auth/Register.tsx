import { authApi } from '@/services/apiService'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const navigate = useNavigate()

  // Zustand auth store
  const setAuth = useAuthStore((state) => state.setAuth)

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }))
    }

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const passwordStrength = (() => {
    const password = form.password
    let score = 0

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    return score
  })()

  const strengthColors = [
    'var(--red)',
    'var(--orange)',
    'var(--blue)',
    'var(--green)',
  ]

  const strengthLabels = [
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ]

  // ============================================================
  // CREATE ACCOUNT → SEND OTP
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirm
    ) {
      toast.error('Please fill in all fields')
      return
    }

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      toast.error(
        'Password must be at least 8 characters',
      )
      return
    }

    setLoading(true)

    try {
      const res = await authApi.register(
        form.name.trim(),
        form.email.trim(),
        form.password,
      )

      toast.success(
        res.message ||
          'OTP sent to your email address',
      )

      setOtpSent(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create account. Please try again.'

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // VERIFY SIGNUP OTP
  //
  // IMPORTANT:
  // Backend returns:
  // access_token
  // refresh_token
  // user
  //
  // We save them in Zustand here so the user is
  // automatically authenticated after signup.
  // ============================================================

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error('OTP must be 6 digits')
      return
    }

    setVerifying(true)

    try {
      const res = await authApi.verifySignupOTP(
        form.email.trim(),
        otp.trim(),
      )

      // ========================================================
      // SAVE AUTHENTICATION STATE
      // ========================================================

      setAuth(
        res.user,
        res.access_token,
        res.refresh_token,
      )

      toast.success(
        'Email verified! Account created successfully.',
      )

      // User is now authenticated.
      // Continue to profile setup without login.
      navigate('/profile-setup', {
        replace: true,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid OTP. Please try again.'

      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOTP = async () => {
    setResending(true)

    try {
      const res =
        await authApi.resendSignupOTP(
          form.email.trim(),
        )

      toast.success(
        res.message ||
          'A new OTP has been sent',
      )

      setOtp('')
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to resend OTP'

      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  // ============================================================
  // OTP SCREEN
  // ============================================================

  if (otpSent) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 1rem',
              borderRadius: '50%',
              background: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mail
              size={30}
              color="var(--blue-light)"
            />
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Verify your email
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            We sent a 6-digit verification code
            to
          </p>

          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 700,
              marginTop: '0.25rem',
            }}
          >
            {form.email}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div>
            <label
              htmlFor="signup-otp"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Verification Code
            </label>

            <input
              id="signup-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="input"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6),
                )
              }
              autoComplete="one-time-code"
              style={{
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.4rem',
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={
              verifying ||
              otp.length !== 6
            }
            onClick={handleVerifyOTP}
            style={{
              width: '100%',
              padding: '0.75rem',
            }}
          >
            {verifying ? (
              <Loader2
                size={18}
                style={{
                  animation:
                    'spin 1s linear infinite',
                }}
              />
            ) : (
              'Verify Email'
            )}
          </button>

          <button
            type="button"
            disabled={resending}
            onClick={handleResendOTP}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--blue-light)',
              fontWeight: 600,
              cursor: resending
                ? 'not-allowed'
                : 'pointer',
              padding: '0.5rem',
            }}
          >
            {resending
              ? 'Sending...'
              : 'Resend OTP'}
          </button>

          <button
            type="button"
            onClick={() => {
              setOtpSent(false)
              setOtp('')
            }}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem',
            }}
          >
            <ArrowLeft size={15} />
            Change email
          </button>
        </div>

        <style>{`
          @keyframes spin {
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

  // ============================================================
  // REGISTER FORM
  // ============================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
    >
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
          Create your account
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          Start your AI-powered interview
          journey today
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Full Name */}
        <div>
          <label
            htmlFor="reg-name"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Full Name
          </label>

          <input
            id="reg-name"
            type="text"
            placeholder="Prince Kumar"
            className="input"
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="reg-email"
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
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            className="input"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="reg-password"
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
              id="reg-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Min 8 characters"
              className="input"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              style={{
                paddingRight: '2.5rem',
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
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
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {form.password && (
            <div
              style={{
                marginTop: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '4px',
                }}
              >
                {[0, 1, 2, 3].map(
                  (index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 4,
                        background:
                          index <
                          passwordStrength
                            ? strengthColors[
                                passwordStrength -
                                  1
                              ]
                            : 'var(--bg-muted)',
                        transition:
                          'background 0.3s',
                      }}
                    />
                  ),
                )}
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  color:
                    strengthColors[
                      passwordStrength - 1
                    ] ||
                    'var(--text-muted)',
                }}
              >
                {strengthLabels[
                  passwordStrength - 1
                ] || 'Very Weak'}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="reg-confirm"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Confirm Password
          </label>

          <div
            style={{
              position: 'relative',
            }}
          >
            <input
              id="reg-confirm"
              type="password"
              placeholder="Repeat password"
              className="input"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
              style={{
                paddingRight: '2.5rem',
              }}
            />

            {form.confirm &&
              form.confirm ===
                form.password && (
                <Check
                  size={16}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    color: 'var(--green)',
                  }}
                />
              )}
          </div>
        </div>

        {/* Terms */}
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          By signing up, you agree to our{' '}
          <a
            href="#"
            style={{
              color: 'var(--blue-light)',
              textDecoration: 'none',
            }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
            style={{
              color: 'var(--blue-light)',
              textDecoration: 'none',
            }}
          >
            Privacy Policy
          </a>
          .
        </div>

        {/* Submit */}
        <button
          id="reg-submit"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginTop: '0.25rem',
          }}
        >
          {loading ? (
            <Loader2
              size={18}
              style={{
                animation:
                  'spin 1s linear infinite',
              }}
            />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          style={{
            color: 'var(--blue-light)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Sign in
        </Link>
      </p>

      <style>{`
        @keyframes spin {
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