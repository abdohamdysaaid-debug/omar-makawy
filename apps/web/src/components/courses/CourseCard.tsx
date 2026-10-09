'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, PlayCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { academicYears } from '@/data/mock';
import { resolveMediaUrl } from '@/lib/api/client';

export interface CourseCardProps {
  course: Course;
  onOpenDetails?: (course: Course) => void;
  className?: string;
}

export default function CourseCard({ course, onOpenDetails, className = '' }: CourseCardProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthGate, isSubscribedToCourse } = useAuth();
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
      openAuthGate(`/courses/detail?id=${course.id}`);
    } else {
      router.push(`/student/courses/detail?id=${course.id}`);
    }
  };

  const isPurchased = isSubscribedToCourse(course.id);

  const price = Number(course.price) || 0;
  const discountPrice = course.discount_price ? Number(course.discount_price) : null;
  const hasDiscount =
    discountPrice !== null &&
    discountPrice > 0 &&
    discountPrice < price;

  const lectureCount = course.lectureCount || (course as any).lectures_count || (course as any).lecture_count || 0;

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer rounded-3xl bg-white dark:bg-[#131b2e] border ${
        isPurchased
          ? 'border-emerald-500/80 dark:border-emerald-500 shadow-md'
          : 'border-stone-200/80 dark:border-gray-800/80 shadow-xs'
      } hover:shadow-xl hover:shadow-[#0d6e4f]/10 dark:hover:shadow-emerald-500/10 hover:border-[#0d6e4f] dark:hover:border-emerald-500/60 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 font-cairo ${className}`}
    >
      {/* Top Banner / Image Box */}
      <div className="relative h-44 bg-neutral-900 flex items-center justify-center p-4 overflow-hidden text-white">
        {image ? (
          <>
            <img
              src={image}
              alt={title}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <BookOpen className="w-12 h-12 text-emerald-300 opacity-80 group-hover:scale-110 transition-transform" />
          </div>
        )}

        <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

        {/* Top Badges Bar: Year on start, Price/Status on end */}
        <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span>{yearTitle}</span>
          </span>

          {/* Price or Purchased Status Badge */}
          {isPurchased ? (
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>تم الشراء</span>
            </span>
          ) : hasDiscount ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#0d6e4f] text-white font-black text-xs rounded-full shadow-md backdrop-blur-md border border-emerald-400/30">
              <span className="text-[10px] opacity-75 line-through font-normal">{price}</span>
              <span>{discountPrice} {t('ui.currency', 'ج.م')}</span>
            </div>
          ) : (
            <span className="px-2.5 py-1 bg-[#0d6e4f] text-white font-black text-xs rounded-full shadow-md backdrop-blur-md border border-emerald-400/30">
              {price > 0 ? `${price} ${t('ui.currency', 'ج.م')}` : t('courses.free', 'مجاني')}
            </span>
          )}
        </div>
      </div>

      {/* Card Body - Content directly under image */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-3 text-start">
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2rem]">
            {description || 'كورس تعليمي شامل لشرح المنهج والتدريبات والواجبات والاختبارات.'}
          </p>
        </div>

        {/* Stats / Meta Row */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <PlayCircle className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
            <span>{lectureCount} {t('courses.lecturesCount', 'محاضرة')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
            <span>{course.duration || 'شامل'}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              isPurchased
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-[#0d6e4f] dark:hover:text-white'
            }`}
          >
            {isPurchased ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>عرض تفاصيل الكورس</span>
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              </>
            ) : (
              <>
                <span>{t('courses.viewDetails', 'تفاصيل الكورس')}</span>
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
