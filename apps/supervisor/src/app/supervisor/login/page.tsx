'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Phone, Eye, EyeOff, ShieldAlert, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSupervisorAuth } from '@/context/SupervisorAuthContext';

export default function SupervisorLoginPage() {
  const { t } = useLanguage();
  const { login, isAuthenticated, user } = useSupervisorAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/supervisor');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || !password) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanPhone, password);
      router.push('/supervisor');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-black text-2xl shadow-md mb-4">
          OM
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-50">
          {t('auth.supervisor_login')}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
          بوابة المشرفين والمساعدين الأكاديميين المعتمدة
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
                {t('auth.phone')}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-10 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none disabled:opacity-60 transition-colors"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>{isLoading ? t('common.loading') : t('auth.login_btn')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
