'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Home,
  PlaySquare,
  Package,
  BookOpen,
  ShoppingBag,
  FileText,
  Wallet,
  Bell,
  TrendingUp,
  User,
  HelpCircle,
  X,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const navItems = [
  { labelKey: 'nav.home', label: 'الرئيسية', href: '/student', aliases: ['/', '/student'], icon: Home },
  { labelKey: 'nav.myLectures', label: 'المحاضرات', href: '/student/courses', aliases: ['/courses', '/student/courses'], icon: PlaySquare },
  { labelKey: 'nav.subscriptions', label: 'الاشتراكات والباقات', href: '/student/subscriptions', aliases: ['/subscriptions', '/student/subscriptions'], icon: Package },
  { labelKey: 'nav.books', label: 'الكتب', href: '/student/books', aliases: ['/bookstore', '/student/books'], icon: BookOpen },
  { labelKey: 'nav.orders', label: 'طلباتي', href: '/student/orders', aliases: ['/orders', '/student/orders'], icon: ShoppingBag },
  { labelKey: 'nav.exams', label: 'الامتحانات', href: '/student/exams', aliases: ['/exams', '/student/exams'], icon: FileText },
  { labelKey: 'nav.wallet', label: 'المحفظة', href: '/student/wallet', aliases: ['/wallet', '/student/wallet'], icon: Wallet },
  { labelKey: 'nav.notifications', label: 'الإشعارات', href: '/student/notifications', aliases: ['/notifications', '/student/notifications'], icon: Bell },
  { labelKey: 'nav.progress', label: 'تقدمي الدراسي', href: '/student/progress', aliases: ['/progress', '/student/progress'], icon: TrendingUp },
  { labelKey: 'nav.profile', label: 'حسابي', href: '/student/profile', aliases: ['/profile', '/student/profile'], icon: User },
  { labelKey: 'nav.support', label: 'الدعم والمساعدة', href: '/student/support', aliases: ['/support', '/student/support'], icon: HelpCircle },
];

export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Lock body scroll and handle Escape key on mobile drawer open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onCloseMobile) onCloseMobile();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
        role="presentation"
      />

      {/* Persistent Collapsible Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#064e3b] dark:bg-[#0b0f19] border-e border-emerald-800/60 dark:border-gray-800/80 shadow-2xl transition-transform duration-300 ease-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full lg:translate-x-0'
        }`}
        role="dialog"
        aria-modal={isMobileOpen}
        aria-label="Sidebar Menu"
      >
        {/* Brand Header */}
        <div className={`flex items-center h-20 border-b border-emerald-800/60 dark:border-gray-800/60 ${
          isCollapsed ? 'px-3 justify-center' : 'px-6 justify-between'
        }`}>
          <Link href="/student" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-950 font-black flex items-center justify-center text-lg shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform shrink-0">
              OM
            </div>
            <div className={`flex flex-col transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
              <span className="text-base font-bold text-white dark:text-white leading-tight">
                Omar Makawy
              </span>
              <span className="text-[11px] font-semibold text-emerald-200 dark:text-emerald-400">
                English Teacher
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.aliases.some((alias) =>
              alias === '/' || alias === '/student'
                ? pathname === '/' || pathname === '/student'
                : pathname === alias || pathname.startsWith(alias)
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`relative group flex items-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                } ${
                  isActive
                    ? 'bg-emerald-700/90 dark:bg-emerald-600/90 text-white font-extrabold shadow-md shadow-emerald-950/40 border-s-4 border-emerald-300 dark:border-emerald-400'
                    : 'text-emerald-100/90 dark:text-gray-300 hover:bg-emerald-800/70 dark:hover:bg-gray-800/60 hover:text-white dark:hover:text-emerald-400'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-200/80 dark:text-gray-400 group-hover:text-white dark:group-hover:text-emerald-400'}`} />

                <span className={`truncate transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
                  {t(item.labelKey, item.label)}
                </span>

                {/* Floating Tooltip on Desktop when Collapsed */}
                {isCollapsed && (
                  <div className="hidden lg:block pointer-events-none absolute start-full ms-2 px-3 py-1.5 bg-emerald-950 dark:bg-gray-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50 border border-emerald-800/60 dark:border-gray-700">
                    {t(item.labelKey, item.label)}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Teacher Card */}
        <div className="p-3 border-t border-emerald-800/60 dark:border-gray-800/60">
          <div className={`flex items-center rounded-xl bg-emerald-950/60 dark:bg-gray-900/60 border border-emerald-800/50 dark:border-gray-800 ${
            isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'
          }`}>
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className={`flex flex-col min-w-0 ${isCollapsed ? 'hidden' : 'block'}`}>
              <span className="text-xs font-bold text-white dark:text-white truncate">
                {t('teacher.title', 'Mr. Omar Meckawy')}
              </span>
              <span className="text-[10px] text-emerald-200/80 dark:text-gray-400 truncate">
                {t('teacher.expertTitle', 'خبير تدريس اللغة الإنجليزية')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
