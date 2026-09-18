import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock3,
  Expand,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Sparkles,
  UserRound,
  Volume2,
  Wifi,
  X,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { interviewsApi } from "@/services/apiService";

interface LiveQuestion {
  question_id: string;
  question?: string;
  question_text?: string;
  question_type?: string;
  difficulty?: string;
  topic?: string | null;
  question_number?: number;
  total_questions?: number;
  is_last?: boolean;
}

const QUESTION_COUNTS: Record<number, number> = {
  10: 6,
  20: 10,
  30: 15,
  45: 18,
};

const getQuestionCount = (duration: number) => {
  return QUESTION_COUNTS[duration] ?? 6;
};

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong. Please try again.";
};

const resolveInterviewId = (
  routeId: string | undefined,
  location: ReturnType<typeof useLocation>,
): string | null => {
  const candidates = [
    routeId,
    location.state?.interviewId,
    location.state?.id,
    new URLSearchParams(location.search).get("interviewId"),
    new URLSearchParams(location.search).get("id"),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const value = candidate.trim();

      if (value && value !== "undefined" && value !== "null") {
        return value;
      }
    }
  }

  try {
    const stored = sessionStorage.getItem("active_interview_id");

    if (
      stored &&
      stored.trim() &&
      stored !== "undefined" &&
      stored !== "null"
    ) {
      return stored.trim();
    }
  } catch {
    // Ignore storage restrictions.
  }

  return null;
};

