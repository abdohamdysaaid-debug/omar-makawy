'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { academicYears as mockAcademicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import CourseCard from '@/components/courses/CourseCard';
import EmptyState from '@/components/ui/EmptyState';
import StudentLayout from '@/components/layout/StudentLayout';
import { Course } from '@/types';
import { apiClient } from '@/lib/api';
import { ChevronDown, Filter, AlertCircle, RefreshCw } from 'lucide-react';

interface AcademicYearItem {
  id: string | number;
  title: string;
  code?: string;
  stage_order?: number;
}

const LOCAL_STORAGE_GRADE_KEY = 'omar_selected_academic_grade';

function CoursesContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, student } = useAuth();
  const { t } = useLanguage();
  const initialYear = searchParams.get('year');
  const searchQuery = searchParams.get('search')?.toLowerCase();

  const [yearsList, setYearsList] = useState<AcademicYearItem[]>(() =>
    mockAcademicYears.map((y) => ({
      id: y.id,
      title: y.title,
      code: y.slug,
    }))
  );

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected year
  const [selectedYearId, setSelectedYearId] = useState<string | number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return 'all';
  });

  // Fetch real academic years from backend
  useEffect(() => {
    let isMounted = true;
    async function loadYears() {
      try {
        const res = await apiClient.get<any[]>('/auth/academic-years');
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const mapped: AcademicYearItem[] = res.map((item) => ({
            id: item.id,
            title: item.name_ar || item.title || item.name_en || 'صف دراسي',
            code: item.code,
            stage_order: item.stage_order,
          }));
          setYearsList(mapped);

          // If student has an academicYearId and no saved choice, sync with student
          if (student?.academicYearId) {
            const studentYearStr = String(student.academicYearId);
            const found = mapped.find(
              (m) =>
                String(m.id) === studentYearStr ||
                (student.academicYearName && m.title === student.academicYearName)
            );
            if (found && typeof window !== 'undefined') {
              const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
              if (!saved) {
                setSelectedYearId(found.id);
              }
            }
          }
        }
      } catch {
        // Fallback to mock years is already in initial state
      }
    }
    loadYears();
    return () => {
      isMounted = false;
    };
  }, [student?.academicYearId, student?.academicYearName]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try public courses endpoint which lists all published courses
      let res = await apiClient.get<any>('/courses/public?limit=100').catch(() => null);

      if (!res || (!res.data && !Array.isArray(res))) {
        // Fallback to /courses
        res = await apiClient.get<any>('/courses').catch(() => null);
      }

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

  const handleYearChange = (newVal: string | number | 'all') => {
    setSelectedYearId(newVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(newVal));
      } catch {}
    }
  };

  // Filter by academic year and search query
  const filteredCourses = availableCourses.filter((course) => {
    if (selectedYearId !== 'all') {
      const courseYearId = String(course.academic_year_id || course.academicYearId || '');
      const selectedStr = String(selectedYearId);

      let isMatch = courseYearId === selectedStr;

      if (!isMatch) {
        const selectedYearObj = yearsList.find((y) => String(y.id) === selectedStr);
        if (selectedYearObj) {
          if (
            (course.academic_year_name_ar && course.academic_year_name_ar === selectedYearObj.title) ||
            (selectedYearObj.code && (course as any).academic_year_code === selectedYearObj.code)
          ) {
            isMatch = true;
          }
          if (selectedStr === '1' && (courseYearId.endsWith('0001') || course.academic_year_name_ar?.includes('الإعدادي'))) isMatch = true;
          if (selectedStr === '2' && (courseYearId.endsWith('0002') || course.academic_year_name_ar?.includes('الأول الثانوي'))) isMatch = true;
          if (selectedStr === '3' && (courseYearId.endsWith('0003') || course.academic_year_name_ar?.includes('الثاني الثانوي'))) isMatch = true;
          if (selectedStr === '4' && (courseYearId.endsWith('0004') || course.academic_year_name_ar?.includes('الثالث الثانوي'))) isMatch = true;
        }
      }

      if (!isMatch) {
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

  const selectedYearObj = yearsList.find((y) => String(y.id) === String(selectedYearId));

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
                value={String(selectedYearId)}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : e.target.value;
                  handleYearChange(val);
                }}
                className="appearance-none bg-stone-50 dark:bg-[#0c1017] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white rounded-xl py-2 ps-3 pe-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">جميع المراحل الدراسية</option>
                {yearsList.map((year) => (
                  <option key={String(year.id)} value={String(year.id)}>
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
              actionText="عرض جميع المراحل"
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
