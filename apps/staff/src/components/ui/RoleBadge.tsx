'use client';

import React from 'react';
import { Shield, UserCheck } from 'lucide-react';
import { UserRole } from '@omar-makawy/shared';
import { useLanguage } from '@/context/LanguageContext';

interface RoleBadgeProps {
  role: UserRole | string;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  if (role === 'TEACHER') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/60 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : size === 'lg'
            ? 'px-3.5 py-1 text-sm'
            : 'px-2.5 py-0.5 text-xs'
        }`}
      >
        <Shield className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        <span>{isAr ? 'المعلم / الإدارة العامة' : 'Teacher / Super Admin'}</span>
      </span>
    );
  }

  if (role === 'SUPERVISOR') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-emerald-50/80 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : size === 'lg'
            ? 'px-3.5 py-1 text-sm'
            : 'px-2.5 py-0.5 text-xs'
        }`}
      >
        <UserCheck className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        <span>{isAr ? 'مشرف أكاديمي' : 'Academic Supervisor'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {role}
    </span>
  );
}
