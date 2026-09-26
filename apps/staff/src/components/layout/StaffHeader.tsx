'use client';

import React from 'react';
import { LogOut, Globe, Moon, Sun, Menu } from 'lucide-react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { RoleBadge } from '../ui/RoleBadge';
import { AcademicYearSelector } from './AcademicYearSelector';

interface StaffHeaderProps {
  onMenuToggle?: () => void;
}

export function StaffHeader({ onMenuToggle }: StaffHeaderProps) {
  const { user, role, logout } = useStaffAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-50 hidden sm:inline">
            {t('brand.title')}
          </span>
          {role && <RoleBadge role={role} size="sm" />}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Year Tenancy Selector */}
        <AcademicYearSelector />

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={isDark ? t('common.light_mode') : t('common.dark_mode')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-xs text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="hidden md:flex flex-col text-start">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {user?.full_name || 'Staff User'}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {user?.phone}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title={t('nav.logout')}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('nav.logout')}</span>
        </button>
      </div>
    </header>
  );
}
