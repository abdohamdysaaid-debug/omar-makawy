'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Package,
  BookOpen,
  Calendar,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { StudentSubscription, AdminGrantAccessResponse } from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createStudentsApi } from '@omar-makawy/shared';
import { GrantAccessModal } from './GrantAccessModal';

const staffStudentsApi = createStudentsApi(staffApiClient);

interface StudentSubscriptionsCardProps {
  student: any;
  canManage?: boolean;
  isArabic?: boolean;
}

export function StudentSubscriptionsCard({
  student,
  canManage = true,
  isArabic = true,
}: StudentSubscriptionsCardProps) {
  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isGrantModalOpen, setIsGrantModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!student?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await staffStudentsApi.getStudentSubscriptions(
        student.id,
        student.academic_year_id || undefined
      );
      setSubscriptions(data || []);
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic
            ? 'فشل تحميل اشتراكات وباقات الطالب'
            : 'Failed to load student subscriptions')
      );
    } finally {
      setLoading(false);
    }
  }, [student?.id, student?.academic_year_id, isArabic]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleGrantSuccess = (res: AdminGrantAccessResponse) => {
    setSuccessMessage(
      res.message ||
        (isArabic
          ? 'تم تفعيل الاشتراك للطالب بنجاح!'
          : 'Access granted successfully!')
    );
    fetchSubscriptions();
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="rounded-3xl border border-neutral-800/80 bg-[#101412] p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'الباقات والكورسات المفعلة للطالب' : 'Student Subscriptions & Courses'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isArabic
                ? 'سجل الاشتراكات الحالية والسابقة وإمكانية تفعيل باقة أو كورس مباشرة'
                : 'Active and past subscriptions with direct grant capabilities'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubscriptions}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-neutral-800 bg-[#171d19] text-neutral-400 hover:text-white hover:border-neutral-700 transition"
            title={isArabic ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {canManage && (
            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isArabic ? 'تفعيل باقة / كورس للطالب' : 'Grant Access'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
          <p className="text-xs">{isArabic ? 'جارٍ جلب الاشتراكات...' : 'Loading subscriptions...'}</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed border-neutral-800/80 bg-[#171d19]/40">
          <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 mb-3">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-neutral-300 mb-1">
            {isArabic ? 'لا توجد اشتراكات أو باقات مسجلة لهذا الطالب' : 'No subscriptions found for this student'}
          </p>
          <p className="text-[11px] text-neutral-500 max-w-sm mb-4">
            {isArabic
              ? 'يمكنك الضغط على زر "تفعيل باقة / كورس للطالب" بالأعلى لمنحه صلاحية الوصول فوراً دون الحاجة لكود تفعيل.'
              : 'You can click "Grant Access" above to activate a package or course directly.'}
          </p>
          {canManage && (
            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition"
            >
              <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isArabic ? 'تفعيل الآن' : 'Activate Now'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => {
            const isPackage = sub.item_type === 'PACKAGE';
            const expiresDate = new Date(sub.expires_at);
            const isExpired = !sub.is_active || expiresDate < new Date();

            return (
              <div
                key={sub.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !isExpired
                    ? 'border-neutral-800 bg-[#171d19]/80 hover:border-neutral-700'
                    : 'border-neutral-800/40 bg-[#121614]/50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isPackage
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40'
                      }`}
                    >
                      {isPackage ? <Package className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {sub.item_title_ar || (isPackage ? 'باقة تعليمية' : 'كورس تعليمي')}
                      </h4>
                      <span className="inline-block text-[10px] text-neutral-400 mt-0.5">
                        {isPackage
                          ? sub.package_type === 'MONTHLY'
                            ? isArabic
                              ? 'باقة شهرية'
                              : 'Monthly Package'
                            : isArabic
                            ? 'باقة ترم'
                            : 'Term Package'
                          : isArabic
                          ? 'كورس فردي'
                          : 'Course'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      !isExpired
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                    }`}
                  >
                    {!isExpired ? (isArabic ? 'نشط ومفعل' : 'Active') : isArabic ? 'منتهي' : 'Expired'}
                  </span>
                </div>

                {/* Dates Info */}
                <div className="space-y-1.5 pt-3 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-neutral-500" />
                      {isArabic ? 'بدأ في:' : 'Started:'}
                    </span>
                    <span className="font-mono text-neutral-300">
                      {new Date(sub.starts_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-neutral-500" />
                      {isArabic ? 'ينتهي في:' : 'Expires:'}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        !isExpired ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {expiresDate.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grant Access Modal */}
      {isGrantModalOpen && (
        <GrantAccessModal
          isOpen={isGrantModalOpen}
          student={student}
          onSuccess={handleGrantSuccess}
          onClose={() => setIsGrantModalOpen(false)}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
