import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileText,
  Menu,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ============================================================
// FEATURES
// ============================================================

const features = [
  {
    icon: Bot,
    title: 'AI Mock Interviews',
    description:
      'Practice technical, behavioral, HR, coding, and role-specific interviews with an AI interviewer.',
  },
  {
    icon: FileText,
    title: 'Resume Intelligence',
    description:
      'Analyze your resume for ATS readiness, skills, strengths, gaps, and actionable improvements.',
  },
  {
    icon: Briefcase,
    title: 'Job Match Analysis',
    description:
      'Compare your profile with a job description and identify relevant skills and preparation gaps.',
  },
  {
    icon: BrainCircuit,
    title: 'Adaptive Questions',
    description:
      'Questions adapt to your selected role, difficulty, interview type, and previous responses.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description:
      'Track interview scores, answer quality, strengths, improvements, and overall progress.',
  },
  {
    icon: Target,
    title: 'Career Preparation',
    description:
      'Convert your interview and resume insights into a focused preparation strategy.',
  },
]

// ============================================================
// HOW IT WORKS
// ============================================================

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Create Your Profile',
    description:
      'Add your target role, skills, experience, and career information.',
  },
  {
    number: '02',
    icon: Briefcase,
    title: 'Analyze Your Target',
    description:
      'Upload your resume or analyze a job description to understand what to improve.',
  },
  {
    number: '03',
    icon: Bot,
    title: 'Practice With AI',
    description:
      'Start a personalized mock interview and answer questions in a realistic environment.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Improve With Feedback',
    description:
      'Review AI evaluation, scores, strengths, weaknesses, and recommendations.',
  },
]

// ============================================================
// FAQ
// ============================================================

const faqs = [
  {
    question: 'How does the AI interview work?',
    answer:
      'Select your target role, interview type, difficulty, duration, and mode. Interviewer Buddy AI generates questions and evaluates your responses throughout the interview.',
  },
  {
    question: 'What types of interviews can I practice?',
    answer:
      'You can prepare for technical, behavioral, HR, coding, AI/ML, software engineering, and other role-specific interview scenarios.',
  },
  {
    question: 'Can I analyze my resume?',
    answer:
      'Yes. Upload your resume to receive AI-powered insights including ATS-related analysis, extracted skills, strengths, and improvement suggestions.',
  },
  {
    question: 'Can I analyze a job description?',
    answer:
      'Yes. Paste a job description to understand required skills, seniority, interview topics, missing skills, and your overall job match.',
  },
  {
    question: 'How are interview answers evaluated?',
    answer:
      'Answers are evaluated based on relevance, technical quality, clarity, structure, problem-solving, communication, and the requirements of the selected interview.',
  },
]

// ============================================================
// FAQ ITEM
// ============================================================

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string
  answer: string
  index: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`faq-item ${open ? 'faq-open' : ''}`}
    >
      <button
        type="button"
        className="faq-question"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{question}</span>

        <ChevronDown
          size={19}
          className={`faq-chevron ${open ? 'rotate' : ''}`}
        />
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="faq-answer"
        >
          <p>{answer}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================
// GITHUB ICON
// Inline SVG avoids lucide-react Github export issues.
// ============================================================

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.831.091-.646.35-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481A10.002 10.002 0 0 0 22 12C22 6.477 17.523 2 12 2Z" />
    </svg>
  )
}

// ============================================================
// HERO PRODUCT VISUAL
// ============================================================

