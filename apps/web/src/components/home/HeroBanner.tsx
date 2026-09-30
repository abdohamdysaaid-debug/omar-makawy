'use client';

import React from 'react';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f7f6ed] dark:bg-[#0b0f19] transition-colors duration-300 min-h-[70vh] sm:min-h-[80vh] lg:min-h-[88vh] flex items-center justify-center py-8 sm:py-12 lg:py-16">
      
      {/* 1. Background Artwork Environment — Fills hero section responsively across screen sizes */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
        <img
          src="/assets/hero/hero-bg-artwork.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center scale-105 sm:scale-100 transition-transform duration-500 ease-out"
        />
        {/* Soft edge blending overlays to visually integrate with top Navbar and section bottom */}
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-[#f7f6ed]/40 to-transparent dark:from-[#0b0f19]/60 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#f7f6ed]/40 to-transparent dark:from-[#0b0f19]/60 pointer-events-none" />
      </div>

      {/* 2. Single Responsive Hero Composition Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* Main Visual Centerpiece — Mr. Omar Makawy Cutout integrated naturally into the background artwork */}
        <div className="relative flex items-center justify-center w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto min-h-[340px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px] xl:min-h-[620px]">
          
          <img
            src="/assets/hero/teacher-cutout.png"
            alt="Mr. Omar Makawy"
            className="w-auto h-[310px] sm:h-[420px] md:h-[480px] lg:h-[540px] xl:h-[600px] max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)] transition-all duration-300 pointer-events-none select-none"
          />

        </div>

      </div>

    </section>
  );
}
