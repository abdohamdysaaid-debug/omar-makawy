'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
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
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Video,
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Course, Lecture } from '@/types';
import { apiClient, resolveMediaUrl } from '@/lib/api';

interface CourseDetailsClientProps {
  courseId?: string | number;
}

function CourseDetailsInner({ courseId }: CourseDetailsClientProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawParamId = params?.id ? String(params.id) : '';
  const paramId = rawParamId === 'detail' ? '' : rawParamId;
  const searchId = searchParams?.get('id') || searchParams?.get('course_id') || '';
  const effectiveCourseId = courseId || paramId || searchId;

  const { student, isAuthenticated, isSubscribedToCourse } = useAuth();
  const [activeTab, setActiveTab] = useState<'lectures' | 'exams' | 'files'>('lectures');
  const [course, setCourse] = useState<any | null>(null);
  const [courseLectures, setCourseLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPurchased = isSubscribedToCourse(effectiveCourseId);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseData() {
      if (!effectiveCourseId) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Course details
        let apiCourse: any = await apiClient.get<any>(`/courses/${effectiveCourseId}`).catch(() => null);

        if (!apiCourse || !apiCourse.id) {
          const publicRes = await apiClient.get<any>(`/courses/public?limit=100`).catch(() => null);
          const list = Array.isArray(publicRes?.data) ? publicRes.data : Array.isArray(publicRes) ? publicRes : [];
          apiCourse = list.find((c: any) => String(c.id) === String(effectiveCourseId) || String(c.slug) === String(effectiveCourseId)) || null;
        }

        if (!apiCourse && !isAuthenticated) {
          const localCourse = courses.find((c) => String(c.id) === String(effectiveCourseId));
          if (localCourse) apiCourse = localCourse;
        }

        if (isMounted && apiCourse) {
          setCourse(apiCourse);
        }

        // 2. Fetch Course Lectures
        let apiLectures: any = await apiClient.get<any>(`/courses/${effectiveCourseId}/lectures`).catch(() => null);

        if (!apiLectures || (!Array.isArray(apiLectures) && !Array.isArray(apiLectures?.data))) {
          apiLectures = await apiClient.get<any>(`/lectures?course_id=${effectiveCourseId}&limit=100`).catch(() => null);
        }

        let rawLecturesList: any[] = [];
        if (Array.isArray(apiLectures)) {
          rawLecturesList = apiLectures;
        } else if (apiLectures && Array.isArray(apiLectures.data)) {
          rawLecturesList = apiLectures.data;
        } else {
          // Fallback to local data
          const localLectures = lectures.filter((l) => String(l.courseId) === String(effectiveCourseId));
          if (localLectures.length > 0) rawLecturesList = localLectures;
        }

        if (isMounted) {
          setCourseLectures(rawLecturesList);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'تعذر تحميل بيانات الكورس');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourseData();

    return () => {
      isMounted = false;
    };
  }, [effectiveCourseId, isAuthenticated]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse font-cairo">
          <div className="h-8 w-48 rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !course) {
    return (
      <StudentLayout>
        <div className="py-12 font-cairo">
          <EmptyState
            icon="BookOpen"
            title="الكورس غير موجود"
            description={error || 'عذراً، لم يتم العثور على هذا الكورس التعليمي أو قد تم نقله.'}
            actionText="الرجوع إلى الكورسات"
            actionUrl="/student/courses"
          />
        </div>
      </StudentLayout>
    );
  }

  const title = course.title_ar || course.title || 'كورس تعليمي';
  const description = course.description_ar || course.description || '';
  const rawImage = course.thumbnail_url || course.imageUrl;
  const image = resolveMediaUrl(rawImage);
  const academicStageName = course.academic_year_name_ar || course.academicYearName || 'المرحلة الدراسية';

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Link href="/student" className="hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <Link href="/subscriptions" className="hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors">
            اشتراكاتي
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-bold line-clamp-1">{title}</span>
        </div>

        {/* Course Hero Banner Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0d6e4f] to-[#042f24] text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-700/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-start">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-black backdrop-blur-md border border-white/20">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                  <span>كورس تعليمي</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-emerald-100 text-xs font-bold border border-white/10">
                  <span>{academicStageName}</span>
                </span>

                {isPurchased && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-sm border border-emerald-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>أنت مشترك بهذا الكورس</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {title}
              </h1>

              {description && (
                <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                  {description}
                </p>
              )}

              {/* Key Metrics */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-emerald-100/80">
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-300" />
                  <span>{courseLectures.length} محاضرات متاحة</span>
                </span>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative shrink-0 w-full sm:w-64 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-emerald-950/60 flex items-center justify-center">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-emerald-300/70" />
              )}
            </div>
          </div>

          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Tabs Bar: [المحاضرات (X)] [الاختبارات (0)] [الملفات (0)] */}
        <div className="flex items-center gap-2 border-b border-gray-200/70 dark:border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('lectures')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'lectures'
                ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>المحاضرات ({courseLectures.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>الاختبارات (0)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المذكرات والملفات (0)</span>
          </button>
        </div>

        {/* Tab 1: المحاضرات */}
        {activeTab === 'lectures' && (
          <div className="space-y-4">
            {courseLectures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courseLectures.map((lecture, index) => {
                  const lecTitle = lecture.title_ar || lecture.title || `المحاضرة ${index + 1}`;
                  const lecDesc = lecture.description_ar || lecture.description || '';
                  const lecDuration =
                    lecture.duration ||
                    (lecture.duration_seconds
                      ? `${Math.floor(lecture.duration_seconds / 60)} دقيقة`
                      : null);
                  const lecImage = resolveMediaUrl(lecture.thumbnail_url || lecture.imageUrl);
                  const isCompleted = Boolean(lecture.is_completed || lecture.status === 'completed');

                  return (
                    <div
                      key={lecture.id}
                      className="group flex flex-col bg-white dark:bg-[#131b2e] border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-[#0d6e4f]/15 hover:border-[#0d6e4f] transition-all duration-300"
                    >
                      {/* Image Banner */}
                      <div className="relative h-36 bg-neutral-900 p-4 flex flex-col justify-between text-white overflow-hidden">
                        {lecImage && (
                          <>
                            <img
                              src={lecImage}
                              alt={lecTitle}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                          </>
                        )}
                        <div className="absolute -end-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

                        {/* Top Badge */}
                        <div className="flex items-center justify-between relative z-10">
                          <span className="bg-white/20 backdrop-blur-md text-white font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                            <Video className="w-3.5 h-3.5 text-emerald-300" />
                            <span>المحاضرة #{index + 1}</span>
                          </span>

                          {isCompleted && (
                            <span className="bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              مكتمل
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div className="relative z-10">
                          <h3 className="text-sm font-black leading-snug line-clamp-1 text-white">
                            {lecTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 text-start">
                        {lecDesc && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {lecDesc}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                          {lecDuration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                              {lecDuration}
                            </span>
                          )}
                          <span className="text-gray-400 text-[11px]">مستر عمر مكاوي</span>
                        </div>

                        {/* Watch CTA */}
                        <Link
                          href={`/student/lectures/detail?id=${lecture.id}&courseId=${effectiveCourseId}`}
                          className="w-full py-2.5 bg-[#0d6e4f] hover:bg-[#0a4834] text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#0d6e4f]/20 hover:scale-[1.02]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>مشاهدة المحاضرة</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="Video"
                title="المحاضرات (0)"
                description="لم يتم إضافة أي محاضرات لهذا الكورس حتى الآن. سيتم نشر المحاضرات قريباً."
                actionText="الرجوع للكورسات"
                actionUrl="/student/courses"
              />
            )}
          </div>
        )}

        {/* Tab 2: الاختبارات */}
        {activeTab === 'exams' && (
          <EmptyState
            icon="HelpCircle"
            title="الاختبارات (0)"
            description="لا توجد اختبارات تفاعلية مضافة لهذا الكورس حالياً."
          />
        )}

        {/* Tab 3: المذكرات والملفات */}
        {activeTab === 'files' && (
          <EmptyState
            icon="FileText"
            title="المذكرات والملفات (0)"
            description="لا توجد مذكرات أو ملفات PDF مرفقة بهذا الكورس حالياً."
          />
        )}
      </div>
    </StudentLayout>
  );
}

export default function CourseDetailsClient(props: CourseDetailsClientProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CourseDetailsInner {...props} />
    </React.Suspense>
  );
}
