import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic,
  MicOff,
  Send,
  Volume2
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { interviewsApi } from '@/services/apiService'

interface LiveQuestion {
  question_id: string
  question?: string
  question_text?: string
  question_type?: string
  difficulty?: string
  topic?: string | null
  question_number?: number
  total_questions?: number
  is_last?: boolean
}

const QUESTION_COUNTS: Record<number, number> = {
  10: 6,
  20: 10,
  30: 15,
  45: 18,
}

const getQuestionCount = (duration: number) => {
  return QUESTION_COUNTS[duration] ?? 6
}

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds)

  const minutes = Math.floor(safe / 60)
  const secs = safe % 60

  return `${String(minutes).padStart(2, '0')}:${String(
    secs
  ).padStart(2, '0')}`
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Something went wrong. Please try again.'
}

export default function InterviewRoom() {
  const navigate = useNavigate()
  const location = useLocation()

  const { id } = useParams<{ id: string }>()

  /*
   * Duration comes from InterviewSetup.
   */
  const routeDuration =
    typeof location.state?.duration === 'number' &&
    location.state.duration > 0
      ? location.state.duration
      : null

  const [durationMinutes, setDurationMinutes] =
    useState<number>(routeDuration ?? 30)

  const [currentQ, setCurrentQ] =
    useState<LiveQuestion | null>(null)

  const [questionIdx, setQuestionIdx] = useState(0)

  const [totalQuestions, setTotalQuestions] =
    useState(
      routeDuration
        ? getQuestionCount(routeDuration)
        : 15
    )

  const [userAnswer, setUserAnswer] = useState('')

  const [elapsed, setElapsed] = useState(0)

  const [isPaused, setIsPaused] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [isCompleting, setIsCompleting] =
    useState(false)

  const [isListening, setIsListening] =
    useState(false)

  const [timeUp, setTimeUp] = useState(false)

  const [error, setError] = useState('')

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    )

  const elapsedRef = useRef(0)

  const questionStartedAtRef =
    useRef<number>(Date.now())

  const completingRef = useRef(false)

  const recognitionRef =
    useRef<any>(null)

  /*
   * ----------------------------------------------------------
   * QUESTION TEXT
   * ----------------------------------------------------------
   */

  const questionText =
    currentQ?.question ??
    currentQ?.question_text ??
    ''

  /*
   * ----------------------------------------------------------
   * TIMER
   * ----------------------------------------------------------
   */

  const durationSeconds = durationMinutes * 60

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /*
   * ----------------------------------------------------------
   * COMPLETE INTERVIEW
   *
   * IMPORTANT:
   * Navigate immediately to the report page.
   * Backend report generation is triggered without waiting
   * for the final AI response.
   * ----------------------------------------------------------
   */

  const completeInterview = useCallback(
    (fromTimer = false) => {
      if (!id) {
        setError('Interview ID is missing.')
        return
      }

      if (completingRef.current) {
        return
      }

      completingRef.current = true
      setIsCompleting(true)
      stopTimer()

      /*
       * Navigate immediately.
       *
       * We intentionally DO NOT await complete().
       * The report page will request the report from backend.
       */
      navigate(`/interview/complete/${id}`, {
        replace: true,
        state: {
          fromTimer,
        },
      })

      /*
       * Trigger backend completion.
       *
       * Do not block navigation while Gemini generates
       * the final report.
       */
      void interviewsApi.complete(id).catch((error) => {
        console.error(
          'Failed to complete interview:',
          error
        )
      })
    },
    [id, navigate, stopTimer]
  )

  /*
   * ----------------------------------------------------------
   * TIMER
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (
      isLoading ||
      !currentQ ||
      isPaused ||
      isCompleting ||
      timeUp
    ) {
      stopTimer()
      return
    }

    stopTimer()

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1

      const nextElapsed =
        elapsedRef.current

      setElapsed(nextElapsed)

      if (
        nextElapsed >= durationSeconds
      ) {
        stopTimer()
        setTimeUp(true)

        completeInterview(true)
      }
    }, 1000)

    return stopTimer
  }, [
    currentQ,
    durationSeconds,
    isLoading,
    isPaused,
    isCompleting,
    timeUp,
    stopTimer,
    completeInterview,
  ])

  /*
   * ----------------------------------------------------------
   * START INTERVIEW
   * ----------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      if (!id) {
        setError('Interview ID is missing.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const response =
          await interviewsApi.start(id)

        if (cancelled) return

        const question =
          response as unknown as LiveQuestion

        const backendTotal =
          Number(response.total_questions) || 0

        const backendQuestionNumber =
          Number(response.question_number) || 1

        /*
         * Backend question count is authoritative.
         */
        const finalTotal =
          backendTotal ||
          getQuestionCount(
            routeDuration ?? 30
          )

        setTotalQuestions(finalTotal)

        /*
         * Recover duration after refresh.
         */
        if (!routeDuration) {
          const matchedDuration =
            Object.entries(
              QUESTION_COUNTS
            ).find(
              ([, count]) =>
                count === finalTotal
            )

          if (matchedDuration) {
            setDurationMinutes(
              Number(matchedDuration[0])
            )
          }
        }

        setQuestionIdx(
          Math.max(
            backendQuestionNumber - 1,
            0
          )
        )

        setCurrentQ(question)

        setUserAnswer('')

        elapsedRef.current = 0
        setElapsed(0)

        questionStartedAtRef.current =
          Date.now()

        setIsPaused(false)
        setTimeUp(false)
      } catch (error) {
        if (cancelled) return

        console.error(
          'Failed to start interview:',
          error
        )

        setError(
          getErrorMessage(error)
        )
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void start()

    return () => {
      cancelled = true
    }
  }, [id, routeDuration])

  /*
   * ----------------------------------------------------------
   * CLEANUP
   * ----------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      stopTimer()

      if (
        'speechSynthesis' in window
      ) {
        window.speechSynthesis.cancel()
      }

      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore browser speech cleanup error.
        }
      }
    }
  }, [stopTimer])

  /*
   * ----------------------------------------------------------
   * SPEAK QUESTION
   * ----------------------------------------------------------
   */

  const speakQuestion = () => {
    if (!questionText) return

    if (
      !('speechSynthesis' in window)
    ) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance =
      new SpeechSynthesisUtterance(
        questionText
      )

    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1

    window.speechSynthesis.speak(
      utterance
    )
  }

  /*
   * ----------------------------------------------------------
   * SPEECH RECOGNITION
   * ----------------------------------------------------------
   */

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError(
        'Speech recognition is not supported in this browser. Please use Chrome or type your answer.'
      )
      return
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop()
      } catch {
        // Ignore.
      }

      setIsListening(false)
      return
    }

    const recognition =
      new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (
      event: any
    ) => {
      let transcript = ''

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        transcript +=
          event.results[i][0]
            .transcript
      }

      if (transcript.trim()) {
        setUserAnswer(
          (previous) => {
            const separator =
              previous.trim()
                ? ' '
                : ''

            return (
              previous +
              separator +
              transcript.trim()
            )
          }
        )
      }
    }

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        'Speech recognition error:',
        event
      )

      setIsListening(false)

      if (
        event?.error ===
        'not-allowed'
      ) {
        setError(
          'Microphone permission was denied.'
        )
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current =
      recognition

    try {
      recognition.start()
    } catch (error) {
      console.error(
        'Unable to start speech recognition:',
        error
      )

      setIsListening(false)
    }
  }

  /*
   * ----------------------------------------------------------
   * PAUSE / RESUME
   * ----------------------------------------------------------
   */

  const togglePause = () => {
    if (isCompleting || timeUp) {
      return
    }

    setIsPaused(
      (previous) => !previous
    )
  }

  /*
   * ----------------------------------------------------------
   * SUBMIT ANSWER
   * ----------------------------------------------------------
   */

  const submitAnswer = async () => {
    if (!id || !currentQ) {
      return
    }

    if (isSubmitting || isCompleting) {
      return
    }

    const answer =
      userAnswer.trim()

    if (!answer) {
      setError(
        'Please write an answer before submitting.'
      )
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const questionDuration =
        Math.max(
          0,
          Math.floor(
            (Date.now() -
              questionStartedAtRef.current) /
              1000
          )
        )

      const response =
        await interviewsApi.answer(
          id,
          currentQ.question_id,
          answer,
          questionDuration
        )

      const result =
        response as unknown as {
          question_id?: string
          score?: number
          evaluation?: unknown
          question_number?: number
          total_questions?: number
          is_last?: boolean
        }

      const backendTotal =
        Number(
          result.total_questions
        ) || totalQuestions

      const backendQuestionNumber =
        Number(
          result.question_number
        ) ||
        Number(
          currentQ.question_number
        ) ||
        questionIdx + 1

      setTotalQuestions(
        backendTotal
      )

      /*
       * Backend's is_last is the strongest signal.
       */
      const isLast =
        result.is_last === true ||
        currentQ.is_last === true ||
        backendQuestionNumber >=
          backendTotal ||
        questionIdx + 1 >=
          backendTotal

      setUserAnswer('')

      if (isLast) {
        completeInterview(false)
        return
      }

      /*
       * Get next question.
       */
      const nextResponse =
        await interviewsApi.nextQuestion(
          id
        )

      const nextQuestion =
        nextResponse as unknown as LiveQuestion

      const nextNumber =
        Number(
          nextResponse.question_number
        ) ||
        backendQuestionNumber + 1

      const nextTotal =
        Number(
          nextResponse.total_questions
        ) ||
        backendTotal

      setTotalQuestions(
        nextTotal
      )

      setQuestionIdx(
        Math.max(
          nextNumber - 1,
          0
        )
      )

      setCurrentQ(
        nextQuestion
      )

      /*
       * Question timer starts again.
       */
      questionStartedAtRef.current =
        Date.now()

      setElapsed(
        elapsedRef.current
      )
    } catch (error) {
      console.error(
        'Failed to submit answer:',
        error
      )

      setError(
        getErrorMessage(error)
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /*
   * ----------------------------------------------------------
   * EXIT
   * ----------------------------------------------------------
   */

  const handleExit = () => {
    if (isCompleting) {
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to end this interview? Your current progress will be submitted.'
      )

    if (!confirmed) {
      return
    }

    completeInterview(false)
  }

  /*
   * ----------------------------------------------------------
   * PROGRESS
   * ----------------------------------------------------------
   */

  const currentQuestionNumber =
    currentQ?.question_number ??
    questionIdx + 1

  const progress =
    totalQuestions > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentQuestionNumber /
              totalQuestions) *
              100
          )
        )
      : 0

  const remainingSeconds =
    Math.max(
      0,
      durationSeconds - elapsed
    )

  const isTimerLow =
    remainingSeconds <= 60

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <Loader2
            size={40}
            style={{
              color:
                'var(--blue-light)',
              animation:
                'spin 1s linear infinite',
              margin:
                '0 auto 1rem',
            }}
          />

          <h2
            style={{
              fontWeight: 700,
              marginBottom:
                '0.5rem',
            }}
          >
            Preparing your interview...
          </h2>

          <p
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            AI interviewer is generating
            your first question.
          </p>
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
      </div>
    )
  }

  /*
   * ----------------------------------------------------------
   * ERROR
   * ----------------------------------------------------------
   */

  if (error && !currentQ) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: '4rem auto',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <AlertCircle
          size={48}
          style={{
            color: 'var(--red)',
            margin:
              '0 auto 1rem',
          }}
        />

        <h2
          style={{
            fontWeight: 800,
            marginBottom:
              '0.5rem',
          }}
        >
          Unable to start interview
        </h2>

        <p
          style={{
            color:
              'var(--text-muted)',
            marginBottom:
              '1.5rem',
            lineHeight: 1.6,
          }}
        >
          {error}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent:
              'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                '/interview/setup'
              )
            }
          >
            Back to Setup
          </button>

          <button
            className="btn btn-ghost"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  /*
   * ----------------------------------------------------------
   * MAIN INTERVIEW UI
   * ----------------------------------------------------------
   */

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        paddingBottom: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: '1rem',
          marginBottom:
            '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleExit}
          disabled={isCompleting}
        >
          <ArrowLeft size={15} />
          Exit Interview
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            color: isTimerLow
              ? 'var(--red)'
              : 'var(--text-primary)',
          }}
        >
          <Clock3 size={18} />

          {formatTime(
            remainingSeconds
          )}
        </div>
      </div>

      {/* Progress */}
      <div
        className="card"
        style={{
          marginBottom:
            '1rem',
          padding:
            '0.875rem 1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '1rem',
            marginBottom:
              '0.5rem',
            fontSize:
              '0.8125rem',
          }}
        >
          <span
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Question{' '}
            {currentQuestionNumber}{' '}
            of {totalQuestions}
          </span>

          <span
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            {durationMinutes} min interview
          </span>
        </div>

        <div
          style={{
            height: 7,
            borderRadius: 999,
            background:
              'var(--bg-muted)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 999,
              background:
                'var(--blue)',
              transition:
                'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Timer pause */}
      {isPaused && (
        <div
          className="card"
          style={{
            marginBottom:
              '1rem',
            textAlign: 'center',
            background:
              'rgba(245,158,11,0.08)',
            borderColor:
              'rgba(245,158,11,0.2)',
          }}
        >
          <strong>
            Interview Paused
          </strong>

          <div
            style={{
              color:
                'var(--text-muted)',
              fontSize:
                '0.8125rem',
              marginTop:
                '0.25rem',
            }}
          >
            Resume when you are ready.
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="card"
          style={{
            marginBottom:
              '1rem',
            display: 'flex',
            alignItems:
              'flex-start',
            gap: '0.75rem',
            background:
              'rgba(239,68,68,0.06)',
            borderColor:
              'rgba(239,68,68,0.2)',
          }}
        >
          <AlertCircle
            size={18}
            style={{
              color:
                'var(--red)',
              flexShrink: 0,
            }}
          />

          <div
            style={{
              color:
                'var(--text-secondary)',
              fontSize:
                '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Question */}
      <div
        className="card"
        style={{
          marginBottom:
            '1rem',
          padding:
            '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
            gap: '1rem',
            marginBottom:
              '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems:
                'center',
              flexWrap: 'wrap',
            }}
          >
            {currentQ?.question_type && (
              <span className="badge badge-muted">
                {currentQ.question_type}
              </span>
            )}

            {currentQ?.difficulty && (
              <span className="badge badge-muted">
                {currentQ.difficulty}
              </span>
            )}

            {currentQ?.topic && (
              <span className="badge badge-muted">
                {currentQ.topic}
              </span>
            )}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={speakQuestion}
            disabled={!questionText}
            title="Read question aloud"
          >
            <Volume2 size={15} />
            Listen
          </button>
        </div>

        <h1
          style={{
            fontSize:
              'clamp(1.15rem, 2vw, 1.5rem)',
            lineHeight: 1.6,
            fontWeight: 700,
            color:
              'var(--text-primary)',
          }}
        >
          {questionText ||
            'Question unavailable.'}
        </h1>
      </div>

      {/* Answer */}
      <div
        className="card"
        style={{
          marginBottom:
            '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap: '1rem',
            marginBottom:
              '0.75rem',
          }}
        >
          <h2
            style={{
              fontSize:
                '1rem',
              fontWeight: 700,
            }}
          >
            Your Answer
          </h2>

          <button
            className={
              isListening
                ? 'btn btn-primary btn-sm'
                : 'btn btn-ghost btn-sm'
            }
            onClick={
              toggleListening
            }
            disabled={
              isSubmitting ||
              isCompleting
            }
          >
            {isListening ? (
              <>
                <MicOff size={15} />
                Stop
              </>
            ) : (
              <>
                <Mic size={15} />
                Speak
              </>
            )}
          </button>
        </div>

        <textarea
          value={userAnswer}
          onChange={(event) =>
            setUserAnswer(
              event.target.value
            )
          }
          disabled={
            isSubmitting ||
            isCompleting ||
            timeUp ||
            isPaused
          }
          placeholder="Type your answer here..."
          className="input"
          rows={9}
          style={{
            width: '100%',
            resize: 'vertical',
            minHeight: 200,
            lineHeight: 1.6,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap: '1rem',
            marginTop:
              '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize:
                '0.75rem',
              color:
                'var(--text-muted)',
            }}
          >
            {userAnswer.trim()
              ? `${userAnswer.trim().split(/\s+/).length} words`
              : 'No answer yet'}
          </span>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={
                togglePause
              }
              disabled={
                isSubmitting ||
                isCompleting ||
                timeUp
              }
            >
              {isPaused ? (
                <>
                  <Clock3 size={16} />
                  Resume
                </>
              ) : (
                <>
                  <Clock3 size={16} />
                  Pause
                </>
              )}
            </button>

            <button
              className="btn btn-primary"
              onClick={
                submitAnswer
              }
              disabled={
                isSubmitting ||
                isCompleting ||
                timeUp ||
                isPaused ||
                !userAnswer.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={16}
                    style={{
                      animation:
                        'spin 1s linear infinite',
                    }}
                  />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Time up */}
      {timeUp && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            background:
              'rgba(239,68,68,0.06)',
            borderColor:
              'rgba(239,68,68,0.2)',
          }}
        >
          <Clock3
            size={36}
            style={{
              color:
                'var(--red)',
              margin:
                '0 auto 0.75rem',
            }}
          />

          <h2
            style={{
              fontWeight: 800,
              marginBottom:
                '0.5rem',
            }}
          >
            Time is up
          </h2>

          <p
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Your interview is being completed.
          </p>
        </div>
      )}

      {/* Completing */}
      {isCompleting && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding:
              '2rem',
          }}
        >
          <Loader2
            size={36}
            style={{
              color:
                'var(--blue-light)',
              animation:
                'spin 1s linear infinite',
              margin:
                '0 auto 0.75rem',
            }}
          />

          <h2
            style={{
              fontWeight: 800,
              marginBottom:
                '0.5rem',
            }}
          >
            Opening your report...
          </h2>

          <p
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Your AI report is being prepared.
          </p>
        </div>
      )}

      {/* Bottom status */}
      {!isCompleting &&
        !timeUp && (
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              gap: '0.5rem',
              color:
                'var(--text-muted)',
              fontSize:
                '0.75rem',
              padding:
                '0.5rem',
            }}
          >
            <CheckCircle2 size={14} />
            Your answers are evaluated by AI after submission.
          </div>
        )}

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