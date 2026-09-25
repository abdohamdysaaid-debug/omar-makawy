'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PlayCircle,
  ShoppingCart,
  BarChart3,
  LogOut,
  X,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSupervisorAuth } from '@/context/SupervisorAuthContext';

interface SupervisorSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function SupervisorSidebar({ isMobileOpen, setIsMobileOpen }: SupervisorSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useSupervisorAuth();

  const navItems = [
    { key: 'nav.dashboard', href: '/supervisor', icon: LayoutDashboard },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-e border-gray-200 text-gray-800 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200">
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-neutral-800">
        <Link href="/supervisor" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-base shadow-sm">
            OM
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-neutral-50">
              بوابة المشرفين
            </span>
            <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
              منصة مستر عمر مكاوي
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-neutral-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold border-s-3 border-brand-600 dark:bg-brand-950/50 dark:text-brand-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs dark:bg-brand-950 dark:text-brand-300">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-900 dark:text-neutral-100 truncate">
                {user?.full_name || 'Supervisor'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate">
                {user?.phone || '010xxxxxxx'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title={t('nav.logout')}
            className="flex h-7 w-7 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 z-30 h-screen sticky top-0">
        {sidebarContent}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
