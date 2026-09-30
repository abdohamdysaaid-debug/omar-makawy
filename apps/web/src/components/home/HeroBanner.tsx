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
    <section className="relative w-full overflow-hidden bg-[#f4f4eb] dark:bg-[#0b0f19] text-gray-900 dark:text-white pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 font-cairo transition-colors duration-300">
      {/* Background Organic Background Blobs & Curved Gradient Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#137856]/40 via-[#0d6e4f]/30 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-[#1fa979]/30 via-[#0d6e4f]/20 to-transparent blur-3xl" />
        {/* Abstract Green Waves */}
        <svg className="absolute w-full h-full text-[#0d6e4f]/15 dark:text-emerald-500/10" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,234.7C1120,235,1280,181,1360,154.7L1440,128L1440,900L1360,900C1280,900,1120,900,960,900C800,900,640,900,480,900C320,900,160,900,80,900L0,900Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mobile & Desktop Header Content Stack */}
        <div className="flex flex-col items-center text-center">
          
          {/* Top Green Platform Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#e2ede5] dark:bg-stone-800/80 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6 border border-[#c5dbc9] dark:border-stone-700 shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
            <span>{t('teacher.title', 'Mr. Omar Meckawy')} {t('hero.platformSuffix', 'التعليمية')}</span>
          </div>

          {/* Desktop & Mobile Split Container */}
          <div className="w-full flex flex-col items-center">
            
            {/* 1. Main Headline with Curved Underline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0a4834] dark:text-white leading-tight mb-4 tracking-tight max-w-4xl">
              {isRtl ? (
                <>
                  مستقبلك{' '}
                  <span className="relative inline-block text-[#0d6e4f] dark:text-emerald-400">
                    يبدأ من هنا
                    {/* Green Curved Underline SVG */}
                    <svg className="absolute -bottom-2 start-0 w-full h-3 text-[#0d6e4f] dark:text-emerald-400" viewBox="0 0 200 20" fill="none">
                      <path d="M5,15 Q100,2 195,12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </>
              ) : (
                <span>Your Future Starts Here</span>
              )}
            </h1>

            {/* 2. Subtitle Description */}
            <p className="text-sm sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 font-semibold mb-8 max-w-2xl leading-relaxed">
              {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي.')}
              <br className="hidden sm:inline" />
              <span className="text-xs sm:text-base text-gray-600 dark:text-gray-400 block mt-1">
                شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.
              </span>
            </p>

            {/* 3. Teacher Image Card Container with Green Backdrop Blobs & Doodles */}
            <div className="relative my-4 sm:my-6 w-full max-w-md sm:max-w-lg flex items-center justify-center">
              
              {/* Left Side Doodle: "Learn Practice Improve" */}
              <div className="absolute left-[-10px] sm:left-[-40px] top-[20%] z-20 hidden sm:flex flex-col items-center pointer-events-none rotate-[-12deg]">
                <div className="text-[#0d6e4f] dark:text-emerald-400 font-black text-xs sm:text-sm tracking-tight leading-tight text-center bg-white/80 dark:bg-stone-900/80 px-3 py-1.5 rounded-2xl shadow-sm border border-emerald-500/20 backdrop-blur-xs">
                  Learn<br />Practice<br />Improve
                </div>
                {/* Decorative Arcs */}
                <svg className="w-8 h-8 text-[#0d6e4f] mt-1" viewBox="0 0 50 50" fill="none">
                  <path d="M10 10 Q 25 40 40 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Right Side Doodle: "Hello!" & Crown */}
              <div className="absolute right-[-10px] sm:right-[-30px] top-[15%] z-20 hidden sm:flex flex-col items-center pointer-events-none rotate-[10deg]">
                <div className="text-amber-500 text-lg mb-1">👑</div>
                <div className="text-[#0d6e4f] dark:text-emerald-400 font-black text-sm sm:text-base tracking-tight bg-white/80 dark:bg-stone-900/80 px-3 py-1 rounded-2xl shadow-sm border border-emerald-500/20 backdrop-blur-xs">
                  Hello! 👋
                </div>
              </div>

              {/* Organic Green Backdrop Blob */}
              <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full bg-gradient-to-tr from-[#0d6e4f] via-[#137856] to-[#1fa979] opacity-90 blur-xs shadow-2xl" />

              {/* Teacher Cutout Photo */}
              <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white dark:border-stone-800 shadow-2xl bg-emerald-950 flex items-center justify-center">
                <img
                  src="/mr-omar-real.jpg"
                  alt="Mr. Omar Meckawy"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* 4. Action CTA Buttons (Stacked on Mobile / Side-by-side on Desktop) */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto">
              
              {/* Primary CTA: Dark Green Pill Button */}
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0d6e4f] hover:bg-[#0a5a40] text-white rounded-full font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0d6e4f]/30 text-sm sm:text-base"
              >
                <span>{t('hero.exploreCourses', 'ابدأ رحلتك الآن')}</span>
                <ArrowIcon className="w-5 h-5 text-white" />
              </Link>

              {/* Secondary CTA: Light Cream Pill Button */}
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-stone-800 hover:bg-stone-100 text-gray-900 dark:text-white border border-stone-300/80 dark:border-stone-700 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-sm text-sm sm:text-base"
              >
                <GraduationCap className="w-5 h-5 text-[#0d6e4f] dark:text-emerald-400" />
                <span>{t('nav.login', 'تسجيل الدخول للطلاب')}</span>
              </Link>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
