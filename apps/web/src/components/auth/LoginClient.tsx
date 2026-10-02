'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import PasswordInput from '@/components/auth/PasswordInput';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useLanguage();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ identifier: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = { identifier: '', password: '' };

    if (!identifier) {
      newErrors.identifier = t('auth.required', 'هذا الحقل مطلوب');
      isValid = false;
    }
    if (!password) {
      newErrors.password = t('auth.required', 'هذا الحقل مطلوب');
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        await login(identifier, password);
        const returnUrl = searchParams.get('returnUrl') || '/';
        router.push(returnUrl);
      } catch (err: any) {
        const errorMsg =
          err?.message ||
          err?.error_code ||
          t('auth.invalidCredentials', 'بيانات الدخول غير صحيحة');
        setErrors({ ...newErrors, password: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-start">
        <label className="mb-2 block font-cairo text-xs font-bold text-gray-700 dark:text-gray-300">
          {t('auth.phoneOrEmail', 'رقم الهاتف أو البريد الإلكتروني')}
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t('auth.phoneOrEmailPlaceholder', 'أدخل رقم الهاتف أو البريد الإلكتروني')}
          className={`w-full rounded-xl border px-4 py-3 bg-[#f8faf7] dark:bg-[#1f293d] text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#182234] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-cairo ${
            errors.identifier ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/80 dark:border-gray-700/80'
          }`}
          dir="auto"
        />
        {errors.identifier && <p className="mt-1 text-xs font-bold text-red-500 font-cairo">{errors.identifier}</p>}
      </div>

      <div className="text-start">
        <label className="mb-2 block font-cairo text-xs font-bold text-gray-700 dark:text-gray-300">
          {t('auth.password', 'كلمة المرور')}
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="mt-2 text-end">
          <Link href="/forgot-password" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline font-cairo">
            {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3.5 font-bold text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-70 font-cairo text-sm"
      >
        {isSubmitting ? '...' : t('auth.loginBtn', 'تسجيل الدخول')}
      </button>

      <div className="mt-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400 font-cairo">
        {t('auth.noAccount', 'ليس لديك حساب؟')}{' '}
        <Link href="/register" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          {t('auth.createAccountNow', 'إنشاء حساب جديد')}
        </Link>
      </div>
    </form>
  );
}

export default function LoginClient() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f4] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 font-cairo transition-colors duration-300">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111827] p-8 sm:p-10 border border-stone-200/90 dark:border-gray-800/90 shadow-md transition-colors">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-black text-emerald-600 dark:text-emerald-400 font-cairo">{t('teacher.title', 'Mr. Omar Meckawy')}</h1>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-cairo">{t('auth.loginTitle', 'تسجيل الدخول')}</h2>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
