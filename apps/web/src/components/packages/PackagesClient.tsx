'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { Package as PackageIcon, CheckCircle2, Sparkles, ArrowRight, ChevronDown, Filter } from 'lucide-react';

interface AcademicYearItem {
  id: string | number;
  title: string;
  code?: string;
  stage_order?: number;
}

const LOCAL_STORAGE_GRADE_KEY = 'omar_selected_academic_grade';

const DEFAULT_YEARS: AcademicYearItem[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', title: 'الصف الثالث الإعدادي', code: 'THIRD_PREPARATORY', stage_order: 1 },
  { id: 'a0000000-0000-0000-0000-000000000002', title: 'الصف الأول الثانوي', code: 'FIRST_SECONDARY', stage_order: 2 },
  { id: 'a0000000-0000-0000-0000-000000000003', title: 'الصف الثاني الثانوي', code: 'SECOND_SECONDARY', stage_order: 3 },
  { id: 'a0000000-0000-0000-0000-000000000004', title: 'الصف الثالث الثانوي', code: 'THIRD_SECONDARY', stage_order: 4 },
];

export default function PackagesClient() {
  const { student, isAuthenticated } = useAuth();
  const [yearsList, setYearsList] = useState<AcademicYearItem[]>(DEFAULT_YEARS);
  const [selectedYearId, setSelectedYearId] = useState<string | number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return 'all';
  });
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real academic years dynamically
  useEffect(() => {
    let isMounted = true;
    async function loadYears() {
      try {
        const res = await apiClient.get<any[]>('/auth/academic-years');
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const mapped: AcademicYearItem[] = res.map((item) => ({
            id: item.id,
            title: item.name_ar || item.title || item.name_en || 'صف دراسي',
            code: item.code,
            stage_order: item.stage_order,
          }));
          setYearsList(mapped);

          // If student has an academicYearId and no saved choice, sync with student
          if (student?.academicYearId) {
            const studentYearStr = String(student.academicYearId);
            const found = mapped.find(
              (m) =>
                String(m.id) === studentYearStr ||
                (student.academicYearName && m.title === student.academicYearName)
            );
            if (found && typeof window !== 'undefined') {
              const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
              if (!saved) {
                setSelectedYearId(found.id);
              }
            }
          }
        }
      } catch {
        // Fallback already in initial state
      }
    }
    loadYears();
    return () => {
      isMounted = false;
    };
  }, [student?.academicYearId, student?.academicYearName]);

  // Load packages
  useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      setLoading(true);
      try {
        // 1. Try public packages endpoint first (returns all published packages)
        let res: any = await apiClient.get<any>('/packages/public?limit=100').catch(() => null);

        // 2. Fallback to /packages
        if (!res || (!res.data && !Array.isArray(res))) {
          res = await apiClient.get<any>('/packages?limit=100').catch(() => null);
        }

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

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleYearChange = (newVal: string | number | 'all') => {
    setSelectedYearId(newVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(newVal));
      } catch {}
    }
  };

  // Filter packages based on selected academic year
  const filteredPackages = availablePackages.filter((pkg) => {
    if (selectedYearId === 'all') return true;

    const pkgYearId = String(pkg.academic_year_id || pkg.academicYearId || '');
    const selectedStr = String(selectedYearId);

    if (pkgYearId === selectedStr) return true;

    const selectedYearObj = yearsList.find(
      (y) => String(y.id) === selectedStr || (y.code && y.code === selectedStr)
    );

    if (selectedYearObj) {
      if (pkgYearId === String(selectedYearObj.id)) return true;
      if (pkg.academic_year_name_ar && pkg.academic_year_name_ar === selectedYearObj.title) return true;
      if (pkg.academic_year_code && pkg.academic_year_code === selectedYearObj.code) return true;
    }

    // Fallbacks for numeric IDs 1..4
    if (selectedStr === '1' && (pkgYearId.endsWith('0001') || pkg.academic_year_name_ar?.includes('الإعدادي'))) return true;
    if (selectedStr === '2' && (pkgYearId.endsWith('0002') || pkg.academic_year_name_ar?.includes('الأول الثانوي'))) return true;
    if (selectedStr === '3' && (pkgYearId.endsWith('0003') || pkg.academic_year_name_ar?.includes('الثاني الثانوي'))) return true;
    if (selectedStr === '4' && (pkgYearId.endsWith('0004') || pkg.academic_year_name_ar?.includes('الثالث الثانوي'))) return true;

    return false;
  });

  const selectedYearObj = yearsList.find((y) => String(y.id) === String(selectedYearId));

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Header & Persistent Dropdown Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                باقات مستر عمر مكاوي
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearId !== 'all' && selectedYearObj
                ? `عرض الباقات الشهرية المتاحة لـ ${selectedYearObj.title}`
                : 'تصفح واشترك في باقات مستر عمر مكاوي الشهرية المتاحة لجميع المراحل الدراسية'}
            </p>
          </div>

          {/* Persistent Dropdown Select Menu with ChevronDown icon */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#131b2e] p-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs shrink-0 self-start md:self-auto">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">اختر الصف:</span>
            <div className="relative">
              <select
                value={String(selectedYearId)}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : e.target.value;
                  handleYearChange(val);
                }}
                className="appearance-none bg-stone-50 dark:bg-[#0c1017] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white rounded-xl py-2 ps-3 pe-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">جميع المراحل الدراسية</option>
                {yearsList.map((year) => (
                  <option key={String(year.id)} value={String(year.id)}>
                    {year.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const title = pkg.title_ar || pkg.title || 'باقة تعليمية';
              const description = pkg.description_ar || pkg.description || '';
              const courses = Array.isArray(pkg.courses) ? pkg.courses : [];
              const isPopular = pkg.is_featured || pkg.isPopular;
              const price = Number(pkg.price) || 0;
              const discountPrice = pkg.discount_price ? Number(pkg.discount_price) : null;
              const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < price;

              return (
                <div
                  key={pkg.id}
                  className={`relative p-6 rounded-3xl bg-white dark:bg-[#131b2e] border transition-all duration-300 flex flex-col justify-between space-y-5 hover:shadow-lg ${
                    isPopular
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/10 dark:border-emerald-500/60'
                      : 'border-gray-200/90 dark:border-gray-800/80'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-6 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      الأكثر طلباً
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <PackageIcon className="w-6 h-6" />
                      </div>
                      {pkg.academic_year_name_ar && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {pkg.academic_year_name_ar}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-white pt-1">
                      {title}
                    </h3>
                    {description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {description}
                      </p>
                    )}

                    {courses.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">الكورسات المضمنة:</span>
                        {courses.slice(0, 4).map((c: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{c.title_ar || c.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold">سعر الباقة</span>
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                            {discountPrice} <span className="text-xs font-bold text-gray-500">ج.م</span>
                          </span>
                          <span className="text-xs text-neutral-400 line-through">
                            {price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                          {price} <span className="text-xs font-bold text-gray-500">ج.م</span>
                        </span>
                      )}
                    </div>
                    <Link
                      href={isAuthenticated ? '/student/subscriptions' : `/login?returnUrl=/student/packages`}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                    >
                      اشترك الآن
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="Package"
            title="لا يوجد باقات حالياً"
            description="لم يتم إضافة أي باقات شهرية لهذا الصف حالياً. ستتوفر الباقات فور إضافتها من قبل الإدارة."
          />
        )}
      </div>
    </StudentLayout>
  );
}
