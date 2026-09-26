import { SupportedLanguage } from '@/types/coding';
import {
  Check,
  Copy,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
  onReset: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  onReset,
  isFullscreen = false,
  onToggleFullscreen,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Synchronize scrolling between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const linesCount = useMemo(() => {
    return Math.max(1, value.split('\n').length);
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces for tab
      const newValue =
        value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 text-slate-100 rounded-2xl border border-[#90CAF9]/40 shadow-md overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full min-h-[420px]'
      }`}
    >
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-slate-400">
            solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'c' ? 'c' : language === 'go' ? 'go' : 'cs'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          {/* Font Size controls */}
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(12, s - 1))}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-mono px-1">{fontSize}px</span>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(20, s + 1))}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Increase font size"
            aria-label="Increase font size"
          >
            <ZoomIn size={14} />
          </button>

          <div className="w-px h-3.5 bg-slate-800 mx-1" />

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Copy code"
            aria-label="Copy code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Reset code template"
            aria-label="Reset code template"
          >
            <RotateCcw size={14} />
          </button>

          {/* Fullscreen Button */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Code Area */}
      <div className="relative flex-1 flex overflow-hidden font-mono bg-slate-950">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none py-4 px-3 text-right text-slate-600 bg-slate-950/80 border-r border-slate-850 overflow-hidden shrink-0"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            minWidth: '42px',
          }}
        >
          {Array.from({ length: linesCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 w-full h-full p-4 bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-hidden overflow-auto whitespace-pre font-mono selection:bg-[#2196F3]/30"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            tabSize: 2,
          }}
          aria-label="Code Editor"
        />
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Lines: {linesCount}</span>
          <span>Chars: {value.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
