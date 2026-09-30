'use client';

import React from 'react';
import { packages } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Package as PackageIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PackagesSection() {
  const { openAuthGate, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleSubscribe = (packageId: number) => {
    if (!isAuthenticated) {
      openAuthGate(`/packages/${packageId}`);
    } else {
      window.location.href = `/student/subscriptions`;
    }
  };

  const activePackages = packages.filter((pkg) => pkg.isActive);

  return (
    <section id="packages" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-xs px-4 py-1.5 rounded-full mb-3 border border-[#c5dbc9] dark:border-stone-700 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#0d6e4f]" />
            <span>{t('packages.badge', 'باقات الاشتراك الشهرية')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('packages.title', 'الباقات الشهرية المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
            {t('packages.subtitle', 'اختر الباقة المناسبة لك للاشتراك المباشر والوصول إلى كافة المحاضرات والمذكرات.')}
          </p>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activePackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col bg-white dark:bg-stone-900 border ${
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

      </div>
    </section>
  );
}
