import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Filter,
  Play,
  ArrowRight,
  Clock,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  Bot,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Volume2,
  Video,
  Mic,
  Briefcase,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { interviewsApi, type InterviewListItem } from '@/services/apiService';
import CompanyLogoList from '@/components/common/CompanyLogoList';
import CompanyLogo from '@/components/common/CompanyLogo';
import { hrIllustration } from '@/assets/illustrations';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export interface RoleDef {
  id: string;
  title: string;
  category: 'Engineering' | 'AI & Data' | 'Cloud & DevOps' | 'Product & Tech';
  description: string;
  companies: string[];
  skills: string[];
  popular?: boolean;
}

export const ROLE_DEFINITIONS: RoleDef[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    category: 'AI & Data',
    description:
      'Builds and deploys machine learning models and AI-powered systems.',
    companies: ['Microsoft', 'Perplexity AI', 'Optum'],
    skills: ['PyTorch', 'LLMs', 'RAG', 'Vector DBs', 'LangChain'],
    popular: true,
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Engineering',
    description:
      'Designs, develops, and optimizes core software applications, algorithms, and distributed systems.',
    companies: ['Amazon', 'Swiggy', 'Zomato'],
    skills: ['DSA', 'System Design', 'OOP', 'Java / Python', 'APIs'],
    popular: true,
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'AI & Data',
    description:
      'Extracts actionable insights using statistical modeling, hypothesis testing, and advanced machine learning algorithms.',
    companies: ['Google', 'Uber', 'Meesho'],
    skills: ['Machine Learning', 'Python', 'Statistics', 'Pandas', 'SQL'],
    popular: true,
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'AI & Data',
    description:
      'Transforms complex business datasets into clear executive reports, KPIs, dashboards, and growth insights.',
    companies: ['Deloitte', 'Accenture', 'Swiggy'],
    skills: ['SQL', 'Power BI', 'Tableau', 'Excel', 'Data Modeling'],
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering',
    description:
      'Builds high-throughput microservices, robust REST/gRPC APIs, databases, and secure scalable server logic.',
    companies: ['Razorpay', 'Uber', 'Amazon'],
    skills: ['Node.js', 'Go / Python', 'PostgreSQL', 'Redis', 'Microservices'],
    popular: true,
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Engineering',
    description:
      'Crafts performant, accessible, and delightful interactive user experiences across web and mobile platforms.',
    companies: ['Swiggy', 'Zomato', 'Microsoft'],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind / CSS', 'State Management'],
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    category: 'Cloud & DevOps',
    description:
      'Architects and manages highly available cloud infrastructure, automation, networking, and cloud security.',
    companies: ['Microsoft', 'Oracle', 'Amazon'],
    skills: ['AWS', 'Azure', 'Terraform', 'Docker', 'Networking'],
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Cloud & DevOps',
    description:
      'Automates CI/CD pipelines, container orchestration, cluster monitoring, reliability, and deployment velocity.',
    companies: ['IBM', 'Infosys', 'TCS'],
    skills: ['CI/CD', 'Kubernetes', 'Docker', 'Linux', 'Observability'],
  },
];

const CATEGORIES = [
  'All Categories',
  'Engineering',
  'AI & Data',
  'Cloud & DevOps',
];

const TARGET_COMPANIES = [
  { name: 'Google', roles: ['Software Engineer', 'Data Scientist'] },
  { name: 'Microsoft', roles: ['AI Engineer', 'Cloud Engineer'] },
  { name: 'Amazon', roles: ['Software Engineer', 'Backend Developer'] },
  { name: 'OpenAI', roles: ['AI Engineer', 'Research Engineer'] },
  { name: 'Perplexity AI', roles: ['AI Engineer', 'Full Stack'] },
  { name: 'Optum', roles: ['AI Engineer', 'Data Analyst'] },
  { name: 'Swiggy', roles: ['Software Engineer', 'Frontend Developer'] },
  { name: 'Zomato', roles: ['Software Engineer', 'Mobile Developer'] },
  { name: 'Uber', roles: ['Backend Developer', 'Data Scientist'] },
  { name: 'Razorpay', roles: ['Backend Developer', 'DevOps Engineer'] },
  { name: 'Deloitte', roles: ['Data Analyst', 'Consultant'] },
  { name: 'TCS', roles: ['Software Engineer', 'Systems Engineer'] },
];

