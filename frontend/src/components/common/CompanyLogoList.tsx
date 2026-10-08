import React from 'react';
import CompanyLogo from './CompanyLogo';

export interface CompanyLogoListProps {
  companies: string[];
  max?: number;
  size?: number;
  showName?: boolean;
  className?: string;
}

export default function CompanyLogoList({
  companies,
  max = 4,
  size = 16,
  showName = true,
  className = '',
}: CompanyLogoListProps) {
  if (!companies || companies.length === 0) return null;

  const visible = companies.slice(0, max);
  const remaining = companies.length - max;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visible.map((comp) => (
        <CompanyLogo
          key={comp}
          name={comp}
          size={size}
          showName={showName}
        />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
