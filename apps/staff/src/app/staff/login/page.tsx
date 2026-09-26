'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Lock,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { TwoFactorChallengeResponse } from '@omar-makawy/shared';

export default function StaffLoginPage() {
  const { t, language, dir } = useLanguage();
  const { login, verifyTwoFactor, isAuthenticated } = useStaffAuth();
  const router = useRouter();

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA Challenge State
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallengeResponse | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const isAr = language === 'ar';
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/staff/dashboard');
    }
  }, [isAuthenticated, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || !password) {
      setErrorMessage(
        isAr ? 'يرجى إدخال رقم الهاتف وكلمة المرور' : 'Please enter phone number and password'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanPhone, password);

      if ('two_factor_required' in res && res.two_factor_required) {
        setTwoFactorChallenge(res);
        setIsLoading(false);
        return;
      }

      router.push('/staff/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err.message ||
          (isAr
            ? 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات والمحاولة مجدداً.'
            : 'Login failed. Please verify credentials and try again.')
      );
    }
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!twoFactorChallenge || !twoFactorCode.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyTwoFactor(twoFactorChallenge.challenge_token, twoFactorCode.trim());
      router.push('/staff/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err.message ||
          (isAr
            ? 'رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى المحاولة مرة أخرى.'
            : 'Invalid or expired 2FA code.')
      );
    }
  };

  return (
    <main
      dir={dir}
      className="min-h-screen w-full bg-[#f4f7f5] dark:bg-[#0c1311] flex flex-col lg:flex-row items-stretch overflow-x-hidden font-cairo transition-colors duration-300"
    >
      {/* Visual / Photo Area (Desktop: 55% Left Panel | Mobile: Top 32vh Banner) */}
      <section className="relative w-full lg:w-[55%] h-[32vh] sm:h-[38vh] lg:h-auto lg:min-h-screen flex-shrink-0 overflow-hidden bg-neutral-900">
        <Image
          src="/images/mr-omar-hero.jpg"
          alt="Mr. Omar Makawy - English Platform"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-top lg:object-center select-none"
        />

        {/* Soft atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 lg:bg-gradient-to-r lg:from-transparent lg:to-black/30 pointer-events-none" />

        {/* Floating subtle mobile badge */}
        <div className="absolute top-4 start-4 lg:hidden z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-lg">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#064e3b] text-white font-bold text-xs">
              OM
            </span>
            <span className="text-xs font-bold tracking-tight">
              {isAr ? 'منصة مستر عمر مكاوي' : 'Mr. Omar Makawy'}
            </span>
          </div>
        </div>
      </section>

      {/* Right / Login Form Area (Desktop: 45% Right Panel | Mobile: Scrollable Bottom Section) */}
      <section className="relative w-full lg:w-[45%] flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16 overflow-hidden">
        {/* Soft Organic Background Accents (Light Emerald/Mint) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 rounded-full bg-emerald-200/35 dark:bg-emerald-950/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-300/25 dark:bg-emerald-900/15 blur-3xl"
        />

        {/* Decorative corner curve for authentic reference feel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 start-0 w-32 h-32 opacity-40 dark:opacity-10 overflow-hidden"
        >
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-100 to-transparent -translate-x-16 -translate-y-16" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 start-0 w-36 h-36 opacity-40 dark:opacity-10 overflow-hidden"
        >
          <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-emerald-100 to-transparent -translate-x-20 translate-y-20" />
        </div>

        {/* Main Authentication Card */}
        <div className="relative z-10 w-full max-w-md mx-auto rounded-3xl bg-white/95 dark:bg-[#141d1a]/95 backdrop-blur-md border border-neutral-200/80 dark:border-emerald-950/60 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 p-6 sm:p-9 transition-all">
          {/* Brand Logo Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#064e3b] dark:bg-[#065f46] text-white font-black text-2xl shadow-md shadow-emerald-950/20 mb-3.5 select-none">
              OM
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {twoFactorChallenge ? t('auth.2fa_title') : t('auth.login_title')}
            </h1>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
              {twoFactorChallenge ? t('auth.2fa_desc') : t('auth.login_subtitle')}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 dark:border-rose-900/50 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Regular Login Form */}
          {!twoFactorChallenge ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Phone Field */}
              <div>
                <label
                  htmlFor="staff-phone"
                  className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start"
                >
                  {t('auth.phone_label')}
                </label>
                <div className="relative rounded-xl">
                  <input
                    id="staff-phone"
                    name="phone"
                    type="tel"
                    dir={dir === 'rtl' ? 'rtl' : 'ltr'}
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('auth.phone_placeholder')}
                    className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-[#1a2522] py-3 px-4 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-[#064e3b] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 dark:focus:ring-emerald-500/20 transition-all text-start"
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-neutral-400">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="staff-password"
                  className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start"
                >
                  {t('auth.password_label')}
                </label>
                <div className="relative rounded-xl">
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    dir={dir === 'rtl' ? 'rtl' : 'ltr'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password_placeholder')}
                    className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-[#1a2522] py-3 px-4 ps-11 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-[#064e3b] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 dark:focus:ring-emerald-500/20 transition-all text-start"
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#064e3b] hover:bg-[#053d2e] dark:bg-[#065f46] dark:hover:bg-[#077054] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-950/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#064e3b]/50 disabled:opacity-60 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isLoading ? t('auth.logging_in') : t('auth.login_button')}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Inline 2FA TOTP Challenge */
            <form onSubmit={handleTwoFactorVerify} className="space-y-4">
              <div>
                <label
                  htmlFor="staff-2fa-code"
                  className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start"
                >
                  {t('auth.2fa_code')}
                </label>
                <div className="relative rounded-xl">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-neutral-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="staff-2fa-code"
                    type="text"
                    dir="ltr"
                    required
                    maxLength={6}
                    autoFocus
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-[#1a2522] py-3 ps-11 pe-4 text-center text-lg tracking-widest font-mono font-bold text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 focus:border-[#064e3b] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 dark:focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorChallenge(null);
                    setTwoFactorCode('');
                    setErrorMessage(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a2522] px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <BackArrow className="h-3.5 w-3.5" />
                  <span>{t('common.back')}</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length < 6}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#064e3b] hover:bg-[#053d2e] dark:bg-[#065f46] dark:hover:bg-[#077054] px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-colors"
                >
                  <span>{isLoading ? t('common.loading') : t('auth.2fa_verify')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Secure Platform Footer Note */}
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>{isAr ? 'نظام تشفير موحد للكادر الإداري' : 'Encrypted Administrative Session'}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
