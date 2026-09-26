import { interviewsApi } from "@/services/apiService";
import { useInterviewStore } from "@/store/interviewStore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Database,
  Globe,
  HelpCircle,
  Layers,
  Loader2,
  Mic,
  Network,
  Play,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Users,
  Video,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ============================================================
// DATA DEFINITIONS & MAPPINGS
// ============================================================

type TrackType = "landing" | "technical" | "hr" | "custom";
type InterviewMode = "voice" | "video" | "text";

interface TechnicalCategory {
  id: string;
  name: string;
  iconName: string;
  desc: string;
  apiRole: string;
  apiType: string;
}

const TECHNICAL_CATEGORIES: TechnicalCategory[] = [
  { id: "dsa", name: "DSA", iconName: "Code2", desc: "Data Structures & Algorithms", apiRole: "DSA Engineer", apiType: "coding" },
  { id: "java", name: "Java", iconName: "Terminal", desc: "Core Java, Multithreading, JVM", apiRole: "Java Developer", apiType: "technical" },
  { id: "oop", name: "OOP", iconName: "Layers", desc: "Object-Oriented Design & SOLID", apiRole: "Software Engineer - OOP", apiType: "technical" },
  { id: "c", name: "C", iconName: "Terminal", desc: "Pointers, Memory & Low-Level C", apiRole: "C Developer", apiType: "technical" },
  { id: "cpp", name: "C++", iconName: "Terminal", desc: "STL, Modern C++, Templates", apiRole: "C++ Developer", apiType: "technical" },
  { id: "python", name: "Python", iconName: "Code2", desc: "Pythonic Code, Async, OOP", apiRole: "Python Developer", apiType: "technical" },
  { id: "ai", name: "AI", iconName: "Bot", desc: "Artificial Intelligence Concepts", apiRole: "AI Engineer", apiType: "technical" },
  { id: "ml", name: "Machine Learning", iconName: "Cpu", desc: "Supervised, Unsupervised, Models", apiRole: "Machine Learning Engineer", apiType: "ml" },
  { id: "dl", name: "Deep Learning", iconName: "Cpu", desc: "Neural Networks, CNNs, Transformers", apiRole: "Deep Learning Engineer", apiType: "ml" },
  { id: "sql", name: "SQL", iconName: "Database", desc: "Complex Queries, Joins, Indexing", apiRole: "Database Engineer (SQL)", apiType: "technical" },
  { id: "dbms", name: "DBMS", iconName: "Database", desc: "ACID, Normalization, Transactions", apiRole: "DBMS Specialist", apiType: "technical" },
  { id: "cn", name: "Computer Networks", iconName: "Network", desc: "TCP/IP, OSI Model, Protocols, DNS", apiRole: "Network Engineer", apiType: "technical" },
  { id: "os", name: "Operating Systems", iconName: "Server", desc: "Processes, Threads, Concurrency", apiRole: "Systems Engineer (OS)", apiType: "technical" },
  { id: "html", name: "HTML", iconName: "Globe", desc: "Semantic Web, Accessibility, SEO", apiRole: "Frontend Developer (HTML)", apiType: "technical" },
  { id: "css", name: "CSS", iconName: "Globe", desc: "Flexbox, Grid, Responsive Layouts", apiRole: "Frontend Developer (CSS)", apiType: "technical" },
  { id: "javascript", name: "JavaScript", iconName: "Code2", desc: "ES6+, Event Loop, Closures", apiRole: "JavaScript Developer", apiType: "technical" },
  { id: "react", name: "React", iconName: "Code2", desc: "Hooks, Virtual DOM, State Management", apiRole: "React Developer", apiType: "technical" },
  { id: "backend", name: "Backend Development", iconName: "Server", desc: "REST APIs, Microservices, Security", apiRole: "Backend Developer", apiType: "technical" },
  { id: "sys-design", name: "System Design", iconName: "Layers", desc: "Scalability, Caching, Load Balancing", apiRole: "Software Architect", apiType: "system-design" },
  { id: "git", name: "Git / GitHub", iconName: "Terminal", desc: "Branching, Merging, CI/CD, Git Flow", apiRole: "DevOps & Version Control", apiType: "technical" },
  { id: "aptitude", name: "Aptitude", iconName: "Zap", desc: "Analytical Reasoning & Math Logic", apiRole: "Quantitative & Analytical Aptitude", apiType: "technical" },
  { id: "general-tech", name: "General Technical", iconName: "Terminal", desc: "Broad CS Fundamentals & Problem Solving", apiRole: "Full Stack Engineer", apiType: "technical" },
];

