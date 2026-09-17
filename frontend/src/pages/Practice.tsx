import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle, ChevronDown, ChevronUp, Loader2, Volume2, RotateCcw, Eye } from 'lucide-react'
import { practiceApi } from '@/services/apiService'
import { toast } from 'sonner'

const PRACTICE_CATEGORIES = [
  { id: 'dsa', name: 'DSA', icon: '🧮', color: 'blue' },
  { id: 'python', name: 'Python', icon: '🐍', color: 'blue' },
  { id: 'ml', name: 'Machine Learning', icon: '🤖', color: 'purple' },
  { id: 'dl', name: 'Deep Learning', icon: '🧠', color: 'purple' },
  { id: 'genai', name: 'Generative AI', icon: '✨', color: 'purple' },
  { id: 'nlp', name: 'NLP', icon: '💬', color: 'purple' },
  { id: 'cv', name: 'Computer Vision', icon: '👁️', color: 'blue' },
  { id: 'sql', name: 'SQL', icon: '🗄️', color: 'green' },
  { id: 'system-design', name: 'System Design', icon: '🏗️', color: 'orange' },
  { id: 'behavioral', name: 'Behavioral', icon: '🎯', color: 'green' },
  { id: 'hr', name: 'HR Questions', icon: '👥', color: 'green' },
  { id: 'rag', name: 'RAG & LangChain', icon: '🔗', color: 'purple' },
  { id: 'agentic', name: 'Agentic AI', icon: '⚡', color: 'purple' },
  { id: 'communication', name: 'Communication', icon: '🗣️', color: 'green' },
]

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const COLOR_MAP: Record<string, string> = { blue: 'var(--blue)', purple: 'var(--purple)', green: 'var(--green)', orange: 'var(--orange)' }

interface EvalResult {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  suggested_answer: string
}

interface PracticeQuestion {
  id: string
  question: string
  category: string
  difficulty: string
}

