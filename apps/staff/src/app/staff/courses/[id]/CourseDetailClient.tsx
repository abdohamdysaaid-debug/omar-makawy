'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Edit2,
  Trash2,
  Upload,
  Calendar,
  Tag,
  Star,
  Globe,
  Eye,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  CourseDetail,
  SystemPermissions,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createCoursesApi } from '@omar-makawy/shared';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CourseFormModal } from '@/components/courses/CourseFormModal';

const staffCoursesApi = createCoursesApi(staffApiClient);

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();

  const canManage = isTeacher || hasPermission(SystemPermissions.COURSES_MANAGE);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffCoursesApi.getCourseById(courseId);
      setCourse(data);
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل تحميل بيانات الكورس من الخادم' : 'Failed to load course details')
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, isAr]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEditSuccess = (updated: CourseDetail) => {
    setCourse(updated);
    setActionSuccessMessage(
      isAr ? 'تم تحديث بيانات الكورس بنجاح.' : 'Course updated successfully.'
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!course) return;
    setIsDeleting(true);
    try {
      await staffCoursesApi.deleteCourse(course.id, course.academic_year_id);
      router.push('/staff/courses');
    } catch (err: any) {
      alert(
        err?.message ||
          (isAr ? 'فشل حذف الكورس من الخادم' : 'Failed to delete course')
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message={isAr ? 'جاري تحميل تفاصيل الكورس...' : 'Loading course details...'} />;
  }

  if (error || !course) {
    return (
      <ErrorState
        title={isAr ? 'تعذر عرض الكورس' : 'Course Not Found'}
        message={error || (isAr ? 'الكورس المطلوب غير موجود أو تم حذفه.' : 'Course not found')}
        onRetry={fetchCourse}
      />
    );
  }

  const hasDiscount =
    typeof course.discount_price === 'number' &&
    course.discount_price > 0 &&
    course.discount_price < course.price;

  const breadcrumbs = [
    { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/staff' },
    { label: isAr ? 'الكورسات' : 'Courses', href: '/staff/courses' },
    { label: course.title_ar },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <Breadcrumbs items={breadcrumbs} isRtl={dir === 'rtl'} />

        <Link
          href="/staff/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors self-start sm:self-auto"
        >
          <BackIcon className="h-4 w-4" />
          <span>{isAr ? 'العودة لقائمة الكورسات' : 'Back to Courses'}</span>
        </Link>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Course Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm overflow-hidden">
        {/* 16:9 Thumbnail Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-video w-full rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-inner">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title_ar}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-500 gap-2">
                <BookOpen className="h-12 w-12 text-brand-500 opacity-60" />
                <span className="text-xs">{isAr ? 'بدون صورة غلاف' : 'No Cover Image'}</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 end-3 flex items-center gap-1.5">
              {course.is_featured && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-black text-xs font-black rounded-lg shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-black" />
                  <span>{isAr ? 'مميز' : 'Featured'}</span>
                </span>
              )}
              {course.is_public && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{isAr ? 'الرئيسية' : 'Public'}</span>
                </span>
              )}
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              <span>{isAr ? 'تعديل أو استبدال صورة الغلاف' : 'Replace Thumbnail'}</span>
            </button>
          )}
        </div>

        {/* Course Info Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={course.status} isArabic={isAr} />
                <span className="px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold">
                  {isAr ? course.academic_year_name_ar : course.academic_year_name_en || course.academic_year_name_ar}
                </span>
              </div>

              {canManage && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                    <span>{isAr ? 'تعديل' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold text-red-700 dark:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    <span>{isAr ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
              {course.title_ar}
            </h1>
            {course.title_en && (
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {course.title_en}
              </h2>
            )}

            {course.description_ar && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-850 p-3.5 rounded-2xl">
                {course.description_ar}
              </p>
            )}
          </div>

          {/* Pricing & Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            {/* Price */}
            <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-850">
              <span className="text-[11px] text-neutral-500 block mb-0.5">{isAr ? 'السعر' : 'Price'}</span>
              <div className="flex items-baseline gap-1.5">
                {hasDiscount ? (
                  <>
                    <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                      {course.discount_price} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                    <span className="text-xs text-neutral-400 line-through">{course.price}</span>
                  </>
                ) : (
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {course.price > 0 ? `${course.price} ${isAr ? 'ج.م' : 'EGP'}` : isAr ? 'مجاني' : 'Free'}
                  </span>
                )}
              </div>
            </div>

            {/* Created At */}
            <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-850">
              <span className="text-[11px] text-neutral-500 block mb-0.5">{isAr ? 'تاريخ الإنشاء' : 'Created'}</span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {new Date(course.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
              </span>
            </div>

            {/* Public Status */}
            <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-850 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-neutral-500 block mb-0.5">{isAr ? 'الصفحة الرئيسية' : 'Homepage'}</span>
              <span className={`text-xs font-bold ${course.is_public ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}>
                {course.is_public ? (isAr ? 'معروض للزوار' : 'Public') : (isAr ? 'داخلي فقط' : 'Private')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lectures Placeholder Container (Phase 2 Preview) */}
      <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 p-8 sm:p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          {isAr ? 'المحاضرات والدروس' : 'Lectures & Lessons'}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
          {isAr
            ? 'المحاضرات سيتم إضافتها في المرحلة القادمة.'
            : 'Lectures module will be added in the upcoming phase.'}
        </p>
      </div>

      {/* Edit Modal */}
      <CourseFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
        initialCourse={course}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDestructive={true}
        title={isAr ? 'تأكيد حذف الكورس' : 'Delete Course'}
        message={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف الكورس "${course.title_ar}"؟ سيتم حذف الكورس ومحتوياته بشكل نهائي.`
            : `Are you sure you want to delete course "${course.title_en || course.title_ar}"? This cannot be undone.`
        }
        confirmText={isAr ? 'حذف نهائي' : 'Delete Permanently'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
      />
    </div>
  );
}
