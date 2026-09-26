'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  FileUp,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  defaultLecturesApi,
  defaultAttachmentsApi,
  AttachmentItem,
  UploadAttachmentPayload,
  UpdateAttachmentPayload,
  SystemPermissions,
  formatFileSize,
  ApiError,
} from '@omar-makawy/shared';
import { PermissionGate } from '../rbac/PermissionGate';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { LoadingState, ErrorState } from '../ui/FeedbackStates';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (Matches backend configuration)

interface LectureAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle: string;
  onAttachmentsUpdated?: (attachmentsCount: number) => void;
}

export function LectureAttachmentsModal({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  onAttachmentsUpdated,
}: LectureAttachmentsModalProps) {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, isGlobalScope } = useAcademicYear();

  // Data state
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Upload Form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadAllowed, setDownloadAllowed] = useState(false);
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Form state
  const [editingAttachment, setEditingAttachment] = useState<AttachmentItem | null>(null);
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editDownloadAllowed, setEditDownloadAllowed] = useState(false);
  const [editOrderIndex, setEditOrderIndex] = useState(1);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // View / Download binary stream state
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete state
  const [attachmentToDelete, setAttachmentToDelete] = useState<AttachmentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch attachments for this lecture
  const fetchAttachments = useCallback(async () => {
    if (!lectureId) return;

    setIsLoading(true);
    setError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const lectureDetail = await defaultLecturesApi.getLectureById(lectureId, yearScope);
      const rawAttachments: AttachmentItem[] = lectureDetail.attachments || [];
      const sorted = [...rawAttachments].sort((a, b) => {
        return (a.order_index || 0) - (b.order_index || 0);
      });
      setAttachments(sorted);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    if (isOpen) {
      fetchAttachments();
      setIsUploadOpen(false);
      setEditingAttachment(null);
      setFormError(null);
      setEditFormError(null);
      setSuccessMessage(null);
      setDeleteError(null);
      setActionError(null);
    }
  }, [isOpen, fetchAttachments]);

  if (!isOpen) return null;

  // Handle open upload form
  const handleOpenUpload = () => {
    setTitleAr('');
    setTitleEn('');
    setSelectedFile(null);
    setDownloadAllowed(false);
    const nextOrder = attachments.length > 0 ? Math.max(...attachments.map((a) => a.order_index || 0)) + 1 : 1;
    setOrderIndex(nextOrder);
    setFormError(null);
    setSuccessMessage(null);
    setEditingAttachment(null);
    setIsUploadOpen(true);
  };

  // Validate File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isForEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (isForEdit) setEditFile(null);
      else setSelectedFile(null);
      return;
    }

    // Validate MIME / extension
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      const errMsg = isArabic
        ? 'نوع الملف غير صالح: يُسمح فقط بملفات PDF (.pdf).'
        : 'Invalid file type: Only PDF documents (.pdf) are permitted.';
      if (isForEdit) setEditFormError(errMsg);
      else setFormError(errMsg);
      e.target.value = '';
      return;
    }

    // Validate size limit (50 MB)
    if (file.size > MAX_PDF_SIZE_BYTES) {
      const errMsg = isArabic
        ? `حجم الملف (${formatFileSize(file.size)}) يتجاوز الحد الأقصى المسموح به (50 ميجابايت).`
        : `File size (${formatFileSize(file.size)}) exceeds maximum limit of 50 MB.`;
      if (isForEdit) setEditFormError(errMsg);
      else setFormError(errMsg);
      e.target.value = '';
      return;
    }

    if (isForEdit) {
      setEditFile(file);
      setEditFormError(null);
    } else {
      setSelectedFile(file);
      setFormError(null);
      // Auto-suggest titles if blank
      if (!titleAr) {
        setTitleAr(file.name.replace(/\.pdf$/i, ''));
      }
      if (!titleEn) {
        setTitleEn(file.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  // Submit Upload
  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setFormError(isArabic ? 'يرجى اختيار ملف PDF للرفع.' : 'Please select a PDF file to upload.');
      return;
    }

    if (!titleAr.trim() || !titleEn.trim()) {
      setFormError(isArabic ? 'يرجى إدخال عنوان المرفق بالعربية والإنجليزية.' : 'Both Arabic and English titles are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    const payload: UploadAttachmentPayload = {
      file: selectedFile,
      title_ar: titleAr.trim(),
      title_en: titleEn.trim(),
      download_allowed: downloadAllowed,
      order_index: Number(orderIndex) || 1,
    };

    try {
      const created = await defaultAttachmentsApi.uploadAttachment(lectureId, payload, yearScope);
      const updatedList = [...attachments, created].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setAttachments(updatedList);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setSuccessMessage(
        isArabic
          ? `تم رفع وتأمين المرفق "${created.title_ar}" بنجاح على Google Drive.`
          : `Attachment "${created.title_en}" successfully uploaded and secured on Google Drive.`
      );

      if (onAttachmentsUpdated) {
        onAttachmentsUpdated(updatedList.length);
      }
    } catch (err: any) {
      setFormError(
        err.message ||
          (isArabic ? 'فشل رفع المرفق. تأكد من اتصال الخادم وحجم الملف.' : 'Failed to upload attachment.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Form
  const handleOpenEdit = (attachment: AttachmentItem) => {
    setEditingAttachment(attachment);
    setEditTitleAr(attachment.title_ar);
    setEditTitleEn(attachment.title_en);
    setEditDownloadAllowed(attachment.download_allowed);
    setEditOrderIndex(attachment.order_index || 1);
    setEditFile(null);
    setEditFormError(null);
    setIsUploadOpen(false);
  };

  // Submit Edit / Replace
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttachment) return;

    if (!editTitleAr.trim() || !editTitleEn.trim()) {
      setEditFormError(isArabic ? 'يرجى إدخال عنوان المرفق بالعربية والإنجليزية.' : 'Both Arabic and English titles are required.');
      return;
    }

    setIsSavingEdit(true);
    setEditFormError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    const payload: UpdateAttachmentPayload = {
      title_ar: editTitleAr.trim(),
      title_en: editTitleEn.trim(),
      download_allowed: editDownloadAllowed,
      order_index: Number(editOrderIndex) || 1,
      file: editFile || undefined,
    };

    try {
      const updated = await defaultAttachmentsApi.updateAttachment(editingAttachment.id, payload, yearScope);
      const updatedList = attachments
        .map((a) => (a.id === updated.id ? updated : a))
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      setAttachments(updatedList);
      setEditingAttachment(null);
      setSuccessMessage(
        isArabic
          ? `تم تحديث بيانات المرفق "${updated.title_ar}" بنجاح.`
          : `Attachment "${updated.title_en}" updated successfully.`
      );
    } catch (err: any) {
      setEditFormError(
        err.message ||
          (isArabic ? 'فشل حفظ التعديلات على المرفق.' : 'Failed to update attachment metadata.')
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  // View PDF inline in new tab via authorized blob stream
  const handleViewPdf = async (attachment: AttachmentItem) => {
    setActiveActionId(attachment.id);
    setActionError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const { blob } = await defaultAttachmentsApi.fetchAttachmentBlob(attachment.id, false, yearScope);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      // Clean up blob URL after a short timeout
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (err: any) {
      setActionError(
        err.message ||
          (isArabic ? 'تعذر فتح ملف PDF. تحقق من الصلاحيات والاتصال.' : 'Failed to stream PDF binary.')
      );
    } finally {
      setActiveActionId(null);
    }
  };

  // Download PDF via authorized blob stream
  const handleDownloadPdf = async (attachment: AttachmentItem) => {
    setActiveActionId(attachment.id);
    setActionError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const { blob, filename } = await defaultAttachmentsApi.fetchAttachmentBlob(attachment.id, true, yearScope);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || attachment.original_filename || `${attachment.title_en}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (err: any) {
      setActionError(
        err.message ||
          (isArabic ? 'تعذر تحميل ملف PDF. تحقق من الصلاحيات والاتصال.' : 'Failed to download PDF binary.')
      );
    } finally {
      setActiveActionId(null);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      await defaultAttachmentsApi.deleteAttachment(attachmentToDelete.id, yearScope);
      const updatedList = attachments.filter((a) => a.id !== attachmentToDelete.id);
      setAttachments(updatedList);
      setAttachmentToDelete(null);
      setSuccessMessage(
        isArabic
          ? `تم حذف المرفق "${attachmentToDelete.title_ar}" من Google Drive وقاعدة البيانات نهائياً.`
          : `Attachment "${attachmentToDelete.title_en}" permanently deleted from Google Drive and database.`
      );

      if (onAttachmentsUpdated) {
        onAttachmentsUpdated(updatedList.length);
      }
    } catch (err: any) {
      setDeleteError(
        err.message ||
          (isArabic ? 'فشل حذف المرفق من وحدة التخزين.' : 'Failed to delete attachment from storage.')
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
        aria-labelledby="lecture-attachments-title"
      >
        <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 id="lecture-attachments-title" className="text-base font-bold text-neutral-900 dark:text-white">
                  {isArabic ? 'المذكرات والمرفقات (Google Drive PDF)' : 'Lecture PDF Attachments & Documents'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  {lectureTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchAttachments}
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

          {/* Body */}
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

            {actionError && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-700 dark:text-rose-400 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800"
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

            {/* Storage Info Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-400">
              <HardDrive className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isArabic
                  ? 'يتم تخزين المذكرات ومسائل المحاضرة بشكل آمن ومشفر على Google Drive. الوصول إلى الملفات يمر عبر تصريح الخادم فقط دون كشف الروابط المباشرة.'
                  : 'Lecture PDFs and attachments are securely stored in Google Drive. Direct streaming is proxy-authorized through the backend to protect content.'}
              </p>
            </div>

            {/* Loading / Error States */}
            {isLoading ? (
              <LoadingState
                message={
                  isArabic
                    ? 'جاري تحميل مرفقات المحاضرة من وحدة التخزين...'
                    : 'Loading lecture attachments from storage...'
                }
              />
            ) : error ? (
              <ErrorState
                title={
                  isArabic
                    ? 'تعذر تحميل مرفقات المحاضرة'
                    : 'Failed to Load Attachments'
                }
                message={error.message}
                onRetry={fetchAttachments}
              />
            ) : (
              <div className="space-y-4">
                {/* List Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      {isArabic ? 'الملفات المرفقة' : 'Attached Files'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {attachments.length}
                    </span>
                  </div>

                  {!isUploadOpen && !editingAttachment && (
                    <PermissionGate permission={SystemPermissions.COURSES_CREATE}>
                      <button
                        type="button"
                        onClick={handleOpenUpload}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {isArabic ? 'رفع مذكرة / ملف PDF' : 'Upload PDF'}
                      </button>
                    </PermissionGate>
                  )}
                </div>

                {/* Upload Form Box */}
                {isUploadOpen && (
                  <form
                    onSubmit={handleSubmitUpload}
                    className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
                      <div className="flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                          {isArabic ? 'رفع مذكرة جديدة (Google Drive)' : 'Upload New PDF Attachment'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsUploadOpen(false)}
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

                    {/* PDF File Picker */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                        <span>{isArabic ? 'ملف الـ PDF *' : 'PDF Document *'}</span>
                        <span className="text-[10px] text-neutral-400">{isArabic ? 'الحد الأقصى: 50 ميجابايت' : 'Max size: 50 MB'}</span>
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleFileChange(e, false)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-700 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Arabic Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'عنوان المرفق (بالعربية) *' : 'Attachment Title (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={titleAr}
                          onChange={(e) => setTitleAr(e.target.value)}
                          placeholder={isArabic ? 'مثال: مذكرة شرح الدرس الأول' : 'e.g. مذكرة شرح الدرس الأول'}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* English Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'عنوان المرفق (بالإنجليزية) *' : 'Attachment Title (English) *'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder="e.g. Lecture 1 Study Notes"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                      {/* Order Index */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'رقم الترتيب' : 'Sort Order'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={orderIndex}
                          onChange={(e) => setOrderIndex(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </div>

                      {/* Download Allowed Toggle */}
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="download-allowed-checkbox"
                          checked={downloadAllowed}
                          onChange={(e) => setDownloadAllowed(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="download-allowed-checkbox" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                          {isArabic ? 'السماح للطلاب بتحميل الملف (Download)' : 'Allow Student Download'}
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsUploadOpen(false)}
                        disabled={isSubmitting}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedFile}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {isArabic ? 'رفع الملف الآن' : 'Upload File'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit Form Box */}
                {editingAttachment && (
                  <form
                    onSubmit={handleSubmitEdit}
                    className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                          {isArabic ? `تعديل بيانات المرفق: ${editingAttachment.title_ar}` : `Edit Attachment: ${editingAttachment.title_en}`}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAttachment(null)}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {editFormError && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                        {editFormError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Arabic Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'عنوان المرفق (بالعربية) *' : 'Attachment Title (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={editTitleAr}
                          onChange={(e) => setEditTitleAr(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      {/* English Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'عنوان المرفق (بالإنجليزية) *' : 'Attachment Title (English) *'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={editTitleEn}
                          onChange={(e) => setEditTitleEn(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      {/* Order Index */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'رقم الترتيب' : 'Sort Order'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editOrderIndex}
                          onChange={(e) => setEditOrderIndex(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        />
                      </div>

                      {/* Download Allowed */}
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="edit-download-allowed-checkbox"
                          checked={editDownloadAllowed}
                          onChange={(e) => setEditDownloadAllowed(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <label htmlFor="edit-download-allowed-checkbox" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                          {isArabic ? 'السماح للطلاب بتحميل الملف' : 'Allow Student Download'}
                        </label>
                      </div>
                    </div>

                    {/* Optional File Replacement */}
                    <div className="space-y-1 pt-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                        <span>{isArabic ? 'استبدال ملف الـ PDF (اختياري)' : 'Replace PDF File (Optional)'}</span>
                        <span className="text-[10px] text-neutral-400">{isArabic ? 'اتركه فارغاً للاحتفاظ بالملف الحالي' : 'Leave empty to keep existing file'}</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleFileChange(e, true)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-700 file:text-neutral-700 dark:file:text-neutral-300 cursor-pointer"
                      />
                      {editFile && (
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                          {isArabic ? 'الملف الجديد البديل:' : 'Replacement file:'} {editFile.name} ({formatFileSize(editFile.size)})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingAttachment(null)}
                        disabled={isSavingEdit}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {isSavingEdit && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Attachments */}
                {attachments.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <FileText className="h-8 w-8 mx-auto text-neutral-400 dark:text-neutral-500 mb-2" />
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {isArabic
                        ? 'لا توجد مذكرات أو مرفقات مسجلة لهذه المحاضرة بعد.'
                        : 'No PDF attachments or documents uploaded for this lecture yet.'}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                      {isArabic
                        ? 'قم برفع ملفات PDF (مذكرات، تمارين، واجبات) ليتمكن الطلاب من دراستها.'
                        : 'Upload PDF files (notes, exercises, homework) for students to study.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((att) => {
                      const isActionLoading = activeActionId === att.id;

                      return (
                        <div
                          key={att.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all gap-3 group"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            {/* PDF Icon */}
                            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>

                            {/* Details */}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                  {att.title_ar}
                                </span>
                                {att.order_index !== undefined && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                                    #{att.order_index}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                                {att.title_en}
                              </p>

                              <div className="flex items-center gap-2.5 text-[11px] text-neutral-400 flex-wrap pt-0.5">
                                {att.original_filename && (
                                  <span className="truncate max-w-[180px] font-mono">
                                    {att.original_filename}
                                  </span>
                                )}
                                {att.file_size_bytes && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{formatFileSize(att.file_size_bytes)}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span className={`inline-flex items-center gap-1 font-medium ${
                                  att.download_allowed
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                  {att.download_allowed ? (
                                    <>
                                      <ShieldCheck className="h-3 w-3" />
                                      {isArabic ? 'التحميل متاح' : 'Download allowed'}
                                    </>
                                  ) : (
                                    <>
                                      <ShieldAlert className="h-3 w-3" />
                                      {isArabic ? 'معاينة فقط (التحميل محظور)' : 'View only (No download)'}
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {/* View / Open PDF */}
                            <button
                              type="button"
                              onClick={() => handleViewPdf(att)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              title={isArabic ? 'معاينة PDF في نافذة جديدة' : 'View PDF in new tab'}
                            >
                              {isActionLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Eye className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                              )}
                              <span>{isArabic ? 'معاينة' : 'View'}</span>
                            </button>

                            {/* Download PDF */}
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(att)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              title={isArabic ? 'تحميل ملف PDF' : 'Download PDF'}
                            >
                              <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{isArabic ? 'تحميل' : 'Download'}</span>
                            </button>

                            {/* Edit Metadata / Replace */}
                            <PermissionGate permission={SystemPermissions.COURSES_UPDATE}>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(att)}
                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                title={isArabic ? 'تعديل المرفق' : 'Edit Attachment'}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </PermissionGate>

                            {/* Delete Attachment */}
                            <PermissionGate permission={SystemPermissions.COURSES_DELETE}>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError(null);
                                  setAttachmentToDelete(att);
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title={isArabic ? 'حذف المرفق من Google Drive' : 'Delete Attachment'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </PermissionGate>
                          </div>
                        </div>
                      );
                    })}
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
        isOpen={Boolean(attachmentToDelete)}
        title={isArabic ? 'حذف المرفق من Google Drive' : 'Delete Attachment'}
        message={
          isArabic
            ? `هل أنت متأكد من حذف المرفق "${attachmentToDelete?.title_ar}" (${attachmentToDelete?.original_filename || 'PDF'})؟ سيتم حذف الملف نهائياً من Google Drive وقاعدة البيانات ولا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to permanently delete "${attachmentToDelete?.title_en || attachmentToDelete?.title_ar}"? The file will be removed from Google Drive and the database permanently.`
        }
        confirmText={isArabic ? 'تأكيد الحذف النهائي' : 'Confirm Delete'}
        cancelText={isArabic ? 'إلغاء' : 'Cancel'}
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setAttachmentToDelete(null);
            setDeleteError(null);
          }
        }}
      />
    </>
  );
}
