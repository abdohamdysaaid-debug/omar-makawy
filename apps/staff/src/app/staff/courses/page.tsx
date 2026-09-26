'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Plus,
  Eye,
  Edit,
  Tag,
} from 'lucide-react';
import {
  defaultCoursesApi,
  CourseItem,
  CoursesListQuery,
  SystemPermissions,
  ApiError,
} from '@omar-makawy/shared';
import { StaffGuard } from '../../../components/layout/StaffGuard';
import { PermissionGate } from '../../../components/rbac/PermissionGate';
import { useAcademicYear } from '../../../context/AcademicYearContext';
import { useLanguage } from '../../../context/LanguageContext';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Breadcrumbs } from '../../../components/ui/Breadcrumbs';
import { LoadingState, ErrorState, EmptyState } from '../../../components/ui/FeedbackStates';

export default function StaffCoursesPage() {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, activeYear, isGlobalScope } = useAcademicYear();

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [publicationFilter, setPublicationFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Data fetching states
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Debounce search input
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPublicationFilter('ALL');
    setCurrentPage(1);
  };

  // Fetch courses from backend API
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: CoursesListQuery = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }

      if (publicationFilter === 'PUBLISHED') {
        query.is_published = true;
      } else if (publicationFilter === 'DRAFT') {
        query.is_published = false;
      }

      // Explicit academic year scope
      if (!isGlobalScope && activeAcademicYearId) {
        query.academic_year_id = activeAcademicYearId;
      }

      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

      const response = await defaultCoursesApi.listCourses(query, yearScope);
      setCourses(response.data || []);
      setTotalCourses(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, publicationFilter, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const hasActiveFilters = Boolean(searchTerm || publicationFilter !== 'ALL');

  return (
    <StaffGuard>
      <PermissionGate
        permission={SystemPermissions.COURSES_READ}
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              {isArabic ? 'غير مصرح لك بالوصول' : 'Access Restricted'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
              {isArabic
                ? 'لا تمتلك صلاحية عرض قائمة الكورسات (courses.read). يرجى مراجعة المسؤول.'
                : 'You lack the required permission to view courses (courses.read).'}
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Breadcrumbs
                items={[
                  { label: isArabic ? 'الرئيسية' : 'Dashboard', href: '/staff/dashboard' },
                  { label: isArabic ? 'الكورسات والمناهج' : 'Courses' },
                ]}
                isRtl={isArabic}
              />
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {isArabic ? 'دليل الكورسات والمناهج' : 'Courses Management'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {totalCourses} {isArabic ? 'كورس' : 'courses'}
                </span>
                {!isGlobalScope && activeYear && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Calendar className="h-3 w-3" />
                    {isArabic ? activeYear.name_ar : activeYear.name_en}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchCourses()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>

              <PermissionGate permission={SystemPermissions.COURSES_CREATE}>
                <button
                  type="button"
                  title={isArabic ? 'إضافة كورس جديد' : 'Create New Course'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isArabic ? 'إضافة كورس' : 'New Course'}
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={
                  isArabic
                    ? 'البحث باسم الكورس بالعربية أو الإنجليزية...'
                    : 'Search course title in Arabic or English...'
                }
                className="w-full pr-9 pl-9 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Publication Filter */}
            <div className="w-full sm:w-48">
              <select
                value={publicationFilter}
                onChange={(e) => {
                  setPublicationFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT');
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'كل الحالات (النشر)' : 'All Publications'}</option>
                <option value="PUBLISHED">{isArabic ? 'المنشورة فقط' : 'Published Only'}</option>
                <option value="DRAFT">{isArabic ? 'المسودات / غير المنشورة' : 'Drafts / Unpublished'}</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                {isArabic ? 'إعادة ضبط' : 'Reset'}
              </button>
            )}
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <LoadingState message={isArabic ? 'جاري تحميل قائمة الكورسات...' : 'Loading courses...'} />
          ) : error ? (
            <ErrorState
              title={
                error.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
                  ? isArabic
                    ? 'نطاق العام الدراسي غير مصرح به'
                    : 'Academic Year Scope Denied'
                  : isArabic
                  ? 'حدث خطأ أثناء تحميل الكورسات'
                  : 'Error Loading Courses'
              }
              message={
                error.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
                  ? isArabic
                    ? 'ليس لديك صلاحية الوصول إلى العام الدراسي المحدد. يرجى اختيار عام دراسي من النطاق المصرح لك به.'
                    : 'You do not have permission to view courses for the selected academic year scope.'
                  : error.message || (isArabic ? 'تعذر الاتصال بالخادم.' : 'Unable to reach backend server.')
              }
              onRetry={fetchCourses}
            />
          ) : courses.length === 0 ? (
            <EmptyState
              title={
                hasActiveFilters
                  ? isArabic
                    ? 'لم يتم العثور على كورسات مطابقة'
                    : 'No matching courses found'
                  : isArabic
                  ? 'لا توجد كورسات مسجلة في هذا العام الدراسي'
                  : 'No courses registered for this academic year'
              }
              description={
                hasActiveFilters
                  ? isArabic
                    ? 'جرّب تعديل مصطلحات البحث أو تصفية حالة النشر.'
                    : 'Try changing your search terms or publication filters.'
                  : isArabic
                  ? 'لم يتم إضافة كورسات تعليمية بعد لهذا العام الدراسي.'
                  : 'No courses have been created yet for this academic scope.'
              }
              actionLabel={hasActiveFilters ? (isArabic ? 'إلغاء الفلاتر' : 'Clear Filters') : undefined}
              onAction={hasActiveFilters ? clearAllFilters : undefined}
            />
          ) : (
            <div className="space-y-4">
              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => {
                  const hasDiscount =
                    course.discount_price !== null &&
                    course.discount_price !== undefined &&
                    course.discount_price < course.price;

                  return (
                    <div
                      key={course.id}
                      className="group flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all overflow-hidden"
                    >
                      {/* Course Cover / Thumbnail Header */}
                      <div className="relative h-44 w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title_ar}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                            <BookOpen className="h-12 w-12 stroke-1 mb-1" />
                            <span className="text-[11px] font-medium tracking-wider uppercase">
                              {isArabic ? 'لا توجد صورة' : 'No Cover'}
                            </span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                          <StatusBadge status={course.is_published ? 'PUBLISHED' : 'DRAFT'} isArabic={isArabic} />
                          {course.sort_order !== undefined && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-sm shadow-sm">
                              #{course.sort_order}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Course Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            <Layers className="h-3.5 w-3.5 text-neutral-400" />
                            <span>
                              {course.academic_year_name_ar || course.academic_year_code || (isArabic ? 'العام الدراسي' : 'Academic Year')}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {course.title_ar}
                          </h3>

                          {course.title_en && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 font-mono">
                              {course.title_en}
                            </p>
                          )}

                          {course.description_ar && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                              {course.description_ar}
                            </p>
                          )}
                        </div>

                        {/* Pricing & Publication state info */}
                        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-neutral-400 font-medium block">
                              {isArabic ? 'سعر الكورس' : 'Course Price'}
                            </span>
                            <div className="flex items-baseline gap-2">
                              {course.price === 0 ? (
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                  {isArabic ? 'مجاني' : 'Free'}
                                </span>
                              ) : (
                                <>
                                  <span className="text-base font-bold text-neutral-900 dark:text-white">
                                    {hasDiscount ? course.discount_price : course.price}{' '}
                                    <span className="text-xs font-normal text-neutral-500">{isArabic ? 'ج.م' : 'EGP'}</span>
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs text-neutral-400 line-through">
                                      {course.price} {isArabic ? 'ج.م' : 'EGP'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Links */}
                          <div className="flex items-center gap-2">
                            <PermissionGate permission={SystemPermissions.COURSES_READ}>
                              <Link
                                href={`/staff/courses/${course.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {isArabic ? 'التفاصيل' : 'Details'}
                              </Link>
                            </PermissionGate>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm mt-6">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isArabic
                      ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(
                          currentPage * pageSize,
                          totalCourses
                        )} من أصل ${totalCourses} كورس`
                      : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                          currentPage * pageSize,
                          totalCourses
                        )} of ${totalCourses} courses`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isArabic ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                      {isArabic ? 'السابق' : 'Previous'}
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, index, array) => {
                          const prev = array[index - 1];
                          const showEllipsis = prev && page - prev > 1;

                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="px-2 text-xs text-neutral-400">...</span>}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                disabled={isLoading}
                                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                                  currentPage === page
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                    : 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isArabic ? 'التالي' : 'Next'}
                      {isArabic ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PermissionGate>
    </StaffGuard>
  );
}
