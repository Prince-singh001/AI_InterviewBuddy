import { Bookmark, CheckCircle2, Circle } from 'lucide-react';
import React from 'react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number | null>;
  markedForReview: Record<number, boolean>;
  onSelectQuestion: (index: number) => void;
  onSubmitAssessment: () => void;
}

export default function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  markedForReview,
  onSelectQuestion,
  onSubmitAssessment,
}: QuestionNavigatorProps) {
  // Count statistics
  let answeredCount = 0;
  let markedCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const qId = i + 1;
    if (answers[qId] !== null && answers[qId] !== undefined) {
      answeredCount++;
    }
    if (markedForReview[qId]) {
      markedCount++;
    }
  }

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="bg-white rounded-2xl border border-[#90CAF9]/40 shadow-sm p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#90CAF9]/30">
          <h3 className="font-bold text-sm sm:text-base text-[#0D47A1]">
            Question Navigator
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {answeredCount}/{totalQuestions} Answered
          </span>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2196F3] ring-2 ring-[#2196F3]/40" />
            <span>Current ({currentIndex + 1})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#0D47A1] border border-[#0D47A1]" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#E3F2FD] border border-[#2196F3]" />
            <span>Review ({markedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-50 border border-slate-200" />
            <span>Unanswered ({unansweredCount})</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="mt-4 grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qId = i + 1;
            const isCurrent = currentIndex === i;
            const isAnswered =
              answers[qId] !== null && answers[qId] !== undefined;
            const isMarked = !!markedForReview[qId];

            let buttonStyle =
              'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#2196F3] hover:bg-[#E3F2FD]/50';

            if (isCurrent) {
              buttonStyle =
                'bg-[#2196F3] text-white border-[#2196F3] shadow-sm ring-2 ring-[#2196F3]/40 font-bold';
            } else if (isMarked) {
              buttonStyle =
                'bg-[#E3F2FD] text-[#0D47A1] border-[#2196F3] shadow-xs font-semibold';
            } else if (isAnswered) {
              buttonStyle =
                'bg-[#0D47A1] text-white border-[#0D47A1] font-semibold';
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectQuestion(i)}
                aria-label={`Go to question ${qId}`}
                className={`relative h-10 rounded-xl text-xs flex items-center justify-center border transition-all duration-200 cursor-pointer ${buttonStyle}`}
              >
                <span>{qId}</span>
                {isMarked && !isCurrent && (
                  <Bookmark
                    size={10}
                    className="absolute top-1 right-1 fill-[#0D47A1] text-[#0D47A1]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Submit Action */}
      <div className="mt-6 pt-4 border-t border-[#90CAF9]/30">
        <button
          type="button"
          onClick={onSubmitAssessment}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-[#2196F3] hover:bg-[#0D47A1] text-white shadow-xs transition-all duration-200 cursor-pointer"
        >
          Submit Assessment
        </button>
      </div>
    </div>
  );
}
