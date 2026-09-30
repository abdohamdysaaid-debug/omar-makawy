'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle language"
      title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 hover:bg-[#d5e5da] dark:hover:bg-stone-700 border border-[#c5dbc9] dark:border-stone-700 focus:outline-none shadow-xs shrink-0"
    >
      <span className="uppercase tracking-wider text-[11px] font-black">
        {language === 'ar' ? 'EN' : 'عربي'}
      </span>
      <Globe className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
    </button>
  );
}
