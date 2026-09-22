import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  FileCheck,
  FileText,
  History,
  Layers,
  Menu,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// DATA DEFINITIONS (PRESERVED CONTENT)
// ============================================================

const features = [
  {
    icon: Bot,
    title: "AI Mock Interviews",
    description:
      "Practice realistic interviews across technical, behavioral, HR, and AI/ML tracks with an adaptive AI interviewer.",
  },
  {
    icon: BrainCircuit,
    title: "Adaptive Questions",
    description:
      "Questions dynamically adjust in depth and complexity based on your responses, target role, and seniority level.",
  },
  {
    icon: FileText,
    title: "Resume Intelligence",
    description:
      "Extract critical skills, detect ATS gaps, and receive targeted improvement recommendations tailored to your profile.",
  },
  {
    icon: Briefcase,
    title: "Job Match Analysis",
    description:
      "Compare your background with target job descriptions to identify missing keywords, requirements, and prep priorities.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Measure your answer clarity, relevance, technical depth, and track your readiness progression over time.",
  },
  {
    icon: Target,
    title: "Career Preparation",
    description:
      "Convert interview feedback and resume analysis into a structured, step-by-step career advancement plan.",
  },
];

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Build your profile",
    description:
      "Configure your target role, primary tech stack, seniority, and preferred interview domains.",
  },
  {
    number: "02",
    icon: Briefcase,
    title: "Understand your target",
    description:
      "Upload your resume or paste a job description to pinpoint key skill gaps and focus areas.",
  },
  {
    number: "03",
    icon: Bot,
    title: "Practice with AI",
    description:
      "Engage in interactive mock interviews with conversational audio or text-based question simulations.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Improve with feedback",
    description:
      "Receive structured scoring on relevance, technical accuracy, clarity, and personalized recommendations.",
  },
];

const interviewTypes = [
  { label: "Technical", count: "120+ Scenarios", icon: Code2 },
  { label: "Behavioral", count: "STAR Method", icon: MessageSquare },
  { label: "HR", count: "Culture & Fit", icon: Briefcase },
  { label: "AI / ML", count: "Deep Learning & LLMs", icon: BrainCircuit },
  { label: "Python", count: "Algorithms & Architecture", icon: Layers },
  { label: "Software Engineering", count: "System Design", icon: Target },
  { label: "Coding", count: "Live Problem Solving", icon: Zap },
  { label: "Role Specific", count: "Tailored Tracks", icon: Award },
];

const faqs = [
  {
    question: "How does the AI interview work?",
    answer:
      "You choose your target role, interview type (technical, behavioral, or HR), seniority, and format. Interviewer Buddy AI generates realistic, context-aware interview questions, listens to your answers, and dynamically adapts follow-up questions just like a human interviewer.",
  },
  {
    question: "What types of interviews can I practice?",
    answer:
      "You can practice technical engineering interviews, system design discussions, behavioral sessions (STAR framework), HR screening calls, and specialized AI/ML or Python role assessments.",
  },
  {
    question: "Can I analyze my resume?",
    answer:
      "Yes. Upload your PDF or doc resume to receive automated ATS readiness insights, extracted competencies, identified experience gaps, and tailored suggestions to strengthen your applications.",
  },
  {
    question: "Can I analyze a job description?",
    answer:
      "Yes. Simply paste the job description text. Our AI analyzes the role requirements, compares them against your experience, and generates a personalized preparation plan highlighting missing qualifications.",
  },
  {
    question: "How are interview answers evaluated?",
    answer:
      "Each answer is evaluated across multiple dimensions: contextual relevance, technical correctness, structural coherence, communication clarity, and problem-solving depth. You receive concrete suggestions to elevate your performance.",
  },
];