function InterviewDashboardPreview() {
  return (
    <motion.div
      className="hero-preview"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="preview-glow" />

      <div className="browser-window">
        <div className="browser-bar">
          <div className="browser-dots">
            <span />
            <span />
            <span />
          </div>

          <div className="browser-url">
            interviewer-buddy.ai / interview
          </div>

          <div className="browser-secure">
            <ShieldCheck size={12} />
          </div>
        </div>

        <div className="dashboard-preview">
          <aside className="preview-sidebar">
            <div className="preview-brand">
              <div className="preview-logo">
                <Bot size={16} />
              </div>

              <span>Buddy AI</span>
            </div>

            <div className="preview-menu active">
              <MessageSquare size={14} />
              <span>Interview</span>
            </div>

            <div className="preview-menu">
              <BarChart3 size={14} />
              <span>Analytics</span>
            </div>

            <div className="preview-menu">
              <FileText size={14} />
              <span>Resume</span>
            </div>

            <div className="preview-menu">
              <Briefcase size={14} />
              <span>Jobs</span>
            </div>
          </aside>

          <div className="preview-main">
            <div className="preview-top">
              <div>
                <small>LIVE AI INTERVIEW</small>
                <h3>Python Developer</h3>
              </div>

              <div className="live-pill">
                <span />
                AI Active
              </div>
            </div>

            <div className="question-card">
              <div className="question-label">
                <Sparkles size={13} />
                Question 04
              </div>

              <h4>
                Explain the difference between a list and a tuple in Python.
              </h4>

              <div className="answer-line">
                <span className="answer-dot" />
                <span />
                <span />
              </div>

              <div className="answer-line short">
                <span className="answer-dot" />
                <span />
              </div>

              <div className="answer-status">
                <span>Answer evaluation</span>
                <strong>AI listening...</strong>
              </div>
            </div>

            <div className="preview-stats">
              <div className="preview-stat">
                <div className="stat-icon blue">
                  <Target size={14} />
                </div>

                <div>
                  <small>Relevance</small>
                  <strong>92%</strong>
                </div>
              </div>

              <div className="preview-stat">
                <div className="stat-icon purple">
                  <MessageSquare size={14} />
                </div>

                <div>
                  <small>Clarity</small>
                  <strong>91%</strong>
                </div>
              </div>

              <div className="preview-stat">
                <div className="stat-icon green">
                  <BarChart3 size={14} />
                </div>

                <div>
                  <small>Progress</small>
                  <strong>68%</strong>
                </div>
              </div>
            </div>

            <div className="ai-feedback">
              <div className="feedback-icon">
                <Sparkles size={14} />
              </div>

              <div>
                <strong>AI Feedback</strong>

                <p>
                  Good concept coverage. Add a practical example to make your
                  answer stronger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="floating-card floating-card-left"
        animate={{ y: [0, -7, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'easeInOut',
        }}
      >
        <div className="floating-icon">
          <CheckCircle2 size={15} />
        </div>

        <div>
          <small>Answer Quality</small>
          <strong>Excellent</strong>
        </div>
      </motion.div>

      <motion.div
        className="floating-card floating-card-right"
        animate={{ y: [0, 7, 0] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut',
        }}
      >
        <div className="floating-score">8.7</div>

        <div>
          <small>AI Score</small>
          <strong>Strong answer</strong>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// LANDING PAGE
// ============================================================

export default function Landing() {
  const navigate = useNavigate()

  const [mobileMenu, setMobileMenu] = useState(false)

  const closeMenu = () => {
    setMobileMenu(false)
  }

  const goToRegister = () => {
    closeMenu()
    navigate('/register')
  }

  const goToLogin = () => {
    closeMenu()
    navigate('/login')
  }

  return (
    <div className="landing-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="landing-header">
        <div className="header-inner">
          <button
            type="button"
            className="brand"
            onClick={() => navigate('/')}
            aria-label="Interviewer Buddy AI home"
          >
            <div className="brand-icon">
              <Bot size={21} />
            </div>

            <div className="brand-text">
              <strong>Interviewer Buddy AI</strong>
              <span>AI Interview Preparation</span>
            </div>
          </button>

          <nav className="desktop-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#ai-capabilities">AI Capabilities</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={goToLogin}
            >
              Sign In
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={goToRegister}
            >
              Get Started
              <ArrowRight size={14} />
            </button>
          </div>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenu((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <a href="#features" onClick={closeMenu}>
              Features
            </a>

            <a href="#how-it-works" onClick={closeMenu}>
              How It Works
            </a>

            <a href="#ai-capabilities" onClick={closeMenu}>
              AI Capabilities
            </a>

            <a href="#faq" onClick={closeMenu}>
              FAQ
            </a>

            <div className="mobile-nav-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={goToLogin}
              >
                Sign In
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={goToRegister}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <main>
        <section className="hero-section">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="hero-container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="hero-badge">
                <span className="badge-dot" />
                <Sparkles size={14} />
                AI-powered interview preparation
              </div>

              <h1>
                Prepare Smarter.
                <br />

                <span className="gradient-text">
                  Interview Better.
                </span>
              </h1>

              <p className="hero-description">
                Practice realistic interviews, analyze your resume, understand
                job requirements, and improve with personalized AI feedback.
              </p>

              <div className="hero-actions">
                <motion.button
                  type="button"
                  className="btn btn-primary btn-xl"
                  onClick={goToRegister}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap size={18} />
                  Start Practicing
                  <ArrowRight size={17} />
                </motion.button>

                <motion.a
                  href="#how-it-works"
                  className="btn btn-outline btn-xl"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play size={16} />
                  See How It Works
                </motion.a>
              </div>

              <div className="hero-trust">
                <div>
                  <CheckCircle2 size={15} />
                  <span>Technical interviews</span>
                </div>

                <div>
                  <CheckCircle2 size={15} />
                  <span>Behavioral interviews</span>
                </div>

                <div>
                  <CheckCircle2 size={15} />
                  <span>AI/ML preparation</span>
                </div>
              </div>
            </motion.div>

            <InterviewDashboardPreview />
          </div>
        </section>

        {/* ====================================================
            INTRO STRIP
        ==================================================== */}

        <section className="intro-strip">
          <div className="section-container intro-inner">
            <div className="intro-title">
              <span>Built for serious interview preparation</span>
            </div>

            <div className="intro-items">
              <div>
                <Bot size={16} />
                <span>AI Mock Interviews</span>
              </div>

              <div>
                <FileText size={16} />
                <span>Resume Analysis</span>
              </div>

              <div>
                <Briefcase size={16} />
                <span>Job Matching</span>
              </div>

              <div>
                <BarChart3 size={16} />
                <span>Performance Insights</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            FEATURES
        ==================================================== */}

        <section id="features" className="section features-section">
          <div className="section-container">
            <div className="section-heading">
              <span className="section-eyebrow">
                <Sparkles size={13} />
                Powerful preparation tools
              </span>

              <h2>
                Everything you need to
                <span className="gradient-text"> prepare with confidence</span>
              </h2>

              <p>
                One platform to practice interviews, understand your profile,
                identify gaps, and improve your performance.
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon

                return (
                  <motion.article
                    key={feature.title}
                    className="feature-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="feature-icon">
                      <Icon size={21} />
                    </div>

                    <h3>{feature.title}</h3>

                    <p>{feature.description}</p>

                    <div className="feature-arrow">
                      <ArrowRight size={15} />
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        <section id="how-it-works" className="section process-section">
          <div className="section-container">
            <div className="section-heading centered">
              <span className="section-eyebrow">
                <Target size={13} />
                Simple workflow
              </span>

              <h2>
                From preparation to
                <span className="gradient-text"> interview-ready</span>
              </h2>

              <p>
                Follow a focused preparation workflow designed around your
                target role.
              </p>
            </div>

            <div className="steps-grid">
              {steps.map((step, index) => {
                const Icon = step.icon

                return (
                  <motion.div
                    key={step.number}
                    className="step-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <div className="step-top">
                      <span>{step.number}</span>

                      <div className="step-icon">
                        <Icon size={19} />
                      </div>
                    </div>

                    <h3>{step.title}</h3>

                    <p>{step.description}</p>

                    {index < steps.length - 1 && (
                      <div className="step-connector">
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            AI CAPABILITIES
        ==================================================== */}

        <section id="ai-capabilities" className="section capabilities-section">
          <div className="section-container">
            <div className="capabilities-card">
              <div className="capabilities-content">
                <span className="section-eyebrow">
                  <BrainCircuit size={13} />
                  AI-powered preparation
                </span>

                <h2>
                  Turn every practice session into
                  <span className="gradient-text"> useful feedback</span>
                </h2>

                <p>
                  Interviewer Buddy AI analyzes your responses and gives
                  structured insights so you know exactly what to improve.
                </p>

                <div className="capability-list">
                  <div>
                    <CheckCircle2 size={17} />
                    <span>Technical answer evaluation</span>
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    <span>Communication and clarity analysis</span>
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    <span>Strengths and improvement areas</span>
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    <span>Role-focused preparation insights</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={goToRegister}
                >
                  Explore AI Interviews
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="capabilities-visual">
                <div className="ai-ring ring-one" />
                <div className="ai-ring ring-two" />

                <motion.div
                  className="ai-core"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                  }}
                >
                  <BrainCircuit size={42} />
                </motion.div>

                <div className="ai-chip chip-one">
                  <Sparkles size={13} />
                  AI Evaluation
                </div>

                <div className="ai-chip chip-two">
                  <BarChart3 size={13} />
                  Performance
                </div>

                <div className="ai-chip chip-three">
                  <Target size={13} />
                  Skill Gaps
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            FAQ
        ==================================================== */}

        <section id="faq" className="section faq-section">
          <div className="section-container faq-container">
            <div className="section-heading centered">
              <span className="section-eyebrow">
                <MessageSquare size={13} />
                FAQ
              </span>

              <h2>
                Frequently asked
                <span className="gradient-text"> questions</span>
              </h2>

              <p>
                Everything you need to know about Interviewer Buddy AI.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            CTA
        ==================================================== */}

        <section className="cta-section">
          <div className="section-container">
            <motion.div
              className="cta-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="cta-glow" />

              <div className="cta-content">
                <span className="section-eyebrow">
                  <Zap size={13} />
                  Start preparing today
                </span>

                <h2>
                  Your next interview deserves
                  <span className="gradient-text"> better preparation.</span>
                </h2>

                <p>
                  Practice with AI, understand your gaps, and walk into your
                  next interview with greater confidence.
                </p>

                <div className="cta-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-xl"
                    onClick={goToRegister}
                  >
                    Create Your Account
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-xl"
                    onClick={goToLogin}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-brand-row">
                <div className="footer-logo">
                  <Bot size={18} />
                </div>

                <strong>Interviewer Buddy AI</strong>
              </div>

              <p>
                AI-powered interview preparation for technical, behavioral,
                HR, and role-specific interviews.
              </p>
            </div>

            <div className="footer-links">
              <div>
                <span>Product</span>

                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#ai-capabilities">AI Capabilities</a>
              </div>

              <div>
                <span>Support</span>

                <a href="#faq">FAQ</a>

                <button type="button" onClick={goToLogin}>
                  Sign In
                </button>

                <button type="button" onClick={goToRegister}>
                  Create Account
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Interviewer Buddy AI</span>

            <span>Built with React, FastAPI & Generative AI</span>

            <a
              href="https://github.com/Prince-singh001"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="github-link"
            >
              <GitHubIcon size={17} />
            </a>
          </div>
        </div>
      </footer>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        .landing-page {
          min-height: 100vh;
          overflow-x: hidden;
          color: var(--text-primary);
          background: var(--bg-base);
          font-family: var(--font-sans);
        }

        .section-container {
          width: min(1160px, calc(100% - 40px));
          margin: 0 auto;
        }

        .section {
          padding: 110px 0;
        }

        /* ====================================================
           HEADER
        ==================================================== */

        .landing-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border);
          background: rgba(8, 11, 18, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .header-inner {
          width: min(1240px, calc(100% - 40px));
          height: 72px;
          margin: 0 auto;

          display: flex;
          align-items: center;
          gap: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 0;

          color: inherit;
          text-align: left;

          border: 0;
          background: transparent;

          cursor: pointer;
          flex-shrink: 0;
        }

        .brand-icon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 8px 28px
            rgba(99, 102, 241, 0.28);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .brand-text strong {
          font-size: 0.94rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .brand-text span {
          color: var(--text-muted);
          font-size: 0.65rem;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 3px;

          margin-left: auto;
          margin-right: auto;
        }

        .desktop-nav a {
          padding: 9px 12px;

          color: var(--text-secondary);
          text-decoration: none;

          border-radius: 9px;

          font-size: 0.82rem;
          font-weight: 550;

          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .desktop-nav a:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.045);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-menu-button {
          display: none;

          width: 40px;
          height: 40px;

          align-items: center;
          justify-content: center;

          color: var(--text-primary);

          border: 1px solid var(--border);
          border-radius: 10px;

          background: var(--bg-card);

          cursor: pointer;
        }

        .mobile-nav {
          display: none;
        }

        /* ====================================================
           BUTTONS
        ==================================================== */

        .landing-page .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 42px;
          padding: 0 16px;

          color: var(--text-primary);

          border: 1px solid transparent;
          border-radius: 10px;

          font-weight: 650;
          font-size: 0.84rem;

          cursor: pointer;

          text-decoration: none;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .landing-page .btn-primary {
          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #6366f1
            );

          box-shadow:
            0 9px 28px
            rgba(59, 130, 246, 0.22);
        }

        .landing-page .btn-primary:hover {
          box-shadow:
            0 14px 35px
            rgba(59, 130, 246, 0.32);
        }

        .landing-page .btn-outline {
          color: var(--text-primary);

          border-color: var(--border);

          background: rgba(255,255,255,0.025);
        }

        .landing-page .btn-outline:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(99,102,241,0.45);
        }

        .landing-page .btn-ghost {
          color: var(--text-secondary);
          background: transparent;
        }

        .landing-page .btn-ghost:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.045);
        }

        .landing-page .btn-sm {
          min-height: 38px;
          padding: 0 13px;
          font-size: 0.8rem;
        }

        .landing-page .btn-xl {
          min-height: 53px;
          padding: 0 19px;
          font-size: 0.86rem;
        }

        /* ====================================================
           HERO
        ==================================================== */

        .hero-section {
          position: relative;

          min-height: 760px;

          display: flex;
          align-items: center;

          padding: 85px 0 100px;

          overflow: hidden;

          background:
            radial-gradient(
              ellipse 60% 55% at 7% 10%,
              rgba(37,99,235,0.14),
              transparent 68%
            ),
            radial-gradient(
              ellipse 55% 55% at 93% 25%,
              rgba(124,58,237,0.13),
              transparent 68%
            );
        }

        .hero-grid {
          position: absolute;
          inset: 0;

          opacity: 0.18;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.035) 1px,
              transparent 1px
            );

          background-size: 52px 52px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 82%
            );
        }

        .hero-orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(1px);
        }

        .hero-orb-one {
          width: 450px;
          height: 450px;

          left: -300px;
          top: 100px;

          background:
            radial-gradient(
              circle,
              rgba(37,99,235,0.09),
              transparent 70%
            );
        }

        .hero-orb-two {
          width: 500px;
          height: 500px;

          right: -320px;
          bottom: -200px;

          background:
            radial-gradient(
              circle,
              rgba(124,58,237,0.09),
              transparent 70%
            );
        }

        .hero-container {
          position: relative;
          z-index: 2;

          width: min(1240px, calc(100% - 40px));

          margin: 0 auto;

          display: grid;
          grid-template-columns: 0.88fr 1.12fr;

          align-items: center;

          gap: 55px;
        }

        .hero-content {
          max-width: 620px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 22px;

          padding: 7px 11px;

          color: #a5b4fc;

          border: 1px solid rgba(99,102,241,0.27);
          border-radius: 999px;

          background: rgba(99,102,241,0.08);

          font-size: 0.71rem;
          font-weight: 650;
        }

        .badge-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #60a5fa;

          box-shadow:
            0 0 0 4px
            rgba(96,165,250,0.09);
        }

        .hero-content h1 {
          margin: 0;

          font-size: clamp(3rem, 5.2vw, 4.55rem);
          font-weight: 900;
          line-height: 1.02;
          letter-spacing: -0.045em;
        }

        .gradient-text {
          color: transparent;

          background:
            linear-gradient(
              135deg,
              #60a5fa,
              #818cf8,
              #c084fc
            );

          -webkit-background-clip: text;
          background-clip: text;
        }

        .hero-description {
          max-width: 570px;

          margin: 24px 0 29px;

          color: var(--text-secondary);

          font-size: 1rem;
          line-height: 1.75;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          margin-bottom: 25px;
        }

        .hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .hero-trust div {
          display: flex;
          align-items: center;
          gap: 6px;

          color: var(--text-muted);

          font-size: 0.68rem;
        }

        .hero-trust svg {
          color: #60a5fa;
        }

        /* ====================================================
           HERO PREVIEW
        ==================================================== */

        .hero-preview {
          position: relative;

          min-height: 510px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-glow {
          position: absolute;

          width: 390px;
          height: 390px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(99,102,241,0.17),
              transparent 68%
            );

          filter: blur(12px);
        }

        .browser-window {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 700px;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,0.1);

          border-radius: 16px;

          background: rgba(13,17,27,0.92);

          box-shadow:
            0 35px 90px
            rgba(0,0,0,0.42),
            0 0 0 1px
            rgba(99,102,241,0.05);
        }

        .browser-bar {
          height: 39px;

          display: flex;
          align-items: center;

          padding: 0 12px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);

          background:
            rgba(255,255,255,0.025);
        }

        .browser-dots {
          display: flex;
          gap: 5px;
        }

        .browser-dots span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: rgba(255,255,255,0.2);
        }

        .browser-url {
          margin: auto;

          color: var(--text-muted);

          font-size: 0.57rem;
        }

        .browser-secure {
          color: #64748b;
        }

        .dashboard-preview {
          display: grid;
          grid-template-columns: 125px 1fr;

          min-height: 420px;
        }

        .preview-sidebar {
          padding: 16px 9px;

          border-right:
            1px solid
            rgba(255,255,255,0.06);

          background:
            rgba(255,255,255,0.018);
        }

        .preview-brand {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 5px 6px;

          margin-bottom: 22px;

          color: var(--text-primary);

          font-size: 0.7rem;
          font-weight: 750;
        }

        .preview-logo {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;

          border-radius: 7px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );
        }

        .preview-menu {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 9px 7px;

          margin-bottom: 3px;

          color: #64748b;

          border-radius: 7px;

          font-size: 0.62rem;
        }

        .preview-menu.active {
          color: #c7d2fe;

          background:
            rgba(99,102,241,0.13);
        }

        .preview-main {
          min-width: 0;

          padding: 18px;
        }

        .preview-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 16px;
        }

        .preview-top small {
          color: #64748b;

          font-size: 0.52rem;
          font-weight: 700;
          letter-spacing: 0.09em;
        }

        .preview-top h3 {
          margin: 4px 0 0;

          color: #f8fafc;

          font-size: 0.88rem;
        }

        .live-pill {
          display: flex;
          align-items: center;
          gap: 5px;

          padding: 5px 8px;

          color: #86efac;

          border: 1px solid rgba(34,197,94,0.17);
          border-radius: 999px;

          background: rgba(34,197,94,0.08);

          font-size: 0.54rem;
        }

        .live-pill span {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #4ade80;
        }

        .question-card {
          padding: 16px;

          border:
            1px solid
            rgba(255,255,255,0.075);

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.035),
              rgba(255,255,255,0.018)
            );
        }

        .question-label {
          display: flex;
          align-items: center;
          gap: 6px;

          margin-bottom: 12px;

          color: #818cf8;

          font-size: 0.57rem;
          font-weight: 700;
        }

        .question-card h4 {
          margin: 0 0 17px;

          color: #e2e8f0;

          font-size: 0.83rem;
          line-height: 1.55;
        }

        .answer-line {
          display: flex;
          align-items: center;
          gap: 6px;

          margin-bottom: 7px;
        }

        .answer-line span:not(.answer-dot) {
          height: 5px;

          flex: 1;

          border-radius: 99px;

          background: rgba(148,163,184,0.12);
        }

        .answer-line span:nth-child(2) {
          max-width: 75%;
        }

        .answer-line.short span:nth-child(2) {
          max-width: 52%;
        }

        .answer-dot {
          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: #6366f1;
        }

        .answer-status {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 14px;
          padding-top: 12px;

          border-top:
            1px solid
            rgba(255,255,255,0.06);

          color: #64748b;

          font-size: 0.55rem;
        }

        .answer-status strong {
          color: #93c5fd;
          font-weight: 600;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 7px;

          margin-top: 9px;
        }

        .preview-stat {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 9px;

          border:
            1px solid
            rgba(255,255,255,0.06);

          border-radius: 9px;

          background: rgba(255,255,255,0.018);
        }

        .stat-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 7px;
        }

        .stat-icon.blue {
          color: #60a5fa;
          background: rgba(59,130,246,0.11);
        }

        .stat-icon.purple {
          color: #c084fc;
          background: rgba(168,85,247,0.11);
        }

        .stat-icon.green {
          color: #4ade80;
          background: rgba(34,197,94,0.11);
        }

        .preview-stat small,
        .floating-card small {
          display: block;

          margin-bottom: 2px;

          color: #64748b;

          font-size: 0.47rem;
        }

        .preview-stat strong,
        .floating-card strong {
          color: #e2e8f0;

          font-size: 0.67rem;
        }

        .ai-feedback {
          display: flex;
          gap: 8px;

          margin-top: 9px;
          padding: 10px;

          border:
            1px solid
            rgba(99,102,241,0.12);

          border-radius: 9px;

          background:
            rgba(99,102,241,0.055);
        }

        .feedback-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: #a78bfa;

          border-radius: 7px;

          background:
            rgba(139,92,246,0.12);
        }

        .ai-feedback strong {
          color: #cbd5e1;
          font-size: 0.6rem;
        }

        .ai-feedback p {
          margin: 3px 0 0;

          color: #64748b;

          font-size: 0.52rem;
          line-height: 1.45;
        }

        .floating-card {
          position: absolute;
          z-index: 4;

          display: flex;
          align-items: center;
          gap: 8px;

          min-width: 145px;

          padding: 9px 10px;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 10px;

          background:
            rgba(15,20,32,0.92);

          backdrop-filter: blur(12px);

          box-shadow:
            0 15px 35px
            rgba(0,0,0,0.3);
        }

        .floating-card-left {
          left: -15px;
          top: 100px;
        }

        .floating-card-right {
          right: -18px;
          bottom: 90px;
        }

        .floating-icon {
          width: 28px;
          height: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #4ade80;

          border-radius: 8px;

          background: rgba(34,197,94,0.1);
        }

        .floating-score {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #c4b5fd;

          border-radius: 8px;

          background: rgba(139,92,246,0.13);

          font-size: 0.7rem;
          font-weight: 800;
        }

        /* ====================================================
           INTRO STRIP
        ==================================================== */

        .intro-strip {
          border-top:
            1px solid
            var(--border);

          border-bottom:
            1px solid
            var(--border);

          background:
            rgba(255,255,255,0.012);
        }

        .intro-inner {
          min-height: 70px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;
        }

        .intro-title {
          color: var(--text-muted);

          font-size: 0.69rem;
        }

        .intro-items {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .intro-items div {
          display: flex;
          align-items: center;
          gap: 7px;

          color: var(--text-secondary);

          font-size: 0.66rem;
        }

        .intro-items svg {
          color: #818cf8;
        }

        /* ====================================================
           SECTION HEADING
        ==================================================== */

        .section-heading {
          max-width: 720px;

          margin-bottom: 48px;
        }

        .section-heading.centered {
          margin-left: auto;
          margin-right: auto;

          text-align: center;
        }

        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          margin-bottom: 12px;

          color: #818cf8;

          font-size: 0.68rem;
          font-weight: 750;
          letter-spacing: 0.03em;
        }

        .section-heading h2,
        .capabilities-content h2,
        .cta-content h2 {
          margin: 0;

          color: var(--text-primary);

          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 850;
          line-height: 1.1;
          letter-spacing: -0.035em;
        }

        .section-heading p,
        .capabilities-content > p,
        .cta-content > p {
          margin: 16px 0 0;

          color: var(--text-secondary);

          font-size: 0.92rem;
          line-height: 1.7;
        }

        /* ====================================================
           FEATURES
        ==================================================== */

        .features-section {
          background:
            radial-gradient(
              ellipse 60% 40% at 50% 0%,
              rgba(99,102,241,0.045),
              transparent 70%
            );
        }

        .features-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 13px;
        }

        .feature-card {
          position: relative;

          min-height: 205px;

          padding: 23px;

          border:
            1px solid
            var(--border);

          border-radius: 15px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.025),
              rgba(255,255,255,0.012)
            );

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .feature-card:hover {
          border-color:
            rgba(99,102,241,0.3);

          box-shadow:
            0 18px 40px
            rgba(0,0,0,0.16);
        }

        .feature-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 17px;

          color: #93c5fd;

          border:
            1px solid
            rgba(99,102,241,0.15);

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,0.1),
              rgba(139,92,246,0.1)
            );
        }

        .feature-card h3 {
          margin: 0 0 8px;

          color: var(--text-primary);

          font-size: 0.91rem;
        }

        .feature-card p {
          max-width: 330px;

          margin: 0;

          color: var(--text-muted);

          font-size: 0.7rem;
          line-height: 1.7;
        }

        .feature-arrow {
          position: absolute;

          right: 20px;
          top: 23px;

          color: var(--text-disabled);

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .feature-card:hover .feature-arrow {
          color: #818cf8;
          transform: translateX(3px);
        }

        /* ====================================================
           PROCESS
        ==================================================== */

        .process-section {
          background:
            rgba(255,255,255,0.012);
        }

        .steps-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 13px;
        }

        .step-card {
          position: relative;

          padding: 23px;

          min-height: 225px;

          border:
            1px solid
            var(--border);

          border-radius: 15px;

          background:
            rgba(255,255,255,0.018);
        }

        .step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 24px;
        }

        .step-top > span {
          color: var(--text-disabled);

          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .step-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #a5b4fc;

          border-radius: 10px;

          background:
            rgba(99,102,241,0.09);
        }

        .step-card h3 {
          margin: 0 0 9px;

          font-size: 0.9rem;
        }

        .step-card p {
          margin: 0;

          color: var(--text-muted);

          font-size: 0.7rem;
          line-height: 1.7;
        }

        .step-connector {
          position: absolute;

          right: -18px;
          top: 50%;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #64748b;

          border:
            1px solid
            var(--border);

          border-radius: 50%;

          background: var(--bg-base);

          transform: translateY(-50%);

          z-index: 5;
        }

        /* ====================================================
           CAPABILITIES
        ==================================================== */

        .capabilities-card {
          position: relative;

          display: grid;
          grid-template-columns: 1fr 0.8fr;

          overflow: hidden;

          border:
            1px solid
            var(--border);

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,0.045),
              rgba(139,92,246,0.055)
            );
        }

        .capabilities-content {
          padding: 60px;
        }

        .capabilities-content > p {
          max-width: 550px;
        }

        .capability-list {
          display: grid;
          gap: 12px;

          margin: 25px 0 28px;
        }

        .capability-list div {
          display: flex;
          align-items: center;
          gap: 9px;

          color: var(--text-secondary);

          font-size: 0.73rem;
        }

        .capability-list svg {
          color: #60a5fa;
          flex-shrink: 0;
        }

        .capabilities-visual {
          position: relative;

          min-height: 400px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-left:
            1px solid
            var(--border);
        }

        .ai-ring {
          position: absolute;

          border:
            1px solid
            rgba(129,140,248,0.16);

          border-radius: 50%;
        }

        .ring-one {
          width: 230px;
          height: 230px;
        }

        .ring-two {
          width: 320px;
          height: 320px;
        }

        .ai-core {
          position: relative;
          z-index: 2;

          width: 100px;
          height: 100px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;

          border:
            1px solid
            rgba(255,255,255,0.15);

          border-radius: 28px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 25px 60px
            rgba(99,102,241,0.35);
        }

        .ai-chip {
          position: absolute;

          z-index: 3;

          display: flex;
          align-items: center;
          gap: 6px;

          padding: 8px 10px;

          color: var(--text-secondary);

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 8px;

          background:
            rgba(12,16,25,0.9);

          box-shadow:
            0 12px 25px
            rgba(0,0,0,0.25);

          font-size: 0.6rem;
          font-weight: 650;
        }

        .ai-chip svg {
          color: #a78bfa;
        }

        .chip-one {
          top: 78px;
          right: 45px;
        }

        .chip-two {
          bottom: 75px;
          left: 35px;
        }

        .chip-three {
          bottom: 105px;
          right: 35px;
        }

        /* ====================================================
           FAQ
        ==================================================== */

        .faq-container {
          max-width: 800px;
        }

        .faq-list {
          border-top:
            1px solid
            var(--border);
        }

        .faq-item {
          border-bottom:
            1px solid
            var(--border);
        }

        .faq-question {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 21px 2px;

          color: var(--text-primary);

          border: 0;

          background: transparent;

          text-align: left;

          cursor: pointer;

          font-size: 0.82rem;
          font-weight: 650;
        }

        .faq-chevron {
          color: var(--text-muted);

          flex-shrink: 0;

          transition:
            transform 0.2s ease;
        }

        .faq-chevron.rotate {
          transform: rotate(180deg);
        }

        .faq-answer {
          overflow: hidden;
        }

        .faq-answer p {
          margin: 0;
          padding: 0 35px 21px 2px;

          color: var(--text-muted);

          font-size: 0.73rem;
          line-height: 1.75;
        }

        /* ====================================================
           CTA
        ==================================================== */

        .cta-section {
          padding: 20px 0 110px;
        }

        .cta-card {
          position: relative;

          overflow: hidden;

          padding: 75px 40px;

          text-align: center;

          border:
            1px solid
            rgba(99,102,241,0.18);

          border-radius: 22px;

          background:
            radial-gradient(
              ellipse 70% 90% at 50% 100%,
              rgba(99,102,241,0.11),
              transparent 70%
            ),
            rgba(255,255,255,0.018);
        }

        .cta-glow {
          position: absolute;

          width: 300px;
          height: 300px;

          top: -180px;
          left: 50%;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(59,130,246,0.11),
              transparent 70%
            );

          transform: translateX(-50%);
        }

        .cta-content {
          position: relative;
          z-index: 2;

          max-width: 680px;

          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: clamp(2rem, 4vw, 3.15rem);
        }

        .cta-content > p {
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;

          gap: 10px;

          margin-top: 28px;
        }

        /* ====================================================
           FOOTER
        ==================================================== */

        .landing-footer {
          border-top:
            1px solid
            var(--border);

          background:
            rgba(255,255,255,0.01);
        }

        .footer-main {
          display: flex;
          justify-content: space-between;

          gap: 60px;

          padding: 55px 0;
        }

        .footer-brand {
          max-width: 350px;
        }

        .footer-brand-row {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 12px;
        }

        .footer-logo {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );
        }

        .footer-brand strong {
          font-size: 0.85rem;
        }

        .footer-brand p {
          margin: 0;

          color: var(--text-muted);

          font-size: 0.68rem;
          line-height: 1.7;
        }

        .footer-links {
          display: flex;

          gap: 75px;
        }

        .footer-links > div {
          display: flex;
          flex-direction: column;

          gap: 9px;
        }

        .footer-links span {
          margin-bottom: 4px;

          color: var(--text-primary);

          font-size: 0.69rem;
          font-weight: 750;
        }

        .footer-links a,
        .footer-links button {
          width: fit-content;

          padding: 0;

          color: var(--text-muted);

          border: 0;

          background: transparent;

          text-decoration: none;

          cursor: pointer;

          font-family: inherit;
          font-size: 0.66rem;

          text-align: left;
        }

        .footer-links a:hover,
        .footer-links button:hover {
          color: var(--text-primary);
        }

        .footer-bottom {
          min-height: 65px;

          display: flex;
          align-items: center;

          gap: 20px;

          border-top:
            1px solid
            var(--border);

          color: var(--text-disabled);

          font-size: 0.62rem;
        }

        .footer-bottom span:nth-child(2) {
          margin-left: auto;
        }

        .github-link {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: var(--text-muted);

          border-radius: 8px;

          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .github-link:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        /* ====================================================
           TABLET
        ==================================================== */

        @media (max-width: 1050px) {
          .hero-container {
            grid-template-columns: 1fr;

            text-align: center;
          }

          .hero-content {
            max-width: 760px;
            margin: 0 auto;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions,
          .hero-trust {
            justify-content: center;
          }

          .hero-preview {
            min-height: 480px;
          }

          .browser-window {
            max-width: 730px;
          }

          .features-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .steps-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .step-connector {
            display: none;
          }

          .capabilities-card {
            grid-template-columns: 1fr;
          }

          .capabilities-visual {
            min-height: 350px;

            border-left: 0;

            border-top:
              1px solid
              var(--border);
          }
        }

        /* ====================================================
           MOBILE
        ==================================================== */

        @media (max-width: 768px) {
          .section {
            padding: 78px 0;
          }

          .section-container {
            width: calc(100% - 30px);
          }

          .header-inner {
            width: calc(100% - 30px);

            height: 64px;
          }

          .desktop-nav,
          .header-actions {
            display: none;
          }

          .mobile-menu-button {
            display: flex;

            margin-left: auto;
          }

          .mobile-nav {
            display: flex;

            flex-direction: column;

            gap: 3px;

            padding: 10px 15px 18px;

            border-top:
              1px solid
              var(--border);

            background:
              rgba(8,11,18,0.97);
          }

          .mobile-nav > a {
            padding: 12px;

            color: var(--text-secondary);

            border-radius: 8px;

            text-decoration: none;

            font-size: 0.82rem;
          }

          .mobile-nav > a:hover {
            color: var(--text-primary);

            background:
              rgba(255,255,255,0.04);
          }

          .mobile-nav-actions {
            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 8px;

            padding-top: 10px;
          }

          .hero-section {
            min-height: auto;

            padding: 70px 0 75px;
          }

          .hero-container {
            width: calc(100% - 30px);

            gap: 40px;
          }

          .hero-content h1 {
            font-size:
              clamp(2.55rem, 12vw, 3.65rem);
          }

          .hero-description {
            font-size: 0.88rem;
          }

          .hero-actions {
            flex-direction: column;

            align-items: stretch;
          }

          .hero-actions .btn {
            width: 100%;
          }

          .hero-trust {
            display: grid;

            grid-template-columns: 1fr;

            gap: 8px;

            width: max-content;
            max-width: 100%;

            margin-left: auto;
            margin-right: auto;

            text-align: left;
          }

          .hero-preview {
            min-height: 350px;

            margin: 0 -5px;
          }

          .browser-window {
            border-radius: 13px;
          }

          .browser-bar {
            height: 35px;
          }

          .browser-url {
            font-size: 0.48rem;
          }

          .dashboard-preview {
            grid-template-columns: 74px 1fr;

            min-height: 320px;
          }

          .preview-sidebar {
            padding: 11px 5px;
          }

          .preview-brand {
            justify-content: center;

            margin-bottom: 15px;
          }

          .preview-brand span,
          .preview-menu span {
            display: none;
          }

          .preview-menu {
            justify-content: center;

            padding: 8px 4px;
          }

          .preview-main {
            padding: 11px;
          }

          .preview-top h3 {
            font-size: 0.74rem;
          }

          .preview-top small {
            font-size: 0.44rem;
          }

          .question-card {
            padding: 11px;
          }

          .question-card h4 {
            font-size: 0.66rem;
          }

          .preview-stats {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .preview-stat {
            padding: 6px;

            gap: 4px;
          }

          .stat-icon {
            width: 20px;
            height: 20px;
          }

          .preview-stat small {
            font-size: 0.39rem;
          }

          .preview-stat strong {
            font-size: 0.54rem;
          }

          .ai-feedback {
            padding: 7px;
          }

          .ai-feedback p {
            font-size: 0.43rem;
          }

          .floating-card {
            min-width: 120px;

            padding: 7px;

            transform: scale(0.88);
          }

          .floating-card-left {
            left: -8px;
            top: 40px;
          }

          .floating-card-right {
            right: -9px;
            bottom: 35px;
          }

          .intro-inner {
            align-items: flex-start;

            flex-direction: column;

            padding: 20px 0;

            gap: 14px;
          }

          .intro-items {
            display: grid;

            grid-template-columns:
              repeat(2, 1fr);

            gap: 9px 16px;

            width: 100%;
          }

          .features-grid,
          .steps-grid {
            grid-template-columns: 1fr;
          }

          .feature-card,
          .step-card {
            min-height: auto;
          }

          .capabilities-content {
            padding: 38px 22px;
          }

          .capabilities-visual {
            min-height: 310px;
          }

          .ai-core {
            width: 80px;
            height: 80px;
          }

          .ring-one {
            width: 190px;
            height: 190px;
          }

          .ring-two {
            width: 255px;
            height: 255px;
          }

          .chip-one {
            top: 48px;
            right: 18px;
          }

          .chip-two {
            bottom: 48px;
            left: 16px;
          }

          .chip-three {
            bottom: 77px;
            right: 15px;
          }

          .cta-section {
            padding-bottom: 78px;
          }

          .cta-card {
            padding: 55px 20px;

            border-radius: 18px;
          }

          .cta-actions {
            flex-direction: column;

            align-items: stretch;
          }

          .cta-actions .btn {
            width: 100%;
          }

          .footer-main {
            flex-direction: column;

            gap: 35px;

            padding: 40px 0;
          }

          .footer-links {
            gap: 55px;
          }

          .footer-bottom {
            flex-wrap: wrap;

            padding: 17px 0;
          }

          .footer-bottom span:nth-child(2) {
            margin-left: 0;
          }
        }

        /* ====================================================
           SMALL MOBILE
        ==================================================== */

        @media (max-width: 430px) {
          .brand-text strong {
            font-size: 0.82rem;
          }

          .brand-text span {
            font-size: 0.58rem;
          }

          .hero-badge {
            font-size: 0.61rem;

            padding: 6px 9px;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 0.84rem;
          }

          .hero-preview {
            min-height: 285px;
          }

          .dashboard-preview {
            min-height: 270px;
          }

          .preview-stats {
            display: none;
          }

          .ai-feedback {
            display: none;
          }

          .question-card {
            margin-top: 5px;
          }

          .floating-card {
            transform: scale(0.76);
          }

          .floating-card-left {
            left: -20px;
          }

          .floating-card-right {
            right: -20px;
          }

          .section-heading h2,
          .capabilities-content h2,
          .cta-content h2 {
            font-size: 1.95rem;
          }

          .section-heading p {
            font-size: 0.82rem;
          }

          .intro-items div {
            font-size: 0.59rem;
          }

          .faq-question {
            font-size: 0.75rem;
          }

          .faq-answer p {
            font-size: 0.68rem;
          }

          .footer-links {
            gap: 40px;
          }
        }

        /* ====================================================
           REDUCED MOTION
        ==================================================== */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}