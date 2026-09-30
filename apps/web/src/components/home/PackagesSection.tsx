'use client';

import React, { useRef } from 'react';
import { packages } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Package as PackageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PackagesSection() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSubscribe = (packageId: number) => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(`/packages/${packageId}`)}`;
    } else {
      window.location.href = `/student/subscriptions`;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activePackages = packages.filter((pkg) => pkg.isActive);

  return (
    <section id="packages" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center sm:text-start mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('packages.title', 'الباقات الشهرية المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('packages.subtitle', 'اختر الباقة المناسبة لك للاشتراك المباشر والوصول إلى كافة المحاضرات والمذكرات.')}
          </p>
        </div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth py-4 -mx-4 px-4 gap-5 sm:gap-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activePackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`snap-center shrink-0 w-[290px] sm:w-[340px] relative flex flex-col bg-white dark:bg-stone-900 border ${
                pkg.isPopular
                  ? 'border-[#0d6e4f] dark:border-emerald-500 shadow-xl shadow-[#0d6e4f]/10'
                  : 'border-stone-200/80 dark:border-stone-800 shadow-sm'
              } rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 bg-[#0d6e4f] text-white px-4 py-1 rounded-full text-xs font-black shadow-md font-cairo">
                  الأكثر طلباً ⭐
                </div>
              )}

              <div className="w-16 h-16 bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <PackageIcon className="w-8 h-8" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
                {pkg.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 h-10 text-xs sm:text-sm font-medium">
                {pkg.description}
              </p>

              <div className="text-center mb-6 bg-stone-50 dark:bg-stone-800/60 py-3 rounded-2xl">
                <span className="text-3xl sm:text-4xl font-black text-[#0d6e4f] dark:text-emerald-400">
                  {pkg.price}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 ms-1">
                  جنيه مصرية
                </span>
              </div>

              <ul className="flex-1 space-y-3 mb-8 text-start">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#0d6e4f] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(pkg.id)}
                className={`w-full py-3.5 rounded-full font-extrabold text-sm transition-all shadow-md ${
                  pkg.isPopular
                    ? 'bg-[#0d6e4f] hover:bg-[#0a4834] text-white shadow-[#0d6e4f]/20'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-gray-900 dark:text-white'
                }`}
              >
                اشترك الآن
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Slider Controls (Centered International Style) */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => scroll('right')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Previous"
            title="السابق"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          <div className="h-1.5 w-10 rounded-full bg-stone-300/80 dark:bg-stone-800 overflow-hidden">
            <div className="h-full w-1/2 bg-[#0d6e4f] dark:bg-emerald-500 rounded-full" />
          </div>

          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Next"
            title="التالي"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
