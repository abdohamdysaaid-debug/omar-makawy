'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  resolveCourseThumbnailUrl,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createCoursesApi } from '@omar-makawy/shared';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CourseFormModal } from '@/components/courses/CourseFormModal';

const staffCoursesApi = createCoursesApi(staffApiClient);

export function CourseDetailClient({ courseId: propCourseId }: { courseId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
  }, [course?.thumbnail_url]);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const getResolvedId = useCallback(() => {
    const isUuid = (str?: string | null) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    const queryId = searchParams?.get('id');
    if (isUuid(queryId)) return queryId!;

    if (isUuid(propCourseId)) return propCourseId!;

    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const winQueryId = urlParams.get('id');
        if (isUuid(winQueryId)) return winQueryId!;

        const parts = window.location.pathname.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (isUuid(lastPart)) return lastPart;
      } catch {}
    }

    if (queryId && queryId !== 'detail' && queryId !== '[id]') return queryId;
    if (propCourseId && propCourseId !== 'detail' && propCourseId !== '[id]') return propCourseId;

    return '';
  }, [searchParams, propCourseId]);

  const fetchCourse = useCallback(async () => {
    const targetId = getResolvedId();
    if (!targetId) {
      setLoading(false);
      setError(isAr ? 'معرف الكورس غير محدد في الرابط' : 'Course ID is missing from URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await staffCoursesApi.getCourseById(targetId);
      setCourse(data);
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل تحميل بيانات الكورس من الخادم' : 'Failed to load course details')
      );
    } finally {
      setLoading(false);
    }
  }, [getResolvedId, isAr]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEditSuccess = (updated: CourseDetail) => {
    setCourse(updated);
    setActionSuccessMessage(
      isAr
        ? `تم تحديث الكورس "${updated.title_ar}" بنجاح.`
        : `Course "${updated.title_en || updated.title_ar}" updated successfully.`
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
          (isAr ? 'فشل حذف الكورس من الخادم' : 'Failed to delete course from server')
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message={isAr ? 'جاري تحميل بيانات الكورس...' : 'Loading course details...'} />;
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Link
          href="/staff/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          <span>{isAr ? 'العودة إلى قائمة الكورسات' : 'Back to Courses'}</span>
        </Link>
        <ErrorState
          title={isAr ? 'تعذر جلب تفاصيل الكورس' : 'Course Not Found'}
          message={error || (isAr ? 'الكورس المطلوب غير موجود.' : 'Requested course not found.')}
          onRetry={fetchCourse}
        />
      </div>
    );
  }

  const resolvedThumb = resolveCourseThumbnailUrl(course);
  const hasDiscount =
    typeof course.discount_price === 'number' &&
    course.discount_price > 0 &&
    course.discount_price < course.price;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: isAr ? 'الكورسات' : 'Courses', href: '/staff/courses' },
              { label: course.title_ar },
            ]}
          />
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {course.title_ar}
            </h1>
            <StatusBadge status={course.status} isArabic={isAr} />
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/staff/courses"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors"
          >
            <BackIcon className="h-4 w-4" />
            <span>{isAr ? 'العودة للكورسات' : 'Back'}</span>
          </Link>

          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>{isAr ? 'تعديل الكورس' : 'Edit Course'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-900 transition-all active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isAr ? 'حذف' : 'Delete'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Overview & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              {isAr ? 'المعلومات الأساسية' : 'General Information'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">{isAr ? 'عنوان الكورس (عربي):' : 'Title (AR):'}</span>
                <span className="font-bold text-neutral-900 dark:text-white text-sm">
                  {course.title_ar}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">{isAr ? 'عنوان الكورس (إنجليزي):' : 'Title (EN):'}</span>
                <span className="font-bold text-neutral-900 dark:text-white text-sm">
                  {course.title_en || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">{isAr ? 'المرحلة الدراسية:' : 'Academic Year:'}</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">
                  {isAr ? course.academic_year_name_ar : course.academic_year_name_en}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">{isAr ? 'السعر والخصم:' : 'Pricing:'}</span>
                <div className="font-bold text-sm">
                  {hasDiscount ? (
                    <span className="text-brand-600 dark:text-brand-400">
                      {course.discount_price} {isAr ? 'ج.م' : 'EGP'}{' '}
                      <span className="text-xs text-neutral-400 line-through">
                        {course.price}
                      </span>
                    </span>
                  ) : course.price > 0 ? (
                    <span>{course.price} {isAr ? 'ج.م' : 'EGP'}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">{isAr ? 'مجاني' : 'Free'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/60 dark:border-neutral-800 space-y-2 text-xs">
              <span className="text-neutral-400 font-bold block">{isAr ? 'وصف الكورس:' : 'Description:'}</span>
              <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
                {course.description_ar || (isAr ? 'لا يوجد وصف متوفر.' : 'No description provided.')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Thumbnail & Media (1 col) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              {isAr ? 'صورة الغلاف (Thumbnail)' : 'Course Thumbnail'}
            </h3>

            <div className="relative aspect-video w-full rounded-2xl bg-neutral-900 overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
              {resolvedThumb && !imgError ? (
                <img
                  src={resolvedThumb}
                  alt={course.title_ar}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-500">
                  <BookOpen className="h-10 w-10 opacity-50" />
                  <span className="text-xs">{isAr ? 'لا توجد صورة غلاف' : 'No thumbnail'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {course.is_featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{isAr ? 'كورس مميز' : 'Featured'}</span>
                </span>
              )}
              {course.is_public && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{isAr ? 'معروض بالرئيسية' : 'Public'}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CourseFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
        initialCourse={course}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDestructive={true}
        title={isAr ? 'تأكيد حذف الكورس' : 'Confirm Deletion'}
        message={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف الكورس "${course.title_ar}" نهائياً؟`
            : `Are you sure you want to permanently delete "${course.title_en || course.title_ar}"?`
        }
        confirmText={isAr ? 'حذف نهائي' : 'Delete Permanently'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
      />
    </div>
  );
}
