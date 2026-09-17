import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Pause, Video, VideoOff, Mic, MicOff,
  Volume2, VolumeX, MoreVertical, Sparkles, Zap,
  Maximize2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export default function InterviewMediaCard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Video & audio playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [currentTimeSec, setCurrentTimeSec] = useState(0) // 0 to 1800 (30 mins)
  const totalDurationSec = 1800 // 30:00

  const scrubberRef = useRef<HTMLDivElement>(null)

  // Subtle playback progress ticker when playing
  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = Math.floor(secs % 60)
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return
    const rect = scrubberRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setCurrentTimeSec(Math.floor(pos * totalDurationSec))
  }

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev
      if (next) {
        toast.info('Simulated session playback active')
      }
      return next
    })
  }

  const candidateName = user?.name || 'Candidate'
  const progressPercent = (currentTimeSec / totalDurationSec) * 100

  return (
    <div
      className="voxa-card media-preview-container"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        backgroundColor: '#0A0E17',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 48px -8px rgba(0, 0, 0, 0.5)',
        width: '100%',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* ── Background Media Canvas with Ken Burns Movement ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <img
          src="/images/candidate.jpg"
          alt="Candidate Live Stream"
          className="ken-burns-anim"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.85) contrast(1.05)',
            transformOrigin: 'center center',
          }}
        />
        {/* Soft Vignette and Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at center, transparent 35%, rgba(10, 14, 23, 0.6) 80%, rgba(10, 14, 23, 0.95) 100%), linear-gradient(to top, rgba(10,14,23,0.92) 0%, rgba(10,14,23,0.1) 40%, rgba(10,14,23,0.7) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── TOP OVERLAYS: Recording Badge (Left) & AI Interviewer Preview (Right) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        {/* Left: Recording Indicator & Candidate Name Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <span
              className="recording-dot"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                display: 'inline-block',
              }}
            />
            <span>Live Session Recording</span>
          </div>

          <div
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Candidate: <strong style={{ color: '#A78BFA' }}>{candidateName}</strong>
          </div>
        </div>

        {/* Right: AI Interviewer Video Preview PiP */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'relative',
            width: '148px',
            height: '100px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            backgroundColor: '#0F172A',
            flexShrink: 0,
          }}
        >
          <img
            src="/images/interviewer.jpg"
            alt="AI Interviewer"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%)',
            }}
          />
          {/* Label */}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={11} color="#A78BFA" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#FFFFFF' }}>
                AI Interviewer
              </span>
            </div>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── CENTER: Play / Pause Control Button ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem 0',
        }}
      >
        <button
          onClick={togglePlay}
          className="media-play-btn"
          aria-label={isPlaying ? 'Pause session preview' : 'Play session preview'}
          title={isPlaying ? 'Pause preview' : 'Play preview'}
        >
          {isPlaying ? (
            <Pause size={28} fill="white" color="white" />
          ) : (
            <Play size={28} fill="white" color="white" style={{ marginLeft: 3 }} />
          )}
        </button>
      </div>

      {/* ── BOTTOM CONTROLS & TIMELINE PROGRESS BAR ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(to top, rgba(10, 14, 23, 0.95), rgba(10, 14, 23, 0.75) 70%, transparent)',
        }}
      >
        {/* Controls Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Audio & Video toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Camera */}
            <button
              onClick={() => {
                setIsCameraOn((v) => !v)
                toast.success(isCameraOn ? 'Camera disabled' : 'Camera enabled')
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isCameraOn ? 'rgba(255,255,255,0.12)' : 'rgba(239, 68, 68, 0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: isCameraOn ? '#FFFFFF' : '#F87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Camera toggle"
            >
              {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>

            {/* Mic */}
            <button
              onClick={() => {
                setIsMicOn((v) => !v)
                toast.success(isMicOn ? 'Microphone muted' : 'Microphone active')
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isMicOn ? 'rgba(255,255,255,0.12)' : 'rgba(239, 68, 68, 0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: isMicOn ? '#FFFFFF' : '#F87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Microphone toggle"
            >
              {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>

            {/* Speaker / Volume */}
            <button
              onClick={() => {
                setIsMuted((v) => !v)
                toast.info(isMuted ? 'Audio unmuted' : 'Audio muted')
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isMuted ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: isMuted ? '#F87171' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Speaker toggle"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value))
                setIsMuted(false)
              }}
              style={{
                width: 72,
                accentColor: '#8B5CF6',
                cursor: 'pointer',
              }}
              title="Volume level"
            />
          </div>

          {/* Right Action: Launch Live Session */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => navigate('/interview/setup')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1.15rem',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={14} />
              <span>Start Live Interview</span>
            </button>

            <button
              onClick={() => toast.info('Full-screen preview toggled')}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Full screen"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* Scrubber Timeline Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#94A3B8',
              fontFamily: 'var(--font-mono)',
              minWidth: 42,
            }}
          >
            {formatTime(currentTimeSec)}
          </span>

          <div
            ref={scrubberRef}
            onClick={handleScrub}
            style={{
              position: 'relative',
              flex: 1,
              height: 6,
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              overflow: 'visible',
            }}
          >
            {/* Filled Progress Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${progressPercent}%`,
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #8B5CF6, #10B981)',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
                transition: 'width 0.15s linear',
              }}
            />

            {/* Draggable Indicator Handle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${progressPercent}%`,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '2px solid #8B5CF6',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
                cursor: 'pointer',
                transition: 'left 0.15s linear',
              }}
            />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#94A3B8',
              fontFamily: 'var(--font-mono)',
              minWidth: 42,
            }}
          >
            30:00
          </span>
        </div>
      </div>
    </div>
  )
}
