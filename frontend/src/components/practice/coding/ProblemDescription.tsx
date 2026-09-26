import { CodingProblem } from '@/types/coding';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Tag,
} from 'lucide-react';
import React, { useState } from 'react';

interface ProblemDescriptionProps {
  problem: CodingProblem;
}

export default function ProblemDescription({
  problem,
}: ProblemDescriptionProps) {
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});

  const toggleHint = (index: number) => {
    setOpenHints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#90CAF9]/40 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#90CAF9]/30 bg-white">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-slate-400">
            #{problem.number}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
              problem.difficulty,
            )}`}
          >
            {problem.difficulty}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Acceptance: {problem.acceptance}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D47A1]">
          {problem.title}
        </h1>

        {/* Topics & Companies */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs text-slate-500 mr-1 font-medium">
            <Tag size={13} className="text-[#2196F3]" />
            <span>Topics:</span>
          </div>
          {problem.topics.map((topic, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-0.5 rounded-md bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/40 font-medium"
            >
              {topic}
            </span>
          ))}

          {problem.companies && problem.companies.length > 0 && (
            <div className="w-full flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-[#90CAF9]/20">
              <div className="flex items-center gap-1 text-xs text-slate-500 mr-1 font-medium">
                <Building2 size={13} className="text-[#2196F3]" />
                <span>Companies:</span>
              </div>
              {problem.companies.map((comp, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 rounded-md bg-[#F8FCFF] text-[#0D47A1] border border-[#90CAF9]/40 font-medium"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-700 text-sm leading-relaxed">
        {/* Description */}
        <div className="whitespace-pre-line font-normal space-y-3">
          {problem.description}
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0D47A1]">
            Examples:
          </h2>
          {problem.examples.map((example, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#F8FCFF] border border-[#90CAF9]/30 text-xs font-mono space-y-1.5"
            >
              <div className="font-bold text-[#0D47A1] font-sans text-xs">
                Example {i + 1}:
              </div>
              <div>
                <span className="text-slate-500 select-none">
                  Input:{' '}
                </span>
                <span className="text-[#0D47A1] font-semibold">
                  {example.input}
                </span>
              </div>
              <div>
                <span className="text-slate-500 select-none">
                  Output:{' '}
                </span>
                <span className="text-emerald-600 font-bold">
                  {example.output}
                </span>
              </div>
              {example.explanation && (
                <div className="font-sans text-slate-600 pt-1 text-xs">
                  <span className="font-semibold select-none text-slate-700">
                    Explanation:{' '}
                  </span>
                  {example.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0D47A1]">
            Constraints:
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-700 bg-[#F8FCFF] p-3.5 rounded-xl border border-[#90CAF9]/30">
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        {/* Hints */}
        {problem.hints && problem.hints.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0D47A1] flex items-center gap-1.5">
              <Lightbulb size={15} className="text-amber-500" />
              <span>Hints ({problem.hints.length})</span>
            </h2>

            <div className="space-y-2">
              {problem.hints.map((hint, i) => {
                const isOpen = !!openHints[i];

                return (
                  <div
                    key={i}
                    className="rounded-xl border border-[#90CAF9]/40 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleHint(i)}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-[#0D47A1] bg-[#F8FCFF] hover:bg-[#E3F2FD] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9] flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        Hint {i + 1}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={15} className="text-[#2196F3]" />
                      ) : (
                        <ChevronDown size={15} className="text-slate-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-3 bg-white text-xs text-slate-600 border-t border-[#90CAF9]/30"
                        >
                          {hint}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
