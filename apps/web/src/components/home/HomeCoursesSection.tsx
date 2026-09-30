'use client';

import React from 'react';
import { courses } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, PlaySquare, Clock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeCoursesSection() {
  const { openAuthGate, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleCourseClick = (courseId: number) => {
    if (!isAuthenticated) {
      openAuthGate(`/courses/${courseId}`);
    } else {
      window.location.href = `/courses/${courseId}`;
    }
  };

  const activeCourses = courses.filter((c) => c.isActive);

  return (
    <section id="courses" className="py-14 sm:py-20 bg-white dark:bg-[#080b11] transition-colors font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('courses.title', 'الكورسات المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
            {t('courses.subtitle', 'شرح تفصيلي ومتكامل لجميع المراحل الدراسية مع حل تدريبات وامتحانات شفرية.')}
          </p>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activeCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Card Header Banner */}
              <div className="relative h-44 bg-[#0d6e4f] p-6 flex flex-col justify-between text-white overflow-hidden">
                <div className="absolute -end-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-xs px-3 py-1 rounded-full">
                    {course.teacher || 'مستر عمر مكاوي'}
                  </span>
                  <span className="bg-emerald-400 text-stone-900 font-black text-xs px-3 py-1 rounded-full">
                    {course.price} ج.م
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl font-black leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium line-clamp-2 mb-6">
                  {course.description}
                </p>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 border-t border-stone-100 dark:border-stone-800 pt-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <PlaySquare className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                      <span>{course.lectureCount} محاضرة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white font-extrabold rounded-full text-xs flex items-center justify-center gap-2 transition-all">
                    <span>استكشف الكورس</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
