'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  X,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { StudentDetail, PasswordResetLinkResponse } from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createStudentsApi } from '@omar-makawy/shared';

const staffStudentsApi = createStudentsApi(staffApiClient);

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetail | null;
  isArabic?: boolean;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  student,
  isArabic = true,
}: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PasswordResetLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const handleGenerateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffStudentsApi.generatePasswordResetLink(
        student.id,
        student.academic_year_id || undefined
      );
      setResult(response);
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic
            ? 'فشل إنشاء رابط إعادة تعيين كلمة السر'
            : 'Failed to generate password reset link')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!result?.reset_url) return;
    try {
      await navigator.clipboard.writeText(result.reset_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'إعادة تعيين كلمة السر للطالب' : 'Reset Student Password'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {student.full_name} ({student.phone})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-200">
                  <ShieldCheck className="h-4 w-4 text-brand-600" />
                  <span>
                    {isArabic
                      ? 'سياسة الأمان والخصوصية'
                      : 'Security & Privacy Policy'}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {isArabic
                    ? 'سيتم توليد رابط آمن لمرة واحدة فقط (Single-use Token). يتيح للطالب إدخال كلمة سر جديدة وتأكيدها. تنتهي صلاحية الرابط تلقائياً بعد 15 دقيقة.'
                    : 'A secure single-use link will be generated. The student can open it to set a new password. The link expires automatically after 15 minutes.'}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-medium">
                <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {isArabic
                    ? 'بمجرد نجاح الطالب في تغيير كلمة السر، سيتم إنهاء جميع الجلسات القديمة تلقائياً.'
                    : 'Once the student changes password, all active sessions are revoked immediately.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>
                    {isArabic
                      ? 'تم توليد رابط إعادة التعيين بنجاح!'
                      : 'Password Reset Link Generated Successfully!'}
                  </span>
                </div>
                <p className="text-emerald-700/90 dark:text-emerald-400 text-[11px]">
                  {isArabic
                    ? 'انسخ الرابط وأرسله للطالب. الرابط صالح لمدة 15 دقيقة فقط ولمرة واحدة.'
                    : 'Copy the link and send it to the student. It is valid for 15 minutes only.'}
                </p>
              </div>

              {/* Reset URL Display Box */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {isArabic ? 'رابط إعادة التعيين الآمن:' : 'Secure Reset URL:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={result.reset_url}
                    className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-mono text-neutral-900 dark:text-white select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>{isArabic ? 'تم النسخ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>{isArabic ? 'نسخ الرابط' : 'Copy Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>

          {!result && (
            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isArabic ? 'جاري التوليد...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>{isArabic ? 'توليد الرابط الآن' : 'Generate Link Now'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
