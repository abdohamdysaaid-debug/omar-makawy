'use client';

import React from 'react';
import { courses, lectures, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';
import LectureCard from '@/components/courses/LectureCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export default function CourseDetailsClient({ courseId }: { courseId: number }) {
  const { isAuthenticated, openAuthGate } = useAuth();
  
  const course = courses.find((c) => c.id === courseId);
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الكورس غير موجود</h1>
          <p className="text-gray-500">عذراً، لم يتم العثور على هذا الكورس</p>
        </div>
      </div>
    );
  }

  const courseLectures = lectures.filter((l) => l.courseId === courseId);
  const academicYear = academicYears.find((y) => y.id === course.academicYearId);
  
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      openAuthGate(`/courses/${course.id}`);
    } else {
      alert('تم الاشتراك بنجاح! (نسخة تجريبية)');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-brand-500/10 to-transparent dark:from-brand-500/5 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-2/3">
              <span className="inline-block bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-xs font-bold mb-4">
                {academicYear?.title || 'عام'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-cairo font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {course.teacher}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 sm:gap-8 mb-8">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <PlayCircle className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{course.lectureCount} محاضرة</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{course.duration}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 md:sticky md:top-24">
              <div className="text-3xl font-bold text-brand-500 mb-6 text-center">
                {course.price} <span className="text-lg font-normal">جنيه</span>
              </div>
              
              <button
                onClick={handleSubscribe}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold text-lg transition-colors mb-4"
              >
                اشترك الآن
              </button>
              
              <div className="space-y-3">
                {course.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-8">
        {isAuthenticated && (
          <div className="bg-white dark:bg-surface-dark rounded-xl p-5 mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">نسبة الإنجاز</span>
              <span className="font-bold text-brand-500">35%</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: '35%' }} />
            </div>
          </div>
        )}

        <h2 className="text-2xl font-cairo font-bold text-gray-900 dark:text-white mb-6">
          محتويات الكورس
        </h2>
        
        <div className="space-y-3">
          {courseLectures.map((lecture, index) => (
            <LectureCard key={lecture.id} lecture={lecture} index={index} />
          ))}
          {courseLectures.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              لا توجد محاضرات متاحة بعد
            </div>
          )}
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
