'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, X } from 'lucide-react';

export default function AuthenticationGate() {
  const { showAuthGate, closeAuthGate, returnUrl } = useAuth();

  if (!showAuthGate) return null;

  const loginUrl = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login';
  const registerUrl = returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-dark sm:p-8 animate-slide-up">
        <button
          onClick={closeAuthGate}
          className="absolute end-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="إغلاق"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 dark:bg-brand-400/10 dark:text-brand-400">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white font-cairo">
            سجل دخولك للوصول إلى المحتوى
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-cairo">
            سجل دخولك أو أنشئ حسابًا للوصول إلى الكورس
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href={loginUrl}
            onClick={closeAuthGate}
            className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 font-bold text-white transition-colors hover:bg-brand-600 font-cairo"
          >
            تسجيل الدخول
          </Link>
          <Link
            href={registerUrl}
            onClick={closeAuthGate}
            className="flex w-full items-center justify-center rounded-lg border-2 border-brand-500 px-4 py-3 font-bold text-brand-500 transition-colors hover:bg-brand-500/10 font-cairo"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
    </div>
  );
}
