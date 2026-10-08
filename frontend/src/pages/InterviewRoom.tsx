import { interviewsApi } from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";
import { resolveVoiceProfile, VoiceProfile } from "@/utils/voiceUtils";
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
  RotateCcw,
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
  acknowledgement?: string;
}

type VoiceInteractionState =
  | "idle"
  | "ai_speaking"
  | "listening"
  | "user_speaking"
  | "evaluating"
  | "ai_feedback"
  | "next_question";

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

  // Authenticated candidate name for personalized PiP label
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

  // Consistent voice gender: Jenny = female, Samm = male
  const resolvedVoiceGender = useMemo<"male" | "female">(() => {
    const state = location.state as
      | { voice_gender?: "male" | "female"; interviewer?: string }
      | null
      | undefined;
    if (state?.voice_gender === "male" || state?.voice_gender === "female") {
      return state.voice_gender;
    }
    try {
      const stored = sessionStorage.getItem("active_voice_gender");
      if (stored === "male" || stored === "female") {
        return stored as "male" | "female";
      }
    } catch {
      // Storage unavailable fallback
    }
    return resolvedInterviewer === "samm" ? "male" : "female";
  }, [location.state, resolvedInterviewer]);

  const interviewerConfig = useMemo(() => {
    if (interviewer === "samm") {
      return {
        name: "Sam",
        genderLabel: "Male Voice",
        roleLabel: "Technical Interview Specialist",
        videoSrc: "/images/interviewers/samm.mp4",
        initialLetter: "S",
      };
    }
    return {
      name: "Jenny",
      genderLabel: "Female Voice",
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
    return "Live Voice Interview Session";
  }, [location.state]);

  // State Management
  const [durationMinutes, setDurationMinutes] = useState(routeDuration ?? 30);
  const [currentQ, setCurrentQ] = useState<LiveQuestion | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(
    routeDuration ? (QUESTION_COUNTS[routeDuration] ?? 6) : 15,
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);

  // Voice Interaction State Machine
  const [voiceState, setVoiceState] = useState<VoiceInteractionState>("idle");

  // Status flags
  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);

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
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceProfileRef = useRef<VoiceProfile | null>(null);
  const latestAnswerRef = useRef("");
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  const introPlayedRef = useRef(false);
  const completingRef = useRef(false);
  const elapsedRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  const interviewContainerRef = useRef<HTMLDivElement | null>(null);

  // Duplicate Answer & TTS Guards (prevents 400 already answered)
  const answeredQuestionIdsRef = useRef<Set<string>>(new Set());
  const submittingQuestionIdRef = useRef<string | null>(null);
  const spokenQuestionIdsRef = useRef<Set<string>>(new Set());

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
  // DETERMINISTIC VOICE PROFILE INITIALIZATION
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;
    void resolveVoiceProfile(resolvedVoiceGender, "en-US").then((profile) => {
      if (active) {
        voiceProfileRef.current = profile;
        console.log(
          `[InterviewRoom] Locked deterministic voice profile for ${resolvedVoiceGender}:`,
          profile.voiceName,
        );
      }
    });

    return () => {
      active = false;
    };
  }, [resolvedVoiceGender]);

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

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // Recognition may already be stopped
    }
    recognitionRef.current = null;
    if (mountedRef.current) {
      setIsListening(false);
      setInterimTranscript("");
    }
  }, [clearSilenceTimer]);

  const stopSpeaking = useCallback(() => {
    clearSpeechTimeouts();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (mountedRef.current) {
      setIsSpeaking(false);
      setIsGreeting(false);
    }
  }, [clearSpeechTimeouts]);

  // ----------------------------------------------------------
  // CORE DETERMINISTIC SPEECH SYNTHESIS
  // ----------------------------------------------------------
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!text || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      // CRITICAL: Stop microphone immediately before TTS to prevent acoustic feedback loop
      stopListening();
      clearSpeechTimeouts();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const profile = voiceProfileRef.current;

      if (profile?.voice) {
        utterance.voice = profile.voice;
        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
      } else {
        utterance.rate = resolvedVoiceGender === "female" ? 0.96 : 0.94;
        utterance.pitch = resolvedVoiceGender === "female" ? 1.08 : 0.90;
      }
      utterance.volume = 1;

      let hasCompleted = false;
      const handleComplete = () => {
        if (hasCompleted) return;
        hasCompleted = true;
        if (mountedRef.current) {
          setIsSpeaking(false);
          onEnd?.();
        }
      };

      utterance.onstart = () => {
        if (mountedRef.current) {
          setIsSpeaking(true);
        }
      };

      utterance.onend = handleComplete;

      utterance.onerror = (event) => {
        console.warn("[TTS] Utterance event:", event);
        handleComplete();
      };

      // Safety fallback in case browser speech synthesis hangs or fails to fire onend
      const maxDuration = Math.max(7000, text.length * 85);
      const safetyTimer = window.setTimeout(handleComplete, maxDuration);
      speechTimeoutsRef.current.push(safetyTimer);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [clearSpeechTimeouts, resolvedVoiceGender, stopListening],
  );

  // ----------------------------------------------------------
  // CAMERA CONTROLS
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // SESSION COMPLETION
  // ----------------------------------------------------------
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
          sessionStorage.removeItem(`interview_intro_done_${interviewId}`);
        } catch {
          // Storage restrictions fallback
        }

        if (mountedRef.current) {
          navigate(`/interview/complete/${interviewId}`, {
            replace: true,
            state: { reason, interviewer, voice_gender: resolvedVoiceGender },
          });
        }
      }
    },
    [interviewId, interviewer, navigate, resolvedVoiceGender, stopCamera, stopListening, stopSpeaking, stopTimer],
  );

  // ----------------------------------------------------------
  // SPEECH RECOGNITION & DICTATION WITH SILENCE AUTO-SUBMIT
  // ----------------------------------------------------------
  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge for the best voice experience.",
      );
      return;
    }

    stopListening();
    clearSilenceTimer();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      if (mountedRef.current) {
        setIsListening(true);
        setVoiceState("listening");
        setError("");
      }
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      if (mountedRef.current) {
        if (finalTranscript.trim()) {
          setUserAnswer((prev) => {
            const trimmed = prev.trim();
            const updated = `${trimmed}${trimmed ? " " : ""}${finalTranscript.trim()}`.trim();
            latestAnswerRef.current = updated;
            return updated;
          });
        }
        setInterimTranscript(interim);
        setVoiceState("user_speaking");

        // Dynamic Silence Detection:
        // When candidate pauses for > 3.2s with a valid answer, auto-submit
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          if (isSubmitting || isTransitioning || !currentQ?.question_id) return;
          if (answeredQuestionIdsRef.current.has(String(currentQ.question_id))) return;
          const currentAnswer = latestAnswerRef.current.trim();
          const wordCount = currentAnswer.split(/\s+/).filter(Boolean).length;
          if (wordCount >= 3) {
            void submitAnswer();
          }
        }, 3200);
      }
    };

    recognition.onerror = (event: any) => {
      if (!mountedRef.current) return;
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        setIsListening(false);
        setError("Microphone permission is required for voice interviews. Please allow microphone access in your browser.");
      } else if (event?.error !== "no-speech") {
        console.warn("[SpeechRecognition] event warning:", event.error);
      }
    };

    recognition.onend = () => {
      if (
        mountedRef.current &&
        isListening &&
        !isSpeaking &&
        !isSubmitting &&
        !isPaused &&
        !isCompleting
      ) {
        // Continuous listening safety auto-reconnect
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else if (mountedRef.current) {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [clearSilenceTimer, isCompleting, isListening, isPaused, isSpeaking, isSubmitting, stopListening]);

  // Safe buffer delay after AI speech ends before starting microphone (prevents speaker echo)
  const safeStartListeningAfterTTS = useCallback(() => {
    clearSpeechTimeouts();
    const timeoutId = window.setTimeout(() => {
      if (mountedRef.current && !isPaused && !isCompleting && !completingRef.current) {
        startListening();
      }
    }, 600); // 600ms buffer ensures audio output has finished echoing
    speechTimeoutsRef.current.push(timeoutId);
  }, [clearSpeechTimeouts, isCompleting, isPaused, startListening]);

  // ----------------------------------------------------------
  // ANSWER SUBMISSION & AI ACKNOWLEDGEMENT FEEDBACK
  // ----------------------------------------------------------
  const submitAnswer = useCallback(async () => {
    if (!interviewId || !currentQ?.question_id) return;
    if (isSubmitting || isTransitioning || isCompleting || isPaused) return;

    const currentQuestionId = String(currentQ.question_id);

    // CRITICAL: Idempotency & duplicate check
    if (
      submittingQuestionIdRef.current === currentQuestionId ||
      answeredQuestionIdsRef.current.has(currentQuestionId)
    ) {
      console.warn(`[InterviewRoom] Question ${currentQuestionId} already answered or in flight. Skipping.`);
      return;
    }

    const answer = (latestAnswerRef.current.trim() || userAnswer.trim());

    if (!answer) {
      setError("Please speak your answer into the microphone before submitting.");
      return;
    }

    submittingQuestionIdRef.current = currentQuestionId;
    setIsSubmitting(true);
    setVoiceState("evaluating");
    setError("");
    clearSilenceTimer();
    stopListening();
    stopSpeaking();

    try {
      const questionDuration = Math.max(
        0,
        Math.floor((Date.now() - questionStartedAtRef.current) / 1000),
      );

      const rawResponse = await interviewsApi.answer(
        interviewId,
        currentQuestionId,
        answer,
        questionDuration,
      );

      // Successfully saved! Immediately register as answered so it can NEVER be submitted again
      answeredQuestionIdsRef.current.add(currentQuestionId);

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

      // Reset spoken answer states for the next turn
      setUserAnswer("");
      setInterimTranscript("");
      latestAnswerRef.current = "";

      // Professional short AI acknowledgement
      const ack =
        response.acknowledgement ||
        ((response.score ?? 50) >= 60
          ? "Good answer. Let's move to the next question."
          : "Thank you. Let's continue with the next question.");

      setVoiceState("ai_feedback");

      if (isLast) {
        speakText(
          ack || "Excellent work. You have completed all questions for this session.",
          async () => {
            await completeInterview("finished");
          },
        );
        return;
      }

      // Immediately fetch next question while or right before acknowledgment
      setIsTransitioning(true);
      try {
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

        // Transition current question state IMMEDIATELY so previous question can NEVER be re-submitted
        const nextQuestionObj: LiveQuestion = {
          ...nextQuestion,
          question_number: nextNumber,
          total_questions: nextTotal,
        };

        setTotalQuestions(nextTotal);
        setQuestionIdx(Math.max(nextNumber - 1, 0));
        setCurrentQ(nextQuestionObj);
        setQuestionSeconds(0);
        questionStartedAtRef.current = Date.now();

        // Speak acknowledgment first, then speak next question once
        speakText(ack, () => {
          if (!mountedRef.current || isPaused) return;
          const nextQId = String(nextQuestionObj.question_id);
          if (!spokenQuestionIdsRef.current.has(nextQId)) {
            spokenQuestionIdsRef.current.add(nextQId);
            setVoiceState("ai_speaking");
            const nextText = getQuestionText(nextQuestionObj);
            speakText(nextText, () => {
              if (mountedRef.current && !isPaused) {
                safeStartListeningAfterTTS();
              }
            });
          }
        });
      } catch (nextErr) {
        console.error("Failed to load next question:", nextErr);
        setError(getErrorMessage(nextErr));
      } finally {
        if (mountedRef.current) {
          setIsTransitioning(false);
          submittingQuestionIdRef.current = null;
        }
      }
    } catch (answerError) {
      console.error("Failed to submit answer:", answerError);
      setError(getErrorMessage(answerError));
      submittingQuestionIdRef.current = null;
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    clearSilenceTimer,
    completeInterview,
    currentQ,
    interviewId,
    isCompleting,
    isPaused,
    isSubmitting,
    isTransitioning,
    questionIdx,
    safeStartListeningAfterTTS,
    speakText,
    stopListening,
    stopSpeaking,
    totalQuestions,
    userAnswer,
  ]);

  // ----------------------------------------------------------
  // START INTERVIEW: VOICE INITIALIZATION & SPOKEN INTRODUCTION
  // ----------------------------------------------------------
  const startInterview = useCallback(async () => {
    if (!interviewId || startedRef.current) return;

    startedRef.current = true;
    setIsStarting(true);
    setError("");

    try {
      // 1. Resolve and lock the deterministic voice profile first
      const profile = await resolveVoiceProfile(resolvedVoiceGender, "en-US");
      if (mountedRef.current) {
        voiceProfileRef.current = profile;
      }

      // 2. Fetch the initial interview session & first question
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
      setUserAnswer("");
      setInterimTranscript("");
      latestAnswerRef.current = "";
      setElapsed(0);
      setQuestionSeconds(0);
      elapsedRef.current = 0;
      questionStartedAtRef.current = Date.now();
      setIsPaused(false);

      const firstQuestionObj: LiveQuestion = {
        ...question,
        question_number: questionNumber,
        total_questions: finalTotal,
      };

      // Switch from loading screen to room layout
      if (mountedRef.current) {
        setIsStarting(false);
      }

      // 3. Spoken Introduction Flow:
      // Must play strictly ONCE per interview session
      const sessionIntroKey = `interview_intro_done_${interviewId}`;
      const hasAlreadyIntroduced =
        introPlayedRef.current ||
        sessionStorage.getItem(sessionIntroKey) === "done";

      if (!hasAlreadyIntroduced) {
        introPlayedRef.current = true;
        try {
          sessionStorage.setItem(sessionIntroKey, "done");
        } catch {
          // sessionStorage fallback
        }

        // Exact natural introduction mapped to the chosen persona & voice
        const introMessage =
          resolvedVoiceGender === "male"
            ? "Hi, I'm Sam, and I'll be your AI interviewer today. Let's get started."
            : "Hi, I'm Jenny, and I'll be your AI interviewer today. Let's get started.";

        if (mountedRef.current) {
          setIsGreeting(true);
          setVoiceState("ai_speaking");
        }

        // Wait a brief 300ms for browser DOM mount, then speak introduction
        const timeoutId = window.setTimeout(() => {
          if (!mountedRef.current) return;

          speakText(introMessage, () => {
            if (!mountedRef.current) return;
            setIsGreeting(false);

            // Once introduction finishes completely:
            // 1. Show the first interview question
            setCurrentQ(firstQuestionObj);
            setVoiceState("ai_speaking");

            // 2. Speak the first question after a small natural pause
            const questionTimer = window.setTimeout(() => {
              if (!mountedRef.current || isPaused) return;
              const firstQId = String(firstQuestionObj.question_id);
              if (spokenQuestionIdsRef.current.has(firstQId)) return;
              spokenQuestionIdsRef.current.add(firstQId);

              const firstQuestionText = getQuestionText(firstQuestionObj);
              speakText(firstQuestionText, () => {
                if (mountedRef.current && !isPaused) {
                  // 3. Microphone starts listening only after question finishes
                  safeStartListeningAfterTTS();
                }
              });
            }, 400);

            speechTimeoutsRef.current.push(questionTimer);
          });
        }, 300);

        speechTimeoutsRef.current.push(timeoutId);
      } else {
        // Introduction already played (e.g. page refresh) -> directly display & speak first question
        setCurrentQ(firstQuestionObj);
        setVoiceState("ai_speaking");

        const timeoutId = window.setTimeout(() => {
          if (!mountedRef.current || isPaused) return;
          const firstQId = String(firstQuestionObj.question_id);
          if (spokenQuestionIdsRef.current.has(firstQId)) return;
          spokenQuestionIdsRef.current.add(firstQId);

          speakText(getQuestionText(firstQuestionObj), () => {
            if (mountedRef.current && !isPaused) {
              safeStartListeningAfterTTS();
            }
          });
        }, 300);

        speechTimeoutsRef.current.push(timeoutId);
      }
    } catch (startError) {
      startedRef.current = false;
      setError(getErrorMessage(startError));
      if (mountedRef.current) setIsStarting(false);
    }
  }, [
    durationMinutes,
    interviewId,
    isPaused,
    resolvedVoiceGender,
    routeDuration,
    safeStartListeningAfterTTS,
    speakText,
  ]);

  const handleClearAnswer = useCallback(() => {
    clearSilenceTimer();
    setUserAnswer("");
    setInterimTranscript("");
    latestAnswerRef.current = "";
    if (!isSpeaking && !isSubmitting && !isPaused && !isGreeting) {
      startListening();
    }
  }, [clearSilenceTimer, isGreeting, isPaused, isSpeaking, isSubmitting, startListening]);

  const handleRereadQuestion = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      stopListening();
      setVoiceState("ai_speaking");
      speakText(questionText, () => {
        if (mountedRef.current && !isPaused) {
          safeStartListeningAfterTTS();
        }
      });
    }
  }, [isPaused, isSpeaking, questionText, safeStartListeningAfterTTS, speakText, stopListening, stopSpeaking]);

  const togglePause = useCallback(() => {
    if (isCompleting) return;

    setIsPaused((previous) => {
      const next = !previous;
      if (next) {
        clearSilenceTimer();
        stopListening();
        stopSpeaking();
      } else {
        // Resuming: if not speaking, activate mic
        safeStartListeningAfterTTS();
      }
      return next;
    });
  }, [clearSilenceTimer, isCompleting, safeStartListeningAfterTTS, stopListening, stopSpeaking]);

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

  // Main session boot effect - runs once per interviewId
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
      clearSilenceTimer();
      stopTimer();
      stopListening();
      stopSpeaking();
      stopCamera();

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

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

  // Combined real-time display transcript
  const fullDisplayTranscript = useMemo(() => {
    const main = userAnswer.trim();
    const interim = interimTranscript.trim();
    if (main && interim) return `${main} ${interim}`;
    return main || interim;
  }, [userAnswer, interimTranscript]);

  // Loading Screen
  if (isStarting) {
    return (
      <div className="w-screen h-screen min-h-screen bg-[#F8FCFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F2FD] border border-[#90CAF9] text-[#2196F3] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Bot size={32} />
          </div>
          <Loader2 size={24} className="animate-spin text-[#2196F3] mx-auto mb-3" />
          <h1 className="text-xl font-black text-[#0D47A1] mb-2">Connecting to AI Voice Interview</h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Joining session with <strong>{interviewerConfig.name}</strong> ({interviewerConfig.genderLabel} · {interviewerConfig.roleLabel}) and preparing voice interaction...
          </p>
          <div className="w-full bg-[#E3F2FD] h-2 rounded-full overflow-hidden">
            <div className="bg-[#2196F3] h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error && !currentQ && !isGreeting) {
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
            <div className="text-xs sm:text-sm font-black text-[#0D47A1] leading-tight flex items-center gap-1.5">
              <span>InterviewerBuddy AI</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#E3F2FD] text-[#2196F3] font-bold">
                Voice Mode
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#2196F3] font-semibold line-clamp-1 max-w-[140px] sm:max-w-[280px]">
              {roleTitle}
            </div>
          </div>
        </div>

        {/* Center: Question Progress */}
        <div className="flex flex-col items-center max-w-[140px] sm:max-w-xs w-full mx-2 sm:mx-4">
          <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-bold text-[#0D47A1] mb-1">
            <span>
              {isGreeting ? "Starting Session" : `Question ${currentQuestionNumber} of ${totalQuestions}`}
            </span>
            <span>{isGreeting ? "0%" : `${Math.round(progress)}%`}</span>
          </div>
          <div className="w-full bg-[#E3F2FD] h-1.5 sm:h-2 rounded-full overflow-hidden border border-[#90CAF9]/30">
            <div
              className="bg-[#2196F3] h-full rounded-full transition-all duration-300"
              style={{ width: `${isGreeting ? 5 : progress}%` }}
            />
          </div>
        </div>

        {/* Right: Live Session + Timer + Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F2FD] border border-[#90CAF9] text-[11px] font-bold text-[#0D47A1]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Voice Session</span>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setError("");
                startListening();
              }}
              className="underline font-bold hover:text-rose-900 cursor-pointer"
            >
              Retry Microphone
            </button>
            <button onClick={() => setError("")} className="cursor-pointer ml-2">
              <X size={15} />
            </button>
          </div>
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
              <p className="text-xs text-[#90CAF9] mt-1">
                {interviewerConfig.genderLabel} · {interviewerConfig.roleLabel}
              </p>
            </div>
          )}

          {/* FLOATING STATUS PILL OVERLAY (TOP-LEFT) */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
            {isSubmitting || voiceState === "evaluating" ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-[#90CAF9] border border-[#2196F3]/50 text-xs font-bold shadow-lg">
                <Loader2 size={13} className="animate-spin text-[#2196F3]" />
                <span>Evaluating answer...</span>
              </div>
            ) : isGreeting ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0D47A1]/90 backdrop-blur-md text-white border border-[#2196F3] text-xs font-bold shadow-lg">
                <Sparkles size={13} className="text-[#90CAF9] animate-pulse" />
                <span>AI Interviewer Introduction...</span>
              </div>
            ) : voiceState === "ai_feedback" ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0D47A1]/90 backdrop-blur-md text-white border border-[#2196F3] text-xs font-bold shadow-lg">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-[#90CAF9] rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-[#90CAF9] rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
                <span>AI response...</span>
              </div>
            ) : isSpeaking || voiceState === "ai_speaking" ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0D47A1]/90 backdrop-blur-md text-white border border-[#2196F3] text-xs font-bold shadow-lg">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-[#90CAF9] rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-[#90CAF9] rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-5 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.45s]" />
                </div>
                <span>AI is speaking...</span>
              </div>
            ) : voiceState === "user_speaking" ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-950/90 backdrop-blur-md text-[#90CAF9] border border-[#2196F3] text-xs font-bold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2196F3] animate-pulse" />
                <span>You are speaking · Dictating answer...</span>
              </div>
            ) : isListening || voiceState === "listening" ? (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/50 text-xs font-bold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Listening... Speak your answer now</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white border border-[#90CAF9]/40 text-xs font-medium shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Your turn · Speak to answer</span>
              </div>
            )}
          </div>

          {/* FLOATING INTERVIEWER BADGE (TOP-RIGHT) */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-[#90CAF9]/30 text-white text-xs font-semibold">
            <Bot size={13} className="text-[#2196F3]" />
            <span>{interviewerConfig.name}</span>
            <span className="text-slate-400 text-[10px]">•</span>
            <span className="text-[#90CAF9] text-[10px] font-bold">{interviewerConfig.genderLabel}</span>
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
                disabled={!speechSupported || isSubmitting || isSpeaking || isGreeting}
                title={isListening ? "Stop microphone" : "Start microphone"}
                className="p-1 rounded text-white hover:text-[#90CAF9] transition-colors cursor-pointer"
              >
                {isListening ? <Mic size={13} className="text-emerald-400 animate-pulse" /> : <MicOff size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. QUESTION & VOICE TRANSCRIPT INTERACTION AREA
      ==================================================== */}
      <div className="shrink-0 flex flex-col gap-2.5 px-3 sm:px-4 pb-3">
        {/* ROW 1: QUESTION (LEFT 5 COLS) & VOICE TRANSCRIPT (RIGHT 7 COLS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
          {/* QUESTION SECTION (5 cols) */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-[#90CAF9]/40 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2FD] border border-[#90CAF9] text-[10px] sm:text-[11px] font-black text-[#0D47A1]">
                    {isGreeting ? "INTRODUCTION" : `QUESTION ${String(currentQuestionNumber).padStart(2, "0")}`}
                  </span>
                  {currentQ?.topic && !isGreeting && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[120px]">
                      {currentQ.topic}
                    </span>
                  )}
                </div>
                {currentQ?.difficulty && !isGreeting && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border capitalize bg-[#E3F2FD] text-[#0D47A1] border-[#90CAF9]">
                    {currentQ.difficulty}
                  </span>
                )}
              </div>

              <div className="text-[11px] font-bold text-[#2196F3] flex items-center gap-1 mb-1">
                <Bot size={13} />
                <span>{interviewerConfig.name} ({interviewerConfig.genderLabel}):</span>
              </div>

              <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#0D47A1] leading-snug line-clamp-3 sm:line-clamp-4">
                {isGreeting
                  ? `"${resolvedVoiceGender === "male"
                      ? "Hi, I'm Sam, and I'll be your AI interviewer today. Let's get started."
                      : "Hi, I'm Jenny, and I'll be your AI interviewer today. Let's get started."}"`
                  : `"${questionText}"`}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock3 size={12} className="text-[#2196F3]" />
                <span>Time: {formatTime(questionSeconds)}</span>
              </span>
              <button
                type="button"
                onClick={handleRereadQuestion}
                disabled={isGreeting}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2196F3] hover:text-[#0D47A1] cursor-pointer disabled:opacity-40"
              >
                <Volume2 size={12} />
                <span>{isSpeaking ? "Stop Voice" : "Re-read Question"}</span>
              </button>
            </div>
          </div>

          {/* CANDIDATE VOICE TRANSCRIPT SECTION (7 cols) - VOICE ONLY, NO TYPING */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#90CAF9]/40 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-wider">
                    Spoken Answer
                  </span>

                  {/* Dynamic Voice State Badge */}
                  {isGreeting && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#0D47A1] text-[10px] font-bold border border-blue-200">
                      <Sparkles size={11} className="text-[#2196F3] animate-pulse" />
                      Introduction
                    </span>
                  )}
                  {!isGreeting && voiceState === "ai_speaking" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#0D47A1] text-[10px] font-bold border border-blue-200">
                      <Volume2 size={11} className="text-[#2196F3] animate-pulse" />
                      AI Speaking
                    </span>
                  )}
                  {voiceState === "listening" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Mic Active · Speak
                    </span>
                  )}
                  {voiceState === "user_speaking" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E3F2FD] text-[#0D47A1] text-[10px] font-bold border border-[#90CAF9]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2196F3] animate-pulse" />
                      Transcribing Live
                    </span>
                  )}
                  {(voiceState === "evaluating" || isSubmitting) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      <Loader2 size={10} className="animate-spin text-indigo-600" />
                      Evaluating
                    </span>
                  )}
                  {voiceState === "ai_feedback" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#0D47A1] text-[10px] font-bold border border-[#90CAF9]">
                      <Volume2 size={11} className="text-[#2196F3]" />
                      AI Feedback
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    Voice Dictation
                  </span>
                </div>
              </div>

              {/* REAL-TIME LIVE VOICE TRANSCRIPT DISPLAY (REPLACES TYPING TEXTAREA) */}
              <div
                className={`w-full h-20 sm:h-22 md:h-24 p-2.5 rounded-xl bg-[#F8FCFF] border transition-all flex flex-col justify-between overflow-hidden shadow-2xs ${
                  isSpeaking
                    ? "border-[#90CAF9] bg-[#F4F9FF]"
                    : isListening
                    ? "border-[#2196F3] ring-2 ring-[#90CAF9]/40 bg-white"
                    : "border-[#90CAF9]"
                }`}
              >
                {/* Scrollable Transcript Text */}
                <div className="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm leading-relaxed">
                  {fullDisplayTranscript ? (
                    <div>
                      <span className="text-slate-800 font-medium whitespace-pre-wrap">
                        {userAnswer}
                      </span>
                      {interimTranscript && (
                        <span className="text-[#2196F3] italic font-medium ml-1">
                          {interimTranscript}
                        </span>
                      )}
                      {voiceState === "user_speaking" && (
                        <span className="inline-block w-1.5 h-3.5 bg-[#2196F3] ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <div className="h-full min-h-[60px] flex flex-col items-center justify-center text-center p-1">
                      {isGreeting ? (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="w-1 h-3 bg-[#2196F3] rounded-full animate-bounce" />
                            <span className="w-1 h-4 bg-[#0D47A1] rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1 h-2 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                          <span className="text-xs font-semibold text-[#0D47A1]">
                            {interviewerConfig.name} is introducing the interview...
                          </span>
                          <span className="text-[10px] text-slate-400">
                            First question will begin immediately after
                          </span>
                        </div>
                      ) : isSpeaking ? (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="w-1 h-3 bg-[#2196F3] rounded-full animate-bounce" />
                            <span className="w-1 h-4 bg-[#0D47A1] rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1 h-2 bg-[#2196F3] rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                          <span className="text-xs font-semibold text-[#0D47A1]">
                            {interviewerConfig.name} is speaking...
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Microphone will start automatically when speech ends
                          </span>
                        </div>
                      ) : isListening ? (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-pulse">
                            <Mic size={15} />
                          </div>
                          <span className="text-xs font-bold text-emerald-700">
                            Listening... Speak your answer now
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Your spoken answer appears here in real time
                          </span>
                        </div>
                      ) : isSubmitting ? (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <Loader2 size={18} className="animate-spin text-[#2196F3]" />
                          <span className="text-xs font-bold text-[#0D47A1]">
                            Evaluating your spoken answer...
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Scoring communication clarity and technical accuracy
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <Mic size={15} />
                          <span className="text-xs font-medium">
                            Voice-only answer mode active
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub-bar inside transcript box */}
                <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    {fullDisplayTranscript ? (
                      <button
                        type="button"
                        onClick={handleClearAnswer}
                        disabled={isSubmitting || isSpeaking || isGreeting}
                        className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-40"
                        title="Clear transcript and re-speak"
                      >
                        <RotateCcw size={11} />
                        <span>Re-speak Answer</span>
                      </button>
                    ) : (
                      <span className="text-slate-400">
                        {isListening ? "Auto-submits after 3s silence" : "Live Dictation"}
                      </span>
                    )}
                  </div>

                  <div className="text-slate-400 font-mono">
                    {userAnswer ? `${userAnswer.split(/\s+/).filter(Boolean).length} words` : ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Speak clearly · Voice is automatically captured & transcribed</span>
              {isSubmitting && (
                <span className="text-[#2196F3] font-bold flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Evaluating...
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
              disabled={!speechSupported || isSubmitting || isSpeaking || isGreeting}
              title={isListening ? "Mute microphone" : "Unmute microphone"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 ${
                isListening
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-300/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
              }`}
            >
              <Mic size={14} className={isListening ? "animate-pulse text-emerald-600" : "text-slate-500"} />
              <span className="hidden sm:inline">{isListening ? "Listening Active" : "Unmute Mic"}</span>
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
              onClick={handleRereadQuestion}
              disabled={isGreeting}
              title="Re-read question aloud"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#E3F2FD] text-[#0D47A1] text-xs font-bold border border-slate-200 hover:border-[#90CAF9] transition-colors cursor-pointer disabled:opacity-40"
            >
              <Volume2 size={14} className="text-[#2196F3]" />
              <span>{isSpeaking ? "Stop Voice" : "Re-read"}</span>
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
              <span>Voice Ready</span>
            </div>
          </div>

          {/* Right Primary Action: Done Speaking / Submit */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void submitAnswer()}
              disabled={
                !fullDisplayTranscript.trim() ||
                isSubmitting ||
                isTransitioning ||
                isPaused ||
                isCompleting ||
                isSpeaking ||
                isGreeting ||
                !currentQ ||
                answeredQuestionIdsRef.current.has(String(currentQ.question_id))
              }
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-[#2196F3] to-[#0D47A1] hover:from-[#1E88E5] hover:to-[#0B3D91] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isTransitioning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isTransitioning ? "Next Question..." : "Evaluating..."}</span>
                </>
              ) : (
                <>
                  <span>Done Speaking</span>
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
