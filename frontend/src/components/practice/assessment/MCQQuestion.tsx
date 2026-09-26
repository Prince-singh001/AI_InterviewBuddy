import { MCQQuestion as MCQQuestionType } from '@/types/assessment';
import { motion } from 'framer-motion';
import { Bookmark, Check, Code2 } from 'lucide-react';
import React from 'react';

interface MCQQuestionProps {
  question: MCQQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
}

const OPTION_PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function MCQQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  isMarkedForReview,
  onToggleMarkForReview,
}: MCQQuestionProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#90CAF9]/40 shadow-sm p-6 sm:p-8">
      {/* Top Question Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#90CAF9]/30">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#E3F2FD] text-[#0D47A1] font-bold text-xs sm:text-sm border border-[#90CAF9]">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.topic && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              {question.topic}
            </span>
          )}
          {question.difficulty && (
            <span className="text-xs text-slate-500 font-medium">
              • {question.difficulty}
            </span>
          )}
        </div>

        {/* Mark for review toggle */}
        <button
          type="button"
          onClick={onToggleMarkForReview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer ${
            isMarkedForReview
              ? 'bg-[#E3F2FD] border-[#2196F3] text-[#0D47A1]'
              : 'bg-white border-slate-200 text-slate-600 hover:border-[#2196F3] hover:text-[#0D47A1] hover:bg-[#E3F2FD]/40'
          }`}
          title="Mark this question to review before final submission"
        >
          <Bookmark
            size={15}
            className={
              isMarkedForReview ? 'fill-[#2196F3] text-[#2196F3]' : 'text-[#2196F3]'
            }
          />
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Question Text */}
      <div className="my-6">
        <h2 className="text-base sm:text-lg font-bold text-[#0D47A1] leading-relaxed select-text">
          {question.question}
        </h2>

        {/* Code Snippet if present */}
        {question.codeSnippet && (
          <div className="mt-4 p-4 rounded-xl bg-[#F8FCFF] text-slate-800 font-mono text-xs sm:text-sm overflow-x-auto border border-[#90CAF9]/40">
            <div className="flex items-center gap-1.5 text-xs text-[#0D47A1] font-bold mb-2 border-b border-[#90CAF9]/30 pb-1">
              <Code2 size={14} className="text-[#2196F3]" />
              <span>Code Snippet</span>
            </div>
            <pre>
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-3.5 my-auto" role="radiogroup" aria-label="Question options">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const prefix = OPTION_PREFIXES[index] || `${index + 1}`;

          return (
            <motion.button
              key={index}
              type="button"
              role="radio"
              aria-checked={isSelected}
              whileTap={{ scale: 0.995 }}
              onClick={() => onSelectOption(index)}
              className={`w-full group text-left flex items-start sm:items-center gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2196F3] ${
                isSelected
                  ? 'bg-[#E3F2FD] border-[#2196F3] shadow-xs text-[#0D47A1]'
                  : 'bg-white border-slate-200 hover:border-[#90CAF9] hover:bg-[#F8FCFF] text-slate-800'
              }`}
            >
              {/* Option Letter Bubble */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#2196F3] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-[#E3F2FD] group-hover:text-[#0D47A1]'
                }`}
              >
                {isSelected ? <Check size={16} strokeWidth={3} /> : prefix}
              </div>

              {/* Option Text */}
              <div
                className={`flex-1 text-sm sm:text-base leading-snug ${
                  isSelected ? 'font-semibold text-[#0D47A1]' : 'font-medium text-slate-800'
                }`}
              >
                <span className="font-semibold text-slate-400 mr-2 sm:hidden">
                  {prefix}.
                </span>
                {option}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
