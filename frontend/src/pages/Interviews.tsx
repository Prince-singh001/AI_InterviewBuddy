import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Filter,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  interviewsApi,
  type InterviewListItem,
} from '@/services/apiService'

import {
  formatDate,
  getScoreBadgeClass,
  getScoreColor,
  getScoreLabel,
} from '@/lib/utils'

export default function Interviews() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')

  const {
    data: interviews = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InterviewListItem[]>({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  const completed = interviews.filter(
    (interview) => interview.status === 'completed',
  )

  const avg = completed.length
    ? Math.round(
        completed.reduce(
          (acc, interview) => acc + (interview.score ?? 0),
          0,
        ) / completed.length,
      )
    : 0

  const best = completed.length
    ? Math.max(
        ...completed.map(
          (interview) => interview.score ?? 0,
        ),
      )
    : 0

  // ------------------------------------------------------------
  // SEARCH + SORT
  // ------------------------------------------------------------

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...interviews]
      .filter((interview) => {
        if (!query) return true

        return (
          interview.role.toLowerCase().includes(query) ||
          interview.type.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          )
        }

        return (b.score ?? 0) - (a.score ?? 0)
      })
  }, [interviews, search, sortBy])

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 1180,
          margin: '0 auto',
          padding: '0.5rem 0 3rem',
        }}
      >
        <div
          className="skeleton"
          style={{
            height: 34,
            width: 210,
            borderRadius: 10,
            marginBottom: 10,
          }}
        />

        <div
          className="skeleton"
          style={{
            height: 18,
            width: 280,
            borderRadius: 8,
            marginBottom: 28,
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="skeleton"
              style={{
                height: 100,
                borderRadius: 18,
              }}
            />
          ))}
        </div>

        <div
          className="skeleton"
          style={{
            height: 68,
            borderRadius: 18,
            marginBottom: 18,
          }}
        />

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="skeleton"
            style={{
              height: 105,
              borderRadius: 18,
              marginBottom: 14,
            }}
          />
        ))}
      </div>
    )
  }

  // ------------------------------------------------------------
  // ERROR
  // ------------------------------------------------------------

  if (isError) {
    return (
      <div
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card"
          style={{
            width: '100%',
            maxWidth: 480,
            textAlign: 'center',
            padding: '3rem 2rem',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(239,68,68,0.08)',
            }}
          >
            <AlertCircle
              size={30}
              style={{ color: 'var(--red)' }}
            />
          </div>

          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              marginBottom: 8,
              color: 'var(--text-primary)',
            }}
          >
            Unable to load interviews
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Please check your connection and try again.
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => refetch()}
            className="btn btn-primary"
            style={{
              gap: 8,
              margin: '0 auto',
            }}
          >
            <RefreshCw size={16} />
            Retry
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ------------------------------------------------------------
  // MAIN UI
  // ------------------------------------------------------------

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1180,
        margin: '0 auto',
        padding: '0.25rem 0 3rem',
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 10px',
              borderRadius: 999,
              background: 'rgba(99,102,241,0.08)',
              color: 'var(--blue-light)',
              fontSize: '0.72rem',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            <Sparkles size={12} />
            Interview Workspace
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.55rem, 3vw, 2rem)',
              fontWeight: 850,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 6,
            }}
          >
            My Interviews
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              margin: 0,
            }}
          >
            Track your interview practice, scores and progress.
          </p>
        </div>

        <motion.button
          whileHover={{
            scale: 1.03,
            y: -2,
            boxShadow: '0 12px 28px rgba(99,102,241,0.25)',
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/interview/setup')}
          className="btn btn-primary"
          style={{
            gap: 8,
            minHeight: 42,
            padding: '0 18px',
            borderRadius: 12,
          }}
        >
          <Zap size={16} />
          New Interview
        </motion.button>
      </motion.div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            icon: MessageSquare,
            label: 'Total Interviews',
            value: interviews.length,
            description:
              interviews.length === 1
                ? 'Practice session'
                : 'Practice sessions',
            className: 'stat-card-blue',
          },
          {
            icon: TrendingUp,
            label: 'Average Score',
            value: avg > 0 ? `${avg}%` : '—',
            description:
              avg > 0
                ? 'Across completed interviews'
                : 'Complete an interview',
            className: 'stat-card-purple',
          },
          {
            icon: ArrowUpRight,
            label: 'Best Score',
            value: best > 0 ? `${best}%` : '—',
            description:
              best > 0
                ? 'Your highest performance'
                : 'No score available',
            className: 'stat-card-green',
          },
        ].map((stat, index) => {
          const Icon = stat.icon

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + index * 0.07,
                duration: 0.4,
              }}
              whileHover={{
                y: -4,
                boxShadow:
                  '0 12px 30px rgba(0,0,0,0.07)',
              }}
              className={`card ${stat.className}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                padding: '1.15rem 1.25rem',
                borderRadius: 18,
                transition:
                  'box-shadow 0.25s ease, border-color 0.25s ease',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  flexShrink: 0,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'rgba(99,102,241,0.1)',
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: 'var(--blue-light)',
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginBottom: 3,
                  }}
                >
                  {stat.label}
                </div>

                <div
                  style={{
                    fontSize: '1.45rem',
                    lineHeight: 1.2,
                    fontWeight: 850,
                    color: 'var(--text-primary)',
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {stat.description}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {interviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="card"
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            borderRadius: 20,
          }}
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: 72,
              height: 72,
              margin: '0 auto 1.25rem',
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'rgba(99,102,241,0.08)',
            }}
          >
            <MessageSquare
              size={32}
              style={{
                color: 'var(--blue-light)',
              }}
            />
          </motion.div>

          <h2
            style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            No interview history yet
          </h2>

          <p
            style={{
              maxWidth: 450,
              margin: '0 auto 24px',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              fontSize: '0.88rem',
            }}
          >
            Start your first AI-powered interview and
            your interview activity will appear here.
          </p>

          <motion.button
            whileHover={{
              scale: 1.04,
              y: -2,
              boxShadow:
                '0 12px 25px rgba(99,102,241,0.22)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/interview/setup')}
            className="btn btn-primary"
            style={{
              gap: 8,
              margin: '0 auto',
            }}
          >
            <Zap size={17} />
            Start Your First Interview
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="card"
            style={{
              marginBottom: 18,
              padding: '12px 14px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: 220,
              }}
            >
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search role or interview type..."
                className="input"
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 36,
                  paddingRight: 12,
                  fontSize: '0.82rem',
                  borderRadius: 11,
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Filter
                size={14}
                style={{
                  color: 'var(--text-muted)',
                }}
              />

              {(['date', 'score'] as const).map(
                (option) => (
                  <motion.button
                    key={option}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSortBy(option)}
                    className={
                      sortBy === option
                        ? 'btn btn-primary btn-sm'
                        : 'btn btn-ghost btn-sm'
                    }
                    style={{
                      gap: 6,
                      borderRadius: 9,
                    }}
                  >
                    {option === 'date' ? (
                      <>
                        <Calendar size={12} />
                        Date
                      </>
                    ) : (
                      <>
                        <TrendingUp size={12} />
                        Score
                      </>
                    )}
                  </motion.button>
                ),
              )}
            </div>
          </motion.div>

          {/* ==================================================
              RESULTS HEADER
          ================================================== */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              padding: '0 3px',
            }}
          >
            <span
              style={{
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {filtered.length}{' '}
              {filtered.length === 1
                ? 'interview'
                : 'interviews'}
              {search.trim()
                ? ' found'
                : ''}
            </span>

            {sortBy === 'date' && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}
              >
                Latest first
              </span>
            )}

            {sortBy === 'score' && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}
              >
                Highest score first
              </span>
            )}
          </motion.div>

          {/* ==================================================
              NO SEARCH RESULTS
          ================================================== */}

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card"
              style={{
                textAlign: 'center',
                padding: '3.5rem 2rem',
                borderRadius: 18,
              }}
            >
              <Search
                size={34}
                style={{
                  color: 'var(--text-muted)',
                  margin: '0 auto 12px',
                }}
              />

              <h3
                style={{
                  fontWeight: 750,
                  marginBottom: 6,
                }}
              >
                No interviews found
              </h3>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.84rem',
                }}
              >
                Try a different role or interview type.
              </p>
            </motion.div>
          ) : (
            /* ==================================================
               INTERVIEW LIST
            ================================================== */

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {filtered.map((interview, index) => {
                const isCompleted =
                  interview.status === 'completed'

                const score =
                  interview.score ?? null

                return (
                  <motion.div
                    key={interview.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.04 * index,
                      duration: 0.35,
                    }}
                    whileHover={
                      isCompleted
                        ? {
                            y: -3,
                            boxShadow:
                              '0 14px 35px rgba(0,0,0,0.08)',
                          }
                        : undefined
                    }
                    className="card"
                    onClick={() => {
                      if (isCompleted) {
                        navigate(
                          `/interview/complete/${interview.id}`,
                        )
                      }
                    }}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      padding:
                        '1rem 1.15rem',
                      borderRadius: 18,
                      cursor: isCompleted
                        ? 'pointer'
                        : 'default',
                      transition:
                        'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                    }}
                  >
                    {/* Accent line */}

                    {isCompleted && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 14,
                          bottom: 14,
                          width: 3,
                          borderRadius: 999,
                          background:
                            score !== null
                              ? getScoreColor(score)
                              : 'var(--blue)',
                        }}
                      />
                    )}

                    {/* =========================================
                        SCORE RING
                    ========================================= */}

                    <div
                      style={{
                        position: 'relative',
                        width: 62,
                        height: 62,
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width={62}
                        height={62}
                        style={{
                          transform:
                            'rotate(-90deg)',
                        }}
                      >
                        <circle
                          cx={31}
                          cy={31}
                          r={24}
                          fill="none"
                          stroke="var(--bg-muted)"
                          strokeWidth={5}
                        />

                        {score !== null && (
                          <motion.circle
                            cx={31}
                            cy={31}
                            r={24}
                            fill="none"
                            stroke={getScoreColor(score)}
                            strokeWidth={5}
                            strokeLinecap="round"
                            strokeDasharray={150.8}
                            initial={{
                              strokeDashoffset: 150.8,
                            }}
                            animate={{
                              strokeDashoffset:
                                150.8 -
                                (score / 100) *
                                  150.8,
                            }}
                            transition={{
                              duration: 1,
                              delay:
                                0.15 +
                                index * 0.04,
                              ease: 'easeOut',
                            }}
                          />
                        )}
                      </svg>

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'center',
                          fontSize:
                            '0.75rem',
                          fontWeight: 850,
                          color:
                            score !== null
                              ? getScoreColor(
                                  score,
                                )
                              : 'var(--text-muted)',
                        }}
                      >
                        {score !== null
                          ? score
                          : '—'}
                      </div>
                    </div>

                    {/* =========================================
                        INFORMATION
                    ========================================= */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginBottom: 7,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 750,
                            color:
                              'var(--text-primary)',
                            fontSize:
                              '0.95rem',
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                            maxWidth:
                              '100%',
                          }}
                        >
                          {interview.role}
                        </span>

                        {score !== null && (
                          <span
                            className={`badge ${getScoreBadgeClass(
                              score,
                            )}`}
                            style={{
                              fontSize:
                                '0.65rem',
                            }}
                          >
                            {getScoreLabel(
                              score,
                            )}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 8,
                          flexWrap: 'wrap',
                          color:
                            'var(--text-muted)',
                          fontSize:
                            '0.75rem',
                        }}
                      >
                        <span className="badge badge-muted">
                          {interview.type}
                        </span>

                        <span
                          style={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap: 4,
                          }}
                        >
                          <Calendar
                            size={12}
                          />
                          {formatDate(
                            interview.created_at,
                          )}
                        </span>

                        <span
                          className={`badge ${
                            isCompleted
                              ? 'badge-green'
                              : 'badge-muted'
                          }`}
                        >
                          {interview.status}
                        </span>
                      </div>
                    </div>

                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    {isCompleted && (
                      <div
                        className="interview-actions"
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 7,
                          flexShrink: 0,
                        }}
                      >
                        <motion.button
                          whileHover={{
                            x: 2,
                          }}
                          whileTap={{
                            scale: 0.96,
                          }}
                          onClick={(event) => {
                            event.stopPropagation()

                            navigate(
                              `/interview/complete/${interview.id}`,
                            )
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{
                            gap: 4,
                            borderRadius: 9,
                          }}
                        >
                          View Report
                          <ChevronRight
                            size={13}
                          />
                        </motion.button>

                        <motion.button
                          whileHover={{
                            y: -1,
                          }}
                          whileTap={{
                            scale: 0.96,
                          }}
                          onClick={(event) => {
                            event.stopPropagation()

                            navigate(
                              '/interview/setup',
                            )
                          }}
                          className="btn btn-outline btn-sm"
                          style={{
                            gap: 5,
                            borderRadius: 9,
                          }}
                        >
                          <RotateCcw
                            size={13}
                          />
                          Retake
                        </motion.button>
                      </div>
                    )}

                    {/* Mobile arrow */}

                    {isCompleted && (
                      <ChevronRight
                        className="mobile-interview-arrow"
                        size={18}
                        style={{
                          color:
                            'var(--text-muted)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ======================================================
          RESPONSIVE STYLES
      ====================================================== */}

      <style>{`
        .mobile-interview-arrow {
          display: none;
        }

        @media (max-width: 760px) {
          .interview-actions {
            display: none !important;
          }

          .mobile-interview-arrow {
            display: block;
          }
        }

        @media (max-width: 560px) {
          .mobile-interview-arrow {
            display: none;
          }
        }

        @media (max-width: 520px) {
          .card {
            box-sizing: border-box;
          }
        }

        @media (max-width: 480px) {
          .interview-actions {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}