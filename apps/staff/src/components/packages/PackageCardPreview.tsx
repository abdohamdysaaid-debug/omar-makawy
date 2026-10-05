'use client';

import React from 'react';
import { Package as PackageIcon, BookOpen, Star, Globe, EyeOff, Tag } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

import { resolveMediaUrl } from '@omar-makawy/shared';

export interface PackageCardPreviewProps {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  academicYearName?: string;
  price?: number;
  discountPrice?: number | null;
  thumbnailUrl?: string | null;
  status?: string;
  isPublished?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  coursesCount?: number;
  isArabic?: boolean;
}

export function PackageCardPreview({
  titleAr,
  titleEn,
  descriptionAr,
  academicYearName,
  price = 0,
  discountPrice = null,
  thumbnailUrl,
  status = 'PUBLISHED',
  isPublished = true,
  isPublic = false,
  isFeatured = false,
  coursesCount = 0,
  isArabic = true,
}: PackageCardPreviewProps) {
  const [imgError, setImgError] = React.useState<boolean>(false);
  const displayTitle =
    (isArabic ? titleAr : titleEn) || titleAr || (isArabic ? 'عنوان الباقة' : 'Package Title');
  const hasDiscount =
    typeof discountPrice === 'number' && discountPrice > 0 && discountPrice < price;

  const resolvedUrl = React.useMemo(() => {
    return resolveMediaUrl(thumbnailUrl);
  }, [thumbnailUrl]);

  React.useEffect(() => {
    setImgError(false);
  }, [resolvedUrl]);

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* 16:9 Image / Banner Container */}
      <div className="relative aspect-video w-full bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
        {resolvedUrl && !imgError ? (
          <img
            src={resolvedUrl}
            alt={displayTitle}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 gap-2">
            <PackageIcon className="h-10 w-10 text-brand-500 opacity-60" />
            <span className="text-[11px] font-medium">
              {isArabic ? 'صورة الغلاف (16:9)' : 'Cover Image (16:9)'}
            </span>
          </div>
        )}

        {/* Academic Year Badge */}
        {academicYearName && (
          <span className="absolute top-2.5 start-2.5 px-2.5 py-0.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold rounded-lg border border-white/10 shadow-xs">
            {academicYearName}
          </span>
        )}

        {/* Badges Container (Top End) */}
        <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-lg shadow-sm">
              <Star className="h-3 w-3 fill-black" />
              <span>{isArabic ? 'مميز' : 'Featured'}</span>
            </span>
          )}
          {isPublic && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
              <Globe className="h-3 w-3" />
              <span>{isArabic ? 'الرئيسية' : 'Public'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Status and Publication Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <StatusBadge status={status} isArabic={isArabic} />
            {!isPublished && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                <EyeOff className="h-3 w-3" />
                {isArabic ? 'مخفي' : 'Unpublished'}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1 leading-snug">
            {displayTitle}
          </h4>

          {/* Description */}
          {descriptionAr && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
              {descriptionAr}
            </p>
          )}

          {/* Courses Count */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isArabic ? `عدد الكورسات: ${coursesCount}` : `Courses: ${coursesCount}`}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <Tag className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>{isArabic ? 'السعر:' : 'Price:'}</span>
          </div>

          <div className="text-end">
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                  {discountPrice} {isArabic ? 'ج.م' : 'EGP'}
                </span>
                <span className="text-xs text-neutral-400 line-through">{price}</span>
              </div>
            ) : price > 0 ? (
              <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                {price} {isArabic ? 'ج.م' : 'EGP'}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isArabic ? 'مجاني' : 'Free'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
