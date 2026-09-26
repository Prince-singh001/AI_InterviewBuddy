import AssessmentCard from "@/components/practice/assessment/AssessmentCard";
import PracticeNavigation from "@/components/practice/PracticeNavigation";
import { allAssessments } from "@/data/assessments";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Filter,
  HelpCircle,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Assessments", value: "all" },
  { label: "DSA", value: "DSA" },
  { label: "Python", value: "Python" },
  { label: "SQL", value: "SQL" },
  { label: "Aptitude", value: "Aptitude" },
  { label: "Machine Learning", value: "Machine Learning" },
  { label: "General Technical", value: "General Technical" },
  { label: "Company Specific", value: "Company Specific" },
];

const DIFFICULTIES = [
  { label: "All Levels", value: "all" },
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const FEATURES = [
  {
    icon: Clock3,
    title: "Exam Simulation",
    description: "Real-time countdown timer",
  },
  {
    icon: ClipboardCheck,
    title: "MCQ Architecture",
    description: "Single-choice questions",
  },
  {
    icon: Award,
    title: "Detailed Analytics",
    description: "Review your performance",
  },
];

export default function Assessment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredAssessments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allAssessments.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "all" || item.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedDifficulty !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
  };

  return (
    <div className="assessment-page">
      <style>{`
        /* =========================================================
           ASSESSMENT PAGE
           InterviewBuddy AI — Blue / White Design System
        ========================================================= */

        .assessment-page {
          --blue-50: #E3F2FD;
          --blue-200: #90CAF9;
          --blue-500: #2196F3;
          --blue-900: #0D47A1;

          --white: #FFFFFF;
          --text-primary: #0D2340;
          --text-secondary: #52657A;
          --text-muted: #7B8EA3;

          --border: rgba(33, 150, 243, 0.18);
          --border-strong: rgba(33, 150, 243, 0.35);

          width: 100%;
          min-height: 100vh;
          padding: 1.5rem 1.5rem 4rem;
          color: var(--text-primary);

          background:
            radial-gradient(
              circle at 8% 0%,
              rgba(144, 202, 249, 0.24),
              transparent 30%
            ),
            radial-gradient(
              circle at 92% 12%,
              rgba(33, 150, 243, 0.08),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f8fcff 0%,
              #ffffff 48%,
              #f8fcff 100%
            );
        }

        .assessment-page *,
        .assessment-page *::before,
        .assessment-page *::after {
          box-sizing: border-box;
        }

        .assessment-shell {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* =========================================================
           HERO
        ========================================================= */

        .assessment-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 1.5rem;
          padding: 1.25rem;

          border: 1px solid var(--border);
          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.98),
              rgba(227, 242, 253, 0.68)
            );

          box-shadow:
            0 12px 35px rgba(13, 71, 161, 0.07),
            0 2px 6px rgba(13, 71, 161, 0.04);
        }

        .assessment-hero::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -70px;
          top: -90px;
          border-radius: 50%;
          background: rgba(33, 150, 243, 0.08);
          pointer-events: none;
        }

        .assessment-hero::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: 100px;
          bottom: -85px;
          border-radius: 50%;
          background: rgba(144, 202, 249, 0.12);
          pointer-events: none;
        }

        .assessment-hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .assessment-hero-copy {
          min-width: 0;
        }

        .assessment-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.55rem;
          padding: 0.32rem 0.65rem;

          border: 1px solid rgba(33, 150, 243, 0.22);
          border-radius: 999px;

          background: rgba(227, 242, 253, 0.8);
          color: var(--blue-900);

          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .assessment-eyebrow svg {
          color: var(--blue-500);
        }

        .assessment-hero-title {
          margin: 0;
          color: var(--blue-900);
          font-size: clamp(1.35rem, 2.5vw, 2rem);
          line-height: 1.2;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .assessment-hero-description {
          max-width: 760px;
          margin: 0.5rem 0 0;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.65;
        }

        .assessment-hero-stat {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          flex-shrink: 0;

          padding: 0.75rem 0.9rem;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.88);
        }

        .assessment-hero-stat-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: var(--blue-50);
          color: var(--blue-500);
          border: 1px solid var(--border);
        }

        .assessment-hero-stat span,
        .assessment-hero-stat strong {
          display: block;
        }

        .assessment-hero-stat span {
          color: var(--text-muted);
          font-size: 0.6rem;
          font-weight: 700;
        }

        .assessment-hero-stat strong {
          margin-top: 0.1rem;
          color: var(--blue-900);
          font-size: 0.82rem;
          font-weight: 850;
        }

        /* =========================================================
           PRACTICE NAV
        ========================================================= */

        .assessment-navigation {
          margin-bottom: 1.5rem;
        }

        .assessment-navigation .practice-nav-container {
          border-bottom-color: var(--border) !important;
        }

        .assessment-navigation .practice-nav-container h1 {
          color: var(--blue-900) !important;
        }

        .assessment-navigation .practice-nav-container p {
          color: var(--text-secondary) !important;
        }

        .assessment-navigation .practice-nav-container .rounded-full.uppercase {
          background: var(--blue-50) !important;
          color: var(--blue-900) !important;
          border-color: var(--border-strong) !important;
        }

        .assessment-navigation
          .practice-nav-container
          nav[role="tablist"] {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: var(--border) !important;
          box-shadow: 0 5px 20px rgba(13, 71, 161, 0.06) !important;
        }

        .assessment-navigation
          .practice-nav-container
          nav[role="tablist"]
          a {
          color: var(--text-secondary) !important;
        }

        .assessment-navigation
          .practice-nav-container
          nav[role="tablist"]
          a:hover {
          color: var(--blue-900) !important;
          background: var(--blue-50) !important;
        }

        .assessment-navigation
          .practice-nav-container
          nav[role="tablist"]
          a[aria-selected="true"] {
          color: var(--white) !important;
          background: var(--blue-500) !important;
        }

        /* =========================================================
           FEATURE CARDS
        ========================================================= */

        .assessment-features {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .assessment-feature {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.8rem;

          min-width: 0;
          padding: 1rem;

          border: 1px solid var(--border);
          border-radius: 17px;
          background: var(--white);

          box-shadow:
            0 5px 20px rgba(13, 71, 161, 0.05),
            0 1px 3px rgba(13, 71, 161, 0.03);

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .assessment-feature:hover {
          transform: translateY(-3px);
          border-color: var(--border-strong);
          box-shadow: 0 12px 26px rgba(33, 150, 243, 0.1);
        }

        .assessment-feature-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;

          width: 42px;
          height: 42px;
          border-radius: 12px;

          color: var(--blue-500);
          background: var(--blue-50);
          border: 1px solid var(--border);
        }

        .assessment-feature-text {
          min-width: 0;
        }

        .assessment-feature-text span,
        .assessment-feature-text strong {
          display: block;
        }

        .assessment-feature-text span {
          color: var(--text-muted);
          font-size: 0.61rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.035em;
        }

        .assessment-feature-text strong {
          margin-top: 0.2rem;
          color: var(--text-primary);
          font-size: 0.76rem;
          line-height: 1.4;
          font-weight: 800;
        }

        /* =========================================================
           FILTER PANEL
        ========================================================= */

        .assessment-filter-panel {
          margin-bottom: 1rem;
          padding: 1rem;

          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.94);

          box-shadow: 0 5px 22px rgba(13, 71, 161, 0.05);
        }

        .assessment-filter-top {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .assessment-search {
          position: relative;
          flex: 1;
          min-width: 0;
        }

        .assessment-search > svg {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--blue-500);
          pointer-events: none;
        }

        .assessment-search input {
          width: 100%;
          height: 42px;
          padding: 0 2.7rem;

          border: 1px solid var(--border);
          border-radius: 11px;
          outline: none;

          background: #fbfdff;
          color: var(--text-primary);

          font-family: inherit;
          font-size: 0.76rem;
          font-weight: 600;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .assessment-search input::placeholder {
          color: #9aa9b8;
        }

        .assessment-search input:focus {
          border-color: var(--blue-500);
          background: var(--white);
          box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
        }

        .assessment-search-clear {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);

          display: grid;
          place-items: center;

          width: 24px;
          height: 24px;

          border: 0;
          border-radius: 7px;
          background: var(--blue-50);
          color: var(--blue-900);

          cursor: pointer;
          transition: background 0.2s ease;
        }

        .assessment-search-clear:hover {
          background: var(--blue-200);
        }

        .assessment-difficulty {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-shrink: 0;
        }

        .assessment-difficulty-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;

          color: var(--text-muted);
          font-size: 0.66rem;
          font-weight: 750;
        }

        .assessment-select-wrapper {
          position: relative;
        }

        .assessment-select {
          appearance: none;
          min-width: 125px;
          height: 40px;
          padding: 0 2rem 0 0.75rem;

          border: 1px solid var(--border);
          border-radius: 10px;
          outline: none;

          background: var(--white);
          color: var(--text-primary);

          font-family: inherit;
          font-size: 0.68rem;
          font-weight: 750;

          cursor: pointer;
        }

        .assessment-select:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
        }

        .assessment-select-wrapper svg {
          position: absolute;
          right: 0.65rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--blue-500);
          pointer-events: none;
        }

        /* =========================================================
           CATEGORY TABS
        ========================================================= */

        .assessment-category-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;

          margin-bottom: 1.5rem;
          padding: 0.75rem;

          overflow-x: auto;

          border: 1px solid var(--border);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.92);

          scrollbar-width: none;
          box-shadow: 0 4px 16px rgba(13, 71, 161, 0.04);
        }

        .assessment-category-row::-webkit-scrollbar {
          display: none;
        }

        .assessment-category-button {
          flex-shrink: 0;

          padding: 0.55rem 0.85rem;

          border: 1px solid transparent;
          border-radius: 9px;

          background: transparent;
          color: var(--text-secondary);

          font-family: inherit;
          font-size: 0.68rem;
          font-weight: 750;

          cursor: pointer;

          transition:
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .assessment-category-button:hover {
          color: var(--blue-900);
          background: var(--blue-50);
          border-color: var(--border);
        }

        .assessment-category-button.active {
          color: var(--white);
          background: var(--blue-500);
          border-color: var(--blue-500);
          box-shadow: 0 5px 14px rgba(33, 150, 243, 0.25);
        }

        .assessment-category-button.active:hover {
          background: var(--blue-900);
          border-color: var(--blue-900);
          color: var(--white);
        }

        /* =========================================================
           RESULTS HEADER
        ========================================================= */

        .assessment-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;

          margin-bottom: 0.9rem;
        }

        .assessment-results-title {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .assessment-results-title-icon {
          display: grid;
          place-items: center;

          width: 30px;
          height: 30px;
          border-radius: 9px;

          background: var(--blue-50);
          color: var(--blue-500);
          border: 1px solid var(--border);
        }

        .assessment-results-title strong {
          display: block;
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 850;
        }

        .assessment-results-title span {
          display: block;
          margin-top: 0.1rem;
          color: var(--text-muted);
          font-size: 0.62rem;
        }

        .assessment-reset {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;

          min-height: 32px;
          padding: 0.45rem 0.65rem;

          border: 1px solid var(--border);
          border-radius: 8px;

          background: var(--white);
          color: var(--text-secondary);

          font-family: inherit;
          font-size: 0.62rem;
          font-weight: 750;

          cursor: pointer;
          transition: all 0.18s ease;
        }

        .assessment-reset:hover {
          color: var(--blue-900);
          border-color: var(--border-strong);
          background: var(--blue-50);
        }

        /* =========================================================
           ASSESSMENT GRID
        ========================================================= */

        .assessment-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .assessment-card-wrapper {
          min-width: 0;
          height: 100%;
        }

        /* =========================================================
           EMPTY STATE
        ========================================================= */

        .assessment-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          min-height: 330px;
          padding: 2rem;

          border: 1px solid var(--border);
          border-radius: 20px;

          background: var(--white);

          box-shadow:
            0 8px 25px rgba(13, 71, 161, 0.05);
        }

        .assessment-empty-icon {
          display: grid;
          place-items: center;

          width: 64px;
          height: 64px;
          margin-bottom: 1rem;

          border: 1px solid var(--border);
          border-radius: 18px;

          background: var(--blue-50);
          color: var(--blue-500);
        }

        .assessment-empty h3 {
          margin: 0;
          color: var(--blue-900);
          font-size: 1rem;
          font-weight: 850;
        }

        .assessment-empty p {
          max-width: 420px;
          margin: 0.45rem 0 1.1rem;

          color: var(--text-secondary);
          font-size: 0.72rem;
          line-height: 1.65;
          text-align: center;
        }

        .assessment-reset-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;

          min-height: 40px;
          padding: 0.65rem 0.9rem;

          border: 0;
          border-radius: 10px;

          background: var(--blue-500);
          color: var(--white);

          font-family: inherit;
          font-size: 0.7rem;
          font-weight: 800;

          cursor: pointer;

          box-shadow: 0 6px 18px rgba(33, 150, 243, 0.25);

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .assessment-reset-primary:hover {
          background: var(--blue-900);
          transform: translateY(-1px);
          box-shadow: 0 9px 22px rgba(13, 71, 161, 0.24);
        }

        /* =========================================================
           FOOTER INFO
        ========================================================= */

        .assessment-footer-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;

          margin-top: 1.5rem;

          color: var(--text-muted);
          font-size: 0.62rem;
          font-weight: 650;
        }

        .assessment-footer-info svg {
          color: var(--blue-500);
        }

        /* =========================================================
           RESPONSIVE — 1100px
        ========================================================= */

        @media (max-width: 1100px) {
          .assessment-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .assessment-hero-stat {
            display: none;
          }
        }

        /* =========================================================
           RESPONSIVE — 800px
        ========================================================= */

        @media (max-width: 800px) {
          .assessment-page {
            padding: 1.15rem 1rem 3rem;
          }

          .assessment-features {
            grid-template-columns: 1fr;
          }

          .assessment-feature {
            min-height: 68px;
          }

          .assessment-filter-top {
            flex-direction: column;
            align-items: stretch;
          }

          .assessment-difficulty {
            justify-content: space-between;
          }

          .assessment-select {
            min-width: 170px;
          }

          .assessment-grid {
            gap: 0.85rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 620px
        ========================================================= */

        @media (max-width: 620px) {
          .assessment-page {
            padding: 0.85rem 0.75rem 2.5rem;
          }

          .assessment-hero {
            padding: 1rem;
            border-radius: 17px;
          }

          .assessment-hero-title {
            font-size: 1.35rem;
          }

          .assessment-hero-description {
            font-size: 0.72rem;
          }

          .assessment-filter-panel {
            padding: 0.8rem;
            border-radius: 15px;
          }

          .assessment-difficulty {
            align-items: stretch;
            flex-direction: column;
          }

          .assessment-select-wrapper,
          .assessment-select {
            width: 100%;
          }

          .assessment-category-row {
            margin-bottom: 1.15rem;
            padding: 0.6rem;
            border-radius: 12px;
          }

          .assessment-category-button {
            padding: 0.5rem 0.7rem;
            font-size: 0.63rem;
          }

          .assessment-results-header {
            align-items: flex-start;
          }

          .assessment-grid {
            grid-template-columns: 1fr;
          }

          .assessment-empty {
            min-height: 280px;
            padding: 1.5rem 1rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 420px
        ========================================================= */

        @media (max-width: 420px) {
          .assessment-page {
            padding-left: 0.6rem;
            padding-right: 0.6rem;
          }

          .assessment-hero {
            border-radius: 14px;
          }

          .assessment-hero-title {
            font-size: 1.2rem;
          }

          .assessment-feature {
            padding: 0.8rem;
          }

          .assessment-feature-icon {
            width: 38px;
            height: 38px;
          }

          .assessment-feature-text strong {
            font-size: 0.7rem;
          }

          .assessment-results-title span {
            display: none;
          }

          .assessment-reset {
            padding: 0.4rem 0.5rem;
          }
        }

        /* =========================================================
           REDUCED MOTION
        ========================================================= */

        @media (prefers-reduced-motion: reduce) {
          .assessment-page *,
          .assessment-page *::before,
          .assessment-page *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="assessment-shell">
        {/* =====================================================
            PRACTICE NAVIGATION
        ===================================================== */}

        <div className="assessment-navigation">
          <PracticeNavigation
            title="Assessment Center"
            subtitle="Benchmark your knowledge with timed MCQ assessments modeled after technical screenings and campus placements."
            badge="TIMED ASSESSMENT PLATFORM"
          />
        </div>

        {/* =====================================================
            HERO / OVERVIEW
        ===================================================== */}

        <motion.section
          className="assessment-hero"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="assessment-hero-content">
            <div className="assessment-hero-copy">
              <div className="assessment-eyebrow">
                <Sparkles size={12} />
                Practice • Assess • Improve
              </div>

              <h1 className="assessment-hero-title">
                Technical Assessment Center
              </h1>

              <p className="assessment-hero-description">
                Test your knowledge through focused assessments, track your
                performance, and identify the areas that need more practice.
              </p>
            </div>

            <div className="assessment-hero-stat">
              <div className="assessment-hero-stat-icon">
                <Target size={19} />
              </div>

              <div>
                <span>AVAILABLE ASSESSMENTS</span>
                <strong>{allAssessments.length} Tests</strong>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =====================================================
            FEATURE HIGHLIGHTS
        ===================================================== */}

        <motion.div
          className="assessment-features"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                className="assessment-feature"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.08 + index * 0.06,
                }}
              >
                <div className="assessment-feature-icon">
                  <Icon size={19} />
                </div>

                <div className="assessment-feature-text">
                  <span>{feature.title}</span>
                  <strong>{feature.description}</strong>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* =====================================================
            SEARCH + DIFFICULTY FILTER
        ===================================================== */}

        <motion.section
          className="assessment-filter-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="assessment-filter-top">
            <div className="assessment-search">
              <Search size={17} />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments, topics, or skills..."
                aria-label="Search assessments"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="assessment-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="assessment-difficulty">
              <span className="assessment-difficulty-label">
                <Filter size={13} />
                Difficulty
              </span>

              <div className="assessment-select-wrapper">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="assessment-select"
                  aria-label="Filter by difficulty"
                >
                  {DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>

                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* =====================================================
            CATEGORY FILTER
        ===================================================== */}

        <div className="assessment-category-row">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`assessment-category-button ${
                  isSelected ? "active" : ""
                }`}
                aria-pressed={isSelected}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            RESULTS HEADER
        ===================================================== */}

        <div className="assessment-results-header">
          <div className="assessment-results-title">
            <div className="assessment-results-title-icon">
              <ClipboardCheck size={15} />
            </div>

            <div>
              <strong>Available Assessments</strong>
              <span>
                {filteredAssessments.length} assessment
                {filteredAssessments.length === 1 ? "" : "s"} found
              </span>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="assessment-reset"
              onClick={resetFilters}
            >
              <RotateCcw size={12} />
              Reset Filters
            </button>
          )}
        </div>

        {/* =====================================================
            ASSESSMENT CARDS
        ===================================================== */}

        {filteredAssessments.length > 0 ? (
          <motion.div className="assessment-grid" layout>
            {filteredAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                className="assessment-card-wrapper"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.04, 0.25),
                }}
              >
                <AssessmentCard assessment={assessment} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* ===================================================
             EMPTY STATE
          =================================================== */

          <motion.div
            className="assessment-empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="assessment-empty-icon">
              <HelpCircle size={30} />
            </div>

            <h3>No Assessments Found</h3>

            <p>
              No assessments match your current search and filter settings. Try
              another category or clear the active filters.
            </p>

            <button
              type="button"
              className="assessment-reset-primary"
              onClick={resetFilters}
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* =====================================================
            FOOTER INFO
        ===================================================== */}

        <div className="assessment-footer-info">
          <CheckCircle2 size={13} />
          Choose an assessment and start practicing at your own pace.
        </div>
      </div>
    </div>
  );
}
