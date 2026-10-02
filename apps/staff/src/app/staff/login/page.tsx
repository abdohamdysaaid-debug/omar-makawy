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
      router.replace('/staff');
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

      router.push('/staff');
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
      router.push('/staff');
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
      className="relative min-h-screen w-full bg-[#0a1813] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden font-cairo select-none"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/mr-omar-study-bg.jpg"
          alt="Mr. Omar Makawy - English Platform"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.88] sm:brightness-[0.92] lg:brightness-95 contrast-[1.05]"
        />

        {/* Ambient Dark & Emerald Glass Overlay for optimal contrast and centered card focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Centered Login Card Section */}
      <section className="relative z-10 w-full flex justify-center items-center my-auto">
        <div className="relative w-full max-w-[450px] sm:max-w-[480px] rounded-3xl sm:rounded-[2.5rem] bg-white/95 dark:bg-[#121c18]/95 backdrop-blur-xl border border-white/80 dark:border-emerald-950/60 shadow-2xl shadow-black/50 p-6 sm:p-8 lg:p-10 transition-all overflow-hidden">
          {/* Subtle Organic Mint Watermark in Card Corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -start-12 w-44 h-44 rounded-full bg-emerald-100/60 dark:bg-emerald-900/15 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -end-12 w-36 h-36 rounded-full bg-emerald-100/50 dark:bg-emerald-900/10 blur-xl"
          />

          {/* Decorative Corner Wave Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 start-0 w-32 h-32 opacity-25 dark:opacity-10 overflow-hidden"
          >
            <div className="w-48 h-48 rounded-full border-[18px] border-emerald-300 dark:border-emerald-700 -translate-x-16 translate-y-16" />
          </div>

          {/* Card Header & Brand Logo */}
          <div className="relative z-10 flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#043e2e] dark:bg-[#064e3b] text-white font-black text-2xl shadow-lg shadow-emerald-950/30 mb-3.5 select-none tracking-tight">
              OM
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
              {twoFactorChallenge ? t('auth.2fa_title') : (isAr ? 'تسجيل دخول الإدارة والمعلمين' : 'Staff & Teacher Portal')}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
              {twoFactorChallenge ? t('auth.2fa_desc') : (isAr ? 'منصة عمر مكاوي التعليمية للغة الإنجليزية' : 'Mr. Omar Makawy English Educational Platform')}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="relative z-10 mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/95 dark:border-rose-900/50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Primary Form / 2FA Form */}
          <div className="relative z-10">
            {!twoFactorChallenge ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4 sm:space-y-5">
                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="staff-phone"
                    className="block text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start"
                  >
                    {isAr ? 'رقم الهاتف المسجل' : t('auth.phone_label')}
                  </label>
                  <div className="relative rounded-2xl">
                    <input
                      id="staff-phone"
                      name="phone"
                      type="tel"
                      dir={dir === 'rtl' ? 'rtl' : 'ltr'}
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isAr ? 'أدخل رقم الهاتف المسجل' : t('auth.phone_placeholder')}
                      className="block w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-[#1a2522] py-3.5 px-4 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-[#043e2e] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-[#043e2e]/20 dark:focus:ring-emerald-500/20 transition-all text-start"
                    />
                    <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-neutral-400">
                      <Phone className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="staff-password"
                    className="block text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start"
                  >
                    {isAr ? 'كلمة المرور' : t('auth.password_label')}
                  </label>
                  <div className="relative rounded-2xl">
                    <input
                      id="staff-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      dir={dir === 'rtl' ? 'rtl' : 'ltr'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isAr ? 'أدخل كلمة المرور' : t('auth.password_placeholder')}
                      className="block w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-[#1a2522] py-3.5 px-4 ps-11 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-[#043e2e] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-[#043e2e]/20 dark:focus:ring-emerald-500/20 transition-all text-start"
                    />
                    <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-neutral-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 start-0 flex items-center ps-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
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
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#043e2e] hover:bg-[#032e22] dark:bg-[#064e3b] dark:hover:bg-[#053d2e] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/25 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#043e2e]/50 disabled:opacity-60 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span>{isLoading ? (isAr ? 'جاري تسجيل الدخول...' : t('auth.logging_in')) : (isAr ? 'تسجيل الدخول إلى لوحة التحكم' : t('auth.login_button'))}</span>
                    <LogIn className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Inline 2FA TOTP Challenge */
              <form onSubmit={handleTwoFactorVerify} className="space-y-4 sm:space-y-5">
                <div>
                  <label
                    htmlFor="staff-2fa-code"
                    className="block text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start"
                  >
                    {t('auth.2fa_code')}
                  </label>
                  <div className="relative rounded-2xl">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-neutral-400">
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
                      className="block w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-[#1a2522] py-3.5 ps-12 pe-4 text-center text-lg tracking-widest font-mono font-bold text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 focus:border-[#043e2e] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-[#043e2e]/20 dark:focus:ring-emerald-500/20 transition-all"
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
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a2522] px-4 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <BackArrow className="h-3.5 w-3.5" />
                    <span>{t('common.back')}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || twoFactorCode.length < 6}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#043e2e] hover:bg-[#032e22] dark:bg-[#064e3b] dark:hover:bg-[#053d2e] px-4 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/25 disabled:opacity-50 transition-colors"
                  >
                    <span>{isLoading ? t('common.loading') : t('auth.2fa_verify')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Secure Platform Footer Note */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>{isAr ? 'نظام تشفير موحد لإدارة منصة مستر عمر مكاوي' : 'Encrypted Administrative Session'}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
