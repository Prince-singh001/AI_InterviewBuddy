import { CodingProblem } from '@/types/coding';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Code2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface CompanyCodingCardProps {
  problem: CodingProblem;
}

export default function CompanyCodingCard({ problem }: CompanyCodingCardProps) {
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

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:shadow-md hover:border-[#2196F3] transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
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
          </div>
          <span className="text-xs text-slate-500">
            Acceptance: {problem.acceptance}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#0D47A1] line-clamp-1 mb-2 hover:text-[#2196F3] transition-colors">
          {problem.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {problem.topics.slice(0, 3).map((topic, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-0.5 rounded-lg bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/40 font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#90CAF9]/30 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          7 Languages supported
        </span>

        <Link
          to={`/practice/coding/${problem.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2196F3] hover:bg-[#0D47A1] text-white shadow-xs transition-all duration-200"
        >
          <span>Solve</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
