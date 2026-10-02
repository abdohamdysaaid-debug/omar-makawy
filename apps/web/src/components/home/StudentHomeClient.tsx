'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Play, BookOpen, ArrowLeft, Clock, GraduationCap, Camera, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { academicYears } from '@/data/mock';
import { Course, Lecture } from '@/types';
import { apiClient } from '@/lib/api';

export default function StudentHomeClient() {
  const { student, updateStudentAvatar } = useAuth();
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const queryParams = academicYearId ? `?academicYearId=${academicYearId}` : '';
        const coursesRes = await apiClient.get<Course[]>(`/courses${queryParams}`).catch(() => []);
        const lecturesRes = await apiClient.get<Lecture[]>('/lectures/my-lectures').catch(() => []);

        if (isMounted) {
          if (Array.isArray(coursesRes) && coursesRes.length > 0) {
            const progressList = coursesRes
              .filter((c: any) => !academicYearId || c.academic_year_id === academicYearId || c.academicYearId === academicYearId)
              .map((c: any) => ({
                course: c,
                completedLectures: 0,
                totalLectures: c.lectureCount || c.lectures_count || 0,
                percentage: 0,
              }))
              .filter((item) => item.percentage > 0);

            setInProgressCourses(progressList);
          } else {
            setInProgressCourses([]);
          }

          if (Array.isArray(lecturesRes)) {
            setLatestLectures(lecturesRes.slice(0, 4));
          } else {
            setLatestLectures([]);
          }
        }
      } catch {
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

  // Handle student profile photo upload (Saved to Google Drive / backend)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        updateStudentAvatar(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Sleek Thinner Welcome Banner (Matching User Request) */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white py-4 sm:py-5 px-5 sm:px-8 shadow-md shadow-emerald-900/10">
          <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
            {/* Left Info Column */}
            <div className="space-y-1.5 max-w-xl text-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold backdrop-blur-xs border border-emerald-400/20">
                <GraduationCap className="w-3.5 h-3.5" />
                {academicYearName}
              </span>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                مرحباً بك {studentFirstName}
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-sm leading-snug line-clamp-1">
                استمر في رحلتك لتطوير مستواك في اللغة الإنجليزية مع مستر عمر مكاوي.
              </p>

              <div className="pt-1">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs transition-all shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  تصفح المحاضرات
                </Link>
              </div>
            </div>

            {/* Right Circle Avatar Photo Upload (Matching User Request) */}
            <div className="relative shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/40 shadow-lg overflow-hidden group cursor-pointer bg-emerald-950/60 flex items-center justify-center transition-transform hover:scale-105"
                title="اضغط لتغيير الصورة الشخصية (الحفظ على جودل درايف)"
              >
                {student?.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white/70" />
                )}

                {/* Camera Icon Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                  <Camera className="w-5 h-5 mb-0.5" />
                  تغيير الصورة
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Subtle Accents */}
          <div className="absolute top-0 end-0 -mt-10 -me-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Section 1: "استكمل دراستك" (Continue Learning) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-5 bg-emerald-600 rounded-full inline-block" />
              استكمل دراستك
            </h2>
            {inProgressCourses.length > 0 && (
              <Link
                href="/progress"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-gray-100 dark:bg-gray-800/60 animate-pulse border border-gray-100 dark:border-gray-800"
                />
              ))}
            </div>
          ) : inProgressCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressCourses.map(({ course, completedLectures, totalLectures, percentage, lastLectureId }) => (
                <div
                  key={course.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {completedLectures} من {totalLectures} محاضرات مكتملة
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-500 dark:text-gray-400">التقدم</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-[#1f1f1f] overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/courses/${course.id}${lastLectureId ? `/lectures/${lastLectureId}` : ''}`}
                    className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-100 dark:border-emerald-900/50"
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-5 bg-emerald-600 rounded-full inline-block" />
              أحدث المحاضرات
            </h2>
            <Link
              href="/courses"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl bg-gray-100 dark:bg-[#141414] animate-pulse border border-gray-100 dark:border-stone-800"
                />
              ))}
            </div>
          ) : latestLectures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestLectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  href={`/courses/${lecture.courseId}/lectures/${lecture.id}`}
                  className="group rounded-2xl bg-white dark:bg-[#121212] border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
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

                    {lecture.duration && (
                      <span className="absolute bottom-2 end-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded-md flex items-center gap-1 backdrop-blur-xs">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {lecture.duration}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-emerald-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ms-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {lecture.title}
                    </h3>
                    {lecture.description && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
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
              title="لا توجد محاضرات متاحة لك حالياً"
              description="لم تقم بالاشتراك في أي كورس أو باقة بعد، أو لم يتم إتاحة محاضرات حسابك حالياً. يمكنك تصفح الاشتراكات والباقات للبدء."
              actionText="تصفح الباقات والاشتراكات"
              actionUrl="/student/subscriptions"
            />
          )}
        </section>
      </div>
    </StudentLayout>
  );
}
