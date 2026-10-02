'use client';

import React from 'react';
import { LayoutDashboard, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { RoleBadge } from '@/components/ui/RoleBadge';

export default function StaffPlaceholderDashboardPage() {
  const { language } = useLanguage();
  const { user, role } = useStaffAuth();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {isAr ? 'بوابة الإدارة وهيئة التدريس' : 'Staff Portal'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'لوحة التحكم المركزية لمنصة مستر عمر مكاوي التعليمية'
              : 'Central management workspace for Mr. Omar Makawy Educational Platform'}
          </p>
        </div>
        {role && <RoleBadge role={role} size="md" />}
      </div>

      {/* Minimal Shell Container */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400 border border-brand-200 dark:border-brand-800 mb-4">
          <Compass className="h-7 w-7" />
        </div>

        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          {isAr
            ? `مرحباً بك، ${user?.full_name || 'مستر عمر مكاوي'}`
            : `Welcome, ${user?.full_name || 'Mr. Omar Meckawy'}`}
        </h2>

        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed mb-6">
          {isAr
            ? 'اختر قسماً من القائمة الجانبية للبدء.'
            : 'Choose a module from the navigation.'}
        </p>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {isAr
              ? 'البنية التحتية جاهزة ومحدثة'
              : 'Clean UI Foundation Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
