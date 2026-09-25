'use client';

import React from 'react';
import { Menu, Globe, Moon, Sun, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSupervisorAuth } from '@/context/SupervisorAuthContext';

interface SupervisorHeaderProps {
  onOpenMobileMenu: () => void;
}

export function SupervisorHeader({ onOpenMobileMenu }: SupervisorHeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useSupervisorAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-300 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-neutral-300">
          <ShieldAlert className="h-4 w-4 text-brand-600" />
          <span>بوابة المشرفين الأكاديميين (Scoped Supervisor Portal)</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <Globe className="h-3.5 w-3.5 text-brand-600" />
          <span className="font-semibold">{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
        </button>
      </div>
    </header>
  );
}
