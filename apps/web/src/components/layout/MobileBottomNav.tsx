'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, BookOpen, FileText, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { label: t('bottomNav.home', 'الرئيسية'), icon: Home, href: '/' },
    { label: t('bottomNav.courses', 'المحاضرات'), icon: PlaySquare, href: '/courses' },
    { label: t('bottomNav.store', 'الكتب'), icon: BookOpen, href: '/bookstore' },
    { label: t('bottomNav.exams', 'الامتحانات'), icon: FileText, href: '/exams' },
    { label: t('bottomNav.profile', 'حسابي'), icon: User, href: isAuthenticated ? '/profile' : '/login' },
  ];

  return (
    <div className="lg:hidden fixed bottom-2.5 start-3 end-3 z-40 max-w-md mx-auto bg-white/90 dark:bg-[#080808]/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 rounded-[22px] shadow-xl shadow-black/15 py-1.5 px-2 font-cairo transition-all">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 shadow-xs' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'scale-105' : ''} transition-transform`} />
              </div>
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
