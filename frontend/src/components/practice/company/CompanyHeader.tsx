import { Company } from '@/types/companyPractice';
import { MapPin, Target } from 'lucide-react';
import React from 'react';

interface CompanyHeaderProps {
  company: Company;
}

export default function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs relative overflow-hidden mb-6">
      {/* Background tint */}
      <div
        className="absolute top-0 right-0 w-96 h-96 opacity-60 blur-3xl rounded-full pointer-events-none -mr-24 -mt-24 bg-[#E3F2FD]"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          {/* Logo container with fallback - preserves brand identity */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl text-white shadow-md shrink-0"
            style={{
              backgroundColor: company.brandColor || '#2196F3',
            }}
          >
            {company.logoText}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]">
                {company.tier}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} className="text-[#2196F3]" />
                {company.hq || 'Global Office'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D47A1] tracking-tight">
              {company.name} Practice Hub
            </h1>

            <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>

        {/* Quick Recommendation pill */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 shrink-0 p-3.5 rounded-xl bg-[#F8FCFF] border border-[#90CAF9]/40 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#0D47A1]">
            <Target size={14} className="text-[#2196F3]" />
            <span>Preparation Focus:</span>
          </div>
          <span className="text-slate-700 font-medium">
            {company.recommendedFocus || 'Technical & System Foundations'}
          </span>
        </div>
      </div>
    </div>
  );
}
