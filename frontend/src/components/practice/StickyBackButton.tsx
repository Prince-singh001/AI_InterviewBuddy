import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface StickyBackButtonProps {
  label?: string;
  to?: string;
  className?: string;
}

export default function StickyBackButton({
  label = 'Back',
  to,
  className = '',
}: StickyBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={`sticky top-0 z-30 py-3 mb-4 backdrop-blur-md bg-white/90 border-b border-[#90CAF9]/40 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-sm text-[#0D47A1] bg-white border border-[#90CAF9] hover:border-[#2196F3] hover:bg-[#E3F2FD] hover:shadow-[0_4px_16px_rgba(33,150,243,0.18)] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <ArrowLeft
            size={16}
            className="text-[#2196F3] group-hover:text-[#0D47A1] group-hover:-translate-x-1 transition-transform duration-200"
          />
          <span>{label}</span>
        </button>
      </div>
    </div>
  );
}
