import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EducationItem {
  id: string;
  college: string;
  degree: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  cgpa?: string;
  level?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface LanguageItem {
  id?: string;
  language: string;
  proficiency: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  headline?: string;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  avatar?: string;
  college?: string;
  company?: string;
  targetRole?: string;
  target_role?: string;
  experience?: string;
  careerObjective?: string;
  career_objective?: string;
  about?: string;
  preferredJobType?: string;
  preferred_job_type?: string;
  preferredLocation?: string;
  preferred_location?: string;
  degree?: string;
  fieldOfStudy?: string;
  field_of_study?: string;
  graduationYear?: string;
  graduation_year?: string;
  cgpa?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  resumeFilename?: string;
  resume_filename?: string;
  resumeUploadedAt?: string;
  resume_uploaded_at?: string;
  educations?: EducationItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  languages?: LanguageItem[];
  profileComplete?: boolean;
  profile_complete?: boolean;
  profileCompletion?: number;
  profile_completion?: number;
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  login: (
    user: User,
    token: string,
    refreshToken?: string,
  ) => void

  logout: () => void

  updateUser: (
    data: Partial<User>,
  ) => void

  setAuth: (
    user: User,
    token: string,
    refreshToken?: string,
  ) => void
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        // ======================================================
        // INITIAL STATE
        // ======================================================

        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,

        // ======================================================
        // LOGIN
        // ======================================================

        login: (
          user,
          token,
          refreshToken = undefined,
        ) =>
          set({
            user,
            token,
            refreshToken:
              refreshToken ?? null,
            isAuthenticated: true,
          }),

        // ======================================================
        // SET AUTH
        // ======================================================

        setAuth: (
          user,
          token,
          refreshToken = undefined,
        ) =>
          set({
            user,
            token,
            refreshToken:
              refreshToken ?? null,
            isAuthenticated: true,
          }),

        // ======================================================
        // LOGOUT
        // ======================================================

        logout: () =>
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          }),

        // ======================================================
        // UPDATE USER
        // ======================================================

        updateUser: (data) =>
          set((state) => ({
            user: state.user
              ? {
                ...state.user,
                ...data,
              }
              : null,
          })),
      }),
      {
        name: 'ib-auth',
      },
    ),
  )