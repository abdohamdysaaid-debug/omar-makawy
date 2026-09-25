'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getOrCreateDeviceUuid } from '@/lib/api/client';
import { TwoFactorChallengeResponse } from '@/lib/api/types';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const { login, verifyTwoFactor, isAuthenticated, user } = useAdminAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('01000000001');
  const [password, setPassword] = useState('Teacher123456!');
  const [showPassword, setShowPassword] = useState(false);
  const [deviceUuid, setDeviceUuid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA Challenge State
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallengeResponse | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    setDeviceUuid(getOrCreateDeviceUuid());
    if (isAuthenticated && user?.role === 'TEACHER') {
      router.replace('/admin');
    } else if (isAuthenticated && user?.role === 'SUPERVISOR') {
      router.replace('/supervisor');
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Egyptian phone validation
    const cleanPhone = phone.trim();
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 ومكون من 11 رقماً');
      return;
    }

    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({
        phone: cleanPhone,
        password,
      });

      if ('two_factor_required' in res && res.two_factor_required) {
        setTwoFactorChallenge(res as TwoFactorChallengeResponse);
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push('/admin');
    } catch (err: any) {
      setIsLoading(false);
      if (err.error_code === 'ACCOUNT_LOCKED_BRUTE_FORCE') {
        setErrorMessage('الحساب مقفل مؤقتاً بسبب تكرار المحاولات غير الصحيحة. يرجى الانتظار 15 دقيقة.');
      } else if (err.error_code === 'INVALID_CREDENTIALS') {
        setErrorMessage('رقم الهاتف أو كلمة المرور غير صحيحة');
      } else if (err.error_code === 'INSUFFICIENT_PERMISSIONS') {
        setErrorMessage('هذا الحساب لا يملك صلاحيات الوصول إلى لوحة الإدارة');
      } else {
        setErrorMessage(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى التأكد من تشغيل الخادم والاتصال.');
      }
    }
  };

  const handleVerify2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorChallenge || !twoFactorCode.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await verifyTwoFactor(twoFactorChallenge.challenge_token, twoFactorCode.trim());
      router.push('/admin');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'رمز التحقق الثنائي غير صحيح أو منتهي الصلاحية');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-black text-2xl shadow-md mb-4">
          OM
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-50">
          {t('auth.login_title')}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
          {t('auth.login_subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {!twoFactorChallenge ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
                  {t('auth.phone_label')}
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
                    placeholder="01000000001"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
                  {t('auth.password_label')}
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
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-10 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isLoading ? t('auth.logging_in') : t('auth.login_button')}</span>
                </button>
              </div>

              {/* Dev Credentials Notice */}
              <div className="mt-4 rounded-lg bg-gray-50 p-3 border border-gray-100 text-[11px] text-gray-600 dark:bg-neutral-800/60 dark:border-neutral-800 dark:text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-neutral-200">
                  <HelpCircle className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                  <span>حساب المعلم الرئيسي المعتمد للتطوير:</span>
                </div>
                <p dir="ltr" className="font-mono text-[10px] text-gray-700 dark:text-neutral-300">
                  Phone: <strong>01000000001</strong> | Password: <strong>Teacher123456!</strong>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2Fa} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 mb-1">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                  {t('auth.2fa_title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {t('auth.2fa_desc')}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  dir="ltr"
                  maxLength={6}
                  required
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  className="block w-full text-center tracking-widest font-mono text-xl rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTwoFactorChallenge(null)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length < 6}
                  className="flex-1 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                >
                  {isLoading ? t('common.loading') : t('auth.2fa_verify')}
                </button>
              </div>
            </form>
          )}

          {/* Persistent Device UUID footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800 text-center">
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">
              {t('auth.device_id')} {deviceUuid || '00000000-0000-0000-0000-000000000001'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
