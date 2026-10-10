'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Star,
  Globe,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  PlayCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  CourseItem,
  CoursesListQuery,
  SystemPermissions,
  resolveCourseThumbnailUrl,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createCoursesApi } from '@omar-makawy/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CourseFormModal } from '@/components/courses/CourseFormModal';

const staffCoursesApi = createCoursesApi(staffApiClient);

function CourseThumbnailItem({
  course,
  iconSize = 'h-5 w-5',
}: {
  course: CourseItem;
  iconSize?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveCourseThumbnailUrl(course);

  useEffect(() => {
    setHasError(false);
  }, [course.thumbnail_url]);

  if (!resolvedUrl || hasError) {
    return <BookOpen className={`${iconSize} text-neutral-500 opacity-60`} />;
  }

  return (
    <img
      src={resolvedUrl}
      alt={course.title_ar}
      onError={() => setHasError(true)}
      className="w-full h-full object-cover"
    />
  );
}

export default function StaffCoursesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const canManage = isTeacher || hasPermission(SystemPermissions.COURSES_MANAGE);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [filterYearId, setFilterYearId] = useState<string>(activeAcademicYearId || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [publicFilter, setPublicFilter] = useState<string>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Data State
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<CourseItem | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync active academic year change
  useEffect(() => {
    if (activeAcademicYearId) {
      setFilterYearId(activeAcademicYearId);
    } else {
      setFilterYearId('ALL');
    }
  }, [activeAcademicYearId]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch courses from backend
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: CoursesListQuery = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        academic_year_id: filterYearId !== 'ALL' ? filterYearId : undefined,
      };

      if (statusFilter === 'PUBLISHED') {
        query.is_published = true;
      } else if (statusFilter === 'DRAFT') {
        query.is_published = false;
      }

      if (publicFilter === 'PUBLIC') {
        query.is_public = true;
      } else if (publicFilter === 'PRIVATE') {
        query.is_public = false;
      }

      if (featuredFilter === 'FEATURED') {
        query.is_featured = true;
      }

      const scopeHeader = filterYearId !== 'ALL' ? filterYearId : undefined;
      const res = await staffCoursesApi.listCourses(query, scopeHeader);

      setCourses(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل تحميل قائمة الكورسات من الخادم' : 'Failed to fetch courses list')
      );
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterYearId, isAr, limit, page, publicFilter, featuredFilter, statusFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenCreate = () => {
    setSelectedCourseForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (course: CourseItem) => {
    setSelectedCourseForEdit(course);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (course: CourseItem) => {
    setActionSuccessMessage(
      isAr
        ? `تم حفظ الكورس "${course.title_ar}" بنجاح.`
        : `Course "${course.title_en || course.title_ar}" saved successfully.`
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
    fetchCourses();
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);

    try {
      await staffCoursesApi.deleteCourse(
        courseToDelete.id,
        courseToDelete.academic_year_id
      );

      setActionSuccessMessage(
        isAr
          ? `تم حذف الكورس "${courseToDelete.title_ar}" بنجاح.`
          : `Course "${courseToDelete.title_en || courseToDelete.title_ar}" deleted successfully.`
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err: any) {
      alert(
        err?.message ||
          (isAr ? 'فشل حذف الكورس من الخادم' : 'Failed to delete course from server')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {isAr ? 'إدارة الكورسات والمناهج' : 'Courses Management'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'إنشاء وتعديل وإدارة الكورسات الدراسية وصور الأغلفة المخزنة سحابياً'
              : 'Create, update, and manage educational courses and Google Drive thumbnails'}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.99] self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? 'إضافة كورس جديد' : 'Add New Course'}</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="h-4 w-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث باسم الكورس...' : 'Search course title...'}
              className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 ps-10 pe-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={filterYearId}
              onChange={(e) => {
                setFilterYearId(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              {isTeacher && <option value="ALL">{isAr ? 'جميع المراحل' : 'All Stages'}</option>}
              {availableYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {isAr ? year.name_ar : year.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="PUBLISHED">{isAr ? 'منشور (PUBLISHED)' : 'Published'}</option>
              <option value="DRAFT">{isAr ? 'مسودة (DRAFT)' : 'Draft'}</option>
            </select>
          </div>

          {/* Public / Featured Filter */}
          <div className="flex items-center gap-2">
            <select
              value={publicFilter}
              onChange={(e) => {
                setPublicFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-2.5 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              <option value="ALL">{isAr ? 'الرئيسية: الكل' : 'Public: All'}</option>
              <option value="PUBLIC">{isAr ? 'ظاهر بالرئيسية' : 'Public Only'}</option>
              <option value="PRIVATE">{isAr ? 'داخلي فقط' : 'Internal Only'}</option>
            </select>

            <button
              type="button"
              onClick={fetchCourses}
              disabled={loading}
              title={isAr ? 'إعادة التحميل' : 'Refresh'}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Courses List View */}
      {loading ? (
        <LoadingState message={isAr ? 'جاري تحميل الكورسات...' : 'Loading courses...'} />
      ) : error ? (
        <ErrorState
          title={isAr ? 'خطأ في جلب الكورسات' : 'Failed to Load Courses'}
          message={error}
          onRetry={fetchCourses}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا توجد كورسات مطابقة' : 'No Courses Found'}
          description={
            isAr
              ? 'لم يتم العثور على أي كورسات تطابق معايير البحث أو المرحلة المحددة.'
              : 'No courses match the current filter or search criteria.'
          }
          actionLabel={canManage ? (isAr ? 'إضافة أول كورس' : 'Add First Course') : undefined}
          onAction={canManage ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <table className="w-full text-start text-xs">
              <thead className="bg-neutral-50/80 dark:bg-neutral-850/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? 'الكورس والغلاف' : 'Course & Thumbnail'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المرحلة الدراسية' : 'Academic Year'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الإحصائيات' : 'Statistics'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'السعر والخصم' : 'Pricing'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الرئيسية والتمييز' : 'Visibility'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                {courses.map((course) => {
                  const hasDiscount =
                    typeof course.discount_price === 'number' &&
                    course.discount_price > 0 &&
                    course.discount_price < course.price;

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850/50 transition-colors"
                    >
                      {/* Course Title & 16:9 Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative aspect-video w-20 shrink-0 rounded-lg bg-neutral-900 overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                            <CourseThumbnailItem course={course} iconSize="h-5 w-5" />
                          </div>
                          <div className="truncate max-w-xs">
                            <Link
                              href={`/staff/courses/detail?id=${course.id}`}
                              className="font-bold text-neutral-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate block"
                            >
                              {course.title_ar}
                            </Link>
                            {course.title_en && (
                              <span className="text-[11px] text-neutral-400 truncate block">
                                {course.title_en}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Academic Year */}
                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-semibold">
                        {isAr ? course.academic_year_name_ar : course.academic_year_name_en || course.academic_year_name_ar}
                      </td>

                      {/* Statistics: Students and Lectures */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                            <span className="p-1 rounded-md bg-amber-500/10 dark:bg-amber-400/10">
                              <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            </span>
                            <span>{(course.student_count ?? course.students_count ?? 0)} {isAr ? 'طالب مشترك' : 'students'}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="p-1 rounded-md bg-emerald-500/10 dark:bg-emerald-400/10">
                              <PlayCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </span>
                            <span>{(course.lecture_count ?? course.lectures_count ?? 0)} {isAr ? 'محاضرة' : 'lectures'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-brand-600 dark:text-brand-400">
                              {course.discount_price} {isAr ? 'ج.م' : 'EGP'}
                            </span>
                            <span className="text-[11px] text-neutral-400 line-through">
                              {course.price}
                            </span>
                          </div>
                        ) : course.price > 0 ? (
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {course.price} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {isAr ? 'مجاني' : 'Free'}
                          </span>
                        )}
                      </td>

                      {/* Badges / Visibility */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {course.is_featured && (
                            <span
                              title={isAr ? 'كورس مميز' : 'Featured Course'}
                              className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            >
                              <Star className="h-3.5 w-3.5 fill-amber-500" />
                            </span>
                          )}
                          {course.is_public && (
                            <span
                              title={isAr ? 'معروض في الصفحة الرئيسية' : 'Visible on public homepage'}
                              className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            >
                              <Globe className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={course.status} isArabic={isAr} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/staff/courses/detail?id=${course.id}`}
                            title={isAr ? 'عرض التفاصيل' : 'View Details'}
                            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(course)}
                                title={isAr ? 'تعديل الكورس' : 'Edit Course'}
                                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setCourseToDelete(course)}
                                title={isAr ? 'حذف الكورس' : 'Delete Course'}
                                className="p-1.5 rounded-lg text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {courses.map((course) => {
              const hasDiscount =
                typeof course.discount_price === 'number' &&
                course.discount_price > 0 &&
                course.discount_price < course.price;

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="relative aspect-video w-24 shrink-0 rounded-xl bg-neutral-900 overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                      <CourseThumbnailItem course={course} iconSize="h-6 w-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <Link
                          href={`/staff/courses/detail?id=${course.id}`}
                          className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 hover:text-brand-600"
                        >
                          {course.title_ar}
                        </Link>
                        <StatusBadge status={course.status} isArabic={isAr} />
                      </div>

                      <p className="text-xs text-neutral-500 font-semibold">
                        {isAr ? course.academic_year_name_ar : course.academic_year_name_en}
                      </p>

                      {/* Stats badges */}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Users className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span>{(course.student_count ?? course.students_count ?? 0)} {isAr ? 'مشترك' : 'students'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <PlayCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{(course.lecture_count ?? course.lectures_count ?? 0)} {isAr ? 'محاضرة' : 'lectures'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <div className="font-bold">
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-brand-600 dark:text-brand-400">
                            {course.discount_price} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                          <span className="text-neutral-400 line-through text-[11px]">
                            {course.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-900 dark:text-white">
                          {course.price > 0 ? `${course.price} ${isAr ? 'ج.م' : 'EGP'}` : isAr ? 'مجاني' : 'Free'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/staff/courses/detail?id=${course.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-[11px]"
                      >
                        {isAr ? 'عرض' : 'View'}
                      </Link>

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(course)}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px]"
                          >
                            {isAr ? 'تعديل' : 'Edit'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCourseToDelete(course)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium">
                {isAr
                  ? `إجمالي ${total} كورس (صفحة ${page} من ${totalPages})`
                  : `Total ${total} courses (Page ${page} of ${totalPages})`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>{isAr ? 'السابق' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                >
                  <span>{isAr ? 'التالي' : 'Next'}</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <CourseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialCourse={selectedCourseForEdit}
      />

      {/* Delete Course Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDestructive={true}
        title={isAr ? 'تأكيد حذف الكورس' : 'Confirm Course Deletion'}
        message={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف الكورس "${courseToDelete?.title_ar}"؟ سيؤدي هذا الإجراء إلى حذف الكورس بشكل نهائي من قاعدة البيانات.`
            : `Are you sure you want to delete course "${courseToDelete?.title_en || courseToDelete?.title_ar}"? This action permanently removes the course.`
        }
        confirmText={isAr ? 'حذف نهائي' : 'Delete Permanently'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
      />
    </div>
  );
}
