'use client';

import React from 'react';
import { Package as PackageIcon, Sparkles, Globe, Layers, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export interface PackageCardPreviewProps {
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

export function PackageCardPreview({
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
}: PackageCardPreviewProps) {
  const displayPrice =
    hasDiscount && discountPrice !== undefined && discountPrice < price ? discountPrice : price;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-between rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden transition-all">
      {/* Top Banner / Cover Header */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 p-4 flex flex-col justify-between text-white overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={titleAr || 'معاينة الباقة'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/80 text-center p-2">
            <PackageIcon className="h-10 w-10 text-emerald-300 stroke-1 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isArabic ? 'معاينة صورة الباقة' : 'Package Preview'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 backdrop-blur-xs pointer-events-none" />

        {/* Badges Overlays */}
        <div className="relative z-10 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={status || 'DRAFT'} isArabic={isArabic} />

            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                {isArabic ? 'مميزة' : 'Featured'}
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

        <div className="relative z-10">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200 mb-0.5">
            <Layers className="h-3 w-3" />
            <span>{academicYearName || (isArabic ? 'المرحلة الدراسية' : 'Academic Year')}</span>
          </div>
          <h3 className="text-base font-extrabold text-white line-clamp-1">
            {titleAr || (isArabic ? 'عنوان الباقة بالعربية' : 'Arabic Package Title')}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {titleEn && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 font-mono">
              {titleEn}
            </p>
          )}

          {descriptionAr ? (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
              {descriptionAr}
            </p>
          ) : (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">
              {isArabic ? 'لا يوجد وصف مدخل' : 'No description provided'}
            </p>
          )}

          <ul className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <li className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{isArabic ? 'وصول شامل لجميع كورسات الباقة' : 'Full access to bundle courses'}</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{isArabic ? 'تحديثات مجانية طوال فترة الاشتراك' : 'Free updates during subscription'}</span>
            </li>
          </ul>
        </div>

        {/* Pricing & Action */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium block">
              {isArabic ? 'سعر الاشتراك' : 'Package Price'}
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
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-default"
          >
            {isArabic ? 'اشتراك بالباقة' : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
}
