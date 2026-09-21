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
  Sparkles,
  UserRound,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

const BLUE = {
  light: "#E3F2FD",
  soft: "#90CAF9",
  primary: "#2196F3",
  deep: "#0D47A1",
  white: "#FFFFFF",
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

export default function InterviewRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const interviewId = useMemo(
    () => resolveInterviewId(id, location),
    [id, location],
  );

  const routeDuration = useMemo(() => {
    const state = location.state as { duration?: number } | null | undefined;
    return typeof state?.duration === "number" && state.duration > 0
      ? state.duration
      : null;
  }, [location.state]);

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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechTimeoutsRef = useRef<number[]>([]);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  const completingRef = useRef(false);
  const elapsedRef = useRef(0);
  const questionStartedAtRef = useRef(Date.now());
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
        // The navigation is still allowed because the backend may have
        // completed the interview before the response was interrupted.
      } finally {
        try {
          sessionStorage.removeItem("active_interview_id");
        } catch {
          // Ignore storage restrictions.
        }

        if (mountedRef.current) {
          navigate(`/interview/complete/${interviewId}`, {
            replace: true,
            state: { reason },
          });
        }
      }
    },
    [interviewId, navigate, stopCamera, stopListening, stopSpeaking, stopTimer],
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
    // IMPORTANT: use the resolved authoritative interviewId, not route `id`.
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
      "Exit this interview? Your current interview will be submitted as incomplete.",
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
      // Ignore storage restrictions.
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

  if (isStarting) {
    return (
      <div className="room-loading">
        <div className="loading-card">
          <div className="loading-logo">
            <Bot size={28} />
          </div>
          <Loader2 size={20} className="spin" />
          <h1>Preparing your interview</h1>
          <p>Setting up your AI interviewer and first question.</p>
          <div className="loading-track">
            <span />
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

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
            <Bot size={19} />
          </div>
          <div>
            <div className="brand-title">InterviewerBuddy AI</div>
            <div className="brand-subtitle">Live Interview</div>
          </div>
        </div>

        <div className="header-progress">
          <div className="progress-meta">
            <span>
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="header-actions">
          <div className="live-pill">
            <span />
            Live
          </div>
          <div className={`timer-pill ${isTimerLow ? "timer-low" : ""}`}>
            <Clock3 size={15} />
            {formatTime(remainingSeconds)}
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

      {error && (
        <div className="room-alert" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={15} />
          </button>
        </div>
      )}

      <main className="room-main">
        <section className="left-column">
          <div className="video-card">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`candidate-video ${cameraOn ? "visible" : "hidden"}`}
            />

            {!cameraOn && (
              <div className="camera-empty">
                <div className="camera-empty-icon">
                  <UserRound size={38} />
                </div>
                <h2>Camera is off</h2>
                <p>
                  {cameraError ||
                    "Turn on your camera for a more realistic interview experience."}
                </p>
                <button
                  className="primary-button"
                  onClick={() => void startCamera()}
                >
                  <Camera size={16} />
                  Enable camera
                </button>
              </div>
            )}

            <div className="video-top">
              <div className="secure-pill">
                <Wifi size={13} />
                Secure session
              </div>
              <div className="video-actions">
                <button
                  className="video-action"
                  onClick={toggleCamera}
                  title={cameraOn ? "Turn camera off" : "Turn camera on"}
                  aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {cameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
                </button>
                <button
                  className={`video-action ${isListening ? "active" : ""}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!speechSupported || isSubmitting}
                  title={isListening ? "Stop microphone" : "Start microphone"}
                  aria-label={
                    isListening ? "Stop microphone" : "Start microphone"
                  }
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
              </div>
            </div>

            <div className="ai-interviewer">
              <div className={`ai-avatar ${isSpeaking ? "speaking" : ""}`}>
                <Bot size={58} />
              </div>
              <div className="ai-name">
                <Bot size={14} />
                AI Interviewer
              </div>
              <div className="ai-state">
                {isSpeaking ? (
                  <>
                    <span className="sound-bars">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    Speaking
                  </>
                ) : (
                  "Ready for your response"
                )}
              </div>
            </div>

            <div className="candidate-label">
              <span className={cameraOn ? "dot-on" : "dot-off"} />
              Candidate
            </div>

            <div className="video-footer">
              <button
                className={`control-button ${cameraOn ? "selected" : ""}`}
                onClick={toggleCamera}
              >
                {cameraOn ? <Camera size={17} /> : <CameraOff size={17} />}
                <span>Camera</span>
                <small>{cameraOn ? "On" : "Off"}</small>
              </button>

              <button
                className={`control-button ${isListening ? "selected" : ""}`}
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported || isSubmitting}
              >
                {isListening ? <Mic size={17} /> : <MicOff size={17} />}
                <span>Microphone</span>
                <small>{isListening ? "Listening" : "Ready"}</small>
              </button>

              <button
                className="end-button"
                onClick={handleExit}
                disabled={isCompleting}
              >
                <X size={21} />
              </button>

              <button className="control-button" onClick={toggleFullscreen}>
                <Expand size={17} />
                <span>Fullscreen</span>
                <small>{isFullscreen ? "On" : "Off"}</small>
              </button>
            </div>
          </div>

          <div className="question-card">
            <div className="question-top">
              <div className="question-heading">
                <div className="question-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="eyebrow">AI Interviewer</div>
                  <div className="question-tags">
                    {currentQ?.topic && <span>{currentQ.topic}</span>}
                    {currentQ?.difficulty && <span>{currentQ.difficulty}</span>}
                    {currentQ?.question_type && (
                      <span>{currentQ.question_type}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="question-time">
                <Clock3 size={14} />
                {formatTime(questionSeconds)}
              </div>
            </div>

            <p className="question-text">{questionText}</p>

            <div className="question-bottom">
              <span>
                Question {currentQuestionNumber} of {totalQuestions}
              </span>
              <button
                className="secondary-button compact"
                onClick={() => (isSpeaking ? stopSpeaking() : speakQuestion())}
              >
                <Volume2 size={15} />
                {isSpeaking ? "Stop" : "Read aloud"}
              </button>
            </div>
          </div>
        </section>

        <section className="response-column">
          <div className="response-header">
            <div>
              <h2>Your response</h2>
              <p>Answer naturally and take your time.</p>
            </div>
            <div className={`listen-status ${isListening ? "on" : ""}`}>
              <span />
              {isListening ? "Listening" : "Ready"}
            </div>
          </div>

          <div className="response-card">
            <div className="editor-header">
              <span>
                <Sparkles size={14} />
                AI evaluates your answer after submission
              </span>
              <small>{userAnswer.length.toLocaleString()} characters</small>
            </div>

            <textarea
              value={userAnswer}
              onChange={(event) => setUserAnswer(event.target.value)}
              disabled={isSubmitting || isPaused}
              placeholder="Type your answer here, or use the microphone to answer by voice…"
              aria-label="Your interview answer"
            />

            <div className="editor-footer">
              <button
                className={`voice-button ${isListening ? "active" : ""}`}
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported || isSubmitting}
              >
                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                {isListening ? "Stop recording" : "Answer by voice"}
              </button>

              <div className="editor-actions">
                <button
                  className="secondary-button"
                  onClick={togglePause}
                  disabled={isSubmitting || isCompleting}
                >
                  {isPaused ? <Play size={15} /> : <Pause size={15} />}
                  {isPaused ? "Resume" : "Pause"}
                </button>

                <button
                  className="submit-button"
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
                      Evaluating…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit answer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {isPaused && (
            <div className="paused-card">
              <Pause size={17} />
              <div>
                <strong>Interview paused</strong>
                <span>Your answer and current question are preserved.</span>
              </div>
              <button onClick={togglePause}>
                <Play size={14} />
                Resume
              </button>
            </div>
          )}

          <div className="interviewer-status">
            <div className={`status-avatar ${isSpeaking ? "speaking" : ""}`}>
              <Bot size={21} />
            </div>
            <div>
              <strong>AI Interviewer</strong>
              <span>
                {isSubmitting
                  ? "Reviewing your response…"
                  : isSpeaking
                    ? "Speaking the current question"
                    : "Listening to your answer"}
              </span>
            </div>
            <CheckCircle2 size={18} className="status-check" />
          </div>

          <div className="tip-card">
            <div className="tip-icon">
              <AlertCircle size={16} />
            </div>
            <div>
              <strong>Interview tip</strong>
              <p>
                Give a clear answer and support it with a short, relevant
                example.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="room-footer">
        <div>
          <Wifi size={13} />
          Connection stable
          <span>•</span>
          {cameraOn ? "Camera on" : "Camera off"}
          <span>•</span>
          {isListening ? "Microphone on" : "Microphone standby"}
        </div>
        <button onClick={handleExit} disabled={isCompleting || isSubmitting}>
          <X size={14} />
          Exit interview
        </button>
      </footer>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .interview-room,
  .room-loading,
  .room-error {
    --blue-50: ${BLUE.light};
    --blue-200: ${BLUE.soft};
    --blue-500: ${BLUE.primary};
    --blue-900: ${BLUE.deep};
    --white: ${BLUE.white};
    --text: #102A43;
    --muted: #627D98;
    --border: rgba(33, 150, 243, .18);
    --border-strong: rgba(33, 150, 243, .28);
    --shadow: 0 16px 45px rgba(13, 71, 161, .09);
    --soft-shadow: 0 8px 25px rgba(33, 150, 243, .08);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .interview-room {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: var(--text);
    background:
      radial-gradient(circle at 8% 0%, rgba(144, 202, 249, .25), transparent 26%),
      linear-gradient(135deg, #E3F2FD 0%, #F7FBFF 45%, #FFFFFF 100%);
  }

  .room-header {
    position: sticky;
    top: 0;
    z-index: 30;
    min-height: 72px;
    display: grid;
    grid-template-columns: 1fr minmax(280px, 520px) 1fr;
    align-items: center;
    gap: 22px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,.95);
    backdrop-filter: blur(16px);
    box-shadow: 0 4px 18px rgba(13,71,161,.06);
  }

  .header-brand,
  .header-actions,
  .video-actions,
  .question-heading,
  .question-top,
  .question-bottom,
  .editor-footer,
  .editor-actions,
  .interviewer-status,
  .room-footer > div {
    display: flex;
    align-items: center;
  }

  .header-brand { gap: 10px; min-width: 0; }
  .header-actions { justify-content: flex-end; gap: 8px; }
  .brand-icon, .loading-logo {
    width: 40px; height: 40px; display: grid; place-items: center;
    flex: 0 0 auto; color: #fff; border-radius: 12px;
    background: linear-gradient(135deg, var(--blue-500), var(--blue-900));
    box-shadow: 0 7px 18px rgba(33,150,243,.22);
  }
  .brand-title { font-size: 14px; font-weight: 850; color: var(--blue-900); white-space: nowrap; }
  .brand-subtitle { margin-top: 2px; color: var(--muted); font-size: 11px; }

  .icon-button, .video-action {
    display: grid; place-items: center; border: 1px solid var(--border);
    background: #fff; color: var(--blue-900); cursor: pointer; transition: .16s ease;
  }
  .icon-button { width: 38px; height: 38px; border-radius: 10px; }
  .icon-button:hover, .video-action:hover:not(:disabled) {
    background: var(--blue-50); border-color: var(--blue-200); transform: translateY(-1px);
  }
  button:disabled { cursor: not-allowed; opacity: .52; }

  .header-progress { width: 100%; }
  .progress-meta { display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--muted); font-size: 11px; font-weight: 700; }
  .progress-meta strong { color: var(--blue-900); }
  .progress-track { height: 7px; overflow: hidden; border-radius: 999px; background: var(--blue-50); }
  .progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--blue-500), var(--blue-900)); transition: width .3s ease; }

  .live-pill, .timer-pill {
    min-height: 34px; display: flex; align-items: center; gap: 7px;
    padding: 0 10px; border: 1px solid var(--border); border-radius: 10px;
    background: #fff; color: var(--muted); font-size: 11px; font-weight: 800;
  }
  .live-pill { color: var(--blue-900); }
  .live-pill span { width: 7px; height: 7px; border-radius: 50%; background: var(--blue-500); box-shadow: 0 0 0 4px rgba(33,150,243,.1); }
  .timer-low { color: var(--blue-900); border-color: var(--blue-200); background: var(--blue-50); }

  .room-alert {
    width: min(1480px, calc(100% - 36px)); margin: 12px auto 0;
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    border: 1px solid var(--border-strong); border-radius: 11px;
    color: var(--blue-900); background: #fff;
    font-size: 12px; box-shadow: var(--soft-shadow);
  }
  .room-alert button { margin-left: auto; border: 0; background: transparent; color: var(--muted); cursor: pointer; }

  .room-main {
    width: min(1480px, calc(100% - 36px)); margin: 20px auto; flex: 1;
    display: grid; grid-template-columns: minmax(0,1.08fr) minmax(390px,.92fr); gap: 20px;
  }
  .left-column, .response-column { min-width: 0; }

  .video-card {
    position: relative; min-height: 520px; overflow: hidden; border-radius: 22px;
    border: 1px solid rgba(33,150,243,.18);
    background: linear-gradient(145deg, #E3F2FD, #FFFFFF);
    box-shadow: var(--shadow);
  }
  .candidate-video { width: 100%; height: 100%; min-height: 520px; display: block; object-fit: cover; transform: scaleX(-1); background: linear-gradient(135deg,#E3F2FD,#FFFFFF); }
  .candidate-video.hidden { visibility: hidden; }

  .camera-empty {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 30px; text-align: center; background: linear-gradient(135deg,#E3F2FD,#FFFFFF);
  }
  .camera-empty-icon {
    width: 82px; height: 82px; display: grid; place-items: center; margin-bottom: 16px;
    border: 1px solid var(--border); border-radius: 24px; color: var(--blue-900); background: #fff; box-shadow: var(--soft-shadow);
  }
  .camera-empty h2 { margin: 0; color: var(--blue-900); font-size: 21px; }
  .camera-empty p { max-width: 440px; margin: 8px 0 18px; color: var(--muted); font-size: 13px; line-height: 1.55; }

  .video-top {
    position: absolute; top: 14px; left: 14px; right: 14px;
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .secure-pill {
    display: flex; align-items: center; gap: 6px; padding: 7px 9px;
    border: 1px solid rgba(255,255,255,.75); border-radius: 9px;
    color: var(--blue-900); background: rgba(255,255,255,.9); font-size: 10px; font-weight: 800;
    backdrop-filter: blur(8px);
  }
  .video-actions { gap: 7px; }
  .video-action { width: 35px; height: 35px; border-radius: 9px; }
  .video-action.active { color: #fff; background: var(--blue-500); border-color: var(--blue-500); }

  .ai-interviewer {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    pointer-events: none;
    background:
      radial-gradient(circle at 50% 42%, rgba(144,202,249,.48), transparent 25%),
      linear-gradient(145deg, rgba(227,242,253,.25), rgba(255,255,255,.03));
  }
  .ai-avatar {
    width: 145px; height: 145px; display: grid; place-items: center; color: #fff; border-radius: 50%;
    background: linear-gradient(135deg,var(--blue-500),var(--blue-900));
    box-shadow: 0 0 0 10px rgba(33,150,243,.08), 0 25px 65px rgba(13,71,161,.22);
    animation: float 4s ease-in-out infinite;
  }
  .ai-avatar.speaking { animation: float 4s ease-in-out infinite, pulse 1.1s ease-in-out infinite; }
  .ai-name { margin-top: 14px; display: flex; align-items: center; gap: 5px; color: var(--blue-900); font-weight: 850; font-size: 13px; }
  .ai-state { margin-top: 5px; display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 11px; }

  .sound-bars { height: 15px; display: flex; align-items: center; gap: 2px; color: var(--blue-500); }
  .sound-bars i { width: 2px; border-radius: 5px; background: currentColor; animation: sound .7s ease-in-out infinite alternate; }
  .sound-bars i:nth-child(1){height:6px}.sound-bars i:nth-child(2){height:12px;animation-delay:.1s}.sound-bars i:nth-child(3){height:15px;animation-delay:.2s}.sound-bars i:nth-child(4){height:9px;animation-delay:.3s}

  .candidate-label {
    position: absolute; left: 14px; bottom: 105px; display: flex; align-items: center; gap: 7px;
    padding: 7px 10px; border-radius: 9px; color: var(--blue-900); background: rgba(255,255,255,.92);
    border: 1px solid rgba(33,150,243,.15); font-size: 10px; font-weight: 800; backdrop-filter: blur(8px);
  }
  .dot-on,.dot-off { width: 7px; height: 7px; border-radius: 50%; }
  .dot-on { background: var(--blue-500); box-shadow: 0 0 0 4px rgba(33,150,243,.1); }
  .dot-off { background: var(--blue-200); }

  .video-footer {
    position: absolute; left: 0; right: 0; bottom: 0; min-height: 88px; display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 12px; background: linear-gradient(transparent, rgba(13,71,161,.92));
  }
  .control-button {
    min-width: 76px; border: 0; background: transparent; color: rgba(255,255,255,.82);
    display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; font-size: 10px;
  }
  .control-button small { font-size: 8px; opacity: .72; }
  .control-button.selected { color: #fff; }
  .end-button {
    width: 52px; height: 52px; display: grid; place-items: center; margin: 0 7px;
    border: 0; border-radius: 50%; color: #fff; background: var(--blue-900); cursor: pointer;
    box-shadow: 0 8px 22px rgba(13,71,161,.3);
  }

  .question-card, .response-card, .interviewer-status, .tip-card, .paused-card {
    border: 1px solid var(--border); background: rgba(255,255,255,.96); box-shadow: var(--soft-shadow);
  }
  .question-card { margin-top: 14px; padding: 18px; border-radius: 18px; }
  .question-top { justify-content: space-between; gap: 12px; }
  .question-heading { gap: 10px; min-width: 0; }
  .question-icon { width: 38px; height: 38px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 11px; color: #fff; background: linear-gradient(135deg,var(--blue-500),var(--blue-900)); }
  .eyebrow { color: var(--blue-900); font-size: 11px; font-weight: 850; }
  .question-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .question-tags span { padding: 3px 7px; border-radius: 6px; color: var(--muted); background: var(--blue-50); font-size: 9px; font-weight: 700; text-transform: capitalize; }
  .question-time { display: flex; align-items: center; gap: 5px; color: var(--muted); font-size: 11px; white-space: nowrap; }
  .question-text { margin: 16px 0; color: var(--text); font-size: clamp(17px,2vw,21px); line-height: 1.55; font-weight: 750; }
  .question-bottom { justify-content: space-between; gap: 10px; color: var(--muted); font-size: 10px; }

  .response-column { display: flex; flex-direction: column; gap: 13px; }
  .response-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .response-header h2 { margin: 0; color: var(--blue-900); font-size: 19px; }
  .response-header p { margin: 4px 0 0; color: var(--muted); font-size: 11px; }
  .listen-status { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid var(--border); border-radius: 999px; color: var(--muted); font-size: 10px; font-weight: 800; }
  .listen-status span { width: 7px; height: 7px; border-radius: 50%; background: var(--blue-200); }
  .listen-status.on { color: var(--blue-900); }
  .listen-status.on span { background: var(--blue-500); box-shadow: 0 0 0 4px rgba(33,150,243,.1); }

  .response-card { min-height: 410px; display: flex; flex-direction: column; overflow: hidden; border-radius: 20px; }
  .editor-header { min-height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 14px; border-bottom: 1px solid var(--border); background: #FBFDFF; color: var(--muted); font-size: 10px; }
  .editor-header span { display: flex; align-items: center; gap: 6px; }
  .editor-header span svg { color: var(--blue-500); }
  .editor-header small { color: #829AB1; white-space: nowrap; }
  .response-card textarea { flex: 1; width: 100%; min-height: 270px; resize: vertical; padding: 17px; border: 0; outline: 0; color: var(--text); background: #fff; font: inherit; font-size: 14px; line-height: 1.75; }
  .response-card textarea::placeholder { color: #9FB3C8; }
  .response-card textarea:focus { box-shadow: inset 0 0 0 2px rgba(33,150,243,.12); }
  .editor-footer { justify-content: space-between; gap: 9px; padding: 11px 13px; border-top: 1px solid var(--border); background: #FBFDFF; }
  .editor-actions { gap: 7px; }

  .secondary-button, .voice-button, .submit-button, .primary-button {
    min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 0 12px; border-radius: 9px; font-size: 11px; font-weight: 800; cursor: pointer; transition: .16s ease;
  }
  .secondary-button, .voice-button { border: 1px solid var(--border); color: var(--blue-900); background: #fff; }
  .secondary-button:hover:not(:disabled), .voice-button:hover:not(:disabled) { background: var(--blue-50); border-color: var(--blue-200); }
  .secondary-button.compact { min-height: 34px; }
  .voice-button.active { color: #fff; background: var(--blue-500); border-color: var(--blue-500); }
  .submit-button, .primary-button { border: 0; color: #fff; background: linear-gradient(135deg,var(--blue-500),var(--blue-900)); box-shadow: 0 7px 18px rgba(33,150,243,.2); }
  .submit-button { min-width: 145px; }
  .submit-button:hover:not(:disabled), .primary-button:hover:not(:disabled) { transform: translateY(-1px); }
  .submit-button:disabled { opacity: .5; cursor: not-allowed; }

  .paused-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; color: var(--blue-900); background: var(--blue-50); }
  .paused-card div { display: flex; flex-direction: column; gap: 2px; }
  .paused-card strong { font-size: 11px; }
  .paused-card span { color: var(--muted); font-size: 10px; }
  .paused-card button { margin-left: auto; display: flex; align-items: center; gap: 5px; border: 0; color: var(--blue-900); background: #fff; border-radius: 8px; padding: 7px 9px; font-size: 10px; font-weight: 800; cursor: pointer; }

  .interviewer-status { gap: 11px; padding: 12px 14px; border-radius: 15px; }
  .status-avatar { width: 40px; height: 40px; display: grid; place-items: center; flex: 0 0 auto; color: #fff; border-radius: 12px; background: linear-gradient(135deg,var(--blue-500),var(--blue-900)); }
  .status-avatar.speaking { box-shadow: 0 0 0 5px rgba(33,150,243,.1); }
  .interviewer-status > div:nth-child(2) { display: flex; flex-direction: column; gap: 3px; }
  .interviewer-status strong { color: var(--blue-900); font-size: 11px; }
  .interviewer-status span { color: var(--muted); font-size: 10px; }
  .status-check { margin-left: auto; color: var(--blue-500); }

  .tip-card { display: flex; gap: 9px; padding: 12px 14px; border-radius: 14px; background: rgba(227,242,253,.68); }
  .tip-icon { width: 29px; height: 29px; flex: 0 0 auto; display: grid; place-items: center; color: var(--blue-900); border-radius: 8px; background: #fff; }
  .tip-card strong { color: var(--blue-900); font-size: 10px; }
  .tip-card p { margin: 3px 0 0; color: var(--muted); font-size: 10px; line-height: 1.5; }

  .room-footer { min-height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 24px; border-top: 1px solid var(--border); background: rgba(255,255,255,.94); color: var(--muted); font-size: 10px; }
  .room-footer > div { gap: 7px; }
  .room-footer > div svg { color: var(--blue-500); }
  .room-footer button { display: flex; align-items: center; gap: 5px; border: 1px solid var(--border); border-radius: 8px; padding: 6px 9px; color: var(--muted); background: #fff; font-size: 10px; font-weight: 800; cursor: pointer; }

  .room-loading, .room-error { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: linear-gradient(135deg,#E3F2FD,#FFFFFF); color: var(--text); }
  .loading-card, .error-card { width: min(450px,100%); padding: 32px; text-align: center; border: 1px solid var(--border); border-radius: 22px; background: rgba(255,255,255,.96); box-shadow: var(--shadow); }
  .loading-logo { margin: 0 auto 16px; }
  .loading-card h1, .error-card h1 { margin: 13px 0 7px; color: var(--blue-900); font-size: 21px; }
  .loading-card p, .error-card p { margin: 0 0 20px; color: var(--muted); line-height: 1.55; font-size: 12px; }
  .loading-track { height: 6px; overflow: hidden; border-radius: 999px; background: var(--blue-50); }
  .loading-track span { display: block; width: 40%; height: 100%; border-radius: inherit; background: linear-gradient(90deg,var(--blue-500),var(--blue-900)); animation: loading 1.2s ease-in-out infinite; }
  .error-icon { width: 54px; height: 54px; margin: 0 auto; display: grid; place-items: center; border-radius: 16px; color: var(--blue-900); background: var(--blue-50); }
  .error-actions { display: flex; justify-content: center; gap: 8px; }

  .spin { animation: spin .9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes loading { from { transform: translateX(-130%); } to { transform: translateX(310%); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 10px rgba(33,150,243,.08),0 25px 65px rgba(13,71,161,.22); } 50% { box-shadow: 0 0 0 20px rgba(33,150,243,.07),0 25px 85px rgba(13,71,161,.28); } }
  @keyframes sound { from { transform: scaleY(.55); } to { transform: scaleY(1.15); } }

  @media (max-width: 1100px) {
    .room-header { grid-template-columns: 1fr 1fr; }
    .header-progress { grid-column: 1 / -1; grid-row: 2; }
    .room-main { grid-template-columns: 1fr; }
    .response-card { min-height: 390px; }
  }

  @media (max-width: 720px) {
    .room-header { display: flex; flex-wrap: wrap; gap: 9px; padding: 9px 12px; }
    .header-brand { flex: 1; }
    .header-progress { flex-basis: 100%; order: 3; }
    .brand-subtitle { display: none; }
    .brand-title { font-size: 12px; }
    .brand-icon { width: 36px; height: 36px; }
    .header-actions { gap: 5px; }
    .live-pill { display: none; }
    .room-main { width: calc(100% - 20px); margin: 10px auto; gap: 12px; }
    .video-card, .candidate-video { min-height: 310px; }
    .ai-avatar { width: 105px; height: 105px; }
    .video-footer { min-height: 76px; gap: 3px; }
    .control-button { min-width: 57px; font-size: 9px; }
    .control-button small { display: none; }
    .end-button { width: 45px; height: 45px; }
    .question-card { padding: 14px; }
    .question-top { align-items: flex-start; }
    .editor-footer { flex-direction: column; align-items: stretch; }
    .voice-button, .submit-button, .secondary-button { width: 100%; }
    .editor-actions { width: 100%; }
    .editor-actions .secondary-button { flex: 0 0 100px; width: auto; }
    .editor-actions .submit-button { flex: 1; width: auto; }
    .room-footer { padding: 7px 12px; }
  }

  @media (max-width: 460px) {
    .header-actions .timer-pill { padding: 0 8px; font-size: 10px; }
    .video-card, .candidate-video { min-height: 270px; }
    .candidate-label { bottom: 88px; left: 10px; }
    .ai-name { font-size: 11px; }
    .ai-state { font-size: 9px; }
    .question-text { font-size: 16px; }
    .question-bottom { align-items: stretch; flex-direction: column; }
    .secondary-button.compact { width: 100%; }
    .editor-actions .secondary-button { flex-basis: 92px; }
    .room-footer { display: none; }
    .error-actions { flex-direction: column; }
  }
`;
