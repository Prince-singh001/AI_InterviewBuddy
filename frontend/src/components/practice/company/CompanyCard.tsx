import { Company } from '@/types/companyPractice';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ClipboardCheck,
  Code2,
  HelpCircle,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:shadow-md hover:border-[#2196F3] transition-all duration-300 overflow-hidden"
    >
      {/* Decorative Accent Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#E3F2FD] opacity-70 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div>
        {/* Header: Logo area and Tier */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Logo container - preserves brand identity */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-xs shrink-0"
              style={{
                backgroundColor: company.brandColor || '#2196F3',
              }}
            >
              {company.logoText}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0D47A1] group-hover:text-[#2196F3] transition-colors">
                {company.name}
              </h3>
              <span className="text-xs text-slate-500">
                {company.hq || 'Global Office'}
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]">
            {company.tier}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {company.description}
        </p>

        {/* Counts & Placeholders */}
        <div className="mt-5 grid grid-cols-3 gap-2 py-3 border-y border-[#90CAF9]/30 text-center">
          <div className="p-2 rounded-xl bg-[#F8FCFF] border border-[#90CAF9]/25">
            <div className="flex items-center justify-center gap-1 text-[#2196F3] mb-1">
              <HelpCircle size={14} />
              <span className="text-xs font-bold text-[#0D47A1]">
                —
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Questions
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#F8FCFF] border border-[#90CAF9]/25">
            <div className="flex items-center justify-center gap-1 text-[#2196F3] mb-1">
              <Code2 size={14} />
              <span className="text-xs font-bold text-[#0D47A1]">
                —
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Coding
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#F8FCFF] border border-[#90CAF9]/25">
            <div className="flex items-center justify-center gap-1 text-[#2196F3] mb-1">
              <ClipboardCheck size={14} />
              <span className="text-xs font-bold text-[#0D47A1]">
                —
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Assessments
            </span>
          </div>
        </div>
      </div>

      {/* Explore Button */}
      <div className="mt-6 pt-1">
        <Link
          to={`/practice/company/${company.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#2196F3] hover:bg-[#0D47A1] text-white shadow-xs transition-all duration-200 cursor-pointer"
        >
          <span>Explore Practice</span>
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </motion.div>
  );
}
