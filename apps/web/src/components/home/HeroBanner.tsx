'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroBanner() {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full overflow-hidden bg-[#f2f5ee] dark:bg-[#070c14] text-gray-900 dark:text-gray-100 pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 transition-colors">
      {/* Top Background Soft Organic Green Waves/Clouds */}
      <div className="absolute -top-20 start-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#d5e8da]/70 via-[#e4f1e7]/40 to-transparent dark:from-[#092e22]/50 dark:via-[#092e22]/20 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Bottom Corner Wave Graphics Matching Mockup */}
      <div className="absolute -bottom-10 -start-16 w-64 h-64 bg-[#064e3b]/15 dark:bg-[#064e3b]/30 rounded-full blur-2xl pointer-events-none -z-0" />
      <div className="absolute -bottom-10 -end-16 w-64 h-64 bg-[#047857]/15 dark:bg-[#047857]/30 rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Badge matching mockup */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2ece1] dark:bg-emerald-950/70 border border-[#c3dac1] dark:border-emerald-800/60 text-[#093829] dark:text-emerald-300 font-extrabold text-xs sm:text-sm shadow-2xs mb-4 sm:mb-6 animate-fade-in">
          <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t('hero.badge', 'منصة مستر عمر مكاوي التعليمية')}</span>
        </div>

        {/* Main Headline with Accent Sparkle */}
        <div className="relative max-w-3xl mx-auto mb-3 sm:mb-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#064e3b] dark:text-white leading-[1.2] tracking-tight font-cairo inline-block relative">
            {t('hero.headline', 'مستقبلك يبدأ من هنا')}
            <span className="absolute -top-2 -end-4 text-emerald-500 text-lg sm:text-2xl font-bold select-none">
              ›
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 font-medium font-cairo">
          {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي. شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.')}
        </p>

        {/* Real Teacher Centered Portrait with Organic Background Shapes & Doodles */}
        <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto mb-8 sm:mb-10">
          {/* Layered Organic Green Background Shapes */}
          <div className="absolute inset-0 bg-[#aed9b6]/40 dark:bg-[#064e3b]/30 rounded-[50px] transform rotate-[-4deg] scale-95" />
          <div className="absolute inset-0 bg-[#72c286]/30 dark:bg-[#047857]/20 rounded-[45px] transform rotate-[3deg] scale-90" />

          {/* Real Photo with Bottom Gradient Fade Mask */}
          <div className="relative z-10 w-full overflow-hidden flex justify-center pt-2 sm:pt-4">
            <img
              src="/mr-omar-real.jpg"
              alt="Mr. Omar Makawy"
              className="w-full max-w-[280px] sm:max-w-[370px] lg:max-w-[420px] object-cover object-top rounded-t-3xl"
            />
            {/* Bottom Gradient Fade Overlay to blend portrait smoothly into surface */}
            <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[#f2f5ee] via-[#f2f5ee]/85 to-transparent dark:from-[#070c14] dark:via-[#070c14]/85 dark:to-transparent" />
          </div>

          {/* Hand-drawn Doodles Matching Mockup */}
          {/* Doodle Left: Learn Practice Improve */}
          <div className="absolute top-12 start-0 sm:-start-6 z-20 flex flex-col items-start text-start -rotate-6 select-none">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-emerald-600 font-black text-xs">{"//"}</span>
            </div>
            <span className="text-xs sm:text-sm font-black text-[#064e3b] dark:text-emerald-300 leading-tight">Learn</span>
            <span className="text-xs sm:text-sm font-black text-[#047857] dark:text-emerald-400 leading-tight">Practice</span>
            <span className="text-xs sm:text-sm font-bold text-[#10b981] dark:text-emerald-500 leading-tight">Improve</span>
          </div>

          {/* Doodle Right: Hello! */}
          <div className="absolute top-14 end-0 sm:-end-6 z-20 flex flex-col items-center rotate-6 select-none">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-0.5">
              <span>{"\\ \\ \\"}</span>
            </div>
            <span className="text-sm sm:text-base font-black text-[#064e3b] dark:text-emerald-200">Hello!</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs mt-0.5">
              <span>{"/ / /"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (CTAs) Matching Mockup */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full max-w-md mx-auto">
          {/* Primary CTA Button */}
          <Link
            href="/courses"
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 sm:py-4 bg-[#064e3b] hover:bg-[#047857] text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-950/20 hover:scale-[1.02] font-cairo"
          >
            <span>{t('hero.startJourney', 'ابدأ رحلتك الآن')}</span>
            <ArrowIcon className="w-5 h-5" />
          </Link>

          {/* Secondary CTA Button */}
          <Link
            href="/login"
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 sm:py-4 bg-[#f7f9f6] dark:bg-[#121212] text-[#064e3b] dark:text-emerald-300 border-2 border-[#c3dac1] dark:border-stone-800 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-2xs font-cairo"
          >
            <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('hero.studentLogin', 'تسجيل الدخول للطلاب')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
