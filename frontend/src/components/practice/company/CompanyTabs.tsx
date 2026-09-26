import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Code2,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import React from 'react';

export type CompanyTabKey =
  | 'overview'
  | 'questions'
  | 'coding'
  | 'assessment'
  | 'rounds';

interface CompanyTabsProps {
  activeTab: CompanyTabKey;
  onTabChange: (tab: CompanyTabKey) => void;
  questionCount?: number;
  codingCount?: number;
  assessmentCount?: number;
}

export default function CompanyTabs({
  activeTab,
  onTabChange,
  questionCount,
  codingCount,
  assessmentCount,
}: CompanyTabsProps) {
  const tabs: {
    key: CompanyTabKey;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
  }[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      key: 'questions',
      label: 'Previous Questions',
      icon: HelpCircle,
      count: questionCount,
    },
    {
      key: 'coding',
      label: 'Coding',
      icon: Code2,
      count: codingCount,
    },
    {
      key: 'assessment',
      label: 'Assessment',
      icon: ClipboardCheck,
      count: assessmentCount,
    },
    {
      key: 'rounds',
      label: 'Interview Rounds',
      icon: GitBranch,
    },
  ];

  return (
    <div className="overflow-x-auto no-scrollbar py-2 mb-6">
      <nav
        role="tablist"
        className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs min-w-max"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'text-white shadow-xs'
                  : 'text-[#0D47A1] hover:bg-[#E3F2FD] hover:text-[#0D47A1]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCompanyTabPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-[#2196F3] shadow-xs shadow-[#2196F3]/30 -z-10"
                />
              )}
              <Icon size={16} className={isActive ? 'text-white' : 'text-[#2196F3]'} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/50'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
