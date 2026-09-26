import { CodingTestCase } from '@/types/coding';
import { CheckCircle2, Play, Terminal } from 'lucide-react';
import React, { useState } from 'react';

interface TestCasePanelProps {
  testCases: CodingTestCase[];
  customInput: string;
  onCustomInputChange: (val: string) => void;
}

export default function TestCasePanel({
  testCases,
  customInput,
  onCustomInputChange,
}: TestCasePanelProps) {
  const [activeTab, setActiveTab] = useState<number | 'custom'>(0);

  return (
    <div className="bg-white rounded-2xl border border-[#90CAF9]/40 shadow-xs p-4">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-[#90CAF9]/30 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {testCases.map((tc, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={tc.id}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2196F3] text-white shadow-xs shadow-[#2196F3]/30 font-bold'
                    : 'bg-[#F8FCFF] text-[#0D47A1] border border-[#90CAF9]/40 hover:bg-[#E3F2FD]'
                }`}
              >
                Case {index + 1}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#2196F3] text-white shadow-xs shadow-[#2196F3]/30 font-bold'
                : 'bg-[#F8FCFF] text-[#0D47A1] border border-[#90CAF9]/40 hover:bg-[#E3F2FD]'
            }`}
          >
            Custom Testcase
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-3 font-mono text-xs">
        {activeTab === 'custom' ? (
          <div>
            <label className="block text-xs font-bold text-[#0D47A1] font-sans mb-1.5">
              Custom Input:
            </label>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
              className="w-full h-24 p-3 rounded-xl bg-[#F8FCFF] text-slate-800 border border-[#90CAF9] focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#90CAF9]/40 font-mono resize-none text-xs"
            />
          </div>
        ) : (
          (() => {
            const currentTestCase = testCases[activeTab as number];
            if (!currentTestCase) return null;

            return (
              <div className="space-y-2.5">
                <div>
                  <div className="text-[11px] font-sans font-semibold text-slate-500 mb-1">
                    Input:
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FCFF] text-slate-800 border border-[#90CAF9]/40 select-all">
                    {currentTestCase.input}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-sans font-semibold text-slate-500 mb-1">
                    Expected Output:
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 select-all font-bold">
                    {currentTestCase.expectedOutput}
                  </div>
                </div>

                {currentTestCase.explanation && (
                  <div className="text-xs font-sans text-slate-600 pt-1">
                    <span className="font-semibold text-[#0D47A1]">Note:</span>{' '}
                    {currentTestCase.explanation}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
