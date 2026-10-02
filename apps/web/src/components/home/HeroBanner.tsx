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

        {/* Balanced Creative Watercolor English Typography Canvas Layer Spanning Top to Bottom */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
        >
          {/* LEFT SIDE WATERCOLOR TYPOGRAPHY COLUMN (Spanning Top to Bottom) */}
          <div className="absolute inset-y-4 left-1 xs:left-3 sm:left-6 md:left-10 lg:left-14 flex flex-col justify-between items-start py-4 opacity-45 dark:opacity-30 max-w-[35vw] sm:max-w-[28vw] lg:max-w-[25vw] xl:max-w-[22vw]">
            <span className="font-serif italic text-lg xs:text-2xl sm:text-4xl lg:text-5xl font-black text-[#0d6e4f] dark:text-emerald-400 transform -rotate-12 tracking-wide drop-shadow-sm">
              Mr. Omar Meckawy
            </span>
            <span className="font-serif italic text-base xs:text-xl sm:text-3xl lg:text-4xl font-extrabold text-amber-700 dark:text-amber-300 transform rotate-6 tracking-wide">
              Welcome 👋
            </span>
            <span className="font-serif italic text-sm xs:text-lg sm:text-2xl lg:text-3xl font-black text-teal-700 dark:text-teal-300 transform -rotate-6 tracking-wide">
              English Mastery 🎓
            </span>
            <span className="font-serif italic text-xs xs:text-base sm:text-xl lg:text-2xl font-extrabold text-emerald-800 dark:text-emerald-400 transform rotate-12 tracking-wide">
              Speak Fluently 🚀
            </span>
            <span className="font-serif italic text-xs xs:text-sm sm:text-lg lg:text-xl font-bold text-amber-800 dark:text-amber-400 transform -rotate-6 tracking-wide">
              Top English Teacher 🌟
            </span>
            <span className="font-serif italic text-[10px] xs:text-xs sm:text-base lg:text-lg font-black text-teal-800 dark:text-teal-400 transform rotate-6 tracking-wide">
              Creative Learning ✨
            </span>
          </div>

          {/* RIGHT SIDE WATERCOLOR TYPOGRAPHY COLUMN (Spanning Top to Bottom) */}
          <div className="absolute inset-y-4 right-1 xs:right-3 sm:right-6 md:right-10 lg:right-14 flex flex-col justify-between items-end py-4 opacity-45 dark:opacity-30 max-w-[35vw] sm:max-w-[28vw] lg:max-w-[25vw] xl:max-w-[22vw]">
            <span className="font-serif italic text-lg xs:text-2xl sm:text-4xl lg:text-5xl font-black text-[#0d6e4f] dark:text-emerald-400 transform rotate-12 tracking-wide drop-shadow-sm">
              Mr. Omar Meckawy
            </span>
            <span className="font-serif italic text-base xs:text-xl sm:text-3xl lg:text-4xl font-extrabold text-amber-700 dark:text-amber-300 transform -rotate-6 tracking-wide">
              Hello! ✨
            </span>
            <span className="font-serif italic text-sm xs:text-lg sm:text-2xl lg:text-3xl font-black text-teal-700 dark:text-teal-300 transform rotate-6 tracking-wide">
              Grammar & Vocab 📚
            </span>
            <span className="font-serif italic text-xs xs:text-base sm:text-xl lg:text-2xl font-extrabold text-emerald-800 dark:text-emerald-400 transform -rotate-12 tracking-wide">
              Excellence & Success 🏆
            </span>
            <span className="font-serif italic text-xs xs:text-sm sm:text-lg lg:text-xl font-bold text-amber-800 dark:text-amber-400 transform rotate-6 tracking-wide">
              Unlock Your Potential 🔑
            </span>
            <span className="font-serif italic text-[10px] xs:text-xs sm:text-base lg:text-lg font-black text-teal-800 dark:text-teal-400 transform -rotate-6 tracking-wide">
              Interactive Lessons 💡
            </span>
          </div>

          {/* TOP CENTER WATERCOLOR ACCENT */}
          <div className="absolute top-3 inset-x-0 flex justify-center opacity-35 dark:opacity-20 pointer-events-none">
            <span className="font-serif italic text-sm xs:text-lg sm:text-3xl font-black text-emerald-800 dark:text-emerald-300 transform -rotate-1">
              Learn English with Confidence 💫
            </span>
          </div>

          {/* BOTTOM CENTER WATERCOLOR ACCENT */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center opacity-30 dark:opacity-20 pointer-events-none">
            <span className="font-serif italic text-xs xs:text-sm sm:text-2xl font-bold text-amber-800 dark:text-amber-300 transform rotate-1">
              Mr. Omar Meckawy English Platform 👑
            </span>
          </div>
        </motion.div>
      </div>

      {/* 2. Responsive Hero Composition Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* 1. Top-Left Floating Badge: Hello English! */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, x: -30, y: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.35 },
            scale: { duration: 0.6, delay: 0.35, ease: 'easeOut' },
            x: { duration: 0.6, delay: 0.35, ease: 'easeOut' },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.95 }
          }}
          className="absolute top-8 xs:top-10 sm:top-16 md:top-20 lg:top-24 left-2 xs:left-3 sm:left-6 md:left-12 lg:left-20 xl:left-28 z-30 pointer-events-none select-none"
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/85 dark:bg-[#07241a]/85 border border-emerald-400/40 dark:border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5">
            <span className="font-serif italic text-xs sm:text-base font-extrabold text-[#0d6e4f] dark:text-emerald-300">
              Hello English! 👋
            </span>
          </div>
        </motion.div>

        {/* 2. Middle-Left Floating Slogan Badge: "يبقى خليك مع مكاوي! 🔥" */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, x: -30, y: 15 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.5 },
            scale: { duration: 0.6, delay: 0.5, ease: 'easeOut' },
            x: { duration: 0.6, delay: 0.5, ease: 'easeOut' },
            y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }
          }}
          className="absolute top-28 xs:top-32 sm:top-40 md:top-48 lg:top-56 left-2 xs:left-3 sm:left-6 md:left-12 lg:left-20 xl:left-28 z-30 pointer-events-none select-none"
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-[#0d6e4f]/90 to-emerald-800/90 text-amber-300 border border-amber-400/50 shadow-xl backdrop-blur-md flex items-center gap-1.5 font-cairo">
            <span className="text-xs sm:text-sm lg:text-base font-black tracking-tight drop-shadow-sm">
              يبقى خليك مع مكاوي! 🔥
            </span>
          </div>
        </motion.div>

        {/* 3. Top-Right Floating Badge: Speak Confidently! */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, x: 30, y: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: [0, 5, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.4 },
            scale: { duration: 0.6, delay: 0.4, ease: 'easeOut' },
            x: { duration: 0.6, delay: 0.4, ease: 'easeOut' },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }
          }}
          className="absolute top-10 xs:top-12 sm:top-18 md:top-24 lg:top-28 right-2 xs:right-3 sm:right-6 md:right-12 lg:right-20 xl:right-28 z-30 pointer-events-none select-none"
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/85 dark:bg-[#07241a]/85 border border-emerald-400/40 dark:border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5">
            <span className="font-serif italic text-xs sm:text-base font-extrabold text-[#0d6e4f] dark:text-emerald-300">
              Speak Confidently 🚀
            </span>
          </div>
        </motion.div>

        {/* 4. Middle-Right Floating Slogan Badge: "لو على التقفيل ناوي.. 🎯" */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, x: 30, y: 15 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: [0, 6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.55 },
            scale: { duration: 0.6, delay: 0.55, ease: 'easeOut' },
            x: { duration: 0.6, delay: 0.55, ease: 'easeOut' },
            y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.15 }
          }}
          className="absolute top-32 xs:top-36 sm:top-44 md:top-52 lg:top-60 right-2 xs:right-3 sm:right-6 md:right-12 lg:right-20 xl:right-28 z-30 pointer-events-none select-none"
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-800/90 via-[#0d6e4f]/90 to-emerald-900/90 text-amber-300 border border-amber-400/50 shadow-xl backdrop-blur-md flex items-center gap-1.5 font-cairo">
            <span className="text-xs sm:text-sm lg:text-base font-black tracking-tight drop-shadow-sm">
              لو على التقفيل ناوي.. 🎯
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
              alt="Mr. Omar Meckawy - مستر عمر مكاوي مدرس اللغة الإنجليزية"
              className="dark:hidden w-full h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_8px_24px_rgba(17,105,78,0.06)]"
            />

            {/* Mobile Dark Mode Visual */}
            <img
              src="/assets/hero/hero-visual-mobile-dark-seamless.png?v=20260930_v5"
              alt="Mr. Omar Meckawy - مستر عمر مكاوي مدرس اللغة الإنجليزية"
              className="hidden dark:block w-full h-auto object-contain transition-all duration-300 pointer-events-none select-none"
            />

            {/* Floating Brand Badges (positioned gracefully over tie area) */}
            <div className="absolute bottom-5 xs:bottom-6 inset-x-0 z-30 flex flex-col items-center text-center space-y-1 px-2">
              {/* 1. First Rectangle: "مستر عمر مكاوي" */}
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                whileHover={{ scale: 1.03 }}
                className="px-5 py-1.5 rounded-xl bg-[#0d6e4f]/95 dark:bg-[#064e3b]/95 text-white dark:text-emerald-100 border border-emerald-400/40 dark:border-emerald-500/50 shadow-lg backdrop-blur-md"
              >
                <h1 className="text-sm xs:text-base font-black tracking-wide inline-block">
                  مستر عمر مكاوي
                </h1>
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

        {/* DESKTOP / TABLET VISUAL COMPOSITION WITH OVERLAID BADGES & DESKTOP CTA BUTTONS */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
          className="hidden sm:flex flex-col items-center justify-center w-full mx-auto relative pt-4"
        >
          {/* Desktop Visual Container */}
          <div className="relative w-full flex flex-col items-center justify-center">
            {/* Desktop Light Mode Visual */}
            <img
              src="/assets/hero/hero-visual-seamless.png?v=20260930_v5"
              alt="Mr. Omar Meckawy - منصة مستر عمر مكاوي لتعليم اللغة الإنجليزية"
              className="dark:hidden w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_10px_30px_rgba(17,105,78,0.06)]"
            />

            {/* Desktop Dark Mode Visual (Exact Seamless Alpha Feathered PNG) */}
            <img
              src="/assets/hero/hero-visual-desktop-dark-seamless.png?v=20260930_v5"
              alt="Mr. Omar Meckawy - منصة مستر عمر مكاوي لتعليم اللغة الإنجليزية"
              className="hidden dark:block w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto object-contain transition-all duration-300 pointer-events-none select-none"
            />

            {/* Desktop Floating Brand Badges */}
            <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 inset-x-0 z-30 flex flex-col items-center text-center space-y-2 px-4 pointer-events-none select-none">
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                className="px-6 py-2 rounded-2xl bg-[#0d6e4f]/95 dark:bg-[#064e3b]/95 text-white dark:text-emerald-100 border border-emerald-400/40 dark:border-emerald-500/50 shadow-xl backdrop-blur-md"
              >
                <h1 className="text-base sm:text-lg md:text-xl font-black tracking-wide inline-block">
                  مستر عمر مكاوي
                </h1>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
                className="px-5 py-1.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 text-gray-900 dark:text-stone-200 border border-stone-200 dark:border-stone-800 shadow-md backdrop-blur-md"
              >
                <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                  مدرس اللغة الإنجليزية
                </span>
              </motion.div>
            </div>
          </div>

          {/* Desktop Enriched CTA Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: 'easeOut' }}
            className="w-full max-w-md sm:max-w-lg flex flex-row items-center justify-center gap-4 mt-2 sm:mt-4 relative z-30 pb-4"
          >
            <Link
              href="/register"
              className="flex-1 py-3.5 px-8 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#0d6e4f]/25 border border-emerald-500/30 transition-all active:scale-[0.98] hover:scale-[1.03]"
            >
              <span>إنشاء حساب جديد</span>
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="flex-1 py-3.5 px-8 rounded-2xl bg-white dark:bg-[#071d15] hover:bg-stone-50 dark:hover:bg-[#0a271d] text-gray-900 dark:text-emerald-100 border-2 border-stone-200 dark:border-emerald-500/40 font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] hover:scale-[1.03]"
            >
              <span>تسجيل الدخول</span>
            </Link>
          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}
