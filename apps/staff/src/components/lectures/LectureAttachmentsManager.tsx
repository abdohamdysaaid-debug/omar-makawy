'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Download,
  Lock,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AttachmentItem, createAttachmentsApi } from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';

const staffAttachmentsApi = createAttachmentsApi(staffApiClient);

export interface PendingAttachmentDraft {
  file: File;
  title_ar: string;
  title_en?: string;
  download_allowed: boolean;
}

interface LectureAttachmentsManagerProps {
  existingAttachments: AttachmentItem[];
  pendingAttachments: PendingAttachmentDraft[];
  onPendingChange: (pending: PendingAttachmentDraft[]) => void;
  onExistingDeleted?: (deletedId: string) => void;
  lectureId?: string;
  academicYearId?: string;
  disabled?: boolean;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function LectureAttachmentsManager({
  existingAttachments,
  pendingAttachments,
  onPendingChange,
  onExistingDeleted,
  lectureId,
  academicYearId,
  disabled = false,
}: LectureAttachmentsManagerProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titleAr, setTitleAr] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [downloadAllowed, setDownloadAllowed] = useState<boolean>(true);
  const [isDirectUploading, setIsDirectUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError(isAr ? 'يرجى اختيار ملف PDF صالح فقط' : 'Only .pdf files are accepted');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Auto-fill title if empty
    if (!titleAr) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitleAr(nameWithoutExt);
    }
  };

  const handleAddAttachment = async () => {
    setUploadError(null);

    if (!selectedFile) {
      setUploadError(isAr ? 'يرجى اختيار ملف PDF' : 'Please select a PDF file');
      return;
    }

    const cleanTitleAr = titleAr.trim();
    if (!cleanTitleAr) {
      setUploadError(isAr ? 'يرجى إدخال اسم المذكرة / المرفق' : 'Attachment title is required');
      return;
    }

    // If we have an existing lecture ID, we can upload immediately via attachments API
    if (lectureId) {
      setIsDirectUploading(true);
      try {
        await staffAttachmentsApi.uploadAttachment(
          lectureId,
          {
            file: selectedFile,
            title_ar: cleanTitleAr,
            title_en: titleEn.trim() || cleanTitleAr,
            download_allowed: downloadAllowed,
          },
          academicYearId
        );

        // Reset
        setSelectedFile(null);
        setTitleAr('');
        setTitleEn('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (onExistingDeleted) {
          // Trigger refresh in parent
          onExistingDeleted('');
        }
      } catch (err: any) {
        setUploadError(err?.message || (isAr ? 'فشل رفع الملف إلى Google Drive' : 'Failed to upload PDF'));
      } finally {
        setIsDirectUploading(false);
      }
    } else {
      // Pending mode (for create lecture)
      const draft: PendingAttachmentDraft = {
        file: selectedFile,
        title_ar: cleanTitleAr,
        title_en: titleEn.trim() || undefined,
        download_allowed: downloadAllowed,
      };

      onPendingChange([...pendingAttachments, draft]);

      // Reset
      setSelectedFile(null);
      setTitleAr('');
      setTitleEn('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePending = (idx: number) => {
    onPendingChange(pendingAttachments.filter((_, i) => i !== idx));
  };

  const handleRemoveExisting = async (id: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المرفق؟' : 'Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await staffAttachmentsApi.deleteAttachment(id, academicYearId);
      if (onExistingDeleted) {
        onExistingDeleted(id);
      }
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل حذف المرفق' : 'Failed to delete attachment'));
    }
  };

  const totalCount = existingAttachments.length + pendingAttachments.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-neutral-200">
            {isAr ? 'المذكرات والمرفقات (PDF)' : 'Attachments & PDFs'}
          </h3>
        </div>
        <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full font-mono">
          {totalCount} {isAr ? 'ملف' : 'files'}
        </span>
      </div>

      {/* Upload Box */}
      <div className="bg-[#121814] p-4 rounded-xl border border-neutral-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* File Picker */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
              <Upload className="w-3 h-3 text-blue-400" />
              {isAr ? 'ملف PDF *' : 'PDF File *'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              disabled={disabled || isDirectUploading}
              className="w-full text-xs text-neutral-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-950 file:text-blue-300 hover:file:bg-blue-900 cursor-pointer bg-[#0c100d] border border-neutral-700/80 rounded-lg p-1"
            />
          </div>

          {/* Title AR */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400">
              {isAr ? 'اسم المذكرة بالعربي *' : 'Arabic Title *'}
            </label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={isAr ? 'مذكرة الشرح والواجب' : 'Lecture notes PDF'}
              disabled={disabled || isDirectUploading}
              className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Title EN & Download Allowed */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400">
              {isAr ? 'الاسم بالإنجليزي' : 'English Title'}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Lecture Notes"
              disabled={disabled || isDirectUploading}
              dir="ltr"
              className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-800/60">
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={downloadAllowed}
              onChange={(e) => setDownloadAllowed(e.target.checked)}
              disabled={disabled || isDirectUploading}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
            />
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'السماح للطلاب بتحميل الملف كـ PDF' : 'Allow students to download file'}</span>
          </label>

          <button
            type="button"
            onClick={handleAddAttachment}
            disabled={disabled || isDirectUploading || !selectedFile || !titleAr.trim()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors shadow-xs"
          >
            {isDirectUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة المرفق' : 'Add Attachment'}</span>
              </>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-950/40 p-2 rounded-lg border border-red-900/50">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {totalCount > 0 ? (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {/* Existing Attachments */}
          {existingAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#101612] border border-neutral-800 text-xs"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 font-mono font-bold text-[10px]">
                  PDF
                </div>
                <div className="truncate">
                  <p className="font-semibold text-neutral-200 truncate">{att.title_ar}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {formatFileSize(att.file_size_bytes)} •{' '}
                    {att.download_allowed ? (isAr ? 'تحميل مسموح' : 'Downloadable') : (isAr ? 'عرض فقط' : 'View only')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveExisting(att.id)}
                disabled={disabled}
                className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
                title={isAr ? 'حذف المرفق' : 'Delete attachment'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Pending Attachments */}
          {pendingAttachments.map((att, idx) => (
            <div
              key={`pending-${idx}`}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#141b16] border border-emerald-800/40 text-xs"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-bold text-[10px]">
                  PDF
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-200 truncate">{att.title_ar}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      {isAr ? 'جاهز للحفظ' : 'Pending Save'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {formatFileSize(att.file.size)} •{' '}
                    {att.download_allowed ? (isAr ? 'تحميل مسموح' : 'Downloadable') : (isAr ? 'عرض فقط' : 'View only')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemovePending(idx)}
                disabled={disabled}
                className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
                title={isAr ? 'إلغاء المرفق' : 'Remove draft'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-500 italic text-center py-3 bg-[#0d120f] rounded-xl border border-dashed border-neutral-800">
          {isAr ? 'لا توجد مذكرات أو ملفات PDF مرفقة بعد.' : 'No PDF attachments added yet.'}
        </p>
      )}
    </div>
  );
}
