'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Package } from '@/types';
import { apiClient } from '@/lib/api';
import { packages as mockPackages, academicYears } from '@/data/mock';
import { Package as PackageIcon, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function PackagesPage() {
  const { student } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState<number | 'all'>('all');
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Set default filter tab to student's academic year if logged in
  useEffect(() => {
    if (student?.academicYearId) {
      setSelectedYearId(student.academicYearId);
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

  const filterTabs = [
    { id: 'all', title: 'جميع المراحل' },
    { id: 1, title: 'ثالثة إعدادي' },
    { id: 2, title: 'أولى ثانوي' },
    { id: 3, title: 'تانية ثانوي' },
    { id: 4, title: 'تالتة ثانوي' },
  ];

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                الباقات الشهرية
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تصفح واشترك في الباقات الشهرية المتاحة لجميع المراحل الدراسية مع الأستاذ عمر مكاوي
            </p>
          </div>
        </div>

        {/* Academic Year Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = selectedYearId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedYearId(tab.id as number | 'all')}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-102'
                    : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {isActive && <Sparkles className="w-4 h-4 text-amber-300" />}
                {tab.title}
              </button>
            );
          })}
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
            title="لا توجد باقات متاحة في هذه المرحلة"
            description="اختر مرحلة دراسية أخرى من الفلاتر بالأعلى لعرض الباقات المتاحة."
          />
        )}
      </div>
    </StudentLayout>
  );
}
