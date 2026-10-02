'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courses, lectures, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import {
  Play,
  Clock,
  CheckCircle2,
  Lock,
  BookOpen,
  FileText,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Course, Lecture } from '@/types';
import { apiClient } from '@/lib/api';

export default function CourseDetailsClient({ courseId }: { courseId: string | number }) {
  const { student, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'lectures' | 'exams' | 'files'>('lectures');
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLectures, setCourseLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic progress telemetry
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseData() {
      setLoading(true);
      try {
        // Try backend API first
        const apiCourse = await apiClient.get<Course>(`/courses/${courseId}`).catch(() => null);
        const apiLectures = await apiClient.get<Lecture[]>(`/courses/${courseId}/lectures`).catch(() => null);

        if (isMounted) {
          if (apiCourse) {
            setCourse(apiCourse);
          } else {
            // Fallback to local course object if found
            const localCourse = courses.find((c) => String(c.id) === String(courseId));
            setCourse(localCourse || null);
          }

          if (Array.isArray(apiLectures)) {
            setCourseLectures(apiLectures);
          } else {
            const localLectures = lectures.filter((l) => String(l.courseId) === String(courseId));
            setCourseLectures(localLectures);
          }
        }
      } catch {
        if (isMounted) {
          const localCourse = courses.find((c) => String(c.id) === String(courseId));
          setCourse(localCourse || null);
          const localLectures = lectures.filter((l) => String(l.courseId) === String(courseId));
          setCourseLectures(localLectures);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourseData();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    // Calculate completed count from lectures array
    const completed = courseLectures.filter((l) => l.status === 'completed').length;
    setCompletedCount(completed);
  }, [courseLectures]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-40 rounded-3xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </StudentLayout>
    );
  }

  if (!course) {
    return (
      <StudentLayout>
        <div className="py-12">
          <EmptyState
            icon="BookOpen"
            title="الكورس غير موجود"
            description="عذراً، لم يتم العثور على هذا الكورس أو تم نقله."
            actionText="الرجوع للكورسات"
            actionUrl="/courses"
          />
        </div>
      </StudentLayout>
    );
  }

  const academicYearObj = academicYears.find((y) => String(y.id) === String(course.academic_year_id || course.academicYearId));
  const totalLectures = courseLectures.length || course.lectureCount || 0;
  const progressPercentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/courses" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            المحاضرات
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">{course.title_ar || course.title}</span>
        </div>

        {/* Course Header Overview Card (Matching Reference Image) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
            <BookOpen className="w-10 h-10" />
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {course.academic_year_name_ar || academicYearObj?.title || 'عام'}
              </span>
              {progressPercentage === 100 && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مكتمل
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Dynamic Progress Telemetry */}
            <div className="space-y-1.5 pt-2 max-w-md">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500 dark:text-gray-400">
                  {completedCount} من {totalLectures} محاضرات مكتملة
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (المحاضرات | الاختبارات | ملفات إضافية) */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('lectures')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'lectures'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            المحاضرات ({courseLectures.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            الاختبارات
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'files'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            ملفات إضافية
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'lectures' && (
          <div className="space-y-3">
            {courseLectures.length > 0 ? (
              courseLectures.map((lecture, index) => {
                const isCompleted = lecture.status === 'completed';
                const isLocked = lecture.isLocked;

                return (
                  <div
                    key={lecture.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131b2e] border transition-all flex items-center justify-between gap-4 ${
                      isCompleted
                        ? 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/10'
                        : 'border-gray-100 dark:border-gray-800/80 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Index Circle */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isLocked
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                          {lecture.title}
                        </h3>
                        {lecture.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {lecture.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {lecture.duration && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hidden sm:flex">
                          <Clock className="w-3.5 h-3.5" />
                          {lecture.duration}
                        </span>
                      )}

                      {isLocked ? (
                        <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </div>
                      ) : (
                        <Link
                          href={`/courses/${course.id}/lectures/${lecture.id}`}
                          className={`p-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 fill-current" />
                          )}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon="PlaySquare"
                title="لا توجد محاضرات متاحة حالياً"
                description="لم تقم الإدارة بنشر محاضرات في هذا الكورس بعد."
              />
            )}
          </div>
        )}

        {activeTab === 'exams' && (
          <EmptyState
            icon="HelpCircle"
            title="لا توجد اختبارات متاحة حالياً"
            description="سيتم إضافة الاختبارات التقييمية الخاصة بهذا الكورس فور اعتمادها من المعلم."
          />
        )}

        {activeTab === 'files' && (
          <EmptyState
            icon="FileText"
            title="لا توجد ملفات إضافية حالياً"
            description="عند إرفاق مذكرات ملخصة أو ملفات PDF جديدة ستظهر في هذه القائمة."
          />
        )}
      </div>
    </StudentLayout>
  );
}
