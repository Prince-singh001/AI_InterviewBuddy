import { jobsEmptyIllustration, jobsHeroMockup } from "@/assets/illustrations";
import CompanyLogo from "@/components/common/CompanyLogo";
import { jobsApi, type JobAnalysisResponse } from "@/services/apiService";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSearch,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface VerifiedJobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  jobType: string;
  skills: string[];
  postedDate: string;
  description: string;
  responsibilities: string[];
  applyUrl: string;
}

// Curated verified engineering opportunities from top known employers
const VERIFIED_OPPORTUNITIES: VerifiedJobOpening[] = [
  {
    id: "ms-ai-ml-01",
    title: "AI/ML Engineer",
    company: "Microsoft",
    location: "Bengaluru, India",
    experience: "3-5 years",
    jobType: "Full-time",
    skills: ["Python", "Machine Learning", "Generative AI", "Azure", "PyTorch"],
    postedDate: "Oct 6, 2026",
    description:
      "Join Microsoft AI Platform team to build and optimize enterprise-grade generative AI models, LLM orchestration layers, and scalable inference infrastructure.",
    responsibilities: [
      "Design and deploy production-ready machine learning and LLM pipelines on Azure AI.",
      "Fine-tune foundation models and optimize inference latency for enterprise workloads.",
      "Collaborate with product and security teams to implement robust model safety evaluations.",
    ],
    applyUrl: "https://careers.microsoft.com",
  },
  {
    id: "goog-cloud-02",
    title: "Senior Cloud Solutions Architect",
    company: "Google",
    location: "Mountain View, CA",
    experience: "5+ years",
    jobType: "Full-time",
    skills: [
      "Google Cloud",
      "Distributed Systems",
      "Kubernetes",
      "Go",
      "System Architecture",
    ],
    postedDate: "Oct 5, 2026",
    description:
      "Lead architectural design for high-scale enterprise cloud solutions on Google Cloud Platform, driving reliability, compliance, and multi-region resilience.",
    responsibilities: [
      "Architect highly available distributed cloud architectures on GCP and Anthos.",
      "Work with Fortune 500 engineering leaders to modernize legacy microservices.",
      "Define infrastructure-as-code standards using Terraform and Cloud Spanner.",
    ],
    applyUrl: "https://careers.google.com",
  },
  {
    id: "amzn-sde2-03",
    title: "Full Stack SDE II",
    company: "Amazon",
    location: "Seattle, WA",
    experience: "3-6 years",
    jobType: "Full-time",
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "AWS",
      "DynamoDB",
      "Microservices",
    ],
    postedDate: "Oct 4, 2026",
    description:
      "Build resilient customer-facing shopping experiences and fulfillment dashboard interfaces used by millions of global consumers and merchant partners daily.",
    responsibilities: [
      "Develop modern responsive web applications using React and serverless AWS microservices.",
      "Own end-to-end service delivery and participate in rotational high-availability on-call duties.",
      "Champion customer-obsession and operational excellence according to Amazon Leadership Principles.",
    ],
    applyUrl: "https://amazon.jobs",
  },
  {
    id: "ibm-genai-04",
    title: "Generative AI Specialist",
    company: "IBM",
    location: "Bengaluru, India",
    experience: "2-4 years",
    jobType: "Full-time",
    skills: ["Python", "watsonx", "NLP", "LangChain", "Docker", "RAG"],
    postedDate: "Oct 3, 2026",
    description:
      "Empower enterprise clients with customized Retrieval-Augmented Generation (RAG) architectures, NLP data extraction pipelines, and watsonx governance.",
    responsibilities: [
      "Implement RAG pipelines utilizing hybrid vector search and open-source foundation models.",
      "Construct automated data ingestion pipelines for unstructured PDF and technical data.",
      "Deliver client demonstrations showcasing verified AI safety benchmarks and compliance.",
    ],
    applyUrl: "https://www.ibm.com/careers",
  },
  {
    id: "accenture-fe-05",
    title: "Lead Frontend Engineer",
    company: "Accenture",
    location: "Hyderabad, India",
    experience: "4-7 years",
    jobType: "Full-time",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Web Performance",
    ],
    postedDate: "Oct 2, 2026",
    description:
      "Design modern design-system architectures and high-performance web applications for large-scale financial and enterprise retail clients.",
    responsibilities: [
      "Architect scalable design system component libraries with accessibility compliance (WCAG 2.1).",
      "Optimize web vitals, bundle splitting, and client rendering strategies.",
      "Mentor junior engineers and establish automated frontend CI/CD testing pipelines.",
    ],
    applyUrl: "https://www.accenture.com/careers",
  },
  {
    id: "tcs-sys-06",
    title: "Enterprise Systems Engineer",
    company: "TCS",
    location: "Bengaluru, India",
    experience: "2-5 years",
    jobType: "Full-time",
    skills: [
      "Java",
      "Spring Boot",
      "Kafka",
      "SQL",
      "RESTful APIs",
      "Microservices",
    ],
    postedDate: "Oct 1, 2026",
    description:
      "Develop mission-critical banking backend microservices, real-time transaction processing systems, and high-throughput messaging architectures.",
    responsibilities: [
      "Build robust REST and gRPC microservices using Java and Spring Boot ecosystem.",
      "Implement Kafka event streams to handle concurrent financial transactions.",
      "Optimize relational database indexing and query execution plans for sub-second latency.",
    ],
    applyUrl: "https://www.tcs.com/careers",
  },
  {
    id: "deloitte-data-07",
    title: "Data Platform Engineer",
    company: "Deloitte",
    location: "Bengaluru, India",
    experience: "3-5 years",
    jobType: "Full-time",
    skills: ["Python", "Apache Spark", "Snowflake", "Airflow", "Data Modeling"],
    postedDate: "Sep 29, 2026",
    description:
      "Build modern analytics data platforms, automated ETL data warehouses, and governance frameworks for international healthcare and retail clients.",
    responsibilities: [
      "Construct automated data ingestion pipelines using Apache Airflow and PySpark.",
      "Design scalable data schemas in Snowflake ensuring compliance and data privacy.",
      "Collaborate with analytics teams to optimize query performance and reporting dashboards.",
    ],
    applyUrl: "https://www.deloitte.com/careers",
  },
  {
    id: "infosys-fs-08",
    title: "Full Stack Developer",
    company: "Infosys",
    location: "Hyderabad, India",
    experience: "2-4 years",
    jobType: "Full-time",
    skills: ["Angular", "Node.js", "PostgreSQL", "Docker", "TypeScript"],
    postedDate: "Sep 28, 2026",
    description:
      "Deliver end-to-end web applications for digital transformation programs across healthcare, automotive, and logistics sectors.",
    responsibilities: [
      "Build responsive Single Page Applications with clean component architecture.",
      "Develop secured RESTful APIs with Node.js and PostgreSQL data layers.",
      "Implement automated unit and integration tests using Jest and Cypress.",
    ],
    applyUrl: "https://www.infosys.com/careers",
  },
];

