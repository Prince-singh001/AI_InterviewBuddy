import CompanyCard from '@/components/practice/company/CompanyCard';
import PracticeNavigation from '@/components/practice/PracticeNavigation';
import { companies } from '@/data/company/companies';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Compass,
  FileCheck,
  HelpCircle,
  Search,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export default function CompanyPractice() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.popularTopics.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesTier =
        selectedTier === 'all' ||
        (selectedTier === 'tier1' && c.tier.includes('Tier 1')) ||
        (selectedTier === 'consulting' && c.tier.includes('Consulting')) ||
        (selectedTier === 'services' && c.tier.includes('Services'));

      return matchesSearch && matchesTier;
    });
  }, [searchQuery, selectedTier]);

  return (
    <div className="practice-subpage max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PracticeNavigation
        title="Company Wise Practice"
        subtitle="Prepare for company-focused interviews with curated coding, technical, assessment and interview practice."
        badge="TARGETED COMPANY PREPARATION"
      />

      {/* Strategic Value Proposition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] border border-[#90CAF9] flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold">
              Curated Profiles
            </span>
            <div className="text-sm font-bold text-[#0D47A1]">
              FAANG, Big 4 & Tech Giants
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] border border-[#90CAF9] flex items-center justify-center shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold">
              Interview Timelines
            </span>
            <div className="text-sm font-bold text-[#0D47A1]">
              Stage-by-stage hiring roadmaps
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#2196F3] border border-[#90CAF9] flex items-center justify-center shrink-0">
            <FileCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold">
              Mock Screenings
            </span>
            <div className="text-sm font-bold text-[#0D47A1]">
              Company-tailored assessments
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2196F3] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company (e.g. Google, Amazon, TCS)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/20 shadow-xs"
          />
        </div>

        {/* Tier Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { label: 'All Companies', value: 'all' },
            { label: 'Tier 1 / FAANG', value: 'tier1' },
            { label: 'Consulting & Big 4', value: 'consulting' },
            { label: 'IT Services', value: 'services' },
          ].map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => setSelectedTier(tier.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedTier === tier.value
                  ? 'bg-[#E3F2FD] border border-[#2196F3] text-[#0D47A1] font-bold shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-[#90CAF9] hover:bg-[#E3F2FD]/50 hover:text-[#0D47A1]'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Responsive Grid */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#90CAF9]/40 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E3F2FD] text-[#2196F3] border border-[#90CAF9] flex items-center justify-center mb-4">
            <Building2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#0D47A1] mb-1">
            No Companies Matching Search
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            We couldn&apos;t find any companies matching &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTier('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
