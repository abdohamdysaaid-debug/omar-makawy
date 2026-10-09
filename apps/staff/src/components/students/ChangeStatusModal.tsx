'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  StudentDetail,
  StudentAccountStatus,
  UpdateStudentStatusResponse,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createStudentsApi } from '@omar-makawy/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';

const staffStudentsApi = createStudentsApi(staffApiClient);

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetail | null;
  onSuccess: (updated: UpdateStudentStatusResponse) => void;
  isArabic?: boolean;
}

export function ChangeStatusModal({
  isOpen,
  onClose,
  student,
  onSuccess,
  isArabic = true,
}: ChangeStatusModalProps) {
  const [status, setStatus] = useState<StudentAccountStatus>(
    (student?.status as StudentAccountStatus) || 'ACTIVE'
  );
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (student) {
      setStatus(student.status);
      setReason('');
      setError(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await staffStudentsApi.updateStudentStatus(
        student.id,
        {
          status,
          reason: reason.trim() || undefined,
        },
        student.academic_year_id || undefined
      );
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic ? 'فشل تعديل حالة الحساب' : 'Failed to update account status')
      );
    } finally {
      setLoading(false);
    }
  };

  const isDeactivating = status !== 'ACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'تغيير حالة حساب الطالب' : 'Change Student Status'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {student.full_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Status Indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">
              {isArabic ? 'الحالة الحالية:' : 'Current Status:'}
            </span>
            <StatusBadge status={student.status} isArabic={isArabic} />
          </div>

          {/* New Status Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {isArabic ? 'الحالة الجديدة للحساب *' : 'New Account Status *'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StudentAccountStatus)}
              className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              <option value="ACTIVE">{isArabic ? 'نشط ومفعّل (ACTIVE)' : 'Active'}</option>
              <option value="PENDING_APPROVAL">{isArabic ? 'بانتظار المراجعة (PENDING_APPROVAL)' : 'Pending Approval'}</option>
              <option value="INACTIVE">{isArabic ? 'غير نشط (INACTIVE)' : 'Inactive'}</option>
              <option value="SUSPENDED">{isArabic ? 'معلق مؤقتاً (SUSPENDED)' : 'Suspended'}</option>
              <option value="BLOCKED">{isArabic ? 'محظور نهائياً (BLOCKED)' : 'Blocked'}</option>
            </select>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {isArabic ? 'سبب الإجراء (اختياري للتدقيق الأمني)' : 'Reason / Note (Optional)'}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isArabic
                  ? 'أدخل سبب تغيير الحالة للتوثيق...'
                  : 'Enter reason for status change...'
              }
              className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          {/* Deactivation Warning */}
          {isDeactivating && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-medium">
              <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span className="leading-relaxed text-[11px]">
                {isArabic
                  ? 'تنبيه أمني: تغيير حالة الطالب بعيداً عن "نشط" سيؤدي فوراً إلى إنهاء جميع جلسات الطالب وتسجيل خروجه من جميع الأجهزة.'
                  : 'Security Notice: Changing status away from Active will immediately revoke all active sessions and log the student out from all devices.'}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isArabic ? 'حفظ الحالة' : 'Save Status'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
