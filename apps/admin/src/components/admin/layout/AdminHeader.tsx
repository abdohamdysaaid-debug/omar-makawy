'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Breadcrumbs, BreadcrumbItem } from '../ui/Breadcrumbs';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminHeader({ onOpenMobileMenu, breadcrumbs }: AdminHeaderProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isTeacher } = useAdminAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-900/95 sm:px-6">
      {/* Left side (RTL Start): Menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="hidden sm:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-neutral-300">
            <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>منظومة مستر عمر مكاوي التعليمية</span>
          </div>
        )}
      </div>

      {/* Right side (RTL End): Search, Language, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Student Site Quick Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-750"
          title="معاينة بوابة الطلاب"
        >
          <span>بوابة الطلاب</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-750 transition-colors"
          title="Switch Language"
        >
          <Globe className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
          <span className="font-semibold">{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-750 transition-colors"
          title={isDark ? 'الوضع الفاتح' : 'الوضع الليلي'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
        </button>

        {/* Notifications Icon */}
        <Link
          href="/admin/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-750 transition-colors"
          title={t('nav.notifications')}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-brand-600" />
        </Link>

        {/* Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 text-start hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-750 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xs">
              {user?.full_name?.charAt(0) || 'M'}
            </div>
            <div className="hidden lg:block text-start pe-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-neutral-100 leading-none">
                {user?.full_name || 'Mr. Omar Makawy'}
              </p>
              <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
                {isTeacher ? 'المعلم الرئيسي' : 'مشرف أكاديمي'}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute end-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50 dark:border-neutral-800 dark:bg-neutral-900 animate-fade-in">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-gray-900 dark:text-neutral-100">
                    {user?.full_name || 'Mr. Omar Makawy'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                    {user?.phone || '01000000001'}
                  </p>
                </div>

                <div className="mt-1 space-y-0.5 text-xs">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
