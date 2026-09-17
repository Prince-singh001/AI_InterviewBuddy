import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Check, User, Briefcase, GraduationCap, Code } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { sleep } from '@/lib/utils'
import { toast } from 'sonner'

const roles = [
  'Software Engineer', 'Python Developer', 'Backend Developer',
  'Full Stack Developer', 'AIML Engineer', 'Machine Learning Engineer',
  'Data Scientist', 'Data Analyst', 'GenAI Engineer', 'Frontend Developer',
]

const experiences = ['Student / Fresher', '< 1 year', '1–2 years', '2–4 years', '4+ years']

export default function ProfileSetup() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    college: '', company: '', targetRole: '', experience: '',
    skills: [] as string[], github: '', linkedin: '',
  })
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuthStore()
  const navigate = useNavigate()

  const skillOptions = ['Python', 'Java', 'C++', 'JavaScript', 'Machine Learning', 'Deep Learning', 'SQL', 'React', 'FastAPI', 'Docker', 'AWS', 'Git', 'TensorFlow', 'PyTorch', 'NLP', 'GenAI']

  const toggleSkill = (s: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }))
  }

  const handleComplete = async () => {
    setLoading(true)
    await sleep(1200)
    updateUser({ ...form, profileComplete: true })
    toast.success('Profile complete! Welcome to Interviewer Buddy AI 🎉')
    navigate('/dashboard')
    setLoading(false)
  }

  const steps = [
    { n: 1, label: 'Basic Info', icon: User },
    { n: 2, label: 'Career', icon: Briefcase },
    { n: 3, label: 'Skills', icon: Code },
    { n: 4, label: 'Links', icon: GraduationCap },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 560 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>Complete Your Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Help us personalize your interview experience</p>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 2, background: 'var(--border)', zIndex: 0 }} />
          {steps.map((s) => {
            const Icon = s.icon
            const done = step > s.n, active = step === s.n
            return (
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'var(--green)' : active ? 'var(--blue)' : 'var(--bg-card)',
                  border: `2px solid ${done ? 'var(--green)' : active ? 'var(--blue)' : 'var(--border)'}`,
                  transition: 'all 0.3s',
                }}>
                  {done ? <Check size={14} color="white" /> : <Icon size={14} color={active ? 'white' : 'var(--text-muted)'} />}
                </div>
                <span style={{ fontSize: '0.75rem', color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="card" style={{ padding: '2rem' }}>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Basic Information</h2>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>College / University</label>
                  <input className="input" placeholder="IIT Bombay, NIT, etc." value={form.college} onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Company (if working)</label>
                  <input className="input" placeholder="Current employer (optional)" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Career Goals</h2>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Target Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {roles.map((r) => (
                      <button key={r} onClick={() => setForm((f) => ({ ...f, targetRole: r }))}
                        className={form.targetRole === r ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                        style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}>
                        {form.targetRole === r && <Check size={12} />} {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Experience Level</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {experiences.map((e) => (
                      <button key={e} onClick={() => setForm((f) => ({ ...f, experience: e }))}
                        className={form.experience === e ? 'btn btn-purple btn-sm' : 'btn btn-ghost btn-sm'}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Skills</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Select all that apply — this helps personalize your interviews</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {skillOptions.map((s) => {
                    const selected = form.skills.includes(s)
                    return (
                      <button key={s} onClick={() => toggleSkill(s)}
                        style={{
                          padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', fontWeight: 500,
                          cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                          background: selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                          borderColor: selected ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                          color: selected ? 'var(--blue-light)' : 'var(--text-secondary)',
                        }}>
                        {selected && '✓ '}{s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Links</h2>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>GitHub Profile</label>
                  <input className="input" placeholder="https://github.com/yourname" value={form.github} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>LinkedIn Profile</label>
                  <input className="input" placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
                </div>
                <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--green-light)', lineHeight: 1.6 }}>
                    🎉 You're almost ready! Click Complete to start your AI-powered interview journey.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setStep((s) => s - 1)} disabled={step === 1} className="btn btn-ghost">
              ← Back
            </button>
            {step < 4 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn btn-primary">
                Continue →
              </button>
            ) : (
              <button onClick={handleComplete} className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '✓ Complete Profile'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          You can update this anytime from Settings
        </p>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