// ============================================================
// HELPER COMPONENTS
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
  );
}

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`faq-item ${open ? "faq-item-open" : ""}`}
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
            className={`faq-chevron ${open ? "faq-chevron-rotated" : ""}`}
          />
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="faq-answer-body"
        >
          <p>{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// HERO DASHBOARD PREVIEW (PURE CSS/REACT - ZERO VIDEO)
// ============================================================

function HeroDashboardMockup() {
  return (
    <div className="hero-mockup-wrapper">
      <div className="mockup-subtle-glow" />

      {/* Main Mockup Window */}
      <div className="mockup-window">
        {/* Browser Header Bar */}
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
                <h4 className="role-title">
                  Python Developer — Technical Round
                </h4>
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
                "Explain the difference between a list and a tuple in Python,
                and when would you choose one over the other for
                performance-critical systems?"
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
                  <span className="capture-text">
                    Candidate responding (01:42)...
                  </span>
                </div>
                <div className="answer-preview-snippet">
                  "Lists are mutable and incur additional over-allocation
                  overhead, whereas tuples are immutable, memory-efficient, and
                  can be hashed..."
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
                  Precise distinction of memory allocation. Mentioning
                  dictionary key hashing reinforced strong senior-level
                  comprehension.
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
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
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
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
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
  );
}

// ============================================================
// MAIN LANDING COMPONENT
// ============================================================

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRegister = () => {
    setMobileMenuOpen(false);
    navigate("/register");
  };

  const handleLogin = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="landing-wrapper">
      {/* ======================================================
          1. NAVBAR
      ====================================================== */}
      <header className="sticky-navbar">
        <div className="navbar-container">
          {/* Logo & Product Name */}
          <button
            type="button"
            className="navbar-brand-btn"
            onClick={() => navigate("/")}
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
            <a href="#technical-prep" className="nav-anchor">
              Technical Prep
            </a>
            <a href="#resume-intelligence" className="nav-anchor">
              Resume Intelligence
            </a>
            <a href="#feedback-metrics" className="nav-anchor">
              Feedback
            </a>
            <a href="#interview-history" className="nav-anchor">
              History
            </a>
            <a href="#how-it-works" className="nav-anchor">
              How It Works
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
            animate={{ opacity: 1, height: "auto" }}
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
                href="#technical-prep"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Technical Prep
              </a>
              <a
                href="#resume-intelligence"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Resume Intelligence
              </a>
              <a
                href="#feedback-metrics"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Feedback & Confidence
              </a>
              <a
                href="#interview-history"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                History & Progress
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                How It Works
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
            2. HERO SECTION
        ==================================================== */}
        <section className="hero-section">
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
                Practice realistic interviews, analyze your resume, understand
                job requirements, and improve with structured AI feedback.
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
            3. FEATURE INTRO / VALUE STRIP
        ==================================================== */}
        <section className="metric-strip-section">
          <div className="section-container metric-strip-grid">
            <div className="metric-col">
              <div className="metric-icon-box">
                <Bot size={20} className="metric-icon" />
              </div>
              <div className="metric-text">
                <span className="metric-title">Adaptive Simulations</span>
                <span className="metric-desc">
                  Contextual AI questions matching real engineering roles
                </span>
              </div>
            </div>

            <div className="metric-col">
              <div className="metric-icon-box">
                <FileCheck size={20} className="metric-icon" />
              </div>
              <div className="metric-text">
                <span className="metric-title">Resume & ATS Screening</span>
                <span className="metric-desc">
                  Uncover critical gaps before hiring managers do
                </span>
              </div>
            </div>

            <div className="metric-col">
              <div className="metric-icon-box">
                <Briefcase size={20} className="metric-icon" />
              </div>
              <div className="metric-text">
                <span className="metric-title">Job Match Intelligence</span>
                <span className="metric-desc">
                  Map competencies directly to requirements
                </span>
              </div>
            </div>

            <div className="metric-col">
              <div className="metric-icon-box">
                <BarChart3 size={20} className="metric-icon" />
              </div>
              <div className="metric-text">
                <span className="metric-title">Deep Performance Analytics</span>
                <span className="metric-desc">
                  Granular scores on clarity, depth, and pacing
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            4. FEATURES SECTION (6 CARDS)
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
                Built specifically for software engineers, data scientists, and
                tech professionals aiming for top-tier roles.
              </p>
            </div>

            <div className="features-grid-6">
              {features.map((item, index) => {
                const IconComponent = item.icon;
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
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            5. TECHNICAL INTERVIEW SECTION (IMAGE: tech.png)
        ==================================================== */}
        <section
          id="technical-prep"
          className="section-padding visual-feature-section bg-light-tint"
        >
          <div className="section-container">
            <div className="two-column-feature-grid">
              {/* Image Side: tech.png */}
              <motion.div
                className="feature-image-col"
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="visual-image-card">
                  <div className="image-badge-floating">
                    <Code2 size={15} />
                    <span>Technical Track</span>
                  </div>
                  <img
                    src="/images/landing/tech.png"
                    alt="Technical Interview Preparation and Coding Simulation"
                    className="feature-png-image"
                    loading="lazy"
                  />
                  <div className="image-card-accent-bar" />
                </div>
              </motion.div>

              {/* Content Side */}
              <motion.div
                className="feature-content-col"
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="section-pill-tag">
                  <Code2 size={13} />
                  <span>Technical Interview Simulation</span>
                </div>

                <h2 className="section-headline">
                  Master live technical questions and system architecture
                </h2>

                <p className="section-subheadline">
                  Simulate high-stakes technical interviews with adaptive,
                  role-specific questions. Whether defending data structures or
                  architecting distributed systems, practice answering with
                  senior-level depth.
                </p>

                <div className="feature-bullet-stack">
                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">Role-Based Preparation</h4>
                      <p className="bullet-desc">
                        Tailor practice sessions to Python developers,
                        full-stack engineers, AI/ML specialists, and backend
                        architects.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Dynamic Follow-Up Questions
                      </h4>
                      <p className="bullet-desc">
                        The AI interviewer actively listens to your
                        explanations, challenging trade-offs, edge cases, and
                        performance decisions.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Conceptual & Architectural Rigor
                      </h4>
                      <p className="bullet-desc">
                        Sharpen verbal articulation of complex technical topics
                        so you speak with clarity and confidence.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section-btn-wrapper">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    <span>Practice Technical Interview</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            6. RESUME INTELLIGENCE SECTION (IMAGE: resume.png)
        ==================================================== */}
        <section
          id="resume-intelligence"
          className="section-padding visual-feature-section"
        >
          <div className="section-container">
            <div className="two-column-feature-grid reverse-on-desktop">
              {/* Content Side */}
              <motion.div
                className="feature-content-col"
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="section-pill-tag">
                  <FileText size={13} />
                  <span>Resume Intelligence & ATS Insights</span>
                </div>

                <h2 className="section-headline">
                  Turn your resume into your strongest competitive advantage
                </h2>

                <p className="section-subheadline">
                  Ensure your experience, accomplishments, and tech stack pass
                  recruiter ATS screens and align seamlessly with target job
                  requisitions.
                </p>

                <div className="feature-bullet-stack">
                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Skills & Framework Extraction
                      </h4>
                      <p className="bullet-desc">
                        Automatically extract technical proficiencies,
                        frameworks, and architecture patterns from your PDF or
                        doc resume.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Experience & Project Alignment
                      </h4>
                      <p className="bullet-desc">
                        Analyze past accomplishments against industry standards
                        to identify impactful phrasing and missing quantitative
                        metrics.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Gaps to Preparation Priorities
                      </h4>
                      <p className="bullet-desc">
                        Transform identified experience gaps into custom
                        interview drills so you are never caught unprepared.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section-btn-wrapper">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    <span>Analyze Your Resume</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Image Side: resume.png */}
              <motion.div
                className="feature-image-col"
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="visual-image-card">
                  <div className="image-badge-floating">
                    <FileCheck size={15} />
                    <span>ATS Intelligence</span>
                  </div>
                  <img
                    src="/images/landing/resume.png"
                    alt="Resume Intelligence and ATS Analysis"
                    className="feature-png-image"
                    loading="lazy"
                  />
                  <div className="image-card-accent-bar" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            7. CONFIDENCE & FEEDBACK SECTION (IMAGE: confi.png)
        ==================================================== */}
        <section
          id="feedback-metrics"
          className="section-padding visual-feature-section bg-light-tint"
        >
          <div className="section-container">
            <div className="two-column-feature-grid">
              {/* Image Side: confi.png */}
              <motion.div
                className="feature-image-col"
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="visual-image-card">
                  <div className="image-badge-floating">
                    <UserCheck size={15} />
                    <span>Evaluation Report</span>
                  </div>
                  <img
                    src="/images/landing/confi.png"
                    alt="Interview Performance Evaluation and Confidence Analysis"
                    className="feature-png-image"
                    loading="lazy"
                  />
                  <div className="image-card-accent-bar" />
                </div>
              </motion.div>

              {/* Content Side */}
              <motion.div
                className="feature-content-col"
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="section-pill-tag">
                  <Award size={13} />
                  <span>Structured Performance Feedback</span>
                </div>

                <h2 className="section-headline">
                  Build unshakable interview confidence with actionable feedback
                </h2>

                <p className="section-subheadline">
                  Eliminate guesswork from your preparation. Every response is
                  assessed against core hiring committee pillars, giving you
                  clear insights on how to sharpen your delivery.
                </p>

                <div className="feature-bullet-stack">
                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Multi-Dimensional Evaluation
                      </h4>
                      <p className="bullet-desc">
                        Analyze contextual relevance, technical correctness,
                        structural coherence, and communication clarity.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Personalized Improvement Insights
                      </h4>
                      <p className="bullet-desc">
                        Receive constructive, sentence-level suggestions that
                        highlight what worked and where you can articulate more
                        effectively.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Speech Articulation & Pacing
                      </h4>
                      <p className="bullet-desc">
                        Develop a steady, composed speaking rhythm suited for
                        technical deep-dives and executive interviews.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section-btn-wrapper">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    <span>Start Practice Session</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            8. INTERVIEW HISTORY SECTION (IMAGE: history.png)
        ==================================================== */}
        <section
          id="interview-history"
          className="section-padding visual-feature-section"
        >
          <div className="section-container">
            <div className="two-column-feature-grid reverse-on-desktop">
              {/* Content Side */}
              <motion.div
                className="feature-content-col"
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="section-pill-tag">
                  <History size={13} />
                  <span>Continuous Progression</span>
                </div>

                <h2 className="section-headline">
                  Track your interview journey and measure tangible improvement
                </h2>

                <p className="section-subheadline">
                  Review complete transcripts, historical performance metrics,
                  and progressive milestones from every interview session you
                  complete.
                </p>

                <div className="feature-bullet-stack">
                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Comprehensive Session History
                      </h4>
                      <p className="bullet-desc">
                        Access past mock interview transcripts, targeted
                        questions asked, and comprehensive evaluation summaries.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Track Readiness Over Time
                      </h4>
                      <p className="bullet-desc">
                        Observe your growth across multiple tracks and roles,
                        seeing exactly when your answers reach benchmark
                        caliber.
                      </p>
                    </div>
                  </div>

                  <div className="feature-bullet-item">
                    <div className="bullet-icon-wrap">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="bullet-title">
                        Milestones & Targeted Drilldowns
                      </h4>
                      <p className="bullet-desc">
                        Focus subsequent practice sessions on recurring weak
                        points identified in previous interview runs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section-btn-wrapper">
                  <button
                    type="button"
                    className="btn btn-primary-blue"
                    onClick={handleRegister}
                  >
                    <span>View Interview Roadmap</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Image Side: history.png */}
              <motion.div
                className="feature-image-col"
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="visual-image-card">
                  <div className="image-badge-floating">
                    <Clock size={15} />
                    <span>Session History</span>
                  </div>
                  <img
                    src="/images/landing/history.png"
                    alt="Interview History and Performance Tracking"
                    className="feature-png-image"
                    loading="lazy"
                  />
                  <div className="image-card-accent-bar" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            9. HOW IT WORKS (4-STEP PIPELINE)
        ==================================================== */}
        <section
          id="how-it-works"
          className="section-padding workflow-section bg-light-tint"
        >
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
                A proven 4-stage pipeline designed to take you from foundational
                preparation to interview mastery.
              </p>
            </div>

            <div className="steps-container-grid">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
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
                      <div
                        className="step-desktop-connector"
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            10. AI CAPABILITIES SECTION
        ==================================================== */}
        <section
          id="ai-capabilities"
          className="section-padding ai-capabilities-section"
        >
          <div className="section-container">
            <div className="section-heading-box text-center">
              <div className="section-pill-tag">
                <BrainCircuit size={13} />
                <span>Intelligent Technology</span>
              </div>
              <h2 className="section-headline">
                Powered by state-of-the-art conversational AI
              </h2>
              <p className="section-subheadline">
                Engineered to replicate actual engineering manager questions,
                technical challenges, and live follow-up dynamics.
              </p>
            </div>

            <div className="ai-capabilities-grid">
              <motion.div
                className="ai-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="ai-card-icon-box">
                  <BrainCircuit size={24} />
                </div>
                <h3 className="ai-card-title">Role-Aware Simulations</h3>
                <p className="ai-card-text">
                  Questions are generated based on seniority, domain
                  requirements, and specific frameworks rather than static
                  generic question banks.
                </p>
              </motion.div>

              <motion.div
                className="ai-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="ai-card-icon-box">
                  <BarChart3 size={24} />
                </div>
                <h3 className="ai-card-title">Objective Evaluation</h3>
                <p className="ai-card-text">
                  Instant scoring broken down across relevance, clarity, depth
                  of knowledge, and answer structure without human bias.
                </p>
              </motion.div>

              <motion.div
                className="ai-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="ai-card-icon-box">
                  <TrendingUp size={24} />
                </div>
                <h3 className="ai-card-title">Actionable Guidance</h3>
                <p className="ai-card-text">
                  Clear, non-judgmental guidance pinpointing exact moments you
                  can sharpen your narrative and clarify technical choices.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            11. INTERVIEW DISCIPLINES (CATEGORIES)
        ==================================================== */}
        <section className="section-padding interview-types-section bg-light-tint">
          <div className="section-container">
            <div className="section-heading-box text-center">
              <div className="section-pill-tag">
                <Layers size={13} />
                <span>Diverse Disciplines</span>
              </div>
              <h2 className="section-headline">
                Practice across every major interview category
              </h2>
              <p className="section-subheadline">
                Tailored interview sessions simulating realistic hiring
                committee evaluations across core domains.
              </p>
            </div>

            <div className="interview-types-pills-grid">
              {interviewTypes.map((type, index) => {
                const TypeIcon = type.icon;
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
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            12. ACCORDION FAQ SECTION
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
                Everything you need to know about our AI interview platform,
                resume intelligence, and preparation workflows.
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

        {/*====================================================
            13. FINAL CALL TO ACTION (CTA)
        ====================================================*/}
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
                <div className="section-pill-tag cta-pill">
                  <Zap size={13} />
                  <span>Begin Today</span>
                </div>

                <h2 className="cta-headline">
                  Your next interview starts with better preparation.
                </h2>

                <p className="cta-subheadline">
                  Join candidates preparing for technical, behavioral, and
                  role-specific interviews with structured AI simulations and
                  targeted feedback.
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
          14.FOOTER
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
                The premier AI-powered interview preparation platform. Master
                technical rounds, behavioral assessments, and resume alignment
                with actionable evaluation.
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
                  <a href="#technical-prep">Technical Prep</a>
                </li>
                <li>
                  <a href="#resume-intelligence">Resume Intelligence</a>
                </li>
                <li>
                  <a href="#feedback-metrics">Feedback & Confidence</a>
                </li>
                <li>
                  <a href="#interview-history">History & Progress</a>
                </li>
                <li>
                  <a href="#how-it-works">How It Works</a>
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

      {/*====================================================== */}
      <style>{`
        /* ----------------------------------------------------
           GLOBAL RESET & LAYOUT
        ---------------------------------------------------- */
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

        .section-container {
          width: 100%;
          max-width: 1240px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        .section-padding {
          padding-top: 88px;
          padding-bottom: 88px;
        }

        .bg-light-tint {
          background-color: #F8FBFE;
          border-top: 1px solid #E3F2FD;
          border-bottom: 1px solid #E3F2FD;
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
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 56px;
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
          margin-bottom: 16px;
        }

        .section-headline {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: #0D47A1;
          line-height: 1.22;
          letter-spacing: -0.025em;
          margin-top: 0;
          margin-bottom: 16px;
        }

        .section-subheadline {
          font-size: clamp(0.95rem, 1.5vw, 1.0625rem);
          color: #334155;
          line-height: 1.6;
          margin: 0;
        }

        /* ----------------------------------------------------
           BUTTONS
        ---------------------------------------------------- */
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
          padding: 10px 22px;
          font-size: 0.875rem;
          box-shadow: 0 4px 14px rgba(33, 150, 243, 0.28);
        }

        .btn-primary-blue:hover {
          background-color: #0D47A1;
          box-shadow: 0 6px 18px rgba(13, 71, 161, 0.32);
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
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
        }

        .btn-hero-secondary:hover {
          background-color: #E3F2FD;
          border-color: #2196F3;
          transform: translateY(-2px);
        }

        /* ----------------------------------------------------
           1. NAVBAR
        ---------------------------------------------------- */
        .sticky-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #E3F2FD;
          box-shadow: 0 2px 12px rgba(13, 71, 161, 0.04);
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
          gap: 24px;
        }

        .nav-anchor {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          text-decoration: none;
          transition: color 0.18s ease;
          position: relative;
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
          gap: 14px;
          margin-bottom: 20px;
        }

        .mobile-link {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0D47A1;
          text-decoration: none;
          padding: 8px 0;
          border-bottom: 1px solid #F1F5F9;
        }

        .mobile-actions-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ----------------------------------------------------
           2. HERO SECTION
        ---------------------------------------------------- */
        .hero-section {
          position: relative;
          padding-top: 64px;
          padding-bottom: 84px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F5F9FD 100%);
          overflow: hidden;
        }

        .hero-bg-visual {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(33, 150, 243, 0.08) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
          pointer-events: none;
          opacity: 0.7;
        }

        .hero-radial-backdrop {
          position: absolute;
          top: -150px;
          right: 5%;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(144, 202, 249, 0.28) 0%, rgba(227, 242, 253, 0) 70%);
          filter: blur(50px);
          pointer-events: none;
        }

        .hero-grid-container {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 52px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-text-block {
          max-width: 560px;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          color: #0D47A1;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 22px;
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
          font-size: clamp(2.5rem, 4.5vw, 3.5rem);
          font-weight: 850;
          line-height: 1.14;
          letter-spacing: -0.03em;
          color: #0D47A1;
          margin-top: 0;
          margin-bottom: 20px;
        }

        .hero-heading-gradient {
          background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtext {
          font-size: clamp(1rem, 1.6vw, 1.15rem);
          color: #334155;
          line-height: 1.62;
          margin-top: 0;
          margin-bottom: 32px;
        }

        .hero-cta-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .hero-supporting-points {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          padding-top: 18px;
          border-top: 1px solid #E3F2FD;
        }

        .support-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .support-check {
          color: #2196F3;
          display: flex;
        }

        /* ----------------------------------------------------
           HERO MOCKUP PREVIEW
        ---------------------------------------------------- */
        .hero-mockup-wrapper {
          position: relative;
          width: 100%;
        }

        .mockup-subtle-glow {
          position: absolute;
          inset: -15px;
          border-radius: 28px;
          background: radial-gradient(circle, rgba(33, 150, 243, 0.18) 0%, rgba(227, 242, 253, 0) 70%);
          filter: blur(24px);
          z-index: 0;
        }

        .mockup-window {
          position: relative;
          z-index: 1;
          background-color: #FFFFFF;
          border-radius: 18px;
          border: 1.5px solid #90CAF9;
          box-shadow: 0 20px 48px rgba(13, 71, 161, 0.12);
          overflow: hidden;
        }

        .mockup-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background-color: #F8FBFE;
          border-bottom: 1px solid #E3F2FD;
        }

        .window-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-one {
          background-color: #EF5350;
        }

        .dot-two {
          background-color: #FFCA28;
        }

        .dot-three {
          background-color: #66BB6A;
        }

        .window-url-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 6px;
          padding: 3px 10px;
          font-size: 0.72rem;
          color: #475569;
          font-family: monospace;
        }

        .url-shield {
          color: #2196F3;
        }

        .window-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #0D47A1;
        }

        .pulse-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #2196F3;
          box-shadow: 0 0 6px #2196F3;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 160px 1fr;
          min-height: 380px;
        }

        .mockup-sidebar {
          background-color: #F8FBFE;
          border-right: 1px solid #E3F2FD;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .sidebar-logo-box {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background-color: #2196F3;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-brand-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .sidebar-nav-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
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
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 8px;
          padding: 10px 8px;
          margin-top: auto;
        }

        .session-tag {
          display: block;
          font-size: 0.625rem;
          font-weight: 700;
          color: #2196F3;
          letter-spacing: 0.05em;
        }

        .session-role {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .mockup-content {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .interview-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #F1F5F9;
        }

        .role-sub {
          font-size: 0.65rem;
          font-weight: 700;
          color: #2196F3;
          letter-spacing: 0.04em;
        }

        .role-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0D47A1;
          margin: 2px 0 0 0;
        }

        .duration-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #2196F3;
          background-color: #E3F2FD;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .recording-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #2196F3;
        }

        .mockup-question-box {
          background-color: #F8FBFE;
          border: 1px solid #E3F2FD;
          border-radius: 10px;
          padding: 14px;
        }

        .question-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #2196F3;
          margin-bottom: 6px;
        }

        .question-text {
          font-size: 0.84rem;
          font-weight: 600;
          color: #0D47A1;
          line-height: 1.45;
          margin: 0 0 10px 0;
        }

        .answer-capture-box {
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 8px;
          padding: 10px;
        }

        .capture-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .wave-bars {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 12px;
        }

        .bar {
          width: 2.5px;
          background-color: #2196F3;
          border-radius: 2px;
          animation: wavePulse 1s infinite ease-in-out;
        }

        .bar:nth-child(1) { height: 6px; animation-delay: 0.1s; }
        .bar:nth-child(2) { height: 12px; animation-delay: 0.2s; }
        .bar:nth-child(3) { height: 8px; animation-delay: 0.3s; }
        .bar:nth-child(4) { height: 11px; animation-delay: 0.4s; }
        .bar:nth-child(5) { height: 5px; animation-delay: 0.5s; }

        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        .capture-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: #2196F3;
        }

        .answer-preview-snippet {
          font-size: 0.75rem;
          color: #475569;
          font-style: italic;
          line-height: 1.4;
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
          border: 1px solid #E3F2FD;
          border-radius: 8px;
          padding: 8px;
        }

        .score-icon-box {
          color: #2196F3;
          background-color: #E3F2FD;
          padding: 6px;
          border-radius: 6px;
          display: flex;
        }

        .score-details {
          display: flex;
          flex-direction: column;
        }

        .tile-label {
          font-size: 0.625rem;
          color: #475569;
          font-weight: 500;
        }

        .tile-value {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0D47A1;
        }

        .mockup-feedback-banner {
          display: flex;
          gap: 10px;
          background: linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%);
          border: 1px solid #90CAF9;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .feedback-bot-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #2196F3;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feedback-content {
          display: flex;
          flex-direction: column;
        }

        .feedback-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .feedback-p {
          font-size: 0.7rem;
          color: #334155;
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        .floating-widget {
          position: absolute;
          z-index: 2;
          background-color: #FFFFFF;
          border: 1px solid #90CAF9;
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 12px 28px rgba(13, 71, 161, 0.14);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .float-top-right {
          top: 14px;
          right: -16px;
        }

        .float-bottom-left {
          bottom: 18px;
          left: -16px;
        }

        .widget-score-pill {
          background-color: #2196F3;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 0.88rem;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .widget-icon-pill {
          color: #2196F3;
          background-color: #E3F2FD;
          padding: 6px;
          border-radius: 6px;
          display: flex;
        }

        .widget-info {
          display: flex;
          flex-direction: column;
        }

        .widget-label {
          font-size: 0.65rem;
          color: #475569;
        }

        .widget-highlight {
          font-size: 0.78rem;
          color: #0D47A1;
          font-weight: 700;
        }

        /* ----------------------------------------------------
           3. FEATURE INTRO / VALUE STRIP
        ---------------------------------------------------- */
        .metric-strip-section {
          background-color: #FFFFFF;
          border-bottom: 1px solid #E3F2FD;
          padding: 24px 0;
        }

        .metric-strip-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .metric-col {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 12px;
          background-color: #F8FBFE;
          border: 1px solid #E3F2FD;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .metric-col:hover {
          transform: translateY(-2px);
          border-color: #90CAF9;
          background-color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(33, 150, 243, 0.08);
        }

        .metric-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background-color: #E3F2FD;
          color: #2196F3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-text {
          display: flex;
          flex-direction: column;
        }

        .metric-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0D47A1;
          margin-bottom: 4px;
        }

        .metric-desc {
          font-size: 0.78rem;
          color: #475569;
          line-height: 1.4;
        }

        /* ----------------------------------------------------
           4. FEATURES SECTION (6 CARDS)
        ---------------------------------------------------- */
        .features-section {
          background-color: #FFFFFF;
        }

        .features-grid-6 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 26px;
        }

        .feature-card-white {
          background-color: #FFFFFF;
          border: 1px solid rgba(33, 150, 243, 0.18);
          border-radius: 16px;
          padding: 32px 26px;
          box-shadow: 0 4px 18px rgba(33, 150, 243, 0.06);
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          position: relative;
        }

        .feature-card-white:hover {
          transform: translateY(-5px);
          border-color: #2196F3;
          box-shadow: 0 14px 32px rgba(33, 150, 243, 0.16);
        }

        .feature-icon-bubble {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%);
          border: 1px solid #90CAF9;
          color: #2196F3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .feature-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0D47A1;
          margin: 0 0 10px 0;
        }

        .feature-card-desc {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 22px 0;
          flex-grow: 1;
        }

        .feature-card-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #F1F5F9;
        }

        .explore-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #2196F3;
          transition: gap 0.2s ease;
        }

        .feature-card-white:hover .explore-arrow {
          transform: translateX(4px);
        }

        .explore-arrow {
          transition: transform 0.2s ease;
        }

        /* ----------------------------------------------------
           TWO-COLUMN SECTIONS (SECTIONS 5, 6, 7, 8)
        ---------------------------------------------------- */
        .two-column-feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .feature-image-col {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .visual-image-card {
          position: relative;
          width: 100%;
          max-width: 540px;
          border-radius: 20px;
          background-color: #FFFFFF;
          border: 1.5px solid #90CAF9;
          box-shadow: 0 16px 40px rgba(13, 71, 161, 0.1);
          padding: 16px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .visual-image-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(33, 150, 243, 0.16);
          border-color: #2196F3;
        }

        .image-badge-floating {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #90CAF9;
          border-radius: 20px;
          color: #0D47A1;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(13, 71, 161, 0.08);
        }

        .feature-png-image {
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: contain;
          border-radius: 12px;
          display: block;
        }

        .image-card-accent-bar {
          margin-top: 12px;
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #2196F3 0%, #90CAF9 100%);
          border-radius: 3px;
        }

        .feature-content-col {
          max-width: 560px;
        }

        .feature-bullet-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 28px;
          margin-bottom: 32px;
        }

        .feature-bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .bullet-icon-wrap {
          color: #2196F3;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .bullet-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #0D47A1;
          margin: 0 0 4px 0;
        }

        .bullet-desc {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .section-btn-wrapper {
          margin-top: 8px;
        }

        /* ----------------------------------------------------
           9. HOW IT WORKS
        ---------------------------------------------------- */
        .workflow-section {
          position: relative;
        }

        .steps-container-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
        }

        .step-card-item {
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 16px;
          padding: 28px 22px;
          box-shadow: 0 4px 16px rgba(33, 150, 243, 0.06);
          position: relative;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .step-card-item:hover {
          transform: translateY(-4px);
          border-color: #90CAF9;
          box-shadow: 0 10px 24px rgba(33, 150, 243, 0.12);
        }

        .step-top-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .step-number-pill {
          font-size: 0.8125rem;
          font-weight: 800;
          color: #2196F3;
          background-color: #E3F2FD;
          border: 1px solid #90CAF9;
          padding: 4px 10px;
          border-radius: 6px;
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
          color: #475569;
          line-height: 1.55;
          margin: 0;
        }

        .step-desktop-connector {
          position: absolute;
          top: 48px;
          right: -14px;
          width: 28px;
          height: 2px;
          background-color: #90CAF9;
          z-index: 1;
        }

        /* ----------------------------------------------------
           10. AI CAPABILITIES
        ---------------------------------------------------- */
        .ai-capabilities-section {
          background-color: #FFFFFF;
        }

        .ai-capabilities-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .ai-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(33, 150, 243, 0.2);
          border-radius: 16px;
          padding: 32px 26px;
          box-shadow: 0 4px 20px rgba(33, 150, 243, 0.07);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .ai-card:hover {
          transform: translateY(-4px);
          border-color: #2196F3;
          box-shadow: 0 12px 30px rgba(33, 150, 243, 0.15);
        }

        .ai-card-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background-color: #E3F2FD;
          color: #2196F3;
          border: 1px solid #90CAF9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .ai-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0D47A1;
          margin: 0 0 10px 0;
        }

        .ai-card-text {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        /* ----------------------------------------------------
           11. INTERVIEW DISCIPLINES (PILLS)
        ---------------------------------------------------- */
        .interview-types-pills-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .interview-type-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.05);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .interview-type-pill:hover {
          border-color: #90CAF9;
          box-shadow: 0 6px 18px rgba(33, 150, 243, 0.12);
          background-color: #F8FBFE;
        }

        .pill-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
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
          font-size: 0.9rem;
          font-weight: 700;
          color: #0D47A1;
        }

        .pill-subtitle {
          font-size: 0.75rem;
          color: #475569;
        }

        /* ----------------------------------------------------
           12. FAQ SECTION
        ---------------------------------------------------- */
        .faq-section {
          background-color: #FFFFFF;
        }

        .faq-constrained-container {
          max-width: 820px;
        }

        .faq-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .faq-item {
          background-color: #FFFFFF;
          border: 1px solid #E3F2FD;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .faq-item:hover,
        .faq-item-open {
          border-color: #90CAF9;
          box-shadow: 0 4px 16px rgba(33, 150, 243, 0.08);
        }

        .faq-question-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .faq-question-text {
          font-size: 1rem;
          font-weight: 700;
          color: #0D47A1;
          padding-right: 14px;
        }

        .faq-icon-wrapper {
          color: #2196F3;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .faq-chevron {
          transition: transform 0.25s ease;
        }

        .faq-chevron-rotated {
          transform: rotate(180deg);
        }

        .faq-answer-body {
          padding: 0 22px 18px 22px;
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.65;
        }

        .faq-answer-body p {
          margin: 0;
        }

        /* ----------------------------------------------------
           13. FINAL CTA
        ---------------------------------------------------- */
        .cta-section-wrap {
          background-color: #FFFFFF;
        }

        .cta-gradient-card {
          position: relative;
          background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #2196F3 100%);
          border-radius: 24px;
          padding: 68px 36px;
          color: #FFFFFF;
          text-align: center;
          overflow: hidden;
          box-shadow: 0 24px 56px rgba(13, 71, 161, 0.24);
        }

        .cta-pattern-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .cta-inner-content {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
        }

        .cta-pill {
          background-color: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.3);
          color: #FFFFFF;
          margin-bottom: 20px;
        }

        .cta-headline {
          font-size: clamp(2rem, 3.8vw, 2.75rem);
          font-weight: 850;
          color: #FFFFFF;
          line-height: 1.2;
          margin-top: 0;
          margin-bottom: 16px;
          letter-spacing: -0.025em;
        }

        .cta-subheadline {
          font-size: clamp(0.95rem, 1.6vw, 1.1rem);
          color: #E3F2FD;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 36px;
          opacity: 0.95;
        }

        .cta-button-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-cta-main {
          background-color: #FFFFFF;
          color: #0D47A1;
          padding: 14px 30px;
          font-size: 1rem;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }

        .btn-cta-main:hover {
          background-color: #E3F2FD;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
        }

        .btn-cta-secondary {
          background-color: transparent;
          color: #FFFFFF;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          padding: 14px 28px;
          font-size: 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .btn-cta-secondary:hover {
          background-color: rgba(255, 255, 255, 0.14);
          border-color: #FFFFFF;
          transform: translateY(-2px);
        }

        /* ----------------------------------------------------
           14. FOOTER
        ---------------------------------------------------- */
        .footer-container-wrap {
          background-color: #F8FBFE;
          border-top: 1px solid #E3F2FD;
          padding-top: 64px;
          padding-bottom: 36px;
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
          background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-brand-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0D47A1;
        }

        .footer-brand-bio {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 16px 0;
          max-width: 360px;
        }

        .footer-copyright-note {
          font-size: 0.78rem;
          color: #64748B;
        }

        .footer-col-heading {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0D47A1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 18px 0;
        }

        .footer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-nav-list a,
        .footer-link-btn {
          font-size: 0.875rem;
          color: #475569;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: color 0.18s ease;
        }

        .footer-nav-list a:hover,
        .footer-link-btn:hover {
          color: #2196F3;
        }

        .footer-connect-text {
          font-size: 0.875rem;
          color: #475569;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .github-profile-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          background-color: #FFFFFF;
          border: 1px solid #90CAF9;
          border-radius: 8px;
          color: #0D47A1;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .github-profile-link:hover {
          background-color: #E3F2FD;
          border-color: #2196F3;
          transform: translateY(-1px);
        }

        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding-top: 28px;
          border-top: 1px solid #E3F2FD;
          font-size: 0.8rem;
          color: #64748B;
          flex-wrap: wrap;
        }

        .footer-dot {
          color: #90CAF9;
        }

        /* ----------------------------------------------------
           RESPONSIVE BREAKPOINTS
        ---------------------------------------------------- */
        @media (min-width: 1081px) {
          .reverse-on-desktop {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 1080px) {
          .hero-grid-container {
            grid-template-columns: 1fr;
            gap: 48px;
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

          .metric-strip-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .features-grid-6 {
            grid-template-columns: repeat(2, 1fr);
          }

          .two-column-feature-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .feature-content-col {
            max-width: 100%;
          }

          .steps-container-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .step-desktop-connector {
            display: none;
          }

          .ai-capabilities-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .interview-types-pills-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-top-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }

        @media (max-width: 860px) {
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
        }

        @media (max-width: 640px) {
          .section-padding {
            padding-top: 60px;
            padding-bottom: 60px;
          }

          .hero-section {
            padding-top: 40px;
            padding-bottom: 60px;
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

          .features-grid-6 {
            grid-template-columns: 1fr;
          }

          .steps-container-grid {
            grid-template-columns: 1fr;
          }

          .interview-types-pills-grid {
            grid-template-columns: 1fr;
          }

          .cta-gradient-card {
            padding: 44px 20px;
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
            gap: 28px;
          }
        }

        /* ----------------------------------------------------
           ACCESSIBILITY: REDUCED MOTION
        ---------------------------------------------------- */
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
  );
}
