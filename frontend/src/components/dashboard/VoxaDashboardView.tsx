import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX,
  PhoneOff, MoreVertical, Play, Pause, CheckCircle2,
  AlertTriangle, Target, Sparkles, X, ChevronRight,
  ArrowRight, Lightbulb, MessageSquare, Layers, Award,
} from 'lucide-react'
import { toast } from 'sonner'

export default function VoxaDashboardView() {
  // Video playback & control states
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [progressPercent, setProgressPercent] = useState(48.5) // ~23:08 of 47:09
  const [moveForward, setMoveForward] = useState<boolean | null>(true)
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null)
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return
    const rect = scrubberRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setProgressPercent(pos * 100)
  }

  // 4 AI Coaching Recommendations
  const coachingCards = [
    {
      id: 'problem-solving',
      title: 'Improve Problem Solving',
      category: 'Structure & Ideation',
      desc: 'Master structured ideation when asked to design from scratch under ambiguity.',
      accent: '#8B5CF6',
      bgClass: 'coaching-card-purple',
      icon: Lightbulb,
      lightBg: 'rgba(139, 92, 246, 0.1)',
      drillName: '5-Min Ambiguity Drill',
    },
    {
      id: 'confidence',
      title: 'Build Confidence',
      category: 'Business Alignment',
      desc: 'Connect design solutions directly to business KPIs, user retention, and conversion.',
      accent: '#10B981',
      bgClass: 'coaching-card-emerald',
      icon: Target,
      lightBg: 'rgba(16, 185, 129, 0.1)',
      drillName: 'KPI Alignment Drill',
    },
    {
      id: 'communication',
      title: 'Enhance Communication',
      category: 'Speech & Articulation',
      desc: 'Refine vocal modulation and eliminate hesitation when explaining complex flows.',
      accent: '#EC4899',
      bgClass: 'coaching-card-pink',
      icon: MessageSquare,
      lightBg: 'rgba(236, 72, 153, 0.1)',
      drillName: 'Articulation Sprint',
    },
    {
      id: 'key-concepts',
      title: 'Review Key Concepts',
      category: 'Figma & Frameworks',
      desc: 'Practice presenting Figma prototypes and rationale using the double-diamond process.',
      accent: '#F59E0B',
      bgClass: 'coaching-card-amber',
      icon: Layers,
      lightBg: 'rgba(245, 158, 11, 0.1)',
      drillName: 'Double-Diamond Walkthrough',
    },
  ]

  // AI Score breakdown metrics (Multi-Color Palette: Teal, Violet, Pink, Amber, Emerald)
  const breakdownMetrics = [
    { id: 'confidence', label: 'Confidence', value: 30, color: '#14B8A6' },
    { id: 'communication', label: 'Communication', value: 25, color: '#EC4899' },
    { id: 'technical', label: 'Technical', value: 20, color: '#8B5CF6' },
    { id: 'emotion', label: 'Emotion & Tone', value: 15, color: '#F59E0B' },
    { id: 'clarity', label: 'Clarity', value: 10, color: '#10B981' },
  ]

  // Overall Score Circular Progress Calculations
  const score = 78
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* ── TOP ROW: Interview Review (Left) + Practice Recommendations (Right) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(360px, 1fr)',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
        className="voxa-top-grid"
      >
        {/* ── 1. Video Call Recording Review Card ── */}
        <div
          className="voxa-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            backgroundColor: '#0F131D',
            minHeight: '410px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Main Candidate Video Feed Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/images/candidate.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              cursor: 'pointer',
              transition: 'transform 0.4s ease',
            }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {/* Elegant Dark Vignette for contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(15,19,29,0.7) 0%, rgba(15,19,29,0.05) 35%, rgba(15,19,29,0.15) 60%, rgba(15,19,29,0.85) 100%)',
              }}
            />

            {/* Central Play/Pause Badge */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 62,
                height: 62,
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 19, 29, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                opacity: isPlaying ? 0 : 0.95,
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
            </div>
          </div>

          {/* Top Overlays: Badges and Interviewer Inset */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Candidate & Recording Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Yelena Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(12px)',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <img
                  src="/images/yelena.jpg"
                  alt="Yelena"
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span>Yelena (Candidate)</span>
              </div>

              {/* Recording Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(15, 19, 29, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  width: 'fit-content',
                }}
              >
                <span
                  className="recording-dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    boxShadow: '0 0 8px #EF4444',
                    display: 'inline-block',
                  }}
                />
                <span>Live Session Recording</span>
              </div>
            </div>

            {/* Right: Inset Interviewer Video Feed */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 104,
                height: 78,
                borderRadius: '14px',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                position: 'relative',
                cursor: 'pointer',
              }}
              title="AI Interviewer Feed"
            >
              <img
                src="/images/interviewer.jpg"
                alt="AI Interviewer"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '2px 4px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  fontSize: '0.625rem',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                AI Interviewer
              </div>
            </motion.div>
          </div>

          {/* Left Vertical Volume Slider */}
          <div
            style={{
              position: 'absolute',
              left: '1.25rem',
              top: '42%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(15, 19, 29, 0.65)',
              backdropFilter: 'blur(12px)',
              padding: '0.65rem 0.45rem',
              borderRadius: '999px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Slider track */}
            <div
              style={{
                width: 4,
                height: 72,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const newVol = Math.round(100 - ((e.clientY - rect.top) / rect.height) * 100)
                setVolume(Math.max(0, Math.min(100, newVol)))
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: `${volume}%`,
                  backgroundColor: '#8B5CF6',
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: `${volume}%`,
                  left: '50%',
                  transform: 'translate(-50%, 50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            {/* Speaker icon */}
            <button
              onClick={() => {
                setIsMuted(!isMuted)
                toast.info(isMuted ? 'Audio unmuted' : 'Audio muted')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMuted ? '#F87171' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                padding: 0,
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          {/* Bottom Floating Controls & Timeline Bar */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              padding: '1.25rem 1.4rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Floating Call Actions Dock */}
            <div
              style={{
                alignSelf: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                backgroundColor: 'rgba(15, 19, 29, 0.75)',
                backdropFilter: 'blur(16px)',
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Camera Toggle */}
              <button
                onClick={() => {
                  setIsCameraOn(!isCameraOn)
                  toast.info(isCameraOn ? 'Camera turned off' : 'Camera turned on')
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isCameraOn ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.3)',
                  color: isCameraOn ? '#FFFFFF' : '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Camera"
              >
                {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>

              {/* Mic Toggle */}
              <button
                onClick={() => {
                  setIsMicOn(!isMicOn)
                  toast.info(isMicOn ? 'Microphone muted' : 'Microphone unmuted')
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isMicOn ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.3)',
                  color: isMicOn ? '#FFFFFF' : '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Microphone"
              >
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>

              {/* Volume / Output */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Audio"
              >
                <Volume2 size={16} />
              </button>

              {/* Hangup Recording Button */}
              <button
                onClick={() => toast.success('Interview recording completed and saved!')}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(239,68,68,0.55)',
                  transition: 'all 0.15s ease',
                }}
                title="End Recording"
              >
                <PhoneOff size={17} />
              </button>

              {/* More Options */}
              <button
                onClick={() => toast.info('Recording settings: 1080p 60fps HD with AI Audio Denoiser')}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="More"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Scrubber Timeline Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
              }}
            >
              <span style={{ minWidth: 35 }}>23:08</span>
              <div
                ref={scrubberRef}
                onClick={handleScrub}
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  borderRadius: 999,
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {/* Active progress track */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #8B5CF6, #EF4444)',
                    borderRadius: 999,
                  }}
                />
                {/* Thumb */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${progressPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  }}
                />
              </div>
              <span style={{ minWidth: 35, textAlign: 'right' }}>47:09</span>
            </div>
          </div>
        </div>

        {/* ── 2. Practice Recommendations (4 AI Coaching Cards) ── */}
        <div
          className="voxa-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--voxa-card-text)',
                    margin: 0,
                  }}
                >
                  Practice Recommendations
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Personalized AI coaching drills based on your performance
                </span>
              </div>
              <Sparkles size={18} style={{ color: '#8B5CF6' }} />
            </div>

            {/* 2x2 Grid of 4 Distinct Professional AI Coaching Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
              }}
            >
              {coachingCards.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className={`coaching-card ${item.bgClass}`}
                    onClick={() => setSelectedPractice(item.id)}
                    title={`${item.title} - Click to start practice`}
                    style={{
                      borderLeft: `3px solid ${item.accent}`,
                      minHeight: '140px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '10px',
                            backgroundColor: item.lightBg,
                            color: item.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '999px',
                            backgroundColor: item.lightBg,
                            color: item.accent,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--voxa-card-text)',
                          marginBottom: '0.35rem',
                          lineHeight: 1.25,
                        }}
                      >
                        {item.title}
                      </h4>

                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: item.accent,
                      }}
                    >
                      <span>Start Drill</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ⚡ Real-time speech & framework feedback enabled
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: AI Score (Left) + Score Breakdown (Center) + AI Insights (Right) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1fr) minmax(320px, 1.3fr) minmax(300px, 1.2fr)',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
        className="voxa-bottom-grid"
      >
        {/* ── 3. AI Interview Score Card ── */}
        <div
          className="voxa-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--voxa-card-text)', margin: 0 }}>
              AI Interview Score
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              Top 15%
            </span>
          </div>

          {/* Big Multi-Color Circular Progress Ring (78%) */}
          <div style={{ position: 'relative', width: 146, height: 146, margin: '0.75rem 0' }}>
            <svg width="146" height="146" viewBox="0 0 146 146" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Background ring */}
              <circle
                cx="73"
                cy="73"
                r={radius}
                fill="none"
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="11"
              />

              {/* Multi-color gradient stroke ring */}
              <circle
                cx="73"
                cy="73"
                r={radius}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>

            {/* Score in center */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--voxa-card-text)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                78%
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                OVERALL
              </span>
            </div>
          </div>

          {/* Subtext */}
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              margin: '0 0 1rem 0',
              maxWidth: 220,
            }}
          >
            Good — mostly ready, a few targeted areas to polish
          </p>

          {/* Move Forward? Selection Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--voxa-card-text)',
              padding: '0.4rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid var(--voxa-card-border)',
            }}
          >
            <span>Move Forward?</span>
            <div
              style={{
                display: 'flex',
                gap: '0.25rem',
                backgroundColor: 'var(--voxa-card-bg)',
                padding: '2px',
                borderRadius: '999px',
                border: '1px solid var(--voxa-card-border)',
              }}
            >
              <button
                onClick={() => {
                  setMoveForward(true)
                  toast.success('Marked: Move forward with candidate')
                }}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.25rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: moveForward === true ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                  color: moveForward === true ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: moveForward === true ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setMoveForward(false)
                  toast.info('Marked: Do not move forward')
                }}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.25rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: moveForward === false ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'transparent',
                  color: moveForward === false ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: moveForward === false ? '0 2px 8px rgba(239, 68, 68, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. AI Score Breakdown Card (Multi-Color Donut Analytics) ── */}
        <div
          className="voxa-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--voxa-card-text)', margin: 0 }}>
                AI Score Breakdown
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 600 }}>
                5 Competencies
              </span>
            </div>

            {/* Donut Chart Visual SVG */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.5rem 0',
              }}
            >
              <svg width="150" height="150" viewBox="0 0 150 150">
                <g transform="translate(75, 75)">
                  {/* Confidence 30% (-180 to -72 deg) */}
                  <path
                    d="M -48 0 A 48 48 0 0 1 -14.8 -45.6"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth={hoveredMetric === 'confidence' ? 14 : 10}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredMetric('confidence')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  />

                  {/* Technical 20% (-72 to 0 deg) */}
                  <path
                    d="M -6.7 -47.5 A 48 48 0 0 1 43.2 -20.9"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth={hoveredMetric === 'technical' ? 14 : 10}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredMetric('technical')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  />

                  {/* Clarity 10% (0 to 36 deg) */}
                  <path
                    d="M 46.5 -11.5 A 48 48 0 0 1 47.5 6.7"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={hoveredMetric === 'clarity' ? 14 : 10}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredMetric('clarity')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  />

                  {/* Emotion 15% (36 to 90 deg) */}
                  <path
                    d="M 45.6 14.8 A 48 48 0 0 1 19.2 44"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={hoveredMetric === 'emotion' ? 14 : 10}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredMetric('emotion')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  />

                  {/* Communication 25% (90 to 180 deg) */}
                  <path
                    d="M 11.5 46.5 A 48 48 0 0 1 -43.2 20.9"
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth={hoveredMetric === 'communication' ? 14 : 10}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredMetric('communication')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  />
                </g>
              </svg>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Award size={18} style={{ color: '#8B5CF6' }} />
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                  ANALYTICS
                </span>
              </div>
            </div>

            {/* Interactive Metrics Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {breakdownMetrics.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '6px',
                    backgroundColor: hoveredMetric === m.id ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={() => setHoveredMetric(m.id)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 100 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: m.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--voxa-card-text)', fontWeight: 600 }}>{m.label}</span>
                  </div>

                  <div style={{ flex: 1, height: 5, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${m.value * 2.5}%`,
                        height: '100%',
                        backgroundColor: m.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>

                  <span style={{ fontWeight: 700, color: m.color, minWidth: 32, textAlign: 'right' }}>
                    {m.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. AI Insights Card ── */}
        <div
          className="voxa-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--voxa-card-text)', margin: 0 }}>
                AI Diagnostics & Insights
              </h3>
            </div>

            {/* List of 3 Visually Distinct Insight Types */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* 1. Strength Insight (Emerald) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669' }}>
                    Strength Insight
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                    You maintained strong confidence and clear architectural rationale during technical questions.
                  </div>
                </div>
              </div>

              {/* 2. Improvement (Amber) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
                  <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#D97706' }}>
                    Area to Improve
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                    Confidence dropped slightly during behavioral tradeoff questions. Structure answers more predictably.
                  </div>
                </div>
              </div>

              {/* 3. Actionable Recommendation (Purple/Magenta) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.06)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
                  <Target size={16} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7C3AED' }}>
                    Actionable Recommendation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                    Practice answering behavioral questions using the STAR framework for structured clarity.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Drill Button */}
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => toast.success('STAR method interactive practice drill opened!')}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08))',
                color: '#8B5CF6',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08))'
                e.currentTarget.style.color = '#8B5CF6'
              }}
            >
              <span>Start STAR Method Drill</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Practice Module Detail Modal ── */}
      <AnimatePresence>
        {selectedPractice && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
            onClick={() => setSelectedPractice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="voxa-card"
              style={{ maxWidth: 480, width: '100%', padding: '1.75rem', borderRadius: '24px' }}
            >
              {(() => {
                const item = coachingCards.find((p) => p.id === selectedPractice)
                if (!item) return null
                const Icon = item.icon
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            backgroundColor: item.lightBg,
                            color: item.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: item.accent, fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.category}
                          </span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--voxa-card-text)', margin: '2px 0 0 0' }}>
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPractice(null)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {item.desc}
                    </p>

                    <div
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(139, 92, 246, 0.04)',
                        border: '1px solid var(--voxa-card-border)',
                        marginBottom: '1.5rem',
                        fontSize: '0.8125rem',
                        color: 'var(--voxa-card-text)',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Recommended Module:</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{item.drillName} • 5 mins duration • Real-time AI scoring</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedPractice(null)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid var(--voxa-card-border)',
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          toast.success(`Launched interactive drill: ${item.title}`)
                          setSelectedPractice(null)
                        }}
                        style={{
                          padding: '0.5rem 1.15rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                          color: '#FFFFFF',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 2px 10px rgba(124, 58, 237, 0.35)',
                        }}
                      >
                        Start 5-Min Drill
                      </button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1080px) {
          .voxa-top-grid {
            grid-template-columns: 1fr !important;
          }
          .voxa-bottom-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 720px) {
          .voxa-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
