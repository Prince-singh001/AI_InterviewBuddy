import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileCheck,
  FileText,
  Layers,
  Menu,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ============================================================
// DATA DEFINITIONS
// ============================================================

const features = [
  {
    icon: Bot,
    title: 'AI Mock Interviews',
    description:
      'Practice realistic interviews across technical, behavioral, HR, and AI/ML tracks with an adaptive AI interviewer.',
  },
  {
    icon: BrainCircuit,
    title: 'Adaptive Questions',
    description:
      'Questions dynamically adjust in depth and complexity based on your responses, target role, and seniority level.',
  },
  {
    icon: FileText,
    title: 'Resume Intelligence',
    description:
      'Extract critical skills, detect ATS gaps, and receive targeted improvement recommendations tailored to your profile.',
  },
  {
    icon: Briefcase,
    title: 'Job Match Analysis',
    description:
      'Compare your background with target job descriptions to identify missing keywords, requirements, and prep priorities.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description:
      'Measure your answer clarity, relevance, technical depth, and track your readiness progression over time.',
  },
  {
    icon: Target,
    title: 'Career Preparation',
    description:
      'Convert interview feedback and resume analysis into a structured, step-by-step career advancement plan.',
  },
]

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Build your profile',
    description:
      'Configure your target role, primary tech stack, seniority, and preferred interview domains.',
  },
  {
    number: '02',
    icon: Briefcase,
    title: 'Understand your target',
    description:
      'Upload your resume or paste a job description to pinpoint key skill gaps and focus areas.',
  },
  {
    number: '03',
    icon: Bot,
    title: 'Practice with AI',
    description:
      'Engage in interactive mock interviews with conversational audio or text-based question simulations.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Improve with feedback',
    description:
      'Receive structured scoring on relevance, technical accuracy, clarity, and personalized recommendations.',
  },
]

const interviewTypes = [
  { label: 'Technical', count: '120+ Scenarios', icon: Code2 },
  { label: 'Behavioral', count: 'STAR Method', icon: MessageSquare },
  { label: 'HR', count: 'Culture & Fit', icon: Briefcase },
  { label: 'AI / ML', count: 'Deep Learning & LLMs', icon: BrainCircuit },
  { label: 'Python', count: 'Algorithms & Architecture', icon: Layers },
  { label: 'Software Engineering', count: 'System Design', icon: Target },
  { label: 'Coding', count: 'Live Problem Solving', icon: Zap },
  { label: 'Role Specific', count: 'Tailored Tracks', icon: Award },
]

const faqs = [
  {
    question: 'How does the AI interview work?',
    answer:
      'You choose your target role, interview type (technical, behavioral, or HR), seniority, and format. Interviewer Buddy AI generates realistic, context-aware interview questions, listens to your answers, and dynamically adapts follow-up questions just like a human interviewer.',
  },
  {
    question: 'What types of interviews can I practice?',
    answer:
      'You can practice technical engineering interviews, system design discussions, behavioral sessions (STAR framework), HR screening calls, and specialized AI/ML or Python role assessments.',
  },
  {
    question: 'Can I analyze my resume?',
    answer:
      'Yes. Upload your PDF or doc resume to receive automated ATS readiness scores, extracted competencies, identified experience gaps, and tailored suggestions to strengthen your applications.',
  },
  {
    question: 'Can I analyze a job description?',
    answer:
      'Yes. Simply paste the job description text. Our AI analyzes the role requirements, compares them against your experience, and generates a personalized preparation plan highlighting missing qualifications.',
  },
  {
    question: 'How are interview answers evaluated?',
    answer:
      'Each answer is evaluated across multiple dimensions: contextual relevance, technical correctness, structural coherence, communication clarity, and problem-solving depth. You receive concrete suggestions to elevate your score.',
  },
]

// ======================
// HELPER COMPONENTS
// ======================

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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`faq-item ${open ? 'faq-item-open' : ''}`}
    >
      <button
        type="button"
        className="faq-question-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="faq-question-text">{question}</span>
        <span className="faq-icon-wrapper">
          <ChevronDown
            size={18}
            className={`faq-chevron ${open ? 'faq-chevron-rotated' : ''}`}
          />
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="faq-answer-body"
        >
          <p>{answer}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================
// HERO DASHBOARD MOCKUP
// ============================================================

