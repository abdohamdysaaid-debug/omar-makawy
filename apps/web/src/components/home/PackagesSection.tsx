'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Package as PackageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import PackageCard from '@/components/packages/PackageCard';

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

  const handleOpenDetails = (pkg: any) => {
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
        const endpoint = '/packages/public?is_public=true&limit=50';
        const res = await apiClient.get<any>(endpoint);
        if (isMounted) {
          let list: any[] = [];
          if (res) {
            if (Array.isArray(res)) list = res;
            else if (res.data && Array.isArray(res.data.data)) list = res.data.data;
            else if (res.data && Array.isArray(res.data.items)) list = res.data.items;
            else if (Array.isArray(res.data)) list = res.data;
            else if (Array.isArray(res.items)) list = res.items;
          }
          setAvailablePackages(list);
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
              <div key={i} className="w-[280px] sm:w-[330px] h-80 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse shrink-0" />
            ))}
          </div>
        ) : activePackages.length > 0 ? (
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-proximity scrollbar-none scroll-smooth py-6 -mx-4 px-4 gap-5 sm:gap-6 touch-pan-x touch-pan-y"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
          >
            {activePackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ amount: 0.55 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="snap-center shrink-0 w-[280px] sm:w-[330px] touch-pan-y"
                style={{ touchAction: 'pan-x pan-y' }}
              >
                <PackageCard pkg={pkg} onOpenDetails={handleOpenDetails} />
              </motion.div>
            ))}
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
