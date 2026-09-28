'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, BookOpen, FileText, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'الرئيسية', icon: Home, href: '/' },
    { label: 'المحاضرات', icon: PlaySquare, href: '/courses' },
    { label: 'الكتب', icon: BookOpen, href: '/bookstore' },
    { label: 'الامتحانات', icon: FileText, href: '/exams' },
    { label: 'حسابي', icon: User, href: '/profile' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 start-0 end-0 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800/80 z-40 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
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
                  : 'text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-cairo leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
