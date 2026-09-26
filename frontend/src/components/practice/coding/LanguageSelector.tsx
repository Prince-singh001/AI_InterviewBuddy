import { languageList } from '@/data/coding/starterCodes';
import { SupportedLanguage } from '@/types/coding';
import { ChevronDown, Code2 } from 'lucide-react';
import React from 'react';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export default function LanguageSelector({
  selectedLanguage,
  onSelectLanguage,
}: LanguageSelectorProps) {
  const current =
    languageList.find((l) => l.id === selectedLanguage) || languageList[0];

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#90CAF9] shadow-xs hover:border-[#2196F3] transition-colors">
        <Code2 size={15} className="text-[#2196F3] shrink-0" />
        <select
          value={selectedLanguage}
          onChange={(e) =>
            onSelectLanguage(e.target.value as SupportedLanguage)
          }
          className="appearance-none bg-transparent pr-6 text-xs sm:text-sm font-bold text-[#0D47A1] focus:outline-hidden cursor-pointer"
          aria-label="Select Programming Language"
        >
          {languageList.map((lang) => (
            <option
              key={lang.id}
              value={lang.id}
              className="bg-white text-slate-800"
            >
              {lang.name} ({lang.version})
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
