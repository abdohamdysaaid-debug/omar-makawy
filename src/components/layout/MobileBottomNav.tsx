'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'الرئيسية', icon: Home, href: '/' },
    { label: 'الكورسات', icon: BookOpen, href: '/courses' },
    { label: 'تواصل معنا', icon: MessageCircle, href: '/contact' },
    { label: 'الملف الشخصي', icon: User, href: '/profile' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 start-0 end-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-cairo font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
