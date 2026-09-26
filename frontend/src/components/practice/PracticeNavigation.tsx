import { motion } from 'framer-motion';
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  Code2,
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface PracticeNavigationProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export default function PracticeNavigation({
  title = 'Practice Center',
  subtitle = 'Elevate your technical proficiency with AI-driven interview practice, timed assessments, coding challenges, and company-focused preparation.',
  badge,
  actions,
}: PracticeNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      label: 'Practice',
      path: '/practice',
      icon: BookOpen,
      exact: true,
    },
    {
      label: 'Assessment',
      path: '/practice/assessment',
      icon: ClipboardCheck,
      exact: false,
    },
    {
      label: 'Company Practice',
      path: '/practice/company',
      icon: Building2,
      exact: false,
    },
    {
      label: 'Coding Practice',
      path: '/practice/coding',
      icon: Code2,
      exact: false,
    },
  ];

  const isItemActive = (path: string, exact: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <div className="practice-nav-container mb-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#90CAF9]/40">
        <div>
          {badge ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9] mb-2 shadow-xs">
              <span>{badge}</span>
            </div>
          ) : null}
          {title ? (
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D47A1]">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Segmented Tab Navigation */}
      <div className="mt-5 overflow-x-auto no-scrollbar py-1">
        <nav
          role="tablist"
          aria-label="Practice Center Navigation"
          className="inline-flex p-1.5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-[0_2px_12px_rgba(13,71,161,0.06)] min-w-full sm:min-w-0"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2196F3] ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-[#0D47A1] hover:text-[#0D47A1] hover:bg-[#E3F2FD]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePracticeTabPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-[#2196F3] shadow-sm shadow-[#2196F3]/30 -z-10"
                  />
                )}
                <Icon
                  size={17}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-[#2196F3]'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
