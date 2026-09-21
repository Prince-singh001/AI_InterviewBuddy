import { motion } from "framer-motion";
import { Bot, Brain, CheckCircle2, Map, Sparkles, Target } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  {
    icon: Target,
    text: "AI-powered adaptive interviews",
  },
  {
    icon: Sparkles,
    text: "Real-time performance analytics",
  },
  {
    icon: Brain,
    text: "Resume intelligence & job matching",
  },
  {
    icon: Map,
    text: "Personalized career roadmaps",
  },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      {/* =========================================================
          LEFT BRANDING PANEL
      ========================================================== */}

      <motion.section
        className="auth-brand-panel"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative Background Elements */}

        <div className="auth-bg-circle auth-bg-circle-one" />
        <div className="auth-bg-circle auth-bg-circle-two" />
        <div className="auth-grid-pattern" />

        <div className="auth-brand-content">
          {/* =====================================================
              LOGO
          ====================================================== */}

          <motion.div
            className="auth-logo"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            <div className="auth-logo-icon">
              <Bot size={30} strokeWidth={2.2} />
            </div>

            <div className="auth-logo-text">
              <div className="auth-logo-title">
                AI Interview
                <span> Buddy</span>
              </div>

              <div className="auth-logo-subtitle">
                Intelligent Interview Preparation
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              HERO HEADING
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            <div className="auth-eyebrow">
              <span className="auth-eyebrow-dot" />
              AI-Powered Interview Platform
            </div>

            <h1 className="auth-heading">
              Prepare smarter.
              <br />
              <span>Interview better.</span>
            </h1>

            <p className="auth-description">
              Practice with AI-powered interviews, receive personalized
              feedback, and build the confidence you need for your next
              opportunity.
            </p>
          </motion.div>

          {/* =====================================================
              FEATURES
          ====================================================== */}

          <div className="auth-features">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.text}
                  className="auth-feature-card"
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + index * 0.08,
                    duration: 0.4,
                  }}
                >
                  <div className="auth-feature-icon">
                    <Icon size={18} strokeWidth={2} />
                  </div>

                  <span>{feature.text}</span>

                  <CheckCircle2 className="auth-feature-check" size={16} />
                </motion.div>
              );
            })}
          </div>

          {/* =====================================================
              PRODUCT HIGHLIGHT
          ====================================================== */}

          <motion.div
            className="auth-highlight-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.5,
            }}
          >
            <div className="auth-highlight-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <div className="auth-highlight-title">
                Your AI Interview Partner
              </div>

              <div className="auth-highlight-text">
                Practice technical, behavioral, and role-specific questions with
                intelligent feedback.
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <motion.div
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1,
              duration: 0.5,
            }}
          >
            <span>AI Interview Buddy</span>
            <span className="auth-footer-dot">•</span>
            <span>Built for smarter preparation</span>
          </motion.div>
        </div>
      </motion.section>

      {/* =========================================================
          RIGHT AUTH FORM PANEL
      ========================================================== */}

      <motion.section
        className="auth-form-panel"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      >
        <div className="auth-form-container">{children}</div>
      </motion.section>

      {/* =========================================================
          STYLES
      ========================================================== */}

      <style>{`
        /* =====================================================
           COLOR SYSTEM
        ====================================================== */

        .auth-layout {
          --auth-blue-50: #E3F2FD;
          --auth-blue-200: #90CAF9;
          --auth-blue-500: #2196F3;
          --auth-blue-900: #0D47A1;
          --auth-white: #FFFFFF;

          --auth-border: rgba(144, 202, 249, 0.45);
          --auth-shadow: rgba(13, 71, 161, 0.15);

          min-height: 100vh;
          width: 100%;

          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

          background: var(--auth-blue-50);

          color: var(--auth-blue-900);

          overflow: hidden;
        }

        /* =====================================================
           LEFT PANEL
        ====================================================== */

        .auth-brand-panel {
          position: relative;

          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 3rem;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              #E3F2FD 0%,
              #FFFFFF 52%,
              #E3F2FD 100%
            );

          border-right: 1px solid var(--auth-border);
        }

        .auth-brand-content {
          position: relative;

          z-index: 2;

          width: 100%;
          max-width: 520px;
        }

        /* =====================================================
           DECORATIVE BACKGROUND
        ====================================================== */

        .auth-bg-circle {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(2px);
        }

        .auth-bg-circle-one {
          width: 430px;
          height: 430px;

          top: -190px;
          left: -150px;

          background:
            radial-gradient(
              circle,
              rgba(33, 150, 243, 0.16) 0%,
              rgba(33, 150, 243, 0.05) 45%,
              transparent 72%
            );
        }

        .auth-bg-circle-two {
          width: 380px;
          height: 380px;

          bottom: -170px;
          right: -140px;

          background:
            radial-gradient(
              circle,
              rgba(13, 71, 161, 0.13) 0%,
              rgba(33, 150, 243, 0.04) 45%,
              transparent 72%
            );
        }

        .auth-grid-pattern {
          position: absolute;

          inset: 0;

          opacity: 0.35;

          background-image:
            linear-gradient(
              rgba(33, 150, 243, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(33, 150, 243, 0.05) 1px,
              transparent 1px
            );

          background-size: 34px 34px;

          pointer-events: none;
        }

        /* =====================================================
           LOGO
        ====================================================== */

        .auth-logo {
          display: flex;

          align-items: center;

          gap: 0.85rem;

          margin-bottom: 2.5rem;
        }

        .auth-logo-icon {
          width: 54px;
          height: 54px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          color: var(--auth-white);

          background:
            linear-gradient(
              135deg,
              var(--auth-blue-500),
              var(--auth-blue-900)
            );

          border: 1px solid rgba(144, 202, 249, 0.7);

          box-shadow:
            0 10px 28px rgba(33, 150, 243, 0.25);
        }

        .auth-logo-text {
          display: flex;

          flex-direction: column;

          gap: 3px;
        }

        .auth-logo-title {
          font-size: 1.3rem;

          font-weight: 800;

          letter-spacing: -0.025em;

          color: var(--auth-blue-900);
        }

        .auth-logo-title span {
          color: var(--auth-blue-500);
        }

        .auth-logo-subtitle {
          font-size: 0.7rem;

          font-weight: 600;

          letter-spacing: 0.03em;

          color: var(--auth-blue-500);
        }

        /* =====================================================
           EYEBROW
        ====================================================== */

        .auth-eyebrow {
          display: inline-flex;

          align-items: center;

          gap: 0.45rem;

          margin-bottom: 0.9rem;

          padding: 0.35rem 0.7rem;

          border-radius: 999px;

          background: rgba(33, 150, 243, 0.08);

          border: 1px solid rgba(33, 150, 243, 0.18);

          color: var(--auth-blue-900);

          font-size: 0.7rem;

          font-weight: 700;

          letter-spacing: 0.025em;
        }

        .auth-eyebrow-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: var(--auth-blue-500);

          box-shadow:
            0 0 8px rgba(33, 150, 243, 0.7);
        }

        /* =====================================================
           HEADING
        ====================================================== */

        .auth-heading {
          margin: 0;

          font-size: clamp(2.1rem, 4vw, 3.25rem);

          line-height: 1.08;

          letter-spacing: -0.045em;

          font-weight: 850;

          color: var(--auth-blue-900);
        }

        .auth-heading span {
          color: var(--auth-blue-500);
        }

        .auth-description {
          max-width: 470px;

          margin: 1.15rem 0 2rem;

          color: #456789;

          font-size: 0.96rem;

          line-height: 1.7;
        }

        /* =====================================================
           FEATURES
        ====================================================== */

        .auth-features {
          display: flex;

          flex-direction: column;

          gap: 0.65rem;

          max-width: 500px;
        }

        .auth-feature-card {
          display: flex;

          align-items: center;

          gap: 0.75rem;

          min-height: 54px;

          padding: 0.65rem 0.8rem;

          box-sizing: border-box;

          background: rgba(255, 255, 255, 0.8);

          border: 1px solid rgba(144, 202, 249, 0.35);

          border-radius: 12px;

          box-shadow:
            0 4px 14px rgba(13, 71, 161, 0.045);

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .auth-feature-card:hover {
          transform: translateX(4px);

          border-color: var(--auth-blue-200);

          box-shadow:
            0 8px 22px rgba(33, 150, 243, 0.10);
        }

        .auth-feature-icon {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: var(--auth-blue-50);

          color: var(--auth-blue-500);

          border: 1px solid rgba(144, 202, 249, 0.35);
        }

        .auth-feature-card > span {
          flex: 1;

          font-size: 0.82rem;

          font-weight: 600;

          color: var(--auth-blue-900);
        }

        .auth-feature-check {
          flex-shrink: 0;

          color: var(--auth-blue-500);
        }

        /* =====================================================
           HIGHLIGHT CARD
        ====================================================== */

        .auth-highlight-card {
          display: flex;

          align-items: center;

          gap: 0.85rem;

          margin-top: 1.5rem;

          padding: 1rem 1.1rem;

          max-width: 500px;

          box-sizing: border-box;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(33, 150, 243, 0.09),
              rgba(144, 202, 249, 0.16)
            );

          border: 1px solid rgba(33, 150, 243, 0.18);
        }

        .auth-highlight-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              var(--auth-blue-500),
              var(--auth-blue-900)
            );

          color: var(--auth-white);

          box-shadow:
            0 6px 16px rgba(33, 150, 243, 0.2);
        }

        .auth-highlight-title {
          font-size: 0.84rem;

          font-weight: 750;

          color: var(--auth-blue-900);

          margin-bottom: 3px;
        }

        .auth-highlight-text {
          font-size: 0.72rem;

          line-height: 1.45;

          color: #52718f;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .auth-footer {
          display: flex;

          align-items: center;

          gap: 0.45rem;

          margin-top: 1.75rem;

          font-size: 0.68rem;

          color: #6b8aa5;
        }

        .auth-footer-dot {
          color: var(--auth-blue-200);
        }

        /* =====================================================
           RIGHT FORM PANEL
        ====================================================== */

        .auth-form-panel {
          min-height: 100vh;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 3rem 2rem;

          box-sizing: border-box;

          overflow-y: auto;

          background: var(--auth-white);
        }

        .auth-form-container {
          width: 100%;

          max-width: 420px;

          margin: auto;
        }

        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1000px) {
          .auth-layout {
            grid-template-columns: 0.9fr 1.1fr;
          }

          .auth-brand-panel {
            padding: 2rem;
          }

          .auth-heading {
            font-size: 2.25rem;
          }
        }

        @media (max-width: 768px) {
          .auth-layout {
            display: block;

            min-height: 100vh;

            overflow: visible;
          }

          .auth-brand-panel {
            display: none;
          }

          .auth-form-panel {
            min-height: 100vh;

            padding: 2rem 1.15rem;

            background:
              linear-gradient(
                145deg,
                var(--auth-blue-50),
                var(--auth-white)
              );
          }

          .auth-form-container {
            max-width: 430px;
          }
        }

        @media (max-width: 480px) {
          .auth-form-panel {
            padding: 1.25rem 0.9rem;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          .auth-feature-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
