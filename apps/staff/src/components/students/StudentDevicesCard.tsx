'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Loader2,
  HardDrive,
  Info,
} from 'lucide-react';
import { StudentDevice } from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createStudentsApi } from '@omar-makawy/shared';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';

const staffStudentsApi = createStudentsApi(staffApiClient);

interface StudentDevicesCardProps {
  studentId: string;
  academicYearId?: string;
  canManage?: boolean;
  isArabic?: boolean;
}

export function StudentDevicesCard({
  studentId,
  academicYearId,
  canManage = true,
  isArabic = true,
}: StudentDevicesCardProps) {
  const [devices, setDevices] = useState<StudentDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [deviceToUnbind, setDeviceToUnbind] = useState<StudentDevice | null>(null);
  const [unbinding, setUnbinding] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffStudentsApi.getStudentDevices(studentId, academicYearId);
      setDevices(data);
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic ? 'فشل تحميل قائمة أجهزة الطالب' : 'Failed to load student devices')
      );
    } finally {
      setLoading(false);
    }
  }, [studentId, academicYearId, isArabic]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleUnbind = async () => {
    if (!deviceToUnbind) return;
    setUnbinding(true);
    try {
      await staffStudentsApi.unbindStudentDevice(
        studentId,
        deviceToUnbind.id,
        academicYearId
      );
      setDeviceToUnbind(null);
      setActionSuccess(
        isArabic
          ? 'تم إلغاء ربط الجهاز بنجاح وإنهاء جلسته النشطة.'
          : 'Device successfully unbound and session terminated.'
      );
      setTimeout(() => setActionSuccess(null), 3500);
      fetchDevices();
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic ? 'فشل إلغاء ربط الجهاز' : 'Failed to unbind device')
      );
    } finally {
      setUnbinding(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const norm = (deviceType || '').toLowerCase();
    if (norm.includes('mobile') || norm.includes('phone') || norm.includes('android') || norm.includes('ios')) {
      return <Smartphone className="h-5 w-5 text-brand-600 dark:text-brand-400" />;
    }
    if (norm.includes('tablet') || norm.includes('ipad')) {
      return <Tablet className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    return <Laptop className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
  };

  const activeCount = devices.filter((d) => d.status === 'ACTIVE' || d.is_active).length;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isArabic ? 'أجهزة الطالب المسجلة' : 'Registered Student Devices'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isArabic
                ? 'إدارة الأجهزة والجلسات النشطة (بحد أقصى جهازين لكل طالب)'
                : 'Device and active session management (2-device limit per student)'}
            </p>
          </div>
        </div>

        {/* 2-Device Limit Indicator & Refresh */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              activeCount >= 2
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>
              {isArabic
                ? `${activeCount} من 2 أجهزة مسجلة`
                : `${activeCount} of 2 Devices Registered`}
            </span>
          </span>

          <button
            type="button"
            onClick={fetchDevices}
            disabled={loading}
            title={isArabic ? 'إعادة التحميل' : 'Refresh'}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Body States */}
      {loading ? (
        <LoadingState message={isArabic ? 'جاري جلب أجهزة الطالب...' : 'Loading devices...'} />
      ) : error ? (
        <ErrorState
          title={isArabic ? 'خطأ في جلب الأجهزة' : 'Failed to Load Devices'}
          message={error}
          onRetry={fetchDevices}
        />
      ) : devices.length === 0 ? (
        <EmptyState
          title={isArabic ? 'لا توجد أجهزة مسجلة' : 'No Devices Registered'}
          description={
            isArabic
              ? 'لم يقم الطالب بتسجيل الدخول من أي جهاز بعد.'
              : 'The student has not logged in from any device yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device, idx) => {
            const isActive = device.status === 'ACTIVE' || device.is_active;

            return (
              <div
                key={device.id || idx}
                className="relative flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850/50 p-4 space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                {/* Top Row: Device icon, name/model, status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-xs">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                        {device.model_name || device.os_info || (isArabic ? 'جهاز غير مسمى' : 'Unnamed Device')}
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-mono line-clamp-1">
                        {device.device_type} • {device.os_info || 'Unknown OS'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {isActive ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'معطل' : 'Inactive')}
                  </span>
                </div>

                {/* Details Meta */}
                <div className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200/60 dark:border-neutral-750">
                  {device.browser_info && (
                    <div className="flex items-center justify-between">
                      <span>{isArabic ? 'المتصفح:' : 'Browser:'}</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {device.browser_info}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>{isArabic ? 'تاريخ التسجيل:' : 'Registered:'}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {new Date(device.registered_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isArabic ? 'آخر نشاط:' : 'Last Active:'}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {new Date(device.last_active_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {device.device_uuid && (
                    <div className="flex items-center justify-between pt-1">
                      <span>{isArabic ? 'معرف الجهاز:' : 'UUID:'}</span>
                      <span className="font-mono text-[10px] text-neutral-400 truncate max-w-[150px]">
                        {device.device_uuid}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action: Unbind Device */}
                {canManage && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setDeviceToUnbind(device)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{isArabic ? 'إزالة الجهاز وإنهاء الجلسة' : 'Unbind Device & End Session'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unbind Device Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deviceToUnbind)}
        title={isArabic ? 'تأكيد إزالة جهاز الطالب' : 'Confirm Device Unbinding'}
        message={
          isArabic
            ? `هل أنت متأكد من إزالة هذا الجهاز (${deviceToUnbind?.model_name || deviceToUnbind?.device_type || 'الجهاز المختار'})؟ سيؤدي هذا الإجراء فوراً إلى تسجيل خروج الطالب من هذا الجهاز وتحرير خانة تسجيل جهاز جديد ضمن الحد المسموح (جهازين).`
            : `Are you sure you want to unbind this device? This will immediately terminate the student's active session on this device and free up a device slot.`
        }
        confirmText={isArabic ? 'نعم، إزالة الجهاز' : 'Yes, Unbind Device'}
        cancelText={isArabic ? 'إلغاء' : 'Cancel'}
        isDestructive={true}
        isLoading={unbinding}
        onConfirm={handleUnbind}
        onClose={() => setDeviceToUnbind(null)}
      />
    </div>
  );
}
