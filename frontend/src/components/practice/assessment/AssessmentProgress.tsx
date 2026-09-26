import React from 'react';

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

export default function AssessmentProgress({
  currentQuestion,
  totalQuestions,
  answeredCount,
}: AssessmentProgressProps) {
  const answeredPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const currentPercentage =
    totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-semibold">
        <span>
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span>{answeredPercentage}% Answered</span>
      </div>
      <div className="w-full h-2 bg-[#E3F2FD] rounded-full overflow-hidden border border-[#90CAF9]/40">
        <div
          className="h-full bg-[#2196F3] rounded-full transition-all duration-300"
          style={{ width: `${currentPercentage}%` }}
        />
      </div>
    </div>
  );
}
