'use client';

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background-light dark:bg-background-dark font-cairo">
      <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-black text-2xl mb-4 border border-brand-200 dark:border-brand-800">
        404
      </div>
      <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
        الصفحة غير موجودة
      </h1>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
        عذراً، لم نتمكن من العثور على المسار المطلوب في بوابة الكادر التعليمي.
      </p>
      <Link
        href="/staff/dashboard"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>العودة إلى لوحة التحكم</span>
      </Link>
    </div>
  );
}
