import { CodingProblem } from '@/types/coding';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface CodingProblemCardProps {
  problem: CodingProblem;
  isSolved?: boolean;
}

export default function CodingProblemCard({
  problem,
  isSolved = false,
}: CodingProblemCardProps) {
  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <motion.tr
      whileHover={{ backgroundColor: 'rgba(33, 150, 243, 0.05)' }}
      className="border-b border-slate-100 transition-colors"
    >
      {/* Solved Status */}
      <td className="py-4 px-4 text-center w-12">
        {isSolved ? (
          <span title="Solved">
            <CheckCircle2 size={18} className="text-emerald-500 inline-block" />
          </span>
        ) : (
          <span title="Unsolved">
            <Circle
              size={16}
              className="text-slate-300 inline-block"
            />
          </span>
        )}
      </td>

      {/* Title & Number */}
      <td className="py-4 px-4 font-medium">
        <Link
          to={`/practice/coding/${problem.id}`}
          className="group inline-flex items-center gap-2"
        >
          <span className="text-xs font-mono text-slate-400">
            {problem.number}.
          </span>
          <span className="text-slate-800 font-semibold group-hover:text-[#2196F3] transition-colors">
            {problem.title}
          </span>
        </Link>
      </td>

      {/* Difficulty */}
      <td className="py-4 px-4 whitespace-nowrap">
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
            problem.difficulty,
          )}`}
        >
          {problem.difficulty}
        </span>
      </td>

      {/* Topics */}
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {problem.topics.slice(0, 3).map((topic, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-0.5 rounded-md bg-[#E3F2FD] border border-[#90CAF9]/40 text-[#0D47A1] font-medium"
            >
              {topic}
            </span>
          ))}
          {problem.topics.length > 3 && (
            <span className="text-xs text-slate-400 font-medium">
              +{problem.topics.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Acceptance */}
      <td className="py-4 px-4 text-xs text-slate-500 hidden sm:table-cell font-medium">
        {problem.acceptance}
      </td>

      {/* Action */}
      <td className="py-4 px-4 text-right whitespace-nowrap">
        <Link
          to={`/practice/coding/${problem.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2196F3] hover:bg-[#0D47A1] text-white shadow-xs transition-all duration-200 cursor-pointer"
        >
          <span>{isSolved ? 'Review' : 'Solve'}</span>
          <ArrowRight size={13} />
        </Link>
      </td>
    </motion.tr>
  );
}
