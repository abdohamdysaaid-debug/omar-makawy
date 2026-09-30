'use client';

import React, { useRef } from 'react';
import { courses } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { PlaySquare, Clock, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeCoursesSection() {
  const { openAuthGate, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleCourseClick = (courseId: number) => {
    if (!isAuthenticated) {
      openAuthGate(`/courses/${courseId}`);
    } else {
      window.location.href = `/courses/${courseId}`;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeCourses = courses.filter((c) => c.isActive);

  return (
    <section id="courses" className="py-14 sm:py-20 bg-white dark:bg-[#080b11] transition-colors font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div className="text-start">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
              {t('courses.title', 'الكورسات المتاحة')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
              {t('courses.subtitle', 'شرح تفصيلي ومتكامل لجميع المراحل الدراسية مع حل تدريبات وامتحانات شفرية.')}
            </p>
          </div>

          {/* Desktop Slider Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white transition-colors shadow-xs"
              aria-label="Previous"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white transition-colors shadow-xs"
              aria-label="Next"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth py-4 -mx-4 px-4 gap-5 sm:gap-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="snap-center shrink-0 w-[280px] sm:w-[330px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Card Header Banner */}
              <div className="relative h-40 bg-[#0d6e4f] p-5 flex flex-col justify-between text-white overflow-hidden">
                <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                    {course.teacher || 'مستر عمر مكاوي'}
                  </span>
                  <span className="bg-emerald-400 text-stone-900 font-black text-[11px] px-2.5 py-0.5 rounded-full">
                    {course.price} ج.م
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-base sm:text-lg font-black leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-2 mb-5">
                  {course.description}
                </p>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 border-t border-stone-100 dark:border-stone-800 pt-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <PlaySquare className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                      <span>{course.lectureCount} محاضرة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white font-extrabold rounded-full text-xs flex items-center justify-center gap-2 transition-all">
                    <span>استكشف الكورس</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
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
