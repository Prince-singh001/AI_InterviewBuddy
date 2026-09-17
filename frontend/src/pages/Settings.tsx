import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { User, Lock, Settings as SettingsIcon, Bell, Shield, Mic, Eye, Trash2, Save } from 'lucide-react'

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'interview', label: 'Interview Prefs', icon: SettingsIcon },
  { id: 'ai', label: 'AI Preferences', icon: Mic },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account')
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const [accountForm, setAccountForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [prefs, setPrefs] = useState({ difficulty: 'intermediate', duration: '30', type: 'mixed' })
  const [aiPrefs, setAiPrefs] = useState({ personality: 'Professional', voice: 'en-US-Neural', speed: 'Normal' })
  const [notifs, setNotifs] = useState({ email: true, practice: true, weekly: true })
  const [privacy, setPrivacy] = useState({ recording: true, analytics: true })

  const handleSave = () => {
    updateUser({ name: accountForm.name, email: accountForm.email })
    toast.success('Settings saved successfully!')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      logout()
      navigate('/')
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account, preferences, and AI configuration</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
        {/* Tab list */}
        <div className="card" style={{ padding: '0.75rem', alignSelf: 'start' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                style={{ marginBottom: '0.25rem' }}>
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>Profile Information</h2>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.25rem' }}>
                    {getInitials(user?.name || 'U')}
                  </div>
                  <div>
                    <button className="btn btn-ghost btn-sm"><Eye size={14} /> Change Avatar</button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                    <input className="input" value={accountForm.name} onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Email</label>
                    <input className="input" type="email" value={accountForm.email} onChange={(e) => setAccountForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>College / Company</label>
                    <input className="input" defaultValue={user?.college || ''} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Target Role</label>
                    <input className="input" defaultValue={user?.targetRole || ''} />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} /> Change Password
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                    <input className="input" type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                    <input className="input" type="password" placeholder="Min 8 characters" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={handleDeleteAccount} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Trash2 size={14} /> Delete Account
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>Interview Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Default Difficulty', key: 'difficulty', options: [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced'], ['expert', 'Expert']] },
                  { label: 'Default Duration', key: 'duration', options: [['10', '10 minutes'], ['20', '20 minutes'], ['30', '30 minutes'], ['45', '45 minutes']] },
                  { label: 'Default Interview Type', key: 'type', options: [['technical', 'Technical'], ['behavioral', 'Behavioral'], ['mixed', 'Mixed'], ['ml', 'Machine Learning']] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.625rem' }}>{label}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {options.map(([val, lbl]) => (
                        <button key={val} onClick={() => setPrefs((p) => ({ ...p, [key]: val }))}
                          className={(prefs as Record<string, string>)[key] === val ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => toast.success('Preferences saved!')} className="btn btn-primary"><Save size={16} /> Save Preferences</button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>AI Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.625rem' }}>Interviewer Personality</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Friendly', 'Professional', 'Strict', 'Technical Expert', 'FAANG Style'].map((p) => (
                      <button key={p} onClick={() => setAiPrefs((a) => ({ ...a, personality: p }))}
                        className={aiPrefs.personality === p ? 'btn btn-purple btn-sm' : 'btn btn-ghost btn-sm'}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.625rem' }}>AI Voice</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['en-US-Neural', 'en-GB-Neural', 'en-IN-Neural'].map((v) => (
                      <button key={v} onClick={() => setAiPrefs((a) => ({ ...a, voice: v }))}
                        className={aiPrefs.voice === v ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.625rem' }}>Speaking Speed</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Slow', 'Normal', 'Fast'].map((s) => (
                      <button key={s} onClick={() => setAiPrefs((a) => ({ ...a, speed: s }))}
                        className={aiPrefs.speed === s ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>{s}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '0.875rem', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--orange-light)' }}>
                    🔑 Connect your OpenAI API key in <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>.env</code> to enable real AI voice and evaluation.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => toast.success('AI preferences saved!')} className="btn btn-primary"><Save size={16} /> Save</button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>Privacy Settings</h2>
              {[
                { label: 'Allow Interview Recording', desc: 'Store audio/video for review and analysis', key: 'recording' },
                { label: 'Share Analytics Data', desc: 'Help improve the AI with anonymized usage data', key: 'analytics' },
              ].map(({ label, desc, key }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{desc}</div>
                  </div>
                  <button
                    onClick={() => setPrivacy((p) => ({ ...p, [key]: !p[key as keyof typeof privacy] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: privacy[key as keyof typeof privacy] ? 'var(--blue)' : 'var(--bg-muted)',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: privacy[key as keyof typeof privacy] ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: '1.5rem' }}>
                <button className="btn btn-danger btn-sm">Request Data Deletion</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>Notification Preferences</h2>
              {[
                { label: 'Email Notifications', desc: 'Receive summary emails after interviews', key: 'email' },
                { label: 'Practice Reminders', desc: 'Daily reminder to maintain your streak', key: 'practice' },
                { label: 'Weekly Progress Report', desc: 'Get a weekly summary of your performance', key: 'weekly' },
              ].map(({ label, desc, key }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: notifs[key as keyof typeof notifs] ? 'var(--green)' : 'var(--bg-muted)',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: notifs[key as keyof typeof notifs] ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => toast.success('Notification preferences saved!')} className="btn btn-primary"><Save size={16} /> Save</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