export default function InterviewRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  /*
   * The backend-created interview ID is authoritative.
   * Router state/query/storage are only navigation fallbacks.
   */
  const interviewId = resolveInterviewId(id, location);

  useEffect(() => {
    if (!interviewId) return;

    try {
      sessionStorage.setItem("active_interview_id", interviewId);
    } catch {
      // Ignore storage restrictions.
    }
  }, [interviewId]);

  /*
   * ----------------------------------------------------------
   * DURATION
   * ----------------------------------------------------------
   */

  const routeDuration =
    typeof location.state?.duration === "number" && location.state.duration > 0
      ? location.state.duration
      : null;

  const [durationMinutes, setDurationMinutes] = useState<number>(
    routeDuration ?? 30,
  );

  /*
   * ----------------------------------------------------------
   * INTERVIEW STATE
   * ----------------------------------------------------------
   */

  const [currentQ, setCurrentQ] = useState<LiveQuestion | null>(null);

  const [questionIdx, setQuestionIdx] = useState(0);

  const [totalQuestions, setTotalQuestions] = useState(
    routeDuration ? getQuestionCount(routeDuration) : 15,
  );

  const [userAnswer, setUserAnswer] = useState("");

  const [elapsed, setElapsed] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const [timeUp, setTimeUp] = useState(false);

  const [error, setError] = useState("");

  /*
   * ----------------------------------------------------------
   * CAMERA STATE
   * ----------------------------------------------------------
   */

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);

  const [cameraError, setCameraError] = useState("");

  const [isFullscreen, setIsFullscreen] = useState(false);

  const interviewContainerRef = useRef<HTMLDivElement | null>(null);

  /*
   * ----------------------------------------------------------
   * REFS
   * ----------------------------------------------------------
   */

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const elapsedRef = useRef(0);

  const questionStartedAtRef = useRef<number>(Date.now());

  const completingRef = useRef(false);

  const recognitionRef = useRef<any>(null);

  /*
   * ----------------------------------------------------------
   * QUESTION TEXT
   * ----------------------------------------------------------
   */

  const questionText = currentQ?.question ?? currentQ?.question_text ?? "";

  /*
   * ----------------------------------------------------------
   * TIMER
   * ----------------------------------------------------------
   */

  const durationSeconds = durationMinutes * 60;

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /*
   * ----------------------------------------------------------
   * CAMERA
   * ----------------------------------------------------------
   */

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (error) {
      console.error("Camera permission error:", error);

      setCameraOn(false);

      setCameraError("Camera permission was denied or unavailable.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }, []);

  const toggleCamera = () => {
    if (cameraOn) {
      stopCamera();
    } else {
      void startCamera();
    }
  };

  /*
   * Start camera when interview room opens.
   */

  useEffect(() => {
    void startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  /*
   * ----------------------------------------------------------
   * FULLSCREEN
   * ----------------------------------------------------------
   */

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await interviewContainerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  /*
   * ----------------------------------------------------------
   * COMPLETE INTERVIEW
   * ----------------------------------------------------------
   */

  const completeInterview = useCallback(
    (fromTimer = false) => {
      if (!interviewId) {
        setError(
          "Interview ID is missing. Please start the interview from the setup page.",
        );
        return;
      }

      if (completingRef.current) {
        return;
      }

      completingRef.current = true;
      setIsCompleting(true);

      stopTimer();
      stopCamera();

      navigate(`/interview/complete/${interviewId}`, {
        replace: true,
        state: {
          fromTimer,
        },
      });

      void interviewsApi.complete(interviewId).catch((error) => {
        console.error("Failed to complete interview:", error);
      });
    },
    [interviewId, navigate, stopTimer, stopCamera],
  );

  /*
   * ----------------------------------------------------------
   * TIMER
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (isLoading || !currentQ || isPaused || isCompleting || timeUp) {
      stopTimer();
      return;
    }

    stopTimer();

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;

      const nextElapsed = elapsedRef.current;

      setElapsed(nextElapsed);

      if (nextElapsed >= durationSeconds) {
        stopTimer();
        setTimeUp(true);
        completeInterview(true);
      }
    }, 1000);

    return stopTimer;
  }, [
    currentQ,
    durationSeconds,
    isLoading,
    isPaused,
    isCompleting,
    timeUp,
    stopTimer,
    completeInterview,
  ]);

  /*
   * ----------------------------------------------------------
   * START INTERVIEW
   * ----------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!interviewId) {
        setError(
          "Interview ID is missing. Please start the interview from the setup page.",
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await interviewsApi.start(interviewId);

        if (cancelled) return;

        const question = response as unknown as LiveQuestion;

        const backendTotal = Number(response.total_questions) || 0;

        const backendQuestionNumber = Number(response.question_number) || 1;

        const finalTotal =
          backendTotal || getQuestionCount(routeDuration ?? 30);

        setTotalQuestions(finalTotal);

        if (!routeDuration) {
          const matchedDuration = Object.entries(QUESTION_COUNTS).find(
            ([, count]) => count === finalTotal,
          );

          if (matchedDuration) {
            setDurationMinutes(Number(matchedDuration[0]));
          }
        }

        setQuestionIdx(Math.max(backendQuestionNumber - 1, 0));

        setCurrentQ(question);
        setUserAnswer("");

        elapsedRef.current = 0;
        setElapsed(0);

        questionStartedAtRef.current = Date.now();

        setIsPaused(false);
        setTimeUp(false);

        /*
         * Automatically speak the first question
         * after the interview is loaded.
         */
        setTimeout(() => {
          if (question.question || question.question_text) {
            const text = question.question ?? question.question_text ?? "";

            if ("speechSynthesis" in window && text) {
              window.speechSynthesis.cancel();

              const utterance = new SpeechSynthesisUtterance(text);

              utterance.rate = 0.95;
              utterance.pitch = 1;
              utterance.volume = 1;

              window.speechSynthesis.speak(utterance);
            }
          }
        }, 500);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to start interview:", error);

        setError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
    };
  }, [interviewId, routeDuration]);

  /*
   * ----------------------------------------------------------
   * CLEANUP
   * ----------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      stopTimer();
      stopCamera();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore browser speech cleanup error.
        }
      }
    };
  }, [stopTimer, stopCamera]);

  /*
   * ----------------------------------------------------------
   * SPEAK QUESTION
   * ----------------------------------------------------------
   */

  const speakQuestion = () => {
    if (!questionText) return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(questionText);

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  /*
   * ----------------------------------------------------------
   * SPEECH RECOGNITION
   * ----------------------------------------------------------
   */

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or type your answer.",
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }

      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      if (transcript.trim()) {
        setUserAnswer((previous) => {
          const separator = previous.trim() ? " " : "";

          return previous + separator + transcript.trim();
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);

      setIsListening(false);

      if (event?.error === "not-allowed") {
        setError("Microphone permission was denied.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Unable to start speech recognition:", error);

      setIsListening(false);
    }
  };

  /*
   * ----------------------------------------------------------
   * PAUSE / RESUME
   * ----------------------------------------------------------
   */

  const togglePause = () => {
    if (isCompleting || timeUp) {
      return;
    }

    setIsPaused((previous) => !previous);
  };

  /*
   * ----------------------------------------------------------
   * SUBMIT ANSWER
   * ----------------------------------------------------------
   */

  const submitAnswer = async () => {
    if (!id || !currentQ) {
      return;
    }

    if (isSubmitting || isCompleting) {
      return;
    }

    const answer = userAnswer.trim();

    if (!answer) {
      setError("Please write an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }

      setIsListening(false);
    }

    try {
      const questionDuration = Math.max(
        0,
        Math.floor((Date.now() - questionStartedAtRef.current) / 1000),
      );

      const response = await interviewsApi.answer(
        interviewId,
        currentQ.question_id,
        answer,
        questionDuration,
      );

      const result = response as unknown as {
        question_id?: string;
        score?: number;
        evaluation?: unknown;
        question_number?: number;
        total_questions?: number;
        is_last?: boolean;
      };

      const backendTotal = Number(result.total_questions) || totalQuestions;

      const backendQuestionNumber =
        Number(result.question_number) ||
        Number(currentQ.question_number) ||
        questionIdx + 1;

      setTotalQuestions(backendTotal);

      const isLast =
        result.is_last === true ||
        currentQ.is_last === true ||
        backendQuestionNumber >= backendTotal ||
        questionIdx + 1 >= backendTotal;

      setUserAnswer("");

      if (isLast) {
        completeInterview(false);
        return;
      }

      const nextResponse = await interviewsApi.nextQuestion(interviewId);

      const nextQuestion = nextResponse as unknown as LiveQuestion;

      const nextNumber =
        Number(nextResponse.question_number) || backendQuestionNumber + 1;

      const nextTotal = Number(nextResponse.total_questions) || backendTotal;

      setTotalQuestions(nextTotal);

      setQuestionIdx(Math.max(nextNumber - 1, 0));

      setCurrentQ(nextQuestion);

      questionStartedAtRef.current = Date.now();

      setElapsed(elapsedRef.current);

      /*
       * Speak next question automatically.
       */
      const nextText =
        nextQuestion.question ?? nextQuestion.question_text ?? "";

      if (nextText && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(nextText);

          utterance.rate = 0.95;
          utterance.pitch = 1;
          utterance.volume = 1;

          window.speechSynthesis.speak(utterance);
        }, 300);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);

      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ----------------------------------------------------------
   * EXIT
   * ----------------------------------------------------------
   */

  const handleExit = () => {
    if (isCompleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to end this interview? Your current progress will be submitted.",
    );

    if (!confirmed) {
      return;
    }

    completeInterview(false);
  };

  /*
   * ----------------------------------------------------------
   * PROGRESS
   * ----------------------------------------------------------
   */

  const currentQuestionNumber = currentQ?.question_number ?? questionIdx + 1;

  const progress =
    totalQuestions > 0
      ? Math.min(
          100,
          Math.max(0, (currentQuestionNumber / totalQuestions) * 100),
        )
      : 0;

  const remainingSeconds = Math.max(0, durationSeconds - elapsed);

  const isTimerLow = remainingSeconds <= 60;

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="live-loading">
        <div className="loading-orb">
          <Bot size={36} />
        </div>

        <Loader2 size={24} className="loading-spinner" />

        <h2>Preparing your interview...</h2>

        <p>AI interviewer is preparing your first question.</p>

        <style>{`
          .live-loading {
            min-height: 75vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            color: var(--text-primary);
          }

          .loading-orb {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              linear-gradient(
                135deg,
                #c026d3,
                #c026d3
              );
            color: white;
            box-shadow:
              0 15px 45px
              rgba(124,58,237,.25);
            animation: livePulse 2s infinite;
          }

          .loading-spinner {
            color: #c084fc;
            animation:
              spin 1s linear infinite;
          }

          .live-loading h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 800;
          }

          .live-loading p {
            margin: 0;
            color: var(--text-muted);
            font-size: .875rem;
          }

          @keyframes livePulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.06);
            }
          }

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
    );
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
          margin: "4rem auto",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <AlertCircle
          size={48}
          style={{
            color: "var(--red)",
            margin: "0 auto 1rem",
          }}
        />

        <h2
          style={{
            fontWeight: 800,
            marginBottom: ".5rem",
          }}
        >
          Unable to start interview
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          {error}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: ".75rem",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate("/interview/setup")}
          >
            Back to Setup
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------
   * MAIN LIVE INTERVIEW
   * ----------------------------------------------------------
   */

  return (
    <div ref={interviewContainerRef} className="live-interview-page">
      {/* TOP BAR */}

      <header className="live-topbar">
        <div className="live-brand">
          <button
            className="icon-btn"
            onClick={handleExit}
            disabled={isCompleting}
            title="Exit interview"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="live-title">
              Live AI Interview
              <span className="beta-badge">Beta</span>
            </div>

            <div className="live-subtitle">
              Real-time interview with your AI interviewer
            </div>
          </div>
        </div>

        <div className="live-status">
          <span className="status-dot" />
          Interview in Progress
          <span className={isTimerLow ? "top-timer danger" : "top-timer"}>
            <Clock3 size={14} />
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="live-error">
          <AlertCircle size={17} />
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="live-content">
        <section className="video-section">
          {/* AI VIDEO */}

          <div className="ai-video">
            <div className="ai-video-background" />
            <div className="ai-grid-overlay" />
            <div className="ai-room-glow glow-one" />
            <div className="ai-room-glow glow-two" />

            <div className="ai-center">
              <div
                className={isSubmitting ? "ai-avatar speaking" : "ai-avatar"}
              >
                <Bot size={64} />
              </div>

              <div className="ai-name">
                <Bot size={15} />
                AI Interviewer
              </div>

              <div className="ai-speaking">
                <span className="wave">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>

                {isSubmitting ? "Evaluating your answer..." : "AI Interviewer"}
              </div>
            </div>

            {/* CAMERA PREVIEW */}

            <div className="candidate-video">
              {cameraOn ? (
                <video ref={videoRef} autoPlay muted playsInline />
              ) : (
                <div className="camera-off">
                  <UserRound size={34} />
                  <span>Camera Off</span>
                </div>
              )}

              <div className="candidate-label">
                <span className={cameraOn ? "green-dot" : "gray-dot"} />
                You
              </div>
            </div>

            {cameraError && (
              <div className="camera-warning">
                <CameraOff size={14} />
                Camera unavailable
              </div>
            )}

            {/* AI SPEAKING BADGE */}

            <div className="ai-live-badge">
              <span className="sound-bars">
                <i />
                <i />
                <i />
                <i />
              </span>

              {isSubmitting ? "AI Evaluating" : "AI Interviewer Live"}
            </div>

            {/* VIDEO CONTROLS */}

            <div className="video-controls">
              <button
                className={cameraOn ? "control-btn active" : "control-btn"}
                onClick={toggleCamera}
              >
                {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}

                <span>Camera</span>

                <small>{cameraOn ? "On" : "Off"}</small>
              </button>

              <button
                className={
                  isListening ? "control-btn active mic-active" : "control-btn"
                }
                onClick={toggleListening}
                disabled={isSubmitting || isCompleting}
              >
                {isListening ? <Mic size={18} /> : <MicOff size={18} />}

                <span>Microphone</span>

                <small>{isListening ? "On" : "Off"}</small>
              </button>

              <button
                className="end-call-btn"
                onClick={handleExit}
                disabled={isCompleting}
                title="End interview"
              >
                <span>
                  <X size={22} />
                </span>
              </button>

              <button className="control-btn" onClick={toggleFullscreen}>
                <Expand size={18} />

                <span>Full Screen</span>

                <small>{isFullscreen ? "On" : ""}</small>
              </button>

              <button
                className="control-btn"
                onClick={speakQuestion}
                disabled={!questionText}
              >
                <Volume2 size={18} />

                <span>Listen</span>

                <small>AI Voice</small>
              </button>
            </div>
          </div>

          {/* QUESTION AREA */}

          <div className="question-card">
            <div className="question-header">
              <div className="question-meta">
                <span className="question-number">
                  Question {currentQuestionNumber} of {totalQuestions}
                </span>

                {currentQ?.question_type && (
                  <span className="mini-tag">{currentQ.question_type}</span>
                )}

                {currentQ?.difficulty && (
                  <span className="mini-tag">{currentQ.difficulty}</span>
                )}

                {currentQ?.topic && (
                  <span className="mini-tag">{currentQ.topic}</span>
                )}
              </div>

              <span className="duration-label">
                {durationMinutes} min interview
              </span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="question-content">
              <div className="question-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <div className="question-label">AI Interviewer asks</div>

                <h1>{questionText || "Question unavailable."}</h1>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT CHAT */}

        <aside className="conversation-panel">
          <div className="conversation-header">
            <div>
              <div className="conversation-title">
                <MessageIcon />
                Conversation
              </div>

              <div className="conversation-subtitle">Live AI interview</div>
            </div>

            <div className="secure-badge">
              <Wifi size={13} />
              Connected
            </div>
          </div>

          <div className="conversation-body">
            <div className="message ai-message">
              <div className="message-avatar ai">
                <Bot size={17} />
              </div>

              <div>
                <div className="message-name">
                  AI Interviewer
                  <span>now</span>
                </div>

                <div className="message-bubble">
                  {questionText || "Your next question will appear here."}
                </div>
              </div>
            </div>

            {userAnswer && (
              <div className="message user-message">
                <div className="message-avatar user">
                  <UserRound size={17} />
                </div>

                <div>
                  <div className="message-name">
                    You
                    <span>now</span>
                  </div>

                  <div className="message-bubble">{userAnswer}</div>
                </div>
              </div>
            )}

            {isListening && (
              <div className="listening-card">
                <span className="listening-icon">
                  <Mic size={17} />
                </span>

                <div>
                  <strong>Listening...</strong>

                  <span>
                    Speak naturally. Your answer is being transcribed.
                  </span>
                </div>

                <div className="voice-wave">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
          </div>

          {/* ANSWER INPUT */}

          <div className="answer-panel">
            <div className="answer-title">
              <span>Your Answer</span>

              <span className="word-count">
                {userAnswer.trim()
                  ? `${userAnswer.trim().split(/\s+/).length} words`
                  : "No answer yet"}
              </span>
            </div>

            <textarea
              value={userAnswer}
              onChange={(event) => setUserAnswer(event.target.value)}
              disabled={isSubmitting || isCompleting || timeUp || isPaused}
              placeholder="Type your answer here..."
              rows={5}
            />

            <div className="answer-actions">
              <button
                className={isListening ? "voice-btn listening" : "voice-btn"}
                onClick={toggleListening}
                disabled={isSubmitting || isCompleting}
              >
                {isListening ? (
                  <>
                    <MicOff size={16} />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic size={16} />
                    Speak Answer
                  </>
                )}
              </button>

              <button
                className="pause-btn"
                onClick={togglePause}
                disabled={isSubmitting || isCompleting || timeUp}
              >
                {isPaused ? (
                  <>
                    <Play size={15} />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause size={15} />
                    Pause
                  </>
                )}
              </button>

              <button
                className="submit-btn"
                onClick={submitAnswer}
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
                    <Loader2 size={16} className="spin" />
                    Evaluating
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* BOTTOM STATUS */}

      <footer className="live-footer">
        <div>
          <span className="connected-dot" />
          Connected
        </div>

        <div>
          <CheckCircle2 size={14} />
          AI evaluation enabled
        </div>

        <div className="footer-progress">
          {currentQuestionNumber} / {totalQuestions}
        </div>
      </footer>

      {/* STYLES */}

      <style>{`
        .live-interview-page {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(
              circle at 20% 0%,
              rgba(79,70,229,.08),
              transparent 30%
            ),
            var(--bg-primary);
          color: var(--text-primary);
          padding: 0 1.25rem 1.25rem;
          box-sizing: border-box;
        }

        .live-topbar {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1rem;
          position: sticky;
          top: 0;
          z-index: 20;
          background:
            color-mix(
              in srgb,
              var(--bg-primary) 92%,
              transparent
            );
          backdrop-filter: blur(18px);
        }

        .live-brand {
          display: flex;
          align-items: center;
          gap: .8rem;
        }

        .icon-btn {
          width: 38px;
          height: 38px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s ease;
        }

        .icon-btn:hover {
          transform: translateX(-2px);
          color: var(--text-primary);
          border-color: #c084fc;
        }

        .live-title {
          display: flex;
          align-items: center;
          gap: .55rem;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .beta-badge {
          font-size: .62rem;
          font-weight: 700;
          padding: .22rem .45rem;
          border-radius: 999px;
          background: rgba(168,85,247,.12);
          color: #c084fc;
        }

        .live-subtitle {
          color: var(--text-muted);
          font-size: .75rem;
          margin-top: .15rem;
        }

        .live-status {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: .55rem .75rem;
          border: 1px solid rgba(34,197,94,.2);
          background: rgba(34,197,94,.07);
          border-radius: 12px;
          color: #16a34a;
          font-size: .75rem;
          font-weight: 700;
        }

        .status-dot,
        .connected-dot,
        .green-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px rgba(34,197,94,.12);
        }

        .top-timer {
          display: flex;
          align-items: center;
          gap: .25rem;
          margin-left: .35rem;
          padding-left: .55rem;
          border-left: 1px solid rgba(34,197,94,.2);
        }

        .top-timer.danger {
          color: var(--red);
        }

        .live-error {
          display: flex;
          align-items: center;
          gap: .6rem;
          padding: .7rem .9rem;
          margin-bottom: 1rem;
          border-radius: 10px;
          background: rgba(239,68,68,.07);
          border: 1px solid rgba(239,68,68,.2);
          color: var(--red);
          font-size: .8rem;
        }

        .live-error span {
          flex: 1;
        }

        .live-error button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .live-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(330px, .75fr);
          gap: 1rem;
        }

        .video-section {
          min-width: 0;
        }

        .ai-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .20;
          background-image:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        .ai-room-glow {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          filter: blur(70px);
          opacity: .20;
          pointer-events: none;
        }

        .glow-one {
          top: -100px;
          left: 15%;
          background: #a855f7;
        }

        .glow-two {
          right: -90px;
          bottom: 10%;
          background: #ec4899;
        }

        .ai-video {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          border-radius: 18px;
          background:
            radial-gradient(circle at 50% 35%, rgba(168,85,247,.16), transparent 28%),
            linear-gradient(145deg, #09090f 0%, #15111f 48%, #0c0a12 100%);
          box-shadow:
            0 20px 60px rgba(15,23,42,.18);
        }

        .ai-video-background {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(99,102,241,.3),
              transparent 34%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(232,121,249,.20),
              transparent 25%
            );
        }

        .ai-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ai-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background:
            linear-gradient(
              145deg,
              #c026d3,
              #c026d3
            );
          box-shadow:
            0 0 0 10px rgba(168,85,247,.08),
            0 25px 70px rgba(124,58,237,.4);
          animation: aiFloat 4s ease-in-out infinite;
        }

        .ai-avatar.speaking {
          animation:
            aiFloat 4s ease-in-out infinite,
            aiSpeak 1.1s ease-in-out infinite;
        }

        @keyframes aiFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes aiSpeak {
          0%, 100% {
            box-shadow:
              0 0 0 10px rgba(168,85,247,.08),
              0 25px 70px rgba(124,58,237,.4);
          }
          50% {
            box-shadow:
              0 0 0 22px rgba(168,85,247,.08),
              0 25px 90px rgba(192,38,211,.55);
          }
        }

        .ai-name {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: .4rem;
          color: white;
          font-weight: 800;
        }

        .ai-speaking {
          margin-top: .45rem;
          color: rgba(255,255,255,.65);
          font-size: .72rem;
          display: flex;
          align-items: center;
          gap: .5rem;
        }

        .candidate-video {
          position: absolute;
          right: 1rem;
          bottom: 5.5rem;
          width: 190px;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          border-radius: 14px;
          border: 2px solid rgba(255,255,255,.65);
          background: #0f172a;
          box-shadow: 0 15px 35px rgba(0,0,0,.3);
        }

        .candidate-video video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .camera-off {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.55);
          gap: .4rem;
          font-size: .7rem;
        }

        .candidate-label {
          position: absolute;
          left: .55rem;
          bottom: .5rem;
          display: flex;
          align-items: center;
          gap: .4rem;
          padding: .25rem .45rem;
          border-radius: 6px;
          background: rgba(15,23,42,.75);
          color: white;
          font-size: .65rem;
        }

        .gray-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
        }

        .camera-warning {
          position: absolute;
          left: 1rem;
          top: 1rem;
          display: flex;
          align-items: center;
          gap: .35rem;
          padding: .4rem .55rem;
          background: rgba(239,68,68,.8);
          color: white;
          border-radius: 7px;
          font-size: .65rem;
        }

        .ai-live-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: .5rem .7rem;
          border-radius: 8px;
          background: rgba(15,23,42,.7);
          color: white;
          font-size: .7rem;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        .sound-bars,
        .wave {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 15px;
        }

        .sound-bars i,
        .wave i,
        .voice-wave i {
          width: 3px;
          border-radius: 99px;
          background: currentColor;
          animation: soundWave .8s ease-in-out infinite;
        }

        .sound-bars i:nth-child(1),
        .voice-wave i:nth-child(1) {
          height: 5px;
        }

        .sound-bars i:nth-child(2),
        .voice-wave i:nth-child(2) {
          height: 11px;
          animation-delay: .1s;
        }

        .sound-bars i:nth-child(3),
        .voice-wave i:nth-child(3) {
          height: 15px;
          animation-delay: .2s;
        }

        .sound-bars i:nth-child(4),
        .voice-wave i:nth-child(4) {
          height: 8px;
          animation-delay: .3s;
        }

        @keyframes soundWave {
          50% {
            transform: scaleY(.45);
          }
        }

        .video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          min-height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .7rem;
          padding: 1rem;
          background:
            linear-gradient(
              transparent,
              rgba(2,6,23,.96)
            );
        }

        .control-btn {
          min-width: 72px;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.72);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: .22rem;
          cursor: pointer;
          transition: transform .2s ease, color .2s ease;
        }

        .control-btn:hover {
          color: white;
          transform: translateY(-3px);
        }

        .control-btn.active {
          color: #4ade80;
        }

        .control-btn.mic-active {
          color: #f59e0b;
        }

        .control-btn small {
          font-size: .58rem;
          opacity: .75;
        }

        .end-call-btn {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 0;
          background: #ef4444;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow:
            0 10px 30px
            rgba(239,68,68,.35);
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .end-call-btn:hover {
          transform: scale(1.08);
          box-shadow:
            0 14px 35px
            rgba(239,68,68,.45);
        }

        .question-card {
          margin-top: 1rem;
          padding: 1.1rem 1.2rem;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--bg-secondary);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: .7rem;
        }

        .question-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: .45rem;
        }

        .question-number {
          font-size: .78rem;
          font-weight: 800;
        }

        .mini-tag {
          padding: .22rem .45rem;
          border-radius: 5px;
          background: var(--bg-muted);
          color: var(--text-muted);
          font-size: .62rem;
        }

        .duration-label {
          color: var(--text-muted);
          font-size: .7rem;
        }

        .progress-track {
          height: 6px;
          border-radius: 99px;
          background: var(--bg-muted);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #c026d3,
              #e879f9
            );
          transition: width .4s ease;
        }

        .question-content {
          display: flex;
          gap: .8rem;
          margin-top: 1rem;
        }

        .question-icon {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a855f7;
          background: rgba(168,85,247,.10);
        }

        .question-label {
          color: var(--text-muted);
          font-size: .68rem;
          margin-bottom: .25rem;
        }

        .question-content h1 {
          margin: 0;
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          line-height: 1.55;
          font-weight: 750;
        }

        .conversation-panel {
          min-height: 650px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: color-mix(in srgb, var(--bg-secondary) 96%, #7c3aed 4%);
          box-shadow: 0 15px 40px rgba(15,23,42,.07);
        }

        .conversation-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .7rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .conversation-title {
          display: flex;
          align-items: center;
          gap: .4rem;
          font-weight: 800;
          font-size: .9rem;
        }

        .conversation-subtitle {
          margin-top: .2rem;
          color: var(--text-muted);
          font-size: .65rem;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: .3rem;
          padding: .3rem .45rem;
          border-radius: 6px;
          background: rgba(34,197,94,.08);
          color: #16a34a;
          font-size: .6rem;
          font-weight: 700;
        }

        .conversation-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .message {
          display: flex;
          gap: .55rem;
          margin-bottom: 1rem;
        }

        .message.user-message {
          flex-direction: row-reverse;
          text-align: right;
        }

        .message-avatar {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-avatar.ai {
          background: rgba(168,85,247,.12);
          color: #a855f7;
        }

        .message-avatar.user {
          background: rgba(16,185,129,.12);
          color: #10b981;
        }

        .message-name {
          display: flex;
          align-items: center;
          gap: .4rem;
          font-size: .65rem;
          font-weight: 800;
          margin-bottom: .25rem;
        }

        .message-name span {
          color: var(--text-muted);
          font-weight: 500;
        }

        .message-bubble {
          max-width: 280px;
          padding: .65rem .75rem;
          border-radius: 10px;
          background: var(--bg-muted);
          color: var(--text-secondary);
          font-size: .72rem;
          line-height: 1.5;
          text-align: left;
        }

        .user-message .message-bubble {
          background:
            linear-gradient(
              135deg,
              #c026d3,
              #a855f7
            );
          color: white;
        }

        .listening-card {
          display: flex;
          align-items: center;
          gap: .55rem;
          padding: .65rem;
          margin-top: .5rem;
          border-radius: 10px;
          background: rgba(168,85,247,.08);
          border: 1px solid rgba(168,85,247,.15);
        }

        .listening-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #a855f7;
          color: white;
          animation: micPulse 1.3s infinite;
        }

        .listening-card strong,
        .listening-card span {
          display: block;
        }

        .listening-card strong {
          font-size: .7rem;
        }

        .listening-card div:nth-child(2) span {
          color: var(--text-muted);
          font-size: .6rem;
          margin-top: .15rem;
        }

        .voice-wave {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
          color: #a855f7;
        }

        .answer-panel {
          padding: .9rem;
          border-top: 1px solid var(--border);
        }

        .answer-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: .5rem;
          font-size: .72rem;
          font-weight: 800;
        }

        .word-count {
          color: var(--text-muted);
          font-weight: 500;
          font-size: .62rem;
        }

        .answer-panel textarea {
          width: 100%;
          min-height: 110px;
          resize: vertical;
          box-sizing: border-box;
          padding: .75rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          outline: none;
          background: var(--bg-primary);
          color: var(--text-primary);
          font: inherit;
          font-size: .75rem;
          line-height: 1.5;
          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .answer-panel textarea:focus {
          border-color: #a855f7;
          box-shadow:
            0 0 0 3px
            rgba(168,85,247,.10);
        }

        .answer-actions {
          display: flex;
          gap: .45rem;
          margin-top: .55rem;
        }

        .answer-actions button {
          min-height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border);
          padding: 0 .65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .35rem;
          font-size: .65rem;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s ease;
        }

        .answer-actions button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .answer-actions button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .voice-btn {
          background: var(--bg-muted);
          color: var(--text-secondary);
        }

        .voice-btn.listening {
          color: white;
          background: #a855f7;
          border-color: #a855f7;
        }

        .pause-btn {
          background: var(--bg-muted);
          color: var(--text-secondary);
        }

        .submit-btn {
          flex: 1;
          color: white;
          background:
            linear-gradient(
              135deg,
              #c026d3,
              #c026d3
            );
          border-color: transparent !important;
        }

        .spin {
          animation:
            spin 1s linear infinite;
        }

        ::selection {
          background: rgba(168,85,247,.28);
          color: var(--text-primary);
        }

        .live-interview-page button:focus-visible,
        .live-interview-page textarea:focus-visible {
          outline: 2px solid rgba(232,121,249,.75);
          outline-offset: 2px;
        }

        .live-footer {
          max-width: 1400px;
          margin: .7rem auto 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: var(--text-muted);
          font-size: .65rem;
        }

        .live-footer > div {
          display: flex;
          align-items: center;
          gap: .4rem;
        }

        .footer-progress {
          font-weight: 800;
        }

        @keyframes micPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(168,85,247,.25);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(168,85,247,0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1050px) {
          .live-content {
            grid-template-columns: 1fr;
          }

          .conversation-panel {
            min-height: 550px;
          }

          .ai-video {
            min-height: 500px;
          }
        }

        @media (max-width: 700px) {
          .live-interview-page {
            padding: 0 .6rem .8rem;
          }

          .live-topbar {
            min-height: 62px;
          }

          .live-subtitle {
            display: none;
          }

          .live-title {
            font-size: .95rem;
          }

          .live-status {
            font-size: 0;
            padding: .45rem;
          }

          .top-timer {
            font-size: .72rem;
          }

          .ai-video {
            min-height: 420px;
            border-radius: 14px;
          }

          .ai-avatar {
            width: 110px;
            height: 110px;
          }

          .candidate-video {
            width: 130px;
            bottom: 5.4rem;
            right: .6rem;
          }

          .video-controls {
            gap: .25rem;
            padding: .7rem .3rem;
          }

          .control-btn {
            min-width: 52px;
            font-size: .58rem;
          }

          .control-btn svg {
            width: 16px;
            height: 16px;
          }

          .end-call-btn {
            width: 48px;
            height: 48px;
          }

          .question-card {
            padding: .9rem;
          }

          .question-header {
            flex-direction: column;
          }

          .conversation-panel {
            min-height: 520px;
          }

          .answer-actions {
            flex-wrap: wrap;
          }

          .submit-btn {
            min-width: 100%;
          }

          .live-footer {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 430px) {
          .candidate-video {
            width: 110px;
          }

          .ai-live-badge {
            font-size: .6rem;
          }

          .control-btn span {
            font-size: .55rem;
          }

          .control-btn small {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/*
 * Small inline icon used for the conversation header.
 */
function MessageIcon() {
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(168,85,247,.12)",
        color: "#a855f7",
      }}
    >
      <Sparkles size={14} />
    </span>
  );
}
