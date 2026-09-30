'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { courses as mockCourses, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import CourseCard from '@/components/courses/CourseCard';
import EmptyState from '@/components/ui/EmptyState';
import StudentLayout from '@/components/layout/StudentLayout';
import { Course } from '@/types';
import { apiClient } from '@/lib/api';

function CoursesContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, student } = useAuth();
  const { t } = useLanguage();
  const initialYear = searchParams.get('year');
  const searchQuery = searchParams.get('search')?.toLowerCase();

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Default selection based on logged in student's academic year
  const getDefaultFilter = (): number | 'all' => {
    if (isAuthenticated && student?.academicYearId) {
      return student.academicYearId;
    }
    if (initialYear) {
      const yearObj = academicYears.find((y) => y.slug === initialYear);
      return yearObj ? yearObj.id : 'all';
    }
    return 'all';
  };

  const [selectedYearId, setSelectedYearId] = useState<number | 'all'>(getDefaultFilter);

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      setLoading(true);
      try {
        const res = await apiClient.get<Course[]>('/courses').catch(() => null);
        if (isMounted) {
          if (Array.isArray(res) && res.length > 0) {
            setAvailableCourses(res);
          } else {
            setAvailableCourses(mockCourses);
          }
        }
      } catch {
        if (isMounted) setAvailableCourses(mockCourses);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter by academic year (Isolation rules) and search query
  const filteredCourses = availableCourses.filter((course) => {
    // Academic Year isolation filter
    if (selectedYearId !== 'all' && course.academicYearId !== selectedYearId) {
      return false;
    }
    // Search query filter
    if (searchQuery) {
      const matchTitle = course.title.toLowerCase().includes(searchQuery);
      const matchDesc = course.description?.toLowerCase().includes(searchQuery);
      return matchTitle || matchDesc;
    }
    return true;
  });

  const selectedYearObj = academicYears.find((y) => y.id === selectedYearId);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('courses.title', 'المحاضرات والكورسات المتاحة')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAuthenticated && student
              ? `${t('courses.showingFor', 'يتم عرض الكورسات المتاحة لـ')} ${student.academicYearName || selectedYearObj?.title || ''}`
              : t('courses.subtitle', 'تصفح جميع الكورسات والمراحل الدراسية')}
          </p>
        </div>

        {/* Academic Year Filter Pills */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          {!isAuthenticated && (
            <button
              onClick={() => setSelectedYearId('all')}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedYearId === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              {t('courses.allYears', 'جميع المراحل')}
            </button>
          )}

          {academicYears.map((year) => {
            const isAssigned = isAuthenticated && student?.academicYearId === year.id;

            return (
              <button
                key={year.id}
                onClick={() => setSelectedYearId(year.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedYearId === year.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {year.title}
                {isAssigned && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ms-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon="BookOpen"
              title={t('courses.noCoursesFound', 'لا توجد كورسات متاحة حالياً')}
              description={t('courses.noCoursesDesc', 'لم يتم العثور على كورسات تطابق هذا الفلتر أو هذه المرحلة الدراسية حالياً.')}
              actionText={t('courses.allYears', 'جميع الكورسات')}
              actionUrl="/courses"
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default function CoursesListClient() {
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
      <CoursesContent />
    </Suspense>
  );
}
