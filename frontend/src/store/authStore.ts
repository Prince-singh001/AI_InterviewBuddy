import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  college?: string
  company?: string
  targetRole?: string
  experience?: string
  skills?: string[]
  github?: string
  linkedin?: string
  portfolio?: string
  profileComplete?: boolean
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