'use client';

import React from 'react';
import { BookOpen, Sparkles, Globe, Layers, Tag } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export interface CourseCardPreviewProps {
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  thumbnailUrl?: string;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number;
  academicYearName?: string;
  status: string;
  isFeatured: boolean;
  isPublic: boolean;
  isArabic?: boolean;
}

export function CourseCardPreview({
  titleAr,
  titleEn,
  descriptionAr,
  thumbnailUrl,
  price,
  hasDiscount,
  discountPrice,
  academicYearName,
  status,
  isFeatured,
  isPublic,
  isArabic = true,
}: CourseCardPreviewProps) {
  const displayPrice = hasDiscount && discountPrice !== undefined && discountPrice < price ? discountPrice : price;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-between rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden transition-all">
      {/* Course Thumbnail Header (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={titleAr || 'معاينة الكورس'}
            className="h-full w-full object-cover transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 p-4 text-center">
            <BookOpen className="h-10 w-10 stroke-1 mb-1.5 text-neutral-400" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
              {isArabic ? 'معاينة صورة الكورس' : 'Thumbnail Preview'}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              (Aspect Ratio 16:9)
            </span>
          </div>
        )}

        {/* Badges Overlays */}
        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={status || 'DRAFT'} isArabic={isArabic} />

            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                {isArabic ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>

          {isPublic && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs shadow-sm">
              <Globe className="h-3 w-3" />
              {isArabic ? 'الرئيسية' : 'Public'}
            </span>
          )}
        </div>
      </div>

      {/* Course Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Academic Year Scope */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Layers className="h-3.5 w-3.5" />
            <span>{academicYearName || (isArabic ? 'المرحلة الدراسية' : 'Academic Year')}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2 leading-snug">
            {titleAr || (isArabic ? 'عنوان الكورس بالعربية' : 'Arabic Course Title')}
          </h3>

          {titleEn && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 font-mono">
              {titleEn}
            </p>
          )}

          {/* Description */}
          {descriptionAr && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
              {descriptionAr}
            </p>
          )}
        </div>

        {/* Pricing Footer */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium block">
              {isArabic ? 'سعر الكورس' : 'Course Price'}
            </span>
            <div className="flex items-baseline gap-2">
              {price === 0 ? (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {isArabic ? 'مجاني' : 'Free'}
                </span>
              ) : (
                <>
                  <span className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {displayPrice} <span className="text-xs font-normal text-neutral-500">{isArabic ? 'ج.م' : 'EGP'}</span>
                  </span>
                  {hasDiscount && discountPrice !== undefined && discountPrice < price && (
                    <span className="text-xs text-neutral-400 line-through">
                      {price} {isArabic ? 'ج.م' : 'EGP'}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-default"
          >
            {isArabic ? 'اشتراك بالكورس' : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
}
