import CommandPalette from '@/components/CommandPalette'
import { LogoIcon } from '@/components/LogoIcon'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart2,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  Clock,
  FileCheck,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Play,
  Settings,
  Sparkles,
  Sun,
  User as UserIcon,
  X
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

// Exactly the 5 requested main navigation items
const mainNavItems = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Interview', icon: Play, path: '/interview/setup' },
  { label: 'History', icon: Clock, path: '/interviews' },
  { label: 'Resume', icon: FileCheck, path: '/resume' },
  { label: 'Jobs', icon: Briefcase, path: '/job-analyzer' },
]

// Profile dropdown items as specified in requirements
const profileMenuItems = [
  { label: 'My Profile', icon: UserIcon, path: '/profile', color: '#8B5CF6' },
  { label: 'Analysis', icon: BarChart2, path: '/analysis', color: '#06B6D4' },
  { label: 'AI Insights', icon: Sparkles, path: '/ai-insights', color: '#8B5CF6' },
  { label: 'Job Analyzer', icon: Briefcase, path: '/job-analyzer', color: '#3B82F6' },
  { label: 'Settings', icon: Settings, path: '/settings', color: '#64748B' },
]

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const { user, logout } = useAuthStore()
  const { theme, toggle: toggleTheme } = useThemeStore()

  const navigate = useNavigate()
  const location = useLocation()

  const closePalette = useCallback(() => {
    setPaletteOpen(false)
  }, [])

  // Mutual exclusion toggles
  const toggleMobileDrawer = () => {
    setMobileOpen((prev) => {
      const next = !prev
      if (next) setProfileOpen(false)
      return next
    })
  }

  const toggleProfileDropdown = () => {
    setProfileOpen((prev) => {
      const next = !prev
      if (next) setMobileOpen(false)
      return next
    })
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target) &&
        !target.closest('.profile-trigger-btn')
      ) {
        setProfileOpen(false)
      }
    }

    if (profileOpen) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [profileOpen])

  // Keyboard accessibility: Escape to close dropdown/drawer, Ctrl+K for command palette
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        setMobileOpen(false)
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auto-close overlays on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }

    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const queryClient = useQueryClient()

  const handleLogout = () => {
    setProfileOpen(false)
    setMobileOpen(false)
    logout()
    try {
      queryClient.clear()
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('ib_candidate_profile_extra_')) {
          localStorage.removeItem(k)
        }
      })
    } catch {
      // ignore
    }
    navigate('/', { replace: true })
  }

  // Real authenticated user information — NO hardcoded data
  const displayName = user?.name ? user.name.trim() : 'User'
  const userEmail = user?.email || ''

  const userInitials = (() => {
    const parts = displayName.split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase()
  })()

  // Dynamic clean page title
  const getHeaderTitle = () => {
    if (pageTitle) return pageTitle
    const path = location.pathname

    if (path === '/dashboard') return 'Dashboard'
    if (path === '/interviews') return 'Interview History'
    if (path === '/profile') return 'My Profile'
    if (path === '/analysis' || path === '/progress') return 'Analysis'
    if (path === '/ai-insights') return 'AI Insights'
    if (path === '/practice') return 'Practice'
    if (path === '/reports') return 'Reports'
    if (path === '/settings') return 'Settings'
    if (path === '/resume') return 'Resume Intelligence'
    if (path === '/job-analyzer') return 'Job Analyzer'
    if (path === '/career-roadmap') return 'Career Roadmap'
    if (path.includes('/interview/setup')) return 'Interview Setup'
    if (path.includes('/interview/room')) return 'Live Interview'
    if (path.includes('/interview/complete')) return 'Interview Complete'

    return 'AI Interview Buddy'
  }

  return (
    <div className="app-layout">
      {/* =====================================================
          GLOBAL HORIZONTAL TOP NAVBAR
      ====================================================== */}
      <header className="global-top-navbar">
        {/* DESKTOP NAVBAR (>= 768px) */}
        <div className="navbar-container desktop-navbar-layout">
          {/* Brand Logo & Title */}
          <div className="navbar-brand-section">
            <NavLink to="/dashboard" className="navbar-brand-link">
              <div className="brand-badge-icon">
                <LogoIcon size={24} />
              </div>
              <div className="brand-text-wrap">
                <span className="brand-title">
                  AI Interview<span className="brand-title-accent"> Buddy</span>
                </span>
                <span className="brand-ai-pill">AI</span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Main Navigation (Exact 5 items: Dashboard, Interview, History, Resume, Jobs) */}
          <nav className="desktop-top-nav">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path === '/interviews' && location.pathname === '/reports')

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`voxa-top-nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Right: Theme Toggle & Profile Avatar ▼ */}
          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="navbar-icon-pill"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Profile Avatar Button with Dropdown Anchor */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={toggleProfileDropdown}
                className={`navbar-user-pill profile-trigger-btn${profileOpen ? ' active' : ''}`}
                title="Account & Profile"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="navbar-user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={displayName} />
                  ) : (
                    userInitials
                  )}
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.7,
                  }}
                />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    ref={profileDropdownRef}
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="profile-dropdown-card"
                    role="menu"
                    aria-label="User Profile Menu"
                  >
                    {/* User info: Real Name & Email */}
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={displayName} />
                        ) : (
                          userInitials
                        )}
                      </div>
                      <div className="profile-dropdown-user-details">
                        <div className="profile-dropdown-name">{displayName}</div>
                        {userEmail && (
                          <div className="profile-dropdown-email" title={userEmail}>
                            {userEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Specified Dropdown Items: My Profile, Analysis, AI Insights, Job Analyzer, Settings */}
                    <div className="profile-dropdown-menu-list">
                      {profileMenuItems.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              setProfileOpen(false)
                              navigate(item.path)
                            }}
                            className="profile-dropdown-menu-item"
                            role="menuitem"
                          >
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                <ItemIcon size={16} />
                              </span>
                              <span className="dropdown-item-text">{item.label}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="profile-dropdown-menu-item dropdown-logout-item"
                      role="menuitem"
                    >
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-icon icon-coral">
                          <LogOut size={16} />
                        </span>
                        <span className="dropdown-item-text">Logout</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* MOBILE NAVBAR (< 768px): [Logo] ... [☰] */}
        <div className="mobile-navbar-container">
          <NavLink to="/dashboard" className="navbar-brand-link">
            <div className="brand-badge-icon" style={{ width: 32, height: 32 }}>
              <LogoIcon size={22} />
            </div>
            <div className="brand-text-wrap">
              <span className="brand-title" style={{ fontSize: '0.95rem' }}>
                AI Interview<span className="brand-title-accent"> Buddy</span>
              </span>
              <span className="brand-ai-pill">AI</span>
            </div>
          </NavLink>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMobileDrawer}
              className={`mobile-header-btn${mobileOpen ? ' active' : ''}`}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              title="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE SUB-HEADER WITH SINGLE MAIN BACK BUTTON
      ====================================================== */}
      <div className="sub-header-bar">
        <div className="sub-header-container">
          <div className="sub-header-left">
            <button
              onClick={() => navigate(-1)}
              className="voxa-back-btn"
              aria-label="Go back"
              title="Go back"
            >
              <ChevronLeft size={18} />
              <span className="back-btn-text">Back</span>
            </button>

            <div>
              <h1 className="sub-header-title">{getHeaderTitle()}</h1>
            </div>
          </div>

          <div className="sub-header-right">
            <span className="status-live-pill">
              <span className="status-dot" />
              <span>AI Engine Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT VIEWPORT
      ====================================================== */}
      <main className="voxa-main-content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </main>

      {/* =====================================================
          RESPONSIVE MOBILE NAVIGATION DRAWER (< 768px)
      ====================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="mobile-drawer-backdrop"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="mobile-drawer-panel"
            >
              <div className="mobile-drawer-top">
                {/* Mobile Drawer Header */}
                <div className="mobile-drawer-header">
                  <div className="navbar-brand-link">
                    <div className="brand-badge-icon">
                      <LogoIcon size={24} />
                    </div>
                    <span className="brand-title">
                      AI Interview<span className="brand-title-accent"> Buddy</span>
                    </span>
                    <span className="brand-ai-pill">AI</span>
                  </div>

                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="mobile-close-btn"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Main Navigation (Dashboard, Interview, History, Resume, Jobs) */}
                <div className="mobile-menu-label">Navigation</div>
                <nav className="mobile-nav-list" style={{ marginBottom: '1.25rem' }}>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`mobile-nav-link${isActive ? ' active' : ''}`}
                      >
                        <div className="mobile-nav-item-icon">
                          <Icon size={18} />
                        </div>
                        <span className="mobile-nav-item-label">{item.label}</span>
                        {isActive && <span className="mobile-nav-active-dot" />}
                      </NavLink>
                    )
                  })}
                </nav>

                {/* Profile Section (My Profile, Analysis, AI Insights, Job Analyzer, Settings, Logout) */}
                <div className="mobile-menu-label">Profile & Tools</div>
                <nav className="mobile-nav-list">
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`mobile-nav-link${isActive ? ' active' : ''}`}
                      >
                        <div className="mobile-nav-item-icon">
                          <Icon size={18} />
                        </div>
                        <span className="mobile-nav-item-label">{item.label}</span>
                        {isActive && <span className="mobile-nav-active-dot" />}
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Footer: Theme & Logout */}
              <div className="mobile-drawer-footer">
                <button
                  onClick={() => {
                    toggleTheme()
                  }}
                  className="mobile-drawer-theme-btn"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={closePalette} />

      {/* =====================================================
          STYLES
      ====================================================== */}
      <style>{`
        .global-top-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background-color: var(--voxa-nav-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--voxa-nav-border);
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
        }

        .navbar-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0.65rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .navbar-brand-section {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .navbar-brand-link {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
        }

        .brand-badge-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #0B0F19;
          border: 1px solid rgba(139, 92, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
        }

        .brand-text-wrap {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--voxa-card-text);
          font-family: var(--font-sans);
        }

        .brand-title-accent {
          color: #8B5CF6;
        }

        .brand-ai-pill {
          font-size: 0.625rem;
          padding: 1px 6px;
          border-radius: 6px;
          background-color: rgba(139, 92, 246, 0.12);
          color: #8B5CF6;
          font-weight: 700;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        /* Desktop Top Navigation links */
        .desktop-top-nav {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .voxa-top-nav-link {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.16s ease;
          white-space: nowrap;
          min-height: 40px;
        }

        .voxa-top-nav-link:hover {
          color: var(--voxa-card-text);
          background-color: rgba(139, 92, 246, 0.08);
        }

        .voxa-top-nav-link.active {
          color: #8B5CF6;
          background-color: rgba(139, 92, 246, 0.12);
          font-weight: 600;
        }

        /* Right actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .navbar-icon-pill {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          border: 1px solid var(--voxa-card-border);
          background-color: var(--voxa-card-bg);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--voxa-card-text);
          transition: all 0.18s ease;
          flex-shrink: 0;
        }

        .navbar-icon-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
          color: #8B5CF6;
        }

        /* Desktop User Profile Button */
        .navbar-user-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.25rem 0.5rem 0.25rem 0.35rem;
          border-radius: 999px;
          background-color: var(--voxa-card-bg);
          border: 1px solid var(--voxa-card-border);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          color: var(--voxa-card-text);
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.18s ease;
          min-height: 44px;
        }

        .navbar-user-pill:hover,
        .navbar-user-pill.active {
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.12);
          color: #8B5CF6;
        }

        .navbar-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          color: #FFFFFF;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .navbar-user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Mobile Navbar Layout (< 768px) */
        .mobile-navbar-container {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 1rem;
          width: 100%;
          box-sizing: border-box;
        }

        .mobile-header-btn {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 10px;
          border: 1px solid var(--voxa-card-border);
          background-color: var(--voxa-card-bg);
          color: var(--voxa-card-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .mobile-header-btn:active,
        .mobile-header-btn.active {
          background-color: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          color: #8B5CF6;
        }

        /* Profile Dropdown UX */
        .profile-dropdown-card {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          background-color: var(--voxa-card-bg);
          border: 1px solid var(--voxa-card-border);
          border-radius: 18px;
          padding: 0.75rem;
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 100;
          transform-origin: top right;
        }

        .profile-dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 0.5rem 0.65rem;
        }

        .profile-dropdown-avatar {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          color: #FFFFFF;
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
          flex-shrink: 0;
        }

        .profile-dropdown-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-dropdown-user-details {
          min-width: 0;
          flex: 1;
        }

        .profile-dropdown-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--voxa-card-text);
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.2;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-dropdown-divider {
          height: 1px;
          background-color: var(--voxa-card-border);
          margin: 0.4rem 0;
        }

        .profile-dropdown-menu-list {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .profile-dropdown-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.65rem 0.75rem;
          min-height: 44px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: var(--voxa-card-text);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .profile-dropdown-menu-item:hover {
          background-color: rgba(139, 92, 246, 0.08);
          color: #8B5CF6;
        }

        .dropdown-item-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dropdown-item-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-coral {
          background-color: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        .dropdown-logout-item:hover {
          background-color: rgba(239, 68, 68, 0.08) !important;
          color: #EF4444 !important;
        }

        /* Page Sub-Header with Back Button */
        .sub-header-bar {
          background-color: transparent;
          padding: 0.85rem 1.5rem 0.4rem;
        }

        .sub-header-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .sub-header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .voxa-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          border: 1px solid var(--voxa-card-border);
          background-color: var(--voxa-card-bg);
          color: var(--voxa-card-text);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          min-height: 36px;
        }

        .voxa-back-btn:hover {
          transform: translateX(-2px);
          border-color: rgba(139, 92, 246, 0.4);
          color: #8B5CF6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);
        }

        .sub-header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--voxa-card-text);
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.2;
        }

        .sub-header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10B981;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .voxa-main-content {
          flex: 1;
          padding: 0.75rem 1.5rem 2.5rem;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* Mobile drawer elements */
        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 90;
        }

        .mobile-drawer-panel {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          width: min(310px, 85vw);
          background-color: var(--voxa-card-bg);
          z-index: 95;
          padding: 1.25rem 1.15rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 4px 0 32px rgba(0, 0, 0, 0.45);
          overflow-y: auto;
        }

        .mobile-drawer-top {
          display: flex;
          flex-direction: column;
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.15rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--voxa-card-border);
        }

        .mobile-close-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: 1px solid var(--voxa-card-border);
          color: var(--voxa-card-text);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mobile-close-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        .mobile-menu-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.65rem;
          padding-left: 0.5rem;
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          min-height: 44px;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.16s ease;
          position: relative;
        }

        .mobile-nav-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-nav-item-label {
          flex: 1;
        }

        .mobile-nav-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #FFFFFF;
          box-shadow: 0 0 8px #FFFFFF;
        }

        .mobile-nav-link:hover {
          background-color: rgba(139, 92, 246, 0.08);
          color: var(--voxa-card-text);
        }

        .mobile-nav-link.active {
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
        }

        .mobile-drawer-footer {
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 1px solid var(--voxa-card-border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-drawer-theme-btn {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          border-radius: 12px;
          border: 1px solid var(--voxa-card-border);
          background-color: var(--voxa-card-bg);
          color: var(--voxa-card-text);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mobile-drawer-theme-btn:hover {
          border-color: rgba(139, 92, 246, 0.3);
          color: #8B5CF6;
        }

        .mobile-logout-btn {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          border-radius: 12px;
          border: 1px solid var(--voxa-card-border);
          background-color: rgba(239, 68, 68, 0.06);
          color: #EF4444;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mobile-logout-btn:hover {
          background-color: #EF4444;
          color: #FFFFFF;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .desktop-navbar-layout {
            display: none !important;
          }
          .mobile-navbar-container {
            display: flex !important;
          }
          .sub-header-bar {
            padding: 0.75rem 1rem 0.25rem;
          }
          .voxa-main-content {
            padding: 0.75rem 1rem 2.5rem;
          }
        }
      `}</style>
    </div>
  )
}