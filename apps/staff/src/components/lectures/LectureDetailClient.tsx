'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  BookOpen,
  Package,
  Calendar,
  Clock,
  FileText,
  Lock,
  Globe,
  Sparkles,
  ListOrdered,
  Eye,
  CheckCircle2,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  LectureItem,
  SystemPermissions,
  createLecturesApi,
  resolveLectureThumbnailUrl,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LectureFormModal } from './LectureFormModal';

const staffLecturesApi = createLecturesApi(staffApiClient);

export function LectureDetailClient({ lectureId }: { lectureId: string }) {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();
  const { activeAcademicYearId } = useAcademicYearScope();

  const canManage = isTeacher || hasPermission(SystemPermissions.LECTURES_MANAGE);

  const [lecture, setLecture] = useState<LectureItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchLecture = useCallback(async () => {
    if (!lectureId || lectureId === 'detail') return;
    setLoading(true);
    setError(null);
    try {
      const data = await staffLecturesApi.getLectureById(lectureId, activeAcademicYearId || undefined);
      setLecture(data);
    } catch (err: any) {
      setError(
        err?.message || (isAr ? 'فشل تحميل بيانات المحاضرة' : 'Failed to load lecture details')
      );
    } finally {
      setLoading(false);
    }
  }, [lectureId, activeAcademicYearId, isAr]);

  useEffect(() => {
    fetchLecture();
  }, [fetchLecture]);

  const handleDeleteLecture = async () => {
    if (!lecture) return;
    setIsDeleting(true);
    try {
      await staffLecturesApi.deleteLecture(lecture.id, lecture.academic_year_id);
      router.push('/staff/lectures');
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل حذف المحاضرة' : 'Failed to delete lecture'));
    } finally {
      setIsDeleting(false);
    }
  };

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  if (loading) {
    return <LoadingState message={isAr ? 'جاري تحميل تفاصيل المحاضرة...' : 'Loading lecture details...'} />;
  }

  if (error || !lecture) {
    return (
      <div className="space-y-4">
        <Link
          href="/staff/lectures"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <BackIcon className="w-4 h-4" />
          <span>{isAr ? 'العودة إلى قائمة المحاضرات' : 'Back to Lectures'}</span>
        </Link>
        <ErrorState message={error || (isAr ? 'المحاضرة غير موجودة' : 'Lecture not found')} onRetry={fetchLecture} />
      </div>
    );
  }

  const mainVideo = lecture.videos?.find((v) => v.video_type === 'MAIN');
  const solutionVideo = lecture.videos?.find((v) => v.video_type === 'SOLUTION');
  const mainVideoId = mainVideo ? extractYouTubeVideoId(mainVideo.provider_video_id) : null;
  const solutionVideoId = solutionVideo ? extractYouTubeVideoId(solutionVideo.provider_video_id) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/lectures"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            <BackIcon className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                {lecture.academic_year_code || lecture.academic_year_name_ar || 'YEAR'}
              </span>
              <StatusBadge status={lecture.status || 'PUBLISHED'} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-1">{lecture.title_ar}</h1>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تعديل المحاضرة' : 'Edit Lecture'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-300 border border-neutral-700 hover:border-red-900 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Player + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Video 16:9 */}
          <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'فيديو المحاضرة الأساسي' : 'Main Lecture Video'}</span>
              </h3>
              {mainVideoId && (
                <span className="text-[11px] font-mono text-neutral-400">ID: {mainVideoId}</span>
              )}
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-800">
              {mainVideoId ? (
                <iframe
                  src={buildYouTubeEmbedUrl(mainVideoId)}
                  title={lecture.title_ar}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                  <Video className="w-10 h-10" />
                  <span className="text-xs">{isAr ? 'لا يوجد فيديو أساسي مرفق' : 'No main video attached'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Chapters Section */}
          {lecture.chapters && lecture.chapters.length > 0 && (
            <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                <ListOrdered className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'فهرس المحاضرة' : 'Lecture Chapters'}</span>
              </div>

              <div className="space-y-2">
                {lecture.chapters.map((ch) => {
                  const mins = Math.floor(ch.timestamp_seconds / 60);
                  const secs = ch.timestamp_seconds % 60;
                  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                  return (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#121814] border border-neutral-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                          {timeFormatted}
                        </span>
                        <span className="font-semibold text-white truncate">{ch.title_ar}</span>
                      </div>
                      {ch.title_en && (
                        <span className="text-[11px] text-neutral-400 font-sans" dir="ltr">
                          {ch.title_en}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Solution Video if present */}
          {solutionVideoId && (
            <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Video className="w-4 h-4" />
                <span>{isAr ? 'فيديو الحل النموذجي' : 'Solution Video'}</span>
              </div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-800">
                <iframe
                  src={buildYouTubeEmbedUrl(solutionVideoId)}
                  title={isAr ? 'فيديو الحل' : 'Solution Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right / Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl p-4 space-y-4 text-xs">
            <h3 className="font-bold text-neutral-200 border-b border-neutral-800 pb-2">
              {isAr ? 'معلومات المحاضرة' : 'Lecture Details'}
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">{isAr ? 'حالة الظهور' : 'Visibility'}</span>
                <span className="font-semibold text-white">{lecture.visibility || 'SUBSCRIBER_ONLY'}</span>
              </div>

              {lecture.scheduled_at && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'موعد النشر المجدول' : 'Scheduled Release'}</span>
                  <span className="font-mono text-amber-300">
                    {new Date(lecture.scheduled_at).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-neutral-400">{isAr ? 'الترتيب (Sort Order)' : 'Sort Order'}</span>
                <span className="font-mono text-white">{lecture.sort_order ?? 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400">{isAr ? 'تاريخ الإنشاء' : 'Created At'}</span>
                <span className="font-mono text-neutral-300">
                  {new Date(lecture.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
              </div>
            </div>

            {lecture.description_ar && (
              <div className="pt-3 border-t border-neutral-800 space-y-1">
                <span className="text-neutral-400 text-[11px] font-bold">{isAr ? 'الوصف' : 'Description'}</span>
                <p className="text-neutral-300 text-xs leading-relaxed">{lecture.description_ar}</p>
              </div>
            )}
          </div>

          {/* Assigned Courses */}
          <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {isAr ? 'الكورسات المرتبطة' : 'Linked Courses'}
              </span>
              <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full">
                {lecture.courses?.length || 0}
              </span>
            </div>

            {lecture.courses && lecture.courses.length > 0 ? (
              <div className="space-y-1.5">
                {lecture.courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#121814] border border-neutral-800 text-neutral-300"
                  >
                    <span className="truncate font-medium">{c.title_ar}</span>
                    <span className="text-[10px] font-mono text-neutral-500">#{c.sort_order}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic text-[11px]">
                {isAr ? 'لا توجد كورسات مرتبطة' : 'No courses linked'}
              </p>
            )}
          </div>

          {/* Assigned Packages */}
          <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                {isAr ? 'الباقات المرتبطة' : 'Linked Packages'}
              </span>
              <span className="font-mono text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full">
                {lecture.packages?.length || 0}
              </span>
            </div>

            {lecture.packages && lecture.packages.length > 0 ? (
              <div className="space-y-1.5">
                {lecture.packages.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#121814] border border-neutral-800 text-neutral-300"
                  >
                    <span className="truncate font-medium">{p.title_ar}</span>
                    <span className="text-[10px] font-mono text-neutral-500">#{p.sort_order}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic text-[11px]">
                {isAr ? 'لا توجد باقات مرتبطة' : 'No packages linked'}
              </p>
            )}
          </div>

          {/* Attachments Section */}
          <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                {isAr ? 'المذكرات والمرفقات' : 'Attachments'}
              </span>
              <span className="font-mono text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full">
                {lecture.attachments?.length || 0}
              </span>
            </div>

            {lecture.attachments && lecture.attachments.length > 0 ? (
              <div className="space-y-1.5">
                {lecture.attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#121814] border border-neutral-800 text-neutral-300"
                  >
                    <span className="truncate font-medium">{a.title_ar}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded">
                      PDF
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic text-[11px]">
                {isAr ? 'لا توجد مرفقات' : 'No attachments'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditModalOpen && (
        <LectureFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(saved) => {
            setLecture(saved);
            fetchLecture();
          }}
          initialLecture={lecture}
        />
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title={isAr ? 'حذف المحاضرة نهائياً' : 'Delete Lecture'}
          message={
            isAr
              ? `هل أنت متأكد من حذف المحاضرة "${lecture.title_ar}"؟`
              : `Are you sure you want to delete lecture "${lecture.title_ar}"?`
          }
          confirmText={isAr ? 'نعم، احذف' : 'Yes, Delete'}
          cancelText={isAr ? 'إلغاء' : 'Cancel'}
          isDestructive
          isLoading={isDeleting}
          onConfirm={handleDeleteLecture}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