export default function Practice() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [answer, setAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null)
  const [showModel, setShowModel] = useState(false)
  const [timer, setTimer] = useState(120)
  const [timerStarted, setTimerStarted] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null)

  const handleEvaluate = async () => {
    if (!answer.trim()) { toast.error('Please write your answer first'); return }
    if (!currentQuestion) { toast.error('Please load a question first'); return }
    setEvaluating(true)
    try {
      const result = await practiceApi.evaluate(currentQuestion.question, answer)
      setEvalResult(result)
    } catch {
      toast.error('Failed to evaluate answer. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  const handleLoadQuestion = async () => {
    const cat = selectedCategory || 'General'
    setLoadingQuestion(true)
    setCurrentQuestion(null)
    setAnswer('')
    setEvalResult(null)
    setShowModel(false)
    try {
      const q = await practiceApi.getQuestion(cat, difficulty)
      setCurrentQuestion(q)
    } catch {
      toast.error('Failed to load question. Please try again.')
    } finally {
      setLoadingQuestion(false)
    }
  }

  const handleReset = () => {
    setAnswer('')
    setEvalResult(null)
    setShowModel(false)
  }

  const startTimer = () => {
    if (timerStarted) return
    setTimerStarted(true)
    setTimer(120)
    const t = setInterval(() => {
      setTimer((v) => {
        if (v <= 1) { clearInterval(t); toast.info('Time up!'); return 0 }
        return v - 1
      })
    }, 1000)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Practice Center</h1>
        <p style={{ color: 'var(--text-secondary)' }}>AI-powered practice questions with instant evaluation and feedback</p>
      </motion.div>

      {/* Category Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setShowCategories((v) => !v)}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>
            📚 Practice Categories
            {selectedCategory && <span className="badge badge-blue" style={{ marginLeft: '0.75rem' }}>{selectedCategory}</span>}
          </h2>
          {showCategories ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
        </div>

        <AnimatePresence>
          {showCategories && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {PRACTICE_CATEGORIES.map((cat) => {
                  const color = COLOR_MAP[cat.color] || 'var(--blue)'
                  const isSelected = selectedCategory === cat.name
                  return (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setShowCategories(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem', borderRadius: 'var(--radius-md)',
                        border: `2px solid ${isSelected ? color : 'var(--border)'}`,
                        background: isSelected ? `${color}12` : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      }}>
                      <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? color : 'var(--text-primary)' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>AI Practice</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Difficulty + Mode row */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: showCategories ? '1rem' : 0, paddingTop: showCategories ? '1rem' : 0, borderTop: showCategories ? '1px solid var(--border)' : 'none' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={difficulty === d ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
                {d}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button onClick={() => setMode('text')} className={mode === 'text' ? 'btn btn-purple btn-sm' : 'btn btn-ghost btn-sm'}>⌨️ Text</button>
            <button onClick={() => setMode('voice')} className={mode === 'voice' ? 'btn btn-purple btn-sm' : 'btn btn-ghost btn-sm'}>🎤 Voice</button>
            <button onClick={handleLoadQuestion} disabled={loadingQuestion} className="btn btn-primary btn-sm" style={{ gap: '0.375rem' }}>
              {loadingQuestion ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : '→'} Get Question
            </button>
          </div>
        </div>
      </motion.div>

      {/* Question + Answer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Question card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-purple">{currentQuestion?.category || selectedCategory || 'General'}</span>
                <span className="badge badge-orange">{currentQuestion?.difficulty || difficulty}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: timer < 30 ? 'var(--red)' : 'var(--text-secondary)' }}>
                  <Timer size={15} /> {formatTime(timer)}
                </div>
                <button onClick={startTimer} className="btn btn-ghost btn-sm" disabled={timerStarted}>
                  {timerStarted ? 'Running' : 'Start Timer'}
                </button>
              </div>
            </div>
            {loadingQuestion ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Loading question...</span>
              </div>
            ) : currentQuestion ? (
              <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.65 }}>
                {currentQuestion.question}
              </p>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No question loaded yet</p>
                <p style={{ fontSize: '0.875rem' }}>Select a category and click "Get Question" to start</p>
              </div>
            )}
          </motion.div>

          {/* Answer area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Your Answer</h3>
              {mode === 'voice' && (
                <button className="btn btn-purple btn-sm">
                  <Volume2 size={14} /> Record Answer
                </button>
              )}
            </div>
            <textarea
              className="input"
              placeholder="Write your answer here. Try to be structured and cover all key aspects..."
              style={{ minHeight: 180, resize: 'vertical' }}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!evalResult || !currentQuestion}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.875rem', justifyContent: 'flex-end' }}>
              <button onClick={handleReset} className="btn btn-ghost btn-sm">
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={handleEvaluate} disabled={evaluating || !!evalResult || !answer.trim() || !currentQuestion} className="btn btn-primary">
                {evaluating ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating...</> : '✓ Submit for AI Evaluation'}
              </button>
            </div>
          </motion.div>

          {/* Evaluation result */}
          <AnimatePresence>
            {evalResult && (
              <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0 }} className="card" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <CheckCircle size={20} color="var(--green)" />
                  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI Evaluation</h3>
                  <span style={{ marginLeft: 'auto', fontSize: '1.5rem', fontWeight: 800, color: evalResult.score >= 80 ? 'var(--green)' : 'var(--orange)' }}>
                    {evalResult.score}/100
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  {evalResult.feedback}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div>
                    {evalResult.strengths.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--green-light)', marginBottom: '0.375rem' }}>
                        <CheckCircle size={13} style={{ flexShrink: 0 }} />{s}
                      </div>
                    ))}
                  </div>
                  <div>
                    {evalResult.improvements.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--orange-light)', marginBottom: '0.375rem' }}>
                        ⚠️ {s}
                      </div>
                    ))}
                  </div>
                </div>
                {evalResult.suggested_answer && (
                  <button onClick={() => setShowModel((v) => !v)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    <Eye size={14} /> {showModel ? 'Hide' : 'Show'} Model Answer
                  </button>
                )}
                <AnimatePresence>
                  {showModel && evalResult.suggested_answer && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>📖 Model Answer</div>
                        {evalResult.suggested_answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>📊 Tips for This Question</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                'Start with the core definition',
                'Compare and contrast each variant',
                'Provide real-world use cases',
                "Mention when you've used it in practice",
                'Discuss trade-offs and limitations',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--purple-light)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {tip}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <button onClick={handleLoadQuestion} disabled={loadingQuestion} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', gap: '0.5rem' }}>
              {loadingQuestion ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '→'} Next Question
            </button>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
