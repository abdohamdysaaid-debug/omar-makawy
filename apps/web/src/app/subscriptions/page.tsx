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
  PlayCircle,
  Clock,
  Layers,
} from 'lucide-react';

let cachedSubscriptionsList: any[] = [];

export default function SubscriptionsPage() {
  const { student, isAuthenticated } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>(() => cachedSubscriptionsList);
  const [loading, setLoading] = useState<boolean>(() => cachedSubscriptionsList.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'packages' | 'courses'>('all');

  const academicYearId = student?.academicYearId;

  const loadSubscriptionsData = async () => {
    if (cachedSubscriptionsList.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      let res: any = await apiClient.get<any[]>('/subscriptions').catch(() => null);

      if (!res || (!Array.isArray(res) && !Array.isArray(res?.data))) {
        res = await apiClient.get<any[]>('/api/v1/subscriptions').catch(() => null);
      }

      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      cachedSubscriptionsList = list;
      setActiveSubscriptions(list);
    } catch (err: any) {
      if (cachedSubscriptionsList.length === 0) {
        setError(err?.message || 'حدث خطأ أثناء تحميل الاشتراكات');
        setActiveSubscriptions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionsData();
  }, [academicYearId, isAuthenticated]);

  const packageSubscriptions = activeSubscriptions.filter((s) => s.item_type === 'PACKAGE');
  const courseSubscriptions = activeSubscriptions.filter((s) => s.item_type === 'COURSE' || !s.item_type);

  const filteredSubscriptions =
    activeFilter === 'packages'
      ? packageSubscriptions
      : activeFilter === 'courses'
      ? courseSubscriptions
      : activeSubscriptions;

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

        {/* Filter Tabs */}
        {activeSubscriptions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0d6e4f] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
              }`}
            >
              <span>الكل ({activeSubscriptions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('packages')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'packages'
                  ? 'bg-[#0d6e4f] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
              }`}
            >
              <PackageIcon className="w-3.5 h-3.5" />
              <span>الباقات ({packageSubscriptions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('courses')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'courses'
                  ? 'bg-[#0d6e4f] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الكورسات ({courseSubscriptions.length})</span>
            </button>
          </div>
        )}

        {/* Subscriptions Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse" />
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
          ) : filteredSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptions.map((sub) => {
                const isPackage = sub.item_type === 'PACKAGE';
                const isCourse = sub.item_type === 'COURSE' || !sub.item_type;
                const title = sub.title_ar || sub.title || (isPackage ? 'باقة تعليمية' : 'كورس تعليمي');
                const description = sub.description_ar || sub.description;
                const rawImage = sub.thumbnail_url || sub.imageUrl;
                const image = resolveMediaUrl(rawImage);

                const targetUrl = isPackage
                  ? `/student/packages/detail?id=${sub.package_id || sub.item_id || sub.id}`
                  : `/student/courses/detail?id=${sub.course_id || sub.item_id || sub.id}`;

                const createdDate = sub.created_at || sub.starts_at || sub.date;
                const formattedDate = createdDate ? new Date(createdDate).toLocaleDateString('ar-EG') : 'اليوم';
                const formattedExpiry = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('ar-EG') : null;

                return (
                  <div
                    key={sub.id}
                    className="group rounded-3xl bg-white dark:bg-[#131b2e] border border-emerald-500/80 dark:border-emerald-500/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                  >
                    {/* Top Banner Box */}
                    <div className="relative h-44 bg-neutral-900 flex items-center justify-center p-4 overflow-hidden text-white">
                      {image ? (
                        <>
                          <img
                            src={image}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          {isPackage ? (
                            <PackageIcon className="w-12 h-12 text-emerald-300 opacity-80 group-hover:scale-110 transition-transform" />
                          ) : (
                            <BookOpen className="w-12 h-12 text-emerald-300 opacity-80 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      )}

                      <div className="absolute -end-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
                          {isPackage ? <PackageIcon className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                          <span>{isPackage ? 'باقة مفعلة' : 'كورس مفعل'}</span>
                        </span>

                        <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          تم الشراء
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4 text-start">
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
                          {title}
                        </h3>

                        {description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>

                      {/* Subscription Info */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                          <span>تاريخ الاشتراك: {formattedDate}</span>
                        </div>
                        {formattedExpiry && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                            صالح حتى: {formattedExpiry}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link
                        href={targetUrl}
                        className="w-full py-3 bg-[#0d6e4f] hover:bg-[#0a4834] text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0d6e4f]/20 hover:scale-[1.02]"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{isPackage ? 'عرض محتوى الباقة' : 'عرض محتوى الكورس'}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
