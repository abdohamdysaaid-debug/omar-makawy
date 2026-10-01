'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { CheckCircle2, ArrowLeft, Video, Package as PackageIcon } from 'lucide-react';

export default function SubscriptionsPage() {
  const { student, isAuthenticated } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const academicYearId = student?.academicYearId;

  useEffect(() => {
    let isMounted = true;

    async function loadSubscriptionsData() {
      setLoading(true);
      try {
        const userSubs = await apiClient.get<any[]>('/purchases/my-subscriptions').catch(() => []);

        if (isMounted) {
          setActiveSubscriptions(Array.isArray(userSubs) ? userSubs : []);
        }
      } catch {
        if (isMounted) setActiveSubscriptions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSubscriptionsData();

    return () => {
      isMounted = false;
    };
  }, [academicYearId, isAuthenticated]);

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                اشتراكاتي
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              متابعة جميع الكورسات والباقات النشطة التي قمت بالاشتراك فيها
            </p>
          </div>

          <Link
            href="/student/packages"
            className="self-start sm:self-auto px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-2"
          >
            <span>تصفح الباقات المتاحة</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Active Subscriptions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            اشتراكاتي النشطة ({activeSubscriptions.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : activeSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex items-center justify-between transition-all hover:border-emerald-500"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        اشتراك نشط
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{sub.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      تاريخ الاشتراك: {sub.date || 'اليوم'} {sub.expiryDate ? `• ينتهي في: ${sub.expiryDate}` : ''}
                    </p>
                  </div>

                  <Link
                    href="/student/courses"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>متابعة</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                icon="Package"
                title="لا توجد اشتراكات نشطة حالياً"
                description="عند اشتراكك في أي باقة شهرية أو كورس ستظهر هنا مباشرة لتتمكن من متابعة دروسك."
              />
              <div className="text-center pt-2">
                <Link
                  href="/student/packages"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/25"
                >
                  <PackageIcon className="w-5 h-5" />
                  <span>تصفح الباقات الشهرية المتاحة</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
