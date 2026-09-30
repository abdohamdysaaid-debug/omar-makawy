'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, GraduationCap, BookOpen, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { label: t('bottomNav.home', 'الرئيسية'), icon: Home, href: '/' },
    { label: t('bottomNav.packages', 'الباقات'), icon: Package, href: '/#packages' },
    { label: t('bottomNav.courses', 'الكورسات'), icon: GraduationCap, href: '/#courses' },
    { label: t('bottomNav.store', 'الكتب'), icon: BookOpen, href: '/#books' },
    { label: t('bottomNav.profile', 'حسابي'), icon: User, href: '/profile' },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 start-3 end-3 z-40 max-w-lg mx-auto bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 rounded-full shadow-2xl py-1.5 px-2 font-cairo transition-all">
      <div className="flex justify-between items-center h-12 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-all ${
                isActive
                  ? 'text-[#0d6e4f] dark:text-emerald-400 font-extrabold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#0d6e4f] dark:hover:text-emerald-400'
              }`}
            >
              <div className={`transition-all duration-300 ${
                isActive 
                  ? 'w-8 h-8 rounded-full bg-[#0d6e4f] text-white flex items-center justify-center shadow-md shadow-[#0d6e4f]/30' 
                  : 'p-1 text-gray-500 dark:text-gray-400'
              }`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : ''}`} />
              </div>
              <span className={`text-[10px] tracking-tight leading-tight ${isActive ? 'font-extrabold text-[#0d6e4f] dark:text-emerald-400' : 'font-semibold'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
