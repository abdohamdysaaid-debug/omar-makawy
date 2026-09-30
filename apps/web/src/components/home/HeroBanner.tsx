'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        
        {/* MOBILE VISUAL COMPOSITION WITH OVERLAID RECTANGLES & ENLARGED BOTTOM BUTTONS */}
        <div className="flex sm:hidden flex-col items-center justify-center w-full mx-auto px-2 relative z-20 space-y-4">
          
          {/* Image & Floating Teacher Name/Subject Badges */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative w-full max-w-[380px] xs:max-w-[420px] flex flex-col items-center justify-center"
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

            {/* Floating Brand Badges shifted down near the end of the tie */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="absolute bottom-1 xs:bottom-2 inset-x-0 z-30 flex flex-col items-center text-center space-y-1.5 px-2"
            >
              {/* 1. First Rectangle: "مستر عمر مكاوي" */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="px-5 py-1.5 rounded-xl bg-[#0d6e4f]/95 dark:bg-[#064e3b]/95 text-white dark:text-emerald-100 border border-emerald-400/40 dark:border-emerald-500/50 shadow-lg backdrop-blur-md"
              >
                <span className="text-sm xs:text-base font-black tracking-wide">
                  مستر عمر مكاوي
                </span>
              </motion.div>

              {/* 2. Second Rectangle: "مدرس اللغة الإنجليزية" */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="px-4 py-1 rounded-xl bg-white/95 dark:bg-stone-900/95 text-gray-900 dark:text-stone-200 border border-stone-200 dark:border-stone-800 shadow-md backdrop-blur-md"
              >
                <span className="text-xs font-extrabold tracking-tight">
                  مدرس اللغة الإنجليزية
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enriched & Enlarged Action Area Directly Below the Image */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
            className="w-full max-w-[320px] xs:max-w-[360px] flex flex-col space-y-3 pt-2 pb-1"
          >
            <Link
              href="/register"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-sm xs:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#0d6e4f]/25 border border-emerald-500/30 transition-all active:scale-[0.98] hover:scale-[1.01]"
            >
              <span>إنشاء حساب</span>
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-[#071d15] hover:bg-stone-50 dark:hover:bg-[#0a271d] text-gray-900 dark:text-emerald-100 border-2 border-stone-200 dark:border-emerald-500/40 font-extrabold text-sm xs:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] hover:scale-[1.01]"
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
          className="hidden sm:flex items-center justify-center w-full mx-auto"
        >
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
