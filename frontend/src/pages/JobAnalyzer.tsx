import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, CheckCircle2, AlertTriangle, Sparkles, Loader2, Search, XCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { jobsApi, JobAnalysisResponse } from '@/services/apiService'
import { toast } from 'sonner'

export default function JobAnalyzer() {
  const [jd, setJd] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<JobAnalysisResponse | null>(null)
  const navigate = useNavigate()

  const handleAnalyze = async () => {
    if (jd.trim().length < 30) {
      toast.error('Please enter a more detailed job description (minimum 30 characters)')
      return
    }
    setLoading(true)
    try {
      const res = await jobsApi.analyze({
        job_description: jd.trim(),
        title: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
      })
      setAnalysis(res)
      toast.success('Job analysis complete!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze job description'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const matchedSkills = analysis ? analysis.skills.filter((s) => s.status === 'matched') : []
  const missingSkills = analysis ? analysis.skills.filter((s) => s.status === 'missing') : []
  const partialSkills = analysis ? analysis.skills.filter((s) => s.status === 'partial') : []
  const matchScore = analysis ? Math.round(analysis.match_score) : 0
  const scoreColor = matchScore >= 75 ? 'var(--green)' : matchScore >= 50 ? 'var(--blue)' : 'var(--orange)'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Job Description Analyzer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Analyze any job description against your profile to evaluate match score and required interview skills.
        </p>
      </motion.div>

      {!analysis ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Input Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Job Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="input"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Company (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="input"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Job Description Text *
              </label>
              <textarea
                className="input"
                placeholder="Paste the full job description here (requirements, responsibilities, tech stack)..."
                style={{ minHeight: 240, resize: 'vertical', lineHeight: 1.6, width: '100%', fontSize: '0.875rem' }}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {jd.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || jd.trim().length < 30}
              className="btn btn-purple"
              style={{ width: '100%', padding: '0.875rem', opacity: jd.trim().length < 30 ? 0.5 : 1 }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Job Description...</>
              ) : (
                <><Search size={16} /> Analyze with AI</>
              )}
            </button>
          </motion.div>

          {/* Right side: Clean Empty State & Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                <Briefcase size={24} color="var(--purple-light)" />
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No job analysis yet
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
                Analyze a job description to see matching insights, skill gaps, and custom interview prep recommendations.
              </p>
            </div>

            {/* Analysis Breakdown Information */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Analysis Insights
              </h3>
              {[
                { icon: '🎯', label: 'Match Rating', desc: 'Real alignment with your stored skills' },
                { icon: '✅', label: 'Skill Match Matrix', desc: 'Breakdown of matched vs. missing requirements' },
                { icon: '📋', label: 'Expected Topics', desc: 'Key questions interviewers will likely focus on' },
                { icon: '💡', label: 'Prep Strategy', desc: 'Targeted study plan tailored to the role' },
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
          {/* Left Column: Score Card & Quick Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Role Match Score
              </div>
              <div style={{
                width: 108,
                height: 108,
                borderRadius: '50%',
                margin: '0 auto 1rem',
                background: `conic-gradient(${scoreColor} ${matchScore}%, var(--bg-elevated) 0%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.625rem', fontWeight: 800, color: scoreColor }}>{matchScore}%</span>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.0625rem' }}>{analysis.title}</div>
              {analysis.company && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{analysis.company}</div>
              )}
            </div>

            {/* Counts & Experience summary */}
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Matched Skills</span>
                  <span className="badge badge-green">{matchedSkills.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Partial Match</span>
                  <span className="badge badge-orange">{partialSkills.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Missing Skills</span>
                  <span className="badge badge-red">{missingSkills.length}</span>
                </div>
                {analysis.required_exp && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Required Exp</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{analysis.required_exp}</span>
                  </div>
                )}
                {analysis.seniority && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Seniority</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{analysis.seniority}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/interview/setup')}
              className="btn btn-purple"
              style={{ width: '100%', minHeight: '44px' }}
            >
              <Sparkles size={16} /> Practice Role Interview <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => { setAnalysis(null); setJd('') }}
              className="btn btn-secondary"
              style={{ width: '100%', minHeight: '44px' }}
            >
              <RefreshCw size={16} /> Analyze Another JD
            </button>
          </div>

          {/* Right Column: Skills Matrix, Topics, and Strategy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Skills breakdown */}
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                Skills Analysis
              </h2>
              {analysis.skills && analysis.skills.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {analysis.skills.map((skill, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {skill.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {skill.status === 'matched' && (
                          <>
                            <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>Matched</span>
                            <CheckCircle2 size={16} color="var(--green)" />
                          </>
                        )}
                        {skill.status === 'partial' && (
                          <>
                            <span style={{ fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 600 }}>Partial</span>
                            <AlertTriangle size={16} color="var(--orange)" />
                          </>
                        )}
                        {skill.status === 'missing' && (
                          <>
                            <span style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 600 }}>Missing</span>
                            <XCircle size={16} color="var(--red)" />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  No specific skill breakdown found for this description.
                </p>
              )}
            </div>

            {/* Expected Interview Topics */}
            {analysis.interview_topics && analysis.interview_topics.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Likely Interview Topics
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {analysis.interview_topics.map((t) => (
                    <span
                      key={t}
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
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Strategy */}
            {analysis.preparation_strategy && (
              <div className="card" style={{ background: 'rgba(139, 92, 246, 0.03)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9375rem', color: 'var(--purple-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={16} /> Recommended Preparation Strategy
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {analysis.preparation_strategy}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
