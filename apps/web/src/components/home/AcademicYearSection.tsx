'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { academicYears } from '@/data/mock';
import { useLanguage } from '@/context/LanguageContext';

export default function AcademicYearSection() {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="academic-years" className="py-12 lg:py-20 bg-[#f6f8f5] dark:bg-[#090d16] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-emerald-950 dark:text-white mb-3 font-cairo">
            {t('academicYear.heading', 'اختر مرحلتك الدراسية')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-xl mx-auto font-medium font-cairo">
            {t('academicYear.subheading', 'محتوى مصمم خصيصاً لكل مرحلة لضمان التفوق بأبسط الطرق')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {academicYears.map((year) => {
            const translatedTitle = year.slug.includes('3prep') || year.slug.includes('prep')
              ? t('academicYear.3prep', year.title)
              : year.slug.includes('1sec')
              ? t('academicYear.1sec', year.title)
              : year.slug.includes('2sec')
              ? t('academicYear.2sec', year.title)
              : t('academicYear.3sec', year.title);

            return (
              <Link key={year.id} href={`/courses?year=${year.slug}`} className="group block">
                <div className="bg-white dark:bg-[#121212] border-2 border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:border-emerald-600/50 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl mb-5 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 font-cairo leading-snug">
                    {translatedTitle}
                  </h3>
                  <div className="flex justify-center">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ArrowIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
