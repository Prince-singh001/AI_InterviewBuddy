import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
    root.classList.remove('dark')
  } else {
    root.classList.add('dark')
    root.classList.remove('light')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light' as Theme,
      setTheme: (t) => {
        applyTheme(t)
        set({ theme: t })
      },
      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    { name: 'ib-theme' }
  )
)

/** Call once at app startup to restore persisted theme before first paint. */
export function initTheme() {
  try {
    const stored = localStorage.getItem('ib-theme')
    const parsed = stored ? JSON.parse(stored) : null
    const theme: Theme = parsed?.state?.theme === 'dark' ? 'dark' : 'light'
    applyTheme(theme)
  } catch {
    applyTheme('light')
  }
}
