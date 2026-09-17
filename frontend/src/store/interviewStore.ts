import { create } from 'zustand'

export type InterviewState = 'idle' | 'setup' | 'running' | 'paused' | 'complete'
export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface Question {
  id: string
  text: string
  type: 'technical' | 'behavioral' | 'coding' | 'hr' | 'followup'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  topic: string
}

export interface Answer {
  questionId: string
  text: string
  audioUrl?: string
  duration: number
  score?: number
  evaluation?: {
    accuracy: number
    depth: number
    relevance: number
    completeness: number
    communication: number
    feedback: string
    strengths: string[]
    improvements: string[]
    suggestedAnswer: string
  }
}

export interface InterviewConfig {
  role: string
  type: string
  difficulty: string
  duration: number
  mode: 'text' | 'voice' | 'video'
  personality: string
  resumeId?: string
  jobId?: string
}

export interface InterviewSession {
  id: string
  config: InterviewConfig
  questions: Question[]
  answers: Answer[]
  currentQuestionIndex: number
  startTime: Date
  endTime?: Date
  scores?: {
    overall: number
    technical: number
    communication: number
    confidence: number
    clarity: number
    problemSolving: number
    behavioral: number
  }
}

interface InterviewStore {
  session: InterviewSession | null
  interviewState: InterviewState
  aiState: AIState
  transcript: { role: 'ai' | 'user'; text: string; timestamp: Date }[]
  isRecording: boolean

  startInterview: (config: InterviewConfig) => void
  setAIState: (state: AIState) => void
  addQuestion: (q: Question) => void
  submitAnswer: (answer: Answer) => void
  nextQuestion: () => void
  completeInterview: () => void
  addTranscript: (role: 'ai' | 'user', text: string) => void
  setRecording: (v: boolean) => void
  resetInterview: () => void
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  session: null,
  interviewState: 'idle',
  aiState: 'idle',
  transcript: [],
  isRecording: false,

  startInterview: (config) => {
    const session: InterviewSession = {
      id: `interview-${Date.now()}`,
      config,
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      startTime: new Date(),
    }
    set({ session, interviewState: 'running', transcript: [] })
  },

  setAIState: (aiState) => set({ aiState }),

  addQuestion: (q) => set((state) => ({
    session: state.session ? {
      ...state.session,
      questions: [...state.session.questions, q],
    } : null,
  })),

  submitAnswer: (answer) => set((state) => ({
    session: state.session ? {
      ...state.session,
      answers: [...state.session.answers, answer],
    } : null,
  })),

  nextQuestion: () => set((state) => ({
    session: state.session ? {
      ...state.session,
      currentQuestionIndex: state.session.currentQuestionIndex + 1,
    } : null,
  })),

  completeInterview: () => {
    const { session } = get()
    if (!session) return
    set({
      session: { ...session, endTime: new Date() },
      interviewState: 'complete',
      aiState: 'idle',
      isRecording: false,
    })
  },

  addTranscript: (role, text) => set((state) => ({
    transcript: [...state.transcript, { role, text, timestamp: new Date() }],
  })),

  setRecording: (isRecording) => set({ isRecording }),

  resetInterview: () => set({
    session: null,
    interviewState: 'idle',
    aiState: 'idle',
    transcript: [],
    isRecording: false,
  }),
}))
