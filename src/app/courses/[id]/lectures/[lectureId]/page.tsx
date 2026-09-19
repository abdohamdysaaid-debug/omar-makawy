'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lectures } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { Play, FileText, CheckSquare, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function LectureDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, openAuthGate } = useAuth();
  
  const courseId = Number(params?.id);
  const lectureId = Number(params?.lectureId);
  
  const lecture = lectures.find((l) => l.id === lectureId && l.courseId === courseId);
  const courseLectures = lectures.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
  
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthGate(`/courses/${courseId}/lectures/${lectureId}`);
    } else if (lecture?.isLocked) {
      router.push(`/courses/${courseId}`);
    }
  }, [isAuthenticated, lecture, courseId, lectureId, openAuthGate, router]);

  if (!lecture) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">المحاضرة غير موجودة</h1>
          <Link href={`/courses/${courseId}`} className="text-brand-500 hover:underline">الرجوع للكورس</Link>
        </div>
      </div>
    );
  }

  if (lecture.isLocked || !isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  const currentIndex = courseLectures.findIndex(l => l.id === lecture.id);
  const prevLecture = currentIndex > 0 ? courseLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < courseLectures.length - 1 ? courseLectures[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-20 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 py-4">
          <Link href={`/courses/${courseId}`} className="hover:text-brand-500">الرجوع للكورس</Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-900 dark:text-gray-300 font-medium">{lecture.title}</span>
        </div>

        {/* Video Player Placeholder */}
        <div className="w-full aspect-video bg-gray-900 rounded-2xl mb-6 relative overflow-hidden shadow-lg flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent" />
          <Play className="w-16 h-16 text-white/80 mb-4 relative z-10" />
          <span className="text-white/80 font-medium relative z-10 text-xl">Video Player</span>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <h1 className="text-2xl font-cairo font-bold text-gray-900 dark:text-white mb-2">
            {lecture.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lecture.duration}</span>
            </div>
          </div>

          {lecture.description && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {lecture.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timestamps */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                فهرس المحاضرة
              </h3>
              <div className="space-y-2">
                {lecture.timestamps.length > 0 ? (
                  lecture.timestamps.map((ts, idx) => (
                    <button key={idx} className="w-full text-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                      {ts.time} - {ts.label}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">لا يوجد فهرس متاح</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Solution Video */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-brand-500" />
                  حل الأسئلة
                </h3>
                <div className="w-full aspect-video bg-gray-800 rounded-xl flex items-center justify-center max-h-40">
                  <Play className="w-8 h-8 text-white/50" />
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-500" />
                  المرفقات
                </h3>
                {lecture.hasPdf && (
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-500 text-xs font-bold">
                        PDF
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">تحميل المذكرة</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Quiz */}
              {lecture.hasQuiz && (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-brand-500" />
                    اختبار
                  </h3>
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-brand-50/50 dark:bg-brand-900/10">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">اختبر معلوماتك بعد مشاهدة المحاضرة</p>
                    <button className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg font-medium transition-colors">
                      ابدأ الاختبار
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-surface-dark rounded-xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900 dark:text-white">إنجاز المحاضرة</span>
            <span className="font-bold text-brand-500">60%</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {prevLecture ? (
            <Link 
              href={`/courses/${courseId}/lectures/${prevLecture.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <ChevronRight className="w-5 h-5" />
              <span>المحاضرة السابقة</span>
            </Link>
          ) : <div />}
          
          {nextLecture ? (
            <Link 
              href={`/courses/${courseId}/lectures/${nextLecture.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              <span>المحاضرة التالية</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}

export default function LectureDetailsPage() {
  return (
    <>
      <Navbar />
      <LectureDetailsContent />
      <Footer />
    </>
  );
}
