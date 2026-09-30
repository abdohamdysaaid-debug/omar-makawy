'use client';

import React from 'react';
import { packages } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Package } from 'lucide-react';

export default function PackagesSection() {
  const { openAuthGate, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      openAuthGate();
    } else {
      window.location.href = '/subscriptions';
    }
  };

  return (
    <section id="packages" className="py-12 lg:py-20 bg-white dark:bg-[#060a12] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-emerald-950 dark:text-white mb-3 font-cairo">
            {t('packages.heading', 'الباقات المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-xl mx-auto font-medium font-cairo">
            {t('packages.subheading', 'اختر الباقة المناسبة لك وابدأ رحلة التفوق بأفضل الميزات')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col bg-white dark:bg-[#121212] border-2 ${
                pkg.isPopular
                  ? 'border-emerald-600 shadow-xl shadow-emerald-600/10'
                  : 'border-stone-200/90 dark:border-stone-800'
              } rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-black shadow-md font-cairo">
                  {t('packages.popular', 'الأكثر طلباً')}
                </div>
              )}

              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-6 mx-auto">
                <Package className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-extrabold text-center text-gray-900 dark:text-white mb-2 font-cairo">
                {pkg.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6 font-cairo text-xs sm:text-sm leading-relaxed">
                {pkg.description}
              </p>

              <div className="text-center mb-8">
                <span className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white">{pkg.price}</span>
                <span className="text-gray-500 dark:text-gray-400 font-bold text-sm ms-1 font-cairo">
                  / {t('ui.currency', 'ج.م')}
                </span>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-cairo text-xs sm:text-sm font-semibold">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                className={`w-full py-3.5 rounded-2xl font-black transition-all font-cairo text-sm sm:text-base ${
                  pkg.isPopular
                    ? 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-md'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-gray-900 dark:text-white'
                }`}
              >
                {t('courses.enrollNow', 'اشترك الآن')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
