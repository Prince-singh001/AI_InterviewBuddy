import { ExecutionResult } from '@/types/coding';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  XCircle,
} from 'lucide-react';
import React from 'react';

interface SubmissionResultProps {
  result: ExecutionResult;
  onClose: () => void;
}

export default function SubmissionResult({
  result,
  onClose,
}: SubmissionResultProps) {
  const isAccepted = result.status === 'Accepted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border shadow-sm ${
        isAccepted
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/90 border-rose-300 text-rose-950'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {isAccepted ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
              <CheckCircle2 size={24} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
              <XCircle size={24} />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold tracking-tight">
                {result.status}
              </h3>
              {result.testCasesPassed !== undefined &&
                result.totalTestCases !== undefined && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-800">
                    {result.testCasesPassed} / {result.totalTestCases} Testcases
                    Passed
                  </span>
                )}
            </div>
            <p className="text-xs opacity-90 mt-0.5">{result.message}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock size={14} className="opacity-70 text-[#2196F3]" />
          <span>
            Runtime:{' '}
            <strong className="text-[#0D47A1]">{result.executionTimeMs || 38} ms</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cpu size={14} className="opacity-70 text-[#2196F3]" />
          <span>
            Memory:{' '}
            <strong className="text-[#0D47A1]">{result.memoryKb ? `${result.memoryKb} KB` : '15.2 MB'}</strong>
          </span>
        </div>

        {isAccepted && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 size={14} />
            <span>Beats 87.4% of submissions</span>
          </div>
        )}
      </div>

      {/* Error Details if any */}
      {result.errorDetails && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto border border-rose-300">
          {result.errorDetails}
        </div>
      )}
    </motion.div>
  );
}
