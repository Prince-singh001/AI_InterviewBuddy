import { CompanyQuestion } from '@/types/companyPractice';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, HelpCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CompanyQuestionCardProps {
  question: CompanyQuestion;
}

export default function CompanyQuestionCard({
  question,
}: CompanyQuestionCardProps) {
  const navigate = useNavigate();

  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'Hard':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/25';
    }
  };

  const handlePractice = () => {
    if (question.questionType === 'Coding') {
      navigate('/practice/coding');
    } else {
      navigate('/practice');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:shadow-md hover:border-[#2196F3] transition-all duration-200 flex flex-col justify-between gap-4"
    >
      <div>
        {/* Top Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#E3F2FD] text-[#0D47A1] text-xs font-bold flex items-center justify-center border border-[#90CAF9]/50">
              #{question.number}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F8FCFF] text-[#0D47A1] border border-[#90CAF9]/40">
              {question.questionType}
            </span>
            <span className="text-xs text-slate-500">
              • {question.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {question.frequency && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D47A1] bg-[#E3F2FD] px-2 py-0.5 rounded-full border border-[#90CAF9]">
                <Flame size={12} className="text-[#2196F3]" />
                {question.frequency} Frequency
              </span>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                question.difficulty,
              )}`}
            >
              {question.difficulty}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <p className="text-sm sm:text-base font-bold text-[#0D47A1] leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#90CAF9]/30 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Reported in recent interview rounds
        </span>

        <button
          type="button"
          onClick={handlePractice}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2196F3] hover:bg-[#0D47A1] text-white shadow-xs transition-all duration-200 cursor-pointer"
        >
          <span>Practice</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
