'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, CheckCircle2, KeyRound, MessageSquare } from 'lucide-react';

export default function ForgotPasswordClient() {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError(t('auth.required', 'هذا الحقل مطلوب'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

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
              إعادة تعيين كلمة المرور
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
              أدخل رقم هاتفك أو بريدك الإلكتروني وسيتم إرسال رابط إعادة التعيين
            </p>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                تم إرسال الطلب بنجاح!
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs">
                تم إرسال تعليمات استعادة كلمة المرور إلى ({identifier}). يرجى فحص الرسائل أو التواصل مع الدعم للتعليمات المباشرة.
              </p>

              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>التواصل المباشر مع الدعم عبر واتساب</span>
              </a>

              <Link
                href="/login"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
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
                    error ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/80 dark:border-gray-700/80'
                  }`}
                  dir="auto"
                />
                {error && <p className="mt-1 text-xs font-bold text-red-500 font-cairo">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3.5 font-bold text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-70 font-cairo text-sm flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال رابط التعين'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="mt-4 text-center text-xs font-medium text-gray-600 dark:text-gray-400 font-cairo flex items-center justify-center gap-2">
                <span>تذكرت كلمة المرور؟</span>
                <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
