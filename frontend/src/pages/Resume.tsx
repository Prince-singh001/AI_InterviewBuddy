import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  FileEdit,
  FileSearch,
  Target,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
  Layers,
  ArrowRight,
  Download,
  Plus,
  Trash2,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react'
import { resumeApi, ResumeAnalysisResponse, ResumeItem } from '@/services/apiService'
import { resumeHeroMockup } from '@/assets/illustrations'
import { toast } from 'sonner'

// ── Score Breakdown Progress Bar ──────────────────────────────
function ScoreBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const [animated, setAnimated] = useState(false)
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)))
  const color = normalizedValue >= 80 ? '#10B981' : normalizedValue >= 60 ? '#00A9FF' : '#F59E0B'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onAnimationComplete={() => setAnimated(true)}
      style={{ marginBottom: '0.875rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color }}>
          {animated ? normalizedValue : 0}%
        </span>
      </div>
      <div className="progress-track" style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${normalizedValue}%` : 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
    </motion.div>
  )
}

export default function Resume() {
  const [activeMode, setActiveMode] = useState<'analyzer' | 'builder'>('analyzer')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysisResponse | null>(null)
  const [previousResumes, setPreviousResumes] = useState<ResumeItem[]>([])
  const [loadingList, setLoadingList] = useState(false)

  // Builder form state for real Resume Builder experience
  const [builderData, setBuilderData] = useState({
    fullName: 'Alex Reynolds',
    targetRole: 'Senior Full Stack Engineer',
    email: 'alex.reynolds@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    summary: 'Results-driven software engineer with 5+ years of experience in distributed web applications, cloud architecture, and modern JavaScript frameworks.',
    skills: 'TypeScript, React, Node.js, Next.js, Python, PostgreSQL, Docker, AWS, GraphQL, CI/CD',
    experience: [
      {
        company: 'Apex Cloud Systems',
        role: 'Senior Software Engineer',
        duration: '2022 - Present',
        description: 'Led migration to microservices, reducing API response times by 38%. Architected real-time analytics pipeline using Kafka and Node.js.',
      },
      {
        company: 'Vanguard Tech',
        role: 'Full Stack Engineer',
        duration: '2019 - 2022',
        description: 'Built customer-facing React portal serving 120k active monthly users. Implemented automated testing suite achieving 85% code coverage.',
      },
    ],
    education: 'B.S. in Computer Science — University of Washington (2019)',
  })
  const [builderCopied, setBuilderCopied] = useState(false)

  const uploadInputRef = useRef<HTMLInputElement>(null)
  const uploadSectionRef = useRef<HTMLDivElement>(null)

  // Fetch previous resumes on mount
  useEffect(() => {
    let isMounted = true
    setLoadingList(true)
    resumeApi.list()
      .then((resumes) => {
        if (isMounted) setPreviousResumes(resumes || [])
      })
      .catch(() => {
        // Silently catch list error, not critical
      })
      .finally(() => {
        if (isMounted) setLoadingList(false)
      })
    return () => { isMounted = false }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.docx') || dropped.name.endsWith('.pdf'))) {
      setFile(dropped)
    } else {
      toast.error('Please upload a PDF or DOCX file')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a resume file first')
      return
    }

    setLoading(true)
    setStatusMessage('Uploading resume...')

    try {
      const uploadRes = await resumeApi.upload(file)
      setStatusMessage('Analyzing resume with AI...')
      const analysisRes = await resumeApi.analyze(uploadRes.id)
      setAnalysis(analysisRes)
      toast.success('Resume analyzed successfully!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze resume'
      toast.error(msg)
    } finally {
      setLoading(false)
      setStatusMessage('')
    }
  }

  const handleSelectPrevious = async (resumeId: string) => {
    setLoading(true)
    setStatusMessage('Loading analysis...')
    try {
      const res = await resumeApi.analyze(resumeId)
      setAnalysis(res)
      setActiveMode('analyzer')
      toast.success('Analysis loaded')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analysis'
      toast.error(msg)
    } finally {
      setLoading(false)
      setStatusMessage('')
    }
  }

  const scrollToUpload = () => {
    setActiveMode('analyzer')
    setTimeout(() => {
      uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleDownloadText = () => {
    const text = `
======================================================
${builderData.fullName.toUpperCase()}
${builderData.targetRole}
${builderData.email} | ${builderData.phone} | ${builderData.location}
======================================================

PROFESSIONAL SUMMARY
${builderData.summary}

CORE SKILLS
${builderData.skills}

WORK EXPERIENCE
${builderData.experience
  .map(
    (exp) => `
${exp.role} — ${exp.company} (${exp.duration})
${exp.description}
`
  )
  .join('\n')}

EDUCATION
${builderData.education}
`.trim()

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${builderData.fullName.replace(/\s+/g, '_')}_Resume.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Resume text file downloaded!')
  }

  const handleCopyFormatted = () => {
    const text = `${builderData.fullName}\n${builderData.targetRole}\n${builderData.email} | ${builderData.phone}\n\nSUMMARY\n${builderData.summary}\n\nSKILLS\n${builderData.skills}\n\nEXPERIENCE\n` +
      builderData.experience.map(e => `${e.role} at ${e.company} (${e.duration})\n${e.description}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setBuilderCopied(true)
    toast.success('Resume content copied to clipboard!')
    setTimeout(() => setBuilderCopied(false), 2000)
  }

  const overallScore = analysis ? Math.round(analysis.overall_score) : 0
  const scoreColor = overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#00A9FF' : '#F59E0B'

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ========================================================
          HERO SECTION (LEFT: TEXT & ACTIONS, RIGHT: REAL MOCKUP)
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CDF5FD]/40 via-white to-[#A0E9FF]/20 border border-[#89CFF3]/40 p-6 sm:p-10 shadow-sm mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Exact specified badge, heading, subheading, buttons */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A9FF]/10 border border-[#00A9FF]/30 text-[#00A9FF] text-xs font-bold tracking-wide uppercase">
              <Sparkles size={13} className="text-[#00A9FF]" />
              <span>AI Resume Tools</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Build a Resume That <span className="text-[#00A9FF]">Gets Noticed</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Create, analyze and improve your resume with AI-powered tools designed for modern job applications.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('builder')
                  setTimeout(() => {
                    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00A9FF]/25 transition-all cursor-pointer"
              >
                <FileEdit size={16} />
                <span>Build Resume</span>
              </button>

              <button
                type="button"
                onClick={scrollToUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <FileSearch size={16} className="text-[#00A9FF]" />
                <span>Analyze Resume</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Real Professional Resume-Related Laptop Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={resumeHeroMockup}
                alt="Professional resume analysis illustration"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-md"
                style={{ width: '100%', height: 'auto', maxHeight: 310, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. RESUME FEATURE CARDS (4 Professional Cards with Line Icons)
      ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Resume Builder */}
        <div
          onClick={() => {
            setActiveMode('builder')
            uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer ${
            activeMode === 'builder'
              ? 'border-[#00A9FF] ring-2 ring-[#00A9FF]/15 shadow-sm'
              : 'border-slate-200 hover:border-[#89CFF3] shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#CDF5FD] text-[#00A9FF] flex items-center justify-center mb-3">
            <FileEdit size={20} strokeWidth={2.2} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Resume Builder</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create a structured, professional resume.
          </p>
        </div>

        {/* Card 2: Resume Analyzer */}
        <div
          onClick={() => {
            setActiveMode('analyzer')
            uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer ${
            activeMode === 'analyzer' && !file
              ? 'border-[#00A9FF] ring-2 ring-[#00A9FF]/15 shadow-sm'
              : 'border-slate-200 hover:border-[#89CFF3] shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileSearch size={20} strokeWidth={2.2} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Resume Analyzer</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Analyze your resume and identify improvement areas.
          </p>
        </div>

        {/* Card 3: ATS Optimization */}
        <div
          onClick={() => {
            setActiveMode('analyzer')
            uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#89CFF3] shadow-xs transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Target size={20} strokeWidth={2.2} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">ATS Optimization</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Improve resume structure and keyword alignment.
          </p>
        </div>

        {/* Card 4: Resume Upload */}
        <div
          onClick={() => {
            setActiveMode('analyzer')
            uploadInputRef.current?.click()
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#89CFF3] shadow-xs transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <UploadCloud size={20} strokeWidth={2.2} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Resume Upload</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload an existing resume for analysis.
          </p>
        </div>
      </section>

      {/* ========================================================
          4. RESUME WORKFLOW SECTION (Clean numbered steps, no fake stats)
      ======================================================== */}
      <section className="mb-10 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A9FF]">
              Simple Preparation Flow
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              How InterviewerBuddy Resume Works
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode('analyzer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMode === 'analyzer'
                  ? 'bg-[#00A9FF] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Analyze Existing
            </button>
            <button
              onClick={() => setActiveMode('builder')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMode === 'builder'
                  ? 'bg-[#00A9FF] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Resume Builder
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 01 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative">
            <div className="text-2xl font-black text-[#00A9FF]/40 mb-1">01</div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Upload or create your resume</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Import a PDF or DOCX file, or use our structured resume creator.
            </p>
          </div>

          {/* Step 02 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative">
            <div className="text-2xl font-black text-[#00A9FF]/40 mb-1">02</div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Analyze your content</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify ATS compatibility, extracted technical skills, and layout structure.
            </p>
          </div>

          {/* Step 03 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative">
            <div className="text-2xl font-black text-[#00A9FF]/40 mb-1">03</div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Improve your resume</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apply prioritized recommendations to increase your recruiter callback rate.
            </p>
          </div>

          {/* Step 04 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative">
            <div className="text-2xl font-black text-[#00A9FF]/40 mb-1">04</div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Download and apply</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export an ATS-friendly format ready for targeted job applications.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          ACTIVE WORKSPACE SECTION (ANALYZER OR BUILDER)
      ======================================================== */}
      <div ref={uploadSectionRef}>
        {activeMode === 'builder' ? (
          /* ====================================================
             INTERACTIVE RESUME BUILDER WORKSPACE
          ==================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Editor */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Resume Content Editor</h3>
                  <p className="text-xs text-slate-500">Edit sections to generate an ATS-formatted resume</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A9FF] hover:bg-[#0092dd] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Download size={14} />
                  <span>Download (.txt)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={builderData.fullName}
                    onChange={(e) => setBuilderData({ ...builderData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={builderData.targetRole}
                    onChange={(e) => setBuilderData({ ...builderData, targetRole: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={builderData.email}
                    onChange={(e) => setBuilderData({ ...builderData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone & Location</label>
                  <input
                    type="text"
                    value={builderData.location}
                    onChange={(e) => setBuilderData({ ...builderData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={builderData.summary}
                  onChange={(e) => setBuilderData({ ...builderData, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Core Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={builderData.skills}
                  onChange={(e) => setBuilderData({ ...builderData, skills: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Experience 1</label>
                <input
                  type="text"
                  value={`${builderData.experience[0]?.role} at ${builderData.experience[0]?.company}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' at ')
                    const updated = [...builderData.experience]
                    updated[0] = { ...updated[0], role: parts[0] || '', company: parts[1] || '' }
                    setBuilderData({ ...builderData, experience: updated })
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF] mb-2"
                />
                <textarea
                  rows={2}
                  value={builderData.experience[0]?.description}
                  onChange={(e) => {
                    const updated = [...builderData.experience]
                    updated[0] = { ...updated[0], description: e.target.value }
                    setBuilderData({ ...builderData, experience: updated })
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education</label>
                <input
                  type="text"
                  value={builderData.education}
                  onChange={(e) => setBuilderData({ ...builderData, education: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00A9FF]"
                />
              </div>
            </div>

            {/* Live ATS Preview */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#00A9FF]" />
                  <span className="text-xs font-bold text-slate-800">Live ATS Preview</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFormatted}
                  className="text-xs font-semibold text-[#00A9FF] hover:underline cursor-pointer"
                >
                  {builderCopied ? 'Copied!' : 'Copy Formatted Text'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3 font-sans text-xs">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{builderData.fullName}</h4>
                  <div className="text-[11px] font-semibold text-[#00A9FF]">{builderData.targetRole}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {builderData.email} • {builderData.phone} • {builderData.location}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wide mb-0.5">
                    Professional Summary
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{builderData.summary}</p>
                </div>

                <div>
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wide mb-1">
                    Core Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {builderData.skills.split(',').map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-700">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wide mb-1">
                    Experience
                  </div>
                  {builderData.experience.map((exp, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="font-bold text-slate-800 text-[11px]">{exp.role} — {exp.company}</div>
                      <div className="text-[10px] text-slate-400">{exp.duration}</div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wide mb-0.5">
                    Education
                  </div>
                  <p className="text-[10px] text-slate-600">{builderData.education}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Need direct ATS scan?</span>
                <button
                  type="button"
                  onClick={() => setActiveMode('analyzer')}
                  className="font-bold text-[#00A9FF] hover:underline cursor-pointer"
                >
                  Switch to Upload &amp; Analyze →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ====================================================
             ANALYZER WORKSPACE (UPLOAD + ANALYSIS)
          ==================================================== */
          <>
            {!analysis ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                {/* Upload Card */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Upload Resume
                  </h2>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${isDragging ? '#00A9FF' : file ? '#10B981' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      background: isDragging ? 'rgba(0, 169, 255, 0.05)' : 'var(--bg-elevated)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() => !file && uploadInputRef.current?.click()}
                  >
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    {file ? (
                      <div>
                        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                          <FileText size={26} color="#10B981" />
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{file.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null) }}
                          className="btn btn-ghost btn-sm"
                          style={{ minHeight: '36px' }}
                        >
                          <X size={14} /> Remove File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(0, 169, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                          <UploadCloud size={26} color="#00A9FF" />
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', fontSize: '1rem' }}>
                          Choose a resume or drag it here
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          Supports PDF and DOCX files up to 10MB
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ minHeight: '38px', padding: '0 1rem' }}
                          onClick={(e) => { e.stopPropagation(); uploadInputRef.current?.click() }}
                        >
                          Browse Files
                        </button>
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={20} color="#00A9FF" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {statusMessage || 'Processing resume...'}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={!file}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '1.25rem', padding: '0.875rem', opacity: file ? 1 : 0.5, borderRadius: 12 }}
                    >
                      <FileSearch size={18} /> Analyze Resume with AI
                    </button>
                  )}
                </motion.div>

                {/* Right side: Previous Resumes or Clean Empty State */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {previousResumes.length > 0 ? (
                    <div className="card">
                      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color="#00A9FF" /> Previous Resumes
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {previousResumes.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => handleSelectPrevious(r.id)}
                            style={{
                              padding: '0.875rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                              <FileText size={18} color="#00A9FF" style={{ flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {r.filename}
                                </div>
                                {r.overall_score !== null && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Score: {Math.round(r.overall_score)}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.8125rem', color: '#00A9FF', fontWeight: 600 }}>
                              View Analysis →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Clean Empty State */
                    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(0, 169, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}>
                        <FileText size={24} color="#00A9FF" />
                      </div>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        No resume analysis yet
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
                        Upload or analyze a resume to see your personalized insights, ATS compatibility, and tailored strengths.
                      </p>
                    </div>
                  )}

                  {/* Analysis Criteria Details */}
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Verified Analysis Criteria
                    </h3>
                    {[
                      { icon: '🎯', label: 'ATS Compatibility', desc: 'Keyword match and machine readability' },
                      { icon: '💡', label: 'Skills Relevance', desc: 'Extracted competencies and technical stack' },
                      { icon: '📊', label: 'Experience & Impact', desc: 'Action-oriented bullet points and metrics' },
                      { icon: '📝', label: 'Structure & Formatting', desc: 'Clean hierarchy and professional layout' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{item.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ====================================================
                 REAL ANALYSIS RESULTS DASHBOARD
              ==================================================== */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Left Column: Overall Score & Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Overall Score */}
                  <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                      Overall Resume Score
                    </div>
                    <div style={{
                      width: 108,
                      height: 108,
                      borderRadius: '50%',
                      margin: '0 auto 1rem',
                      background: `conic-gradient(${scoreColor} ${overallScore}%, var(--bg-elevated) 0%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.625rem', fontWeight: 800, color: scoreColor }}>{overallScore}</span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>/ 100</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      {overallScore >= 80 ? 'Strong Candidate Profile' : overallScore >= 60 ? 'Competitive Profile' : 'Needs Optimization'}
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Detailed Breakdown
                    </h3>
                    <ScoreBar label="ATS Compatibility" value={analysis.ats_score} delay={0.05} />
                    <ScoreBar label="Skills Relevance" value={analysis.skills_score} delay={0.1} />
                    <ScoreBar label="Experience Impact" value={analysis.experience_score} delay={0.15} />
                    <ScoreBar label="Projects Relevance" value={analysis.projects_score} delay={0.2} />
                    <ScoreBar label="Keywords Alignment" value={analysis.keywords_score} delay={0.25} />
                    <ScoreBar label="Formatting & Structure" value={analysis.formatting_score} delay={0.3} />
                  </div>

                  <button
                    type="button"
                    onClick={() => { setAnalysis(null); setFile(null) }}
                    className="btn btn-secondary"
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    <RefreshCw size={16} /> Upload Another Resume
                  </button>
                </div>

                {/* Right Column: Extracted Skills, Strengths, and Improvements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Extracted Skills */}
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Extracted Skills ({analysis.extracted_skills?.length || 0})
                    </h3>
                    {analysis.extracted_skills && analysis.extracted_skills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {analysis.extracted_skills.map((s) => (
                          <span
                            key={s}
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'rgba(0, 169, 255, 0.08)',
                              color: '#00A9FF',
                              border: '1px solid rgba(0, 169, 255, 0.2)',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        No specific technical skills were automatically extracted from the provided document.
                      </p>
                    )}
                  </div>

                  {/* Strengths */}
                  <div className="card" style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.2)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                      <CheckCircle2 size={18} color="#10B981" /> Key Strengths
                    </h3>
                    {analysis.strengths && analysis.strengths.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {analysis.strengths.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        No specific strengths recorded.
                      </p>
                    )}
                  </div>

                  {/* Improvements */}
                  <div className="card" style={{ background: 'rgba(245,158,11,0.03)', borderColor: 'rgba(245,158,11,0.2)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                      <AlertTriangle size={18} color="#F59E0B" /> Improvement Recommendations
                    </h3>
                    {analysis.improvements && analysis.improvements.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {analysis.improvements.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <AlertTriangle size={15} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        No improvement suggestions needed at this time.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
