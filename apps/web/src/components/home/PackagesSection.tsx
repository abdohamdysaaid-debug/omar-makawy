'use client';

import React, { useRef, useState } from 'react';
import { packages } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Package as PackageIcon, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function PackagesSection() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const currentScroll = Math.abs(scrollLeft);
        const progress = Math.min(Math.max(currentScroll / maxScroll, 0), 1);
        setScrollProgress(progress);
      }
    }
  };

  const handleSubscribe = (packageId: number) => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(`/packages/${packageId}`)}`;
    } else {
      window.location.href = `/student/subscriptions`;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const delta = direction === 'left' ? -310 : 310;
      const scrollAmount = isRtl ? -delta : delta;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activePackages = packages.filter((pkg) => pkg.isActive);

  return (
    <section id="packages" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center sm:text-start mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('packages.title', 'الباقات الشهرية المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('packages.subtitle', 'اختر الباقة المناسبة لك للاشتراك المباشر والوصول إلى كافة المحاضرات والمذكرات.')}
          </p>
        </motion.div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-proximity scrollbar-none scroll-smooth py-6 -mx-4 px-4 gap-5 sm:gap-6 touch-pan-x touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        >
          {activePackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ amount: 0.55 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`snap-center shrink-0 w-[280px] sm:w-[330px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border ${
                pkg.isPopular
                  ? 'border-[#0d6e4f] dark:border-emerald-500 shadow-xl shadow-[#0d6e4f]/15'
                  : 'border-stone-200/80 dark:border-stone-800 shadow-sm'
              } rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#0d6e4f]/25 dark:hover:shadow-emerald-500/20 hover:border-[#0d6e4f] dark:hover:border-emerald-400 touch-pan-y`}
              style={{ touchAction: 'pan-x pan-y' }}
            >
              {/* Top Image / Banner Header Area */}
              <div className="relative h-32 sm:h-36 bg-gradient-to-br from-[#0d6e4f] via-[#0b5c42] to-[#073b2a] p-4 flex flex-col justify-between text-white overflow-hidden">
                <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                
                {/* Popular Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <PackageIcon className="w-3.5 h-3.5 text-emerald-300" />
                    <span>باقة معتمدة</span>
                  </span>
                  {pkg.isPopular && (
                    <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
                      الأكثر طلباً ⭐
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="relative z-10">
                  <h3 className="text-base sm:text-lg font-black leading-snug line-clamp-1">
                    {pkg.title}
                  </h3>
                  <p className="text-emerald-100 text-[11px] font-medium line-clamp-1 opacity-90">
                    {pkg.description}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                
                {/* Price Pill */}
                <div className="text-center mb-4 bg-emerald-50 dark:bg-emerald-950/40 py-2 px-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                    {pkg.price}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 ms-1">
                    ج.م / شهرياً
                  </span>
                </div>

                {/* Features List */}
                <ul className="flex-1 space-y-2 mb-5 text-start">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-xs font-bold line-clamp-1">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button - turns emerald green on hover / click / card hover */}
                <button
                  onClick={() => handleSubscribe(pkg.id)}
                  className={`w-full py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    pkg.isPopular
                      ? 'bg-[#0d6e4f] hover:bg-[#0a4834] text-white shadow-[#0d6e4f]/20'
                      : 'bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-[#0d6e4f] dark:hover:text-white'
                  }`}
                >
                  <span>اشترك الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Slider Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => scroll('right')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Previous"
            title="السابق"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          {/* Dynamic Scroll Progress Bar */}
          <div className="relative h-2 w-14 rounded-full bg-stone-200/90 dark:bg-stone-800 overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 bottom-0 w-6 bg-[#0d6e4f] dark:bg-emerald-500 rounded-full transition-all duration-200 ease-out shadow-sm"
              style={{
                [isRtl ? 'right' : 'left']: `${scrollProgress * 58}%`
              }}
            />
          </div>

          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Next"
            title="التالي"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
