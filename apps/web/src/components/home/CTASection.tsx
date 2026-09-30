'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-r from-emerald-900 via-[#064e3b] to-emerald-950 overflow-hidden text-white">
      {/* Decorative Text */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-9xl font-black text-white/5 whitespace-nowrap pointer-events-none select-none uppercase tracking-widest">
        START NOW
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 font-cairo">
          {t('hero.startJourney', 'ابدأ رحلتك الآن')}
        </h2>
        <p className="text-base sm:text-xl text-emerald-100/90 mb-8 max-w-2xl mx-auto font-medium font-cairo leading-relaxed">
          {t('hero.description', 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي. شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.')}
        </p>
        <Link
          href="/register"
          className="inline-block bg-white hover:bg-emerald-50 text-emerald-950 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all shadow-xl hover:scale-105 font-cairo"
        >
          {t('auth.createAccountNow', 'إنشاء حساب جديد')}
        </Link>
      </div>
    </section>
  );
}
