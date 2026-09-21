import CommandPalette from "@/components/CommandPalette";
import { LogoIcon } from "@/components/LogoIcon";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  BookOpen,
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
  {
    label: "Dashboard",
    icon: LayoutGrid,
    path: "/dashboard",
  },
  {
    label: "Interview",
    icon: Play,
    path: "/interview/setup",
  },
  {
    label: "Practice",
    icon: BookOpen,
    path: "/practice",
  },
  {
    label: "History",
    icon: Clock,
    path: "/interviews",
  },
  {
    label: "Resume",
    icon: FileCheck,
    path: "/resume",
  },
  {
    label: "Jobs",
    icon: Briefcase,
    path: "/job-analyzer",
  },
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
  // Close Profile Dropdown Outside
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
      // Ignore localStorage errors
    }

    navigate("/", { replace: true });
  };

  // ============================================================
  // User Information
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
  // Active Navigation
  // ============================================================

  const isNavItemActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    if (path === "/interview/setup") {
      return location.pathname.startsWith("/interview");
    }

    if (path === "/interviews") {
      return (
        location.pathname === "/interviews" || location.pathname === "/reports"
      );
    }

    return location.pathname === path;
  };

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
    if (path === "/practice") return "Practice Center";
    if (path === "/reports") return "Reports";
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
      {/* ======================================================
          TOP NAVBAR
      ====================================================== */}

      <header className="global-top-navbar">
        {/* ====================================================
            DESKTOP NAVBAR
        ==================================================== */}

        <div className="navbar-container desktop-navbar-layout">
          {/* Brand */}

          <div className="navbar-brand-section">
            <NavLink to="/dashboard" className="navbar-brand-link">
              <div className="brand-badge-icon">
                <LogoIcon size={23} />
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
              const isActive = isNavItemActive(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`voxa-top-nav-link${isActive ? " active" : ""}`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.4 : 2} />

                  <span>{item.label}</span>

                  {item.label === "Practice" && (
                    <span className="practice-new-badge">NEW</span>
                  )}
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

                <ChevronDown size={14} className="profile-chevron" />
              </button>

              {/* Profile Dropdown */}

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    ref={profileDropdownRef}
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.18,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="profile-dropdown-card"
                    role="menu"
                  >
                    {/* User */}

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
                            <span className="dropdown-item-icon">
                              <ItemIcon size={16} />
                            </span>

                            <span className="dropdown-item-text">
                              {item.label}
                            </span>
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
                      <span className="dropdown-item-icon">
                        <LogOut size={16} />
                      </span>

                      <span className="dropdown-item-text">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ====================================================
            MOBILE NAVBAR
        ==================================================== */}

        <div className="mobile-navbar-container">
          <NavLink to="/dashboard" className="navbar-brand-link">
            <div
              className="brand-badge-icon"
              style={{
                width: 32,
                height: 32,
              }}
            >
              <LogoIcon size={21} />
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
              onClick={() => navigate("/practice")}
              className="mobile-practice-btn"
              aria-label="Open Practice"
              title="Practice"
            >
              <BookOpen size={18} />
            </button>

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

      {/* ======================================================
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

              {location.pathname === "/practice" && (
                <p className="sub-header-description">
                  Practice interview questions and improve your skills
                </p>
              )}
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

      {/* ======================================================
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
          style={{
            width: "100%",
          }}
        >
          {children}
        </motion.div>
      </main>

      {/* ======================================================
          MOBILE DRAWER
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
                      <LogoIcon size={23} />
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

                <nav className="mobile-nav-list">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(item.path);

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

                        {item.label === "Practice" && (
                          <span className="mobile-practice-badge">NEW</span>
                        )}

                        {isActive && <span className="mobile-nav-active-dot" />}
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Profile */}

                <div
                  className="mobile-menu-label"
                  style={{
                    marginTop: "1.35rem",
                  }}
                >
                  Profile & Tools
                </div>

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
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/practice");
                  }}
                  className="mobile-drawer-practice-btn"
                >
                  <BookOpen size={16} />
                  <span>Practice Center</span>
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

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`

        /* ====================================================
           COLOR SYSTEM
        ==================================================== */

        :root {
          --blue-50: #E3F2FD;
          --blue-200: #90CAF9;
          --blue-500: #2196F3;
          --blue-900: #0D47A1;

          --white: #FFFFFF;

          --shadow-blue:
            rgba(33, 150, 243, 0.20);

          --shadow-deep-blue:
            rgba(13, 71, 161, 0.25);

          --border-blue:
            rgba(33, 150, 243, 0.22);

          --border-light-blue:
            rgba(144, 202, 249, 0.38);
        }

        /* ====================================================
           MAIN LAYOUT
        ==================================================== */

        .app-layout {
          min-height: 100vh;
          width: 100%;
          position: relative;

          background:
            linear-gradient(
              180deg,
              #E3F2FD 0%,
              #F7FBFF 35%,
              #FFFFFF 100%
            );

          color: var(--blue-900);
        }

        /* ====================================================
           TOP NAVBAR
        ==================================================== */

        .global-top-navbar {
          position: sticky;
          top: 0;
          z-index: 50;

          width: 100%;

          background:
            rgba(255, 255, 255, 0.94);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          border-bottom:
            1px solid var(--border-light-blue);

          box-shadow:
            0 6px 24px
            rgba(13, 71, 161, 0.08);
        }

        .navbar-container {
          max-width: 1500px;

          margin: 0 auto;

          min-height: 70px;

          padding:
            0.65rem 1.5rem;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 1.25rem;

          box-sizing: border-box;
        }

        /* ====================================================
           BRAND
        ==================================================== */

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
          width: 38px;
          height: 38px;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );

          border:
            1px solid var(--blue-200);

          display: flex;

          align-items: center;
          justify-content: center;

          color: var(--white);

          box-shadow:
            0 5px 16px
            rgba(33, 150, 243, 0.25);

          flex-shrink: 0;
        }

        .brand-text-wrap {
          display: flex;
          align-items: center;

          gap: 0.4rem;
        }

        .brand-title {
          font-size: 1.04rem;

          font-weight: 750;

          letter-spacing: -0.025em;

          color: var(--blue-900);

          white-space: nowrap;
        }

        .brand-title-accent {
          color: var(--blue-500);
        }

        .brand-ai-pill {
          font-size: 0.58rem;

          line-height: 1;

          padding: 4px 6px;

          border-radius: 5px;

          background:
            var(--blue-50);

          color:
            var(--blue-900);

          font-weight: 800;

          border:
            1px solid var(--blue-200);
        }

        /* ====================================================
           DESKTOP NAVIGATION
        ==================================================== */

        .desktop-top-nav {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 0.2rem;

          flex: 1;

          min-width: 0;
        }

        .voxa-top-nav-link {
          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 0.42rem;

          padding:
            0.48rem 0.72rem;

          min-height: 40px;

          border-radius: 10px;

          color:
            rgba(13, 71, 161, 0.78);

          text-decoration: none;

          font-size: 0.81rem;

          font-weight: 600;

          white-space: nowrap;

          transition:
            background-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .voxa-top-nav-link:hover {
          color:
            var(--blue-900);

          background:
            var(--blue-50);

          transform:
            translateY(-1px);
        }

        .voxa-top-nav-link.active {
          color:
            var(--white);

          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );

          font-weight: 700;

          box-shadow:
            0 5px 16px
            rgba(33, 150, 243, 0.24);
        }

        .voxa-top-nav-link.active:hover {
          color: var(--white);

          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );
        }

        /* Practice NEW Badge */

        .practice-new-badge {
          font-size: 0.48rem;

          line-height: 1;

          padding: 3px 4px;

          border-radius: 4px;

          background:
            var(--blue-50);

          color:
            var(--blue-900);

          font-weight: 800;

          border:
            1px solid var(--blue-200);

          margin-left: 1px;
        }

        .voxa-top-nav-link.active
        .practice-new-badge {
          background:
            rgba(255, 255, 255, 0.18);

          color:
            var(--white);

          border-color:
            rgba(255, 255, 255, 0.25);
        }

        /* ====================================================
           RIGHT ACTIONS
        ==================================================== */

        .navbar-actions {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 0.6rem;

          flex-shrink: 0;
        }

        /* ====================================================
           PROFILE
        ==================================================== */

        .profile-anchor {
          position: relative;
        }

        .navbar-user-pill {
          display: flex;

          align-items: center;

          gap: 0.45rem;

          padding:
            0.25rem 0.55rem
            0.25rem 0.3rem;

          min-height: 42px;

          border-radius: 999px;

          background:
            var(--white);

          border:
            1px solid var(--border-light-blue);

          color:
            var(--blue-900);

          cursor: pointer;

          transition:
            border-color 0.18s ease,
            background-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .navbar-user-pill:hover,
        .navbar-user-pill.active {
          background:
            var(--blue-50);

          border-color:
            var(--blue-200);

          box-shadow:
            0 5px 16px
            rgba(13, 71, 161, 0.10);
        }

        .navbar-user-avatar {
          width: 32px;
          height: 32px;

          border-radius: 50%;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );

          color:
            var(--white);

          font-size: 0.76rem;

          font-weight: 800;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1px solid var(--blue-200);
        }

        .navbar-user-avatar img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .profile-chevron {
          color:
            var(--blue-900);

          transition:
            transform 0.2s ease;
        }

        .navbar-user-pill.active
        .profile-chevron {
          transform:
            rotate(180deg);
        }

        /* ====================================================
           PROFILE DROPDOWN
        ==================================================== */

        .profile-dropdown-card {
          position: absolute;

          top:
            calc(100% + 10px);

          right: 0;

          width: 290px;

          box-sizing: border-box;

          background:
            rgba(255, 255, 255, 0.98);

          backdrop-filter:
            blur(18px);

          border:
            1px solid var(--border-light-blue);

          border-radius: 16px;

          padding: 0.65rem;

          box-shadow:
            0 24px 60px
            rgba(13, 71, 161, 0.16);

          z-index: 100;

          transform-origin:
            top right;
        }

        .profile-dropdown-header {
          display: flex;

          align-items: center;

          gap: 0.75rem;

          padding:
            0.5rem
            0.5rem
            0.75rem;
        }

        .profile-dropdown-avatar {
          width: 44px;
          height: 44px;

          min-width: 44px;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );

          color:
            var(--white);

          font-size: 0.84rem;

          font-weight: 800;

          display: flex;

          align-items: center;
          justify-content: center;

          overflow: hidden;

          border:
            1px solid var(--blue-200);

          box-shadow:
            0 5px 16px
            rgba(13, 71, 161, 0.18);
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
          font-size: 0.92rem;

          font-weight: 750;

          color:
            var(--blue-900);

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .profile-dropdown-email {
          font-size: 0.7rem;

          color:
            rgba(13, 71, 161, 0.58);

          margin-top: 4px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .profile-dropdown-divider {
          height: 1px;

          background:
            var(--blue-50);

          margin:
            0.4rem 0.2rem;
        }

        .profile-dropdown-menu-list {
          display: flex;

          flex-direction: column;

          gap: 0.15rem;
        }

        .profile-dropdown-menu-item {
          display: flex;

          align-items: center;

          gap: 0.7rem;

          width: 100%;

          min-height: 44px;

          padding:
            0.55rem
            0.65rem;

          box-sizing: border-box;

          border-radius: 10px;

          border:
            1px solid transparent;

          background:
            transparent;

          color:
            var(--blue-900);

          font-size: 0.84rem;

          font-weight: 550;

          cursor: pointer;

          text-align: left;

          transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease;
        }

        .profile-dropdown-menu-item:hover {
          background:
            var(--blue-50);

          border-color:
            var(--blue-200);

          transform:
            translateX(2px);
        }

        .dropdown-item-icon {
          width: 30px;
          height: 30px;

          border-radius: 8px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          background:
            var(--blue-50);

          color:
            var(--blue-500);
        }

        .dropdown-item-text {
          line-height: 1;
        }

        /* ====================================================
           SUB HEADER
        ==================================================== */

        .sub-header-bar {
          background:
            transparent;

          padding:
            1rem 1.5rem 0.45rem;
        }

        .sub-header-container {
          max-width: 1500px;

          margin: 0 auto;

          display: flex;

          align-items: center;

          justify-content: space-between;

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

          padding:
            0.4rem 0.8rem;

          border-radius: 9px;

          border:
            1px solid var(--border-light-blue);

          background:
            var(--white);

          color:
            var(--blue-900);

          font-size: 0.8rem;

          font-weight: 650;

          cursor: pointer;

          transition:
            transform 0.18s ease,
            background-color 0.18s ease,
            border-color 0.18s ease;
        }

        .voxa-back-btn:hover {
          transform:
            translateX(-2px);

          background:
            var(--blue-50);

          border-color:
            var(--blue-200);
        }

        .sub-header-title {
          font-size: 1.3rem;

          font-weight: 750;

          color:
            var(--blue-900);

          letter-spacing:
            -0.025em;

          margin: 0;

          line-height: 1.2;
        }

        .sub-header-description {
          margin:
            4px 0 0;

          font-size: 0.75rem;

          color:
            rgba(13, 71, 161, 0.62);
        }

        .sub-header-right {
          display: flex;

          align-items: center;
        }

        /* ====================================================
           AI STATUS
        ==================================================== */

        .status-live-pill {
          display: inline-flex;

          align-items: center;

          gap: 0.42rem;

          padding:
            0.34rem 0.7rem;

          border-radius: 999px;

          background:
            var(--white);

          border:
            1px solid var(--border-light-blue);

          color:
            var(--blue-900);

          font-size: 0.7rem;

          font-weight: 650;

          white-space: nowrap;

          box-shadow:
            0 3px 12px
            rgba(33, 150, 243, 0.06);
        }

        .status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            var(--blue-500);

          box-shadow:
            0 0 8px
            rgba(33, 150, 243, 0.65);
        }

        /* ====================================================
           MAIN CONTENT
        ==================================================== */

        .voxa-main-content {
          flex: 1;

          padding:
            0.75rem 1.5rem 2.75rem;

          max-width: 1500px;

          width: 100%;

          margin: 0 auto;

          box-sizing: border-box;
        }

        /* ====================================================
           MOBILE NAVBAR
        ==================================================== */

        .mobile-navbar-container {
          display: none;

          align-items: center;

          justify-content: space-between;

          padding:
            0.65rem 1rem;

          width: 100%;

          min-height: 62px;

          box-sizing: border-box;
        }

        .mobile-actions {
          display: flex;

          align-items: center;

          gap: 0.45rem;
        }

        .mobile-header-btn,
        .mobile-practice-btn {
          width: 40px;
          height: 40px;

          min-width: 40px;

          border-radius: 10px;

          border:
            1px solid var(--border-light-blue);

          background:
            var(--white);

          color:
            var(--blue-900);

          display: flex;

          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition:
            background-color 0.16s ease,
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .mobile-practice-btn {
          background:
            var(--blue-50);

          color:
            var(--blue-500);
        }

        .mobile-practice-btn:hover,
        .mobile-header-btn:hover,
        .mobile-header-btn.active {
          background:
            var(--blue-50);

          border-color:
            var(--blue-200);

          box-shadow:
            0 4px 12px
            rgba(33, 150, 243, 0.10);
        }

        /* ====================================================
           MOBILE DRAWER
        ==================================================== */

        .mobile-drawer-backdrop {
          position: fixed;

          inset: 0;

          background:
            rgba(13, 71, 161, 0.32);

          backdrop-filter:
            blur(5px);

          -webkit-backdrop-filter:
            blur(5px);

          z-index: 90;
        }

        .mobile-drawer-panel {
          position: fixed;

          top: 0;
          bottom: 0;
          left: 0;

          width:
            min(330px, 88vw);

          background:
            var(--white);

          z-index: 95;

          padding:
            1.15rem 1rem;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          box-shadow:
            10px 0 40px
            rgba(13, 71, 161, 0.18);

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

          margin-bottom:
            1.15rem;

          padding-bottom:
            0.9rem;

          border-bottom:
            1px solid var(--blue-50);
        }

        .mobile-close-btn {
          width: 36px;
          height: 36px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          border:
            1px solid var(--border-light-blue);

          background:
            var(--blue-50);

          color:
            var(--blue-900);

          cursor: pointer;
        }

        .mobile-menu-label {
          font-size: 0.66rem;

          font-weight: 800;

          color:
            var(--blue-500);

          text-transform: uppercase;

          letter-spacing:
            0.09em;

          margin-bottom:
            0.6rem;

          padding-left:
            0.45rem;
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

          min-height: 45px;

          padding:
            0.65rem 0.75rem;

          border-radius: 10px;

          color:
            var(--blue-900);

          text-decoration: none;

          font-size: 0.85rem;

          font-weight: 550;

          transition:
            background-color 0.16s ease,
            color 0.16s ease;
        }

        .mobile-nav-item-icon {
          width: 30px;
          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color:
            var(--blue-500);
        }

        .mobile-nav-item-label {
          flex: 1;
        }

        .mobile-nav-link:hover {
          background:
            var(--blue-50);

          color:
            var(--blue-900);
        }

        .mobile-nav-link.active {
          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );

          color:
            var(--white);

          font-weight: 650;

          box-shadow:
            0 6px 18px
            rgba(33, 150, 243, 0.20);
        }

        .mobile-nav-link.active
        .mobile-nav-item-icon {
          color:
            var(--white);
        }

        .mobile-nav-active-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            var(--white);
        }

        .mobile-practice-badge {
          font-size: 0.48rem;

          font-weight: 800;

          padding:
            3px 5px;

          border-radius: 4px;

          background:
            var(--blue-50);

          color:
            var(--blue-900);
        }

        .mobile-nav-link.active
        .mobile-practice-badge {
          background:
            rgba(255, 255, 255, 0.18);

          color:
            var(--white);
        }

        /* ====================================================
           MOBILE FOOTER
        ==================================================== */

        .mobile-drawer-footer {
          padding-top:
            1rem;

          margin-top:
            1rem;

          border-top:
            1px solid var(--blue-50);

          display: flex;

          flex-direction: column;

          gap: 0.5rem;
        }

        .mobile-drawer-practice-btn,
        .mobile-logout-btn {
          width: 100%;

          min-height: 44px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 0.5rem;

          padding:
            0.6rem;

          border-radius: 9px;

          font-size: 0.84rem;

          font-weight: 650;

          cursor: pointer;

          transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }

        .mobile-drawer-practice-btn {
          border:
            1px solid var(--blue-200);

          background:
            linear-gradient(
              135deg,
              var(--blue-500),
              var(--blue-900)
            );

          color:
            var(--white);

          box-shadow:
            0 5px 15px
            rgba(33, 150, 243, 0.18);
        }

        .mobile-logout-btn {
          border:
            1px solid var(--blue-200);

          background:
            var(--blue-50);

          color:
            var(--blue-900);
        }

        .mobile-logout-btn:hover {
          background:
            var(--blue-500);

          border-color:
            var(--blue-500);

          color:
            var(--white);
        }

        /* ====================================================
           RESPONSIVE
        ==================================================== */

        @media (max-width: 1200px) {

          .voxa-top-nav-link {
            padding-left:
              0.58rem;

            padding-right:
              0.58rem;

            font-size:
              0.77rem;
          }

          .desktop-top-nav {
            gap: 0.05rem;
          }

          .navbar-container {
            gap:
              0.7rem;
          }

          .brand-title {
            font-size:
              0.98rem;
          }
        }

        @media (max-width: 1000px) {

          .voxa-top-nav-link span {
            display: none;
          }

          .voxa-top-nav-link {
            width: 40px;

            padding:
              0.45rem;

            font-size:
              0;
          }

          .practice-new-badge {
            display: none;
          }
        }

        @media (max-width: 768px) {

          .desktop-navbar-layout {
            display:
              none !important;
          }

          .mobile-navbar-container {
            display:
              flex !important;
          }

          .sub-header-bar {
            padding:
              0.75rem 1rem 0.3rem;
          }

          .sub-header-title {
            font-size:
              1.1rem;
          }

          .sub-header-description {
            font-size:
              0.7rem;
          }

          .voxa-main-content {
            padding:
              0.75rem 1rem 2.5rem;
          }

          .status-live-pill {
            font-size:
              0.68rem;
          }
        }

        @media (max-width: 480px) {

          .brand-title {
            font-size:
              0.9rem;
          }

          .brand-ai-pill {
            display:
              none;
          }

          .back-btn-text {
            display:
              none;
          }

          .voxa-back-btn {
            width:
              36px;

            padding:
              0;
          }

          .sub-header-right {
            margin-left:
              auto;
          }

          .status-live-pill span:last-child {
            display:
              none;
          }

          .mobile-drawer-panel {
            width:
              min(310px, 90vw);
          }
        }

      `}</style>
    </div>
  );
}
