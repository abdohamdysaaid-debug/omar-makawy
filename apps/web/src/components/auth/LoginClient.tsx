'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from '@/components/auth/PasswordInput';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ identifier: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = { identifier: '', password: '' };

    if (!identifier) {
      newErrors.identifier = 'هذا الحقل مطلوب';
      isValid = false;
    }
    if (!password) {
      newErrors.password = 'هذا الحقل مطلوب';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        login(identifier, password);
        const returnUrl = searchParams.get('returnUrl') || '/';
        router.push(returnUrl);
      } catch {
        setErrors({ ...newErrors, password: 'بيانات الدخول غير صحيحة' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block font-cairo text-sm font-bold text-gray-700 dark:text-gray-300">
          رقم الهاتف أو البريد الإلكتروني
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="أدخل رقم الهاتف أو البريد الإلكتروني"
          className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-dark dark:text-white font-cairo ${
            errors.identifier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          dir="auto"
        />
        {errors.identifier && <p className="mt-1 text-sm text-red-500 font-cairo">{errors.identifier}</p>}
      </div>

      <div>
        <label className="mb-2 block font-cairo text-sm font-bold text-gray-700 dark:text-gray-300">
          كلمة المرور
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="mt-2 text-end">
          <Link href="/forgot-password" className="text-sm font-bold text-brand-500 hover:underline font-cairo">
            نسيت كلمة المرور؟
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-3 font-bold text-white transition-colors hover:bg-brand-500/90 disabled:opacity-70 font-cairo"
      >
        {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 font-cairo">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="font-bold text-brand-500 hover:underline">
          إنشاء حساب جديد
        </Link>
      </div>
    </form>
  );
}

export default function LoginClient() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-200 dark:bg-black">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-surface-dark">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-brand-500 font-cairo">Omar Meckawy</h1>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-cairo">تسجيل الدخول</h2>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
