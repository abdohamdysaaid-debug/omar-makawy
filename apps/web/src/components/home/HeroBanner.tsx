import React from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f7f6ed] dark:bg-[#020d08] transition-colors duration-300 min-h-[65vh] sm:min-h-[75vh] lg:min-h-[88vh] flex items-center justify-center py-4 sm:py-10 lg:py-14">
      
      {/* 1. Ambient Background Glow & Edge Blending Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        {/* Light Mode Center Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(247,246,237,1)_0%,_rgba(244,241,236,0.95)_60%,_rgba(244,241,236,1)_100%)] dark:opacity-0 transition-opacity" />
        
        {/* Dark Mode Emerald Radial Glow */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_at_center,_rgba(2,20,13,0.95)_0%,_rgba(2,13,8,1)_100%)] transition-opacity" />
        
        {/* Top and Bottom Gradient Blends */}
        <div className="absolute inset-x-0 top-0 h-12 sm:h-24 bg-gradient-to-b from-[#f7f6ed] via-[#f7f6ed]/80 to-transparent dark:from-[#020d08] dark:via-[#020d08]/80 pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-24 bg-gradient-to-t from-[#f7f6ed] via-[#f7f6ed]/80 to-transparent dark:from-[#020d08] dark:via-[#020d08]/80 pointer-events-none z-10" />
      </div>

      {/* 2. Responsive Hero Composition Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* MOBILE VISUAL COMPOSITION WITH OVERLAID RECTANGLES & STACKED BUTTONS */}
        <div className="flex sm:hidden flex-col items-center justify-center w-full mx-auto px-1 py-1 relative">
          
          <div className="relative w-full max-w-[380px] xs:max-w-[440px] flex items-center justify-center">
            {/* Mobile Light Mode Visual */}
            <img
              src="/assets/hero/hero-visual-mobile-seamless.png?v=20260930_v5"
              alt="Mr. Omar Makawy - Mobile Hero Visual Composition"
              className="dark:hidden w-full h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_8px_24px_rgba(17,105,78,0.06)]"
            />

            {/* Mobile Dark Mode Visual */}
            <img
              src="/assets/hero/hero-visual-mobile-dark-seamless.png?v=20260930_v5"
              alt="Mr. Omar Makawy - Mobile Dark Mode Hero Visual Composition"
              className="hidden dark:block w-full h-auto object-contain transition-all duration-300 pointer-events-none select-none"
            />

            {/* Overlaid Rectangles & Buttons directly over the bottom tie / chest area */}
            <div className="absolute bottom-1 xs:bottom-2 inset-x-2 z-30 flex flex-col items-center text-center space-y-2">
              
              {/* 1. First Rectangle: "مستر عمر مكاوي" */}
              <div className="px-5 py-1.5 rounded-2xl bg-[#e2ede5]/95 dark:bg-[#064e3b]/95 text-[#0d6e4f] dark:text-emerald-200 border border-[#c2dbc9] dark:border-emerald-500/50 shadow-md backdrop-blur-md">
                <span className="text-sm font-black tracking-tight">
                  مستر عمر مكاوي
                </span>
              </div>

              {/* 2. Second Rectangle: "مدرس اللغة الإنجليزية" */}
              <div className="px-4 py-1.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 text-gray-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 shadow-md backdrop-blur-md">
                <span className="text-xs font-extrabold tracking-tight">
                  مدرس اللغة الإنجليزية
                </span>
              </div>

              {/* 3. Stacked Action Buttons: "إنشاء حساب" & "تسجيل الدخول" */}
              <div className="w-full max-w-[270px] xs:max-w-[300px] space-y-2 pt-1">
                <Link
                  href="/register"
                  className="w-full py-2.5 px-4 rounded-full bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0d6e4f]/30 transition-all active:scale-95"
                >
                  <span>إنشاء حساب</span>
                </Link>

                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-stone-800/95 hover:bg-stone-100 dark:hover:bg-stone-700 text-gray-800 dark:text-white border border-stone-300/80 dark:border-stone-700 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>تسجيل الدخول</span>
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* DESKTOP / TABLET VISUAL COMPOSITION */}
        <div className="hidden sm:flex items-center justify-center w-full mx-auto">
          
          {/* Desktop Light Mode Visual */}
          <img
            src="/assets/hero/hero-visual-seamless.png?v=20260930_v5"
            alt="Mr. Omar Makawy - Desktop Hero Visual Composition"
            className="dark:hidden w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_10px_30px_rgba(17,105,78,0.06)]"
          />

          {/* Desktop Dark Mode Visual (Exact Seamless Alpha Feathered PNG) */}
          <img
            src="/assets/hero/hero-visual-desktop-dark-seamless.png?v=20260930_v5"
            alt="Mr. Omar Makawy - Desktop Dark Mode Hero Visual Composition"
            className="hidden dark:block w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto object-contain transition-all duration-300 pointer-events-none select-none"
          />

        </div>

      </div>

    </section>
  );
}
