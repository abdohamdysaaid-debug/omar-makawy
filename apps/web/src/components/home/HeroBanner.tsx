'use client';

import React from 'react';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f7f6ed] dark:bg-[#0b0f19] transition-colors duration-300 min-h-[65vh] sm:min-h-[75vh] lg:min-h-[88vh] flex items-center justify-center py-4 sm:py-10 lg:py-14">
      
      {/* 1. Ambient Background Glow & Edge Blending Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        {/* Soft Radial Center Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(247,246,237,1)_0%,_rgba(244,241,236,0.95)_60%,_rgba(244,241,236,1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(17,25,40,0.8)_0%,_rgba(11,15,25,1)_100%)]" />
        
        {/* Top and Bottom Gradient Blends */}
        <div className="absolute inset-x-0 top-0 h-12 sm:h-24 bg-gradient-to-b from-[#f7f6ed] via-[#f7f6ed]/80 to-transparent dark:from-[#0b0f19] dark:via-[#0b0f19]/80 pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-24 bg-gradient-to-t from-[#f7f6ed] via-[#f7f6ed]/80 to-transparent dark:from-[#0b0f19] dark:via-[#0b0f19]/80 pointer-events-none z-10" />
      </div>

      {/* 2. Responsive Hero Composition Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* MOBILE VISUAL COMPOSITION (Matches exact mobile vertical reference image) */}
        <div className="flex sm:hidden items-center justify-center w-full mx-auto px-1 py-2">
          <img
            src="/assets/hero/hero-visual-mobile-seamless.png"
            alt="Mr. Omar Makawy - Mobile Hero Visual Composition"
            className="w-full max-w-[360px] xs:max-w-[420px] h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_8px_24px_rgba(17,105,78,0.06)]"
          />
        </div>

        {/* DESKTOP / TABLET VISUAL COMPOSITION (PC design 100% untouched) */}
        <div className="hidden sm:flex items-center justify-center w-full mx-auto">
          <img
            src="/assets/hero/hero-visual-seamless.png"
            alt="Mr. Omar Makawy - Desktop Hero Visual Composition"
            className="w-full sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1040px] xl:max-w-[1200px] h-auto object-contain transition-all duration-300 pointer-events-none select-none filter drop-shadow-[0_10px_30px_rgba(17,105,78,0.06)]"
          />
        </div>

      </div>

    </section>
  );
}
