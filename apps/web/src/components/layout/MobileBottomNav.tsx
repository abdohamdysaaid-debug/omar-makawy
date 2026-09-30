'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, BookOpen, FileText, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Only render Mobile Bottom Navigation when student is logged in
  if (!isAuthenticated) return null;

  const navItems = [
    { label: 'الرئيسية', icon: Home, href: '/' },
    { label: 'المحاضرات', icon: PlaySquare, href: '/courses' },
    { label: 'الكتب', icon: BookOpen, href: '/bookstore' },
    { label: 'الامتحانات', icon: FileText, href: '/exams' },
    { label: 'حسابي', icon: User, href: '/profile' },
  ];

  return (
    <div className="lg:hidden fixed bottom-2.5 start-3 end-3 z-40 max-w-md mx-auto bg-white/85 dark:bg-[#061812]/85 backdrop-blur-md border border-gray-200/60 dark:border-emerald-500/25 rounded-[22px] shadow-xl shadow-black/20 py-1.5 px-2 font-cairo transition-all">
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
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'scale-105' : ''} transition-transform`} />
              </div>
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
