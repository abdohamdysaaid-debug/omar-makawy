'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Package, Course } from '@/types';
import { apiClient } from '@/lib/api';
import { packages as mockPackages } from '@/data/mock';
import { Package as PackageIcon, CheckCircle2 } from 'lucide-react';

export default function SubscriptionsPage() {
  const { student, isAuthenticated } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const academicYearId = student?.academicYearId;

  useEffect(() => {
    let isMounted = true;

    async function loadSubscriptionsData() {
      setLoading(true);
      try {
        const queryParams = academicYearId ? `?academicYearId=${academicYearId}` : '';
        const userSubs = await apiClient.get<any[]>('/purchases/my-subscriptions').catch(() => []);
        const packagesRes = await apiClient.get<Package[]>(`/packages${queryParams}`).catch(() => []);

        if (isMounted) {
          if (Array.isArray(userSubs) && userSubs.length > 0) {
            setActiveSubscriptions(userSubs);
          } else {
            setActiveSubscriptions([]);
          }

          if (Array.isArray(packagesRes) && packagesRes.length > 0) {
            setAvailablePackages(packagesRes);
          } else {
            const filteredMock = academicYearId
              ? mockPackages.filter((p) => p.academicYearId === academicYearId)
              : mockPackages;
            setAvailablePackages(filteredMock);
          }
        }
      } catch {
        if (isMounted) {
          setActiveSubscriptions([]);
          setAvailablePackages([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSubscriptionsData();

    return () => {
      isMounted = false;
    };
  }, [academicYearId]);

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            الاشتراكات والباقات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            متابعة باقاتك واشتراكاتك النشطة وتصفح الباقات المتاحة للمرحلة الدراسية
          </p>
        </div>

        {/* Active Subscriptions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
            اشتراكاتي النشطة
          </h2>

          {loading ? (
            <div className="h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : activeSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-emerald-200 dark:border-emerald-900/50 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      نشط
                    </span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{sub.title}</h3>
                    <p className="text-xs text-gray-500">تاريخ الاشتراك: {sub.date || 'اليوم'}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Package"
              title="لا توجد اشتراكات نشطة حالياً"
              description="لم تقم بالاشتراك في أي باقة شهرية أو كورس مدفوع حتى الآن."
            />
          )}
        </div>

        {/* Available Packages Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
            الباقات المتاحة للمرحلة الدراسية
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : availablePackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <PackageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{pkg.title}</h3>
                    {pkg.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pkg.description}</p>
                    )}
                    {pkg.features && (
                      <ul className="space-y-2 pt-2">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                      {pkg.price} <span className="text-xs text-gray-500 font-normal">جنيه</span>
                    </span>
                    <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20">
                      اشترك الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Package"
              title="لا توجد باقات متاحة حالياً"
              description="سيتم إتاحة باقات جديدة لمرحلتك الدراسية قريباً."
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