export default function MockInterview() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');

  // Quick Setup Modal State
  const [setupModalRole, setSetupModalRole] = useState<RoleDef | null>(null);
  const [detailModalRole, setDetailModalRole] = useState<RoleDef | null>(null);
  const [duration, setDuration] = useState<10 | 20 | 30 | 45>(10);
  const [interviewer, setInterviewer] = useState<'jenny' | 'samm'>('jenny');
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [mode, setMode] = useState<'voice' | 'text' | 'video'>('voice');
  const [isStarting, setIsStarting] = useState(false);

  // Fetch real user interviews
  const {
    data: interviews = [],
    isLoading: isLoadingInterviews,
    refetch,
  } = useQuery<InterviewListItem[]>({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
    staleTime: 1000 * 60 * 2,
  });

  // Calculate real attempted roles from existing interviews
  const attemptedRoles = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];

    const grouped: Record<
      string,
      {
        roleTitle: string;
        attempts: InterviewListItem[];
        lastAttempted: string;
        bestScore: number;
        roleDef?: RoleDef;
      }
    > = {};

    interviews.forEach((item) => {
      const cleanRole = item.role || 'Software Engineer';
      if (!grouped[cleanRole]) {
        // match against role definitions if possible
        const def = ROLE_DEFINITIONS.find(
          (r) =>
            r.title.toLowerCase() === cleanRole.toLowerCase() ||
            cleanRole.toLowerCase().includes(r.title.toLowerCase()) ||
            r.title.toLowerCase().includes(cleanRole.toLowerCase()),
        );

        grouped[cleanRole] = {
          roleTitle: cleanRole,
          attempts: [],
          lastAttempted: item.created_at,
          bestScore: 0,
          roleDef: def,
        };
      }

      grouped[cleanRole].attempts.push(item);
      if (
        new Date(item.created_at).getTime() >
        new Date(grouped[cleanRole].lastAttempted).getTime()
      ) {
        grouped[cleanRole].lastAttempted = item.created_at;
      }
      if ((item.score ?? 0) > grouped[cleanRole].bestScore) {
        grouped[cleanRole].bestScore = item.score ?? 0;
      }
    });

    return Object.values(grouped).sort(
      (a, b) =>
        new Date(b.lastAttempted).getTime() -
        new Date(a.lastAttempted).getTime(),
    );
  }, [interviews]);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ROLE_DEFINITIONS.filter((role) => {
      const matchesSearch =
        !q ||
        role.title.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q) ||
        role.skills.some((s) => s.toLowerCase().includes(q)) ||
        role.companies.some((c) => c.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'All Categories' ||
        role.category === selectedCategory;

      const matchesRole =
        selectedRoleFilter === 'All Roles' ||
        role.title === selectedRoleFilter;

      return matchesSearch && matchesCat && matchesRole;
    });
  }, [search, selectedCategory, selectedRoleFilter]);

  // Launch interview session
  const handleLaunchInterview = async () => {
    if (!setupModalRole) return;
    setIsStarting(true);

    try {
      const created = await interviewsApi.create({
        role: setupModalRole.title,
        interview_type:
          setupModalRole.category === 'Engineering'
            ? 'technical'
            : setupModalRole.category === 'AI & Data'
            ? 'ml'
            : 'technical',
        difficulty: 'medium',
        duration_minutes: duration,
        mode: mode,
        personality: 'professional',
        interviewer: interviewer,
        voice_gender: voiceGender,
        language: 'en',
      });

      const interviewId = (created as any)?.id || (created as any)?._id;
      if (!interviewId) {
        throw new Error('Interview ID was not returned by server');
      }

      toast.success(`Started ${setupModalRole.title} mock interview!`);
      navigate(`/interview/room/${interviewId}`);
    } catch (err: any) {
      console.error('Failed to create interview:', err);
      toast.error(
        err?.message ||
          'Failed to launch interview session. Please verify backend connection.',
      );
    } finally {
      setIsStarting(false);
      setSetupModalRole(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ========================================================
          HERO SECTION
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CDF5FD]/40 via-white to-[#A0E9FF]/20 border border-[#89CFF3]/40 p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A9FF]/10 border border-[#00A9FF]/30 text-[#00A9FF] text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} className="text-[#00A9FF]" />
              <span>AI-Powered</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Role-Based <span className="text-[#00A9FF]">Mock Interview</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Practice realistic AI-powered interviews tailored to your target role and career goals.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('explore-roles-section');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all hover:shadow-lg cursor-pointer"
              >
                <Play size={16} />
                <span>Start Interview</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/interview/setup')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <span>Custom Setup</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] p-6 rounded-3xl bg-gradient-to-b from-white/95 to-[#CDF5FD]/40 border border-[#89CFF3]/40 shadow-lg shadow-[#00A9FF]/10 flex items-center justify-center">
              <img
                src={hrIllustration}
                alt="AI-powered role-based mock interview illustration"
                className="w-full h-auto max-h-[280px] object-contain transition-transform duration-300 hover:scale-102"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          COMPANY BASED INTERVIEW SECTION
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Company Based Interview
            </h2>
            <p className="text-sm text-slate-500">
              Target role interviews calibrated to specific hiring benchmarks
              and technical bars.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/practice/company')}
            className="text-xs font-bold text-[#00A9FF] hover:text-[#0080c4] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Companies</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TARGET_COMPANIES.map((item) => (
            <div
              key={item.name}
              onClick={() => {
                const matched = ROLE_DEFINITIONS.find((r) =>
                  item.roles.some((ir) => ir.includes(r.title) || r.title.includes(ir)),
                ) || ROLE_DEFINITIONS[0];
                setSetupModalRole(matched);
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#89CFF3] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <CompanyLogo name={item.name} size={18} showName={false} />
                <span className="text-[10px] font-bold text-[#00A9FF] opacity-0 group-hover:opacity-100 transition-opacity">
                  Practice →
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{item.name}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {item.roles[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          MY ATTEMPTED ROLES SECTION
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              My Attempted Roles
            </h2>
            <p className="text-sm text-slate-500">
              Track your history and resume practice for your targeted careers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw size={16} className={isLoadingInterviews ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoadingInterviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : attemptedRoles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center mx-auto mb-3">
              <Bot size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No mock interviews yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
              Start your first AI-powered interview to see your progress here.
            </p>
            <button
              type="button"
              onClick={() => {
                const target = document.getElementById('explore-roles-section');
                target?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Explore Available Roles</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {attemptedRoles.map((item) => {
              const roleDef =
                item.roleDef ||
                ROLE_DEFINITIONS.find(
                  (r) => r.title.toLowerCase() === item.roleTitle.toLowerCase(),
                ) || {
                  id: item.roleTitle.toLowerCase().replace(/\s+/g, '-'),
                  title: item.roleTitle,
                  category: 'Engineering' as const,
                  description:
                    'Role evaluated based on industry interview standards and questions.',
                  companies: ['Microsoft', 'Amazon', 'Google'],
                  skills: ['Core Competencies', 'Problem Solving'],
                };

              return (
                <div
                  key={item.roleTitle}
                  className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.roleTitle}
                      </h3>
                      {item.bestScore > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Award size={12} />
                          {Math.round(item.bestScore)}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {roleDef.description}
                    </p>

                    <div className="pt-1">
                      <CompanyLogoList
                        companies={roleDef.companies}
                        max={3}
                        size={14}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-700">
                        Total Attempts:
                      </span>{' '}
                      {item.attempts.length}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Last:
                      </span>{' '}
                      {formatDate(item.lastAttempted)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDetailModalRole(roleDef)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupModalRole(roleDef)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#00A9FF] hover:bg-[#0092dd] transition-colors text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Attempt Again</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          EXPLORE ROLES SECTION
      ======================================================== */}
      <section id="explore-roles-section" className="space-y-6 pt-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Explore Roles
          </h2>
          <p className="text-sm text-slate-500">
            Select a target role to launch your personalized AI technical interview.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, skills, or target companies..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#00A9FF] focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#00A9FF] cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#00A9FF] cursor-pointer"
            >
              <option value="All Roles">All Roles</option>
              {ROLE_DEFINITIONS.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Cards Grid */}
        {filteredRoles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
            <AlertCircle size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No matching roles found
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Try adjusting your search terms or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All Categories');
                setSelectedRoleFilter('All Roles');
              }}
              className="text-xs text-[#00A9FF] font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <motion.div
                key={role.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#89CFF3] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A9FF] bg-[#00A9FF]/10 px-2 py-0.5 rounded-md">
                        {role.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                        {role.title}
                      </h3>
                    </div>
                    {role.popular && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Sparkles size={10} /> Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Company Logos */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Companies
                    </p>
                    <CompanyLogoList companies={role.companies} max={3} size={15} />
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Key Competencies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailModalRole(role)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => setSetupModalRole(role)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Start Interview</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          QUICK START MODAL
      ======================================================== */}
      <AnimatePresence>
        {setupModalRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <button
                type="button"
                onClick={() => setSetupModalRole(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00A9FF]">
                  AI Interview Setup
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Start {setupModalRole.title} Interview
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure your interview parameters. The AI interviewer adapts question difficulty to your responses.
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#00A9FF]" />
                  <span>Duration</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([10, 20, 30, 45] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        duration === d
                          ? 'bg-[#00A9FF] text-white border-[#00A9FF] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d} Mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Interviewer Persona */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Bot size={14} className="text-[#00A9FF]" />
                  <span>AI Interviewer & Voice</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewer('jenny');
                      setVoiceGender('female');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      interviewer === 'jenny'
                        ? 'border-[#00A9FF] bg-[#CDF5FD]/30 ring-1 ring-[#00A9FF]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Jenny (Female)</p>
                    <p className="text-[11px] text-slate-500">
                      Microsoft Heera (Voice Profile)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInterviewer('samm');
                      setVoiceGender('male');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      interviewer === 'samm'
                        ? 'border-[#00A9FF] bg-[#CDF5FD]/30 ring-1 ring-[#00A9FF]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Sam (Male)</p>
                    <p className="text-[11px] text-slate-500">
                      Microsoft David (Voice Profile)
                    </p>
                  </button>
                </div>
              </div>

              {/* Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mic size={14} className="text-[#00A9FF]" />
                  <span>Interview Mode</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['voice', 'video', 'text'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                        mode === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSetupModalRole(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => void handleLaunchInterview()}
                  className="px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-md shadow-[#00A9FF]/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isStarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching Room...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} fill="currentColor" />
                      <span>Start Interview Room</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          ROLE DETAIL MODAL
      ======================================================== */}
      <AnimatePresence>
        {detailModalRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <button
                type="button"
                onClick={() => setDetailModalRole(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00A9FF]">
                  {detailModalRole.category}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {detailModalRole.title}
                </h3>
                <p className="text-sm text-slate-600 pt-1 leading-relaxed">
                  {detailModalRole.description}
                </p>
              </div>

              {/* Companies */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Companies Hiring For This Role
                </h4>
                <CompanyLogoList
                  companies={detailModalRole.companies}
                  max={6}
                  size={16}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Core Evaluation Topics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {detailModalRole.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#CDF5FD]/40 text-slate-700 border border-[#89CFF3]/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDetailModalRole(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = detailModalRole;
                    setDetailModalRole(null);
                    setSetupModalRole(r);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Start Mock Interview</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
