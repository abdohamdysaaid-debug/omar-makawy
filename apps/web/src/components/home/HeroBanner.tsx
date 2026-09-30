'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroBanner() {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full overflow-hidden bg-[#f6f8f5] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 transition-colors">
      {/* Background Soft Organic Curves */}
      <div className="absolute -top-24 start-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-transparent dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Badge matching mockup */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs sm:text-sm shadow-xs mb-4 sm:mb-6 animate-fade-in">
          <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('hero.badge', 'منصة مستر عمر مكاوي التعليمية')}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white leading-[1.2] tracking-tight max-w-3xl mx-auto mb-3 sm:mb-4 font-cairo">
          {t('hero.headline', 'مستقبلك يبدأ من هنا')}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 font-medium font-cairo">
          {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي. شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.')}
        </p>

        {/* Real Teacher Centered Portrait with Organic Background & Doodles */}
        <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto mb-8 sm:mb-10">
          {/* Organic Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-200/60 via-emerald-100/40 to-transparent dark:from-emerald-900/40 dark:via-emerald-950/20 dark:to-transparent rounded-[48px] transform -rotate-1 scale-95" />

          {/* Real Photo with Bottom Gradient Fade Mask */}
          <div className="relative z-10 w-full overflow-hidden flex justify-center pt-3 sm:pt-4">
            <img
              src="/mr-omar-real.jpg"
              alt="Mr. Omar Makawy"
              className="w-full max-w-[290px] sm:max-w-[380px] lg:max-w-[420px] object-cover object-top rounded-t-3xl shadow-xs"
            />
            {/* Bottom Gradient Fade Overlay to blend portrait smoothly */}
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-[#f6f8f5] via-[#f6f8f5]/80 to-transparent dark:from-[#090d16] dark:via-[#090d16]/80 dark:to-transparent" />
          </div>

          {/* Hand-drawn Doodles Matching Mockup */}
          {/* Doodle Left: Learn Practice Improve */}
          <div className="absolute top-10 start-0 sm:-start-4 z-20 bg-white/95 dark:bg-[#121212]/95 border-2 border-emerald-500/30 rounded-2xl px-3 py-1.5 shadow-lg flex flex-col items-center -rotate-6">
            <span className="text-[11px] sm:text-xs font-black text-emerald-900 dark:text-emerald-300">Learn</span>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">Practice</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 dark:text-gray-300">Improve</span>
          </div>

          {/* Doodle Right: Hello! with Crown */}
          <div className="absolute top-14 end-0 sm:-end-4 z-20 bg-white/95 dark:bg-[#121212]/95 border-2 border-emerald-500/30 rounded-2xl px-3.5 py-1.5 shadow-lg flex items-center gap-1.5 rotate-6">
            <span className="text-sm">👑</span>
            <span className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">Hello!</span>
          </div>
        </div>

        {/* Action Buttons (CTAs) Matching Mockup */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full max-w-md mx-auto">
          {/* Primary CTA */}
          <Link
            href="/courses"
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 sm:py-4 bg-[#064e3b] hover:bg-[#047857] text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-950/20 hover:scale-[1.02] font-cairo"
          >
            <span>{t('hero.startJourney', 'ابدأ رحلتك الآن')}</span>
            <ArrowIcon className="w-5 h-5" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/login"
            className="w-full sm:w-auto min-w-[220px] px-8 py-3.5 sm:py-4 bg-white dark:bg-[#121212] text-gray-900 dark:text-white border-2 border-stone-300/90 dark:border-stone-800 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-xs font-cairo"
          >
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('hero.studentLogin', 'تسجيل الدخول للطلاب')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
