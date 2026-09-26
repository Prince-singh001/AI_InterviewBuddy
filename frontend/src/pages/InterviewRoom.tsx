import { interviewsApi } from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Camera,
  CameraOff,
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    // Storage can be unavailable in restricted contexts
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
// MAIN COMPONENT: FULL-SCREEN INTERVIEW ROOM
// ============================================================

export default function InterviewRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Authenticated candidate name for personalized greeting and PiP label
  const { user } = useAuthStore();
  const candidateName = user?.name?.trim() || "Candidate";

  const interviewId = useMemo(
    () => resolveInterviewId(id, location),
    [id, location],
  );

  // Authoritative selected interviewer (Jenny or Samm, fixed for entire session)
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

  const [interviewer] = useState<"jenny" | "samm">(resolvedInterviewer);

  const interviewerConfig = useMemo(() => {
    if (interviewer === "samm") {
      return {
        name: "Samm",
        roleLabel: "Technical Interview Specialist",
        videoSrc: "/images/interviewers/samm.mp4",
        initialLetter: "S",
      };
    }
    return {
      name: "Jenny",
      roleLabel: "AI Interview Specialist",
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
      return state.type ? `${state.role} · ${state.type}` : state.role;
    }
    return "Live Interview Session";
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

  // Status flags
  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [, setCandidateTurn] = useState(false);

  // Media flags
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
  const greetingDoneRef = useRef(false);
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
        // Autoplay policy or video buffering
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
    if (mountedRef.current) {
      setIsSpeaking(false);
      setIsGreeting(false);
    }
  }, [clearSpeechTimeouts]);

  // Core speak method with onEnd callback support
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!text || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

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
        if (mountedRef.current) {
          setIsSpeaking(false);
          onEnd?.();
        }
      };
      utterance.onerror = () => {
        if (mountedRef.current) {
          setIsSpeaking(false);
          onEnd?.();
        }
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [clearSpeechTimeouts],
  );

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // Recognition may already be stopped
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
      setCameraError("Camera permission was denied or camera is unavailable.");
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
          setError("Interview ID is missing. Please return to interview setup.");
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
          // Storage restrictions fallback
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

  // Starts the interview and handles candidate greeting
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

      // Greeting with authenticated candidate name
      const timeoutId = window.setTimeout(() => {
        if (!mountedRef.current) return;

        if (!greetingDoneRef.current) {
          greetingDoneRef.current = true;
          setIsGreeting(true);

          const greetingMessage = `Hello ${candidateName}, welcome to your AI interview. I'm ${interviewerConfig.name}, and I'll be your interviewer today. Let's begin with your first question.`;

          speakText(greetingMessage, () => {
            if (!mountedRef.current) return;
            setIsGreeting(false);

            // Once greeting completes, speak question 1
            const firstQuestionText = getQuestionText(question);
            speakText(firstQuestionText, () => {
              if (mountedRef.current) setCandidateTurn(true);
            });
          });
        } else {
          speakText(getQuestionText(question), () => {
            if (mountedRef.current) setCandidateTurn(true);
          });
        }
      }, 500);

      speechTimeoutsRef.current.push(timeoutId);
    } catch (startError) {
      startedRef.current = false;
      setError(getErrorMessage(startError));
    } finally {
      if (mountedRef.current) setIsStarting(false);
    }
  }, [candidateName, durationMinutes, interviewId, interviewerConfig.name, routeDuration, speakText]);

  const submitAnswer = useCallback(async () => {
    if (!interviewId || !currentQ) return;
    if (isSubmitting || isCompleting || isPaused) return;

    const answer = userAnswer.trim();

    if (!answer) {
      setError("Please type or dictate an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setCandidateTurn(false);
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
        throw new Error("The server did not return the next interview question.");
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
        if (mountedRef.current && !isPaused) {
          speakText(nextText, () => {
            if (mountedRef.current) setCandidateTurn(true);
          });
        }
      }, 400);

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
    speakText,
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
      "Exit this interview? Your progress will be saved and evaluated.",
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

  // Main session ticker
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
      setQuestionSeconds((prev) => prev + 1);

      if (nextElapsed >= durationSeconds) {
        stopTimer();
        void completeInterview("time");
      }
    }, 1000);

    return () => stopTimer();
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
      <div className="w-screen h-screen min-h-screen bg-[#F8FCFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F2FD] border border-[#90CAF9] text-[#2196F3] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Bot size={32} />
          </div>
          <Loader2 size={24} className="animate-spin text-[#2196F3] mx-auto mb-3" />
          <h1 className="text-xl font-black text-[#0D47A1] mb-2">Connecting to AI Interview Room</h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Joining session with <strong>{interviewerConfig.name}</strong> ({interviewerConfig.roleLabel}) and preparing your questions...
          </p>
          <div className="w-full bg-[#E3F2FD] h-2 rounded-full overflow-hidden">
            <div className="bg-[#2196F3] h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error && !currentQ) {
    return (
      <div className="w-screen h-screen min-h-screen bg-[#F8FCFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-black text-[#0D47A1] mb-2">Unable to Start Session</h1>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/interview/setup")}
              className="px-5 py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Back to Setup
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={interviewContainerRef}
      className="w-screen h-screen min-h-screen bg-[#F8FCFF] text-slate-800 flex flex-col font-sans select-none overflow-y-auto md:overflow-hidden"
      style={{ width: "100vw", height: "100vh", minHeight: "100vh" }}
    >
      {/* ====================================================
          1. TOP INTERVIEW HEADER (Compact & Professional)
      ==================================================== */}
      <header className="shrink-0 h-14 sm:h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-[#90CAF9]/40 flex items-center justify-between z-30 shadow-2xs">
        {/* Left: Exit + Branding + Category */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleExit}
            disabled={isCompleting}
            title="Exit Interview"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#E3F2FD] text-[#0D47A1] border border-slate-200 hover:border-[#90CAF9] transition-colors text-xs font-bold cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#2196F3] to-[#0D47A1] text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot size={17} />
          </div>

          <div className="flex flex-col">
            <div className="text-xs sm:text-sm font-black text-[#0D47A1] leading-tight">
              InterviewerBuddy AI
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#2196F3] font-semibold line-clamp-1 max-w-[140px] sm:max-w-[280px]">
              {roleTitle}
            </div>
          </div>
        </div>

        {/* Center: Question Progress */}
        <div className="flex flex-col items-center max-w-[140px] sm:max-w-xs w-full mx-2 sm:mx-4">
          <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-bold text-[#0D47A1] mb-1">
            <span>Question {currentQuestionNumber} of {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#E3F2FD] h-1.5 sm:h-2 rounded-full overflow-hidden border border-[#90CAF9]/30">
            <div
              className="bg-[#2196F3] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Right: Live Session + Timer + Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F2FD] border border-[#90CAF9] text-[11px] font-bold text-[#0D47A1]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Session</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${
              isTimerLow
                ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                : "bg-white text-[#0D47A1] border-[#90CAF9]"
            }`}
          >
            <Clock3 size={13} className={isTimerLow ? "text-rose-600" : "text-[#2196F3]"} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-[#E3F2FD] text-[#0D47A1] border border-slate-200 hover:border-[#90CAF9] transition-colors cursor-pointer"
          >
            <Expand size={15} />
          </button>
        </div>
      </header>

      {/* Non-blocking error banner */}
      {error && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ====================================================
          2. MAIN INTERVIEWER AREA (Dominates Screen + PiP)
      ==================================================== */}
      <div className="flex-1 min-h-[300px] sm:min-h-0 relative p-3 sm:p-4 pb-2 flex flex-col">
        <div className="flex-1 min-h-0 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-[#90CAF9]/40 shadow-md">
          {/* AI Interviewer Video */}
          {!avatarVideoError ? (
            <video
              ref={avatarVideoRef}
              src={interviewerConfig.videoSrc}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover object-center"
              onError={() => setAvatarVideoError(true)}
              aria-label={`${interviewerConfig.name} AI Avatar`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2196F3] to-[#0D47A1] text-white flex items-center justify-center text-4xl font-black mb-3 shadow-lg border-2 border-[#90CAF9]">
                {interviewerConfig.initialLetter}
              </div>
              <h3 className="text-xl font-bold text-white">{interviewerConfig.name}</h3>
              <p className="text-xs text-[#90CAF9] mt-1">{interviewerConfig.roleLabel}</p>
            </div>
          )}

          {/* FLOATING STATUS PILL OVERLAY (TOP-LEFT) */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
            {isSubmitting ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-[#90CAF9] border border-[#2196F3]/50 text-xs font-bold shadow-lg">
                <Loader2 size={13} className="animate-spin text-[#2196F3]" />
                <span>Processing answer...</span>
              </div>
            ) : isGreeting ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0D47A1]/90 backdrop-blur-md text-white border border-[#2196F3] text-xs font-bold shadow-lg">
                <Sparkles size={13} className="text-[#90CAF9] animate-pulse" />
                <span>Greeting {candidateName}...</span>
              </div>
            ) : isSpeaking ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0D47A1]/90 backdrop-blur-md text-white border border-[#2196F3] text-xs font-bold shadow-lg">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-[#90CAF9] rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-[#90CAF9] rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-5 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.45s]" />
                </div>
                <span>AI is speaking...</span>
              </div>
            ) : isListening ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/50 text-xs font-bold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Listening... Speak or type below</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white border border-[#90CAF9]/40 text-xs font-medium shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Your turn · Speak or type below</span>
              </div>
            )}
          </div>

          {/* FLOATING INTERVIEWER BADGE (TOP-RIGHT) */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-[#90CAF9]/30 text-white text-xs font-semibold">
            <Bot size={13} className="text-[#2196F3]" />
            <span>{interviewerConfig.name}</span>
            <span className="text-slate-400 text-[10px]">•</span>
            <span className="text-slate-300 text-[10px]">{interviewerConfig.roleLabel}</span>
          </div>

          {/* ====================================================
              3. CANDIDATE CAMERA — PICTURE IN PICTURE (PiP)
          ==================================================== */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 w-[150px] sm:w-[220px] md:w-[260px] lg:w-[280px] aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#90CAF9] shadow-2xl bg-slate-900 group transition-all">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${cameraOn ? "block" : "hidden"}`}
            />

            {!cameraOn && (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-300">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-1">
                  <UserRound size={16} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">Camera Off</span>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="mt-1 px-2.5 py-0.5 rounded-lg bg-[#2196F3] hover:bg-[#0D47A1] text-white text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Turn On
                </button>
              </div>
            )}

            {/* PiP Overlay: Name Badge */}
            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${cameraOn ? "bg-emerald-400" : "bg-slate-400"}`} />
              <span className="truncate max-w-[70px] sm:max-w-[120px]">{candidateName} (You)</span>
            </div>

            {/* PiP Overlay: Quick Controls on hover */}
            <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs p-1 rounded-lg">
              <button
                type="button"
                onClick={toggleCamera}
                title={cameraOn ? "Turn camera off" : "Turn camera on"}
                className="p-1 rounded text-white hover:text-[#90CAF9] transition-colors cursor-pointer"
              >
                {cameraOn ? <Camera size={13} /> : <CameraOff size={13} />}
              </button>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported || isSubmitting}
                title={isListening ? "Stop microphone" : "Start microphone"}
                className="p-1 rounded text-white hover:text-[#90CAF9] transition-colors cursor-pointer"
              >
                {isListening ? <Mic size={13} className="text-rose-400 animate-pulse" /> : <MicOff size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. QUESTION, TRANSCRIPT & BOTTOM CONTROL BAR
      ==================================================== */}
      <div className="shrink-0 flex flex-col gap-2.5 px-3 sm:px-4 pb-3">
        {/* ROW 1: QUESTION (LEFT) & ANSWER / TRANSCRIPT (RIGHT) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
          {/* QUESTION SECTION (5 cols) */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-[#90CAF9]/40 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2FD] border border-[#90CAF9] text-[10px] sm:text-[11px] font-black text-[#0D47A1]">
                    QUESTION {String(currentQuestionNumber).padStart(2, "0")}
                  </span>
                  {currentQ?.topic && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[120px]">
                      {currentQ.topic}
                    </span>
                  )}
                </div>
                {currentQ?.difficulty && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border capitalize bg-[#E3F2FD] text-[#0D47A1] border-[#90CAF9]">
                    {currentQ.difficulty}
                  </span>
                )}
              </div>

              <div className="text-[11px] font-bold text-[#2196F3] flex items-center gap-1 mb-1">
                <Bot size={13} />
                <span>{interviewerConfig.name} asks:</span>
              </div>

              <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#0D47A1] leading-snug line-clamp-3 sm:line-clamp-4">
                "{questionText}"
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock3 size={12} className="text-[#2196F3]" />
                <span>Time: {formatTime(questionSeconds)}</span>
              </span>
              <button
                type="button"
                onClick={() => (isSpeaking ? stopSpeaking() : speakText(questionText))}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2196F3] hover:text-[#0D47A1] cursor-pointer"
              >
                <Volume2 size={12} />
                <span>{isSpeaking ? "Stop Voice" : "Re-read"}</span>
              </button>
            </div>
          </div>

          {/* CANDIDATE ANSWER / TRANSCRIPT SECTION (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#90CAF9]/40 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-wider">
                    Your Answer
                  </span>
                  {isListening && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Live Dictation Active
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {userAnswer.length} chars
                </span>
              </div>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitting || isPaused}
                placeholder={
                  isListening
                    ? "Listening... Speak naturally and your words will appear here in real time."
                    : "Click 'Voice Dictation' to speak, or type your structured answer here..."
                }
                className={`w-full h-18 sm:h-20 md:h-22 p-2.5 rounded-xl bg-[#F8FCFF] text-slate-800 border text-xs sm:text-sm leading-relaxed resize-none shadow-2xs focus:outline-hidden transition-all ${
                  isListening
                    ? "border-[#2196F3] ring-2 ring-[#90CAF9]/50"
                    : "border-[#90CAF9] focus:border-[#2196F3] focus:ring-2 focus:ring-[#90CAF9]/30"
                }`}
                aria-label="Candidate interview answer"
              />
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press Submit when finished answering</span>
              {isSubmitting && (
                <span className="text-[#2196F3] font-bold flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Evaluating answer...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: FIXED/STICKY BOTTOM CONTROL BAR */}
        <div className="h-13 sm:h-14 bg-white rounded-xl sm:rounded-2xl border border-[#90CAF9]/40 px-3 sm:px-5 flex items-center justify-between shadow-xs">
          {/* Left Media Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported || isSubmitting}
              title={isListening ? "Stop microphone dictation" : "Start microphone dictation"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-300/40"
                  : "bg-[#E3F2FD] hover:bg-[#90CAF9]/40 text-[#0D47A1] border-[#90CAF9]"
              }`}
            >
              <Mic size={14} className={isListening ? "animate-pulse text-rose-600" : "text-[#2196F3]"} />
              <span className="hidden sm:inline">{isListening ? "Stop Dictation" : "Voice Dictation"}</span>
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              title={cameraOn ? "Turn camera off" : "Turn camera on"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                cameraOn
                  ? "bg-[#E3F2FD] border-[#2196F3] text-[#0D47A1]"
                  : "bg-slate-100 border-slate-300 text-slate-600"
              }`}
            >
              {cameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
              <span className="hidden sm:inline">{cameraOn ? "Camera On" : "Camera Off"}</span>
            </button>

            <button
              type="button"
              onClick={() => (isSpeaking ? stopSpeaking() : speakText(questionText))}
              title="Re-read question aloud"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#E3F2FD] text-[#0D47A1] text-xs font-bold border border-slate-200 hover:border-[#90CAF9] transition-colors cursor-pointer"
            >
              <Volume2 size={14} className="text-[#2196F3]" />
              <span>{isSpeaking ? "Stop Audio" : "Re-read"}</span>
            </button>
          </div>

          {/* Center Status / Pause */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePause}
              disabled={isSubmitting || isCompleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              {isPaused ? <Play size={13} className="text-[#2196F3]" /> : <Pause size={13} className="text-slate-500" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pl-2 border-l border-slate-200">
              <Wifi size={13} />
              <span>Stable</span>
            </div>
          </div>

          {/* Right Primary Action & Submit */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void submitAnswer()}
              disabled={!userAnswer.trim() || isSubmitting || isPaused || isCompleting}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-[#2196F3] to-[#0D47A1] hover:from-[#1E88E5] hover:to-[#0B3D91] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
