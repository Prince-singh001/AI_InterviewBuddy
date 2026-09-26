import { InterviewRoundStep } from '@/types/companyPractice';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck,
  Info,
  Lightbulb,
  MessageSquare,
  Users,
} from 'lucide-react';
import React from 'react';

interface CompanyTimelineProps {
  rounds: InterviewRoundStep[];
  companyName: string;
}

export default function CompanyTimeline({
  rounds,
  companyName,
}: CompanyTimelineProps) {
  const getRoundIcon = (type: InterviewRoundStep['type']) => {
    switch (type) {
      case 'Assessment':
        return FileCheck;
      case 'Technical':
        return Code2;
      case 'System Design':
        return Award;
      case 'Managerial':
        return Users;
      case 'HR':
        return MessageSquare;
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer note */}
      <div className="p-4 rounded-xl bg-[#E3F2FD] border border-[#90CAF9] text-xs text-[#0D47A1] flex items-start gap-2.5 shadow-xs">
        <Info size={16} className="text-[#2196F3] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block mb-0.5 text-[#0D47A1]">
            Typical Preparation Areas
          </strong>
          <span className="text-slate-600">
            Hiring processes, rounds, and order can vary depending on seniority, team, and country.
            These milestones represent general industry patterns reported by candidates for {companyName}.
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[17px] sm:before:left-[21px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[#90CAF9]">
        {rounds.map((round, index) => {
          const Icon = getRoundIcon(round.type);

          return (
            <motion.div
              key={round.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative group"
            >
              {/* Bullet Node */}
              <div className="absolute -left-[30px] sm:-left-[35px] top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#2196F3] flex items-center justify-center text-[#2196F3] shadow-xs z-10 group-hover:scale-110 transition-transform">
                <Icon size={14} />
              </div>

              {/* Card Container */}
              <div className="p-6 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#90CAF9]/30">
                  <div>
                    <span className="text-xs font-bold text-[#2196F3] uppercase tracking-wider">
                      Stage {round.step}
                    </span>
                    <h3 className="text-lg font-bold text-[#0D47A1]">
                      {round.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {round.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F2FD] text-[#0D47A1] text-xs font-semibold shrink-0 w-fit border border-[#90CAF9]/40">
                    <Clock size={13} className="text-[#2196F3]" />
                    <span>{round.duration}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {round.description}
                </p>

                {/* Key Focus Areas */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] mb-2">
                    Key Focus Areas:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {round.keyAreas.map((area, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-[#2196F3] shrink-0" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation Tips */}
                {round.tips && round.tips.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F8FCFF] border border-[#90CAF9]/50 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#0D47A1] mb-1.5">
                      <Lightbulb size={14} className="text-[#2196F3]" />
                      <span>Recommended Tips:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {round.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
