'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  Clock,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import {
  defaultLecturesApi,
  LectureItem,
  resolveLectureThumbnailUrl,
  formatTimestamp,
} from '@omar-makawy/shared';

function MyLecturesContent() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search')?.toLowerCase() || '';

  const { isAuthenticated, student } = useAuth();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  const loadMyLectures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Authoritative API call: fetches ONLY authorized lectures for authenticated student
      const res = await defaultLecturesApi.getMyLectures();
      if (Array.isArray(res)) {
        setLectures(res);
      } else {
        setLectures([]);
      }
    } catch (err: any) {
      console.error('Failed to load my lectures:', err);
      setError(
        err?.message || (isAr ? 'تعذر تحميل محاضراتك حالياً' : 'Failed to load your lectures at this time')
      );
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    loadMyLectures();
  }, [loadMyLectures]);

  // Extract unique course titles from authorized lectures
  const courseOptions = Array.from(
    new Set(
      lectures
        .map((l: any) => l.courseTitleAr || l.courseTitleEn || l.course_title_ar || l.course_title_en)
        .filter(Boolean)
    )
  ) as string[];

  // Filter within already authorized lectures
  const filteredLectures = lectures.filter((lecture: any) => {
    const courseTitle = lecture.courseTitleAr || lecture.courseTitleEn || lecture.course_title_ar || lecture.course_title_en;

    // Course filter
    if (selectedCourseFilter !== 'all' && courseTitle !== selectedCourseFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAr = lecture.title_ar?.toLowerCase().includes(q) || lecture.titleAr?.toLowerCase().includes(q);
      const matchEn = lecture.title_en?.toLowerCase().includes(q) || lecture.titleEn?.toLowerCase().includes(q);
      const matchDescAr = lecture.description_ar?.toLowerCase().includes(q) || lecture.descriptionAr?.toLowerCase().includes(q);
      const matchDescEn = lecture.description_en?.toLowerCase().includes(q) || lecture.descriptionEn?.toLowerCase().includes(q);
      const matchCourse = courseTitle?.toLowerCase().includes(q);
      return matchAr || matchEn || matchDescAr || matchDescEn || matchCourse;
    }
    return true;
  });

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              {t('lectures.myLectures')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('lectures.subtitle')}
            </p>
          </div>

          {/* Local Search inside authorized lectures */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('lectures.searchPlaceholder')}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Dynamic Course Filter Pills */}
        {!loading && !error && courseOptions.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 px-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              {t('lectures.filter')}
            </div>

            <button
              onClick={() => setSelectedCourseFilter('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCourseFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-stone-900 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              {t('lectures.allLectures')} ({lectures.length})
            </button>

            {courseOptions.map((courseTitle) => {
              const count = lectures.filter(
                (l: any) =>
                  (l.courseTitleAr || l.courseTitleEn || l.course_title_ar || l.course_title_en) ===
                  courseTitle
              ).length;
              return (
                <button
                  key={courseTitle}
                  onClick={() => setSelectedCourseFilter(courseTitle)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCourseFilter === courseTitle
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-stone-900 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {courseTitle} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-gray-100 dark:bg-stone-900 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        ) : error ? (
          /* Error State with Retry */
          <div className="py-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 mx-auto flex items-center justify-center text-red-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {t('ui.error')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
            </div>
            <button
              onClick={loadMyLectures}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              {t('ui.retry')}
            </button>
          </div>
        ) : filteredLectures.length > 0 ? (
          /* Authorized Lectures Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredLectures.map((lecture: any) => {
              const title = isAr
                ? lecture.title_ar || lecture.titleAr
                : lecture.title_en || lecture.titleEn || lecture.title_ar || lecture.titleAr;
              const desc = isAr
                ? lecture.description_ar || lecture.descriptionAr
                : lecture.description_en || lecture.descriptionEn || lecture.description_ar || lecture.descriptionAr;
              const courseTitle = isAr
                ? lecture.courseTitleAr || lecture.course_title_ar || lecture.courseTitleEn
                : lecture.courseTitleEn || lecture.course_title_en || lecture.courseTitleAr;
              const thumbUrl = resolveLectureThumbnailUrl(lecture) || lecture.thumbnail_url || lecture.thumbnailUrl;
              const durationSec = lecture.duration_seconds || lecture.durationSeconds || 0;

              return (
                <Link
                  key={lecture.id}
                  href={`/student/lectures/${lecture.id}`}
                  className="group rounded-2xl bg-white dark:bg-stone-900 border border-gray-200/90 dark:border-gray-800/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  {/* Lecture Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden flex items-center justify-center">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-gray-900 to-emerald-900 flex items-center justify-center">
                        <Play className="w-10 h-10 text-emerald-400 opacity-80" />
                      </div>
                    )}

                    {durationSec > 0 && (
                      <span className="absolute bottom-2 end-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono font-medium rounded-md flex items-center gap-1 backdrop-blur-xs">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {formatTimestamp(durationSec)}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ms-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    {courseTitle && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <BookOpen className="w-3 h-3" />
                        {courseTitle}
                      </span>
                    )}

                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {title}
                    </h3>

                    {desc && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    )}
                  </div>

                  {/* Footer Link Button */}
                  <div className="px-4 pb-4 pt-1">
                    <span className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-100 dark:border-emerald-900/50">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {t('lectures.watchLecture')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="py-8">
            <EmptyState
              icon="PlaySquare"
              title={t('lectures.emptyTitle')}
              description={t('lectures.emptyDescription')}
              actionText={t('lectures.browseSubscriptions')}
              actionUrl="/student/subscriptions"
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default function MyLecturesClient() {
  return (
    <Suspense
      fallback={
        <StudentLayout>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
          </div>
        </StudentLayout>
      }
    >
      <MyLecturesContent />
    </Suspense>
  );
}
