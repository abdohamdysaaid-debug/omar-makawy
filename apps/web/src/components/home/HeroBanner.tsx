'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroBanner() {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full overflow-hidden bg-[#f2f5ee] dark:bg-[#070c14] text-gray-900 dark:text-gray-100 pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-24 transition-colors">
      {/* Background Soft Organic Green Waves/Clouds */}
      <div className="absolute -top-20 start-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-[#d5e8da]/70 via-[#e4f1e7]/40 to-transparent dark:from-[#092e22]/50 dark:via-[#092e22]/20 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Floating Organic Green Side Waves & Leaves for Desktop (Matching Desktop Mockup) */}
      <div className="hidden lg:block absolute top-12 start-0 w-80 h-96 bg-gradient-to-r from-[#064e3b]/25 via-[#047857]/15 to-transparent rounded-r-full blur-2xl pointer-events-none -z-0" />
      <div className="hidden lg:block absolute top-12 end-0 w-80 h-96 bg-gradient-to-l from-[#064e3b]/25 via-[#047857]/15 to-transparent rounded-l-full blur-2xl pointer-events-none -z-0" />
      <div className="hidden lg:block absolute top-32 start-12 text-emerald-600/30 text-4xl animate-bounce-subtle pointer-events-none">🍃</div>
      <div className="hidden lg:block absolute top-48 end-16 text-emerald-600/30 text-4xl animate-bounce-subtle pointer-events-none">🍃</div>
      <div className="hidden lg:block absolute bottom-24 start-24 text-emerald-600/20 text-3xl pointer-events-none">🍃</div>
      <div className="hidden lg:block absolute bottom-24 end-24 text-emerald-600/20 text-3xl pointer-events-none">🍃</div>

      {/* ================================================================= */}
      {/* 1. MOBILE LAYOUT (Matching Mobile Mockup Image media_1790733496852)*/}
      {/* ================================================================= */}
      <div className="block lg:hidden max-w-xl mx-auto px-4 text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2ece1] dark:bg-emerald-950/70 border border-[#c3dac1] dark:border-emerald-800/60 text-[#093829] dark:text-emerald-300 font-extrabold text-xs shadow-2xs mb-4">
          <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t('hero.badge', 'منصة مستر عمر مكاوي التعليمية')}</span>
        </div>

        {/* Main Headline */}
        <div className="relative max-w-sm mx-auto mb-3">
          <h1 className="text-3xl font-black text-[#064e3b] dark:text-white leading-[1.2] font-cairo inline-block relative">
            {t('hero.headline', 'مستقبلك يبدأ من هنا')}
            <span className="absolute -top-1 -end-3 text-emerald-500 text-lg font-bold select-none">›</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-sm mx-auto leading-relaxed mb-6 font-medium font-cairo">
          {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي. شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.')}
        </p>

        {/* Mobile Teacher Portrait */}
        <div className="relative w-full max-w-[280px] mx-auto mb-6">
          <div className="absolute inset-0 bg-[#aed9b6]/40 dark:bg-[#064e3b]/30 rounded-[42px] transform -rotate-3 scale-95" />
          <div className="relative z-10 w-full overflow-hidden flex justify-center pt-2">
            <img
              src="/mr-omar-real.jpg"
              alt="Mr. Omar Makawy"
              className="w-full max-w-[260px] object-cover object-top rounded-t-3xl"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f2f5ee] via-[#f2f5ee]/85 to-transparent dark:from-[#070c14] dark:via-[#070c14]/85 dark:to-transparent" />
          </div>

          {/* Doodles */}
          <div className="absolute top-8 start-0 z-20 flex flex-col items-start text-start -rotate-6 select-none">
            <span className="text-[10px] font-black text-emerald-600">{"//"}</span>
            <span className="text-[11px] font-black text-[#064e3b] dark:text-emerald-300">Learn</span>
            <span className="text-[11px] font-black text-[#047857] dark:text-emerald-400">Practice</span>
            <span className="text-[11px] font-bold text-[#10b981] dark:text-emerald-500">Improve</span>
          </div>

          <div className="absolute top-10 end-0 z-20 flex flex-col items-center rotate-6 select-none">
            <span className="text-[10px] font-bold text-emerald-600">{"\\ \\ \\"}</span>
            <span className="text-xs font-black text-[#064e3b] dark:text-emerald-200">Hello!</span>
            <span className="text-[10px] font-bold text-emerald-500">{"/ / /"}</span>
          </div>
        </div>

        {/* Mobile CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <Link
            href="/courses"
            className="w-full py-3.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-md font-cairo"
          >
            <span>{t('hero.startJourney', 'ابدأ رحلتك الآن')}</span>
            <ArrowIcon className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="w-full py-3.5 bg-[#f7f9f6] dark:bg-[#121212] text-[#064e3b] dark:text-emerald-300 border-2 border-[#c3dac1] dark:border-stone-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all font-cairo"
          >
            <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('hero.studentLogin', 'تسجيل الدخول للطلاب')}</span>
          </Link>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. DESKTOP / PC LAYOUT (Matching Desktop Mockup Image media_1790733793972) */}
      {/* ================================================================= */}
      <div className="hidden lg:block max-w-6xl mx-auto px-8 text-center relative z-10">
        {/* Desktop Teacher Portrait (Centered at Top) */}
        <div className="relative w-full max-w-lg mx-auto mb-6">
          {/* Layered Rich Organic Backdrop Curves */}
          <div className="absolute inset-0 bg-[#b7e4c0]/50 dark:bg-[#064e3b]/40 rounded-[60px] transform -rotate-2 scale-95" />
          <div className="absolute inset-0 bg-[#8ed49d]/35 dark:bg-[#047857]/25 rounded-[55px] transform rotate-2 scale-90" />

          {/* Teacher Image */}
          <div className="relative z-10 w-full overflow-hidden flex justify-center pt-4">
            <img
              src="/mr-omar-real.jpg"
              alt="Mr. Omar Makawy"
              className="w-full max-w-[440px] object-cover object-top rounded-t-3xl"
            />
            {/* Soft Bottom Mask Fade */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f2f5ee] via-[#f2f5ee]/90 to-transparent dark:from-[#070c14] dark:via-[#070c14]/90 dark:to-transparent" />
          </div>

          {/* Desktop Hand-drawn Doodles Matching Desktop Mockup */}
          {/* Top Left Slashes */}
          <div className="absolute top-10 start-6 z-20 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-lg font-black select-none -rotate-12">
            <span>{"\\ \\"}</span>
          </div>

          {/* Top Right Slashes */}
          <div className="absolute top-10 end-6 z-20 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-lg font-black select-none rotate-12">
            <span>{"/ /"}</span>
          </div>

          {/* Mid Left Slash */}
          <div className="absolute top-36 start-0 z-20 flex items-center text-emerald-600 dark:text-emerald-400 text-xl font-black select-none -rotate-6">
            <span>{"//"}</span>
          </div>

          {/* Crown Doodle on Right Arm */}
          <div className="absolute top-36 end-2 z-20 flex items-center text-emerald-600 dark:text-emerald-400 text-2xl font-black select-none rotate-6">
            <span>👑</span>
          </div>
        </div>

        {/* Desktop Headline (Centered Below Photo) */}
        <div className="relative max-w-4xl mx-auto mb-4">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.2] font-cairo tracking-tight">
            مستقبلك يبدأ{" "}
            <span className="relative inline-block text-[#064e3b] dark:text-emerald-400">
              من هنا
              {/* Green Underline Stroke matching desktop mockup */}
              <svg
                className="absolute -bottom-2 start-0 w-full h-3 text-[#064e3b] dark:text-emerald-400"
                viewBox="0 0 200 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 15C50 5 150 5 195 15"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
        </div>

        {/* Desktop Subtitle */}
        <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8 font-medium font-cairo">
          {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي.')}
        </p>

        {/* Desktop CTAs */}
        <div className="flex items-center justify-center gap-5 w-full max-w-lg mx-auto">
          {/* Primary CTA */}
          <Link
            href="/courses"
            className="min-w-[220px] px-8 py-4 bg-[#064e3b] hover:bg-[#047857] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-950/20 hover:scale-[1.03] font-cairo"
          >
            <span>{t('hero.startJourney', 'ابدأ رحلتك الآن')}</span>
            <ArrowIcon className="w-5 h-5" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/login"
            className="min-w-[220px] px-8 py-4 bg-[#f7f9f6] dark:bg-[#121212] text-[#064e3b] dark:text-emerald-300 border-2 border-[#c3dac1] dark:border-stone-800 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-xs font-cairo"
          >
            <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('hero.studentLogin', 'تسجيل الدخول للطلاب')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
