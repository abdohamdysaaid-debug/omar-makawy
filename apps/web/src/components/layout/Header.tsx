'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { academicYears } from '@/data/mock';

interface HeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggleMobile?: () => void;
  unreadNotificationsCount?: number;
}

export default function Header({
  isCollapsed = false,
  onToggleCollapse,
  onToggleMobile,
  unreadNotificationsCount = 0,
}: HeaderProps) {
  const { isAuthenticated, student, logout } = useAuth();
  const { t } = useLanguage();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const academicYearObj = student
    ? academicYears.find((ay) => ay.id === student.academicYearId)
    : null;
  const academicYearName = student?.academicYearName || academicYearObj?.title || 'طالب';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-12 sm:h-14 bg-white/80 dark:bg-black/90 backdrop-blur-md border-b border-stone-200/50 dark:border-stone-800 shadow-xs transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Menu Toggle Buttons & Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Drawer Toggle */}
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="قائمة التصفح"
            title="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800/80 hover:text-emerald-600 transition-colors"
            aria-label="طي/فتح القائمة الجانبية"
            title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isCollapsed ? (
              <PanelRightOpen className="w-5 h-5" />
            ) : (
              <PanelRightClose className="w-5 h-5" />
            )}
          </button>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder', 'ابحث عن محاضرة أو كورس...')}
              className="w-full h-11 ps-11 pe-4 text-sm bg-gray-50 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute start-4 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Right Side: Theme toggle, Notifications, Student Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageToggle />
          <ThemeToggle />

          {/* Notifications Icon Button */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[18px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </Link>

          {/* Student Profile Widget */}
          {isAuthenticated && student ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 p-1.5 pe-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    student.fullName.charAt(0)
                  )}
                </div>

                <div className="hidden md:flex flex-col text-start">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {student.fullName}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {academicYearName}
                  </span>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{student.fullName}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{academicYearName}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{student.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    {t('nav.profile', 'الملف الشخصي')}
                  </Link>
                  <Link
                    href="/wallet"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {t('nav.wallet', 'المحفظة')}: {student.walletBalance ?? 0} {t('ui.currency', 'ج.م')}
                    </span>
                  </Link>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-start"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout', 'تسجيل الخروج')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              {t('nav.login', 'تسجيل الدخول')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
