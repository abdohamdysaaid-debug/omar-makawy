'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  School,
  MapPin,
  Calendar,
  Clock,
  Smartphone,
  Shield,
  ShieldAlert,
  Edit3,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  defaultStudentsApi,
  StudentDetail,
  StudentDevice,
  StudentAccountStatus,
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
import { LoadingState, ErrorState } from '../../../../components/ui/FeedbackStates';

export function StudentDetailClient() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const { isArabic } = useLanguage();
  const { hasPermission } = usePermissions();
  const { activeAcademicYearId, isGlobalScope } = useAcademicYear();

  // Data states
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [devices, setDevices] = useState<StudentDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Status Mutation Dialog state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StudentAccountStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [isMutatingStatus, setIsMutatingStatus] = useState(false);
  const [statusMutationError, setStatusMutationError] = useState<string | null>(null);

  // Device Unbinding Dialog state
  const [deviceToUnbind, setDeviceToUnbind] = useState<StudentDevice | null>(null);
  const [isUnbindingDevice, setIsUnbindingDevice] = useState(false);
  const [unbindError, setUnbindError] = useState<string | null>(null);

  const canManageStudents = hasPermission(SystemPermissions.STUDENTS_MANAGE);
  const canReadDevices = hasPermission(SystemPermissions.DEVICES_READ);
  const canManageDevices = hasPermission(SystemPermissions.DEVICES_MANAGE);

  // Fetch student detail
  const fetchStudentData = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);

    try {
      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;
      const data = await defaultStudentsApi.getStudentById(studentId, yearScope);
      setStudent(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, activeAcademicYearId, isGlobalScope]);

  // Fetch student devices
  const fetchStudentDevices = useCallback(async () => {
    if (!studentId || !canReadDevices) return;
    setDevicesLoading(true);

    try {
      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;
      const devList = await defaultStudentsApi.getStudentDevices(studentId, yearScope);
      setDevices(devList || []);
    } catch (err: any) {
      console.error('Failed to load student devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  }, [studentId, canReadDevices, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (student && canReadDevices) {
      fetchStudentDevices();
    }
  }, [student, canReadDevices, fetchStudentDevices]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!studentId || !selectedStatus) return;
    setIsMutatingStatus(true);
    setStatusMutationError(null);

    try {
      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;
      await defaultStudentsApi.updateStudentStatus(
        studentId,
        {
          status: selectedStatus,
          reason: statusReason.trim() || undefined,
        },
        yearScope
      );

      setIsStatusDialogOpen(false);
      setStatusReason('');
      // Refetch student data to reflect authoritative backend state
      await fetchStudentData();
    } catch (err: any) {
      setStatusMutationError(err.message || 'Failed to update student status');
    } finally {
      setIsMutatingStatus(false);
    }
  };

  // Handle device unbind
  const handleUnbindDevice = async () => {
    if (!studentId || !deviceToUnbind) return;
    setIsUnbindingDevice(true);
    setUnbindError(null);

    try {
      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;
      await defaultStudentsApi.unbindStudentDevice(studentId, deviceToUnbind.id, yearScope);
      setDeviceToUnbind(null);
      // Refetch device list
      await fetchStudentDevices();
    } catch (err: any) {
      setUnbindError(err.message || 'Failed to unbind device');
    } finally {
      setIsUnbindingDevice(false);
    }
  };

  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  return (
    <StaffGuard>
      <PermissionGate
        permission={SystemPermissions.STUDENTS_READ}
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
                ? 'لا تمتلك صلاحية عرض بيانات الطلاب (students.read).'
                : 'You lack the required permission to view student profiles.'}
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: isArabic ? 'الرئيسية' : 'Dashboard', href: '/staff/dashboard' },
                { label: isArabic ? 'الطلاب' : 'Students', href: '/staff/students' },
                { label: student?.full_name || (isArabic ? 'ملف الطالب' : 'Student Details') },
              ]}
              isRtl={isArabic}
            />

            <Link
              href="/staff/students"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <BackIcon className="h-4 w-4" />
              <span>{isArabic ? 'العودة لقائمة الطلاب' : 'Back to Students'}</span>
            </Link>
          </div>

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12">
              <LoadingState message={isArabic ? 'جاري تحميل ملف الطالب...' : 'Loading student profile...'} />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8">
              <ErrorState
                title={
                  error.statusCode === 404
                    ? isArabic
                      ? 'الطالب غير موجود'
                      : 'Student Not Found'
                    : error.statusCode === 403
                    ? isArabic
                      ? 'غير مصرح بالوصول لهذا الطالب'
                      : 'Access Denied for this Student'
                    : isArabic
                    ? 'تعذر تحميل بيانات الطالب'
                    : 'Failed to load student'
                }
                message={error.message}
                onRetry={() => fetchStudentData()}
              />
            </div>
          ) : student ? (
            <div className="space-y-6">
              {/* Student Header Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-xl shadow-md">
                    {student.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {student.full_name}
                      </h1>
                      <StatusBadge status={student.status} isArabic={isArabic} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                      <span className="font-mono">{student.phone}</span>
                      {student.email && <span>• {student.email}</span>}
                      <span>
                        • {isArabic ? student.academic_year_name_ar : student.academic_year_name_en}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Mutation Trigger */}
                {canManageStudents && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus(student.status);
                      setStatusReason('');
                      setStatusMutationError(null);
                      setIsStatusDialogOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isArabic ? 'تغيير حالة الحساب' : 'Change Account Status'}</span>
                  </button>
                )}
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic & Personal Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <School className="h-4 w-4 text-neutral-500" />
                    <span>{isArabic ? 'البيانات الأكاديمية والشخصية' : 'Academic & Personal Info'}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'الصف الدراسي' : 'Academic Year'}
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {isArabic
                          ? student.academic_year_name_ar || student.academic_year_code || '—'
                          : student.academic_year_name_en || student.academic_year_code || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'المحافظة' : 'Governorate'}
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {isArabic
                          ? student.governorate_name_ar || student.governorate_code || '—'
                          : student.governorate_name_en || student.governorate_code || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'المدرسة' : 'School'}
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {student.school_name || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'النوع' : 'Gender'}
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {student.gender === 'MALE'
                          ? isArabic
                            ? 'ذكر'
                            : 'Male'
                          : student.gender === 'FEMALE'
                          ? isArabic
                            ? 'أنثى'
                            : 'Female'
                          : student.gender || '—'}
                      </span>
                    </div>

                    {student.address && (
                      <div className="col-span-2">
                        <span className="block text-neutral-400 font-medium mb-1">
                          {isArabic ? 'العنوان' : 'Address'}
                        </span>
                        <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {student.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Verification Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <Phone className="h-4 w-4 text-neutral-500" />
                    <span>{isArabic ? 'بيانات الاتصال والتحقق' : 'Contact & Verification'}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'هاتف الطالب' : 'Student Phone'}
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {student.phone}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'هاتف ولي الأمر' : 'Parent Phone'}
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {student.parent_phone || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'البريد الإلكتروني' : 'Email'}
                      </span>
                      <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate block">
                        {student.email || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'حالة التحقق' : 'Verification'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {isArabic ? 'الهاتف موثق' : 'Phone Verified'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'تاريخ التسجيل' : 'Registration Date'}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-neutral-400 font-medium mb-1">
                        {isArabic ? 'آخر نشاط / تسجيل دخول' : 'Last Login'}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {student.last_login_at
                          ? new Date(student.last_login_at).toLocaleString()
                          : isArabic
                          ? 'لم يسجل دخول بعد'
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Devices Section */}
              {canReadDevices && (
                <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-neutral-500" />
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {isArabic ? 'الأجهزة المسجلة للجلسات' : 'Registered Devices'}
                      </h3>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {devices.length} / 2 {isArabic ? 'أجهزة' : 'devices'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchStudentDevices()}
                      disabled={devicesLoading}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                      title={isArabic ? 'تحديث قائمة الأجهزة' : 'Refresh devices'}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${devicesLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {devicesLoading ? (
                    <div className="py-6">
                      <LoadingState message={isArabic ? 'جاري تحميل الأجهزة...' : 'Loading devices...'} />
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400">
                      {isArabic ? 'لا توجد أجهزة مسجلة لهذا الحساب.' : 'No devices currently registered for this student.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                                {device.model_name || device.device_type || 'Unknown Device'}
                              </span>
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  device.is_active ? 'bg-emerald-500' : 'bg-neutral-400'
                                }`}
                              />
                            </div>

                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-0.5">
                              {device.os_info && <div>OS: {device.os_info}</div>}
                              {device.browser_info && <div>Browser: {device.browser_info}</div>}
                              <div className="font-mono text-[10px] text-neutral-400 truncate max-w-[200px]">
                                UUID: {device.device_uuid}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                {isArabic ? 'مسجل في: ' : 'Registered: '}
                                {new Date(device.registered_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Unbind Button */}
                          {canManageDevices && (
                            <button
                              type="button"
                              onClick={() => {
                                setUnbindError(null);
                                setDeviceToUnbind(device);
                              }}
                              className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title={isArabic ? 'فك ربط الجهاز إدارياً' : 'Unbind device override'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Confirmation Modal */}
              <ConfirmDialog
                isOpen={isStatusDialogOpen}
                onClose={() => setIsStatusDialogOpen(false)}
                onConfirm={handleUpdateStatus}
                title={isArabic ? 'تعديل حالة حساب الطالب' : 'Update Account Status'}
                message={
                  isArabic
                    ? 'سيتم تطبيق الحالة الجديدة مباشرة على حساب الطالب وإلغاء الجلسات النشطة في حال التعليق أو الحظر.'
                    : 'The new status will apply immediately and terminate active sessions if suspended or blocked.'
                }
                confirmText={isArabic ? 'حفظ الحالة' : 'Save Status'}
                cancelText={isArabic ? 'إلغاء' : 'Cancel'}
                isDestructive={selectedStatus === 'SUSPENDED' || selectedStatus === 'BLOCKED'}
                isLoading={isMutatingStatus}
              >
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isArabic ? 'الحالة الجديدة' : 'Target Status'}
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as StudentAccountStatus)}
                      className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    >
                      <option value="ACTIVE">{isArabic ? 'نشط (ACTIVE)' : 'Active'}</option>
                      <option value="SUSPENDED">{isArabic ? 'معلّق (SUSPENDED)' : 'Suspended'}</option>
                      <option value="BLOCKED">{isArabic ? 'محظور (BLOCKED)' : 'Blocked'}</option>
                      <option value="INACTIVE">{isArabic ? 'غير نشط (INACTIVE)' : 'Inactive'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isArabic ? 'سبب التغيير (اختياري / للتدقيق)' : 'Reason (Optional / Audit)'}
                    </label>
                    <input
                      type="text"
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder={
                        isArabic
                          ? 'مثال: تعليق مؤقت لمراجعة بيانات ولي الأمر'
                          : 'e.g. Temporary suspension for verification'
                      }
                      className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>

                  {statusMutationError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{statusMutationError}</span>
                    </div>
                  )}
                </div>
              </ConfirmDialog>

              {/* Unbind Device Confirmation Dialog */}
              <ConfirmDialog
                isOpen={Boolean(deviceToUnbind)}
                onClose={() => setDeviceToUnbind(null)}
                onConfirm={handleUnbindDevice}
                title={isArabic ? 'تأكيد فك ربط الجهاز إدارياً' : 'Confirm Administrative Device Unbind'}
                message={
                  isArabic
                    ? `هل أنت متأكد من رغبتك في فك ربط الجهاز (${deviceToUnbind?.model_name || deviceToUnbind?.device_uuid})؟ سيتم إنهاء الجلسة النشطة للجهاز فوراً.`
                    : `Are you sure you want to unbind device (${deviceToUnbind?.model_name || deviceToUnbind?.device_uuid})? The associated session will terminate immediately.`
                }
                confirmText={isArabic ? 'فك الربط الآن' : 'Unbind Device'}
                cancelText={isArabic ? 'إلغاء' : 'Cancel'}
                isDestructive={true}
                isLoading={isUnbindingDevice}
              >
                {unbindError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{unbindError}</span>
                  </div>
                )}
              </ConfirmDialog>
            </div>
          ) : null}
        </div>
      </PermissionGate>
    </StaffGuard>
  );
}
