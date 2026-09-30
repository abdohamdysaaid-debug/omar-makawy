'use client';

import React from 'react';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f7f6ed] dark:bg-[#0b0f19] transition-colors duration-300 min-h-[60vh] sm:min-h-[75vh] lg:min-h-[85vh] flex items-center justify-center py-6 sm:py-10 lg:py-12">
      
      {/* Subtle top & bottom lighting integration */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <div className="absolute inset-x-0 top-0 h-12 sm:h-16 bg-gradient-to-b from-[#f7f6ed]/60 to-transparent dark:from-[#0b0f19]/80 pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-[#f7f6ed]/60 to-transparent dark:from-[#0b0f19]/80 pointer-events-none z-10" />
      </div>

      {/* Single Responsive Hero Composition Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* Exact Visual Composition (Background Artwork + Centered Teacher + Soft Edge Blending) */}
        <div className="relative flex items-center justify-center w-full mx-auto">
          <img
            src="/assets/hero/hero-visual-exact.png"
            alt="Mr. Omar Makawy - Hero Visual Composition"
            className="w-full max-w-[420px] sm:max-w-[680px] md:max-w-[850px] lg:max-w-[1024px] xl:max-w-[1140px] h-auto object-contain transition-all duration-300 pointer-events-none select-none"
          />
        </div>

      </div>

    </section>
  );
}
