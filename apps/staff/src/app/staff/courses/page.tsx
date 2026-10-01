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
  ShieldAlert,
  Plus,
  Eye,
  Edit,
  Sparkles,
  Globe,
  CheckCircle2,
  XCircle,
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
import { CourseFormModal } from '../../../components/courses/CourseFormModal';

export default function StaffCoursesPage() {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, activeYear, availableYears, isGlobalScope } = useAcademicYear();

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('ALL');
  const [publicationFilter, setPublicationFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<'ALL' | 'FEATURED' | 'REGULAR'>('ALL');
  const [publicFilter, setPublicFilter] = useState<'ALL' | 'PUBLIC' | 'HIDDEN'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseItem | null>(null);

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
    setAcademicYearFilter('ALL');
    setPublicationFilter('ALL');
    setFeaturedFilter('ALL');
    setPublicFilter('ALL');
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

      if (featuredFilter === 'FEATURED') {
        query.is_featured = true;
      } else if (featuredFilter === 'REGULAR') {
        query.is_featured = false;
      }

      if (publicFilter === 'PUBLIC') {
        query.is_public = true;
      } else if (publicFilter === 'HIDDEN') {
        query.is_public = false;
      }

      // Academic Year Scope
      if (academicYearFilter !== 'ALL') {
        query.academic_year_id = academicYearFilter;
      } else if (!isGlobalScope && activeAcademicYearId) {
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
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    publicationFilter,
    featuredFilter,
    publicFilter,
    academicYearFilter,
    activeAcademicYearId,
    isGlobalScope,
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenCreateModal = () => {
    setCourseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: CourseItem) => {
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (course: CourseItem) => {
    try {
      const newStatus = course.is_published ? false : true;
      await defaultCoursesApi.updateCourse(course.id, { is_published: newStatus }, course.academic_year_id);
      fetchCourses();
    } catch (err: any) {
      alert(err.message || (isArabic ? 'فشل تغيير حالة الكورس' : 'Failed to update course status'));
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      academicYearFilter !== 'ALL' ||
      publicationFilter !== 'ALL' ||
      featuredFilter !== 'ALL' ||
      publicFilter !== 'ALL'
  );

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
                  { label: isArabic ? 'الكورسات' : 'Courses' },
                ]}
                isRtl={isArabic}
              />
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {isArabic ? 'الكورسات' : 'Courses Management'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {totalCourses} {isArabic ? 'كورس' : 'courses'}
                </span>
                {!isGlobalScope && activeYear && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
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
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>

              <PermissionGate permission={SystemPermissions.COURSES_CREATE}>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  {isArabic ? 'إضافة كورس' : 'New Course'}
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
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
                className="w-full pr-9 pl-9 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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

            {/* Academic Year Filter */}
            <div className="w-full sm:w-44">
              <select
                value={academicYearFilter}
                onChange={(e) => {
                  setAcademicYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'جميع السنوات الدراسية' : 'All Academic Years'}</option>
                {availableYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {isArabic ? y.name_ar : y.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Filter */}
            <div className="w-full sm:w-36">
              <select
                value={publicationFilter}
                onChange={(e) => {
                  setPublicationFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'كل الحالات' : 'All Statuses'}</option>
                <option value="PUBLISHED">{isArabic ? 'منشور' : 'Published'}</option>
                <option value="DRAFT">{isArabic ? 'مسودة' : 'Draft'}</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div className="w-full sm:w-36">
              <select
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'كل المميز والعادي' : 'All Courses'}</option>
                <option value="FEATURED">{isArabic ? 'المميزة فقط' : 'Featured Only'}</option>
                <option value="REGULAR">{isArabic ? 'العادية فقط' : 'Regular Only'}</option>
              </select>
            </div>

            {/* Homepage Visibility Filter */}
            <div className="w-full sm:w-40">
              <select
                value={publicFilter}
                onChange={(e) => {
                  setPublicFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'كل الظهور بالرئيسية' : 'All Visibility'}</option>
                <option value="PUBLIC">{isArabic ? 'ظاهر بالرئيسية' : 'Show on Home'}</option>
                <option value="HIDDEN">{isArabic ? 'مخفي بالرئيسية' : 'Hidden on Home'}</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                {isArabic ? 'إعادة ضبط' : 'Reset'}
              </button>
            )}
          </div>

          {/* Main Content View */}
          {isLoading ? (
            <LoadingState message={isArabic ? 'جاري تحميل الكورسات...' : 'Loading courses...'} />
          ) : error ? (
            <ErrorState
              title={isArabic ? 'حدث خطأ أثناء تحميل الكورسات' : 'Error Loading Courses'}
              message={error.message || (isArabic ? 'تعذر الاتصال بالسيرفر' : 'Failed to load courses')}
              onRetry={fetchCourses}
            />
          ) : courses.length === 0 ? (
            <EmptyState
              title={
                hasActiveFilters
                  ? isArabic
                    ? 'لم يتم العثور على كورسات مطابقة للفلاتر'
                    : 'No matching courses found'
                  : isArabic
                  ? 'لا توجد كورسات مسجلة'
                  : 'No courses registered'
              }
              description={
                hasActiveFilters
                  ? isArabic
                    ? 'جرّب تعديل مصطلحات البحث أو ضبط الفلاتر'
                    : 'Try modifying your search query or filters'
                  : isArabic
                  ? 'يمكنك إضافة أول كورس إداري بالضغط على زر "إضافة كورس"'
                  : 'You can create your first course by clicking "New Course"'
              }
              actionLabel={hasActiveFilters ? (isArabic ? 'إلغاء الفلاتر' : 'Reset Filters') : undefined}
              onAction={hasActiveFilters ? clearAllFilters : undefined}
            />
          ) : (
            <div className="space-y-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-neutral-700 dark:text-neutral-300">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-4 py-3 text-center w-16">#</th>
                        <th className="px-4 py-3">{isArabic ? 'الكورس' : 'Course'}</th>
                        <th className="px-4 py-3">{isArabic ? 'السنة الدراسية' : 'Academic Year'}</th>
                        <th className="px-4 py-3">{isArabic ? 'السعر' : 'Price'}</th>
                        <th className="px-4 py-3 text-center">{isArabic ? 'مميز' : 'Featured'}</th>
                        <th className="px-4 py-3 text-center">{isArabic ? 'بالرئيسية' : 'Homepage'}</th>
                        <th className="px-4 py-3 text-center">{isArabic ? 'الحالة' : 'Status'}</th>
                        <th className="px-4 py-3 text-center">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {courses.map((course, index) => {
                        const hasDiscount =
                          course.discount_price !== null &&
                          course.discount_price !== undefined &&
                          course.discount_price < course.price;

                        return (
                          <tr
                            key={course.id}
                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            <td className="px-4 py-3 text-center font-mono text-neutral-400">
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-20 flex-shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                                  {course.thumbnail_url ? (
                                    <img
                                      src={course.thumbnail_url}
                                      alt={course.title_ar}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <BookOpen className="h-5 w-5 text-neutral-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-neutral-900 dark:text-white line-clamp-1">
                                    {course.title_ar}
                                  </p>
                                  <p className="text-[11px] text-neutral-500 font-mono line-clamp-1">
                                    {course.title_en}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                              {course.academic_year_name_ar || course.academic_year_code || '-'}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              {course.price === 0 ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {isArabic ? 'مجاني' : 'Free'}
                                </span>
                              ) : (
                                <div>
                                  <span className="font-extrabold text-neutral-900 dark:text-white">
                                    {hasDiscount ? course.discount_price : course.price} {isArabic ? 'ج.م' : 'EGP'}
                                  </span>
                                  {hasDiscount && (
                                    <span className="block text-[10px] text-neutral-400 line-through">
                                      {course.price} {isArabic ? 'ج.م' : 'EGP'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              {course.is_featured ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Sparkles className="h-3 w-3" />
                                  {isArabic ? 'مميز' : 'Featured'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-neutral-400">-</span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              {course.is_public ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <Globe className="h-3 w-3" />
                                  {isArabic ? 'ظاهر' : 'Public'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-neutral-400">
                                  {isArabic ? 'مخفي' : 'Hidden'}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <StatusBadge status={course.is_published ? 'PUBLISHED' : 'DRAFT'} isArabic={isArabic} />
                            </td>

                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(course)}
                                  title={isArabic ? 'تعديل الكورس' : 'Edit Course'}
                                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                  <Edit className="h-3.5 w-3.5 text-blue-500" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(course)}
                                  title={
                                    course.is_published
                                      ? isArabic
                                        ? 'تحويل لمسودة'
                                        : 'Set as Draft'
                                      : isArabic
                                      ? 'نشر الكورس'
                                      : 'Publish Course'
                                  }
                                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                    course.is_published
                                      ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-950 dark:hover:bg-amber-950/40'
                                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950 dark:hover:bg-emerald-950/40'
                                  }`}
                                >
                                  {course.is_published ? (
                                    <XCircle className="h-3.5 w-3.5" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                {courses.map((course) => {
                  const hasDiscount =
                    course.discount_price !== null &&
                    course.discount_price !== undefined &&
                    course.discount_price < course.price;

                  return (
                    <div
                      key={course.id}
                      className="flex flex-col justify-between rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden"
                    >
                      <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title_ar}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-10 w-10 text-neutral-400" />
                        )}

                        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between pointer-events-none">
                          <StatusBadge status={course.is_published ? 'PUBLISHED' : 'DRAFT'} isArabic={isArabic} />
                          {course.is_featured && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                              {isArabic ? 'مميز' : 'Featured'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                            {course.academic_year_name_ar || course.academic_year_code}
                          </span>
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                            {course.title_ar}
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono line-clamp-1">
                            {course.title_en}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                              {hasDiscount ? course.discount_price : course.price} {isArabic ? 'ج.م' : 'EGP'}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-neutral-400 line-through block">
                                {course.price} {isArabic ? 'ج.م' : 'EGP'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(course)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                            >
                              {isArabic ? 'تعديل' : 'Edit'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm mt-6">
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
                    >
                      {isArabic ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                      {isArabic ? 'السابق' : 'Previous'}
                    </button>

                    <span className="text-xs font-bold px-2 text-neutral-700 dark:text-neutral-300">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
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

        {/* Create / Edit Course Modal */}
        <CourseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCourses}
          courseToEdit={courseToEdit}
        />
      </PermissionGate>
    </StaffGuard>
  );
}
