import { getScoreColor } from '@/lib/utils'
import { interviewsApi } from '@/services/apiService'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Download,
  Loader2,
  RotateCcw, Share2,
  Zap,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

// ── Animated Score Number ────────────────────────────────────
function AnimatedScore({
  value,
  size = 'lg',
}: {
  value: number
  size?: 'sm' | 'lg'
}) {
  const color = getScoreColor(value)

  if (size === 'sm') {
    return <span style={{ color, fontWeight: 700 }}>{value}</span>
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: '1rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        / 100
      </div>
    </div>
  )
}

// ── Score Bar ────────────────────────────────────────────────
function ScoreBar({
  label,
  value,
  delay = 0,
}: {
  label: string
  value: number
  delay?: number
}) {
  const safeValue = Number.isFinite(value) ? value : 0
  const color = getScoreColor(safeValue)

  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.375rem',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color,
          }}
        >
          {safeValue}
        </span>
      </div>

      <div className="progress-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, safeValue))}%` }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
            delay,
          }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          }}
        />
      </div>
    </div>
  )
}

// ── Report shape ─────────────────────────────────────────────
interface ReportData {
  id: string
  role: string
  type: string
  interview_type?: string

  overall_score: number | null

  status: string

  strengths: string[]
  improvements: string[]
  recommendations: string[]

  communication_metrics: {
    speaking_speed?: number
    filler_words?: number
    avg_pause?: number
    clarity?: number
  }

  star_scores: {
    situation?: number
    task?: number
    action?: number
    result?: number
    overall?: number
    feedback?: string
  }
}

// ── Normalize backend response ──────────────────────────────
function normalizeReport(raw: any): ReportData | null {
  if (!raw) return null

  // Some backend responses may return:
  // { report: {...}, status: "completed" }
  const data = raw.report ?? raw

  // Report is not ready yet
  if (!data || typeof data !== 'object') {
    return null
  }

  // If backend explicitly says processing and has no report
  if (
    raw.status === 'processing' &&
    !raw.report
  ) {
    return null
  }

  return {
    id: String(data.id ?? raw.id ?? ''),
    role: String(data.role ?? raw.role ?? 'Interview'),
    type: String(
      data.type ??
      data.interview_type ??
      raw.type ??
      raw.interview_type ??
      'Technical'
    ),

    interview_type:
      data.interview_type ??
      raw.interview_type ??
      undefined,

    overall_score:
      typeof data.overall_score === 'number'
        ? data.overall_score
        : typeof data.overall === 'number'
          ? data.overall
          : null,

    status: String(
      data.status ??
      raw.status ??
      'completed'
    ),

    // IMPORTANT:
    // Always convert undefined/null into []
    strengths: Array.isArray(data.strengths)
      ? data.strengths
      : [],

    improvements: Array.isArray(data.improvements)
      ? data.improvements
      : [],

    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations
      : [],

    communication_metrics:
      data.communication_metrics &&
      typeof data.communication_metrics === 'object'
        ? data.communication_metrics
        : {},

    star_scores:
      data.star_scores &&
      typeof data.star_scores === 'object'
        ? data.star_scores
        : {},
  }
}

