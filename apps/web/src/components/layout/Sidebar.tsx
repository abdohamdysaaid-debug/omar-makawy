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
  isOpen?: boolean;
  onClose?: () => void;
}

export const navItems = [
  { label: 'الرئيسية', href: '/', icon: Home },
  { label: 'المحاضرات', href: '/courses', icon: PlaySquare },
  { label: 'الاشتراكات والباقات', href: '/subscriptions', icon: Package },
  { label: 'الكتب', href: '/bookstore', icon: BookOpen },
  { label: 'طلباتي', href: '/orders', icon: ShoppingBag },
  { label: 'الامتحانات', href: '/exams', icon: FileText },
  { label: 'المحفظة', href: '/wallet', icon: Wallet },
  { label: 'الإشعارات', href: '/notifications', icon: Bell },
  { label: 'تقدمي الدراسي', href: '/progress', icon: TrendingUp },
  { label: 'حسابي', href: '/profile', icon: User },
  { label: 'الدعم والمساعدة', href: '/support', icon: HelpCircle },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-50 flex flex-col w-64 bg-white dark:bg-[#0b0f19] border-e border-gray-100 dark:border-gray-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 dark:border-gray-800/60">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-black flex items-center justify-center text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              OM
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Omar Makawy
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                English Teacher
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 dark:bg-emerald-600/90 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800/60 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400 group-hover:text-emerald-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Teacher Card */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-gray-900/60 border border-emerald-100/50 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                مستر عمر مكاوي
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                خبير اللغة الإنجليزية
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
