'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f7f6ed] dark:bg-[#020d08] transition-colors duration-300 min-h-[65vh] sm:min-h-[75vh] lg:min-h-[88vh] flex items-center justify-center pt-6 pb-4 sm:py-10 lg:py-14">
      
      {/* 1. Ambient Background Glow & Edge Blending Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        {/* Light Mode Center Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(247,246,237,1)_0%,_rgba(244,241,236,0.95)_60%,_rgba(244,241,236,1)_100%)] dark:opacity-0 transition-opacity" />
        
        {/* Dark Mode Emerald Radial Glow */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_at_center,_rgba(2,20,13,0.95)_0%,_rgba(2,13,8,1)_100%)] transition-opacity" />
        
        {/* Top and Bottom Gradient Blends */}
        <div className="absolute inset-x-0 top-0 h-12 sm:h-24 bg-gradient-to-b from-[#f7f6ed] via-[#f7f6ed]/80 to-transparent dark:from-[#020d08] dark:via-[#020d08]/80 pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-24 bg-gradient-to-t from-[#f7f6ed] via-[#f7f6ed]/80 to-transparent dark:from-[#020d08] dark:via-[#020d08]/80 pointer-events-none z-10" />

        {/* Floating Creative English Cursive Typography Watermark */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute inset-x-0 top-1/4 flex items-center justify-between px-4 sm:px-16 md:px-24 pointer-events-none select-none z-0 opacity-25 dark:opacity-20"
        >
          <span className="font-serif italic text-3xl xs:text-5xl sm:text-7xl lg:text-8xl font-black text-[#0d6e4f] dark:text-emerald-400 transform -rotate-12 tracking-wider">
            Hello!
          </span>
          <span className="font-serif italic text-3xl xs:text-5xl sm:text-7xl lg:text-8xl font-black text-[#0d6e4f] dark:text-emerald-400 transform rotate-12 tracking-wider">
            Welcome
          </span>
        </motion.div>
      </div>

      {/* 2. Responsive Hero Composition Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* Left Floating Creative English Cursive Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, x: -30, y: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.35 },
            scale: { duration: 0.6, delay: 0.35, ease: 'easeOut' },
            x: { duration: 0.6, delay: 0.35, ease: 'easeOut' },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.95 }
          }}
          className="absolute top-10 left-3 sm:top-16 sm:left-12 lg:left-24 z-30 pointer-events-none select-none"
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/85 dark:bg-[#07241a]/85 border border-emerald-400/40 dark:border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5">
            <span className="font-serif italic text-xs sm:text-base font-extrabold text-[#0d6e4f] dark:text-emerald-300">
              Hello English! 👋
            </span>
          </div>
        </motion.div>

        {/* Right Floating Creative English Cursive Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, x: 30, y: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: [0, 5, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.45 },
            scale: { duration: 0.6, delay: 0.45, ease: 'easeOut' },
            x: { duration: 0.6, delay: 0.45, ease: 'easeOut' },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.05 }
          }}
          className="absolute top-16 right-3 sm:top-24 sm:right-12 lg:right-24 z-30 pointer-events-none select-none"
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/85 dark:bg-[#07241a]/85 border border-emerald-400/40 dark:border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5">
            <span className="font-serif italic text-xs sm:text-base font-extrabold text-[#0d6e4f] dark:text-emerald-300">
              Speak Confidently 🚀
            </span>
          </div>
        </motion.div>

        {/* MOBILE VISUAL COMPOSITION WITH OVERLAID RECTANGLES & COMPACT FLOATING BUTTONS */}
        <div className="flex sm:hidden flex-col items-center justify-center w-full mx-auto px-2 relative z-20">
          
          {/* Image Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative w-full max-w-[380px] xs:max-w-[420px] flex flex-col items-center justify-center pt-6 xs:pt-8"
          >
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

            {/* Floating Brand Badges & Slogan (positioned gracefully over tie area) */}
            <div className="absolute bottom-5 xs:bottom-6 inset-x-0 z-30 flex flex-col items-center text-center space-y-1 px-2">
              {/* 1. First Rectangle: "مستر عمر مكاوي" */}
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                whileHover={{ scale: 1.03 }}
                className="px-5 py-1.5 rounded-xl bg-[#0d6e4f]/95 dark:bg-[#064e3b]/95 text-white dark:text-emerald-100 border border-emerald-400/40 dark:border-emerald-500/50 shadow-lg backdrop-blur-md"
              >
                <span className="text-sm xs:text-base font-black tracking-wide">
                  مستر عمر مكاوي
                </span>
              </motion.div>

              {/* 2. Second Rectangle: "مدرس اللغة الإنجليزية" */}
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
                whileHover={{ scale: 1.02 }}
                className="px-4 py-1 rounded-xl bg-white/95 dark:bg-stone-900/95 text-gray-900 dark:text-stone-200 border border-stone-200 dark:border-stone-800 shadow-md backdrop-blur-md"
              >
                <span className="text-xs font-extrabold tracking-tight">
                  مدرس اللغة الإنجليزية
                </span>
              </motion.div>

              {/* 3. Third Rectangle: Arabic Slogan "لو على التقفيل ناوي.. يبقى خليك مع مكاوي" */}
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.55, ease: 'easeOut' }}
                whileHover={{ scale: 1.03 }}
                className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-emerald-800 via-[#0d6e4f] to-emerald-900 text-amber-300 border border-amber-400/50 shadow-xl backdrop-blur-md flex items-center gap-1 mt-0.5"
              >
                <span className="text-[11px] xs:text-xs font-black tracking-tight drop-shadow-sm">
                  لو على التقفيل ناوي.. يبقى خليك مع مكاوي 🔥
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Enriched & Enlarged Action Area Pulled UP to overlap and eliminate white space */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: 'easeOut' }}
            className="w-full max-w-[320px] xs:max-w-[360px] flex flex-col space-y-2.5 -mt-3 xs:-mt-4 relative z-30 pb-2"
          >
            <Link
              href="/register"
              className="w-full py-3 px-6 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-sm xs:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#0d6e4f]/25 border border-emerald-500/30 transition-all active:scale-[0.98] hover:scale-[1.01]"
            >
              <span>إنشاء حساب</span>
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="w-full py-3 px-6 rounded-2xl bg-white dark:bg-[#071d15] hover:bg-stone-50 dark:hover:bg-[#0a271d] text-gray-900 dark:text-emerald-100 border-2 border-stone-200 dark:border-emerald-500/40 font-extrabold text-sm xs:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] hover:scale-[1.01]"
            >
              <span>تسجيل الدخول</span>
            </Link>
          </motion.div>

        </div>

        {/* DESKTOP / TABLET VISUAL COMPOSITION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
          className="hidden sm:flex flex-col items-center justify-center w-full mx-auto relative"
        >
          {/* Desktop Slogan Badge Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -18, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            className="mb-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#0d6e4f] to-[#11694e] text-amber-300 border border-amber-400/40 shadow-lg"
          >
            <span className="text-sm font-black tracking-wide">
              لو على التقفيل ناوي.. يبقى خليك مع مكاوي 🔥
            </span>
          </motion.div>

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
        </motion.div>

      </div>

    </section>
  );
}
