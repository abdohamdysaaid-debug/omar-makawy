'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { courses, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import CourseCard from '@/components/courses/CourseCard';
import EmptyState from '@/components/ui/EmptyState';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

function CoursesContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, student } = useAuth();
  const initialYear = searchParams.get('year');
  
  const getDefaultFilter = (): string => {
    if (isAuthenticated && student) {
      const year = academicYears.find(y => y.id === student.academicYearId);
      return year?.slug || 'all';
    }
    return initialYear || 'all';
  };

  const [selectedYear, setSelectedYear] = useState<string>(getDefaultFilter);

  const filteredCourses = courses.filter((course) => {
    if (selectedYear === 'all') return true;
    const year = academicYears.find(y => y.slug === selectedYear);
    return year ? course.academicYearId === year.id : true;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 text-center sm:text-start">
          <h1 className="text-3xl font-cairo font-bold text-gray-900 dark:text-white mb-2">
            الكورسات المتاحة
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            تصفح جميع الكورسات المتاحة لكل المراحل الدراسية
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
          <button
            onClick={() => setSelectedYear('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              selectedYear === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 hover:bg-warm-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            الكل
          </button>
          {academicYears.map((year) => (
            <button
              key={year.id}
              onClick={() => setSelectedYear(year.slug)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                selectedYear === year.slug
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 hover:bg-warm-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {year.title}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-12">
            <EmptyState
              icon="BookOpen"
              title="لا توجد كورسات"
              description="لم يتم العثور على كورسات تطابق بحثك حالياً."
              actionText="عرض الكل"
              actionUrl="/courses"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>}>
        <CoursesContent />
      </Suspense>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
