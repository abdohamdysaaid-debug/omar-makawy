'use client';
import { ArrowLeft, Play, User } from 'lucide-react';
import { heroBanner } from '@/data/mock';
import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-warm-200 via-warm-100 to-brand-50 dark:from-surface-dark dark:via-surface-dark/90 dark:to-brand-900/20 py-16 lg:py-24">
      {/* Background Text */}
      <div className="absolute top-10 right-10 -z-10 text-6xl font-black text-black/5 dark:text-white/5 uppercase tracking-widest hidden lg:block rotate-[-10deg]">
        English Opens New Worlds
      </div>
      <div className="absolute bottom-10 left-10 -z-10 text-6xl font-black text-black/5 dark:text-white/5 uppercase tracking-widest hidden lg:block rotate-[10deg]">
        Better English A Brighter You
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">
          {/* Content (visually right in RTL) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-start z-10">
            <span className="inline-block bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold px-4 py-2 rounded-full mb-6">
              مع مستر عمر مكاوي
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6 font-cairo">
              {heroBanner.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl font-cairo">
              {heroBanner.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/courses" className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/30 font-cairo">
                {heroBanner.buttonText}
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-brand-500 hover:text-brand-500 text-gray-800 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all font-cairo">
                <Play className="w-5 h-5 text-brand-500" />
                {heroBanner.secondaryButtonText}
              </button>
            </div>
          </div>

          {/* Image Placeholder (visually left in RTL) */}
          <div className="w-full lg:w-1/2 flex justify-center z-10">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-[3rem] bg-gradient-to-tr from-brand-500 to-brand-400 overflow-hidden shadow-2xl flex items-center justify-center placeholder-img">
              <User className="w-32 h-32 text-white/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
