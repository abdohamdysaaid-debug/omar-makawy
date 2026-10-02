'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, PlayCircle, ArrowLeft } from 'lucide-react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { academicYears } from '@/data/mock';
import { resolveMediaUrl } from '@/lib/api/client';

interface CourseCardProps {
  course: Course;
  onOpenDetails?: (course: Course) => void;
}

export default function CourseCard({ course, onOpenDetails }: CourseCardProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthGate } = useAuth();
  const { t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);

  const title = course.title_ar || course.title || 'كورس تعليمي';
  const description = course.description_ar || course.description;
  const rawImage = course.thumbnail_url || course.imageUrl;
  const image = !imageError ? resolveMediaUrl(rawImage) : undefined;

  const academicYear = academicYears.find(
    (y) => y.id === course.academicYearId || y.id === Number(course.academic_year_id)
  );
  const yearTitle = course.academic_year_name_ar || academicYear?.title || t('courses.allYears', 'عام');

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(course);
    } else if (!isAuthenticated && openAuthGate) {
      openAuthGate(`/courses/${course.id}`);
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  const hasDiscount =
    typeof course.discount_price === 'number' &&
    course.discount_price > 0 &&
    course.discount_price < course.price;

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer rounded-3xl bg-white dark:bg-[#131b2e] border border-stone-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-xl hover:shadow-[#0d6e4f]/10 dark:hover:shadow-emerald-500/10 hover:border-[#0d6e4f] dark:hover:border-emerald-500/60 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
    >
      {/* Top Banner Box */}
      <div className="relative h-44 bg-gradient-to-br from-[#0d6e4f] via-[#0b5c42] to-[#073b2a] flex items-center justify-center p-4 overflow-hidden text-white">
        {image ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <BookOpen className="w-12 h-12 text-emerald-300 opacity-80 group-hover:scale-110 transition-transform" />
          </div>
        )}

        <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/20 shadow-xs">
            {yearTitle}
          </span>
          <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-full">
            {course.teacher || t('teacher.title', 'Mr. Omar Meckawy')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
            <span>{course.lectureCount || (course as any).lectures_count || 0} {t('courses.lecturesCount', 'محاضرة')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
            <span>{course.duration || '0 h'}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 font-extrabold text-base text-gray-900 dark:text-white">
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#0d6e4f] dark:text-emerald-400 font-black text-xl">{course.discount_price}</span>
                <span className="text-xs text-gray-400 line-through font-normal">{course.price}</span>
                <span className="text-xs text-gray-500 font-bold">{t('ui.currency', 'ج.م')}</span>
              </div>
            ) : course.price > 0 ? (
              <>
                <span className="text-[#0d6e4f] dark:text-emerald-400 font-black text-xl">{course.price}</span>{' '}
                <span className="text-xs text-gray-500 font-bold">{t('ui.currency', 'ج.م')}</span>
              </>
            ) : (
              <span className="text-[#0d6e4f] font-extrabold text-sm">{t('courses.free', 'مجاني')}</span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="px-4 py-2 bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('courses.viewDetails', 'تفاصيل الكورس')}</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
