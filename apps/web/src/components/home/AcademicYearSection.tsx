'use client';
import { academicYears } from '@/data/mock';
import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function AcademicYearSection() {
  return (
    <section id="academic-years" className="py-16 lg:py-24 bg-white dark:bg-bg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-cairo">اختر مرحلتك الدراسية</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-cairo">
            محتوى مصمم خصيصاً لكل مرحلة .. في مكان واحد
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {academicYears.map((year) => (
            <Link key={year.id} href={`/courses?year=${year.slug}`} className="group block">
              <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1">
                <div className="w-full aspect-video bg-warm-100 dark:bg-gray-800 rounded-xl mb-6 flex items-center justify-center text-brand-500 placeholder-img group-hover:scale-105 transition-transform duration-300">
                  <GraduationCap className="w-16 h-16" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4 font-cairo">
                  {year.title}
                </h3>
                <div className="flex justify-center">
                  <span className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
