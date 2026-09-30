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
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-stone-800 border border-emerald-500/30 dark:border-stone-800 text-gray-800 dark:text-gray-200 focus:outline-none shadow-xs"
    >
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      <span className="uppercase tracking-wider text-[11px] font-black">
        {language === 'ar' ? 'EN' : 'عربي'}
      </span>
    </button>
  );
}