interface HRCategory {
  id: string;
  name: string;
  desc: string;
  apiRole: string;
  apiType: string;
}

const HR_CATEGORIES: HRCategory[] = [
  { id: "self-intro", name: "Self Introduction", desc: "First impression, elevator pitch, background summary", apiRole: "HR Candidate - Self Introduction", apiType: "hr" },
  { id: "behavioral", name: "Behavioral (STAR Method)", desc: "Situation, Task, Action, Result structured responses", apiRole: "Behavioral Candidate", apiType: "behavioral" },
  { id: "strengths-weaknesses", name: "Strengths & Weaknesses", desc: "Honest self-awareness, mitigation strategies, learning mindset", apiRole: "HR Candidate - Strengths & Weaknesses", apiType: "hr" },
  { id: "leadership", name: "Leadership", desc: "Inspiring others, taking initiative, project ownership", apiRole: "Leadership & Team Management", apiType: "behavioral" },
  { id: "teamwork", name: "Teamwork", desc: "Cross-functional collaboration, peer empathy, synergy", apiRole: "Teamwork & Collaboration", apiType: "behavioral" },
  { id: "conflict", name: "Conflict Resolution", desc: "Constructive resolution, consensus building, professionalism", apiRole: "Conflict Management", apiType: "behavioral" },
  { id: "career-goals", name: "Career Goals", desc: "Long-term vision, ambition, growth alignment with company", apiRole: "Career Vision & Ambitions", apiType: "hr" },
  { id: "situational", name: "Situational Questions", desc: "Hypothetical workplace scenarios, ethical dilemmas", apiRole: "Situational Judgment", apiType: "behavioral" },
  { id: "communication", name: "Communication", desc: "Active listening, stakeholder management, clarity", apiRole: "Professional Communication", apiType: "hr" },
  { id: "company-fit", name: "Company Motivation", desc: "Why this company? Values alignment, domain interest", apiRole: "Company Fit & Motivation", apiType: "hr" },
  { id: "general-hr", name: "General HR", desc: "Core HR competencies, flexibility, work ethic", apiRole: "HR Generalist Interview", apiType: "hr" },
];

const CUSTOM_ROLES = [
  "Software Engineer",
  "Python Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AIML Engineer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Data Analyst",
  "GenAI Engineer",
  "Frontend Engineer",
  "Cloud / DevOps Engineer",
  "System Architect",
];

const CUSTOM_TYPES = [
  { id: "technical", label: "Technical", desc: "Coding & tech concepts" },
  { id: "hr", label: "HR", desc: "Common HR questions" },
  { id: "behavioral", label: "Behavioral", desc: "STAR-based scenarios" },
  { id: "ml", label: "Machine Learning", desc: "ML/AI fundamentals" },
  { id: "system-design", label: "System Design", desc: "Architecture & scale" },
  { id: "genai", label: "Generative AI", desc: "LLMs, RAG, Agents" },
  { id: "coding", label: "Coding (DSA)", desc: "Data structures & algorithms" },
  { id: "mixed", label: "Mixed", desc: "Combined technical & behavioral" },
];

