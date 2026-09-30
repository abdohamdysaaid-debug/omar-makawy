'use client';

import React from 'react';

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
        
        {/* MOBILE VISUAL COMPOSITION */}
        <div className="flex sm:hidden items-center justify-center w-full mx-auto px-1 py-2">
          
          {/* Mobile Light Mode Visual */}
          <img
            src="/assets/hero/hero-visual-mobile-seamless.png"
            alt="Mr. Omar Makawy - Mobile Hero Visual Composition"
            className="dark:hidden w-full max-w-[360px] xs:max-w-[420px] h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_8px_24px_rgba(17,105,78,0.06)]"
          />

          {/* Mobile Dark Mode Visual (AI Dark Artwork + Teacher Cutout Composite) */}
          <div className="hidden dark:flex relative w-full max-w-[340px] xs:max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(13,110,79,0.25)] border border-emerald-500/20 items-center justify-center transition-all duration-300">
            {/* AI Dark Background Artwork */}
            <img
              src="/assets/hero/hero-bg-dark-mobile.jpg"
              alt="Dark Mode Hero Background Artwork"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Ambient Inner Dark Shadow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-[#0b0f19]/60 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19]/60 via-transparent to-[#0b0f19]/60 pointer-events-none z-10" />

            {/* Teacher Cutout Layer */}
            <img
              src="/assets/hero/teacher-cutout.png"
              alt="Mr. Omar Makawy Cutout"
              className="relative z-20 w-[84%] h-auto object-contain max-h-[84%] translate-y-3 filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)] pointer-events-none select-none"
            />
          </div>

        </div>

        {/* DESKTOP / TABLET VISUAL COMPOSITION */}
        <div className="hidden sm:flex items-center justify-center w-full mx-auto">
          
          {/* Desktop Light Mode Visual */}
          <img
            src="/assets/hero/hero-visual-seamless.png"
            alt="Mr. Omar Makawy - Desktop Hero Visual Composition"
            className="dark:hidden w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_10px_30px_rgba(17,105,78,0.06)]"
          />

          {/* Desktop Dark Mode Visual (Exact User Image, Blended Seamlessly with Radial Alpha Mask) */}
          <div className="hidden dark:block relative w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto transition-all duration-300 pointer-events-none select-none">
            <img
              src="/assets/hero/hero-visual-desktop-dark.png"
              alt="Mr. Omar Makawy - Desktop Dark Mode Hero Visual Composition"
              className="w-full h-auto object-contain transition-all duration-300 pointer-events-none select-none [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_98%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_98%)]"
            />
          </div>

        </div>

      </div>

    </section>
  );
}