// ── Loading Screen ───────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <Loader2
        size={44}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--blue)',
        }}
      />

      <h2
        style={{
          color: 'var(--text-primary)',
          fontWeight: 700,
          margin: 0,
        }}
      >
        Generating your AI report...
      </h2>

      <p
        style={{
          color: 'var(--text-secondary)',
          margin: 0,
        }}
      >
        AI is analyzing your interview performance.
      </p>

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          margin: 0,
        }}
      >
        This usually takes a few moments.
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
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function InterviewComplete() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery<ReportData | null>({
    queryKey: ['interview-report', id],

    queryFn: async () => {
      if (!id) return null

      const response = await interviewsApi.report(id)

      return normalizeReport(response)
    },

    enabled: !!id && id !== 'new',

    // Report may still be generating.
    // Poll every 2 seconds.
    refetchInterval: (query) => {
      const current = query.state.data

      if (!current) {
        return 2000
      }

      if (
        current.status === 'processing' ||
        current.status === 'created' ||
        current.status === 'pending'
      ) {
        return 2000
      }

      return false
    },

    retry: 10,

    retryDelay: 2000,
  })

  // ── Loading ────────────────────────────────────────────────
  if (isLoading || !report) {
    return <LoadingScreen />
  }

  // ── Error ──────────────────────────────────────────────────
  if (isError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <AlertTriangle
          size={44}
          color="var(--orange)"
        />

        <p
          style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '1.1rem',
            margin: 0,
          }}
        >
          Report unavailable
        </p>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            margin: 0,
          }}
        >
          The report could not be loaded.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => navigate('/interviews')}
            className="btn btn-primary"
          >
            View All Interviews
          </button>

          <button
            onClick={() => navigate('/interview/setup')}
            className="btn btn-ghost"
          >
            New Interview
          </button>
        </div>
      </div>
    )
  }

  // ── Safe defaults ──────────────────────────────────────────
  const overall = report.overall_score ?? 0

  const comm = report.communication_metrics ?? {}
  const star = report.star_scores ?? {}

  // Extra protection
  const strengths = Array.isArray(report.strengths)
    ? report.strengths
    : []

  const improvements = Array.isArray(report.improvements)
    ? report.improvements
    : []

  const recommendations = Array.isArray(report.recommendations)
    ? report.recommendations
    : []

  const radarData = [
    {
      subject: 'Overall',
      A: overall,
    },
    {
      subject: 'Communication',
      A: comm.clarity ?? overall,
    },
    {
      subject: 'Clarity',
      A: comm.clarity ?? overall,
    },
    {
      subject: 'STAR',
      A: star.overall ?? overall,
    },
    {
      subject: 'Situation',
      A: star.situation ?? overall,
    },
    {
      subject: 'Action',
      A: star.action ?? overall,
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{
            textAlign: 'center',
            marginBottom: '2.5rem',
          }}
        >
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            style={{
              fontSize: '3rem',
              marginBottom: '0.75rem',
            }}
          >
            🎉
          </motion.div>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              marginBottom: '0.5rem',
            }}
          >
            Interview Complete!
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
            }}
          >
            {report.role} · {report.type} · AI Performance Report
          </p>
        </motion.div>

        {/* Overall Score + Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Overall */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
            }}
            className="card"
            style={{
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1.25rem',
              }}
            >
              Overall AI Score
            </div>

            <AnimatedScore value={overall} />

            <div style={{ marginTop: '1rem' }}>
              <span
                className={`badge ${
                  overall >= 80
                    ? 'badge-green'
                    : overall >= 65
                      ? 'badge-blue'
                      : 'badge-orange'
                }`}
                style={{
                  fontSize: '0.875rem',
                }}
              >
                {overall >= 85
                  ? '🌟 Excellent'
                  : overall >= 75
                    ? '✅ Good'
                    : overall >= 60
                      ? '📈 Improving'
                      : '⚠️ Needs Work'}
              </span>
            </div>
          </motion.div>

          {/* Breakdown */}
          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="card"
          >
            <h2
              style={{
                fontWeight: 700,
                marginBottom: '1.25rem',
                fontSize: '1rem',
              }}
            >
              Score Breakdown
            </h2>

            <ScoreBar
              label="Overall Performance"
              value={overall}
              delay={0.1}
            />

            {star.overall != null && (
              <ScoreBar
                label="STAR Framework"
                value={star.overall}
                delay={0.2}
              />
            )}

            {star.situation != null && (
              <ScoreBar
                label="Situation Clarity"
                value={star.situation}
                delay={0.3}
              />
            )}

            {star.action != null && (
              <ScoreBar
                label="Action Steps"
                value={star.action}
                delay={0.4}
              />
            )}

            {star.result != null && (
              <ScoreBar
                label="Result Impact"
                value={star.result}
                delay={0.5}
              />
            )}

            {comm.clarity != null && (
              <ScoreBar
                label="Communication Clarity"
                value={comm.clarity}
                delay={0.6}
              />
            )}
          </motion.div>
        </div>

        {/* Radar + Strengths */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Radar */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
            }}
            className="card"
          >
            <h2
              style={{
                fontWeight: 700,
                marginBottom: '1rem',
                fontSize: '1rem',
              }}
            >
              Performance Radar
            </h2>

            <ResponsiveContainer
              width="100%"
              height={220}
            >
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: 'var(--text-muted)',
                    fontSize: 11,
                  }}
                />

                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="var(--blue)"
                  fill="var(--blue)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Strengths + Improvements */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {strengths.length > 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
                className="card"
                style={{
                  background: 'rgba(16,185,129,0.04)',
                  borderColor: 'rgba(16,185,129,0.15)',
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: '0.875rem',
                    color: 'var(--green-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle size={18} />
                  What You Did Well
                </h3>

                {strengths.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '0.625rem',
                      marginBottom: '0.5rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <CheckCircle
                      size={14}
                      color="var(--green)"
                      style={{
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />

                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {improvements.length > 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.5,
                }}
                className="card"
                style={{
                  background: 'rgba(245,158,11,0.04)',
                  borderColor: 'rgba(245,158,11,0.15)',
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: '0.875rem',
                    color: 'var(--orange-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={18} />
                  Areas to Improve
                </h3>

                {improvements.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '0.625rem',
                      marginBottom: '0.5rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      color="var(--orange)"
                      style={{
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />

                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* No feedback fallback */}
            {strengths.length === 0 &&
              improvements.length === 0 && (
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 180,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  Detailed strengths and improvements
                  are not available.
                </div>
              )}
          </div>
        </div>

        {/* Communication + STAR */}
        {(Object.keys(comm).length > 0 ||
          Object.keys(star).length > 0) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Communication */}
            {Object.keys(comm).length > 0 && (
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
                  delay: 0.5,
                }}
                className="card"
              >
                <h2
                  style={{
                    fontWeight: 700,
                    marginBottom: '1.25rem',
                    fontSize: '1rem',
                  }}
                >
                  🗣️ Communication Analysis
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                  }}
                >
                  {[
                    comm.speaking_speed != null && {
                      label: 'Speaking Speed',
                      value: `${comm.speaking_speed} WPM`,
                      note: 'Ideal: 120–160',
                    },

                    comm.filler_words != null && {
                      label: 'Filler Words',
                      value: String(comm.filler_words),
                      note: 'um, uh, like',
                    },

                    comm.avg_pause != null && {
                      label: 'Avg. Pause',
                      value: `${comm.avg_pause}s`,
                      note: 'Natural pacing',
                    },

                    comm.clarity != null && {
                      label: 'Clarity Score',
                      value: `${comm.clarity}%`,
                      note: '',
                    },
                  ]
                    .filter(Boolean)
                    .map(
                      (
                        item: {
                          label: string
                          value: string
                          note: string
                        } | false,
                      ) => {
                        if (!item) return null

                        return (
                          <div
                            key={item.label}
                            style={{
                              background:
                                'var(--bg-elevated)',
                              borderRadius:
                                'var(--radius-md)',
                              padding: '0.875rem',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color:
                                  'var(--text-muted)',
                                marginBottom:
                                  '0.25rem',
                              }}
                            >
                              {item.label}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  '1.125rem',
                                fontWeight: 700,
                                color:
                                  'var(--text-primary)',
                              }}
                            >
                              {item.value}
                            </div>

                            {item.note && (
                              <div
                                style={{
                                  fontSize:
                                    '0.6875rem',
                                  color:
                                    'var(--text-muted)',
                                  marginTop:
                                    '0.125rem',
                                }}
                              >
                                {item.note}
                              </div>
                            )}
                          </div>
                        )
                      },
                    )}
                </div>
              </motion.div>
            )}

            {/* STAR */}
            {Object.keys(star).length > 0 && (
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
                  delay: 0.55,
                }}
                className="card"
              >
                <h2
                  style={{
                    fontWeight: 700,
                    marginBottom: '1.25rem',
                    fontSize: '1rem',
                  }}
                >
                  ⭐ STAR Framework Analysis
                </h2>

                {star.overall != null && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: getScoreColor(
                          star.overall,
                        ),
                      }}
                    >
                      {star.overall}
                    </div>

                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      / 100 Overall
                    </div>
                  </div>
                )}

                {star.situation != null && (
                  <ScoreBar
                    label="Situation"
                    value={star.situation}
                    delay={0.1}
                  />
                )}

                {star.task != null && (
                  <ScoreBar
                    label="Task"
                    value={star.task}
                    delay={0.2}
                  />
                )}

                {star.action != null && (
                  <ScoreBar
                    label="Action"
                    value={star.action}
                    delay={0.3}
                  />
                )}

                {star.result != null && (
                  <ScoreBar
                    label="Result"
                    value={star.result}
                    delay={0.4}
                  />
                )}

                {star.feedback && (
                  <div
                    style={{
                      marginTop: '0.875rem',
                      padding: '0.75rem',
                      background:
                        'rgba(99,102,241,0.08)',
                      borderRadius:
                        'var(--radius-md)',
                      fontSize: '0.8125rem',
                      color:
                        'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    💡 {star.feedback}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
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
              delay: 0.7,
            }}
            className="card"
            style={{
              marginBottom: '2rem',
              background:
                'rgba(139,92,246,0.06)',
              borderColor:
                'rgba(139,92,246,0.2)',
            }}
          >
            <h2
              style={{
                fontWeight: 700,
                marginBottom: '1rem',
                fontSize: '1rem',
                color: 'var(--purple-light)',
              }}
            >
              🎯 AI Recommendations
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems:
                        'flex-start',
                      gap: '0.75rem',
                      padding: '0.875rem',
                      background:
                        'rgba(139,92,246,0.08)',
                      borderRadius:
                        'var(--radius-md)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      🎯
                    </span>

                    <span
                      style={{
                        fontSize: '0.875rem',
                        color:
                          'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {recommendation}
                    </span>
                  </div>
                ),
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.8,
          }}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => navigate('/practice')}
            className="btn btn-primary btn-lg"
          >
            <BookOpen size={18} />
            Practice Weak Areas
          </button>

          <button
            onClick={() =>
              navigate('/interview/setup')
            }
            className="btn btn-ghost btn-lg"
          >
            <RotateCcw size={18} />
            New Interview
          </button>

          <button
            onClick={() =>
              navigate('/ai-insights')
            }
            className="btn btn-ghost btn-lg"
          >
            <Zap size={18} />
            View AI Insights
          </button>

          <button
            onClick={() =>
              navigate('/reports')
            }
            className="btn btn-ghost btn-lg"
          >
            <Download size={18} />
            All Reports
          </button>

          <button
            className="btn btn-ghost btn-lg"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Interview Buddy AI Report',
                  text: `I scored ${overall}/100 in my AI interview.`,
                  url: window.location.href,
                }).catch(() => {})
              }
            }}
          >
            <Share2 size={18} />
            Share
          </button>
        </motion.div>
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

        @media (max-width: 800px) {
          .card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}