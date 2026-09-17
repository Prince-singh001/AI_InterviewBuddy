import React from 'react'

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * Interviewer Buddy AI — Official Brand Identity Icon
 * An abstract geometric symbol combining:
 * - Intelligent AI Neural Spark (4-pointed diamond star core)
 * - Dialogue / Speech bubble contour (Interview / conversation)
 * - Candidate growth beacon (Top-right ascension spark)
 * - Deep navy, electric purple/violet, and vibrant cyan palette
 */
export const LogoIcon: React.FC<LogoIconProps> = ({ size = 24, className = '', ...props }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Master Bubble Gradient: Violet into Electric Purple */}
        <linearGradient id="ibBubbleGradComp" x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="25%" stopColor="#8B5CF6" />
          <stop offset="65%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>

        {/* Floating Intelligence Core: Cyan to White Jewel */}
        <linearGradient id="ibCoreJewelComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#CFFAFE" />
          <stop offset="70%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Outer Dialogue Bubble Silhouette (Conversation) */}
      <path
        fill="url(#ibBubbleGradComp)"
        d="
          M 256 52
          C 368 52, 450 134, 450 242
          C 450 298, 424 350, 382 386
          C 379 389, 377 395, 380 411
          L 390 442
          C 393 453, 381 463, 370 456
          L 307 420
          C 295 414, 281 411, 269 413
          C 265 414, 260 414, 256 414
          C 144 414, 62 332, 62 242
          C 62 134, 144 52, 256 52 Z
        "
      />

      {/* Inner Deep Obsidian Neural Chamber (AI Engine) */}
      <path
        fill="#0A0E1A"
        d="
          M 256 116
          Q 256 238, 134 238
          Q 256 238, 256 360
          Q 256 238, 378 238
          Q 256 238, 256 116 Z
        "
      />

      {/* Luminous Central AI Intelligence Spark (4-Point Diamond Star) */}
      <path
        d="
          M 256 160
          Q 256 238, 178 238
          Q 256 238, 256 316
          Q 256 238, 334 238
          Q 256 238, 256 160 Z
        "
        fill="url(#ibCoreJewelComp)"
      />

      {/* Diamond Center Highlight (Pure White Spark Core) */}
      <polygon points="256,202 288,238 256,274 224,238" fill="#FFFFFF" />

      {/* Dynamic Candidate Growth Spark (Top-Right Ascension Star) */}
      <path
        d="
          M 398 102
          Q 398 123, 377 123
          Q 398 123, 398 144
          Q 398 123, 419 123
          Q 398 123, 398 102 Z
        "
        fill="#22D3EE"
      />
      <circle cx="398" cy="123" r="4.5" fill="#FFFFFF" />
    </svg>
  )
}

export default LogoIcon
