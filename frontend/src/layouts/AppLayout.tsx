import CommandPalette from "@/components/CommandPalette";
import { LogoIcon } from "@/components/LogoIcon";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
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
  Play,
  Settings,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

// ============================================================
// Main Navigation
// ============================================================

const mainNavItems = [
  { label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { label: "Interview", icon: Play, path: "/interview/setup" },
  { label: "History", icon: Clock, path: "/interviews" },
  { label: "Resume", icon: FileCheck, path: "/resume" },
  { label: "Jobs", icon: Briefcase, path: "/job-analyzer" },
];

// ============================================================
// Profile Dropdown
// ============================================================

const profileMenuItems = [
  {
    label: "My Profile",
    icon: UserIcon,
    path: "/profile",
  },
  {
    label: "Analysis",
    icon: BarChart2,
    path: "/analysis",
  },
  {
    label: "AI Insights",
    icon: Sparkles,
    path: "/ai-insights",
  },
  {
    label: "Job Analyzer",
    icon: Briefcase,
    path: "/job-analyzer",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // Command Palette
  // ============================================================

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
  }, []);

  // ============================================================
  // Mobile / Profile Toggles
  // ============================================================

  const toggleMobileDrawer = () => {
    setMobileOpen((prev) => {
      const next = !prev;

      if (next) {
        setProfileOpen(false);
      }

      return next;
    });
  };

  const toggleProfileDropdown = () => {
    setProfileOpen((prev) => {
      const next = !prev;

      if (next) {
        setMobileOpen(false);
      }

      return next;
    });
  };

  // ============================================================
  // Close Profile Dropdown When Clicking Outside
  // ============================================================

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target) &&
        !target.closest(".profile-trigger-btn")
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handler);

      return () => {
        document.removeEventListener("mousedown", handler);
      };
    }
  }, [profileOpen]);

  // ============================================================
  // Keyboard Accessibility
  // ============================================================

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
        setPaletteOpen(false);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  // ============================================================
  // Close Overlays On Route Change
  // ============================================================

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // ============================================================
  // Close Mobile Drawer On Desktop Resize
  // ============================================================

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);

    logout();

    try {
      queryClient.clear();

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("ib_candidate_profile_extra_")) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore local storage errors
    }

    navigate("/", { replace: true });
  };

  // ============================================================
  // Real User Information
  // ============================================================

  const displayName = user?.name?.trim() || "User";
  const userEmail = user?.email || "";

  const userInitials = (() => {
    const parts = displayName.split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return displayName.slice(0, 2).toUpperCase();
  })();

  // ============================================================
  // Dynamic Page Title
  // ============================================================

  const getHeaderTitle = () => {
    if (pageTitle) return pageTitle;

    const path = location.pathname;

    if (path === "/dashboard") return "Dashboard";
    if (path === "/interviews") return "Interview History";
    if (path === "/profile") return "My Profile";
    if (path === "/analysis" || path === "/progress") {
      return "Analysis";
    }
    if (path === "/ai-insights") return "AI Insights";
    if (path === "/practice") return "Practice";
    if (path === "/reports") return "Reports";
    if (path === "/settings") return "Settings";
    if (path === "/resume") return "Resume Intelligence";
    if (path === "/job-analyzer") return "Job Analyzer";
    if (path === "/career-roadmap") return "Career Roadmap";
    if (path.includes("/interview/setup")) {
      return "Interview Setup";
    }
    if (path.includes("/interview/room")) {
      return "Live Interview";
    }
    if (path.includes("/interview/complete")) {
      return "Interview Complete";
    }

    return "AI Interview Buddy";
  };

  return (
    <div className="app-layout">
      {/* =====================================================
          GLOBAL HORIZONTAL TOP NAVBAR
      ====================================================== */}

      <header className="global-top-navbar">
        {/* =====================================================
            DESKTOP NAVBAR
        ====================================================== */}

        <div className="navbar-container desktop-navbar-layout">
          {/* Brand */}

          <div className="navbar-brand-section">
            <NavLink to="/dashboard" className="navbar-brand-link">
              <div className="brand-badge-icon">
                <LogoIcon size={24} />
              </div>

              <div className="brand-text-wrap">
                <span className="brand-title">
                  AI Interview
                  <span className="brand-title-accent"> Buddy</span>
                </span>

                <span className="brand-ai-pill">AI</span>
              </div>
            </NavLink>
          </div>

          {/* Main Navigation */}

          <nav className="desktop-top-nav" aria-label="Main navigation">
            {mainNavItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path ||
                (item.path === "/interviews" &&
                  location.pathname === "/reports");

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`voxa-top-nav-link${isActive ? " active" : ""}`}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}

          <div className="navbar-actions">
            {/* Profile */}

            <div className="profile-anchor">
              <button
                onClick={toggleProfileDropdown}
                className={`navbar-user-pill profile-trigger-btn${
                  profileOpen ? " active" : ""
                }`}
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
                  className="profile-chevron"
                  style={{
                    transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================== */}

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    ref={profileDropdownRef}
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      y: -6,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      y: -6,
                    }}
                    transition={{
                      duration: 0.18,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="profile-dropdown-card"
                    role="menu"
                    aria-label="User Profile Menu"
                  >
                    {/* User Information */}

                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={displayName} />
                        ) : (
                          userInitials
                        )}
                      </div>

                      <div className="profile-dropdown-user-details">
                        <div className="profile-dropdown-name">
                          {displayName}
                        </div>

                        {userEmail && (
                          <div
                            className="profile-dropdown-email"
                            title={userEmail}
                          >
                            {userEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Profile Menu */}

                    <div className="profile-dropdown-menu-list">
                      {profileMenuItems.map((item) => {
                        const ItemIcon = item.icon;

                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              setProfileOpen(false);
                              navigate(item.path);
                            }}
                            className="profile-dropdown-menu-item"
                            role="menuitem"
                          >
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-icon">
                                <ItemIcon size={16} />
                              </span>

                              <span className="dropdown-item-text">
                                {item.label}
                              </span>
                            </div>
                          </button>
                        );
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
                        <span className="dropdown-item-icon">
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

        {/* =====================================================
            MOBILE NAVBAR
        ====================================================== */}

        <div className="mobile-navbar-container">
          <NavLink to="/dashboard" className="navbar-brand-link">
            <div
              className="brand-badge-icon"
              style={{
                width: 32,
                height: 32,
              }}
            >
              <LogoIcon size={22} />
            </div>

            <div className="brand-text-wrap">
              <span className="brand-title" style={{ fontSize: "0.95rem" }}>
                AI Interview
                <span className="brand-title-accent"> Buddy</span>
              </span>

              <span className="brand-ai-pill">AI</span>
            </div>
          </NavLink>

          <div className="mobile-actions">
            <button
              onClick={toggleMobileDrawer}
              className={`mobile-header-btn${mobileOpen ? " active" : ""}`}
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
              title="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE SUB HEADER
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
          MAIN CONTENT
      ====================================================== */}

      <main className="voxa-main-content">
        <motion.div
          key={location.pathname}
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          style={{ width: "100%" }}
        >
          {children}
        </motion.div>
      </main>

      {/* =====================================================
          MOBILE NAVIGATION DRAWER
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

            {/* Drawer */}

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
              }}
              className="mobile-drawer-panel"
            >
              <div className="mobile-drawer-top">
                {/* Drawer Header */}

                <div className="mobile-drawer-header">
                  <div className="navbar-brand-link">
                    <div className="brand-badge-icon">
                      <LogoIcon size={24} />
                    </div>

                    <span className="brand-title">
                      AI Interview
                      <span className="brand-title-accent"> Buddy</span>
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

                {/* Main Navigation */}

                <div className="mobile-menu-label">Navigation</div>

                <nav
                  className="mobile-nav-list"
                  style={{
                    marginBottom: "1.25rem",
                  }}
                >
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;

                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`mobile-nav-link${
                          isActive ? " active" : ""
                        }`}
                      >
                        <div className="mobile-nav-item-icon">
                          <Icon size={18} />
                        </div>

                        <span className="mobile-nav-item-label">
                          {item.label}
                        </span>

                        {isActive && <span className="mobile-nav-active-dot" />}
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Profile & Tools */}

                <div className="mobile-menu-label">Profile & Tools</div>

                <nav className="mobile-nav-list">
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;

                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`mobile-nav-link${
                          isActive ? " active" : ""
                        }`}
                      >
                        <div className="mobile-nav-item-icon">
                          <Icon size={18} />
                        </div>

                        <span className="mobile-nav-item-label">
                          {item.label}
                        </span>

                        {isActive && <span className="mobile-nav-active-dot" />}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}

              <div className="mobile-drawer-footer">
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
        /* =====================================================
           COLOR SYSTEM
        ====================================================== */

        :root {
          --blue-50: #E3F2FD;
          --blue-200: #90CAF9;
          --blue-500: #2196F3;
          --blue-900: #0D47A1;

          --white: #FFFFFF;
          --transparent: transparent;

          --shadow-blue: rgba(33, 150, 243, 0.20);
          --shadow-deep-blue: rgba(13, 71, 161, 0.25);

          --border-blue: rgba(33, 150, 243, 0.22);
          --border-light-blue: rgba(144, 202, 249, 0.35);
        }

        /* =====================================================
           MAIN LAYOUT
        ====================================================== */

        .app-layout {
          min-height: 100vh;
          width: 100%;
          position: relative;

          background-color: var(--blue-50);
          color: var(--blue-900);
        }

        /* =====================================================
           TOP NAVBAR
        ====================================================== */

        .global-top-navbar {
          position: sticky;
          top: 0;
          z-index: 50;

          width: 100%;

          background-color: var(--white);

          border-bottom: 1px solid var(--border-light-blue);

          box-shadow:
            0 4px 20px rgba(13, 71, 161, 0.10);
        }

        .navbar-container {
          max-width: 1440px;

          margin: 0 auto;

          min-height: 68px;

          padding: 0.65rem 1.5rem;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 1.5rem;

          box-sizing: border-box;
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

        /* =====================================================
           BRAND
        ====================================================== */

        .brand-badge-icon {
          width: 36px;
          height: 36px;

          border-radius: 10px;

          background: linear-gradient(
            135deg,
            var(--blue-500),
            var(--blue-900)
          );

          border: 1px solid var(--blue-200);

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: var(--white);

          box-shadow:
            0 4px 14px var(--shadow-blue);
        }

        .brand-text-wrap {
          display: flex;
          align-items: center;

          gap: 0.35rem;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 750;

          letter-spacing: -0.025em;

          color: var(--blue-900);

          font-family: var(--font-sans);

          white-space: nowrap;
        }

        .brand-title-accent {
          color: var(--blue-500);
        }

        .brand-ai-pill {
          font-size: 0.625rem;
          line-height: 1;

          padding: 4px 6px;

          border-radius: 5px;

          background-color: var(--blue-50);

          color: var(--blue-900);

          font-weight: 700;

          border: 1px solid var(--blue-200);
        }

        /* =====================================================
           DESKTOP NAVIGATION
        ====================================================== */

        .desktop-top-nav {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 0.25rem;

          flex: 1;
        }

        .voxa-top-nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 0.45rem;

          padding: 0.45rem 0.85rem;

          min-height: 40px;

          border-radius: 9px;

          color: var(--blue-900);

          text-decoration: none;

          font-size: 0.84rem;
          font-weight: 550;

          transition:
            background-color 0.16s ease,
            color 0.16s ease,
            transform 0.16s ease,
            box-shadow 0.16s ease;

          white-space: nowrap;
        }

        .voxa-top-nav-link:hover {
          color: var(--blue-900);

          background-color: var(--blue-50);

          box-shadow:
            0 3px 10px rgba(33, 150, 243, 0.08);
        }

        .voxa-top-nav-link.active {
          color: var(--white);

          background: linear-gradient(
            135deg,
            var(--blue-500),
            var(--blue-900)
          );

          font-weight: 650;

          box-shadow:
            0 5px 14px var(--shadow-blue);
        }

        /* =====================================================
           RIGHT ACTIONS
        ====================================================== */

        .navbar-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 0.6rem;

          flex-shrink: 0;
        }

        /* =====================================================
           PROFILE
        ====================================================== */

        .profile-anchor {
          position: relative;
        }

        .navbar-user-pill {
          display: flex;
          align-items: center;

          gap: 0.45rem;

          padding: 0.25rem 0.55rem 0.25rem 0.3rem;

          min-height: 42px;

          border-radius: 999px;

          background-color: var(--white);

          border: 1px solid var(--border-light-blue);

          color: var(--blue-900);

          font-weight: 600;
          font-size: 0.8125rem;

          cursor: pointer;

          transition:
            border-color 0.18s ease,
            background-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .navbar-user-pill:hover,
        .navbar-user-pill.active {
          background-color: var(--blue-50);

          border-color: var(--blue-200);

          box-shadow:
            0 4px 16px rgba(13, 71, 161, 0.12);
        }

        .navbar-user-avatar {
          width: 32px;
          height: 32px;

          border-radius: 50%;

          overflow: hidden;

          background: linear-gradient(
            135deg,
            var(--blue-500),
            var(--blue-900)
          );

          color: var(--white);

          font-size: 0.78rem;
          font-weight: 700;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border: 1px solid var(--blue-200);
        }

        .navbar-user-avatar img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .profile-chevron {
          color: var(--blue-900);

          transition: transform 0.2s ease;
        }

        /* =====================================================
           PROFILE DROPDOWN
        ====================================================== */

        .profile-dropdown-card {
          position: absolute;

          top: calc(100% + 10px);
          right: 0;

          width: 290px;

          box-sizing: border-box;

          background: var(--white);

          border: 1px solid var(--border-light-blue);

          border-radius: 14px;

          padding: 0.7rem;

          box-shadow:
            0 24px 60px rgba(13, 71, 161, 0.18),
            0 10px 30px rgba(33, 150, 243, 0.10);

          z-index: 100;

          transform-origin: top right;

          opacity: 1;
        }

        .profile-dropdown-header {
          display: flex;
          align-items: center;

          gap: 0.75rem;

          padding: 0.45rem 0.5rem 0.7rem;
        }

        .profile-dropdown-avatar {
          width: 42px;
          height: 42px;

          min-width: 42px;

          border-radius: 50%;

          background: linear-gradient(
            135deg,
            var(--blue-500),
            var(--blue-900)
          );

          color: var(--white);

          font-size: 0.84rem;
          font-weight: 700;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          box-shadow:
            0 5px 16px rgba(13, 71, 161, 0.20);

          flex-shrink: 0;

          border: 1px solid var(--blue-200);
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
          font-size: 0.925rem;
          font-weight: 700;

          color: var(--blue-900);

          line-height: 1.25;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-dropdown-email {
          font-size: 0.72rem;

          color: var(--blue-500);

          line-height: 1.25;

          margin-top: 4px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-dropdown-divider {
          height: 1px;

          background-color: var(--blue-50);

          margin: 0.4rem 0.2rem;
        }

        .profile-dropdown-menu-list {
          display: flex;
          flex-direction: column;

          gap: 0.15rem;
        }

        .profile-dropdown-menu-item {
          display: flex;
          align-items: center;

          width: 100%;

          min-height: 44px;

          padding: 0.55rem 0.65rem;

          box-sizing: border-box;

          border-radius: 9px;

          border: 1px solid transparent;

          background: transparent;

          color: var(--blue-900);

          font-size: 0.85rem;
          font-weight: 500;

          cursor: pointer;

          text-decoration: none;

          transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
        }

        .profile-dropdown-menu-item:hover {
          background-color: var(--blue-50);

          border-color: var(--blue-200);

          color: var(--blue-900);
        }

        .dropdown-item-content {
          display: flex;
          align-items: center;

          gap: 0.7rem;

          width: 100%;
        }

        .dropdown-item-icon {
          width: 30px;
          height: 30px;

          border-radius: 8px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          background-color: var(--blue-50);

          color: var(--blue-500);
        }

        .dropdown-item-text {
          line-height: 1;
        }

        .dropdown-logout-item:hover {
          background-color: var(--blue-50) !important;

          border-color: var(--blue-200);

          color: var(--blue-900) !important;
        }

        /* =====================================================
           SUB HEADER
        ====================================================== */

        .sub-header-bar {
          background-color: transparent;

          padding: 0.95rem 1.5rem 0.45rem;
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

          min-width: 0;
        }

        .voxa-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 0.4rem;

          min-height: 36px;

          padding: 0.4rem 0.8rem;

          border-radius: 9px;

          border: 1px solid var(--border-light-blue);

          background-color: var(--white);

          color: var(--blue-900);

          font-size: 0.8rem;
          font-weight: 600;

          cursor: pointer;

          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            background-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .voxa-back-btn:hover {
          transform: translateX(-2px);

          background-color: var(--blue-50);

          border-color: var(--blue-200);

          color: var(--blue-900);

          box-shadow:
            0 4px 12px rgba(33, 150, 243, 0.10);
        }

        .sub-header-title {
          font-size: 1.25rem;
          font-weight: 700;

          color: var(--blue-900);

          letter-spacing: -0.025em;

          margin: 0;

          line-height: 1.2;
        }

        .sub-header-right {
          display: flex;
          align-items: center;

          gap: 0.5rem;
        }

        /* =====================================================
           AI ENGINE STATUS
        ====================================================== */

        .status-live-pill {
          display: inline-flex;
          align-items: center;

          gap: 0.42rem;

          padding: 0.34rem 0.7rem;

          border-radius: 999px;

          background-color: var(--blue-50);

          border: 1px solid var(--blue-200);

          color: var(--blue-900);

          font-size: 0.72rem;
          font-weight: 600;

          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background-color: var(--blue-500);

          box-shadow:
            0 0 7px rgba(33, 150, 243, 0.65);
        }

        /* =====================================================
           MAIN CONTENT
        ====================================================== */

        .voxa-main-content {
          flex: 1;

          padding: 0.75rem 1.5rem 2.75rem;

          max-width: 1440px;

          width: 100%;

          margin: 0 auto;

          box-sizing: border-box;
        }

        /* =====================================================
           MOBILE NAVBAR
        ====================================================== */

        .mobile-navbar-container {
          display: none;

          align-items: center;
          justify-content: space-between;

          padding: 0.65rem 1rem;

          width: 100%;

          min-height: 62px;

          box-sizing: border-box;
        }

        .mobile-actions {
          display: flex;
          align-items: center;

          gap: 0.5rem;
        }

        .mobile-header-btn {
          width: 42px;
          height: 42px;

          min-width: 42px;

          border-radius: 10px;

          border: 1px solid var(--border-light-blue);

          background-color: var(--white);

          color: var(--blue-900);

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .mobile-header-btn:hover,
        .mobile-header-btn.active {
          background-color: var(--blue-50);

          border-color: var(--blue-200);

          color: var(--blue-900);

          box-shadow:
            0 4px 12px rgba(33, 150, 243, 0.10);
        }

        /* =====================================================
           MOBILE DRAWER
        ====================================================== */

        .mobile-drawer-backdrop {
          position: fixed;

          inset: 0;

          background-color: rgba(13, 71, 161, 0.35);

          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);

          z-index: 90;
        }

        .mobile-drawer-panel {
          position: fixed;

          top: 0;
          bottom: 0;
          left: 0;

          width: min(320px, 86vw);

          background-color: var(--white);

          z-index: 95;

          padding: 1.2rem 1.05rem;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          box-shadow:
            8px 0 35px rgba(13, 71, 161, 0.18);

          overflow-y: auto;

          box-sizing: border-box;
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

          border-bottom: 1px solid var(--blue-50);
        }

        .mobile-close-btn {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          border: 1px solid var(--border-light-blue);

          background-color: var(--blue-50);

          color: var(--blue-900);

          cursor: pointer;

          transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
        }

        .mobile-close-btn:hover {
          background-color: var(--blue-200);

          border-color: var(--blue-500);

          color: var(--blue-900);
        }

        .mobile-menu-label {
          font-size: 0.68rem;
          font-weight: 700;

          color: var(--blue-500);

          text-transform: uppercase;

          letter-spacing: 0.08em;

          margin-bottom: 0.6rem;

          padding-left: 0.45rem;
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;

          gap: 0.25rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;

          gap: 0.75rem;

          min-height: 44px;

          padding: 0.65rem 0.75rem;

          border-radius: 9px;

          color: var(--blue-900);

          text-decoration: none;

          font-size: 0.85rem;

          font-weight: 500;

          transition:
            background-color 0.16s ease,
            color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .mobile-nav-item-icon {
          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: var(--blue-500);
        }

        .mobile-nav-item-label {
          flex: 1;
        }

        .mobile-nav-active-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background-color: var(--white);

          box-shadow:
            0 0 7px rgba(255, 255, 255, 0.8);
        }

        .mobile-nav-link:hover {
          background-color: var(--blue-50);

          color: var(--blue-900);
        }

        .mobile-nav-link.active {
          background: linear-gradient(
            135deg,
            var(--blue-500),
            var(--blue-900)
          );

          color: var(--white);

          font-weight: 600;

          box-shadow:
            0 6px 18px var(--shadow-blue);
        }

        .mobile-nav-link.active .mobile-nav-item-icon {
          color: var(--white);
        }

        /* =====================================================
           MOBILE FOOTER
        ====================================================== */

        .mobile-drawer-footer {
          padding-top: 1rem;

          margin-top: 1rem;

          border-top: 1px solid var(--blue-50);

          display: flex;
          flex-direction: column;

          gap: 0.5rem;
        }

        .mobile-logout-btn {
          width: 100%;

          min-height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 0.5rem;

          padding: 0.6rem;

          border-radius: 9px;

          border: 1px solid var(--blue-200);

          background-color: var(--blue-50);

          color: var(--blue-900);

          font-size: 0.84rem;

          font-weight: 600;

          cursor: pointer;

          transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .mobile-logout-btn:hover {
          background-color: var(--blue-500);

          border-color: var(--blue-500);

          color: var(--white);

          box-shadow:
            0 5px 14px var(--shadow-blue);
        }

        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1100px) {
          .desktop-top-nav {
            gap: 0.1rem;
          }

          .voxa-top-nav-link {
            padding-left: 0.65rem;
            padding-right: 0.65rem;
          }

          .navbar-container {
            gap: 0.75rem;
          }
        }

        @media (max-width: 900px) {
          .brand-title {
            font-size: 0.98rem;
          }

          .voxa-top-nav-link {
            font-size: 0.78rem;
          }

          .desktop-top-nav {
            gap: 0;
          }
        }

        @media (max-width: 768px) {
          .desktop-navbar-layout {
            display: none !important;
          }

          .mobile-navbar-container {
            display: flex !important;
          }

          .sub-header-bar {
            padding: 0.75rem 1rem 0.3rem;
          }

          .sub-header-container {
            gap: 0.65rem;
          }

          .sub-header-title {
            font-size: 1.1rem;
          }

          .voxa-main-content {
            padding: 0.75rem 1rem 2.5rem;
          }

          .status-live-pill {
            font-size: 0.68rem;

            padding: 0.3rem 0.6rem;
          }

          .profile-dropdown-card {
            position: fixed;

            top: 70px;
            right: 12px;

            width: min(
              290px,
              calc(100vw - 24px)
            );
          }
        }

        @media (max-width: 480px) {
          .brand-title {
            font-size: 0.9rem;
          }

          .brand-ai-pill {
            display: none;
          }

          .back-btn-text {
            display: none;
          }

          .voxa-back-btn {
            width: 36px;

            padding: 0;
          }

          .sub-header-right {
            margin-left: auto;
          }

          .status-live-pill span:last-child {
            display: none;
          }

          .mobile-drawer-panel {
            width: min(300px, 88vw);
          }
        }
      `}</style>
    </div>
  );
}