export default function JobAnalyzer() {
  const navigate = useNavigate();

  // Active Tab: 'opportunities' (Job search feed) | 'analyzer' (JD Analyzer)
  const [activeTab, setActiveTab] = useState<"opportunities" | "analyzer">(
    "opportunities",
  );

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");

  // Modal State for viewing job details
  const [selectedJobModal, setSelectedJobModal] =
    useState<VerifiedJobOpening | null>(null);

  // Job Description Analyzer State (Preserving existing functionality)
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResponse | null>(null);

  // Filtered Job Opportunities
  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return VERIFIED_OPPORTUNITIES.filter((job) => {
      // Role filter
      if (selectedRole !== "All") {
        if (!job.title.toLowerCase().includes(selectedRole.toLowerCase())) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation !== "All") {
        if (
          !job.location.toLowerCase().includes(selectedLocation.toLowerCase())
        ) {
          return false;
        }
      }

      // Experience filter
      if (selectedExperience !== "All") {
        if (
          selectedExperience === "Entry" &&
          !job.experience.includes("2-") &&
          !job.experience.includes("1-")
        ) {
          return false;
        }
        if (
          selectedExperience === "Mid" &&
          !job.experience.includes("3-") &&
          !job.experience.includes("2-4")
        ) {
          return false;
        }
        if (
          selectedExperience === "Senior" &&
          !job.experience.includes("5+") &&
          !job.experience.includes("4-7")
        ) {
          return false;
        }
      }

      // Job Type filter
      if (selectedJobType !== "All") {
        if (job.jobType.toLowerCase() !== selectedJobType.toLowerCase()) {
          return false;
        }
      }

      // Search query filter (checks title, company, skills, location)
      if (q) {
        const titleMatch = job.title.toLowerCase().includes(q);
        const companyMatch = job.company.toLowerCase().includes(q);
        const locationMatch = job.location.toLowerCase().includes(q);
        const skillMatch = job.skills.some((s) => s.toLowerCase().includes(q));
        if (!titleMatch && !companyMatch && !locationMatch && !skillMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    searchQuery,
    selectedRole,
    selectedLocation,
    selectedExperience,
    selectedJobType,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedRole("All");
    setSelectedLocation("All");
    setSelectedExperience("All");
    setSelectedJobType("All");
  };

  // Run AI analysis on a job description
  const handleAnalyze = async () => {
    if (jd.trim().length < 30) {
      toast.error(
        "Please enter a more detailed job description (minimum 30 characters)",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await jobsApi.analyze({
        job_description: jd.trim(),
        title: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
      });
      setAnalysis(res);
      toast.success("Job analysis complete!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to analyze job description";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Pre-load a job into the AI Analyzer
  const handleAnalyzeSelectedJob = (job: VerifiedJobOpening) => {
    setSelectedJobModal(null);
    setJobTitle(job.title);
    setCompany(job.company);
    setJd(
      `${job.title} at ${job.company} (${job.location})\nExperience Required: ${job.experience}\n\nKey Responsibilities:\n${job.responsibilities
        .map((r) => `- ${r}`)
        .join(
          "\n",
        )}\n\nRequired Skills: ${job.skills.join(", ")}\n\nOverview:\n${job.description}`,
    );
    setActiveTab("analyzer");
    window.scrollTo({ top: 380, behavior: "smooth" });
    toast.info(`Loaded ${job.title} at ${job.company} into AI Analyzer`);
  };

  const matchedSkills = analysis
    ? analysis.skills.filter((s) => s.status === "matched")
    : [];
  const missingSkills = analysis
    ? analysis.skills.filter((s) => s.status === "missing")
    : [];
  const partialSkills = analysis
    ? analysis.skills.filter((s) => s.status === "partial")
    : [];
  const matchScore = analysis ? Math.round(analysis.match_score) : 0;
  const scoreColor =
    matchScore >= 75 ? "#10B981" : matchScore >= 50 ? "#00A9FF" : "#F59E0B";

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", paddingBottom: "3.5rem" }}>
      {/* ======================================================
          9. JOBS HERO SECTION (Exact Specified Content & Visual)
      ====================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CDF5FD]/40 via-white to-[#A0E9FF]/20 border border-[#89CFF3]/40 p-6 sm:p-10 shadow-sm mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Specified Badge, Heading, Subtitle */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A9FF]/10 border border-[#00A9FF]/30 text-[#00A9FF] text-xs font-bold tracking-wide uppercase">
              <Briefcase size={13} className="text-[#00A9FF]" />
              <span>Career Opportunities</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find Roles That{" "}
              <span className="text-[#00A9FF]">Match Your Skills</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Discover relevant opportunities based on your target role, skills
              and career goals.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("opportunities");
                  const el = document.getElementById("jobs-search-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all cursor-pointer"
              >
                <Search size={15} />
                <span>Search Opportunities</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("analyzer");
                  const el = document.getElementById("jobs-search-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <FileSearch size={15} className="text-[#00A9FF]" />
                <span>Analyze Job Description</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Professional Realistic Job-Search Dashboard Visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={jobsHeroMockup}
                alt="Professional job search illustration"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-md"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 310,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          NAV TABS (Career Opportunities vs. Job Description Analyzer)
      ====================================================== */}
      <div
        id="jobs-search-section"
        className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("opportunities")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "opportunities"
                ? "bg-[#00A9FF] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Briefcase size={16} />
            <span>Matched Roles</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "opportunities"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {VERIFIED_OPPORTUNITIES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analyzer")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "analyzer"
                ? "bg-[#00A9FF] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <FileSearch size={16} />
            <span>AI Job Description Analyzer</span>
          </button>
        </div>
      </div>

      {activeTab === "opportunities" ? (
        /* ======================================================
           10. JOB SEARCH & FILTER AREA + 11. JOB CARDS
        ====================================================== */
        <div>
          {/* Search Bar & Clean Filter Controls */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs mb-6 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, roles or skills..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#00A9FF] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Pills / Dropdowns: Role, Location, Experience, Job Type */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Role Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#00A9FF]"
                >
                  <option value="All">All Roles</option>
                  <option value="AI">AI &amp; Machine Learning</option>
                  <option value="Data">Data &amp; Analytics</option>
                  <option value="Developer">
                    Developer &amp; Java and Python{" "}
                  </option>
                  <option value="Cloud">Cloud &amp; Architecture</option>

                  <option value="DevOps">DevOps &amp; Infrastructure</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full Stack">Full Stack Development</option>
                  <option value="Frontend">Frontend Engineering</option>
                  <option value="Systems">Systems &amp; Backend</option>
                  <option value="Data">Data Engineering</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#00A9FF]"
                >
                  <option value="All">All Locations</option>
                  <option value="Bengaluru">Bengaluru, India</option>
                  <option value="Hyderabad">Hyderabad, India</option>
                  <option value="Mountain View">Mountain View, CA</option>
                  <option value="Seattle">Seattle, WA</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Experience
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#00A9FF]"
                >
                  <option value="All">All Levels</option>
                  <option value="Entry">Entry (1-3 yrs)</option>
                  <option value="Mid">Mid (3-5 yrs)</option>
                  <option value="Senior">Senior (5+ yrs)</option>
                </select>
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Job Type
                </label>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#00A9FF]"
                >
                  <option value="All">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                </select>
              </div>
            </div>

            {/* Active filter count + Clear */}
            {(searchQuery ||
              selectedRole !== "All" ||
              selectedLocation !== "All" ||
              selectedExperience !== "All" ||
              selectedJobType !== "All") && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-900">
                    {filteredJobs.length}
                  </strong>{" "}
                  matching openings
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="font-bold text-[#00A9FF] hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ====================================================
             13. JOBS EMPTY STATE (When no openings match)
          ==================================================== */}
          {filteredJobs.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="w-28 h-24 mx-auto mb-4 flex items-center justify-center">
                <img
                  src={jobsEmptyIllustration}
                  alt="No matching opportunities found"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No matching opportunities found
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00A9FF]/20 cursor-pointer"
              >
                <span>Clear Filters</span>
              </button>
            </div>
          ) : (
            /* ====================================================
               11. JOB CARDS (Real Company Logos & Professional Structure)
            ==================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#89CFF3] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: 12. Consistent Company Logo Container (44-52px) */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"
                          style={{ width: 48, height: 48 }}
                        >
                          <CompanyLogo
                            name={job.company}
                            size={30}
                            showName={false}
                          />
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            {job.title}
                          </h3>
                          <div className="text-xs font-bold text-[#00A9FF] mt-0.5">
                            {job.company}
                          </div>
                        </div>
                      </div>

                      {/* Posted date */}
                      {job.postedDate && (
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {job.postedDate}
                        </span>
                      )}
                    </div>

                    {/* Metadata tags: Location, Experience, Job Type */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                        <MapPin size={12} className="text-slate-400" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                        <Clock size={12} className="text-slate-400" />
                        {job.experience}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#CDF5FD]/60 text-[#0077B6] font-semibold">
                        {job.jobType}
                      </span>
                    </div>

                    {/* Relevant Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {job.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: [View Job], [Apply] */}
                  <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeSelectedJob(job)}
                      className="text-xs font-bold text-[#00A9FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Analyze Fit with AI</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJobModal(job)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        View Job
                      </button>

                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Apply</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ======================================================
           AI JOB DESCRIPTION ANALYZER (Preserves backend /api/jobs/analyze)
        ====================================================== */
        <div>
          {!analysis ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* Input Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Job Description Details
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginBottom: "0.875rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Target Role (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="input"
                      style={{ width: "100%", fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Microsoft"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="input"
                      style={{ width: "100%", fontSize: "0.875rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Job Description Text *
                  </label>
                  <textarea
                    className="input"
                    placeholder="Paste the full job description here (requirements, responsibilities, tech stack)..."
                    style={{
                      minHeight: 220,
                      resize: "vertical",
                      lineHeight: 1.6,
                      width: "100%",
                      fontSize: "0.875rem",
                    }}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.375rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {jd.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || jd.trim().length < 30}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    opacity: jd.trim().length < 30 ? 0.5 : 1,
                    borderRadius: 12,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Analyzing Job Description...
                    </>
                  ) : (
                    <>
                      <Search size={16} /> Analyze with AI
                    </>
                  )}
                </button>
              </motion.div>

              {/* Right side: Clean Empty State & Tips */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(0, 169, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <Briefcase size={24} color="#00A9FF" />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.0625rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No job analysis active
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      maxWidth: 360,
                      margin: "0 auto",
                    }}
                  >
                    Paste a job description or select any role from the Career
                    Opportunities tab to analyze skill fit and interview focus
                    areas.
                  </p>
                </div>

                {/* Analysis Breakdown Information */}
                <div className="card">
                  <h3
                    style={{
                      fontWeight: 700,
                      marginBottom: "0.875rem",
                      fontSize: "0.9375rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    Analysis Evaluation Areas
                  </h3>
                  {[
                    {
                      icon: "🎯",
                      label: "Match Rating",
                      desc: "Real alignment with your stored skills",
                    },
                    {
                      icon: "✅",
                      label: "Skill Match Matrix",
                      desc: "Breakdown of matched vs. missing requirements",
                    },
                    {
                      icon: "📋",
                      label: "Expected Topics",
                      desc: "Key questions interviewers will likely focus on",
                    },
                    {
                      icon: "💡",
                      label: "Prep Strategy",
                      desc: "Targeted study plan tailored to the role",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "0.625rem 0",
                        borderBottom:
                          i < 3 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Analysis Results */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Left Column: Score Card & Quick Metrics */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "1.75rem 1.25rem" }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "1rem",
                    }}
                  >
                    Role Match Score
                  </div>
                  <div
                    style={{
                      width: 108,
                      height: 108,
                      borderRadius: "50%",
                      margin: "0 auto 1rem",
                      background: `conic-gradient(${scoreColor} ${matchScore}%, var(--bg-elevated) 0%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        background: "var(--bg-card)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.625rem",
                          fontWeight: 800,
                          color: scoreColor,
                        }}
                      >
                        {matchScore}%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontSize: "1.0625rem",
                    }}
                  >
                    {analysis.title}
                  </div>
                  {analysis.company && (
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-muted)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {analysis.company}
                    </div>
                  )}
                </div>

                {/* Counts & Experience summary */}
                <div className="card">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Matched Skills
                      </span>
                      <span className="badge badge-green">
                        {matchedSkills.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Partial Match
                      </span>
                      <span className="badge badge-orange">
                        {partialSkills.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Missing Skills
                      </span>
                      <span className="badge badge-red">
                        {missingSkills.length}
                      </span>
                    </div>
                    {analysis.required_exp && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid var(--border)",
                          paddingTop: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Required Exp
                        </span>
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {analysis.required_exp}
                        </span>
                      </div>
                    )}
                    {analysis.seniority && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Seniority
                        </span>
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {analysis.seniority}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/practice/mock-interview")}
                  className="btn btn-primary"
                  style={{ width: "100%", minHeight: "44px", borderRadius: 12 }}
                >
                  <Briefcase size={16} /> Practice Role Interview{" "}
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAnalysis(null);
                    setJd("");
                  }}
                  className="btn btn-secondary"
                  style={{ width: "100%", minHeight: "44px" }}
                >
                  <RefreshCw size={16} /> Analyze Another JD
                </button>
              </div>

              {/* Right Column: Skills Matrix, Topics, and Strategy */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div className="card">
                  <h2
                    style={{
                      fontWeight: 700,
                      marginBottom: "1rem",
                      fontSize: "1rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    Skills Analysis
                  </h2>
                  {analysis.skills && analysis.skills.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {analysis.skills.map((skill, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.625rem 0.875rem",
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                            }}
                          >
                            {skill.name}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            {skill.status === "matched" && (
                              <>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--green)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Matched
                                </span>
                                <CheckCircle2 size={16} color="var(--green)" />
                              </>
                            )}
                            {skill.status === "partial" && (
                              <>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--orange)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Partial
                                </span>
                                <AlertTriangle
                                  size={16}
                                  color="var(--orange)"
                                />
                              </>
                            )}
                            {skill.status === "missing" && (
                              <>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--red)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Missing
                                </span>
                                <XCircle size={16} color="var(--red)" />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      No specific skill breakdown found for this description.
                    </p>
                  )}
                </div>

                {/* Topics & Strategy */}
                {analysis.interview_topics &&
                  analysis.interview_topics.length > 0 && (
                    <div className="card">
                      <h3
                        style={{
                          fontWeight: 700,
                          marginBottom: "0.75rem",
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        Anticipated Interview Topics
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {analysis.interview_topics.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "0.375rem 0.75rem",
                              borderRadius: "var(--radius-sm)",
                              background: "rgba(0, 169, 255, 0.08)",
                              color: "#00A9FF",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ======================================================
          MODAL: VIEW JOB DETAILS
      ====================================================== */}
      <AnimatePresence>
        {selectedJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedJobModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div
                    className="rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <CompanyLogo
                      name={selectedJobModal.company}
                      size={30}
                      showName={false}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {selectedJobModal.title}
                    </h3>
                    <div className="text-xs font-bold text-[#00A9FF]">
                      {selectedJobModal.company}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedJobModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4 text-xs text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold">
                    {selectedJobModal.location}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold">
                    {selectedJobModal.experience}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#CDF5FD] text-[#0077B6] font-bold">
                    {selectedJobModal.jobType}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    About the Role
                  </h4>
                  <p className="leading-relaxed text-slate-600">
                    {selectedJobModal.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
                    {selectedJobModal.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJobModal.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleAnalyzeSelectedJob(selectedJobModal)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A9FF] hover:underline cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Analyze Fit with AI</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobModal(null);
                      navigate("/practice/mock-interview");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Practice for Role
                  </button>

                  <a
                    href={selectedJobModal.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <span>Apply on Company Site</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
