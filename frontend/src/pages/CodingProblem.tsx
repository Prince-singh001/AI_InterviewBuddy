import CodeEditor from '@/components/practice/coding/CodeEditor';
import LanguageSelector from '@/components/practice/coding/LanguageSelector';
import OutputPanel from '@/components/practice/coding/OutputPanel';
import ProblemDescription from '@/components/practice/coding/ProblemDescription';
import SubmissionResult from '@/components/practice/coding/SubmissionResult';
import TestCasePanel from '@/components/practice/coding/TestCasePanel';
import StickyBackButton from '@/components/practice/StickyBackButton';
import { getCodingProblemById } from '@/data/coding/problems';
import { defaultStarterCodes } from '@/data/coding/starterCodes';
import { ExecutionResult, SupportedLanguage } from '@/types/coding';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Maximize2,
  Play,
  RotateCcw,
  Send,
  Terminal,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function CodingProblem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const problem = getCodingProblemById(id || 'two-sum');

  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<
    'testcases' | 'output' | 'result'
  >('testcases');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [submissionResult, setSubmissionResult] =
    useState<ExecutionResult | null>(null);

  // Sync starter code when language or problem changes
  useEffect(() => {
    if (problem) {
      const initialCode =
        problem.starterCodes[language] || defaultStarterCodes[language] || '';
      setCode(initialCode);
      if (problem.testCases.length > 0) {
        setCustomInput(problem.testCases[0].input);
      }
    }
  }, [problem, language]);

  if (!problem) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="p-8 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-sm">
          <Code2 size={40} className="text-[#2196F3] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0D47A1] mb-2">
            Problem Not Found
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            The coding challenge requested does not exist or has been moved.
          </p>
          <Link
            to="/practice/coding"
            className="px-5 py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-semibold text-sm transition-colors shadow-xs"
          >
            Back to Problem List
          </Link>
        </div>
      </div>
    );
  }

  const handleResetCode = () => {
    const initialCode =
      problem.starterCodes[language] || defaultStarterCodes[language] || '';
    setCode(initialCode);
    toast.info('Code reset to template');
  };

  // Run Code placeholder (Mock execution)
  const handleRunCode = () => {
    setIsRunning(true);
    setActiveBottomTab('output');
    setConsoleOutput('');

    setTimeout(() => {
      setIsRunning(false);
      setConsoleOutput(
        `[Sandbox Test Run]\nLanguage: ${language.toUpperCase()}\nStatus: Finished in 38ms\nInput: ${
          customInput || problem.testCases[0]?.input
        }\nOutput: ${
          problem.testCases[0]?.expectedOutput || '[0, 1]'
        }\nExpected: ${
          problem.testCases[0]?.expectedOutput || '[0, 1]'
        }\n\nAll sample testcases passed successfully!`,
      );
      toast.success('Test run completed');
    }, 700);
  };

  // Submit placeholder (Mock submission)
  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setActiveBottomTab('result');

    setTimeout(() => {
      setIsSubmitting(false);

      const result: ExecutionResult = {
        status: 'Accepted',
        message: 'All test cases passed successfully!',
        executionTimeMs: 42,
        memoryKb: 15400,
        testCasesPassed: problem.testCases.length,
        totalTestCases: problem.testCases.length,
      };

      setSubmissionResult(result);

      // Save solved problem to localStorage
      try {
        const stored = localStorage.getItem('ib_solved_coding_problems');
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (!list.includes(problem.id)) {
          list.push(problem.id);
          localStorage.setItem(
            'ib_solved_coding_problems',
            JSON.stringify(list),
          );
        }
      } catch {
        // fallback
      }

      toast.success('Problem Solved! Submission Accepted.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FCFF] text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#90CAF9]/40 h-14 flex items-center justify-between px-3 sm:px-6 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <StickyBackButton
            label="Back to Coding Practice"
            to="/practice/coding"
            className="!static !top-auto !mb-0 !py-0 !border-0 !bg-transparent"
          />
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-xs sm:text-sm font-bold text-[#0D47A1] line-clamp-1">
            #{problem.number}. {problem.title}
          </span>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2">
          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={setLanguage}
          />

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E3F2FD] hover:bg-[#90CAF9]/40 text-[#0D47A1] border border-[#90CAF9] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play size={13} className={isRunning ? 'animate-spin' : ''} />
            <span>Run</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#2196F3] hover:bg-[#0D47A1] text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send size={13} />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Split Desktop / Stacked Mobile) */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Left Column: Problem Description */}
        <div className="h-[750px] lg:h-[calc(100vh-80px)] overflow-hidden">
          <ProblemDescription problem={problem} />
        </div>

        {/* Right Column: Code Editor & Bottom Panels */}
        <div className="flex flex-col h-[750px] lg:h-[calc(100vh-80px)] gap-4 overflow-hidden">
          {/* Editor Area (Takes 60% height) */}
          <div className="flex-1 min-h-[360px] overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              onReset={handleResetCode}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            />
          </div>

          {/* Bottom Tabs & Panels (Takes 40% height) */}
          <div className="h-[280px] flex flex-col bg-white rounded-2xl border border-[#90CAF9]/40 shadow-sm overflow-hidden shrink-0">
            {/* Tab Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#F8FCFF] border-b border-[#90CAF9]/30 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('testcases')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeBottomTab === 'testcases'
                      ? 'bg-[#2196F3] text-white shadow-xs shadow-[#2196F3]/30 font-bold'
                      : 'text-[#0D47A1] hover:bg-[#E3F2FD]'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('output')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeBottomTab === 'output'
                      ? 'bg-[#2196F3] text-white shadow-xs shadow-[#2196F3]/30 font-bold'
                      : 'text-[#0D47A1] hover:bg-[#E3F2FD]'
                  }`}
                >
                  Output
                </button>
                {submissionResult && (
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab('result')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeBottomTab === 'result'
                        ? 'bg-[#2196F3] text-white shadow-xs shadow-[#2196F3]/30 font-bold'
                        : 'text-[#0D47A1] hover:bg-[#E3F2FD]'
                    }`}
                  >
                    Result
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline select-none">
                  InterviewerBuddy AI Lab
                </span>
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-3 py-1 rounded-lg bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Run Code
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-3 overflow-y-auto bg-white">
              {activeBottomTab === 'testcases' && (
                <TestCasePanel
                  testCases={problem.testCases}
                  customInput={customInput}
                  onCustomInputChange={setCustomInput}
                />
              )}

              {activeBottomTab === 'output' && (
                <OutputPanel output={consoleOutput} isRunning={isRunning} />
              )}

              {activeBottomTab === 'result' && submissionResult && (
                <SubmissionResult
                  result={submissionResult}
                  onClose={() => setActiveBottomTab('testcases')}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
