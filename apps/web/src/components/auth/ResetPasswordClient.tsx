'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatched = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);

  const isFormValid = hasMinLength && hasLetter && hasNumber && isMatched;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('رابط إعادة تعيين كلمة المرور غير صالح أو مفقود. يرجى طلب رابط جديد من الإدارة.');
      return;
    }

    if (!isFormValid) {
      if (!hasMinLength) {
        setError('كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.');
      } else if (!isMatched) {
        setError('كلمتا المرور غير متطابقتين.');
      } else {
        setError('يرجى التأكد من استيفاء كافة شروط كلمة المرور.');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } catch (err: any) {
      let msg =
        err?.message ||
        err?.details?.message ||
        'الرابط غير صالح أو انتهت صلاحيته (صلاحية الرابط 15 دقيقة) أو تم استخدامه مسبقاً. يرجى طلب رابط جديد.';
      if (err?.error_code === 'INVALID_RESET_TOKEN') {
        msg =
          'الرابط غير صالح أو انتهت مدة صلاحيته (15 دقيقة) أو تم استخدامه من قبل. يرجى التواصل مع الإدارة لإنشاء رابط جديد.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-cairo">
          رابط غير صالح
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed font-semibold">
          لم يتم العثور على رمز التحقق في الرابط. يرجى التأكد من فتح الرابط بالكامل كما أرسلته لك إدارة المنصة.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md mt-2"
        >
          <span>الذهاب لتسجيل الدخول</span>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-600/20">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 dark:text-white font-cairo">
            تم تغيير كلمة المرور بنجاح!
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs leading-relaxed font-semibold">
            تم تحديث كلمة المرور وتأمين حسابك بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
          </p>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 pt-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            جاري تحويلك تلقائياً لصفحة تسجيل الدخول...
          </p>
        </div>

        <div className="pt-2 w-full">
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all font-cairo"
          >
            <span>تسجيل الدخول الآن</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* New Password */}
      <div className="text-start">
        <label className="mb-1.5 block font-cairo text-xs font-bold text-gray-700 dark:text-gray-300">
          كلمة المرور الجديدة *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setIsPasswordFocused(true)}
            placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
            className="w-full rounded-xl border border-stone-300/80 dark:border-gray-700/80 bg-[#f8faf7] dark:bg-[#1f293d] py-3 ps-4 pe-11 text-xs font-semibold text-gray-900 dark:text-white placeholder-stone-400 focus:outline-none focus:bg-white dark:focus:bg-[#182234] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-cairo"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Password Requirements Checklist */}
      {(isPasswordFocused || newPassword.length > 0) && (
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1.5 text-[11px] font-semibold text-start">
          <div
            className={`flex items-center gap-1.5 ${
              hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'stroke-[3]' : 'opacity-30'}`} />
            <span>8 أحرف على الأقل</span>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${hasLetter ? 'stroke-[3]' : 'opacity-30'}`} />
            <span>تحتوي على حروف</span>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${hasNumber ? 'stroke-[3]' : 'opacity-30'}`} />
            <span>تحتوي على أرقام</span>
          </div>
        </div>
      )}

      {/* Confirm New Password */}
      <div className="text-start">
        <label className="mb-1.5 block font-cairo text-xs font-bold text-gray-700 dark:text-gray-300">
          تأكيد كلمة المرور الجديدة *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="أعد إدخال كلمة المرور للتأكيد"
            className={`w-full rounded-xl border py-3 ps-4 pe-11 text-xs font-semibold text-gray-900 dark:text-white placeholder-stone-400 focus:outline-none focus:bg-white dark:focus:bg-[#182234] focus:ring-2 transition-all font-cairo ${
              confirmPassword && !isMatched
                ? 'border-rose-500 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-stone-300/80 dark:border-gray-700/80 bg-[#f8faf7] dark:bg-[#1f293d] focus:ring-emerald-500/20 focus:border-emerald-600'
            }`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && !isMatched && (
          <p className="mt-1 text-[11px] font-bold text-rose-500">كلمة المرور غير متطابقة</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword}
        className="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3.5 font-bold text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed font-cairo text-xs flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري حفظ كلمة المرور...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>تحديث كلمة المرور والدخول</span>
          </>
        )}
      </button>

      <div className="mt-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 font-cairo">
        تذكرت كلمة المرور؟{' '}
        <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          تسجيل الدخول
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordClient() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f4] dark:bg-black text-gray-900 dark:text-stone-100 font-cairo transition-colors duration-300">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111827] p-8 sm:p-10 border border-stone-200/90 dark:border-gray-800/90 shadow-md transition-colors">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/50 dark:border-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="mb-1 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-cairo">
              {t('teacher.title', 'Mr. Omar Meckawy')}
            </h1>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white font-cairo">
              إنشاء كلمة مرور جديدة
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
              أدخل كلمة المرور الجديدة لحسابك لتتمكن من تسجيل الدخول
            </p>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
