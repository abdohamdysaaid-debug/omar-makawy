'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { apiClient, resolveMediaUrl } from '@/lib/api';
import {
  CheckCircle2,
  ArrowLeft,
  Video,
  Package as PackageIcon,
  BookOpen,
  Calendar,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { student, isAuthenticated } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const academicYearId = student?.academicYearId;

  const loadSubscriptionsData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: any = await apiClient.get<any[]>('/subscriptions').catch(() => null);

      if (!res || (!Array.isArray(res) && !Array.isArray(res?.data))) {
        res = await apiClient.get<any[]>('/api/v1/subscriptions').catch(() => null);
      }

      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setActiveSubscriptions(list);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تحميل الاشتراكات');
      setActiveSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionsData();
  }, [academicYearId, isAuthenticated]);

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-[#0d6e4f] rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                اشتراكاتي
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              متابعة جميع الكورسات والباقات التعليمية النشطة التي قمت بالاشتراك فيها
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/student/packages"
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-[#0d6e4f] dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-2"
            >
              <PackageIcon className="w-4 h-4" />
              <span>تصفح الباقات</span>
            </Link>

            <Link
              href="/student/courses"
              className="px-4 py-2 bg-[#0d6e4f] hover:bg-[#0a4834] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>تصفح الكورسات</span>
            </Link>
          </div>
        </div>

        {/* Active Subscriptions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              اشتراكاتي المفعلة ({activeSubscriptions.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">تعذر تحميل الاشتراكات</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadSubscriptionsData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : activeSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubscriptions.map((sub) => {
                const isPackage = sub.item_type === 'PACKAGE';
                const isCourse = sub.item_type === 'COURSE';
                const title = sub.title_ar || sub.title || (isPackage ? 'باقة تعليمية' : isCourse ? 'كورس تعليمي' : 'اشتراك مخصص');
                const targetUrl = isPackage
                  ? '/student/courses'
                  : sub.course_id || sub.item_id
                  ? `/courses/${sub.course_id || sub.item_id}`
                  : '/student/courses';

                const createdDate = sub.created_at || sub.starts_at || sub.date;
                const formattedDate = createdDate ? new Date(createdDate).toLocaleDateString('ar-EG') : 'اليوم';
                const formattedExpiry = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('ar-EG') : null;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-start group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0d6e4f] dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-[#0d6e4f] dark:text-emerald-400" />
                            <span>{isPackage ? 'باقة مفعلة' : isCourse ? 'كورس مفعل' : 'اشتراك نشط'}</span>
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>تاريخ التفعيل: {formattedDate}</span>
                          {formattedExpiry && <span>• ينتهي في: {formattedExpiry}</span>}
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
                        {isPackage ? <PackageIcon className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </div>
                    </div>

                    <Link
                      href={targetUrl}
                      className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-emerald-200/60 dark:border-emerald-900/50 shadow-xs"
                    >
                      <span>{isPackage ? 'عرض محتوى الكورسات والمحاضرات' : 'الدخول للكورس والمحاضرات'}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                icon="Package"
                title="لا توجد اشتراكات نشطة حالياً"
                description="عند اشتراكك في أي باقة شهرية أو كورس، ستظهر هنا مباشرة لتتمكن من متابعة دراستك والوصول إلى كافة المحاضرات."
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/student/packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-[#0d6e4f]/25"
                >
                  <PackageIcon className="w-4 h-4" />
                  <span>تصفح الباقات الشهرية</span>
                </Link>

                <Link
                  href="/student/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-gray-800 dark:text-gray-200 font-bold text-sm rounded-2xl transition-all border border-stone-300 dark:border-stone-700"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>تصفح الكورسات المتاحة</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
