'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroBanner() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full overflow-hidden bg-[#f4f1ec] dark:bg-[#0b0f19] text-gray-900 dark:text-white pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 font-cairo transition-colors duration-300 min-h-[90vh] flex flex-col justify-center">
      
      {/* 1. Left Side Organic Green Fluid Wave SVG (Desktop) */}
      <div className="absolute top-0 start-0 bottom-0 w-64 lg:w-96 pointer-events-none z-0 hidden lg:block opacity-90">
        <svg viewBox="0 0 350 800" fill="none" className="w-full h-full text-[#11694e]">
          <path 
            d="M -50 -50 C 150 100 250 300 120 500 C 0 700 180 850 -50 900 Z" 
            fill="currentColor" 
            opacity="0.9"
          />
          <path 
            d="M -80 50 C 80 200 180 350 70 550 C -30 750 100 850 -80 900 Z" 
            fill="#094d38" 
            opacity="0.8"
          />
        </svg>
        {/* Floating Leaves */}
        <div className="absolute top-1/4 start-24 text-emerald-300 animate-pulse text-2xl">🍃</div>
        <div className="absolute top-2/3 start-16 text-emerald-200 text-xl">🍃</div>
      </div>

      {/* 2. Right Side Organic Green Fluid Wave SVG (Desktop) */}
      <div className="absolute top-0 end-0 bottom-0 w-64 lg:w-96 pointer-events-none z-0 hidden lg:block opacity-90">
        <svg viewBox="0 0 350 800" fill="none" className="w-full h-full text-[#11694e]">
          <path 
            d="M 400 -50 C 200 100 100 300 230 500 C 350 700 170 850 400 900 Z" 
            fill="currentColor" 
            opacity="0.9"
          />
          <path 
            d="M 430 50 C 270 200 170 350 280 550 C 380 750 250 850 430 900 Z" 
            fill="#094d38" 
            opacity="0.8"
          />
        </svg>
        {/* Floating Leaves */}
        <div className="absolute top-1/3 end-20 text-emerald-300 animate-pulse text-2xl">🍃</div>
        <div className="absolute top-3/4 end-28 text-emerald-200 text-xl">🍃</div>
      </div>

      {/* Mobile Subtle Background Ambient Gradient */}
      <div className="absolute inset-0 pointer-events-none lg:hidden z-0 bg-gradient-to-b from-[#e7e3d8]/60 via-[#f4f1ec] to-[#f4f1ec] opacity-80" />

      {/* Main Hero Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* ------------------------------------------------------------- */}
        {/* DESKTOP LAYOUT (Matches media_1790734163204.jpg)               */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col items-center text-center">
          
          {/* Hero Teacher Artwork Center Image (Organic Blob + Teacher + Doodles) */}
          <div className="relative w-full max-w-2xl mx-auto mb-6 flex justify-center items-center">
            <img
              src="/mr-omar-hero-desktop.png"
              alt="Mr. Omar Meckawy"
              className="w-auto h-[380px] object-contain drop-shadow-xl hover:scale-102 transition-transform duration-300"
            />
          </div>

          {/* Main Headline with Green Curved Underline */}
          <h1 className="text-4xl lg:text-5xl font-black text-[#00251e] dark:text-white leading-tight mb-4 tracking-tight">
            {isRtl ? (
              <>
                مستقبلك{' '}
                <span className="relative inline-block text-[#00251e] dark:text-emerald-400">
                  يبدأ من هنا
                  {/* Curved underline SVG matching screenshot */}
                  <svg className="absolute -bottom-2 start-0 w-full h-3.5 text-[#11694e] dark:text-emerald-400" viewBox="0 0 200 20" fill="none">
                    <path d="M5,14 Q100,2 195,14" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            ) : (
              <span>Your Future Starts Here</span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-700 dark:text-gray-300 font-bold max-w-2xl mb-8 leading-relaxed">
            {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي.')}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 w-full max-w-md mx-auto">
            {/* Primary Dark Green Pill Button */}
            <Link
              href="/courses"
              className="px-8 py-3.5 bg-[#11694e] hover:bg-[#0a4d38] text-white font-extrabold rounded-full flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#11694e]/30 text-base"
            >
              <span>{t('hero.exploreCourses', 'ابدأ رحلتك الآن')}</span>
              <ArrowIcon className="w-5 h-5 text-white" />
            </Link>

            {/* Secondary Off-White Pill Button */}
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white dark:bg-stone-800 hover:bg-stone-100 text-gray-900 dark:text-white font-bold rounded-full border border-stone-300/80 dark:border-stone-700 flex items-center justify-center gap-2 transition-all shadow-sm text-base"
            >
              <GraduationCap className="w-5 h-5 text-[#11694e] dark:text-emerald-400" />
              <span>{t('nav.login', 'تسجيل الدخول للطلاب')}</span>
            </Link>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* MOBILE LAYOUT (Matches media_1790734164208.png)               */}
        {/* ------------------------------------------------------------- */}
        <div className="flex lg:hidden flex-col items-center text-center">
          
          {/* Top Platform Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#e2ede5] dark:bg-stone-800 text-[#11694e] dark:text-emerald-400 font-extrabold text-xs px-4 py-1.5 rounded-full mb-4 border border-[#c5dbc9] dark:border-stone-700 shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#11694e]" />
            <span>{t('teacher.title', 'Mr. Omar Meckawy')} {t('hero.platformSuffix', 'التعليمية')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl font-black text-[#00251e] dark:text-white leading-tight mb-3 tracking-tight">
            {isRtl ? (
              <>
                مستقبلك{' '}
                <span className="relative inline-block text-[#00251e] dark:text-emerald-400">
                  يبدأ من هنا
                  <svg className="absolute -bottom-1.5 start-0 w-full h-3 text-[#11694e] dark:text-emerald-400" viewBox="0 0 200 20" fill="none">
                    <path d="M5,14 Q100,2 195,14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            ) : (
              <span>Your Future Starts Here</span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold max-w-xs mb-4 leading-relaxed">
            تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي.
            <span className="block text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
              شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.
            </span>
          </p>

          {/* Center Mobile Teacher Artwork */}
          <div className="relative w-full max-w-sm mx-auto my-2 flex justify-center items-center">
            <img
              src="/mr-omar-hero-mobile.png"
              alt="Mr. Omar Meckawy"
              className="w-full max-w-[340px] h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Stacked Mobile Action Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-4">
            {/* Primary Dark Green Pill Button */}
            <Link
              href="/courses"
              className="w-full py-3.5 bg-[#11694e] hover:bg-[#0a4d38] text-white font-extrabold rounded-full flex items-center justify-center gap-2 transition-all shadow-md text-sm"
            >
              <span>{t('hero.exploreCourses', 'ابدأ رحلتك الآن')}</span>
              <ArrowIcon className="w-4 h-4 text-white" />
            </Link>

            {/* Secondary Off-White Pill Button */}
            <Link
              href="/login"
              className="w-full py-3.5 bg-white dark:bg-stone-800 hover:bg-stone-100 text-gray-900 dark:text-white font-bold rounded-full border border-stone-300/80 dark:border-stone-700 flex items-center justify-center gap-2 transition-all shadow-xs text-sm"
            >
              <GraduationCap className="w-4.5 h-4.5 text-[#11694e] dark:text-emerald-400" />
              <span>{t('nav.login', 'تسجيل الدخول للطلاب')}</span>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
