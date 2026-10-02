'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Package as PackageIcon, ChevronRight, ChevronLeft, ArrowLeft, Star, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

export interface PackagesSectionProps {
  selectedAcademicYearId?: number | string | null;
}

const GRADE_UUID_MAP: Record<number, string> = {
  1: 'a0000000-0000-0000-0000-000000000001',
  2: 'a0000000-0000-0000-0000-000000000002',
  3: 'a0000000-0000-0000-0000-000000000003',
  4: 'a0000000-0000-0000-0000-000000000004',
};

export default function PackagesSection({ selectedAcademicYearId = null }: PackagesSectionProps) {
  const { isAuthenticated, openAuthGate } = useAuth();
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

  const handleSubscribe = (packageId: string | number) => {
    if (!isAuthenticated && openAuthGate) {
      openAuthGate(`/packages`);
    } else {
      window.location.href = `/student/packages`;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchPackages() {
      setLoading(true);
      try {
        const endpoint = '/packages/public?limit=50';
        const res = await apiClient.get<any>(endpoint);
        if (isMounted) {
          if (res && Array.isArray(res.data)) {
            setAvailablePackages(res.data);
          } else if (Array.isArray(res)) {
            setAvailablePackages(res);
          } else {
            setAvailablePackages([]);
          }
        }
      } catch {
        if (isMounted) setAvailablePackages([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchPackages();
    return () => { isMounted = false; };
  }, []);

  const activePackages = availablePackages.filter((pkg) => {
    if (!selectedAcademicYearId) return true;
    const pkgYearId = String(pkg.academic_year_id || pkg.academicYearId || '');
    const selectedStr = String(selectedAcademicYearId);

    if (pkgYearId === selectedStr) return true;
    if (GRADE_UUID_MAP[Number(selectedAcademicYearId)] === pkgYearId) return true;

    if (selectedStr === '1' && (pkgYearId.endsWith('0001') || pkg.academic_year_name_ar?.includes('الإعدادي'))) return true;
    if (selectedStr === '2' && (pkgYearId.endsWith('0002') || pkg.academic_year_name_ar?.includes('الأول الثانوي'))) return true;
    if (selectedStr === '3' && (pkgYearId.endsWith('0003') || pkg.academic_year_name_ar?.includes('الثاني الثانوي'))) return true;
    if (selectedStr === '4' && (pkgYearId.endsWith('0004') || pkg.academic_year_name_ar?.includes('الثالث الثانوي'))) return true;

    return false;
  });

  return (
    <section id="packages" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo scroll-mt-20">
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
            {t('packages.title', 'الباقات الشهرية المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('packages.subtitle', 'اختر الباقة المناسبة لك للاشتراك المباشر والوصول إلى كافة المحاضرات والمذكرات.')}
          </p>
        </motion.div>

        {/* Horizontal Touch Slider or Empty State */}
        {loading ? (
          <div className="flex gap-5 overflow-hidden py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[300px] h-72 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse shrink-0" />
            ))}
          </div>
        ) : activePackages.length > 0 ? (
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-proximity scrollbar-none scroll-smooth py-6 -mx-4 px-4 gap-5 sm:gap-6 touch-pan-x touch-pan-y"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
          >
            {activePackages.map((pkg) => {
              const title = pkg.title_ar || pkg.title || 'باقة تعليمية';
              const description = pkg.description_ar || pkg.description || '';
              const courses = Array.isArray(pkg.courses) ? pkg.courses : [];
              const isPopular = pkg.is_featured || pkg.isPopular;
              const price = Number(pkg.price) || 0;
              const discountPrice = pkg.discount_price ? Number(pkg.discount_price) : null;
              const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < price;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.98 }}
                  viewport={{ amount: 0.55 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`snap-center shrink-0 w-[280px] sm:w-[330px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border ${
                    isPopular
                      ? 'border-[#0d6e4f] dark:border-emerald-500 shadow-xl shadow-[#0d6e4f]/15'
                      : 'border-stone-200/80 dark:border-stone-800 shadow-sm'
                  } rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#0d6e4f]/25 dark:hover:shadow-emerald-500/20 hover:border-[#0d6e4f] dark:hover:border-emerald-400 touch-pan-y`}
                  style={{ touchAction: 'pan-x pan-y' }}
                >
                  {/* Top Image / Banner Header Area */}
                  <div className="relative h-32 sm:h-36 bg-gradient-to-br from-[#0d6e4f] via-[#0b5c42] to-[#073b2a] p-4 flex flex-col justify-between text-white overflow-hidden">
                    <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                    
                    {/* Badges */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <PackageIcon className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{pkg.academic_year_name_ar || 'باقة معتمدة'}</span>
                      </span>
                      {isPopular && (
                        <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-stone-950" />
                          الأكثر طلباً
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="relative z-10">
                      <h3 className="text-base sm:text-lg font-black leading-snug line-clamp-1">
                        {title}
                      </h3>
                      {description && (
                        <p className="text-emerald-100 text-[11px] font-medium line-clamp-1 opacity-90">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    
                    {/* Price Pill */}
                    <div className="text-center mb-4 bg-emerald-50 dark:bg-emerald-950/40 py-2 px-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                      {hasDiscount ? (
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                            {discountPrice}
                          </span>
                          <span className="text-xs text-neutral-400 line-through">
                            {price}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            ج.م
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                            {price}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 ms-1">
                            ج.م
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Included Courses or Features */}
                    <div className="flex-1 space-y-2 mb-5 text-start">
                      {courses.length > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                            <span>الكورسات المضمنة ({courses.length}):</span>
                          </div>
                          {courses.slice(0, 3).map((c: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{c.title_ar || c.title}</span>
                            </div>
                          ))}
                          {courses.length > 3 && (
                            <span className="text-[10px] text-gray-400 ps-5 block">
                              + {courses.length - 3} كورسات إضافية
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                          <span>وصول كامل لكافة المحاضرات والمذكرات</span>
                        </div>
                      )}
                    </div>

                    {/* Subscribe Button */}
                    <button
                      onClick={() => handleSubscribe(pkg.id)}
                      className={`w-full py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                        isPopular
                          ? 'bg-[#0d6e4f] hover:bg-[#0a4834] text-white shadow-[#0d6e4f]/20'
                          : 'bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-[#0d6e4f] dark:hover:text-white'
                      }`}
                    >
                      <span>اشترك الآن</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-12 px-6 rounded-3xl bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <PackageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا يوجد باقات حالياً</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم إضافة أي باقات شهرية لهذا الصف حالياً. ستتوفر الباقات فور إضافتها من قبل الإدارة.
            </p>
          </div>
        )}

        {/* Bottom Slider Controls (ONLY when activePackages.length > 0) */}
        {activePackages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
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
              className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
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
