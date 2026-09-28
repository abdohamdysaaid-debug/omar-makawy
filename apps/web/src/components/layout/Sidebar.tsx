'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { label: 'الرئيسية', href: '/student', aliases: ['/', '/student'], icon: Home },
  { label: 'المحاضرات', href: '/student/courses', aliases: ['/courses', '/student/courses'], icon: PlaySquare },
  { label: 'الاشتراكات والباقات', href: '/student/subscriptions', aliases: ['/subscriptions', '/student/subscriptions'], icon: Package },
  { label: 'الكتب', href: '/student/books', aliases: ['/bookstore', '/student/books'], icon: BookOpen },
  { label: 'طلباتي', href: '/student/orders', aliases: ['/orders', '/student/orders'], icon: ShoppingBag },
  { label: 'الامتحانات', href: '/student/exams', aliases: ['/exams', '/student/exams'], icon: FileText },
  { label: 'المحفظة', href: '/student/wallet', aliases: ['/wallet', '/student/wallet'], icon: Wallet },
  { label: 'الإشعارات', href: '/student/notifications', aliases: ['/notifications', '/student/notifications'], icon: Bell },
  { label: 'تقدمي الدراسي', href: '/student/progress', aliases: ['/progress', '/student/progress'], icon: TrendingUp },
  { label: 'حسابي', href: '/student/profile', aliases: ['/profile', '/student/profile'], icon: User },
  { label: 'الدعم والمساعدة', href: '/student/support', aliases: ['/support', '/student/support'], icon: HelpCircle },
];

export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent Collapsible Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-50 flex flex-col bg-[#064e3b] dark:bg-[#0b0f19] border-e border-emerald-800/60 dark:border-gray-800/80 shadow-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen
            ? 'w-64 translate-x-0'
            : 'w-64 rtl:translate-x-full ltr:-translate-x-full lg:translate-x-0 lg:rtl:translate-x-0 lg:ltr:translate-x-0'
        }`}
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
                  {item.label}
                </span>

                {/* Floating Tooltip on Desktop when Collapsed */}
                {isCollapsed && (
                  <div className="hidden lg:block pointer-events-none absolute start-full ms-2 px-3 py-1.5 bg-emerald-950 dark:bg-gray-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50 border border-emerald-800/60 dark:border-gray-700">
                    {item.label}
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
                مستر عمر مكاوي
              </span>
              <span className="text-[10px] text-emerald-200/80 dark:text-gray-400 truncate">
                خبير اللغة الإنجليزية
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