const DIFFICULTIES = [
  { id: "beginner", label: "Beginner", desc: "Foundational concepts & principles" },
  { id: "intermediate", label: "Intermediate", desc: "Real-world practical scenarios" },
  { id: "advanced", label: "Advanced", desc: "Deep technical architecture" },
  { id: "expert", label: "Expert", desc: "FAANG-level rigor & complexity" },
];

const DURATIONS = [
  { minutes: 10, questions: 6, label: "10 mins", qLabel: "6 Questions" },
  { minutes: 20, questions: 10, label: "20 mins", qLabel: "10 Questions" },
  { minutes: 30, questions: 15, label: "30 mins", qLabel: "15 Questions" },
  { minutes: 45, questions: 18, label: "45 mins", qLabel: "18 Questions" },
];

const MODES: { id: InterviewMode; label: string; desc: string }[] = [
  { id: "voice", label: "Voice Interview", desc: "Real-time voice & speech recognition" },
  { id: "video", label: "Video Interview", desc: "Live candidate camera & voice" },
  { id: "text", label: "Text Mode", desc: "Structured keyboard responses" },
];

function getInterviewId(response: unknown): string {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response received from the interview service.");
  }

  const data = response as { id?: unknown; _id?: unknown; interview_id?: unknown };
  const candidates = [data.id, data._id, data.interview_id];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
    if (candidate && typeof candidate === "object") {
      const possibleId = candidate as { $oid?: unknown; oid?: unknown };
      const val = possibleId.$oid ?? possibleId.oid;
      if (typeof val === "string" && val.trim().length > 0) {
        return val.trim();
      }
    }
  }

  throw new Error("Interview was created, but no valid interview ID was returned.");
}

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { startInterview } = useInterviewStore();

  const [activeTrack, setActiveTrack] = useState<TrackType>("landing");
  const [loading, setLoading] = useState(false);
  const [interviewer, setInterviewer] = useState<"jenny" | "samm">("jenny");

  // Track specific states
  const [techCategory, setTechCategory] = useState<string>("dsa");
  const [techCustomRole, setTechCustomRole] = useState<string>("");
  const [hrCategory, setHrCategory] = useState<string>("self-intro");

  // Common interview parameters
  const [difficulty, setDifficulty] = useState<string>("intermediate");
  const [duration, setDuration] = useState<number>(30);
  const [mode, setMode] = useState<InterviewMode>("voice");
  const [personality, setPersonality] = useState<string>("Professional");

  // Custom Track state
  const [customRole, setCustomRole] = useState<string>("Software Engineer");
  const [customType, setCustomType] = useState<string>("mixed");

  const handleStartSession = async (track: "technical" | "hr" | "custom") => {
    if (loading) return;
    setLoading(true);

    let rolePayload = "";
    let typePayload = "";

    if (track === "technical") {
      const cat = TECHNICAL_CATEGORIES.find((c) => c.id === techCategory);
      rolePayload = techCustomRole.trim() || cat?.apiRole || "Software Engineer";
      typePayload = cat?.apiType || "technical";
    } else if (track === "hr") {
      const cat = HR_CATEGORIES.find((c) => c.id === hrCategory);
      rolePayload = cat?.apiRole || "HR Candidate";
      typePayload = cat?.apiType || "hr";
    } else {
      rolePayload = customRole;
      typePayload = customType;
    }

    try {
      const response = await interviewsApi.create({
        role: rolePayload,
        interview_type: typePayload,
        difficulty,
        duration_minutes: duration,
        mode,
        personality,
      });

      const interviewId = getInterviewId(response);

      try {
        sessionStorage.setItem("active_interview_id", interviewId);
        sessionStorage.setItem("active_interviewer", interviewer);
      } catch (e) {
        console.warn("[InterviewSetup] sessionStorage warning:", e);
      }

      startInterview({
        role: rolePayload,
        type: typePayload,
        difficulty,
        duration,
        mode,
        personality,
      });

      toast.success("AI Interview created! Entering interview room...");

      navigate(`/interview/room/${encodeURIComponent(interviewId)}`, {
        state: {
          interviewId,
          duration,
          role: rolePayload,
          type: typePayload,
          difficulty,
          mode,
          personality,
          interviewer,
        },
      });
    } catch (err) {
      console.error("[InterviewSetup] Failed to start interview:", err);
      const msg = err instanceof Error ? err.message : "Unable to create interview. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VIEW: LANDING SELECTION SCREEN
  // ============================================================
  if (activeTrack === "landing") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Hero Section: Left content, Right professional AI interview image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
          {/* LEFT COLUMN: Headings, Badge, Short Description & Track Quick Links */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3F2FD] border border-[#90CAF9] text-[#0D47A1] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles size={14} className="text-[#2196F3]" />
              <span>AI Live Interview Assistant • Real-Time Voice</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0D47A1] tracking-tight mb-4 leading-tight">
              Practice Real-Time Virtual Interviews with AI
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-6">
              Experience realistic, voice-interactive mock interviews with AI interviewers Jenny and Samm.
              Choose your preparation track below to begin.
            </p>

            {/* Quick Track Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTrack("technical")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-xs shadow-sm shadow-[#2196F3]/25 transition-all cursor-pointer"
              >
                <Code2 size={15} />
                <span>Technical Track</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTrack("hr")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E3F2FD] hover:bg-[#2196F3] text-[#0D47A1] hover:text-white border border-[#90CAF9] font-bold text-xs transition-all cursor-pointer"
              >
                <Users size={15} />
                <span>HR & Behavioral</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTrack("custom")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                <Settings2 size={15} />
                <span>Custom Session</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop) / NATURAL FLOW (Mobile): Professional AI Interview Image */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative group w-full max-w-sm sm:max-w-md">
              <div className="relative overflow-hidden rounded-3xl border border-[#90CAF9]/60 bg-white p-2.5 shadow-md shadow-[#0D47A1]/5 transition-all duration-350 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:border-[#2196F3] hover:shadow-xl hover:shadow-[#2196F3]/15">
                <img
                  src="/images/interviewer.jpg"
                  alt="AI-powered interview experience"
                  className="w-full h-auto max-h-[360px] object-cover rounded-2xl block"
                  loading="eager"
                />

                {/* Subtle Professional Status Tag */}
                <div className="absolute bottom-5 left-5 right-5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#90CAF9]/50 shadow-sm flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-[#0D47A1]">AI Interviewer Online</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2196F3]">Live Voice Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Major Choices Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 1. Technical Interview Card */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col justify-between p-7 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-sm hover:shadow-xl hover:border-[#2196F3] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#90CAF9] text-[#2196F3] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#2196F3] group-hover:text-white transition-all shadow-xs">
                  <Code2 size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1]">
                  Coding & Concepts
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#0D47A1] mb-2 group-hover:text-[#2196F3] transition-colors">
                Technical Interview
              </h2>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Sharpen your problem-solving in DSA, Java, Python, React, System Design, SQL, and core CS fundamentals.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-8">
                {["DSA", "Python", "Java", "OOP", "React", "SQL", "System Design"].map((pill) => (
                  <span
                    key={pill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FCFF] border border-[#90CAF9]/40 text-[#0D47A1] font-semibold"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTrack("technical")}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-sm shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer group-hover:shadow-lg"
            >
              <span>Setup Technical Interview</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* 2. HR & Behavioral Interview Card */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col justify-between p-7 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-sm hover:shadow-xl hover:border-[#2196F3] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#90CAF9] text-[#2196F3] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#2196F3] group-hover:text-white transition-all shadow-xs">
                  <Users size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1]">
                  Culture & Behavioral
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#0D47A1] mb-2 group-hover:text-[#2196F3] transition-colors">
                HR Interview
              </h2>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Master behavioral scenarios, leadership stories using the STAR method, self-introductions, and company fit.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-8">
                {["Self Intro", "STAR Method", "Leadership", "Teamwork", "Strengths", "Conflict"].map((pill) => (
                  <span
                    key={pill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FCFF] border border-[#90CAF9]/40 text-[#0D47A1] font-semibold"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTrack("hr")}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-sm shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer group-hover:shadow-lg"
            >
              <span>Setup HR Interview</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* 3. Practice & Custom Interview Card */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="flex flex-col justify-between p-7 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-sm hover:shadow-xl hover:border-[#2196F3] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] border border-[#90CAF9] text-[#2196F3] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#2196F3] group-hover:text-white transition-all shadow-xs">
                  <Settings2 size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1]">
                  Flexible Track
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#0D47A1] mb-2 group-hover:text-[#2196F3] transition-colors">
                Custom / Practice
              </h2>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Build a tailored interview combining custom roles, mixed question types, custom difficulty, and timer parameters.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-8">
                {["Mixed Questions", "Custom Roles", "Full Flexibility", "10-45 Mins", "Any Role"].map((pill) => (
                  <span
                    key={pill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FCFF] border border-[#90CAF9]/40 text-[#0D47A1] font-semibold"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTrack("custom")}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#E3F2FD] hover:bg-[#2196F3] text-[#0D47A1] hover:text-white border border-[#90CAF9] font-bold text-sm transition-all cursor-pointer"
            >
              <span>Customize Session</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* Product Experience Highlights */}
        <div className="p-8 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs">
          <h3 className="text-center text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-6">
            The Complete AI Interview Suite
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0D47A1] mb-1">Human-like AI Avatars</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Interactive video avatars Jenny & Samm speak questions and respond dynamically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center shrink-0">
                <Mic size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0D47A1] mb-1">Live Voice Dictation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Speak naturally. Real-time browser speech recognition captures your answers live.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center shrink-0">
                <Video size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0D47A1] mb-1">Live Candidate Camera</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Integrated video preview replicates realistic Zoom & Teams enterprise interviews.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0D47A1] mb-1">Instant STAR Evaluation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generates an in-depth scorecard with communication metrics, strengths, and tips.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // REUSABLE SUB-SECTION: AI INTERVIEWER SELECTION
  // ============================================================
  const renderInterviewerSelector = () => (
    <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#0D47A1]">Select Your AI Interviewer</h3>
          <p className="text-xs text-slate-500">Your chosen interviewer will conduct the entire session.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E3F2FD] text-[#2196F3]">
          Stable Throughout Session
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Jenny */}
        <button
          type="button"
          onClick={() => setInterviewer("jenny")}
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            interviewer === "jenny"
              ? "bg-[#E3F2FD] border-[#2196F3] shadow-md shadow-[#2196F3]/15 ring-2 ring-[#2196F3]/30"
              : "bg-white border-slate-200 hover:border-[#90CAF9] hover:bg-[#F8FCFF]"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#0D47A1] text-white flex items-center justify-center shrink-0 font-black text-xl shadow-sm">
            J
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-[#0D47A1]">Jenny</h4>
              {interviewer === "jenny" && (
                <span className="w-5 h-5 rounded-full bg-[#2196F3] text-white flex items-center justify-center">
                  <Check size={13} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">Professional AI Interview Assistant</p>
            <span className="inline-block mt-2 text-[11px] font-semibold text-[#2196F3]">
              ● Interactive Video Avatar (jenny.mp4)
            </span>
          </div>
        </button>

        {/* Samm */}
        <button
          type="button"
          onClick={() => setInterviewer("samm")}
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            interviewer === "samm"
              ? "bg-[#E3F2FD] border-[#2196F3] shadow-md shadow-[#2196F3]/15 ring-2 ring-[#2196F3]/30"
              : "bg-white border-slate-200 hover:border-[#90CAF9] hover:bg-[#F8FCFF]"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D47A1] to-[#2196F3] text-white flex items-center justify-center shrink-0 font-black text-xl shadow-sm">
            S
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-[#0D47A1]">Samm</h4>
              {interviewer === "samm" && (
                <span className="w-5 h-5 rounded-full bg-[#2196F3] text-white flex items-center justify-center">
                  <Check size={13} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">Technical & Architectural Specialist</p>
            <span className="inline-block mt-2 text-[11px] font-semibold text-[#2196F3]">
              ● Interactive Video Avatar (samm.mp4)
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  // ============================================================
  // REUSABLE SUB-SECTION: PARAMETERS (Difficulty, Duration, Mode)
  // ============================================================
  const renderCommonParameters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Difficulty */}
      <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs">
        <h3 className="text-sm font-bold text-[#0D47A1] mb-1">Difficulty</h3>
        <p className="text-xs text-slate-500 mb-3">Target challenge level</p>

        <div className="space-y-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                difficulty === d.id
                  ? "bg-[#E3F2FD] border-[#2196F3] font-bold text-[#0D47A1]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8FCFF]"
              }`}
            >
              <div>
                <div className="text-xs font-bold">{d.label}</div>
                <div className="text-[11px] text-slate-500">{d.desc}</div>
              </div>
              {difficulty === d.id && <CheckCircle2 size={16} className="text-[#2196F3]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs">
        <h3 className="text-sm font-bold text-[#0D47A1] mb-1">Session Duration</h3>
        <p className="text-xs text-slate-500 mb-3">Time & question count</p>

        <div className="space-y-2">
          {DURATIONS.map((dur) => (
            <button
              key={dur.minutes}
              type="button"
              onClick={() => setDuration(dur.minutes)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                duration === dur.minutes
                  ? "bg-[#E3F2FD] border-[#2196F3] font-bold text-[#0D47A1]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8FCFF]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#2196F3]" />
                <span className="text-xs font-bold">{dur.label}</span>
              </div>
              <span className="text-xs font-medium text-slate-500">{dur.qLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs">
        <h3 className="text-sm font-bold text-[#0D47A1] mb-1">Interview Mode</h3>
        <p className="text-xs text-slate-500 mb-3">Interaction format</p>

        <div className="space-y-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                mode === m.id
                  ? "bg-[#E3F2FD] border-[#2196F3] font-bold text-[#0D47A1]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8FCFF]"
              }`}
            >
              <div>
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[11px] text-slate-500">{m.desc}</div>
              </div>
              {mode === m.id && <CheckCircle2 size={16} className="text-[#2196F3]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // VIEW: TECHNICAL SETUP
  // ============================================================
  if (activeTrack === "technical") {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => setActiveTrack("landing")}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2196F3] hover:text-[#0D47A1] mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Track Selection</span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1] text-xs font-bold mb-2">
            <Code2 size={14} className="text-[#2196F3]" />
            <span>Technical Track Configuration</span>
          </div>
          <h1 className="text-3xl font-black text-[#0D47A1]">Technical Interview Setup</h1>
          <p className="text-sm text-slate-600 mt-1">
            Choose your technical subject area or enter a custom specialization.
          </p>
        </div>

        {/* Technical Categories Grid */}
        <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-[#0D47A1] mb-3">1. Select Technical Category</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto p-1">
            {TECHNICAL_CATEGORIES.map((cat) => {
              const isSelected = techCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTechCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2196F3] text-white border-[#2196F3] shadow-md shadow-[#2196F3]/25 font-bold"
                      : "bg-[#F8FCFF] border-slate-200 text-slate-700 hover:border-[#90CAF9] hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-extrabold">{cat.name}</div>
                  <div className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    {cat.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-[#0D47A1] mb-1.5">
              Custom Job Role or Specific Topic (Optional)
            </label>
            <input
              type="text"
              value={techCustomRole}
              onChange={(e) => setTechCustomRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer at Google, React/Node Fullstack..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-sm text-slate-800 focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#90CAF9]/40"
            />
          </div>
        </div>

        {/* Interviewer Avatar Selection */}
        {renderInterviewerSelector()}

        {/* Parameters */}
        {renderCommonParameters()}

        {/* Launch Bar */}
        <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready to Begin</div>
            <div className="text-base font-extrabold text-[#0D47A1]">
              Technical Interview: {TECHNICAL_CATEGORIES.find((c) => c.id === techCategory)?.name} • {difficulty.toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleStartSession("technical")}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-sm shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Preparing Session...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Start Technical Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW: HR SETUP
  // ============================================================
  if (activeTrack === "hr") {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => setActiveTrack("landing")}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2196F3] hover:text-[#0D47A1] mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Track Selection</span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1] text-xs font-bold mb-2">
            <Users size={14} className="text-[#2196F3]" />
            <span>HR Track Configuration</span>
          </div>
          <h1 className="text-3xl font-black text-[#0D47A1]">HR & Behavioral Interview Setup</h1>
          <p className="text-sm text-slate-600 mt-1">
            Master situational judgment, cultural competencies, and STAR method frameworks.
          </p>
        </div>

        {/* HR Categories */}
        <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-[#0D47A1] mb-3">1. Select HR Behavioral Focus</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {HR_CATEGORIES.map((cat) => {
              const isSelected = hrCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setHrCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2196F3] text-white border-[#2196F3] shadow-md shadow-[#2196F3]/25 font-bold"
                      : "bg-[#F8FCFF] border-slate-200 text-slate-700 hover:border-[#90CAF9] hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-extrabold">{cat.name}</div>
                  <div className={`text-xs mt-1 leading-snug ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    {cat.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interviewer Avatar Selection */}
        {renderInterviewerSelector()}

        {/* Parameters */}
        {renderCommonParameters()}

        {/* Launch Bar */}
        <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready to Begin</div>
            <div className="text-base font-extrabold text-[#0D47A1]">
              HR Interview: {HR_CATEGORIES.find((c) => c.id === hrCategory)?.name} • {difficulty.toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleStartSession("hr")}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-sm shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Preparing Session...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Start HR Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW: CUSTOM / PRACTICE TRACK
  // ============================================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        type="button"
        onClick={() => setActiveTrack("landing")}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#2196F3] hover:text-[#0D47A1] mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Back to Track Selection</span>
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1] text-xs font-bold mb-2">
          <Settings2 size={14} className="text-[#2196F3]" />
          <span>Custom Track Configuration</span>
        </div>
        <h1 className="text-3xl font-black text-[#0D47A1]">Custom & Practice Setup</h1>
        <p className="text-sm text-slate-600 mt-1">
          Customize every facet of your AI interview session.
        </p>
      </div>

      {/* Role & Question Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs">
          <h3 className="text-sm font-bold text-[#0D47A1] mb-2">Target Job Role</h3>
          <select
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-sm text-slate-800 font-semibold focus:outline-hidden focus:border-[#2196F3] cursor-pointer"
          >
            {CUSTOM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs">
          <h3 className="text-sm font-bold text-[#0D47A1] mb-2">Interview Type</h3>
          <select
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-sm text-slate-800 font-semibold focus:outline-hidden focus:border-[#2196F3] cursor-pointer"
          >
            {CUSTOM_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.desc})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interviewer Avatar Selection */}
      {renderInterviewerSelector()}

      {/* Parameters */}
      {renderCommonParameters()}

      {/* Launch Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready to Begin</div>
          <div className="text-base font-extrabold text-[#0D47A1]">
            Custom Session: {customRole} ({customType})
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleStartSession("custom")}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-sm shadow-md shadow-[#2196F3]/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Preparing Session...</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Start Custom Interview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
