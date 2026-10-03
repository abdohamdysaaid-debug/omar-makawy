'use client';

import React, { useRef, useState } from 'react';
import { courses } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { PlaySquare, Clock, ArrowLeft, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { apiClient, resolveMediaUrl } from '@/lib/api';
import { Course } from '@/types';

export interface HomeCoursesSectionProps {
  selectedAcademicYearId?: number | string | null;
}

const GRADE_UUID_MAP: Record<number, string> = {
  1: 'a0000000-0000-0000-0000-000000000001',
  2: 'a0000000-0000-0000-0000-000000000002',
  3: 'a0000000-0000-0000-0000-000000000003',
  4: 'a0000000-0000-0000-0000-000000000004',
};

export default function HomeCoursesSection({ selectedAcademicYearId = null }: HomeCoursesSectionProps) {
  const { isAuthenticated, openAuthGate, isSubscribedToCourse } = useAuth();
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

  const handleCourseClick = (courseId: string | number) => {
    if (!isAuthenticated && openAuthGate) {
      openAuthGate(`/courses/detail?id=${courseId}`);
    } else {
      window.location.href = `/student/courses/detail?id=${courseId}`;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const endpoint = '/courses/public?limit=50';
        const res = await apiClient.get<any>(endpoint);
        if (isMounted) {
          if (res && Array.isArray(res.data)) {
            setAvailableCourses(res.data);
          } else if (Array.isArray(res)) {
            setAvailableCourses(res);
          } else {
            setAvailableCourses([]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'تعذر تحميل الكورسات');
          setAvailableCourses([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCourses();
    return () => { isMounted = false; };
  }, []);

  const activeCourses = availableCourses.filter((course) => {
    if (!selectedAcademicYearId) return true;
    const courseYearId = String(course.academic_year_id || course.academicYearId || '');
    const selectedStr = String(selectedAcademicYearId);

    if (courseYearId === selectedStr) return true;
    if (GRADE_UUID_MAP[Number(selectedAcademicYearId)] === courseYearId) return true;

    if (selectedStr === '1' && (courseYearId.endsWith('0001') || course.academic_year_name_ar?.includes('الإعدادي'))) return true;
    if (selectedStr === '2' && (courseYearId.endsWith('0002') || course.academic_year_name_ar?.includes('الأول الثانوي'))) return true;
    if (selectedStr === '3' && (courseYearId.endsWith('0003') || course.academic_year_name_ar?.includes('الثاني الثانوي'))) return true;
    if (selectedStr === '4' && (courseYearId.endsWith('0004') || course.academic_year_name_ar?.includes('الثالث الثانوي'))) return true;

    return false;
  });


  return (
    <section id="courses" className="py-14 sm:py-20 bg-white dark:bg-[#080b11] transition-colors font-cairo scroll-mt-20">
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
            {t('courses.title', 'الكورسات المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('courses.subtitle', 'شرح تفصيلي ومتكامل لجميع المراحل الدراسية مع حل تدريبات وامتحانات شفرية.')}
          </p>
        </motion.div>

        {/* Courses Container or States */}
        {loading ? (
          <div className="flex overflow-x-auto snap-x snap-proximity scrollbar-none py-6 -mx-4 px-4 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="snap-center shrink-0 w-[280px] sm:w-[330px] h-80 rounded-3xl bg-stone-100 dark:bg-stone-900 animate-pulse border border-stone-200/80 dark:border-stone-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="w-full py-12 px-6 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-center flex flex-col items-center justify-center space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">تعذر تحميل الكورسات</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
          </div>
        ) : activeCourses.length > 0 ? (
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-proximity scrollbar-none scroll-smooth py-6 -mx-4 px-4 gap-5 sm:gap-6 touch-pan-x touch-pan-y"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
          >
            {activeCourses.map((course) => {
              const title = course.title_ar || course.title || 'كورس تعليمي';
              const description = course.description_ar || course.description;
              const rawImage = course.thumbnail_url || course.imageUrl;
              const image = resolveMediaUrl(rawImage);
              const hasDiscount =
                typeof course.discount_price === 'number' &&
                course.discount_price > 0 &&
                course.discount_price < course.price;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.03, y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  viewport={{ amount: 0.55 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onClick={() => handleCourseClick(course.id)}
                  className="snap-center shrink-0 w-[280px] sm:w-[330px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#0d6e4f]/25 dark:hover:shadow-emerald-500/20 hover:border-[#0d6e4f] dark:hover:border-emerald-400 transition-all duration-300 touch-pan-y"
                  style={{ touchAction: 'pan-x pan-y' }}
                >
                  {/* Card Header Banner */}
                  <div className="relative h-44 bg-[#0d6e4f] p-5 flex flex-col justify-between text-white overflow-hidden">
                    {image && (
                      <img
                        src={image}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="bg-black/40 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-white/10">
                        {course.teacher || t('teacher.title', 'Mr. Omar Meckawy')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {hasDiscount ? (
                          <span className="bg-emerald-400 text-stone-900 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                            {course.discount_price} {t('ui.currency', 'ج.م')}
                          </span>
                        ) : (
                          <span className="bg-emerald-400 text-stone-900 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                            {course.price > 0 ? `${course.price} ${t('ui.currency', 'ج.م')}` : t('courses.free', 'مجاني')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-base sm:text-lg font-black leading-snug line-clamp-2 drop-shadow-xs">
                        {title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    {description && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-2 mb-5">
                        {description}
                      </p>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 border-t border-stone-100 dark:border-stone-800 pt-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <PlaySquare className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                          <span>{course.lectureCount || 0} {t('courses.lecturesCount', 'محاضرة')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                          <span>{course.duration || '0 h'}</span>
                        </div>
                      </div>

                      {(() => {
                        const isPurchased = isSubscribedToCourse(course.id);
                        return (
                          <button
                            className={`w-full py-2.5 font-extrabold rounded-full text-xs flex items-center justify-center gap-2 transition-all ${
                              isPurchased
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                : 'bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white'
                            }`}
                          >
                            {isPurchased ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تم الشراء</span>
                              </>
                            ) : (
                              <>
                                <span>{t('courses.exploreCourse', 'تفاصيل الكورس')}</span>
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-12 px-6 rounded-3xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <PlaySquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا يوجد كورسات حالياً</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم إضافة أي كورسات تعليمية لهذا الصف حالياً. سيتوفر المحتوى فور إضافته من قبل الإدارة.
            </p>
          </div>
        )}

        {/* Bottom Slider Controls (ONLY when items exist) */}
        {activeCourses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
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
              className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
              aria-label="Next"
              title="التالي"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
}
