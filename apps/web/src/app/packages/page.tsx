'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Package } from '@/types';
import { apiClient } from '@/lib/api';
import { packages as mockPackages, academicYears } from '@/data/mock';
import { Package as PackageIcon, CheckCircle2, Sparkles, ArrowRight, ChevronDown, Filter } from 'lucide-react';

const LOCAL_STORAGE_GRADE_KEY = 'omar_selected_academic_grade';

function getStoredGrade(studentAcademicYearId?: number): number | 'all' {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
      if (saved) {
        if (saved === 'all') return 'all';
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && [1, 2, 3, 4].includes(parsed)) {
          return parsed;
        }
      }
    } catch {}
  }
  return studentAcademicYearId || 'all';
}

function saveStoredGrade(grade: number | 'all') {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(grade));
    } catch {}
  }
}

export default function PackagesPage() {
  const { student } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState<number | 'all'>(() => {
    return getStoredGrade(student?.academicYearId);
  });
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync if student logs in later and no manual override exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
      if (!saved && student?.academicYearId) {
        setSelectedYearId(student.academicYearId);
        saveStoredGrade(student.academicYearId);
      }
    }
  }, [student?.academicYearId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      setLoading(true);
      try {
        const queryParams = selectedYearId !== 'all' ? `?academicYearId=${selectedYearId}` : '';
        const res = await apiClient.get<Package[]>(`/packages${queryParams}`).catch(() => []);

        if (isMounted) {
          if (Array.isArray(res) && res.length > 0) {
            setAvailablePackages(res);
          } else {
            const filtered = selectedYearId === 'all'
              ? mockPackages
              : mockPackages.filter((p) => p.academicYearId === selectedYearId);
            setAvailablePackages(filtered);
          }
        }
      } catch {
        if (isMounted) {
          const filtered = selectedYearId === 'all'
            ? mockPackages
            : mockPackages.filter((p) => p.academicYearId === selectedYearId);
          setAvailablePackages(filtered);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, [selectedYearId]);

  const handleYearChange = (newVal: number | 'all') => {
    setSelectedYearId(newVal);
    saveStoredGrade(newVal);
  };

  const selectedYearObj = academicYears.find((y) => y.id === selectedYearId);

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Header & Persistent Dropdown Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                الباقات الشهرية
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearId !== 'all' && selectedYearObj
                ? `عرض الباقات الشهرية المتاحة لـ ${selectedYearObj.title}`
                : 'تصفح واشترك في الباقات الشهرية المتاحة لجميع المراحل الدراسية'}
            </p>
          </div>

          {/* Persistent Dropdown Select Menu with ChevronDown icon */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#131b2e] p-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs shrink-0 self-start md:self-auto">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">اختر الصف:</span>
            <div className="relative">
              <select
                value={selectedYearId}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  handleYearChange(val);
                }}
                className="appearance-none bg-stone-50 dark:bg-[#0c1017] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white rounded-xl py-2 ps-3 pe-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">جميع المراحل الدراسية</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
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
        ) : availablePackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePackages.map((pkg) => {
              const yearObj = academicYears.find((y) => y.id === pkg.academicYearId);
              return (
                <div
                  key={pkg.id}
                  className={`relative p-6 rounded-3xl bg-white dark:bg-[#131b2e] border transition-all duration-300 flex flex-col justify-between space-y-5 hover:shadow-lg ${
                    pkg.isPopular
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/10 dark:border-emerald-500/60'
                      : 'border-gray-200/90 dark:border-gray-800/80'
                  }`}
                >
                  {pkg.isPopular && (
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
                      {yearObj && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {yearObj.title}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-white pt-1">
                      {pkg.title}
                    </h3>
                    {pkg.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {pkg.description}
                      </p>
                    )}

                    {pkg.features && (
                      <ul className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold">سعر الباقة</span>
                      <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                        {pkg.price} <span className="text-xs font-bold text-gray-500">ج.م</span>
                      </span>
                    </div>
                    <Link
                      href={`/login?returnUrl=/student/subscriptions`}
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
            title="لا توجد باقات متاحة بهذا الصف"
            description="اختر صف دراسي آخر من القائمة المنسدلة بالأعلى لعرض الباقات المتاحة."
          />
        )}
      </div>
    </StudentLayout>
  );
}
