import React from 'react';

export interface CompanyLogoProps {
  name: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

// Canonical company brand color and clean SVG definitions
export const COMPANY_DETAILS: Record<
  string,
  {
    displayName: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
    renderSvg: (size: number) => React.ReactNode;
  }
> = {
  microsoft: {
    displayName: 'Microsoft',
    bgColor: '#F3F4F6',
    textColor: '#1E293B',
    accentColor: '#00A4EF',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 23 23" fill="none">
        <rect width="10.8" height="10.8" fill="#F25022" />
        <rect x="12.2" width="10.8" height="10.8" fill="#7FBA00" />
        <rect y="12.2" width="10.8" height="10.8" fill="#00A4EF" />
        <rect x="12.2" y="12.2" width="10.8" height="10.8" fill="#FFB900" />
      </svg>
    ),
  },
  google: {
    displayName: 'Google',
    bgColor: '#FFFFFF',
    textColor: '#1E293B',
    accentColor: '#4285F4',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.07.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        />
      </svg>
    ),
  },
  amazon: {
    displayName: 'Amazon',
    bgColor: '#131921',
    textColor: '#FFFFFF',
    accentColor: '#FF9900',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path
          d="M13.6 14.5c-3.1 2.3-7.5 1.2-10.1-.5-.2-.1-.2-.4 0-.5.8-.6 2.2-1.4 4.8-1.3 2.6.1 4.7 1.3 5.3 2.3zm2.1-.6c-.2-.4-1.4-.7-2.7-.6l.3-.8c.7-.1 1.8.2 2.2.8.2.2.3.4.2.6z"
          fill="#FF9900"
        />
        <circle cx="12" cy="12" r="10" stroke="#FF9900" strokeWidth="1.5" />
      </svg>
    ),
  },
  openai: {
    displayName: 'OpenAI',
    bgColor: '#10A37F',
    textColor: '#FFFFFF',
    accentColor: '#10A37F',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.28 9.87a6.04 6.04 0 0 0-.52-4.92 6.13 6.13 0 0 0-4.59-3.08 6.05 6.05 0 0 0-5.69 1.48 6.1 6.1 0 0 0-4.49.52 6.14 6.14 0 0 0-3.32 4.41 6.07 6.07 0 0 0 .8 5.75 6.05 6.05 0 0 0 .52 4.92 6.13 6.13 0 0 0 4.59 3.08 6.05 6.05 0 0 0 5.69-1.48 6.1 6.1 0 0 0 4.49-.52 6.14 6.14 0 0 0 3.32-4.41 6.07 6.07 0 0 0-.8-5.75zM12 13.88a1.88 1.88 0 1 1 0-3.76 1.88 1.88 0 0 1 0 3.76z" />
      </svg>
    ),
  },
  perplexity: {
    displayName: 'Perplexity AI',
    bgColor: '#20B2AA',
    textColor: '#FFFFFF',
    accentColor: '#138A82',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" strokeLinecap="round" />
      </svg>
    ),
  },
  optum: {
    displayName: 'Optum',
    bgColor: '#FF5A00',
    textColor: '#FFFFFF',
    accentColor: '#FF5A00',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  swiggy: {
    displayName: 'Swiggy',
    bgColor: '#FC8019',
    textColor: '#FFFFFF',
    accentColor: '#FC8019',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 10.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 5.5 12 5.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
      </svg>
    ),
  },
  zomato: {
    displayName: 'Zomato',
    bgColor: '#CB202D',
    textColor: '#FFFFFF',
    accentColor: '#CB202D',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  uber: {
    displayName: 'Uber',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    accentColor: '#000000',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <rect x="8" y="8" width="8" height="8" fill="#FFFFFF" rx="2" />
      </svg>
    ),
  },
  oracle: {
    displayName: 'Oracle',
    bgColor: '#C74634',
    textColor: '#FFFFFF',
    accentColor: '#C74634',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="6" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    ),
  },
  razorpay: {
    displayName: 'Razorpay',
    bgColor: '#0C2340',
    textColor: '#3395FF',
    accentColor: '#3395FF',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 20L14 4h4l-7 16H4zM11 4h5l4 6-5 2-4-8z" />
      </svg>
    ),
  },
  ibm: {
    displayName: 'IBM',
    bgColor: '#0F62FE',
    textColor: '#FFFFFF',
    accentColor: '#0F62FE',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5h4v2H3zm0 4h4v2H3zm0 4h4v2H3zm0 4h4v2H3zm7-12h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4zm7-12h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4z" />
      </svg>
    ),
  },
  infosys: {
    displayName: 'Infosys',
    bgColor: '#007CC3',
    textColor: '#FFFFFF',
    accentColor: '#007CC3',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <text x="12" y="16" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">
          inf
        </text>
      </svg>
    ),
  },
  tcs: {
    displayName: 'TCS',
    bgColor: '#0070AD',
    textColor: '#FFFFFF',
    accentColor: '#0070AD',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#0070AD" />
        <text x="12" y="15" fontSize="8" fontWeight="900" textAnchor="middle" fill="#FFFFFF">
          TCS
        </text>
      </svg>
    ),
  },
  accenture: {
    displayName: 'Accenture',
    bgColor: '#A100FF',
    textColor: '#FFFFFF',
    accentColor: '#A100FF',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 19L14 12 4 5h5l10 7-10 7H4z" />
      </svg>
    ),
  },
  deloitte: {
    displayName: 'Deloitte',
    bgColor: '#000000',
    textColor: '#86BC25',
    accentColor: '#86BC25',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <text x="3" y="17" fontSize="14" fontWeight="800" fill="#FFFFFF">
          D
        </text>
        <circle cx="17" cy="15" r="2.5" fill="#86BC25" />
      </svg>
    ),
  },
  meesho: {
    displayName: 'Meesho',
    bgColor: '#873260',
    textColor: '#FFFFFF',
    accentColor: '#F43397',
    renderSvg: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" fill="#873260" />
        <text x="12" y="16" fontSize="10" fontWeight="900" textAnchor="middle" fill="#FFFFFF">
          M
        </text>
      </svg>
    ),
  },
};

export default function CompanyLogo({
  name,
  size = 18,
  showName = false,
  className = '',
}: CompanyLogoProps) {
  const normKey = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  // Look for direct match or partial keyword
  const key = Object.keys(COMPANY_DETAILS).find(
    (k) => normKey === k || normKey.includes(k) || k.includes(normKey),
  );

  const comp = key ? COMPANY_DETAILS[key] : null;

  if (comp) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold shadow-xs transition-transform hover:scale-105 ${className}`}
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          color: '#1E293B',
        }}
        title={comp.displayName}
      >
        <span
          className="inline-flex items-center justify-center rounded-sm shrink-0"
          style={{
            width: size + 4,
            height: size + 4,
            backgroundColor: comp.bgColor === '#FFFFFF' ? '#F1F5F9' : comp.bgColor,
            color: comp.textColor,
            padding: 2,
          }}
        >
          {comp.renderSvg(size)}
        </span>
        {showName && <span>{comp.displayName}</span>}
      </span>
    );
  }

  // Clean fallback badge for any other company
  const cleanName = name.trim();
  const initials = cleanName.slice(0, 2).toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 shadow-xs ${className}`}
      title={cleanName}
    >
      <span className="w-5 h-5 rounded-sm bg-blue-100 text-[#00A9FF] flex items-center justify-center text-[10px] font-bold">
        {initials}
      </span>
      {showName && <span>{cleanName}</span>}
    </span>
  );
}
