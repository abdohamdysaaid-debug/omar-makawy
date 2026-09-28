'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, GraduationCap, Sparkles } from 'lucide-react';
import { heroBanner } from '@/data/mock';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white py-16 lg:py-24">
      {/* Decorative Text */}
      <div className="absolute top-10 right-10 -z-0 text-6xl font-black text-white/5 uppercase tracking-widest hidden lg:block rotate-[-10deg] select-none pointer-events-none">
        English Opens New Worlds
      </div>
      <div className="absolute bottom-10 left-10 -z-0 text-6xl font-black text-white/5 uppercase tracking-widest hidden lg:block rotate-[10deg] select-none pointer-events-none">
        Better English A Brighter You
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-start">
            <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-semibold text-xs px-4 py-2 rounded-full mb-6 border border-emerald-400/20 backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              منصة مستر عمر مكاوي التعليمية
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 font-cairo">
              {heroBanner.title}
            </h1>

            <p className="text-lg sm:text-xl text-emerald-100/90 mb-8 max-w-2xl leading-relaxed font-cairo">
              {heroBanner.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/30 text-base font-cairo"
              >
                {heroBanner.buttonText}
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-md text-base font-cairo"
              >
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                تسجيل الدخول للطالب
              </Link>
            </div>
          </div>

          {/* Teacher Photo Card Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-500 p-2 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-gray-900/60 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg">
                  <GraduationCap className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Mr. Omar Makawy</h3>
                <p className="text-sm font-semibold text-emerald-300 mt-1">خبير تدريس اللغة الإنجليزية</p>
                <span className="text-xs text-white/70 mt-3 max-w-xs">
                  تبسيط المنهج وشرح القواعد والمهارات بأحدث الطرق التعليمية
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
