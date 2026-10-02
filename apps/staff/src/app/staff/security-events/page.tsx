'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StaffSecurityEventsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {isAr ? 'أحداث الأمان وتنبيهات الحماية' : 'Security Events & Protection Audit'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr ? 'متابعة تنبيهات محاولات الدخول وحظر الحسابات ومخالفات الأجهزة' : 'Monitor authentication anomalies, lockout events & security alerts'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
          <Shield className="h-7 w-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {isAr ? 'سجل أحداث الحماية والأمان' : 'Security Events Audit'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            {isAr
              ? 'متابعة سجل حظر الحسابات وتخطي الحدود القصوى للأجهزة.'
              : 'Audit log detailing device limits and brute-force protection triggers.'}
          </p>
        </div>
      </div>
    </div>
  );
}
