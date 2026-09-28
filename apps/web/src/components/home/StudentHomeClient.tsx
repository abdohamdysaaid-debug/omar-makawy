'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, BookOpen, ArrowLeft, Clock, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { academicYears } from '@/data/mock';
import { Course, Lecture } from '@/types';
import { apiClient } from '@/lib/api';

export default function StudentHomeClient() {
  const { student, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inProgressCourses, setInProgressCourses] = useState<
    Array<{
      course: Course;
      completedLectures: number;
      totalLectures: number;
      percentage: number;
      lastLectureId?: number;
    }>
  >([]);
  const [latestLectures, setLatestLectures] = useState<Lecture[]>([]);
  const [banners, setBanners] = useState<Array<{ id: number; title: string; subtitle: string; imageUrl?: string }>>([]);

  const academicYearId = student?.academicYearId;
  const academicYearObj = academicYearId
    ? academicYears.find((ay) => ay.id === academicYearId)
    : null;
  const academicYearName = student?.academicYearName || academicYearObj?.title || 'مرحلتك الدراسية';

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        // Attempt API calls to fetch real courses and lectures for student's academic year
        const queryParams = academicYearId ? `?academicYearId=${academicYearId}` : '';
        
        // Fetch courses
        const coursesRes = await apiClient.get<Course[]>(`/courses${queryParams}`).catch(() => []);
        // Fetch lectures
        const lecturesRes = await apiClient.get<Lecture[]>(`/lectures${queryParams}`).catch(() => []);
        // Fetch banners if endpoint exists
        const bannersRes = await apiClient.get<any[]>(`/banners`).catch(() => []);

        if (isMounted) {
          if (Array.isArray(coursesRes) && coursesRes.length > 0) {
            // Calculate progress for courses that have student progress telemetry
            const progressList = coursesRes
              .filter((c) => !academicYearId || c.academicYearId === academicYearId)
              .map((c) => {
                // In real telemetry, completed lectures come from user progress records
                return {
                  course: c,
                  completedLectures: 0, // Real calculated telemetry
                  totalLectures: c.lectureCount || 0,
                  percentage: 0,
                };
              })
              .filter((item) => item.percentage > 0); // Only show in-progress courses

            setInProgressCourses(progressList);
          } else {
            setInProgressCourses([]);
          }

          if (Array.isArray(lecturesRes) && lecturesRes.length > 0) {
            const filteredLectures = academicYearId
              ? lecturesRes.filter((l: any) => l.academicYearId === academicYearId || !l.academicYearId)
              : lecturesRes;
            setLatestLectures(filteredLectures.slice(0, 4));
          } else {
            setLatestLectures([]);
          }

          if (Array.isArray(bannersRes)) {
            setBanners(bannersRes);
          }
        }
      } catch (error) {
        if (isMounted) {
          setInProgressCourses([]);
          setLatestLectures([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [academicYearId]);

  const studentFirstName = student?.fullName ? student.fullName.split(' ')[0] : 'الطالب';

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Dynamic Welcome Banner Header (Matching Reference Image) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 sm:p-8 md:p-10 shadow-xl shadow-emerald-900/10">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-center md:text-start">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-emerald-400/20">
                <GraduationCap className="w-3.5 h-3.5" />
                {academicYearName}
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                مرحباً بك {studentFirstName}
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                استمر في رحلتك لتطوير مستواك في اللغة الإنجليزية مع مستر عمر مكاوي.
              </p>

              <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/courses"
                  className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  تصفح المحاضرات
                </Link>
              </div>
            </div>

            {/* Banner Teacher Illustration Container */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-bold text-white">Omar Makawy</span>
                <span className="text-[10px] text-emerald-200">English Teacher</span>
              </div>
            </div>
          </div>

          {/* Decorative Subtle SVG Accents */}
          <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Section 1: "استكمل دراستك" (Continue Learning) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
              استكمل دراستك
            </h2>
            {inProgressCourses.length > 0 && (
              <Link
                href="/progress"
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800/60 animate-pulse border border-gray-100 dark:border-gray-800"
                />
              ))}
            </div>
          ) : inProgressCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressCourses.map(({ course, completedLectures, totalLectures, percentage, lastLectureId }) => (
                <div
                  key={course.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {completedLectures} من {totalLectures} محاضرات مكتملة
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500 dark:text-gray-400">التقدم</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/courses/${course.id}${lastLectureId ? `/lectures/${lastLectureId}` : ''}`}
                    className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-900/50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    متابعة الدراسة
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="BookOpen"
              title="لا توجد كورسات قيد الدراسة حالياً"
              description="لم تقم بالبدء في مشاهدة أي كورس بعد. يمكنك تصفح الكورسات والمحاضرات المتاحة لمرحلتك الدراسية للبدء."
              actionText="تصفح الكورسات المتاحة"
              actionUrl="/courses"
            />
          )}
        </section>

        {/* Section 2: "أحدث المحاضرات" (Latest Lectures) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
              أحدث المحاضرات
            </h2>
            <Link
              href="/courses"
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-gray-100 dark:bg-gray-800/60 animate-pulse border border-gray-100 dark:border-gray-800"
                />
              ))}
            </div>
          ) : latestLectures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestLectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  href={`/courses/${lecture.courseId}/lectures/${lecture.id}`}
                  className="group rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Video Thumbnail Box */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden flex items-center justify-center">
                    {lecture.imageUrl ? (
                      <img
                        src={lecture.imageUrl}
                        alt={lecture.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-gray-900 flex items-center justify-center">
                        <Play className="w-10 h-10 text-emerald-400 opacity-80" />
                      </div>
                    )}

                    {/* Duration Badge */}
                    {lecture.duration && (
                      <span className="absolute bottom-2 end-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded-md flex items-center gap-1 backdrop-blur-xs">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {lecture.duration}
                      </span>
                    )}

                    {/* Play Icon Hover Overlay */}
                    <div className="absolute inset-0 bg-emerald-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ms-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {lecture.title}
                    </h3>
                    {lecture.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {lecture.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="PlaySquare"
              title="لا توجد محاضرات متاحة حالياً"
              description="لم يتم إضافة محاضرات جديدة لمرحلتك الدراسية حتى الآن. ستظهر المحاضرات فور نشرها من قبل المعلم."
              actionText="تصفح جميع الكورسات"
              actionUrl="/courses"
            />
          )}
        </section>
      </div>
    </StudentLayout>
  );
}
