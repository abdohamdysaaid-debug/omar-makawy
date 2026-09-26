'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bookmark,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  ListOrdered,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  defaultLecturesApi,
  LectureChapterItem,
  CreateChapterPayload,
  SystemPermissions,
  formatTimestamp,
  parseTimestampToSeconds,
  ApiError,
} from '@omar-makawy/shared';
import { PermissionGate } from '../rbac/PermissionGate';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { LoadingState, ErrorState, EmptyState } from '../ui/FeedbackStates';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface LectureChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle: string;
  lectureDurationSeconds?: number;
  onChaptersUpdated?: (chaptersCount: number) => void;
}

export function LectureChaptersModal({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  lectureDurationSeconds = 0,
  onChaptersUpdated,
}: LectureChaptersModalProps) {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, isGlobalScope } = useAcademicYear();

  // Data state
  const [chapters, setChapters] = useState<LectureChapterItem[]>([]);
  const [knownDuration, setKnownDuration] = useState<number>(lectureDurationSeconds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [timestampInput, setTimestampInput] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion confirmation state
  const [chapterToDelete, setChapterToDelete] = useState<LectureChapterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Computed parsed seconds for live preview & validation
  const parsedSeconds = useMemo(() => {
    return parseTimestampToSeconds(timestampInput);
  }, [timestampInput]);

  const isTimestampExceedingDuration = useMemo(() => {
    if (parsedSeconds === null || knownDuration <= 0) return false;
    return parsedSeconds > knownDuration;
  }, [parsedSeconds, knownDuration]);

  // Fetch chapters for this lecture
  const fetchChapters = useCallback(async () => {
    if (!lectureId) return;

    setIsLoading(true);
    setError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const lectureDetail = await defaultLecturesApi.getLectureById(lectureId, yearScope);
      const rawChapters: LectureChapterItem[] = lectureDetail.chapters || [];
      // Ensure sorted by sequence_order ASC, then timestamp_seconds ASC
      const sorted = [...rawChapters].sort((a, b) => {
        if (a.sequence_order !== b.sequence_order) {
          return a.sequence_order - b.sequence_order;
        }
        return a.timestamp_seconds - b.timestamp_seconds;
      });

      setChapters(sorted);
      if (lectureDetail.duration_seconds > 0) {
        setKnownDuration(lectureDetail.duration_seconds);
      }
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    if (isOpen) {
      fetchChapters();
      setIsAddFormOpen(false);
      setFormError(null);
      setSuccessMessage(null);
      setDeleteError(null);
    }
  }, [isOpen, fetchChapters]);

  // Auto-suggest next sequence order when chapters update
  useEffect(() => {
    if (chapters.length > 0) {
      const maxSeq = Math.max(...chapters.map((c) => c.sequence_order || 0));
      setSequenceOrder(maxSeq + 1);
    } else {
      setSequenceOrder(1);
    }
  }, [chapters]);

  if (!isOpen) return null;

  // Handle open add form
  const handleOpenAddForm = () => {
    setTitleAr('');
    setTitleEn('');
    setTimestampInput('');
    const nextSeq = chapters.length > 0 ? Math.max(...chapters.map((c) => c.sequence_order || 0)) + 1 : 1;
    setSequenceOrder(nextSeq);
    setFormError(null);
    setSuccessMessage(null);
    setIsAddFormOpen(true);
  };

  // Handle submit new chapter
  const handleSubmitChapter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleAr.trim() || !titleEn.trim()) {
      setFormError(isArabic ? 'يرجى إدخال عنوان الفصل بالعربية والإنجليزية.' : 'Both Arabic and English titles are required.');
      return;
    }

    if (parsedSeconds === null || parsedSeconds < 0) {
      setFormError(
        isArabic
          ? 'يرجى إدخال توقيت زمني صالح (مثال: 02:45 أو 01:10:00 أو عدد الثواني).'
          : 'Please enter a valid timestamp format (e.g. 02:45, 01:10:00, or raw seconds).'
      );
      return;
    }

    if (knownDuration > 0 && parsedSeconds > knownDuration) {
      setFormError(
        isArabic
          ? `التوقيت المحدد (${parsedSeconds} ثانية) يتجاوز مدة المحاضرة (${knownDuration} ثانية).`
          : `Selected timestamp (${parsedSeconds}s) exceeds lecture duration (${knownDuration}s).`
      );
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    const payload: CreateChapterPayload = {
      title_ar: titleAr.trim(),
      title_en: titleEn.trim(),
      timestamp_seconds: parsedSeconds,
      sequence_order: Number(sequenceOrder) || 1,
    };

    try {
      const created = await defaultLecturesApi.addChapter(lectureId, payload, yearScope);
      const updatedList = [...chapters, created].sort((a, b) => {
        if (a.sequence_order !== b.sequence_order) {
          return a.sequence_order - b.sequence_order;
        }
        return a.timestamp_seconds - b.timestamp_seconds;
      });

      setChapters(updatedList);
      setIsAddFormOpen(false);
      setSuccessMessage(
        isArabic
          ? `تم إضافة الفصل "${created.title_ar}" بنجاح عند التوقيت ${formatTimestamp(created.timestamp_seconds)}.`
          : `Chapter "${created.title_en}" successfully added at ${formatTimestamp(created.timestamp_seconds)}.`
      );

      if (onChaptersUpdated) {
        onChaptersUpdated(updatedList.length);
      }
    } catch (err: any) {
      setFormError(
        err.message ||
          (isArabic
            ? 'حدث خطأ أثناء إضافة الفصل. تأكد من صحة البيانات.'
            : 'Failed to add chapter. Please verify your input.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm delete chapter
  const handleConfirmDelete = async () => {
    if (!chapterToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      await defaultLecturesApi.deleteChapter(lectureId, chapterToDelete.id, yearScope);
      const updatedList = chapters.filter((c) => c.id !== chapterToDelete.id);
      setChapters(updatedList);
      setChapterToDelete(null);
      setSuccessMessage(
        isArabic
          ? `تم حذف الفصل "${chapterToDelete.title_ar}" بنجاح.`
          : `Chapter "${chapterToDelete.title_en}" successfully removed.`
      );

      if (onChaptersUpdated) {
        onChaptersUpdated(updatedList.length);
      }
    } catch (err: any) {
      setDeleteError(
        err.message ||
          (isArabic ? 'فشل حذف الفصل من المحاضرة.' : 'Failed to delete chapter from lecture.')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lecture-chapters-title"
      >
        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <h3 id="lecture-chapters-title" className="text-base font-bold text-neutral-900 dark:text-white">
                  {isArabic ? 'فهرس فصول المحاضرة (Timestamp Index)' : 'Lecture Chapters & Timestamp Index'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  {lectureTitle}
                  {knownDuration > 0 && ` • ${isArabic ? 'المدة' : 'Duration'}: ${formatTimestamp(knownDuration)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchChapters}
                disabled={isLoading}
                title={isArabic ? 'تحديث' : 'Refresh'}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Feedback Notifications */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="flex-1">{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {deleteError && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-700 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{deleteError}</span>
                <button
                  type="button"
                  onClick={() => setDeleteError(null)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Contract Info Note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-400">
              <Info className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isArabic
                  ? 'يتيح الفهرس الزمني للطلاب الانتقال مباشرة إلى النقاط الهامة داخل الفيديو. لإعادة ترتيب أو تعديل فصل، قم بحذفه وإعادة إضافته بالبيانات الجديدة.'
                  : 'Timestamp chapters enable students to jump directly to key video segments. To modify a chapter, remove and re-add it with the desired details.'}
              </p>
            </div>

            {/* Loading / Error States */}
            {isLoading ? (
              <LoadingState
                message={
                  isArabic
                    ? 'جاري تحميل فهرس فصول المحاضرة...'
                    : 'Loading lecture chapter index...'
                }
              />
            ) : error ? (
              <ErrorState
                title={
                  isArabic
                    ? 'تعذر تحميل فهرس الفصول'
                    : 'Failed to Load Chapter Index'
                }
                message={error.message}
                onRetry={fetchChapters}
              />
            ) : (

              <div className="space-y-4">
                {/* Chapters List Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      {isArabic ? 'الفصول المسجلة' : 'Recorded Chapters'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {chapters.length}
                    </span>
                  </div>

                  {!isAddFormOpen && (
                    <PermissionGate permission={SystemPermissions.COURSES_CREATE}>
                      <button
                        type="button"
                        onClick={handleOpenAddForm}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isArabic ? 'إضافة فصل جديد' : 'Add Chapter'}
                      </button>
                    </PermissionGate>
                  )}
                </div>

                {/* Add Chapter Form Drawer / Box */}
                {isAddFormOpen && (
                  <form
                    onSubmit={handleSubmitChapter}
                    className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                          {isArabic ? 'إضافة فصل زمني جديد' : 'New Chapter Details'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddFormOpen(false)}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {formError && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Arabic Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'عنوان الفصل (بالعربية) *' : 'Chapter Title (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={titleAr}
                          onChange={(e) => setTitleAr(e.target.value)}
                          placeholder={isArabic ? 'مثال: مقدمة الشرح' : 'e.g. مقدمة الشرح'}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* English Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'عنوان الفصل (بالإنجليزية) *' : 'Chapter Title (English) *'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder="e.g. Introduction & Basics"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Timestamp Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                          <span>{isArabic ? 'التوقيت الزمني (MM:SS أو HH:MM:SS) *' : 'Timestamp Offset *'}</span>
                          {parsedSeconds !== null && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatTimestamp(parsedSeconds)} ({parsedSeconds}s)
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          required
                          value={timestampInput}
                          onChange={(e) => setTimestampInput(e.target.value)}
                          placeholder="05:30 or 01:15:00"
                          className={`w-full px-3 py-2 text-xs rounded-lg border ${
                            isTimestampExceedingDuration
                              ? 'border-rose-500 focus:ring-rose-500'
                              : 'border-neutral-200 dark:border-neutral-700 focus:ring-emerald-500'
                          } bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 font-mono`}
                        />
                        {isTimestampExceedingDuration && (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            {isArabic
                              ? `التوقيت يتجاوز مدة المحاضرة (${formatTimestamp(knownDuration)})`
                              : `Timestamp exceeds lecture duration (${formatTimestamp(knownDuration)})`}
                          </p>
                        )}
                      </div>

                      {/* Sequence Order */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'رقم الترتيب (Sequence)' : 'Sequence Order'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={sequenceOrder}
                          onChange={(e) => setSequenceOrder(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddFormOpen(false)}
                        disabled={isSubmitting}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || isTimestampExceedingDuration || parsedSeconds === null}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        {isArabic ? 'حفظ الفصل' : 'Save Chapter'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Chapters */}
                {chapters.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <ListOrdered className="h-8 w-8 mx-auto text-neutral-400 dark:text-neutral-500 mb-2" />
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {isArabic
                        ? 'لا توجد فصول زمنية مضافة لهذه المحاضرة بعد.'
                        : 'No timestamp chapters recorded for this lecture yet.'}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                      {isArabic
                        ? 'أضف فصولاً لتمكين الطلاب من التنقل في الفيديو بسهولة.'
                        : 'Add chapters to allow fast navigation across lecture parts.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Sequence Badge */}
                          <span className="flex items-center justify-center h-6 w-6 rounded-md bg-neutral-100 dark:bg-neutral-700 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 shrink-0 font-mono">
                            #{chapter.sequence_order}
                          </span>

                          {/* Timestamp Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold font-mono shrink-0">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(chapter.timestamp_seconds)}</span>
                          </div>

                          {/* Titles */}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                              {chapter.title_ar}
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                              {chapter.title_en}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <PermissionGate permission={SystemPermissions.COURSES_DELETE}>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setChapterToDelete(chapter);
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title={isArabic ? 'حذف الفصل' : 'Delete Chapter'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(chapterToDelete)}
        title={isArabic ? 'حذف الفصل الزمني' : 'Delete Chapter'}
        message={
          isArabic
            ? `هل أنت متأكد من حذف الفصل "${chapterToDelete?.title_ar}" (${formatTimestamp(
                chapterToDelete?.timestamp_seconds || 0
              )})؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to remove chapter "${chapterToDelete?.title_en}" (${formatTimestamp(
                chapterToDelete?.timestamp_seconds || 0
              )})? This action cannot be undone.`
        }
        confirmText={isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}
        cancelText={isArabic ? 'إلغاء' : 'Cancel'}
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setChapterToDelete(null);
            setDeleteError(null);
          }
        }}
      />
    </>
  );
}
