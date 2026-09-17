import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Loader2, X, RefreshCw, Layers } from 'lucide-react'
import { resumeApi, ResumeAnalysisResponse, ResumeItem } from '@/services/apiService'
import { toast } from 'sonner'

// ── Progress bar ─────────────────────────────────────────────
function ScoreBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const [animated, setAnimated] = useState(false)
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)))
  const color = normalizedValue >= 80 ? 'var(--green)' : normalizedValue >= 60 ? 'var(--blue)' : 'var(--orange)'

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
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysisResponse | null>(null)
  const [previousResumes, setPreviousResumes] = useState<ResumeItem[]>([])
  const [loadingList, setLoadingList] = useState(false)

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
      toast.success('Analysis loaded')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analysis'
      toast.error(msg)
    } finally {
      setLoading(false)
      setStatusMessage('')
    }
  }

  const overallScore = analysis ? Math.round(analysis.overall_score) : 0
  const scoreColor = overallScore >= 80 ? 'var(--green)' : overallScore >= 60 ? 'var(--blue)' : 'var(--orange)'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Resume Intelligence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Upload your resume for real AI-powered ATS scoring, skills extraction, and personalized feedback.
        </p>
      </motion.div>

      {/* Main View: If not analyzed, show upload form + empty state or previous uploads */}
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
                border: `2px dashed ${isDragging ? 'var(--purple)' : file ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: isDragging ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-elevated)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => !file && document.getElementById('resume-file')?.click()}
            >
              <input id="resume-file" type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleFileChange} />

              {file ? (
                <div>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <FileText size={26} color="var(--green)" />
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
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <Upload size={26} color="var(--purple-light)" />
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
                    onClick={(e) => { e.stopPropagation(); document.getElementById('resume-file')?.click() }}
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Loader2 size={20} color="var(--purple-light)" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {statusMessage || 'Processing resume...'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file}
                className="btn btn-purple"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.875rem', opacity: file ? 1 : 0.5 }}
              >
                <Sparkles size={18} /> Analyze Resume with AI
              </button>
            )}
          </motion.div>

          {/* Right side: Professional Empty State or Previously Uploaded Resumes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {previousResumes.length > 0 ? (
              <div className="card">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--purple-light)" /> Previous Resumes
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
                        <FileText size={18} color="var(--purple-light)" style={{ flexShrink: 0 }} />
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
                      <span style={{ fontSize: '0.8125rem', color: 'var(--purple-light)', fontWeight: 600 }}>
                        View Analysis →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty state box */
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Sparkles size={24} color="var(--purple-light)" />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  No resume analysis yet
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
                  Upload or analyze a resume to see your personalized insights, ATS compatibility, and tailored strengths.
                </p>
              </div>
            )}

            {/* What AI Analyzes guide */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Analysis Criteria
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
        /* Real Analysis Results */
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
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'var(--purple-light)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
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
              <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', color: 'var(--green-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                <CheckCircle2 size={18} color="var(--green)" /> Key Strengths
              </h3>
              {analysis.strengths && analysis.strengths.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {analysis.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
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
              <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', color: 'var(--orange-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                <AlertTriangle size={18} color="var(--orange)" /> Improvement Recommendations
              </h3>
              {analysis.improvements && analysis.improvements.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {analysis.improvements.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <AlertTriangle size={15} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
