'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Play, Clock, BookOpen, Search, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Lecture } from '@/types';
import { apiClient } from '@/lib/api';

interface LectureWithCourse extends Lecture {
  courseTitle?: string;
}

function MyLecturesContent() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search')?.toLowerCase() || '';

  const { isAuthenticated, student } = useAuth();
  const [lectures, setLectures] = useState<LectureWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadMyLectures() {
      setLoading(true);
      try {
        const res = await apiClient.get<LectureWithCourse[]>('/lectures/my-lectures').catch(() => null);
        if (isMounted) {
          if (Array.isArray(res)) {
            setLectures(res);
          } else {
            setLectures([]);
          }
        }
      } catch {
        if (isMounted) setLectures([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMyLectures();

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique course titles from authorized lectures for filtering
  const courseOptions = Array.from(
    new Set(lectures.map((l) => l.courseTitle).filter(Boolean))
  ) as string[];

  // Filter ONLY within authorized lectures returned by backend
  const filteredLectures = lectures.filter((lecture) => {
    // Course filter
    if (selectedCourseFilter !== 'all' && lecture.courseTitle !== selectedCourseFilter) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lecture.title?.toLowerCase().includes(q);
      const matchDesc = lecture.description?.toLowerCase().includes(q);
      const matchCourse = lecture.courseTitle?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCourse;
    }
    return true;
  });

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              محاضراتي
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              المحاضرات والكورسات المتاحة لك بناءً على اشتراكاتك الفعالة
            </p>
          </div>

          {/* Local Search inside authorized lectures */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في محاضراتي..."
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Dynamic Course Filter Pills (Generated ONLY from student's active courses) */}
        {!loading && courseOptions.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 px-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              تصفية:
            </div>

            <button
              onClick={() => setSelectedCourseFilter('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCourseFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              جميع المحاضرات ({lectures.length})
            </button>

            {courseOptions.map((courseTitle) => {
              const count = lectures.filter((l) => l.courseTitle === courseTitle).length;
              return (
                <button
                  key={courseTitle}
                  onClick={() => setSelectedCourseFilter(courseTitle)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCourseFilter === courseTitle
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {courseTitle} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Lectures Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-60 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        ) : filteredLectures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredLectures.map((lecture) => (
              <Link
                key={lecture.id}
                href={`/student/courses/${lecture.courseId}/lectures/${lecture.id}`}
                className="group rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Lecture Thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden flex items-center justify-center">
                  {lecture.imageUrl ? (
                    <img
                      src={lecture.imageUrl}
                      alt={lecture.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-gray-900 to-emerald-900 flex items-center justify-center">
                      <Play className="w-10 h-10 text-emerald-400 opacity-80" />
                    </div>
                  )}

                  {lecture.duration && (
                    <span className="absolute bottom-2 end-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded-md flex items-center gap-1 backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {lecture.duration}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ms-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  {lecture.courseTitle && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="w-3 h-3" />
                      {lecture.courseTitle}
                    </span>
                  )}

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {lecture.title}
                  </h3>

                  {lecture.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {lecture.description}
                    </p>
                  )}
                </div>

                {/* Footer Link Button */}
                <div className="px-4 pb-4 pt-1">
                  <span className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-100 dark:border-emerald-900/50">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    مشاهدة المحاضرة
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon="PlaySquare"
              title="لا توجد محاضرات متاحة لك حالياً"
              description="لم تقم بالاشتراك في أي كورس أو باقة حتى الآن، أو انتهت صلاحية اشتراكك. قم بالاطلاع على الاشتراكات والباقات المتاحة للبدء."
              actionText="تصفح الباقات والاشتراكات"
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
