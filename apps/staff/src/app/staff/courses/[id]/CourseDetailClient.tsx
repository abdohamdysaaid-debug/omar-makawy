'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Clock,
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Film,
  Bookmark,
  FileText,
} from 'lucide-react';
import {
  defaultCoursesApi,
  defaultLecturesApi,
  CourseDetail,
  LectureItem,
  CreateLecturePayload,
  UpdateLecturePayload,
  UpdateCoursePayload,
  SystemPermissions,
  ApiError,
} from '@omar-makawy/shared';
import { StaffGuard } from '../../../../components/layout/StaffGuard';
import { PermissionGate } from '../../../../components/rbac/PermissionGate';
import { usePermissions } from '../../../../hooks/usePermissions';
import { useAcademicYear } from '../../../../context/AcademicYearContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../../../../components/ui/Breadcrumbs';
import { LoadingState, ErrorState, EmptyState } from '../../../../components/ui/FeedbackStates';
import { LectureVideosModal } from '../../../../components/lectures/LectureVideosModal';
import { LectureChaptersModal } from '../../../../components/lectures/LectureChaptersModal';
import { LectureAttachmentsModal } from '../../../../components/lectures/LectureAttachmentsModal';


export function CourseDetailClient() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const { isArabic } = useLanguage();
  const { hasPermission } = usePermissions();
  const { activeAcademicYearId, isGlobalScope } = useAcademicYear();

  // Data states
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Course Edit Modal state
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseFormError, setCourseFormError] = useState<string | null>(null);
  const [courseFormData, setCourseFormData] = useState<UpdateCoursePayload>({});

  // Lecture Modal (Create / Edit) state
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<LectureItem | null>(null);
  const [isSavingLecture, setIsSavingLecture] = useState(false);
  const [lectureFormError, setLectureFormError] = useState<string | null>(null);
  const [lectureFormData, setLectureFormData] = useState<{
    title_ar: string;
    title_en: string;
    description_ar: string;
    description_en: string;
    sequence_order: number;
    is_free: boolean;
    is_published: boolean;
    duration_seconds: number;
    access_type: string;
    status: string;
  }>({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    sequence_order: 1,
    is_free: false,
    is_published: true,
    duration_seconds: 0,
    access_type: 'FREE',
    status: 'PUBLISHED',
  });

  // Delete Lecture Confirmation state
  const [lectureToDelete, setLectureToDelete] = useState<LectureItem | null>(null);
  const [isDeletingLecture, setIsDeletingLecture] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Video Management Modal state
  const [selectedLectureForVideos, setSelectedLectureForVideos] = useState<LectureItem | null>(null);

  // Chapters Management Modal state
  const [selectedLectureForChapters, setSelectedLectureForChapters] = useState<LectureItem | null>(null);

  // Attachments Management Modal state
  const [selectedLectureForAttachments, setSelectedLectureForAttachments] = useState<LectureItem | null>(null);

  // Fetch course details & syllabus lectures
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const courseRes = await defaultCoursesApi.getCourseById(courseId, yearScope);
      setCourse(courseRes);

      setLecturesLoading(true);
      try {
        const lecturesRes = await defaultLecturesApi.listCourseLectures(courseId, yearScope);
        setLectures(lecturesRes || []);
      } catch (lecErr: any) {
        // If lecture list fails due to tenancy scope, propagate
        if (lecErr.statusCode === 403) {
          setError(lecErr);
        }
      } finally {
        setLecturesLoading(false);
      }
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handle Course Edit Open
  const handleOpenEditCourse = () => {
    if (!course) return;
    setCourseFormData({
      title_ar: course.title_ar,
      title_en: course.title_en,
      description_ar: course.description_ar || '',
      description_en: course.description_en || '',
      thumbnail_url: course.thumbnail_url || '',
      price: course.price,
      discount_price: course.discount_price ?? undefined,
      is_published: course.is_published,
      status: course.status,
      sort_order: course.sort_order,
    });
    setCourseFormError(null);
    setIsEditCourseOpen(true);
  };

  // Submit Course Metadata Edit
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (!courseFormData.title_ar?.trim() || !courseFormData.title_en?.trim()) {
      setCourseFormError(isArabic ? 'يرجى إدخال عنوان الكورس بالعربية والإنجليزية.' : 'Both Arabic and English titles are required.');
      return;
    }

    setIsSavingCourse(true);
    setCourseFormError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const updated = await defaultCoursesApi.updateCourse(course.id, courseFormData, yearScope);
      setCourse(updated);
      setIsEditCourseOpen(false);
    } catch (err: any) {
      setCourseFormError(err.message || (isArabic ? 'فشل حفظ تعديلات الكورس.' : 'Failed to save course changes.'));
    } finally {
      setIsSavingCourse(false);
    }
  };

  // Open Lecture Create Modal
  const handleOpenCreateLecture = () => {
    const nextOrder = lectures.length > 0 ? Math.max(...lectures.map((l) => l.sequence_order)) + 1 : 1;
    setEditingLecture(null);
    setLectureFormData({
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      sequence_order: nextOrder,
      is_free: false,
      is_published: true,
      duration_seconds: 0,
      access_type: 'FREE',
      status: 'PUBLISHED',
    });
    setLectureFormError(null);
    setIsLectureModalOpen(true);
  };

  // Open Lecture Edit Modal
  const handleOpenEditLecture = (lec: LectureItem) => {
    setEditingLecture(lec);
    setLectureFormData({
      title_ar: lec.title_ar,
      title_en: lec.title_en,
      description_ar: lec.description_ar || '',
      description_en: lec.description_en || '',
      sequence_order: lec.sequence_order,
      is_free: lec.is_free,
      is_published: lec.is_published,
      duration_seconds: lec.duration_seconds || 0,
      access_type: lec.access_type || 'FREE',
      status: lec.status || 'PUBLISHED',
    });
    setLectureFormError(null);
    setIsLectureModalOpen(true);
  };

  // Submit Lecture Save (Create or Update)
  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (!lectureFormData.title_ar.trim() || !lectureFormData.title_en.trim()) {
      setLectureFormError(isArabic ? 'يرجى إدخال عنوان المحاضرة بالعربية والإنجليزية.' : 'Both Arabic and English titles are required.');
      return;
    }

    setIsSavingLecture(true);
    setLectureFormError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      if (editingLecture) {
        const payload: UpdateLecturePayload = {
          title_ar: lectureFormData.title_ar.trim(),
          title_en: lectureFormData.title_en.trim(),
          description_ar: lectureFormData.description_ar.trim() || undefined,
          description_en: lectureFormData.description_en.trim() || undefined,
          sequence_order: lectureFormData.sequence_order,
          is_free: lectureFormData.is_free,
          is_published: lectureFormData.is_published,
          duration_seconds: lectureFormData.duration_seconds,
          access_type: lectureFormData.access_type,
          status: lectureFormData.status,
        };
        const updated = await defaultLecturesApi.updateLecture(editingLecture.id, payload, yearScope);
        setLectures((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l)).sort((a, b) => a.sequence_order - b.sequence_order)
        );
      } else {
        const payload: CreateLecturePayload = {
          title_ar: lectureFormData.title_ar.trim(),
          title_en: lectureFormData.title_en.trim(),
          description_ar: lectureFormData.description_ar.trim() || undefined,
          description_en: lectureFormData.description_en.trim() || undefined,
          sequence_order: lectureFormData.sequence_order,
          is_free: lectureFormData.is_free,
          is_published: lectureFormData.is_published,
          duration_seconds: lectureFormData.duration_seconds,
          access_type: lectureFormData.access_type,
          status: lectureFormData.status,
        };
        const created = await defaultLecturesApi.createLecture(course.id, payload, yearScope);
        setLectures((prev) => [...prev, created].sort((a, b) => a.sequence_order - b.sequence_order));
      }
      setIsLectureModalOpen(false);
    } catch (err: any) {
      setLectureFormError(err.message || (isArabic ? 'فشل حفظ المحاضرة.' : 'Failed to save lecture.'));
    } finally {
      setIsSavingLecture(false);
    }
  };

  // Submit Lecture Delete
  const handleConfirmDeleteLecture = async () => {
    if (!lectureToDelete) return;

    setIsDeletingLecture(true);
    setDeleteError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      await defaultLecturesApi.deleteLecture(lectureToDelete.id, yearScope);
      setLectures((prev) => prev.filter((l) => l.id !== lectureToDelete.id));
      setLectureToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || (isArabic ? 'فشل حذف المحاضرة.' : 'Failed to delete lecture.'));
    } finally {
      setIsDeletingLecture(false);
    }
  };

  // Helper formatting for duration
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return isArabic ? 'غير محدد' : 'Not specified';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return isArabic ? `${hrs} ساعة و ${remainingMins} دقيقة` : `${hrs}h ${remainingMins}m`;
    }
    return isArabic ? `${mins} دقيقة ${secs > 0 ? `و ${secs} ثانية` : ''}` : `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
  };

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
                ? 'لا تمتلك صلاحية عرض بيانات وتفاصيل الكورسات (courses.read).'
                : 'You lack the required permission to view course details (courses.read).'}
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Bar / Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Breadcrumbs
                items={[
                  { label: isArabic ? 'الرئيسية' : 'Dashboard', href: '/staff/dashboard' },
                  { label: isArabic ? 'الكورسات والمناهج' : 'Courses', href: '/staff/courses' },
                  { label: course?.title_ar || (isArabic ? 'تفاصيل الكورس' : 'Course Details') },
                ]}
                isRtl={isArabic}
              />
              <div className="mt-2 flex items-center gap-3">
                <Link
                  href="/staff/courses"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                  {isArabic ? 'العودة للكورسات' : 'Back to Courses'}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchCourseData()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>

              {course && (
                <PermissionGate permission={SystemPermissions.COURSES_UPDATE}>
                  <button
                    type="button"
                    onClick={handleOpenEditCourse}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    {isArabic ? 'تعديل الكورس' : 'Edit Course'}
                  </button>
                </PermissionGate>
              )}
            </div>
          </div>

          {/* Main State Handling */}
          {isLoading ? (
            <LoadingState message={isArabic ? 'جاري تحميل تفاصيل الكورس والمحاضرات...' : 'Loading course details...'} />
          ) : error ? (
            <ErrorState
              title={
                error.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
                  ? isArabic
                    ? 'نطاق العام الدراسي غير مصرح به'
                    : 'Academic Year Scope Denied'
                  : error.statusCode === 404
                  ? isArabic
                    ? 'الكورس غير موجود'
                    : 'Course Not Found'
                  : isArabic
                  ? 'حدث خطأ أثناء تحميل الكورس'
                  : 'Error Loading Course'
              }
              message={
                error.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
                  ? isArabic
                    ? 'هذا الكورس يتبع عام دراسي خارج نطاق الصلاحيات المسندة إليك.'
                    : 'This course belongs to an academic year outside your assigned scope.'
                  : error.message || (isArabic ? 'تعذر الاتصال بالخادم.' : 'Unable to reach backend server.')
              }
              onRetry={fetchCourseData}
            />
          ) : !course ? (
            <EmptyState
              title={isArabic ? 'الكورس غير موجود' : 'Course Not Found'}
              description={isArabic ? 'لم يتم العثور على سجل الكورس المطلوب.' : 'The requested course record could not be found.'}
            />
          ) : (
            <div className="space-y-6">
              {/* Course Overview Card */}
              <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Thumbnail / Visual Section */}
                  <div className="relative h-60 lg:h-auto bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title_ar}
                        className="h-full w-full max-h-56 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                        <BookOpen className="h-16 w-16 stroke-1 mb-2" />
                        <span className="text-xs font-medium uppercase">{isArabic ? 'لا توجد صورة غلاف' : 'No Cover Image'}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={course.is_published ? 'PUBLISHED' : 'DRAFT'} isArabic={isArabic} />
                    </div>
                  </div>

                  {/* Course Details Info */}
                  <div className="p-6 lg:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{course.academic_year_name_ar || course.academic_year_code || (isArabic ? 'العام الدراسي' : 'Academic Year')}</span>
                        <span>•</span>
                        <span>{isArabic ? `الترتيب: #${course.sort_order}` : `Order: #${course.sort_order}`}</span>
                      </div>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{course.title_ar}</h2>
                      {course.title_en && (
                        <p className="text-sm font-mono text-neutral-500 dark:text-neutral-400">{course.title_en}</p>
                      )}
                    </div>

                    {course.description_ar && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {course.description_ar}
                      </p>
                    )}

                    {/* Metadata Badges & Pricing Grid */}
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[11px] font-medium text-neutral-400 block">{isArabic ? 'السعر الأساسي' : 'Base Price'}</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                          {course.price === 0 ? (isArabic ? 'مجاني' : 'Free') : `${course.price} ${isArabic ? 'ج.م' : 'EGP'}`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-neutral-400 block">{isArabic ? 'سعر الخصم' : 'Discount Price'}</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                          {course.discount_price !== null && course.discount_price !== undefined && course.discount_price < course.price
                            ? `${course.discount_price} ${isArabic ? 'ج.م' : 'EGP'}`
                            : (isArabic ? 'لا يوجد خصم' : 'None')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-neutral-400 block">{isArabic ? 'حالة النشر' : 'Publication'}</span>
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {course.is_published ? (isArabic ? 'منشور للطلاب' : 'Published') : (isArabic ? 'مسودة خاصة' : 'Draft')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-neutral-400 block">{isArabic ? 'عدد المحاضرات' : 'Lectures Count'}</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{lectures.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecture Syllabus Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {isArabic ? 'فهرس المحاضرات والمحتوى' : 'Course Syllabus & Lectures'}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {lectures.length} {isArabic ? 'محاضرة' : 'lectures'}
                    </span>
                  </div>

                  <PermissionGate permission={SystemPermissions.LECTURES_CREATE}>
                    <button
                      type="button"
                      onClick={handleOpenCreateLecture}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isArabic ? 'إضافة محاضرة' : 'Add Lecture'}
                    </button>
                  </PermissionGate>
                </div>

                {lecturesLoading ? (
                  <LoadingState message={isArabic ? 'جاري تحميل المحاضرات...' : 'Loading lectures...'} />
                ) : lectures.length === 0 ? (
                  <EmptyState
                    title={isArabic ? 'لا توجد محاضرات في هذا الكورس' : 'No lectures in this course yet'}
                    description={isArabic ? 'ابدأ بإضافة أول محاضرة إلى المنهج الدراسي.' : 'Start by adding the first lecture to this course syllabus.'}
                    actionLabel={hasPermission(SystemPermissions.LECTURES_CREATE) ? (isArabic ? 'إضافة محاضرة جديدة' : 'Add New Lecture') : undefined}
                    onAction={hasPermission(SystemPermissions.LECTURES_CREATE) ? handleOpenCreateLecture : undefined}
                  />
                ) : (
                  <div className="space-y-3">
                    {lectures.map((lec) => (
                      <div
                        key={lec.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all gap-4"
                      >
                        {/* Lecture Info */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            #{lec.sequence_order}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{lec.title_ar}</h4>
                              <StatusBadge status={lec.is_published ? 'PUBLISHED' : 'DRAFT'} isArabic={isArabic} />
                              {lec.is_free ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <Unlock className="h-3 w-3" />
                                  {isArabic ? 'معاينة مجانية' : 'Free Preview'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                  <Lock className="h-3 w-3" />
                                  {isArabic ? 'مدفوع' : 'Paid'}
                                </span>
                              )}
                            </div>

                            {lec.title_en && (
                              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">{lec.title_en}</p>
                            )}

                            {lec.description_ar && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1">
                                {lec.description_ar}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lec.duration_seconds)}
                              </span>
                              <span>•</span>
                              <span>{isArabic ? `نوع الوصول: ${lec.access_type}` : `Access: ${lec.access_type}`}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <PermissionGate permission={SystemPermissions.VIDEOS_READ}>
                            <button
                              type="button"
                              onClick={() => setSelectedLectureForVideos(lec)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Film className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                              {isArabic ? 'الفيديوهات' : 'Videos'}
                            </button>
                          </PermissionGate>

                          <PermissionGate permission={SystemPermissions.COURSES_READ}>
                            <button
                              type="button"
                              onClick={() => setSelectedLectureForChapters(lec)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Bookmark className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              {isArabic ? 'الفصول' : 'Chapters'}
                            </button>
                          </PermissionGate>

                          <PermissionGate permission={SystemPermissions.ATTACHMENTS_READ}>
                            <button
                              type="button"
                              onClick={() => setSelectedLectureForAttachments(lec)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                              {isArabic ? 'المرفقات' : 'Files'}
                            </button>
                          </PermissionGate>


                          <PermissionGate permission={SystemPermissions.LECTURES_UPDATE}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditLecture(lec)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              {isArabic ? 'تعديل' : 'Edit'}
                            </button>
                          </PermissionGate>

                          <PermissionGate permission={SystemPermissions.LECTURES_DELETE}>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setLectureToDelete(lec);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isArabic ? 'حذف' : 'Delete'}
                            </button>
                          </PermissionGate>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Course Edit Modal */}
          {isEditCourseOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
              <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
                <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {isArabic ? 'تعديل بيانات الكورس' : 'Edit Course Metadata'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditCourseOpen(false)}
                    disabled={isSavingCourse}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
                  {courseFormError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                      {courseFormError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'اسم الكورس (بالعربية) *' : 'Course Title (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={courseFormData.title_ar || ''}
                      onChange={(e) => setCourseFormData({ ...courseFormData, title_ar: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'اسم الكورس (بالإنجليزية) *' : 'Course Title (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={courseFormData.title_en || ''}
                      onChange={(e) => setCourseFormData({ ...courseFormData, title_en: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'السعر الأساسي (ج.م)' : 'Base Price (EGP)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={courseFormData.price ?? 0}
                        onChange={(e) => setCourseFormData({ ...courseFormData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'سعر الخصم (ج.م)' : 'Discount Price (EGP)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={courseFormData.discount_price ?? ''}
                        onChange={(e) =>
                          setCourseFormData({
                            ...courseFormData,
                            discount_price: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder={isArabic ? 'اختياري' : 'Optional'}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'رابط صورة الغلاف (Thumbnail URL)' : 'Thumbnail URL'}
                    </label>
                    <input
                      type="url"
                      value={courseFormData.thumbnail_url || ''}
                      onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'وصف الكورس (بالعربية)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={courseFormData.description_ar || ''}
                      onChange={(e) => setCourseFormData({ ...courseFormData, description_ar: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'الترتيب' : 'Sort Order'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={courseFormData.sort_order ?? 1}
                        onChange={(e) => setCourseFormData({ ...courseFormData, sort_order: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'الحالة' : 'Status'}
                      </label>
                      <select
                        value={courseFormData.status || 'PUBLISHED'}
                        onChange={(e) => setCourseFormData({ ...courseFormData, status: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      >
                        <option value="PUBLISHED">{isArabic ? 'منشور (PUBLISHED)' : 'PUBLISHED'}</option>
                        <option value="DRAFT">{isArabic ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
                        <option value="ARCHIVED">{isArabic ? 'مؤرشف (ARCHIVED)' : 'ARCHIVED'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="course_is_published"
                      checked={courseFormData.is_published ?? false}
                      onChange={(e) => setCourseFormData({ ...courseFormData, is_published: e.target.checked })}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4"
                    />
                    <label htmlFor="course_is_published" className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      {isArabic ? 'نشر الكورس وجعله مرئياً للطلاب' : 'Publish course and make visible to students'}
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsEditCourseOpen(false)}
                      disabled={isSavingCourse}
                      className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCourse}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingCourse && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lecture Modal (Add / Edit) */}
          {isLectureModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
              <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
                <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {editingLecture
                      ? isArabic
                        ? 'تعديل بيانات المحاضرة'
                        : 'Edit Lecture'
                      : isArabic
                      ? 'إضافة محاضرة جديدة'
                      : 'Add New Lecture'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsLectureModalOpen(false)}
                    disabled={isSavingLecture}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveLecture} className="p-5 space-y-4">
                  {lectureFormError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                      {lectureFormError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'عنوان المحاضرة (بالعربية) *' : 'Lecture Title (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={lectureFormData.title_ar}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, title_ar: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'عنوان المحاضرة (بالإنجليزية) *' : 'Lecture Title (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={lectureFormData.title_en}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, title_en: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'ترتيب المحاضرة' : 'Sequence Order'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={lectureFormData.sequence_order}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, sequence_order: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'المدة التقديرية (بالثواني)' : 'Duration (seconds)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={lectureFormData.duration_seconds}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, duration_seconds: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'نوع الوصول (Access Type)' : 'Access Type'}
                      </label>
                      <select
                        value={lectureFormData.access_type}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, access_type: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      >
                        <option value="FREE">{isArabic ? 'مجاني (FREE)' : 'FREE'}</option>
                        <option value="ALL">{isArabic ? 'الكل (ALL)' : 'ALL'}</option>
                        <option value="ENROLLED_ONLY">{isArabic ? 'المشتركون فقط (ENROLLED_ONLY)' : 'ENROLLED_ONLY'}</option>
                        <option value="PURCHASED_ONLY">{isArabic ? 'الشراء المباشر فقط (PURCHASED_ONLY)' : 'PURCHASED_ONLY'}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? 'الحالة' : 'Status'}
                      </label>
                      <select
                        value={lectureFormData.status}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, status: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      >
                        <option value="PUBLISHED">{isArabic ? 'منشور (PUBLISHED)' : 'PUBLISHED'}</option>
                        <option value="DRAFT">{isArabic ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
                        <option value="ARCHIVED">{isArabic ? 'مؤرشف (ARCHIVED)' : 'ARCHIVED'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'وصف المحاضرة (بالعربية)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={lectureFormData.description_ar}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, description_ar: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="lecture_is_free"
                        checked={lectureFormData.is_free}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, is_free: e.target.checked })}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4"
                      />
                      <label htmlFor="lecture_is_free" className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                        {isArabic ? 'معاينة مجانية (Free Preview)' : 'Free preview'}
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="lecture_is_published"
                        checked={lectureFormData.is_published}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, is_published: e.target.checked })}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4"
                      />
                      <label htmlFor="lecture_is_published" className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                        {isArabic ? 'نشر المحاضرة' : 'Publish lecture'}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsLectureModalOpen(false)}
                      disabled={isSavingLecture}
                      className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingLecture}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingLecture && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      {editingLecture
                        ? isArabic
                          ? 'حفظ التعديلات'
                          : 'Save Changes'
                        : isArabic
                        ? 'إضافة المحاضرة'
                        : 'Add Lecture'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Lecture Confirm Dialog */}
          <ConfirmDialog
            isOpen={Boolean(lectureToDelete)}
            title={isArabic ? 'حذف المحاضرة' : 'Delete Lecture'}
            message={
              isArabic
                ? `هل أنت متأكد من حذف المحاضرة "${lectureToDelete?.title_ar}"؟ سيتم حذف كافة الفهارس والفيديوهات والمرفقات المرتبطة بها نهائياً من قاعدة البيانات.`
                : `Are you sure you want to delete "${lectureToDelete?.title_en || lectureToDelete?.title_ar}"? All associated chapters, videos, and attachments will be permanently removed.`
            }
            confirmText={isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}
            cancelText={isArabic ? 'إلغاء' : 'Cancel'}
            isDestructive={true}
            isLoading={isDeletingLecture}
            onConfirm={handleConfirmDeleteLecture}
            onClose={() => {
              if (!isDeletingLecture) {
                setLectureToDelete(null);
                setDeleteError(null);
              }
            }}
          />

          {/* Lecture Videos Management Modal */}
          {selectedLectureForVideos && (
            <LectureVideosModal
              isOpen={Boolean(selectedLectureForVideos)}
              lectureId={selectedLectureForVideos.id}
              lectureTitle={selectedLectureForVideos.title_ar}
              onClose={() => setSelectedLectureForVideos(null)}
              onVideoAttached={(updatedVideo) => {
                if (updatedVideo.video_type === 'MAIN') {
                  setLectures((prev) =>
                    prev.map((l) =>
                      l.id === updatedVideo.lecture_id
                        ? { ...l, duration_seconds: updatedVideo.duration_seconds }
                        : l
                    )
                  );
                }
              }}
            />
          )}

          {/* Lecture Chapters / Index Modal */}
          {selectedLectureForChapters && (
            <LectureChaptersModal
              isOpen={Boolean(selectedLectureForChapters)}
              lectureId={selectedLectureForChapters.id}
              lectureTitle={selectedLectureForChapters.title_ar}
              lectureDurationSeconds={selectedLectureForChapters.duration_seconds}
              onClose={() => setSelectedLectureForChapters(null)}
            />
          )}

          {/* Lecture Attachments / Google Drive PDF Modal */}
          {selectedLectureForAttachments && (
            <LectureAttachmentsModal
              isOpen={Boolean(selectedLectureForAttachments)}
              lectureId={selectedLectureForAttachments.id}
              lectureTitle={selectedLectureForAttachments.title_ar}
              onClose={() => setSelectedLectureForAttachments(null)}
            />
          )}
        </div>
      </PermissionGate>
    </StaffGuard>
  );
}


