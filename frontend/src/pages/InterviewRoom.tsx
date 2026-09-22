import { interviewsApi } from "@/services/apiService";
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
  User,
  UserRound,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// ============================================================
// DATA & TYPE DEFINITIONS
// ============================================================

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

interface InterviewStartResponse extends LiveQuestion {
  data?: LiveQuestion;
  current_question?: LiveQuestion;
  duration?: number;
  duration_minutes?: number;
}

interface InterviewAnswerResponse {
  question_id?: string;
  score?: number;
  evaluation?: unknown;
  question_number?: number;
  total_questions?: number;
  is_last?: boolean;
  completed?: boolean;
}

const QUESTION_COUNTS: Record<number, number> = {
  10: 6,
  20: 10,
  30: 15,
  45: 18,
};

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60,
  ).padStart(2, "0")}`;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
};

const getQuestionText = (question: LiveQuestion | null) =>
  question?.question?.trim() ||
  question?.question_text?.trim() ||
  "Question unavailable.";

const resolveInterviewId = (
  routeId: string | undefined,
  location: ReturnType<typeof useLocation>,
): string | null => {
  const state = location.state as
    | { interviewId?: string; id?: string }
    | null
    | undefined;

  const candidates = [
    routeId,
    state?.interviewId,
    state?.id,
    new URLSearchParams(location.search).get("interviewId"),
    new URLSearchParams(location.search).get("id"),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const value = candidate.trim();
      if (value && value !== "undefined" && value !== "null") return value;
    }
  }

  try {
    const stored = sessionStorage.getItem("active_interview_id");
    if (stored?.trim() && stored !== "undefined" && stored !== "null") {
      return stored.trim();
    }
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  return null;
};

const getSpeechRecognition = () => {
  const browserWindow = window as Window & {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  };

  return (
    browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
  );
};

// ============================================================
// MAIN INTERVIEW ROOM COMPONENT
// ============================================================

export default function InterviewRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Authoritative interview ID
  const interviewId = useMemo(
    () => resolveInterviewId(id, location),
    [id, location],
  );

  // Authoritative selected interviewer (fixed for the entire session)
  const resolvedInterviewer = useMemo<"jenny" | "samm">(() => {
    const state = location.state as { interviewer?: string } | null | undefined;
    if (state?.interviewer === "samm" || state?.interviewer === "jenny") {
      return state.interviewer;
    }
    try {
      const stored = sessionStorage.getItem("active_interviewer");
      if (stored === "samm" || stored === "jenny") {
        return stored;
      }
    } catch {
      // Storage unavailable fallback
    }
    return "jenny";
  }, [location.state]);

  // SINGLE FIXED INTERVIEWER FOR THE COMPLETE INTERVIEW
  const [interviewer] = useState<"jenny" | "samm">(resolvedInterviewer);

  const interviewerConfig = useMemo(() => {
    if (interviewer === "samm") {
      return {
        name: "Samm",
        genderLabel: "Male AI Interviewer",
        videoSrc: "/images/interviewers/samm.mp4",
        initialLetter: "S",
      };
    }
    return {
      name: "Jenny",
      genderLabel: "Female AI Interviewer",
      videoSrc: "/images/interviewers/jenny.mp4",
      initialLetter: "J",
    };
  }, [interviewer]);

  const routeDuration = useMemo(() => {
    const state = location.state as { duration?: number } | null | undefined;
    return typeof state?.duration === "number" && state.duration > 0
      ? state.duration
      : null;
  }, [location.state]);

  const roleTitle = useMemo(() => {
    const state = location.state as
      | { role?: string; type?: string }
      | null
      | undefined;
    if (state?.role) {
      return state.type ? `${state.role} • ${state.type}` : state.role;
    }
    return "AI Mock Interview";
  }, [location.state]);

  // State Management
  const [durationMinutes, setDurationMinutes] = useState(routeDuration ?? 30);
  const [currentQ, setCurrentQ] = useState<LiveQuestion | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(
    routeDuration ? (QUESTION_COUNTS[routeDuration] ?? 6) : 15,
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [avatarVideoError, setAvatarVideoError] = useState(false);

  // References
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechTimeoutsRef = useRef<number[]>([]);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  const completingRef = useRef(false);
  const elapsedRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  const interviewContainerRef = useRef<HTMLDivElement | null>(null);

  const durationSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, durationSeconds - elapsed);
  const currentQuestionNumber = currentQ?.question_number ?? questionIdx + 1;
  const progress =
    totalQuestions > 0
      ? Math.min(
          100,
          Math.max(0, (currentQuestionNumber / totalQuestions) * 100),
        )
      : 0;
  const questionText = getQuestionText(currentQ);
  const isTimerLow = remainingSeconds <= 60;

  // ----------------------------------------------------------
  // AVATAR VIDEO SYNCHRONIZATION
  // ----------------------------------------------------------
  useEffect(() => {
    const video = avatarVideoRef.current;
    if (!video) return;

    if (isSpeaking && !isPaused) {
      video.play().catch(() => {
        // Autoplay policy or video not ready
      });
    } else {
      video.pause();
    }
  }, [isSpeaking, isPaused]);

  const clearSpeechTimeouts = useCallback(() => {
    speechTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    speechTimeoutsRef.current = [];
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    clearSpeechTimeouts();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (mountedRef.current) setIsSpeaking(false);
  }, [clearSpeechTimeouts]);

  const speakQuestion = useCallback(
    (text = questionText) => {
      if (!text || !("speechSynthesis" in window)) return;

      clearSpeechTimeouts();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (mountedRef.current) setIsSpeaking(true);
      };
      utterance.onend = () => {
        if (mountedRef.current) setIsSpeaking(false);
      };
      utterance.onerror = () => {
        if (mountedRef.current) setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [clearSpeechTimeouts, questionText],
  );

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // Recognition may already be stopped.
    }
    recognitionRef.current = null;
    if (mountedRef.current) setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setError(
        "Speech recognition is not supported in this browser. You can type your answer instead.",
      );
      return;
    }

    stopListening();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      if (mountedRef.current) {
        setIsListening(true);
        setError("");
      }
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0]?.transcript ?? "";
        }
      }

      if (finalTranscript.trim() && mountedRef.current) {
        setUserAnswer((previous) => {
          const trimmed = previous.trim();
          return `${trimmed}${trimmed ? " " : ""}${finalTranscript.trim()}`.trim();
        });
      }
    };

    recognition.onerror = (event: any) => {
      if (!mountedRef.current) return;
      setIsListening(false);
      if (event?.error === "not-allowed") {
        setError("Microphone permission was denied.");
      } else {
        setError("Voice recognition stopped. You can continue typing.");
      }
    };

    recognition.onend = () => {
      if (mountedRef.current) setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [stopListening]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera is not supported in this browser.");
        return;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      setCameraOn(true);
    } catch (cameraFailure) {
      console.error("Camera permission error:", cameraFailure);
      setCameraOn(false);
      setCameraError(
        "Camera permission was denied or the camera is unavailable.",
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) videoRef.current.srcObject = null;
    if (mountedRef.current) setCameraOn(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else void startCamera();
  }, [cameraOn, startCamera, stopCamera]);

  const completeInterview = useCallback(
    async (reason: "finished" | "time" | "exit") => {
      if (!interviewId || completingRef.current) {
        if (!interviewId) {
          setError(
            "Interview ID is missing. Please return to interview setup.",
          );
        }
        return;
      }

      completingRef.current = true;
      setIsCompleting(true);
      stopTimer();
      stopListening();
      stopSpeaking();
      stopCamera();

      try {
        await interviewsApi.complete(interviewId);
      } catch (completionError) {
        console.error("Failed to complete interview:", completionError);
      } finally {
        try {
          sessionStorage.removeItem("active_interview_id");
        } catch {
          // Ignore storage restrictions.
        }

        if (mountedRef.current) {
          navigate(`/interview/complete/${interviewId}`, {
            replace: true,
            state: { reason, interviewer },
          });
        }
      }
    },
    [interviewId, interviewer, navigate, stopCamera, stopListening, stopSpeaking, stopTimer],
  );

  const startInterview = useCallback(async () => {
    if (!interviewId || startedRef.current) return;

    startedRef.current = true;
    setIsStarting(true);
    setError("");

    try {
      const rawResponse = await interviewsApi.start(interviewId);
      const response = rawResponse as unknown as InterviewStartResponse;

      const question = response.data ?? response.current_question ?? response;

      if (!question?.question_id) {
        throw new Error("The server did not return a valid first question.");
      }

      const backendTotal = Number(question.total_questions) || 0;
      const backendDuration =
        Number(response.duration_minutes ?? response.duration) || 0;

      const finalDuration =
        backendDuration > 0
          ? backendDuration
          : (routeDuration ?? durationMinutes);
      const finalTotal =
        backendTotal ||
        QUESTION_COUNTS[finalDuration] ||
        QUESTION_COUNTS[routeDuration ?? 30] ||
        6;
      const questionNumber = Number(question.question_number) || 1;

      setDurationMinutes(finalDuration);
      setTotalQuestions(finalTotal);
      setQuestionIdx(Math.max(questionNumber - 1, 0));
      setCurrentQ({
        ...question,
        question_number: questionNumber,
        total_questions: finalTotal,
      });
      setUserAnswer("");
      setElapsed(0);
      setQuestionSeconds(0);
      elapsedRef.current = 0;
      questionStartedAtRef.current = Date.now();
      setIsPaused(false);

      const timeoutId = window.setTimeout(() => {
        if (mountedRef.current) speakQuestion(getQuestionText(question));
      }, 450);

      speechTimeoutsRef.current.push(timeoutId);
    } catch (startError) {
      startedRef.current = false;
      setError(getErrorMessage(startError));
    } finally {
      if (mountedRef.current) setIsStarting(false);
    }
  }, [durationMinutes, interviewId, routeDuration, speakQuestion]);

  const submitAnswer = useCallback(async () => {
    if (!interviewId || !currentQ) return;
    if (isSubmitting || isCompleting || isPaused) return;

    const answer = userAnswer.trim();

    if (!answer) {
      setError("Please write an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    stopListening();
    stopSpeaking();

    try {
      const questionDuration = Math.max(
        0,
        Math.floor((Date.now() - questionStartedAtRef.current) / 1000),
      );

      const rawResponse = await interviewsApi.answer(
        interviewId,
        currentQ.question_id,
        answer,
        questionDuration,
      );

      const response = rawResponse as unknown as InterviewAnswerResponse;
      const backendTotal = Number(response.total_questions) || totalQuestions;
      const backendQuestionNumber =
        Number(response.question_number) ||
        Number(currentQ.question_number) ||
        questionIdx + 1;

      setTotalQuestions(backendTotal);

      const isLast =
        response.is_last === true ||
        response.completed === true ||
        currentQ.is_last === true ||
        backendQuestionNumber >= backendTotal ||
        questionIdx + 1 >= backendTotal;

      setUserAnswer("");

      if (isLast) {
        await completeInterview("finished");
        return;
      }

      const rawNext = await interviewsApi.nextQuestion(interviewId);
      const nextResponse = rawNext as unknown as LiveQuestion;
      const nextQuestion =
        (nextResponse as any)?.data ??
        (nextResponse as any)?.current_question ??
        nextResponse;

      if (!nextQuestion?.question_id) {
        throw new Error(
          "The server did not return the next interview question.",
        );
      }

      const nextNumber =
        Number(nextQuestion.question_number) || backendQuestionNumber + 1;
      const nextTotal = Number(nextQuestion.total_questions) || backendTotal;

      setTotalQuestions(nextTotal);
      setQuestionIdx(Math.max(nextNumber - 1, 0));
      setCurrentQ({
        ...nextQuestion,
        question_number: nextNumber,
        total_questions: nextTotal,
      });
      setQuestionSeconds(0);
      questionStartedAtRef.current = Date.now();

      const nextText = getQuestionText(nextQuestion);
      const timeoutId = window.setTimeout(() => {
        if (mountedRef.current && !isPaused) speakQuestion(nextText);
      }, 350);

      speechTimeoutsRef.current.push(timeoutId);
    } catch (answerError) {
      console.error("Failed to submit answer:", answerError);
      setError(getErrorMessage(answerError));
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  }, [
    completeInterview,
    currentQ,
    interviewId,
    isCompleting,
    isPaused,
    isSubmitting,
    questionIdx,
    speakQuestion,
    stopListening,
    stopSpeaking,
    totalQuestions,
    userAnswer,
  ]);

  const togglePause = useCallback(() => {
    if (isCompleting) return;

    setIsPaused((previous) => {
      const next = !previous;
      if (next) {
        stopListening();
        stopSpeaking();
      }
      return next;
    });
  }, [isCompleting, stopListening, stopSpeaking]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await interviewContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Fullscreen error:", fullscreenError);
      setError("Fullscreen is not available in this browser.");
    }
  }, []);

  const handleExit = useCallback(() => {
    if (isCompleting) return;

    const confirmed = window.confirm(
      "Exit this interview? Your current progress will be submitted as incomplete.",
    );

    if (confirmed) void completeInterview("exit");
  }, [completeInterview, isCompleting]);

  useEffect(() => {
    mountedRef.current = true;

    if (!interviewId) {
      setError("Interview ID is missing. Please return to interview setup.");
      setIsStarting(false);
      return;
    }

    try {
      sessionStorage.setItem("active_interview_id", interviewId);
    } catch {
      // Storage unavailable fallback
    }

    void startCamera();
    void startInterview();

    return () => {
      mountedRef.current = false;
      clearSpeechTimeouts();
      stopTimer();
      stopListening();
      stopSpeaking();
      stopCamera();

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [
    clearSpeechTimeouts,
    interviewId,
    startCamera,
    startInterview,
    stopCamera,
    stopListening,
    stopSpeaking,
    stopTimer,
  ]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isStarting || !currentQ || isPaused || isCompleting) {
      stopTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const nextElapsed = elapsedRef.current;

      if (!mountedRef.current) return;

      setElapsed(nextElapsed);
      setQuestionSeconds((previous) => previous + 1);

      if (nextElapsed >= durationSeconds) {
        stopTimer();
        void completeInterview("time");
      }
    }, 1000);

    return stopTimer;
  }, [
    completeInterview,
    currentQ,
    durationSeconds,
    isCompleting,
    isPaused,
    isStarting,
    stopTimer,
  ]);

  // Loading Screen
  if (isStarting) {
    return (
      <div className="room-loading">
        <div className="loading-card">
          <div className="loading-logo">
            <Bot size={28} />
          </div>
          <Loader2 size={24} className="spin text-blue" />
          <h1>Preparing your AI interview</h1>
          <p>
            Connecting with {interviewerConfig.name} ({interviewerConfig.genderLabel}) and loading question 1.
          </p>
          <div className="loading-track">
            <span />
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Error Screen
  if (error && !currentQ) {
    return (
      <div className="room-error">
        <div className="error-card">
          <div className="error-icon">
            <AlertCircle size={28} />
          </div>
          <h1>Unable to start interview</h1>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="primary-button"
              onClick={() => navigate("/interview/setup")}
            >
              Back to Setup
            </button>
            <button
              className="secondary-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div ref={interviewContainerRef} className="interview-room">
      {/* ====================================================
          TOP HEADER
      ==================================================== */}
      <header className="room-header">
        <div className="header-brand">
          <button
            className="icon-button"
            onClick={handleExit}
            disabled={isCompleting}
            title="Exit interview"
            aria-label="Exit interview"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="brand-icon">
            <Bot size={20} />
          </div>
          <div className="brand-text">
            <div className="brand-title">InterviewerBuddy AI</div>
            <div className="brand-subtitle">{roleTitle}</div>
          </div>
        </div>

        <div className="header-progress">
          <div className="progress-meta">
            <span>
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
            <strong>{Math.round(progress)}% Complete</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="header-actions">
          <div className="live-pill">
            <span className="live-dot" />
            Live Session
          </div>
          <div className={`timer-pill ${isTimerLow ? "timer-low" : ""}`}>
            <Clock3 size={15} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
          <button
            className="icon-button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Expand size={17} />
          </button>
        </div>
      </header>

      {/* Alert banner if non-blocking error occurs */}
      {error && (
        <div className="room-alert" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss alert">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ====================================================
          MAIN INTERVIEW CONTENT
      ==================================================== */}
      <main className="room-main">
        {/* TOP ROW: TWO-PANEL INTERVIEW STAGE (AI & CANDIDATE) */}
        <section className="two-panel-stage">
          {/* LEFT: AI INTERVIEWER CARD */}
          <div className="video-card ai-interviewer-card">
            <div className="video-card-top-bar">
              <div className="role-pill">
                <Bot size={13} />
                <span>AI Interviewer</span>
              </div>
              <div className="avatar-name-badge">
                <span className="avatar-circle-mini">
                  {interviewerConfig.initialLetter}
                </span>
                <strong>{interviewerConfig.name}</strong>
              </div>
            </div>

            {/* Video Container */}
            <div className="video-display-box">
              {!avatarVideoError ? (
                <video
                  ref={avatarVideoRef}
                  src={interviewerConfig.videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="interviewer-video-elem"
                  onError={() => setAvatarVideoError(true)}
                  aria-label={`${interviewerConfig.name} AI Interviewer Video`}
                />
              ) : (
                <div className="avatar-fallback-box">
                  <div className="fallback-avatar-circle">
                    {interviewerConfig.initialLetter}
                  </div>
                  <h3>{interviewerConfig.name}</h3>
                  <p>{interviewerConfig.genderLabel}</p>
                </div>
              )}
            </div>

            {/* Status Footer Below Avatar */}
            <div className="video-card-footer">
              <div className="interviewer-identity">
                <span className="interviewer-name-large">
                  {interviewerConfig.name}
                </span>
                <span className="interviewer-subtitle">
                  {interviewerConfig.genderLabel}
                </span>
              </div>

              <div className="interviewer-status-badge">
                {isSubmitting ? (
                  <div className="status-indicator thinking">
                    <Loader2 size={13} className="spin" />
                    <span>Thinking...</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="status-indicator speaking">
                    <span className="wave-bars">
                      <span className="bar" />
                      <span className="bar" />
                      <span className="bar" />
                      <span className="bar" />
                    </span>
                    <span>Speaking...</span>
                  </div>
                ) : isListening ? (
                  <div className="status-indicator listening">
                    <Mic size={13} className="mic-pulse" />
                    <span>Listening...</span>
                  </div>
                ) : (
                  <div className="status-indicator ready">
                    <span className="status-ready-dot" />
                    <span>Ready</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CANDIDATE LIVE CAMERA CARD */}
          <div className="video-card candidate-camera-card">
            <div className="video-card-top-bar">
              <div className="role-pill">
                <User size={13} />
                <span>You • Candidate</span>
              </div>
              <div className="camera-status-pill">
                <span className={cameraOn ? "dot-active" : "dot-inactive"} />
                <span>{cameraOn ? "Camera On" : "Camera Off"}</span>
              </div>
            </div>

            {/* Video Container */}
            <div className="video-display-box">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`candidate-video-elem ${cameraOn ? "visible" : "hidden"}`}
              />

              {!cameraOn && (
                <div className="camera-off-fallback">
                  <div className="fallback-camera-icon">
                    <UserRound size={36} />
                  </div>
                  <h3>Camera is off</h3>
                  <p>
                    {cameraError ||
                      "Enable your camera for an authentic face-to-face mock interview experience."}
                  </p>
                  <button
                    type="button"
                    className="primary-button compact"
                    onClick={() => void startCamera()}
                  >
                    <Camera size={15} />
                    <span>Enable Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Candidate Controls */}
            <div className="video-card-footer candidate-footer-controls">
              <div className="candidate-media-badges">
                <span className={`media-chip ${cameraOn ? "active" : ""}`}>
                  {cameraOn ? <Camera size={13} /> : <CameraOff size={13} />}
                  <span>{cameraOn ? "Video active" : "Video off"}</span>
                </span>
                <span className={`media-chip ${isListening ? "active" : ""}`}>
                  {isListening ? <Mic size={13} /> : <MicOff size={13} />}
                  <span>{isListening ? "Mic listening" : "Mic ready"}</span>
                </span>
              </div>

              <div className="candidate-action-buttons">
                <button
                  type="button"
                  className={`camera-toggle-btn ${cameraOn ? "on" : "off"}`}
                  onClick={toggleCamera}
                  title={cameraOn ? "Turn camera off" : "Turn camera on"}
                  aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {cameraOn ? <Camera size={15} /> : <CameraOff size={15} />}
                </button>
                <button
                  type="button"
                  className={`camera-toggle-btn ${isListening ? "mic-on" : ""}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!speechSupported || isSubmitting}
                  title={isListening ? "Stop microphone" : "Start microphone"}
                  aria-label={isListening ? "Stop microphone" : "Start microphone"}
                >
                  {isListening ? <Mic size={15} /> : <MicOff size={15} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM ROW: CURRENT QUESTION & CANDIDATE ANSWER */}
        <section className="interview-interaction-grid">
          {/* CURRENT QUESTION CARD */}
          <div className="question-card">
            <div className="question-card-header">
              <div className="question-badge-left">
                <div className="question-number-pill">
                  Question {currentQuestionNumber} of {totalQuestions}
                </div>
                <div className="question-meta-tags">
                  {currentQ?.topic && (
                    <span className="tag-pill">{currentQ.topic}</span>
                  )}
                  {currentQ?.difficulty && (
                    <span className="tag-pill capitalize">
                      {currentQ.difficulty}
                    </span>
                  )}
                  {currentQ?.question_type && (
                    <span className="tag-pill">{currentQ.question_type}</span>
                  )}
                </div>
              </div>

              <div className="question-timer-pill">
                <Clock3 size={13} />
                <span>{formatTime(questionSeconds)}</span>
              </div>
            </div>

            <div className="question-interviewer-label">
              <Bot size={15} />
              <span>{interviewerConfig.name} asks:</span>
            </div>

            <p className="question-prompt-text">{questionText}</p>

            <div className="question-card-bottom">
              <button
                type="button"
                className="audio-tts-btn"
                onClick={() => (isSpeaking ? stopSpeaking() : speakQuestion())}
              >
                <Volume2 size={15} />
                <span>{isSpeaking ? "Stop Voice" : "Listen to Question"}</span>
              </button>
              <div className="secure-badge">
                <Wifi size={13} />
                <span>Real-Time AI Evaluation</span>
              </div>
            </div>
          </div>

          {/* ANSWER INPUT & SUBMISSION CARD */}
          <div className="answer-card">
            <div className="answer-card-header">
              <div className="answer-heading">
                <h3>Your Response</h3>
                <span className="answer-subtitle">
                  {isListening
                    ? "Dictating live speech..."
                    : "Type or speak your answer"}
                </span>
              </div>
              <div className="char-count">
                {userAnswer.length.toLocaleString()} characters
              </div>
            </div>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isSubmitting || isPaused}
              placeholder="Type your structured answer here, or click 'Answer by voice' to speak naturally…"
              className="answer-textarea"
              aria-label="Candidate interview answer"
            />

            <div className="answer-card-footer">
              <div className="answer-footer-left">
                <button
                  type="button"
                  className={`voice-record-btn ${isListening ? "recording" : ""}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!speechSupported || isSubmitting}
                >
                  {isListening ? (
                    <>
                      <Mic size={16} className="mic-spin" />
                      <span>Stop Dictation</span>
                    </>
                  ) : (
                    <>
                      <Mic size={16} />
                      <span>Answer by Voice</span>
                    </>
                  )}
                </button>
              </div>

              <div className="answer-footer-right">
                <button
                  type="button"
                  className="pause-btn"
                  onClick={togglePause}
                  disabled={isSubmitting || isCompleting}
                >
                  {isPaused ? <Play size={15} /> : <Pause size={15} />}
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>

                <button
                  type="button"
                  className="submit-answer-btn"
                  onClick={() => void submitAnswer()}
                  disabled={
                    !userAnswer.trim() ||
                    isSubmitting ||
                    isPaused ||
                    isCompleting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Evaluating…</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================
          PAUSE MODAL OVERLAY
      ==================================================== */}
      {isPaused && (
        <div className="pause-overlay-modal" role="dialog" aria-modal="true">
          <div className="pause-modal-card">
            <div className="pause-icon-circle">
              <Pause size={28} />
            </div>
            <h2>Interview Paused</h2>
            <p>
              Take a breath. Your timer, current question, and answer draft are securely preserved.
            </p>
            <button
              type="button"
              className="primary-button resume-button"
              onClick={togglePause}
            >
              <Play size={16} />
              <span>Resume Interview</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          FOOTER BAR
      ==================================================== */}
      <footer className="room-footer">
        <div className="footer-status-pills">
          <span className="status-item">
            <Wifi size={13} />
            <span>Connection Stable</span>
          </span>
          <span className="dot-divider">•</span>
          <span className="status-item">
            <Bot size={13} />
            <span>Interviewer: {interviewerConfig.name}</span>
          </span>
          <span className="dot-divider">•</span>
          <span className="status-item">
            {cameraOn ? (
              <CheckCircle2 size={13} className="text-blue" />
            ) : (
              <AlertCircle size={13} />
            )}
            <span>{cameraOn ? "Camera Connected" : "Camera Standby"}</span>
          </span>
        </div>

        <button
          type="button"
          className="exit-interview-btn"
          onClick={handleExit}
          disabled={isCompleting || isSubmitting}
        >
          <X size={14} />
          <span>Exit Interview</span>
        </button>
      </footer>

      {/* ======================================================
          PRODUCTION STYLES
          Pure Light Blue & White Palette:
          - #E3F2FD (Very Light Blue)
          - #90CAF9 (Soft Blue Borders / Accents)
          - #2196F3 (Primary Vibrant Blue)
          - #0D47A1 (Deep Blue Text / Contrast)
          - #FFFFFF (White)
      ====================================================== */}
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .interview-room,
  .room-loading,
  .room-error {
    width: 100%;
    min-height: 100vh;
    background-color: #FFFFFF;
    color: #0D47A1;
    font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    line-height: 1.5;
  }

  .interview-room *,
  .interview-room *::before,
  .interview-room *::after {
    box-sizing: border-box;
  }

  /* ----------------------------------------------------
     HEADER
  ---------------------------------------------------- */
  .room-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background-color: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid #E3F2FD;
    padding: 10px 24px;
    display: grid;
    grid-template-columns: 1fr minmax(280px, 480px) 1fr;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 12px rgba(13, 71, 161, 0.04);
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.25);
    flex-shrink: 0;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: #0D47A1;
    line-height: 1.2;
  }

  .brand-subtitle {
    font-size: 0.75rem;
    color: #2196F3;
    font-weight: 600;
  }

  .header-progress {
    width: 100%;
  }

  .progress-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 6px;
  }

  .progress-meta strong {
    color: #0D47A1;
  }

  .progress-track {
    height: 7px;
    border-radius: 999px;
    background-color: #E3F2FD;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2196F3 0%, #0D47A1 100%);
    transition: width 0.3s ease;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .live-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: #E3F2FD;
    border: 1px solid #90CAF9;
    color: #0D47A1;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #2196F3;
    box-shadow: 0 0 6px #2196F3;
  }

  .timer-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: #FFFFFF;
    border: 1px solid #90CAF9;
    color: #0D47A1;
    padding: 5px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .timer-low {
    background-color: #FFF3E0;
    border-color: #FFA726;
    color: #E65100;
  }

  .icon-button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #90CAF9;
    background-color: #FFFFFF;
    color: #0D47A1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .icon-button:hover:not(:disabled) {
    background-color: #E3F2FD;
    border-color: #2196F3;
    transform: translateY(-1px);
  }

  .icon-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Alert Banner */
  .room-alert {
    width: min(1360px, calc(100% - 48px));
    margin: 12px auto 0 auto;
    background-color: #FFFFFF;
    border: 1px solid #90CAF9;
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #0D47A1;
    font-size: 0.825rem;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.08);
  }

  .room-alert button {
    margin-left: auto;
    background: none;
    border: none;
    color: #475569;
    cursor: pointer;
  }

  /* ----------------------------------------------------
     MAIN ROOM LAYOUT
  ---------------------------------------------------- */
  .room-main {
    width: min(1360px, calc(100% - 48px));
    margin: 20px auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ----------------------------------------------------
     TWO-PANEL STAGE (AI & CANDIDATE)
  ---------------------------------------------------- */
  .two-panel-stage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    width: 100%;
  }

  .video-card {
    background-color: #FFFFFF;
    border: 1px solid rgba(33, 150, 243, 0.2);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(13, 71, 161, 0.07);
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .video-card-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background-color: #F8FBFE;
    border-bottom: 1px solid #E3F2FD;
  }

  .role-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #0D47A1;
  }

  .avatar-name-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: #E3F2FD;
    border: 1px solid #90CAF9;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #0D47A1;
  }

  .avatar-circle-mini {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #2196F3;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 800;
  }

  .camera-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #475569;
  }

  .dot-active {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #2196F3;
    box-shadow: 0 0 6px #2196F3;
  }

  .dot-inactive {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #94A3B8;
  }

  /* Video Display Boxes */
  .video-display-box {
    position: relative;
    width: 100%;
    height: 380px;
    background-color: #0D1B2A;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .interviewer-video-elem {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .candidate-video-elem {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scaleX(-1);
  }

  .candidate-video-elem.hidden {
    display: none;
  }

  .avatar-fallback-box {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #0D47A1;
  }

  .fallback-avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 12px;
    box-shadow: 0 8px 20px rgba(33, 150, 243, 0.25);
  }

  .avatar-fallback-box h3 {
    margin: 0 0 4px 0;
    font-size: 1.25rem;
    font-weight: 800;
  }

  .avatar-fallback-box p {
    margin: 0;
    color: #2196F3;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .camera-off-fallback {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #F8FBFE 0%, #FFFFFF 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
  }

  .fallback-camera-icon {
    width: 68px;
    height: 68px;
    border-radius: 18px;
    background-color: #E3F2FD;
    border: 1px solid #90CAF9;
    color: #2196F3;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
  }

  .camera-off-fallback h3 {
    margin: 0 0 6px 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #0D47A1;
  }

  .camera-off-fallback p {
    margin: 0 0 16px 0;
    font-size: 0.85rem;
    color: #475569;
    max-width: 340px;
    line-height: 1.45;
  }

  /* Card Footers */
  .video-card-footer {
    padding: 12px 18px;
    background-color: #FFFFFF;
    border-top: 1px solid #E3F2FD;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .interviewer-identity {
    display: flex;
    flex-direction: column;
  }

  .interviewer-name-large {
    font-size: 0.95rem;
    font-weight: 800;
    color: #0D47A1;
  }

  .interviewer-subtitle {
    font-size: 0.72rem;
    color: #2196F3;
    font-weight: 600;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .status-indicator.ready {
    background-color: #E3F2FD;
    color: #0D47A1;
    border: 1px solid #90CAF9;
  }

  .status-ready-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #2196F3;
  }

  .status-indicator.speaking {
    background-color: #E3F2FD;
    color: #0D47A1;
    border: 1px solid #2196F3;
  }

  .status-indicator.listening {
    background-color: #E3F2FD;
    color: #0D47A1;
    border: 1px solid #2196F3;
  }

  .status-indicator.thinking {
    background-color: #E3F2FD;
    color: #0D47A1;
    border: 1px solid #90CAF9;
  }

  .wave-bars {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 12px;
  }

  .wave-bars .bar {
    width: 2.5px;
    background-color: #2196F3;
    border-radius: 2px;
    animation: barPulse 0.9s infinite ease-in-out;
  }

  .wave-bars .bar:nth-child(1) { height: 6px; animation-delay: 0.1s; }
  .wave-bars .bar:nth-child(2) { height: 12px; animation-delay: 0.25s; }
  .wave-bars .bar:nth-child(3) { height: 8px; animation-delay: 0.4s; }
  .wave-bars .bar:nth-child(4) { height: 11px; animation-delay: 0.15s; }

  @keyframes barPulse {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }

  .candidate-footer-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .candidate-media-badges {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .media-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #64748B;
    background-color: #F8FBFE;
    border: 1px solid #E3F2FD;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .media-chip.active {
    color: #0D47A1;
    border-color: #90CAF9;
    background-color: #E3F2FD;
  }

  .candidate-action-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .camera-toggle-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #90CAF9;
    background-color: #FFFFFF;
    color: #0D47A1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .camera-toggle-btn:hover:not(:disabled) {
    background-color: #E3F2FD;
    border-color: #2196F3;
  }

  .camera-toggle-btn.off {
    background-color: #F1F5F9;
    color: #64748B;
  }

  .camera-toggle-btn.mic-on {
    background-color: #E3F2FD;
    border-color: #2196F3;
    color: #2196F3;
  }

  /* ----------------------------------------------------
     INTERVIEW INTERACTION GRID (QUESTION & ANSWER)
  ---------------------------------------------------- */
  .interview-interaction-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: 20px;
    align-items: stretch;
  }

  /* Question Card */
  .question-card {
    background-color: #FFFFFF;
    border: 1px solid rgba(33, 150, 243, 0.2);
    border-radius: 18px;
    padding: 22px;
    box-shadow: 0 8px 24px rgba(13, 71, 161, 0.07);
    display: flex;
    flex-direction: column;
  }

  .question-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .question-badge-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .question-number-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 6px;
    background-color: #E3F2FD;
    border: 1px solid #90CAF9;
    color: #0D47A1;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .question-meta-tags {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tag-pill {
    font-size: 0.7rem;
    font-weight: 600;
    color: #475569;
    background-color: #F8FBFE;
    border: 1px solid #E3F2FD;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .tag-pill.capitalize {
    text-transform: capitalize;
  }

  .question-timer-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    background-color: #F8FBFE;
    border: 1px solid #E3F2FD;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .question-interviewer-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #2196F3;
    margin-bottom: 8px;
  }

  .question-prompt-text {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0D47A1;
    line-height: 1.55;
    margin: 0 0 20px 0;
    flex: 1;
  }

  .question-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid #F1F5F9;
  }

  .audio-tts-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #0D47A1;
    background-color: #E3F2FD;
    border: 1px solid #90CAF9;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .audio-tts-btn:hover {
    background-color: #2196F3;
    color: #FFFFFF;
    border-color: #2196F3;
  }

  .secure-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: #64748B;
  }

  /* Answer Card */
  .answer-card {
    background-color: #FFFFFF;
    border: 1px solid rgba(33, 150, 243, 0.2);
    border-radius: 18px;
    padding: 22px;
    box-shadow: 0 8px 24px rgba(13, 71, 161, 0.07);
    display: flex;
    flex-direction: column;
  }

  .answer-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .answer-heading h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0D47A1;
  }

  .answer-subtitle {
    font-size: 0.72rem;
    color: #2196F3;
    font-weight: 600;
  }

  .char-count {
    font-size: 0.72rem;
    color: #64748B;
    font-variant-numeric: tabular-nums;
  }

  .answer-textarea {
    width: 100%;
    min-height: 140px;
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    border: 1.5px solid #E3F2FD;
    background-color: #F8FBFE;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #0D47A1;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    margin-bottom: 16px;
  }

  .answer-textarea:focus {
    border-color: #2196F3;
    background-color: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.12);
  }

  .answer-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .voice-record-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: #FFFFFF;
    color: #0D47A1;
    border: 1.5px solid #90CAF9;
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .voice-record-btn:hover:not(:disabled) {
    background-color: #E3F2FD;
    border-color: #2196F3;
  }

  .voice-record-btn.recording {
    background-color: #E3F2FD;
    border-color: #2196F3;
    color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
  }

  .mic-pulse {
    animation: pulseAnim 1.2s infinite;
  }

  @keyframes pulseAnim {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }

  .answer-footer-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pause-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: #FFFFFF;
    color: #0D47A1;
    border: 1px solid #90CAF9;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pause-btn:hover:not(:disabled) {
    background-color: #E3F2FD;
    border-color: #2196F3;
  }

  .submit-answer-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: #2196F3;
    color: #FFFFFF;
    border: none;
    padding: 9px 20px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(33, 150, 243, 0.28);
    transition: all 0.2s ease;
  }

  .submit-answer-btn:hover:not(:disabled) {
    background-color: #0D47A1;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(13, 71, 161, 0.3);
  }

  .submit-answer-btn:disabled,
  .voice-record-btn:disabled,
  .pause-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  /* ----------------------------------------------------
     FOOTER
  ---------------------------------------------------- */
  .room-footer {
    background-color: #F8FBFE;
    border-top: 1px solid #E3F2FD;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #64748B;
  }

  .footer-status-pills {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot-divider {
    color: #90CAF9;
  }

  .exit-interview-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px solid #90CAF9;
    color: #0D47A1;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .exit-interview-btn:hover:not(:disabled) {
    background-color: #E3F2FD;
    border-color: #2196F3;
  }

  /* ----------------------------------------------------
     PAUSE MODAL OVERLAY
  ---------------------------------------------------- */
  .pause-overlay-modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    background-color: rgba(13, 71, 161, 0.4);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .pause-modal-card {
    background-color: #FFFFFF;
    border: 1.5px solid #90CAF9;
    border-radius: 22px;
    padding: 36px 32px;
    max-width: 440px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 48px rgba(13, 71, 161, 0.2);
  }

  .pause-icon-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background-color: #E3F2FD;
    color: #2196F3;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px auto;
  }

  .pause-modal-card h2 {
    margin: 0 0 10px 0;
    font-size: 1.4rem;
    font-weight: 850;
    color: #0D47A1;
  }

  .pause-modal-card p {
    margin: 0 0 24px 0;
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.5;
  }

  .resume-button {
    width: 100%;
    padding: 12px 24px;
    font-size: 0.95rem;
    font-weight: 700;
    background-color: #2196F3;
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(33, 150, 243, 0.3);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .resume-button:hover {
    background-color: #0D47A1;
    transform: translateY(-2px);
  }

  /* ----------------------------------------------------
     LOADING & ERROR PAGES
  ---------------------------------------------------- */
  .room-loading,
  .room-error {
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .loading-card,
  .error-card {
    background-color: #FFFFFF;
    border: 1.5px solid #90CAF9;
    border-radius: 20px;
    padding: 40px 32px;
    max-width: 460px;
    width: 100%;
    text-align: center;
    box-shadow: 0 16px 40px rgba(13, 71, 161, 0.1);
  }

  .loading-logo,
  .error-icon {
    width: 58px;
    height: 58px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px auto;
  }

  .error-icon {
    background: #FFF3E0;
    color: #E65100;
    border: 1px solid #FFA726;
  }

  .loading-card h1,
  .error-card h1 {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0D47A1;
    margin: 12px 0 8px 0;
  }

  .loading-card p,
  .error-card p {
    font-size: 0.875rem;
    color: #475569;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  .loading-track {
    width: 100%;
    height: 6px;
    background-color: #E3F2FD;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }

  .loading-track span {
    display: block;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, #2196F3, #0D47A1);
    border-radius: inherit;
    animation: trackIndeterminate 1.4s infinite ease-in-out;
  }

  @keyframes trackIndeterminate {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(280%); }
  }

  .error-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .primary-button {
    background-color: #2196F3;
    color: #FFFFFF;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 14px rgba(33, 150, 243, 0.28);
    transition: all 0.2s ease;
  }

  .primary-button:hover {
    background-color: #0D47A1;
  }

  .primary-button.compact {
    padding: 8px 16px;
    font-size: 0.8rem;
  }

  .secondary-button {
    background-color: #FFFFFF;
    color: #0D47A1;
    border: 1px solid #90CAF9;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .secondary-button:hover {
    background-color: #E3F2FD;
    border-color: #2196F3;
  }

  .spin {
    animation: spinAnim 1s linear infinite;
  }

  @keyframes spinAnim {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .text-blue {
    color: #2196F3;
  }

  /* ----------------------------------------------------
     RESPONSIVE BREAKPOINTS
  ---------------------------------------------------- */
  @media (max-width: 1080px) {
    .two-panel-stage {
      grid-template-columns: 1fr;
    }

    .video-display-box {
      height: 320px;
    }

    .interview-interaction-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 820px) {
    .room-header {
      grid-template-columns: auto 1fr auto;
      padding: 10px 16px;
    }

    .brand-title {
      display: none;
    }

    .brand-subtitle {
      display: none;
    }

    .room-main {
      width: calc(100% - 24px);
      margin: 14px auto;
    }
  }

  @media (max-width: 600px) {
    .room-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      padding: 12px 14px;
    }

    .header-brand {
      justify-content: space-between;
    }

    .brand-title {
      display: block;
    }

    .brand-subtitle {
      display: block;
    }

    .header-actions {
      justify-content: space-between;
      width: 100%;
    }

    .video-display-box {
      height: 240px;
    }

    .answer-card-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .voice-record-btn,
    .answer-footer-right {
      width: 100%;
    }

    .submit-answer-btn,
    .pause-btn {
      flex: 1;
      justify-content: center;
    }

    .room-footer {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }
`;

