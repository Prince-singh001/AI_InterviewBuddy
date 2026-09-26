import { AlertCircle, Clock } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface AssessmentTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  setRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;
  onTimeUp: () => void;
  isRunning?: boolean;
}

export default function AssessmentTimer({
  totalSeconds,
  remainingSeconds,
  setRemainingSeconds,
  onTimeUp,
  isRunning = true,
}: AssessmentTimerProps) {
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, setRemainingSeconds]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Timer states: Normal (#2196F3), Warning (< 5 mins), Critical (< 1 min)
  const isCritical = remainingSeconds <= 60;
  const isWarning = remainingSeconds <= 300 && !isCritical;

  const percentage = Math.max(0, (remainingSeconds / totalSeconds) * 100);

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wider transition-all duration-300 ${
          isCritical
            ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse shadow-xs'
            : isWarning
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-[#90CAF9] text-[#0D47A1] shadow-xs'
        }`}
      >
        {isCritical ? (
          <AlertCircle size={16} className="text-rose-600" />
        ) : (
          <Clock size={16} className={isWarning ? 'text-amber-600' : 'text-[#2196F3]'} />
        )}
        <span>{formattedTime}</span>
      </div>

      {/* Mini Progress Bar */}
      <div
        className="hidden sm:block w-24 h-2 bg-[#E3F2FD] rounded-full overflow-hidden border border-[#90CAF9]/40"
        title={`${Math.round(percentage)}% time remaining`}
      >
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isCritical
              ? 'bg-rose-500'
              : isWarning
                ? 'bg-amber-500'
                : 'bg-[#2196F3]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
