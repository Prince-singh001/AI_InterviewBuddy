import { Clock, Cpu, Terminal } from 'lucide-react';
import React from 'react';

interface OutputPanelProps {
  output: string;
  executionTime?: number;
  memoryUsage?: number;
  isRunning?: boolean;
}

export default function OutputPanel({
  output,
  executionTime = 42,
  memoryUsage = 14.8,
  isRunning = false,
}: OutputPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#90CAF9]/40 shadow-xs p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#90CAF9]/30 mb-3">
        <div className="flex items-center gap-2">
          <Terminal size={15} className="text-[#2196F3]" />
          <h4 className="text-xs font-bold text-[#0D47A1]">
            Console Output
          </h4>
        </div>

        {output && !isRunning && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#2196F3]" />
              {executionTime}ms
            </span>
            <span className="flex items-center gap-1">
              <Cpu size={12} className="text-[#2196F3]" />
              {memoryUsage} MB
            </span>
          </div>
        )}
      </div>

      {isRunning ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-xs text-slate-500">
          <div className="w-5 h-5 border-2 border-[#2196F3] border-t-transparent rounded-full animate-spin mb-2" />
          <span>Executing code against test sandbox...</span>
        </div>
      ) : output ? (
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap overflow-x-auto border border-[#90CAF9]/30">
          {output}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500">
          Run your code or submit to inspect execution output and diagnostics.
        </div>
      )}
    </div>
  );
}
