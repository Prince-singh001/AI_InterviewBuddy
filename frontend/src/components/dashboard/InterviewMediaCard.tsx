import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import {
  Brain,
  ChevronRight,
  Clock3,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Pause,
  Play,
  ShieldCheck,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function InterviewMediaCard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const totalDurationSec = 1800;
  const scrubberRef = useRef<HTMLDivElement>(null);

  const candidateName = user?.name || "Candidate";

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }

          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);

    return `${mins.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;

    const rect = scrubberRef.current.getBoundingClientRect();

    const position = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );

    setCurrentTimeSec(Math.floor(position * totalDurationSec));
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      toast.success(prev ? "Camera disabled" : "Camera enabled");
      return !prev;
    });
  };

  const toggleMic = () => {
    setIsMicOn((prev) => {
      toast.success(prev ? "Microphone muted" : "Microphone enabled");
      return !prev;
    });
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      toast.info(prev ? "Audio unmuted" : "Audio muted");
      return !prev;
    });
  };

  const progressPercent = (currentTimeSec / totalDurationSec) * 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="interview-media-card"
    >
      {/* =========================
          HEADER
      ========================== */}
      <div className="interview-card-header">
        <div className="interview-heading">
          <div className="heading-icon">
            <Brain size={21} />
          </div>

          <div>
            <div className="heading-title-row">
              <h2>AI Interview Practice</h2>

              <span className="live-badge">
                <span className="live-dot" />
                AI READY
              </span>
            </div>

            <p>Practice with an AI interviewer and receive instant feedback.</p>
          </div>
        </div>

        <button
          className="header-action"
          onClick={() => navigate("/interview/setup")}
        >
          Setup Interview
          <ChevronRight size={16} />
        </button>
      </div>

      {/* =========================
          MAIN MEDIA AREA
      ========================== */}
      <div className="interview-stage">
        {/* Background project image */}
        <img
          src="/images/interview-workspace.jpg"
          alt="AI interview workspace"
          className="stage-background"
        />

        <div className="stage-overlay" />

        {/* Top status */}
        <div className="stage-top">
          <div className="session-status">
            <span className="status-dot" />
            Ready for Interview
          </div>

          <div className="session-secure">
            <ShieldCheck size={14} />
            Secure Session
          </div>
        </div>

        {/* =========================
            CENTER CONTENT
        ========================== */}
        <div className="stage-center">
          {/* AI Interviewer */}
          <motion.div className="ai-interviewer" whileHover={{ scale: 1.02 }}>
            <div className="ai-image-wrapper">
              <img
                src="/images/ai-interviewer.jpg"
                alt="AI Interviewer"
                className="ai-interviewer-image"
              />

              <div className="ai-speaking-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="ai-info">
              <div className="ai-name">
                AI Interviewer
              </div>

              <span className="ai-role">InterviewerBuddy AI</span>
            </div>
          </motion.div>

          {/* Play */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={togglePlay}
            className="main-play-button"
            aria-label={isPlaying ? "Pause preview" : "Preview interview"}
          >
            {isPlaying ? (
              <Pause size={27} fill="white" />
            ) : (
              <Play size={27} fill="white" />
            )}
          </motion.button>

          {/* Candidate */}
          <motion.div
            className="candidate-preview"
            whileHover={{ scale: 1.02 }}
          >
            {isCameraOn ? (
              <img
                src="/images/candidate.jpg"
                alt="Candidate preview"
                className="candidate-image"
              />
            ) : (
              <div className="camera-off">
                <VideoOff size={24} />
                <span>Camera Off</span>
              </div>
            )}

            <div className="candidate-label">
              <span className="candidate-online" />
              {candidateName}
            </div>
          </motion.div>
        </div>

        {/* =========================
            INTERVIEW INFORMATION
        ========================== */}
        <div className="interview-info-strip">
          <div className="info-item">
            <MessageSquare size={16} />
            <div>
              <span>Interview Type</span>
              <strong>Technical Interview</strong>
            </div>
          </div>

          <div className="info-item">
            <Brain size={16} />
            <div>
              <span>AI Evaluation</span>
              <strong>Real-time Feedback</strong>
            </div>
          </div>

          <div className="info-item">
            <Clock3 size={16} />
            <div>
              <span>Estimated Duration</span>
              <strong>30 Minutes</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          CONTROLS
      ========================== */}
      <div className="interview-controls">
        <div className="control-row">
          {/* Left controls */}
          <div className="media-controls">
            <button
              className={`media-control ${!isCameraOn ? "control-danger" : ""}`}
              onClick={toggleCamera}
              title="Camera"
            >
              {isCameraOn ? <Video size={17} /> : <VideoOff size={17} />}
            </button>

            <button
              className={`media-control ${!isMicOn ? "control-danger" : ""}`}
              onClick={toggleMic}
              title="Microphone"
            >
              {isMicOn ? <Mic size={17} /> : <MicOff size={17} />}
            </button>

            <button
              className={`media-control ${isMuted ? "control-danger" : ""}`}
              onClick={toggleMute}
              title="Audio"
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="volume-slider"
              aria-label="Volume"
            />
          </div>

          {/* Right controls */}
          <div className="session-actions">
            <button
              className="fullscreen-button"
              onClick={() => toast.info("Full-screen preview opened")}
              title="Full screen"
            >
              <Maximize2 size={16} />
            </button>

            <button
              className="start-interview-button"
              onClick={() => navigate("/interview/setup")}
            >
              <Zap size={16} />
              Start Live Interview
            </button>
          </div>
        </div>

        {/* =========================
            TIMELINE
        ========================== */}
        <div className="timeline">
          <span className="time-label">{formatTime(currentTimeSec)}</span>

          <div
            ref={scrubberRef}
            className="timeline-track"
            onClick={handleScrub}
          >
            <div
              className="timeline-progress"
              style={{
                width: `${progressPercent}%`,
              }}
            />

            <div
              className="timeline-thumb"
              style={{
                left: `${progressPercent}%`,
              }}
            />
          </div>

          <span className="time-label">30:00</span>
        </div>
      </div>

      {/* =========================
          BOTTOM FEATURES
      ========================== */}
      <div className="feature-strip">
        <div className="feature">
          <div className="feature-icon">
            <Brain size={16} />
          </div>

          <div>
            <strong>Adaptive Questions</strong>
            <span>Questions based on your answers</span>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <Brain size={16} />
          </div>

          <div>
            <strong>AI Evaluation</strong>
            <span>Instant performance analysis</span>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <MessageSquare size={16} />
          </div>

          <div>
            <strong>Personalized Feedback</strong>
            <span>Improve with every interview</span>
          </div>
        </div>
      </div>

      <style>{`
        /* =========================================
           INTERVIEW MEDIA CARD
        ========================================= */

        .interview-media-card {
          width: 100%;
          overflow: hidden;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #90CAF9;
          box-shadow:
            0 18px 50px rgba(13, 71, 161, 0.12),
            0 4px 16px rgba(33, 150, 243, 0.08);
        }

        /* =========================================
           HEADER
        ========================================= */

        .interview-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 24px;
          background: #ffffff;
          border-bottom: 1px solid #E3F2FD;
        }

        .interview-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .heading-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #2196F3,
            #0D47A1
          );
          box-shadow:
            0 8px 20px rgba(33, 150, 243, 0.25);
        }

        .heading-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .heading-title-row h2 {
          margin: 0;
          color: #0D47A1;
          font-size: 18px;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .interview-heading p {
          margin: 4px 0 0;
          color: #64748B;
          font-size: 13px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          color: #0D47A1;
          background: #E3F2FD;
          border: 1px solid #90CAF9;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .live-dot,
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2196F3;
          box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.12);
        }

        .header-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid #90CAF9;
          background: #ffffff;
          color: #0D47A1;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-action:hover {
          background: #E3F2FD;
          border-color: #2196F3;
          transform: translateY(-1px);
        }

        /* =========================================
           MEDIA STAGE
        ========================================= */

        .interview-stage {
          position: relative;
          min-height: 455px;
          overflow: hidden;
          background: #0D47A1;
        }

        .stage-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0.45;
          filter: saturate(0.8);
        }

        .stage-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(13, 71, 161, 0.94) 0%,
              rgba(13, 71, 161, 0.48) 35%,
              rgba(4, 27, 62, 0.86) 100%
            );
        }

        .stage-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
        }

        .session-status,
        .session-secure {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border-radius: 999px;
          color: #ffffff;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(12px);
          font-size: 11px;
          font-weight: 650;
        }

        .session-secure {
          color: #E3F2FD;
        }

        /* =========================================
           CENTER
        ========================================= */

        .stage-center {
          position: relative;
          z-index: 2;
          min-height: 285px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 20px;
        }

        .ai-interviewer,
        .candidate-preview {
          position: relative;
          width: 190px;
          height: 220px;
          overflow: hidden;
          border-radius: 18px;
          background: #0D47A1;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow:
            0 18px 35px rgba(0,0,0,0.32);
        }

        .ai-image-wrapper {
          position: absolute;
          inset: 0;
        }

        .ai-interviewer-image,
        .candidate-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ai-image-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent 45%,
              rgba(4,27,62,0.92) 100%
            );
        }

        .ai-speaking-indicator {
          position: absolute;
          z-index: 2;
          right: 12px;
          bottom: 12px;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 6px 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          backdrop-filter: blur(8px);
        }

        .ai-speaking-indicator span {
          width: 3px;
          height: 10px;
          border-radius: 99px;
          background: #ffffff;
          animation: audioBars 0.8s infinite ease-in-out;
        }

        .ai-speaking-indicator span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .ai-speaking-indicator span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes audioBars {
          0%, 100% {
            transform: scaleY(0.45);
          }
          50% {
            transform: scaleY(1);
          }
        }

        .ai-info {
          position: absolute;
          z-index: 3;
          left: 13px;
          bottom: 12px;
        }

        .ai-name {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #ffffff;
          font-size: 12px;
          font-weight: 750;
        }

        .ai-role {
          display: block;
          margin-top: 2px;
          color: #BFDBFE;
          font-size: 9px;
        }

        .candidate-preview {
          border-color: rgba(144,202,249,0.65);
        }

        .candidate-preview::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(4,27,62,0.88),
            transparent 48%
          );
        }

        .candidate-label {
          position: absolute;
          z-index: 2;
          left: 12px;
          right: 12px;
          bottom: 11px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 650;
        }

        .candidate-online {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #90CAF9;
          box-shadow: 0 0 8px #90CAF9;
        }

        .camera-off {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #BFDBFE;
          background: #0D47A1;
          font-size: 11px;
        }

        .main-play-button {
          width: 66px;
          height: 66px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #2196F3,
            #0D47A1
          );
          box-shadow:
            0 12px 30px rgba(0,0,0,0.35),
            0 0 0 7px rgba(255,255,255,0.08);
          cursor: pointer;
        }

        /* =========================================
           INFO STRIP
        ========================================= */

        .interview-info-strip {
          position: absolute;
          z-index: 3;
          left: 22px;
          right: 22px;
          bottom: 18px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border-radius: 12px;
          color: #ffffff;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
        }

        .info-item svg {
          flex-shrink: 0;
          color: #90CAF9;
        }

        .info-item span,
        .info-item strong {
          display: block;
        }

        .info-item span {
          color: #BFDBFE;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-item strong {
          margin-top: 2px;
          color: #ffffff;
          font-size: 10px;
        }

        /* =========================================
           CONTROLS
        ========================================= */

        .interview-controls {
          padding: 17px 22px 19px;
          background: #ffffff;
        }

        .control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .media-controls,
        .session-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .media-control,
        .fullscreen-button {
          width: 37px;
          height: 37px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0D47A1;
          background: #E3F2FD;
          border: 1px solid #90CAF9;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .media-control:hover,
        .fullscreen-button:hover {
          background: #90CAF9;
          color: #0D47A1;
          transform: translateY(-1px);
        }

        .control-danger {
          color: #0D47A1;
          background: #90CAF9;
        }

        .volume-slider {
          width: 70px;
          accent-color: #2196F3;
          cursor: pointer;
        }

        .start-interview-button {
          min-height: 39px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 17px;
          border: none;
          border-radius: 10px;
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #2196F3,
            #0D47A1
          );
          box-shadow:
            0 8px 18px rgba(33,150,243,0.22);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .start-interview-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 10px 22px rgba(33,150,243,0.3);
        }

        /* =========================================
           TIMELINE
        ========================================= */

        .timeline {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 15px;
        }

        .time-label {
          min-width: 38px;
          color: #64748B;
          font-size: 10px;
          font-variant-numeric: tabular-nums;
        }

        .timeline:last-child .time-label {
          text-align: right;
        }

        .timeline-track {
          position: relative;
          flex: 1;
          height: 5px;
          border-radius: 99px;
          background: #E3F2FD;
          cursor: pointer;
        }

        .timeline-progress {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #2196F3,
            #0D47A1
          );
        }

        .timeline-thumb {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #2196F3;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 7px rgba(13,71,161,0.25);
        }

        /* =========================================
           FEATURES
        ========================================= */

        .feature-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid #E3F2FD;
          background: #F8FCFF;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 15px 18px;
          border-right: 1px solid #E3F2FD;
        }

        .feature:last-child {
          border-right: none;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2196F3;
          background: #E3F2FD;
        }

        .feature strong,
        .feature span {
          display: block;
        }

        .feature strong {
          color: #0D47A1;
          font-size: 10px;
          font-weight: 750;
        }

        .feature span {
          margin-top: 2px;
          color: #64748B;
          font-size: 8px;
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 900px) {
          .stage-center {
            gap: 20px;
          }

          .ai-interviewer,
          .candidate-preview {
            width: 160px;
            height: 195px;
          }

          .interview-info-strip {
            grid-template-columns: 1fr;
            left: 16px;
            right: 16px;
            bottom: 14px;
          }

          .info-item {
            padding: 7px 10px;
          }

          .interview-stage {
            min-height: 520px;
          }
        }

        @media (max-width: 680px) {
          .interview-card-header {
            padding: 17px;
            align-items: flex-start;
          }

          .header-action {
            display: none;
          }

          .heading-title-row h2 {
            font-size: 16px;
          }

          .interview-heading p {
            font-size: 11px;
          }

          .stage-center {
            min-height: 310px;
            gap: 10px;
            align-items: center;
          }

          .ai-interviewer,
          .candidate-preview {
            width: 125px;
            height: 165px;
          }

          .main-play-button {
            width: 52px;
            height: 52px;
          }

          .interview-info-strip {
            display: none;
          }

          .control-row {
            align-items: stretch;
            flex-direction: column;
          }

          .media-controls,
          .session-actions {
            width: 100%;
          }

          .session-actions {
            justify-content: space-between;
          }

          .start-interview-button {
            flex: 1;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }

          .feature {
            border-right: none;
            border-bottom: 1px solid #E3F2FD;
          }

          .feature:last-child {
            border-bottom: none;
          }
        }

        @media (max-width: 430px) {
          .stage-center {
            gap: 7px;
          }

          .ai-interviewer,
          .candidate-preview {
            width: 105px;
            height: 145px;
          }

          .ai-name {
            font-size: 9px;
          }

          .ai-role {
            font-size: 7px;
          }

          .candidate-label {
            font-size: 9px;
          }

          .volume-slider {
            width: 55px;
          }
        }
      `}</style>
    </motion.section>
  );
}