function HeroDashboardMockup() {
  return (
    <div className="hero-mockup-wrapper">
      <div className="mockup-subtle-glow" />

      {/* Main Mockup Window */}
      <div className="mockup-window">
        {/* Browser Top Bar */}
        <div className="mockup-header-bar">
          <div className="window-dots">
            <span className="dot dot-one" />
            <span className="dot dot-two" />
            <span className="dot dot-three" />
          </div>

          <div className="window-url-pill">
            <ShieldCheck size={13} className="url-shield" />
            <span>interviewerbuddy.ai/session/python-developer</span>
          </div>

          <div className="window-status-pill">
            <span className="pulse-indicator" />
            <span className="status-label">Live AI Session</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mockup-body">
          {/* Inner Sidebar */}
          <div className="mockup-sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-logo-box">
                <Bot size={15} />
              </div>
              <span className="sidebar-brand-name">Buddy AI</span>
            </div>

            <div className="sidebar-nav-items">
              <div className="sidebar-item active">
                <MessageSquare size={14} />
                <span>Interview</span>
              </div>
              <div className="sidebar-item">
                <BarChart3 size={14} />
                <span>Analytics</span>
              </div>
              <div className="sidebar-item">
                <FileText size={14} />
                <span>Resume</span>
              </div>
              <div className="sidebar-item">
                <Briefcase size={14} />
                <span>Job Match</span>
              </div>
            </div>

            <div className="sidebar-session-box">
              <span className="session-tag">TRACK</span>
              <span className="session-role">Python Developer</span>
            </div>
          </div>

          {/* Main Interview Panel */}
          <div className="mockup-content">
            {/* Header / Info */}
            <div className="interview-top-row">
              <div className="role-meta">
                <span className="role-sub">AI MOCK INTERVIEW</span>
                <h4 className="role-title">Python Developer — Technical Round</h4>
              </div>

              <div className="duration-tag">
                <span className="recording-dot" />
                <span>AI Listening</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="mockup-question-box">
              <div className="question-badge">
                <Sparkles size={13} />
                <span>Question 04 of 08</span>
              </div>

              <h5 className="question-text">
                "Explain the difference between a list and a tuple in Python, and when would you choose one over the other for performance-critical systems?"
              </h5>

              {/* Real-time wave / answer state */}
              <div className="answer-capture-box">
                <div className="capture-status">
                  <span className="wave-bars">
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                  </span>
                  <span className="capture-text">Candidate responding (01:42)...</span>
                </div>
                <div className="answer-preview-snippet">
                  "Lists are mutable and incur additional over-allocation overhead, whereas tuples are immutable, memory-efficient, and can be hashed..."
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="mockup-scores-grid">
              <div className="score-tile">
                <div className="score-icon-box">
                  <Target size={15} />
                </div>
                <div className="score-details">
                  <span className="tile-label">Relevance Score</span>
                  <strong className="tile-value">94%</strong>
                </div>
              </div>

              <div className="score-tile">
                <div className="score-icon-box">
                  <MessageSquare size={15} />
                </div>
                <div className="score-details">
                  <span className="tile-label">Clarity Score</span>
                  <strong className="tile-value">91%</strong>
                </div>
              </div>

              <div className="score-tile">
                <div className="score-icon-box">
                  <TrendingUp size={15} />
                </div>
                <div className="score-details">
                  <span className="tile-label">Overall Progress</span>
                  <strong className="tile-value">68%</strong>
                </div>
              </div>
            </div>

            {/* AI Feedback Strip */}
            <div className="mockup-feedback-banner">
              <div className="feedback-bot-avatar">
                <Bot size={15} />
              </div>
              <div className="feedback-content">
                <span className="feedback-title">Real-time AI Feedback</span>
                <p className="feedback-p">
                  Precise distinction of memory allocation. Mentioning dictionary key hashing reinforced strong senior-level comprehension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Widget 1: Score */}
      <motion.div
        className="floating-widget float-top-right"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <div className="widget-score-pill">8.8</div>
        <div className="widget-info">
          <span className="widget-label">AI Interview Score</span>
          <strong className="widget-highlight">Strong answer structure</strong>
        </div>
      </motion.div>

      {/* Floating Widget 2: Feedback */}
      <motion.div
        className="floating-widget float-bottom-left"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
      >
        <div className="widget-icon-pill">
          <CheckCircle2 size={16} />
        </div>
        <div className="widget-info">
          <span className="widget-label">AI Feedback</span>
          <strong className="widget-highlight">High relevance & depth</strong>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================
// MAIN LANDING COMPONENT
// ============================================================

export default function Landing() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleRegister = () => {
    setMobileMenuOpen(false)
    navigate('/register')
  }

  const handleLogin = () => {
    setMobileMenuOpen(false)
    navigate('/login')
  }

  return (
    <div className="landing-wrapper">
      {/* ======================================================
          STICKY NAVBAR
      ====================================================== */}
      <header className="sticky-navbar">
        <div className="navbar-container">
          {/* Logo & Product Name */}
          <button
            type="button"
            className="navbar-brand-btn"
            onClick={() => navigate('/')}
            aria-label="Interviewer Buddy AI Home"
          >
            <div className="brand-logo-icon">
              <Bot size={22} />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">Interviewer Buddy AI</span>
              <span className="brand-subtitle">AI Interview Preparation</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="navbar-desktop-nav" aria-label="Main Navigation">
            <a href="#features" className="nav-anchor">
              Features
            </a>
            <a href="#how-it-works" className="nav-anchor">
              How It Works
            </a>
            <a href="#ai-capabilities" className="nav-anchor">
              AI Capabilities
            </a>
            <a href="#resume-intelligence" className="nav-anchor">
              Resume Intelligence
            </a>
            <a href="#faq" className="nav-anchor">
              FAQ
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="navbar-action-group">
            <button
              type="button"
              className="btn btn-outline-clean"
              onClick={handleLogin}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary-blue"
              onClick={handleRegister}
            >
              Get Started
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-drawer"
          >
            <div className="mobile-nav-links">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                How It Works
              </a>
              <a
                href="#ai-capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                AI Capabilities
              </a>
              <a
                href="#resume-intelligence"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Resume Intelligence
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                FAQ
              </a>
            </div>

            <div className="mobile-actions-row">
              <button
                type="button"
                className="btn btn-outline-clean w-full"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary-blue w-full"
                onClick={handleRegister}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </header>

      <main>
        {/* ====================================================
            HERO SECTION
        ==================================================== */}
        <section className="hero-section">
          {/* Subtle background overlay image with clean light blue tint */}
          <div className="hero-bg-visual" />
          <div className="hero-radial-backdrop" />

          <div className="section-container hero-grid-container">
            {/* Left Column: Copy & Actions */}
            <motion.div
              className="hero-text-block"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="hero-badge-pill">
                <span className="badge-sparkle-dot" />
                <Sparkles size={14} className="badge-sparkle-icon" />
                <span>Next-Generation AI Interview Platform</span>
              </div>

              <h1 className="hero-heading">
                Prepare smarter.
                <br />
                <span className="hero-heading-gradient">Interview better.</span>
              </h1>

              <p className="hero-subtext">
                Practice realistic interviews, analyze your resume, understand job requirements, and improve with structured AI feedback.
              </p>

              <div className="hero-cta-buttons">
                <button
                  type="button"
                  className="btn btn-hero-primary"
                  onClick={handleRegister}
                >
                  <Zap size={18} />
                  <span>Start Practicing</span>
                  <ArrowRight size={17} />
                </button>

                <a href="#how-it-works" className="btn btn-hero-secondary">
                  <Play size={16} />
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Supporting Points */}
              <div className="hero-supporting-points">
                <div className="support-item">
                  <div className="support-check">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Technical interviews</span>
                </div>

                <div className="support-item">
                  <div className="support-check">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Behavioral interviews</span>
                </div>

                <div className="support-item">
                  <div className="support-check">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>AI/ML preparation</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Dashboard Mockup */}
            <motion.div
              className="hero-visual-block"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <HeroDashboardMockup />
            </motion.div>
          </div>
        </section>

        {/* ====================================================
            METRIC STRIP / TRUST BANNER
        ==================================================== */}
        <section className="metric-strip-section">
          <div className="section-container metric-strip-grid">
            <div className="metric-col">
              <Bot size={20} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-title">Adaptive Simulations</span>
                <span className="metric-desc">Contextual AI questions matching real roles</span>
              </div>
            </div>

            <div className="metric-col">
              <FileCheck size={20} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-title">Resume & ATS Screening</span>
                <span className="metric-desc">Uncover critical gaps before recruiters do</span>
              </div>
            </div>

            <div className="metric-col">
              <Briefcase size={20} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-title">Job Match Intelligence</span>
                <span className="metric-desc">Map competencies directly to requirements</span>
              </div>
            </div>

            <div className="metric-col">
              <BarChart3 size={20} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-title">Deep Performance Analytics</span>
                <span className="metric-desc">Granular scores on clarity, depth, and pacing</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            FEATURES SECTION (6 CARDS)
        ==================================================== */}
        <section id="features" className="section-padding features-section">
          <div className="section-container">
            <div className="section-heading-box text-center">
              <div className="section-pill-tag">
                <Sparkles size={13} />
                <span>Comprehensive Preparation</span>
              </div>
              <h2 className="section-headline">
                Everything you need to master your interview
              </h2>
              <p className="section-subheadline">
                Built specifically for software engineers, data scientists, and tech professionals aiming for top-tier roles.
              </p>
            </div>

            <div className="features-grid-6">
              {features.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={item.title}
                    className="feature-card-white"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                  >
                    <div className="feature-icon-bubble">
                      <IconComponent size={22} />
                    </div>

                    <h3 className="feature-card-title">{item.title}</h3>
                    <p className="feature-card-desc">{item.description}</p>

                    <div className="feature-card-footer">
                      <span className="explore-tag">
                        Explore capabilities
                        <ArrowRight size={14} className="explore-arrow" />
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            HOW IT WORKS (4-STEP WORKFLOW)
        ==================================================== */}
        <section id="how-it-works" className="section-padding workflow-section">
          <div className="section-container">
            <div className="section-heading-box text-center">
              <div className="section-pill-tag">
                <Target size={13} />
                <span>Step-by-Step Workflow</span>
              </div>
              <h2 className="section-headline">
                How Interviewer Buddy AI Works
              </h2>
              <p className="section-subheadline">
                A proven 4-stage pipeline designed to take you from foundational preparation to interview mastery.
              </p>
            </div>

            <div className="steps-container-grid">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                return (
                  <motion.div
                    key={step.number}
                    className="step-card-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.09 }}
                  >
                    <div className="step-top-badge-row">
                      <span className="step-number-pill">{step.number}</span>
                      <div className="step-icon-circle">
                        <StepIcon size={20} />
                      </div>
                    </div>

                    <h3 className="step-item-title">{step.title}</h3>
                    <p className="step-item-desc">{step.description}</p>

                    {index < steps.length - 1 && (
                      <div className="step-desktop-connector" aria-hidden="true" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            AI INTERVIEW SHOWCASE SECTION
        ==================================================== */}
        <section id="ai-capabilities" className="section-padding showcase-section">
          <div className="section-container">
            <div className="showcase-two-column-layout">
              {/* Left Column: AI Capabilities Explanation */}
              <motion.div
                className="showcase-info-col"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="section-pill-tag">
                  <BrainCircuit size={13} />
                  <span>Adaptive Intelligence</span>
                </div>

                <h2 className="showcase-headline">
                  An AI interviewer that adapts to you in real time
                </h2>

                <p className="showcase-lead-p">
                  Unlike static question banks, our AI simulates authentic conversation. It analyzes your syntax, architecture decisions, and thought articulation to guide you toward interview excellence.
                </p>

                <div className="showcase-feature-list">
                  <div className="showcase-feature-item">
                    <div className="feature-check-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="feature-item-content">
                      <strong>Role-aware questions</strong>
                      <p>Questions tailored directly to your target company profile, tech stack, and seniority requirements.</p>
                    </div>
                  </div>

                  <div className="showcase-feature-item">
                    <div className="feature-check-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="feature-item-content">
                      <strong>Structured evaluation</strong>
                      <p>Instant scoring broken down across relevance, clarity, depth of knowledge, and answer structure.</p>
                    </div>
                  </div>

                  <div className="showcase-feature-item">
                    <div className="feature-check-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="feature-item-content">
                      <strong>Progress-focused feedback</strong>
                      <p>Actionable, non-judgmental guidance pinpointing exact moments you can sharpen your narrative.</p>
                    </div>
                  </div>
                </div>

                <div className="showcase-btn-row">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    Start AI Mock Interview
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Right Column: Professional Online Image with Dashboard Overlay */}
              <motion.div
                className="showcase-visual-col"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="showcase-image-wrapper">
                  {/* Remote Professional Workspace / Interview Photo */}
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                    alt="Professional candidate participating in a remote AI mock interview"
                    className="showcase-base-img"
                    loading="lazy"
                  />
                  <div className="showcase-blue-gradient-overlay" />

                  {/* Overlaid Live AI Interview Dashboard Card */}
                  <div className="showcase-overlay-card">
                    <div className="overlay-card-header">
                      <div className="overlay-badge">
                        <Bot size={14} />
                        <span>AI Interviewer</span>
                      </div>
                      <span className="overlay-status-live">
                        <span className="live-pulsing-dot" />
                        Live Status
                      </span>
                    </div>

                    <div className="overlay-role-row">
                      <strong className="overlay-role-name">Python Developer Track</strong>
                      <span className="overlay-badge-blue">Senior Level</span>
                    </div>

                    <div className="overlay-question-strip">
                      <span className="overlay-label">CURRENT QUESTION</span>
                      <p className="overlay-q-text">
                        "Describe how Python garbage collection manages reference cycles and the impact of the generational collector."
                      </p>
                    </div>

                    <div className="overlay-metrics-bars">
                      <div className="metric-bar-item">
                        <div className="bar-labels">
                          <span>Relevance</span>
                          <strong>95%</strong>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: '95%' }} />
                        </div>
                      </div>

                      <div className="metric-bar-item">
                        <div className="bar-labels">
                          <span>Clarity</span>
                          <strong>92%</strong>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: '92%' }} />
                        </div>
                      </div>

                      <div className="metric-bar-item">
                        <div className="bar-labels">
                          <span>Structure</span>
                          <strong>90%</strong>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: '90%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            RESUME INTELLIGENCE SECTION
        ==================================================== */}
        <section id="resume-intelligence" className="section-padding resume-section">
          <div className="section-container">
            <div className="resume-grid-two-col">
              {/* Left Column: Stylized Resume Document Card */}
              <motion.div
                className="resume-visual-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="stylized-resume-card">
                  <div className="resume-header-row">
                    <div className="resume-candidate-meta">
                      <div className="resume-avatar-circle">AC</div>
                      <div>
                        <h4 className="resume-name">Alex Chen</h4>
                        <span className="resume-title">Senior Software Engineer</span>
                      </div>
                    </div>

                    <div className="resume-score-pill">
                      <span className="score-num">88%</span>
                      <span className="score-label">Resume Readiness</span>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="resume-section-block">
                    <div className="resume-block-title">
                      <Sparkles size={14} />
                      <span>Skills Detected & Extracted</span>
                    </div>
                    <div className="resume-tags-list">
                      <span className="resume-skill-tag highlight">Python 3.12</span>
                      <span className="resume-skill-tag highlight">FastAPI</span>
                      <span className="resume-skill-tag highlight">System Architecture</span>
                      <span className="resume-skill-tag">PostgreSQL</span>
                      <span className="resume-skill-tag">Docker</span>
                      <span className="resume-skill-tag">Kubernetes</span>
                      <span className="resume-skill-tag">AWS Cloud</span>
                      <span className="resume-skill-tag">Redis</span>
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="resume-section-block">
                    <div className="resume-block-title">
                      <Briefcase size={14} />
                      <span>Experience & Highlights</span>
                    </div>
                    <div className="resume-exp-item">
                      <div className="exp-row-top">
                        <strong>Staff Backend Engineer • CloudTech</strong>
                        <span>2021 — Present</span>
                      </div>
                      <p className="exp-bullet">
                        • Spearheaded migration to asynchronous event-driven microservices serving 45,000 req/sec.
                      </p>
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="resume-section-block">
                    <div className="resume-block-title">
                      <Code2 size={14} />
                      <span>Projects & Open Source</span>
                    </div>
                    <div className="resume-proj-item">
                      <strong>Distributed Task Orchestrator</strong>
                      <p>High-throughput queue architecture built with Python & Redis.</p>
                    </div>
                  </div>

                  {/* AI Insights Box */}
                  <div className="resume-ai-insights-box">
                    <div className="insight-top">
                      <Bot size={15} />
                      <strong>AI Resume Insights</strong>
                    </div>
                    <p className="insight-p">
                      Strong backend architecture metrics. Adding quantitative throughput indicators in the primary project description will improve ATS score by ~7%.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Copy & Explanation */}
              <motion.div
                className="resume-copy-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="section-pill-tag">
                  <FileText size={13} />
                  <span>Resume & Career Alignment</span>
                </div>

                <h2 className="section-headline">
                  Turn your resume into your strongest competitive advantage
                </h2>

                <p className="resume-lead-text">
                  Most candidates fail interviews before they begin due to mismatched resume positioning and undetected skill gaps. Our AI conducts deep parsing to ensure you stand out.
                </p>

                <div className="resume-benefits-list">
                  <div className="benefit-item">
                    <div className="benefit-icon-box">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="benefit-title">Extract relevant skills</h4>
                      <p className="benefit-desc">
                        Identify hard competencies, framework proficiencies, and structural terminology across all sections.
                      </p>
                    </div>
                  </div>

                  <div className="benefit-item">
                    <div className="benefit-icon-box">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="benefit-title">Identify resume improvements</h4>
                      <p className="benefit-desc">
                        Get specific, actionable phrasing suggestions to increase impact metrics and pass ATS filter thresholds.
                      </p>
                    </div>
                  </div>

                  <div className="benefit-item">
                    <div className="benefit-icon-box">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="benefit-title">Compare skills with job requirements</h4>
                      <p className="benefit-desc">
                        Directly cross-reference your documented accomplishments against target job specs to evaluate match percentage.
                      </p>
                    </div>
                  </div>

                  <div className="benefit-item">
                    <div className="benefit-icon-box">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="benefit-title">Turn gaps into preparation priorities</h4>
                      <p className="benefit-desc">
                        Automatically transform missing criteria into customized mock interview questions so you are never caught unprepared.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="resume-btn-row">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    Analyze Your Resume
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            INTERVIEW TYPES SECTION (PILLS / CHIPS)
        ==================================================== */}
        <section className="section-padding interview-types-section">
          <div className="section-container">
            <div className="section-heading-box text-center">
              <div className="section-pill-tag">
                <Layers size={13} />
                <span>Diverse Interview Disciplines</span>
              </div>
              <h2 className="section-headline">
                Practice across every major interview category
              </h2>
              <p className="section-subheadline">
                Tailored interview sessions simulating realistic hiring committee evaluations across core domains.
              </p>
            </div>

            <div className="interview-types-pills-grid">
              {interviewTypes.map((type, index) => {
                const TypeIcon = type.icon
                return (
                  <motion.div
                    key={type.label}
                    className="interview-type-pill"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    whileHover={{ y: -3 }}
                  >
                    <div className="pill-icon-box">
                      <TypeIcon size={18} />
                    </div>
                    <div className="pill-text-block">
                      <span className="pill-title">{type.label}</span>
                      <span className="pill-subtitle">{type.count}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            WORKSPACE SHOWCASE STRIP
        ==================================================== */}
        <section className="section-padding workspace-strip-section">
          <div className="section-container">
            <div className="workspace-card-inner">
              <div className="workspace-content-side">
                <div className="section-pill-tag">
                  <Award size={13} />
                  <span>Real Interview Simulation</span>
                </div>
                <h2 className="workspace-title">
                  Simulate high-stakes interviews in a realistic setting
                </h2>
                <p className="workspace-p">
                  Our intuitive interface recreates the exact atmosphere of live screening calls. Practice verbal articulation, code whiteboard explanations, and scenario-based inquiries until confidence becomes second nature.
                </p>
                <div className="workspace-cta-wrap">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    Start Free Practice Session
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <div className="workspace-image-side">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern tech workspace interview preparation"
                  className="workspace-img"
                  loading="lazy"
                />
                <div className="workspace-img-overlay" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            ACCORDION FAQ SECTION
        ==================================================== */}
        <section id="faq" className="section-padding faq-section">
          <div className="section-container faq-constrained-container">
            <div className="section-heading-box text-center">
              <div className="section-pill-tag">
                <MessageSquare size={13} />
                <span>Got Questions?</span>
              </div>
              <h2 className="section-headline">Frequently Asked Questions</h2>
              <p className="section-subheadline">
                Everything you need to know about our AI interview platform, resume intelligence, and preparation workflows.
              </p>
            </div>

            <div className="faq-accordion-list">
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
            CALL TO ACTION (CTA) SECTION
        ==================================================== */}
        <section className="section-padding cta-section-wrap">
          <div className="section-container">
            <motion.div
              className="cta-gradient-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="cta-pattern-overlay" />
              <div className="cta-inner-content">
                <div className="section-pill-tag mx-auto">
                  <Zap size={13} />
                  <span>Begin Today</span>
                </div>

                <h2 className="cta-headline">
                  Your next interview starts with better preparation.
                </h2>

                <p className="cta-subheadline">
                  Join candidates preparing for technical, behavioral, and role-specific interviews with structured AI simulations and targeted feedback.
                </p>

                <div className="cta-button-group">
                  <button
                    type="button"
                    className="btn btn-cta-main"
                    onClick={handleRegister}
                  >
                    <span>Create Your Account</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-cta-secondary"
                    onClick={handleLogin}
                  >
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ======================================================
          PROFESSIONAL FOOTER
      ====================================================== */}
      <footer className="footer-container-wrap">
        <div className="section-container">
          <div className="footer-top-grid">
            {/* Branding Column */}
            <div className="footer-brand-col">
              <div className="footer-brand-badge">
                <div className="footer-logo-box">
                  <Bot size={20} />
                </div>
                <span className="footer-brand-name">Interviewer Buddy AI</span>
              </div>
              <p className="footer-brand-bio">
                The premier AI-powered interview preparation platform. Master technical rounds, behavioral assessments, and resume alignment with actionable evaluation.
              </p>
              <div className="footer-copyright-note">
                © 2026 Interviewer Buddy AI. All rights reserved.
              </div>
            </div>

            {/* Product Links */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Product</h4>
              <ul className="footer-nav-list">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="#ai-capabilities">AI Capabilities</a>
                </li>
                <li>
                  <a href="#resume-intelligence">Resume Intelligence</a>
                </li>
              </ul>
            </div>

            {/* Resources & Support */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Resources</h4>
              <ul className="footer-nav-list">
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-link-btn"
                    onClick={handleLogin}
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-link-btn"
                    onClick={handleRegister}
                  >
                    Create Account
                  </button>
                </li>
              </ul>
            </div>

            {/* GitHub & Connect */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Connect</h4>
              <p className="footer-connect-text">
                Follow project development and open source updates.
              </p>
              <a
                href="https://github.com/Prince-singh001"
                target="_blank"
                rel="noopener noreferrer"
                className="github-profile-link"
                aria-label="Visit Prince Singh on GitHub"
              >
                <GitHubIcon size={18} />
                <span>Prince-singh001</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>Built with React, TypeScript & FastAPI</span>
            <span className="footer-dot">•</span>
            <span>Clean Light Blue Architecture</span>
          </div>
        </div>
      </footer>

      {/* ======================================================
          SELF-CONTAINED PRODUCTION STYLES
          Color Palette Enforced:
          - #E3F2FD (Very Light Blue)
          - #90CAF9 (Soft Blue)
          - #2196F3 (Primary Blue)
          - #0D47A1 (Deep Blue)
          - #FFFFFF (White)
      ====================================================== */}
      <style>{`
        /* Global Page Reset & Fonts */
        .landing-wrapper {
          width: 100%;
          min-height: 100vh;
          background-color: #FFFFFF;
          color: #0D47A1;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
          overflow-x: hidden;
          line-height: 1.5;
        }

        .landing-wrapper *,
        .landing-wrapper *::before,
        .landing-wrapper *::after {
          box-sizing: border-box;
        }

        /* Responsive Container */
        .section-container {
          width: 100%;
          max-width: 1240px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        .section-padding {
          padding-top: 96px;
          padding-bottom: 96px;
        }

        .text-center {
          text-align: center;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .w-full {
          width: 100%;
        }

        /* Section Headings */
        .section-heading-box {
          max-width: 760px;
          margin-bottom: 60px;
        }

        .section-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background-color: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 18px;
        }

        .section-headline {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0D47A1;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin-top: 0;
          margin-bottom: 16px;
        }

        .section-subheadline {
          font-size: 1.0625rem;
          color: #334155;
          line-height: 1.6;
          margin: 0;
        }

        /* ====================================================
           BUTTONS
        ==================================================== */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          text-decoration: none;
          border: none;
          font-family: inherit;
        }

        .btn-outline-clean {
          background-color: #FFFFFF;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          padding: 8px 18px;
          font-size: 0.875rem;
        }

        .btn-outline-clean:hover {
          background-color: #E3F2FD;
          border-color: #2196F3;
        }

        .btn-primary-blue {
          background-color: #2196F3;
          color: #FFFFFF;
          padding: 9px 20px;
          font-size: 0.875rem;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.28);
        }

        .btn-primary-blue:hover {
          background-color: #0D47A1;
          box-shadow: 0 6px 16px rgba(13, 71, 161, 0.32);
          transform: translateY(-1px);
        }

        .btn-hero-primary {
          background-color: #2196F3;
          color: #FFFFFF;
          padding: 14px 28px;
          font-size: 1rem;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.35);
        }

        .btn-hero-primary:hover {
          background-color: #0D47A1;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(13, 71, 161, 0.35);
        }

        .btn-hero-secondary {
          background-color: #FFFFFF;
          color: #0D47A1;
          border: 1.5px solid #90CAF9;
          padding: 14px 26px;
          font-size: 1rem;
          border-radius: 12px;
        }

        .btn-hero-secondary:hover {
          background-color: #E3F2FD;
          border-color: #2196F3;
          transform: translateY(-2px);
        }

        /* ====================================================
           HEADER & NAVBAR
        ==================================================== */
        .sticky-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #E3F2FD;
          box-shadow: 0 2px 10px rgba(13, 71, 161, 0.04);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .navbar-brand-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }

        .brand-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(33, 150, 243, 0.3);
        }

        .brand-text-col {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0D47A1;
          letter-spacing: -0.015em;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 0.75rem;
          font-weight: 500;
          color: #2196F3;
        }

        .navbar-desktop-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-anchor {
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          text-decoration: none;
          transition: color 0.18s ease;
        }

        .nav-anchor:hover {
          color: #2196F3;
        }

        .navbar-action-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: 1px solid #90CAF9;
          border-radius: 8px;
          padding: 7px;
          color: #0D47A1;
          cursor: pointer;
        }

        .mobile-drawer {
          display: none;
          padding: 20px 24px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #90CAF9;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .mobile-link {
          font-size: 1rem;
          font-weight: 600;
          color: #0D47A1;
          text-decoration: none;
        }

        .mobile-actions-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ====================================================
           HERO SECTION
        ==================================================== */
        .hero-section {
          position: relative;
          padding-top: 80px;
          padding-bottom: 100px;
          background: linear-gradient(180deg, #FFFFFF 0%, #E3F2FD 50%, #FFFFFF 100%);
          overflow: hidden;
        }

        .hero-bg-visual {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=80');
          background-size: cover;
          background-position: center;
          opacity: 0.035;
          pointer-events: none;
        }

        .hero-radial-backdrop {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(144, 202, 249, 0.4) 0%, rgba(227, 242, 253, 0) 70%);
          pointer-events: none;
        }

        .hero-grid-container {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr 1.08fr;
          gap: 48px;
          align-items: center;
        }

        .hero-text-block {
          max-width: 580px;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background-color: #FFFFFF;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(13, 71, 161, 0.05);
        }

        .badge-sparkle-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #2196F3;
        }

        .badge-sparkle-icon {
          color: #2196F3;
        }

        .hero-heading {
          font-size: 3.5rem;
          font-weight: 850;
          color: #0D47A1;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-top: 0;
          margin-bottom: 20px;
        }

        .hero-heading-gradient {
          color: #2196F3;
          display: inline-block;
        }

        .hero-subtext {
          font-size: 1.125rem;
          color: #334155;
          line-height: 1.65;
          margin-top: 0;
          margin-bottom: 32px;
        }

        .hero-cta-buttons {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
        }

        .hero-supporting-points {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .support-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0D47A1;
        }

        .support-check {
          color: #2196F3;
          display: flex;
          align-items: center;
        }

        /* ====================================================
           HERO DASHBOARD MOCKUP
        ==================================================== */
        .hero-mockup-wrapper {
          position: relative;
          width: 100%;
        }

        .mockup-subtle-glow {
          position: absolute;
          inset: -15px;
          background: radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, rgba(227, 242, 253, 0) 70%);
          border-radius: 24px;
          filter: blur(20px);
          z-index: 1;
        }

        .mockup-window {
          position: relative;
          z-index: 2;
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(13, 71, 161, 0.12), 0 1px 3px rgba(13, 71, 161, 0.05);
          overflow: hidden;
        }

        .mockup-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background-color: #E3F2FD;
          border-bottom: 1px solid #90CAF9;
        }

        .window-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .dot-one { background-color: #90CAF9; }
        .dot-two { background-color: #2196F3; }
        .dot-three { background-color: #0D47A1; }

        .window-url-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 12px;
          background-color: #FFFFFF;
          border-radius: 6px;
          border: 1px solid #90CAF9;
          font-size: 0.6875rem;
          color: #0D47A1;
          font-weight: 500;
        }

        .url-shield {
          color: #2196F3;
        }

        .window-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pulse-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #2196F3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.25);
        }

        .status-label {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 140px 1fr;
          min-height: 380px;
        }

        .mockup-sidebar {
          background-color: #FFFFFF;
          border-right: 1px solid #E3F2FD;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-logo-box {
          width: 26px;
          height: 26px;
          background: #2196F3;
          color: #FFFFFF;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-brand-name {
          font-size: 0.8125rem;
          font-weight: 800;
          color: #0D47A1;
        }

        .sidebar-nav-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }

        .sidebar-item.active {
          background-color: #E3F2FD;
          color: #0D47A1;
        }

        .sidebar-session-box {
          margin-top: auto;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          border-radius: 6px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .session-tag {
          font-size: 0.5625rem;
          font-weight: 700;
          color: #2196F3;
        }

        .session-role {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #0D47A1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mockup-content {
          padding: 20px;
          background-color: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .interview-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .role-sub {
          font-size: 0.625rem;
          font-weight: 700;
          color: #2196F3;
          letter-spacing: 0.05em;
        }

        .role-title {
          font-size: 0.9375rem;
          font-weight: 800;
          color: #0D47A1;
          margin: 2px 0 0 0;
        }

        .duration-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          border-radius: 20px;
          font-size: 0.6875rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .recording-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #2196F3;
        }

        .mockup-question-box {
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(13, 71, 161, 0.04);
        }

        .question-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2196F3;
          font-size: 0.6875rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .question-text {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0D47A1;
          line-height: 1.45;
          margin: 0 0 12px 0;
        }

        .answer-capture-box {
          background-color: #E3F2FD;
          border-radius: 8px;
          padding: 10px 12px;
          border-left: 3px solid #2196F3;
        }

        .capture-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .wave-bars {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 12px;
        }

        .wave-bars .bar {
          width: 2px;
          background-color: #2196F3;
          border-radius: 2px;
          animation: wave 1.2s infinite ease-in-out;
        }

        .wave-bars .bar:nth-child(1) { height: 6px; animation-delay: 0.1s; }
        .wave-bars .bar:nth-child(2) { height: 12px; animation-delay: 0.2s; }
        .wave-bars .bar:nth-child(3) { height: 8px; animation-delay: 0.3s; }
        .wave-bars .bar:nth-child(4) { height: 11px; animation-delay: 0.4s; }
        .wave-bars .bar:nth-child(5) { height: 5px; animation-delay: 0.5s; }

        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        .capture-text {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .answer-preview-snippet {
          font-size: 0.75rem;
          color: #334155;
          font-style: italic;
          line-height: 1.35;
        }

        .mockup-scores-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .score-tile {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #FFFFFF;
          border: 1px solid #90CAF9;
          border-radius: 8px;
          padding: 8px 10px;
        }

        .score-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background-color: #E3F2FD;
          color: #2196F3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .score-details {
          display: flex;
          flex-direction: column;
        }

        .tile-label {
          font-size: 0.5625rem;
          font-weight: 600;
          color: #475569;
        }

        .tile-value {
          font-size: 0.9375rem;
          font-weight: 800;
          color: #0D47A1;
          line-height: 1.1;
        }

        .mockup-feedback-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          border-radius: 8px;
        }

        .feedback-bot-avatar {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background-color: #2196F3;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feedback-title {
          font-size: 0.6875rem;
          font-weight: 800;
          color: #0D47A1;
          display: block;
        }

        .feedback-p {
          font-size: 0.7188rem;
          color: #334155;
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        /* Floating Cards */
        .floating-widget {
          position: absolute;
          z-index: 20;
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 12px 28px rgba(13, 71, 161, 0.16);
        }

        .float-top-right {
          top: -24px;
          right: -20px;
        }

        .float-bottom-left {
          bottom: -20px;
          left: -20px;
        }

        .widget-score-pill {
          background-color: #2196F3;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 1rem;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .widget-icon-pill {
          background-color: #E3F2FD;
          color: #2196F3;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .widget-info {
          display: flex;
          flex-direction: column;
        }

        .widget-label {
          font-size: 0.625rem;
          font-weight: 600;
          color: #475569;
        }

        .widget-highlight {
          font-size: 0.8125rem;
          font-weight: 750;
          color: #0D47A1;
        }

        /* ====================================================
           METRIC STRIP
        ==================================================== */
        .metric-strip-section {
          background-color: #FFFFFF;
          border-top: 1px solid #E3F2FD;
          border-bottom: 1px solid #E3F2FD;
          padding: 36px 0;
        }

        .metric-strip-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .metric-col {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .metric-icon {
          color: #2196F3;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .metric-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-title {
          font-size: 0.9375rem;
          font-weight: 800;
          color: #0D47A1;
        }

        .metric-desc {
          font-size: 0.8125rem;
          color: #475569;
          line-height: 1.4;
        }

        /* ====================================================
           FEATURES SECTION (6 CARDS)
        ==================================================== */
        .features-section {
          background-color: #FFFFFF;
        }

        .features-grid-6 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .feature-card-white {
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 16px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 16px rgba(13, 71, 161, 0.05);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .feature-card-white:hover {
          transform: translateY(-4px);
          border-color: #2196F3;
          box-shadow: 0 12px 30px rgba(33, 150, 243, 0.16);
        }

        .feature-icon-bubble {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: #E3F2FD;
          color: #2196F3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border: 1px solid #90CAF9;
        }

        .feature-card-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0D47A1;
          margin: 0 0 12px 0;
        }

        .feature-card-desc {
          font-size: 0.9375rem;
          color: #334155;
          line-height: 1.6;
          margin: 0 0 24px 0;
          flex-grow: 1;
        }

        .feature-card-footer {
          margin-top: auto;
        }

        .explore-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #2196F3;
        }

        .explore-arrow {
          transition: transform 0.18s ease;
        }

        .feature-card-white:hover .explore-arrow {
          transform: translateX(4px);
        }

        /* ====================================================
           HOW IT WORKS (4 STEPS)
        ==================================================== */
        .workflow-section {
          background-color: #E3F2FD;
        }

        .steps-container-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
        }

        .step-card-item {
          position: relative;
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 16px;
          padding: 30px 24px;
          box-shadow: 0 6px 18px rgba(13, 71, 161, 0.05);
        }

        .step-top-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .step-number-pill {
          font-size: 0.875rem;
          font-weight: 850;
          color: #0D47A1;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .step-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #2196F3;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-item-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: #0D47A1;
          margin: 0 0 10px 0;
        }

        .step-item-desc {
          font-size: 0.875rem;
          color: #334155;
          line-height: 1.55;
          margin: 0;
        }

        /* ====================================================
           AI INTERVIEW SHOWCASE SECTION
        ==================================================== */
        .showcase-section {
          background-color: #FFFFFF;
        }

        .showcase-two-column-layout {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 60px;
          align-items: center;
        }

        .showcase-info-col {
          max-width: 540px;
        }

        .showcase-headline {
          font-size: 2.375rem;
          font-weight: 850;
          color: #0D47A1;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin: 16px 0 18px 0;
        }

        .showcase-lead-p {
          font-size: 1.0625rem;
          color: #334155;
          line-height: 1.65;
          margin: 0 0 28px 0;
        }

        .showcase-feature-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 36px;
        }

        .showcase-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .feature-check-icon {
          color: #2196F3;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-item-content strong {
          display: block;
          font-size: 1rem;
          color: #0D47A1;
          margin-bottom: 4px;
        }

        .feature-item-content p {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }

        .showcase-image-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid #90CAF9;
          box-shadow: 0 20px 48px rgba(13, 71, 161, 0.15);
        }

        .showcase-base-img {
          width: 100%;
          height: 480px;
          object-fit: cover;
          display: block;
        }

        .showcase-blue-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13, 71, 161, 0.15) 0%, rgba(13, 71, 161, 0.85) 100%);
        }

        .showcase-overlay-card {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          border: 1px solid #90CAF9;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
        }

        .overlay-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .overlay-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #2196F3;
          color: #FFFFFF;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .overlay-status-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .live-pulsing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #2196F3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
        }

        .overlay-role-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .overlay-role-name {
          font-size: 1rem;
          font-weight: 800;
          color: #0D47A1;
        }

        .overlay-badge-blue {
          background-color: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.6875rem;
          font-weight: 700;
        }

        .overlay-question-strip {
          background-color: #E3F2FD;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 14px;
        }

        .overlay-label {
          font-size: 0.625rem;
          font-weight: 800;
          color: #2196F3;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 2px;
        }

        .overlay-q-text {
          font-size: 0.8125rem;
          color: #0D47A1;
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
        }

        .overlay-metrics-bars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .metric-bar-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.6875rem;
          color: #475569;
        }

        .bar-labels strong {
          color: #0D47A1;
        }

        .bar-track {
          height: 6px;
          background-color: #E3F2FD;
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background-color: #2196F3;
          border-radius: 3px;
        }

        /* ====================================================
           RESUME INTELLIGENCE SECTION
        ==================================================== */
        .resume-section {
          background-color: #FFFFFF;
          border-top: 1px solid #E3F2FD;
        }

        .resume-grid-two-col {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .stylized-resume-card {
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 16px 36px rgba(13, 71, 161, 0.08);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .resume-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E3F2FD;
          padding-bottom: 16px;
        }

        .resume-candidate-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .resume-avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #2196F3;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .resume-name {
          font-size: 1.0625rem;
          font-weight: 800;
          color: #0D47A1;
          margin: 0;
        }

        .resume-title {
          font-size: 0.8125rem;
          color: #475569;
          font-weight: 500;
        }

        .resume-score-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          border-radius: 8px;
          padding: 6px 12px;
        }

        .score-num {
          font-size: 1.125rem;
          font-weight: 850;
          color: #0D47A1;
          line-height: 1.1;
        }

        .score-label {
          font-size: 0.625rem;
          font-weight: 600;
          color: #2196F3;
        }

        .resume-section-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .resume-block-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 750;
          color: #2196F3;
          letter-spacing: 0.03em;
        }

        .resume-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .resume-skill-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background-color: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
        }

        .resume-skill-tag.highlight {
          background-color: #2196F3;
          color: #FFFFFF;
          border-color: #2196F3;
        }

        .resume-exp-item,
        .resume-proj-item {
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.8125rem;
        }

        .exp-row-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .exp-row-top strong {
          color: #0D47A1;
        }

        .exp-row-top span {
          color: #64748B;
          font-size: 0.75rem;
        }

        .exp-bullet {
          color: #334155;
          margin: 0;
          line-height: 1.4;
        }

        .resume-proj-item strong {
          color: #0D47A1;
          display: block;
          margin-bottom: 2px;
        }

        .resume-proj-item p {
          color: #475569;
          margin: 0;
          line-height: 1.35;
        }

        .resume-ai-insights-box {
          background-color: #E3F2FD;
          border-left: 3px solid #2196F3;
          border-radius: 8px;
          padding: 12px 14px;
        }

        .insight-top {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #0D47A1;
          font-size: 0.8125rem;
          margin-bottom: 4px;
        }

        .insight-p {
          font-size: 0.7813rem;
          color: #334155;
          margin: 0;
          line-height: 1.45;
        }

        .resume-copy-col {
          max-width: 540px;
        }

        .resume-lead-text {
          font-size: 1.0625rem;
          color: #334155;
          line-height: 1.6;
          margin: 0 0 28px 0;
        }

        .resume-benefits-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 36px;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .benefit-icon-box {
          color: #2196F3;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .benefit-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0D47A1;
          margin: 0 0 3px 0;
        }

        .benefit-desc {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
          line-height: 1.45;
        }

        /* ====================================================
           INTERVIEW TYPES SECTION (PILLS)
        ==================================================== */
        .interview-types-section {
          background-color: #E3F2FD;
        }

        .interview-types-pills-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .interview-type-pill {
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 12px rgba(13, 71, 161, 0.04);
          transition: border-color 0.2s ease, transform 0.2s ease;
          cursor: pointer;
        }

        .interview-type-pill:hover {
          border-color: #2196F3;
          background-color: #FFFFFF;
        }

        .pill-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background-color: #E3F2FD;
          color: #2196F3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pill-text-block {
          display: flex;
          flex-direction: column;
        }

        .pill-title {
          font-size: 0.9375rem;
          font-weight: 800;
          color: #0D47A1;
        }

        .pill-subtitle {
          font-size: 0.75rem;
          color: #475569;
          font-weight: 500;
        }

        /* ====================================================
           WORKSPACE SHOWCASE STRIP
        ==================================================== */
        .workspace-strip-section {
          background-color: #FFFFFF;
        }

        .workspace-card-inner {
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 20px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          box-shadow: 0 16px 40px rgba(13, 71, 161, 0.08);
        }

        .workspace-content-side {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .workspace-title {
          font-size: 2.125rem;
          font-weight: 850;
          color: #0D47A1;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin: 16px 0;
        }

        .workspace-p {
          font-size: 1rem;
          color: #334155;
          line-height: 1.65;
          margin: 0 0 28px 0;
        }

        .workspace-image-side {
          position: relative;
          min-height: 380px;
        }

        .workspace-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .workspace-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(33, 150, 243, 0.2) 100%);
        }

        /* ====================================================
           ACCORDION FAQ SECTION
        ==================================================== */
        .faq-section {
          background-color: #E3F2FD;
        }

        .faq-constrained-container {
          max-width: 860px;
        }

        .faq-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .faq-item {
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .faq-item-open {
          border-color: #2196F3;
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.12);
        }

        .faq-question-btn {
          width: 100%;
          background: none;
          border: none;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
        }

        .faq-question-text {
          font-size: 1.0625rem;
          font-weight: 750;
          color: #0D47A1;
        }

        .faq-icon-wrapper {
          color: #2196F3;
          display: flex;
          align-items: center;
        }

        .faq-chevron {
          transition: transform 0.25s ease;
        }

        .faq-chevron-rotated {
          transform: rotate(180deg);
        }

        .faq-answer-body {
          padding: 0 24px 20px 24px;
          border-top: 1px solid #E3F2FD;
        }

        .faq-answer-body p {
          font-size: 0.9375rem;
          color: #334155;
          line-height: 1.65;
          margin: 16px 0 0 0;
        }

        /* ====================================================
           CTA SECTION
        ==================================================== */
        .cta-section-wrap {
          background-color: #FFFFFF;
        }

        .cta-gradient-card {
          position: relative;
          background: linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E3F2FD 100%);
          border: 2px solid #90CAF9;
          border-radius: 24px;
          padding: 64px 32px;
          text-align: center;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(13, 71, 161, 0.08);
        }

        .cta-pattern-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#90CAF9 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.35;
          pointer-events: none;
        }

        .cta-inner-content {
          position: relative;
          z-index: 10;
          max-width: 680px;
          margin: 0 auto;
        }

        .cta-headline {
          font-size: 2.5rem;
          font-weight: 850;
          color: #0D47A1;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin: 16px 0;
        }

        .cta-subheadline {
          font-size: 1.125rem;
          color: #334155;
          line-height: 1.65;
          margin: 0 0 36px 0;
        }

        .cta-button-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .btn-cta-main {
          background-color: #2196F3;
          color: #FFFFFF;
          padding: 14px 30px;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(33, 150, 243, 0.32);
        }

        .btn-cta-main:hover {
          background-color: #0D47A1;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(13, 71, 161, 0.35);
        }

        .btn-cta-secondary {
          background-color: #FFFFFF;
          color: #0D47A1;
          border: 1.5px solid #90CAF9;
          padding: 14px 28px;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 12px;
        }

        .btn-cta-secondary:hover {
          background-color: #E3F2FD;
          border-color: #2196F3;
          transform: translateY(-2px);
        }

        /* ====================================================
           FOOTER
        ==================================================== */
        .footer-container-wrap {
          background-color: #FFFFFF;
          border-top: 1.5px solid #90CAF9;
          padding: 72px 0 36px 0;
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .footer-brand-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .footer-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #2196F3;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-brand-name {
          font-size: 1.125rem;
          font-weight: 850;
          color: #0D47A1;
        }

        .footer-brand-bio {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 20px 0;
          max-width: 340px;
        }

        .footer-copyright-note {
          font-size: 0.8125rem;
          color: #64748B;
        }

        .footer-col-heading {
          font-size: 0.9375rem;
          font-weight: 800;
          color: #0D47A1;
          margin: 0 0 18px 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .footer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-nav-list a {
          font-size: 0.875rem;
          color: #475569;
          text-decoration: none;
          transition: color 0.18s ease;
        }

        .footer-nav-list a:hover {
          color: #2196F3;
        }

        .footer-link-btn {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.875rem;
          color: #475569;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: color 0.18s ease;
        }

        .footer-link-btn:hover {
          color: #2196F3;
        }

        .footer-connect-text {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
          margin: 0 0 14px 0;
        }

        .github-profile-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #E3F2FD;
          color: #0D47A1;
          border: 1px solid #90CAF9;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: background-color 0.18s ease, border-color 0.18s ease;
        }

        .github-profile-link:hover {
          background-color: #FFFFFF;
          border-color: #2196F3;
        }

        .footer-bottom-bar {
          border-top: 1px solid #E3F2FD;
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.8125rem;
          color: #64748B;
        }

        .footer-dot {
          color: #90CAF9;
        }

        /* ====================================================
           RESPONSIVE BREAKPOINTS
        ==================================================== */
        @media (max-width: 1080px) {
          .hero-grid-container {
            grid-template-columns: 1fr;
            gap: 56px;
          }

          .hero-text-block {
            max-width: 100%;
            text-align: center;
          }

          .hero-cta-buttons {
            justify-content: center;
          }

          .hero-supporting-points {
            justify-content: center;
          }

          .features-grid-6 {
            grid-template-columns: repeat(2, 1fr);
          }

          .steps-container-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .step-desktop-connector {
            display: none;
          }

          .showcase-two-column-layout {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .resume-grid-two-col {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .workspace-card-inner {
            grid-template-columns: 1fr;
          }

          .interview-types-pills-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-top-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }

        @media (max-width: 820px) {
          .navbar-desktop-nav,
          .navbar-action-group {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-drawer {
            display: block;
          }

          .metric-strip-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .features-grid-6 {
            grid-template-columns: 1fr;
          }

          .hero-heading {
            font-size: 2.75rem;
          }
        }

        @media (max-width: 600px) {
          .section-padding {
            padding-top: 60px;
            padding-bottom: 60px;
          }

          .hero-heading {
            font-size: 2.25rem;
          }

          .hero-cta-buttons {
            flex-direction: column;
            width: 100%;
          }

          .btn-hero-primary,
          .btn-hero-secondary {
            width: 100%;
          }

          .mockup-body {
            grid-template-columns: 1fr;
          }

          .mockup-sidebar {
            display: none;
          }

          .floating-widget {
            display: none;
          }

          .metric-strip-grid {
            grid-template-columns: 1fr;
          }

          .steps-container-grid {
            grid-template-columns: 1fr;
          }

          .interview-types-pills-grid {
            grid-template-columns: 1fr;
          }

          .workspace-content-side {
            padding: 32px 20px;
          }

          .cta-headline {
            font-size: 1.875rem;
          }

          .cta-button-group {
            flex-direction: column;
            width: 100%;
          }

          .btn-cta-main,
          .btn-cta-secondary {
            width: 100%;
          }

          .footer-top-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Accessibility: Prefers Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  )
}