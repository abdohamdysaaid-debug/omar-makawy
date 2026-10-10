'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Package as PackageIcon, BookOpen, ArrowLeft, CheckCircle2, Star, Sparkles, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/api/client';

export interface PackageCardProps {
  pkg: any;
  onOpenDetails?: (pkg: any) => void;
  className?: string;
}

export default function PackageCard({ pkg, onOpenDetails, className = '' }: PackageCardProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthGate, isSubscribedToPackage } = useAuth();
  const { t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);

  const title = pkg.title_ar || pkg.title || 'باقة تعليمية';
  const description = pkg.description_ar || pkg.description || '';
  const rawImage = pkg.thumbnail_url || pkg.imageUrl;
  const image = !imageError ? resolveMediaUrl(rawImage) : undefined;

  const courses = Array.isArray(pkg.courses) ? pkg.courses : [];
  const coursesCount = courses.length || pkg.courses_count || (pkg as any).courseCount || 0;
  const isPopular = Boolean(pkg.is_featured || pkg.isPopular);
  const isMonthly = (pkg.package_type || 'MONTHLY') === 'MONTHLY';

  const price = Number(pkg.price) || 0;
  const discountPrice = pkg.discount_price ? Number(pkg.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < price;

  const isPurchased = isSubscribedToPackage(pkg.id);
  const rawYearName = pkg.academic_year_name_ar || pkg.academic_year_name || (pkg as any).academicYearName || '';
  const yearTitle = rawYearName
    ? (rawYearName.includes('الثاني') && !rawYearName.includes('بكالوريا')
        ? rawYearName.replace('الثانوي', 'بكالوريا')
        : rawYearName)
    : (pkg.academic_year_id === 'a0000000-0000-0000-0000-000000000002' || pkg.academic_year_id === 'FIRST_SECONDARY' || pkg.academic_year_id === 2 || pkg.academic_year_id === '2'
        ? 'الصف الأول الثانوي'
        : pkg.academic_year_id === 'a0000000-0000-0000-0000-000000000003' || pkg.academic_year_id === 'SECOND_SECONDARY' || pkg.academic_year_id === 3 || pkg.academic_year_id === '3'
        ? 'الصف الثاني بكالوريا'
        : pkg.academic_year_id === 'a0000000-0000-0000-0000-000000000004' || pkg.academic_year_id === 'THIRD_SECONDARY' || pkg.academic_year_id === 4 || pkg.academic_year_id === '4'
        ? 'الصف الثالث الثانوي'
        : 'باقة تعليمية');

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(pkg);
    } else if (!isAuthenticated && openAuthGate) {
      openAuthGate(`/packages/detail?id=${pkg.id}`);
    } else {
      router.push(`/student/packages/detail?id=${pkg.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer rounded-3xl bg-white dark:bg-[#131b2e] border ${
        isPurchased
          ? 'border-emerald-500/80 dark:border-emerald-500 shadow-md'
          : isPopular
          ? 'border-[#0d6e4f] dark:border-emerald-500 shadow-xl shadow-[#0d6e4f]/10'
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
            <PackageIcon className="w-12 h-12 text-emerald-300 opacity-80 group-hover:scale-110 transition-transform" />
          </div>
        )}

        <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

        {/* Top Badges Bar: Year/Type/Popular on start, Price/Status on end */}
        <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs backdrop-blur-md ${
              isMonthly
                ? 'bg-blue-600/90 text-white border border-blue-400/30'
                : 'bg-purple-600/90 text-white border border-purple-400/30'
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              <span>{isMonthly ? 'باقة شهرية' : 'باقة ترم'}</span>
            </span>
            {isPopular && !isPurchased && (
              <span className="px-2 py-0.5 bg-amber-400 text-stone-950 text-[10px] font-black rounded-full shadow-xs flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-stone-950" />
                <span>مميز</span>
              </span>
            )}
          </div>

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
            {description || 'باقة تعليمية شاملة للمنهج والمحاضرات والمذكرات والاختبارات الدورية.'}
          </p>
        </div>

        {/* Meta Row - Academic Year and Courses count */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 font-black text-sm text-[#0d6e4f] dark:text-emerald-400">
            <GraduationCap className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
            <span className="font-bold tracking-tight">{yearTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <BookOpen className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
            <span>
              {coursesCount > 0
                ? `${coursesCount} ${coursesCount === 1 ? 'كورس' : 'كورسات'}`
                : 'شامل المنهج'}
            </span>
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
                <span>عرض تفاصيل الباقة</span>
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              </>
            ) : (
              <>
                <span>تفاصيل الباقة</span>
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
