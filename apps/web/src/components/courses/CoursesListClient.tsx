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
import { ChevronDown, Filter, AlertCircle, RefreshCw } from 'lucide-react';


const LOCAL_STORAGE_GRADE_KEY = 'omar_selected_academic_grade';

function parseGrade(id?: string | number): number | undefined {
  if (!id) return undefined;
  if (typeof id === 'number') return id;
  const map: Record<string, number> = {
    'a0000000-0000-0000-0000-000000000001': 1,
    'a0000000-0000-0000-0000-000000000002': 2,
    'a0000000-0000-0000-0000-000000000003': 3,
    'a0000000-0000-0000-0000-000000000004': 4,
  };
  return map[id] || parseInt(id, 10) || undefined;
}

function getStoredGrade(studentAcademicYearId?: string | number): number | 'all' {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
      if (saved) {
        if (saved === 'all') return 'all';
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && [1, 2, 3, 4].includes(parsed)) {
          return parsed;
        }
      }
    } catch {}
  }
  return parseGrade(studentAcademicYearId) || 'all';
}

function saveStoredGrade(grade: number | 'all') {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(grade));
    } catch {}
  }
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, student } = useAuth();
  const { t } = useLanguage();
  const initialYear = searchParams.get('year');
  const searchQuery = searchParams.get('search')?.toLowerCase();

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize grade from persistent localStorage selection, URL parameter, or student default
  const [selectedYearId, setSelectedYearId] = useState<number | 'all'>(() => {
    if (initialYear) {
      const yearObj = academicYears.find((y) => y.slug === initialYear);
      if (yearObj) return yearObj.id;
    }
    return getStoredGrade(student?.academicYearId);
  });

  // Keep state synced if student logs in later and no manual override exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
      const studentGrade = parseGrade(student?.academicYearId);
      if (!saved && studentGrade) {
        setSelectedYearId(studentGrade);
        saveStoredGrade(studentGrade);
      }
    }
  }, [student?.academicYearId]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any>('/courses');
      if (res && Array.isArray(res.data)) {
        setAvailableCourses(res.data);
      } else if (Array.isArray(res)) {
        setAvailableCourses(res);
      } else {
        setAvailableCourses([]);
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تحميل الكورسات. يرجى المحاولة مرة أخرى.');
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleYearChange = (newVal: number | 'all') => {
    setSelectedYearId(newVal);
    saveStoredGrade(newVal);
  };

  // Filter by academic year and search query
  const filteredCourses = availableCourses.filter((course) => {
    if (selectedYearId !== 'all') {
      const courseGrade = parseGrade(course.academic_year_id || course.academicYearId);
      if (courseGrade && courseGrade !== selectedYearId) {
        return false;
      }
    }
    if (searchQuery) {
      const title = (course.title_ar || course.title || '').toLowerCase();
      const desc = (course.description_ar || course.description || '').toLowerCase();
      return title.includes(searchQuery) || desc.includes(searchQuery);
    }
    return true;
  });


  const selectedYearObj = academicYears.find((y) => y.id === selectedYearId);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in font-cairo">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                الكورسات الدراسية
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearId !== 'all' && selectedYearObj
                ? `عرض جميع الكورسات المتاحة لـ ${selectedYearObj.title}`
                : 'تصفح الكورسات والمناهج الدراسية الشاملة لجميع المراحل'}
            </p>
          </div>

          {/* Persistent Dropdown Select Menu with ChevronDown icon */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#131b2e] p-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs shrink-0 self-start md:self-auto">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">اختر الصف:</span>
            <div className="relative">
              <select
                value={selectedYearId}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  handleYearChange(val);
                }}
                className="appearance-none bg-stone-50 dark:bg-[#0c1017] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white rounded-xl py-2 ps-3 pe-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">جميع المراحل الدراسية</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Course State Render */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/40">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">تعذر تحميل الكورسات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">{error}</p>
            <button
              onClick={() => loadCourses()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
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
              icon="Video"
              title="لا يوجد كورسات حالياً"
              description="لم يتم إضافة أي كورسات تعليمية لهذا الصف أو البحث المحدد حالياً."
              actionText="جميع المراحل"
              actionUrl="/student/courses"
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
