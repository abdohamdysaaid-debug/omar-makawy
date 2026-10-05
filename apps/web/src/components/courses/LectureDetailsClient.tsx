'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { lectures, courses } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import {
  Play,
  FileText,
  CheckSquare,
  Clock,
  ChevronRight,
  ChevronLeft,
  Video,
  Download,
  CheckCircle2,
  Lock
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Lecture, Course } from '@/types';
import { apiClient } from '@/lib/api';

export default function LectureDetailsClient({
  courseId,
  lectureId,
}: {
  courseId: number;
  lectureId: number;
}) {
  const router = useRouter();
  const { isAuthenticated, openAuthGate } = useAuth();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLectures, setCourseLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'solution' | 'pdf' | 'notes' | 'quiz'>('video');

  useEffect(() => {
    let isMounted = true;

    async function loadLectureData() {
      setLoading(true);
      setAccessDenied(false);
      try {
        let apiLecture: Lecture | null = null;
        try {
          apiLecture = await apiClient.get<Lecture>(`/lectures/${lectureId}`);
        } catch (err: any) {
          if (
            err?.status === 403 ||
            err?.response?.status === 403 ||
            err?.error_code === 'LECTURE_ACCESS_DENIED' ||
            String(err).includes('403')
          ) {
            if (isMounted) {
              setAccessDenied(true);
              setLecture(null);
            }
            return;
          }
        }

        const apiCourse = await apiClient.get<Course>(`/courses/${courseId}`).catch(() => null);
        const apiLectures = await apiClient.get<Lecture[]>(`/courses/${courseId}/lectures`).catch(() => null);

        if (isMounted) {
          if (apiLecture) {
            setLecture(apiLecture);
          } else {
            const localLecture = lectures.find((l) => l.id === Number(lectureId));
            setLecture(localLecture || null);
          }

          if (apiCourse) {
            setCourse(apiCourse);
          } else {
            const localCourse = courses.find((c) => c.id === Number(courseId));
            setCourse(localCourse || null);
          }

          if (Array.isArray(apiLectures)) {
            setCourseLectures(apiLectures);
          } else {
            const localLectures = lectures.filter((l) => l.courseId === Number(courseId));
            setCourseLectures(localLectures);
          }
        }
      } catch {
        if (isMounted) {
          const localLecture = lectures.find((l) => l.id === Number(lectureId));
          setLecture(localLecture || null);
          const localCourse = courses.find((c) => c.id === Number(courseId));
          setCourse(localCourse || null);
          const localLectures = lectures.filter((l) => l.courseId === Number(courseId));
          setCourseLectures(localLectures);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLectureData();

    return () => {
      isMounted = false;
    };
  }, [courseId, lectureId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse">
          <div className="aspect-video rounded-3xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-40 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </StudentLayout>
    );
  }

  if (accessDenied) {
    return (
      <StudentLayout>
        <div className="py-12">
          <EmptyState
            icon="Lock"
            title="غير مصرح لك بمشاهدة هذه المحاضرة"
            description="هذه المحاضرة مخصصة للطلاب المشتركين في الكورس فقط. يرجى تفعيل أو شراء الاشتراك للوصول."
            actionText="تصفح الباقات والاشتراكات"
            actionUrl="/student/subscriptions"
          />
        </div>
      </StudentLayout>
    );
  }

  if (!lecture) {
    return (
      <StudentLayout>
        <div className="py-12">
          <EmptyState
            icon="PlaySquare"
            title="المحاضرة غير موجودة"
            description="عذراً، لم يتم العثور على هذه المحاضرة."
            actionText="الرجوع للكورس"
            actionUrl={`/courses/${courseId}`}
          />
        </div>
      </StudentLayout>
    );
  }

  const sortedLectures = [...courseLectures].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLectures.findIndex((l) => l.id === lecture.id);
  const prevLecture = currentIndex > 0 ? sortedLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < sortedLectures.length - 1 ? sortedLectures[currentIndex + 1] : null;

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <Link href="/courses" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            المحاضرات
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <Link href={`/courses/${courseId}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
            {course?.title || `الكورس #${courseId}`}
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-bold">{lecture.title}</span>
        </div>

        {/* Main Grid: Video Player + Lecture Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Center 2 Columns: Player + Info + Navigation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Box */}
            <div className="relative aspect-video w-full rounded-3xl bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
              {/* Overlay Thumbnail if video not played */}
              {lecture.imageUrl ? (
                <>
                  <img
                    src={lecture.imageUrl}
                    alt={lecture.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 pointer-events-none" />
                </>
              ) : null}

              <div className="relative z-10 flex justify-between items-center text-white/80">
                <span className="text-xs font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  {lecture.title}
                </span>
                {lecture.duration && (
                  <span className="text-xs font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {lecture.duration}
                  </span>
                )}
              </div>

              {/* Big Play Button Overlay */}
              <div className="relative z-10 flex items-center justify-center my-auto">
                <button
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 transform hover:scale-110 transition-all focus:outline-none"
                  aria-label="تشغيل المحاضرة"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ms-1" />
                </button>
              </div>

              {/* Fake Player Bottom Bar Controls */}
              <div className="relative z-10 flex items-center justify-between text-white text-xs bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 fill-current text-emerald-400 cursor-pointer" />
                  <span>00:00 / {lecture.duration || '00:00'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">1x</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">CC</span>
                </div>
              </div>
            </div>

            {/* Lecture Info Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {lecture.title}
              </h1>
              {lecture.description ? (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {lecture.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">لا يوجد وصف للمحاضرة</p>
              )}
            </div>

            {/* Navigation Controls (Previous / Next Lecture) */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {prevLecture ? (
                <Link
                  href={`/courses/${courseId}/lectures/${prevLecture.id}`}
                  className="px-5 py-3 rounded-xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 text-sm font-bold transition-all flex items-center gap-2 shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  المحاضرة السابقة
                </Link>
              ) : (
                <div />
              )}

              {nextLecture ? (
                <Link
                  href={`/courses/${courseId}/lectures/${nextLecture.id}`}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  المحاضرة التالية
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Right Column: Lecture Content Panel (محتوى المحاضرة) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
              <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block" />
              محتوى المحاضرة
            </h2>

            <div className="space-y-2">
              {/* 1. Main Lecture Video Button */}
              <button
                onClick={() => setActiveTab('video')}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold transition-all ${
                  activeTab === 'video'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 shrink-0" />
                  <span>فيديو المحاضرة</span>
                </div>
                {lecture.duration && <span className="text-xs font-semibold opacity-90">{lecture.duration}</span>}
              </button>

              {/* 2. Solution Video (Only render if actually present!) */}
              {(lecture as any).hasSolutionVideo && (
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold transition-all ${
                    activeTab === 'solution'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 shrink-0" />
                    <span>فيديو حل تدريبات</span>
                  </div>
                </button>
              )}

              {/* 3. PDF Attachment (Only render if actually present!) */}
              {lecture.hasPdf && (
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold transition-all ${
                    activeTab === 'pdf'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 shrink-0 text-red-500" />
                    <span>ملف PDF / المذكرة</span>
                  </div>
                  <Download className="w-4 h-4 opacity-80" />
                </button>
              )}

              {/* 4. Quiz/Exam (Only render if actually present!) */}
              {lecture.hasQuiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold transition-all ${
                    activeTab === 'quiz'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 shrink-0" />
                    <span>اختبار المحاضرة</span>
                  </div>
                </button>
              )}

              {/* Lecture Index / Timestamps if available */}
              {lecture.timestamps && lecture.timestamps.length > 0 && (
                <div className="pt-4 space-y-2 border-t border-gray-100 dark:border-gray-800/80">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">فهرس الأجزاء</h3>
                  {lecture.timestamps.map((ts, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between"
                    >
                      <span>{ts.label}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{ts.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
