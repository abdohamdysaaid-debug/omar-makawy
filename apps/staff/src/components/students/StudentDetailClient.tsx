'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  Building,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  HardDrive,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  StudentDetail,
  SystemPermissions,
  UpdateStudentStatusResponse,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createStudentsApi } from '@omar-makawy/shared';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState } from '@/components/ui/FeedbackStates';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { ChangeStatusModal } from '@/components/students/ChangeStatusModal';
import { ResetPasswordModal } from '@/components/students/ResetPasswordModal';
import { StudentDevicesCard } from '@/components/students/StudentDevicesCard';

const staffStudentsApi = createStudentsApi(staffApiClient);

export function StudentDetailClient({ studentId: propStudentId }: { studentId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const studentId =
    propStudentId && propStudentId !== 'detail' && propStudentId !== '[id]'
      ? propStudentId
      : queryId || '';

  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();

  const canManage = isTeacher || hasPermission(SystemPermissions.STUDENTS_MANAGE);

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);
  const [isResetPwdOpen, setIsResetPwdOpen] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const fetchStudent = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      setError(isAr ? 'معرف الطالب غير محدد في الرابط' : 'Student ID is missing from URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await staffStudentsApi.getStudentById(studentId);
      setStudent(data);
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل تحميل بيانات الطالب من الخادم' : 'Failed to load student details')
      );
    } finally {
      setLoading(false);
    }
  }, [studentId, isAr]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleEditSuccess = (updated: StudentDetail) => {
    setStudent(updated);
    setActionSuccessMessage(
      isAr ? 'تم حفظ تعديلات بيانات الطالب بنجاح.' : 'Student updated successfully.'
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleStatusSuccess = (res: UpdateStudentStatusResponse) => {
    if (student) {
      setStudent({
        ...student,
        status: res.status,
        is_active: res.is_active,
      });
    }
    setActionSuccessMessage(
      isAr
        ? `تم تحديث حالة الحساب إلى "${res.status}" بنجاح.`
        : `Student status changed to "${res.status}".`
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  if (loading) {
    return <LoadingState message={isAr ? 'جاري تحميل بيانات الطالب...' : 'Loading student profile...'} />;
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <Link
          href="/staff/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          <span>{isAr ? 'العودة إلى قائمة الطلاب' : 'Back to Students'}</span>
        </Link>
        <ErrorState
          title={isAr ? 'تعذر جلب ملف الطالب' : 'Student Not Found'}
          message={error || (isAr ? 'الطالب المطلوب غير موجود.' : 'Requested student not found.')}
          onRetry={fetchStudent}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: isAr ? 'الطلاب' : 'Students', href: '/staff/students' },
              { label: student.full_name },
            ]}
          />
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {student.full_name}
            </h1>
            <StatusBadge status={student.status} isArabic={isAr} />
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/staff/students"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-[#141815] hover:bg-neutral-800 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <BackIcon className="h-4 w-4" />
            <span>{isAr ? 'العودة للطلاب' : 'Back'}</span>
          </Link>

          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>{isAr ? 'تعديل البيانات' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStatusOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#171d19] hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-amber-400 transition-colors cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{isAr ? 'تغيير الحالة' : 'Change Status'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetPwdOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>{isAr ? 'استعادة كلمة السر' : 'Reset Password'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Student Overview Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic & Academic Information Card (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-800/80 bg-[#101412] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'البيانات الأساسية والأكاديمية' : 'Basic & Academic Details'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr ? 'المعلومات الشخصية وبيانات الدراسة للطالب' : 'Personal & academic registration info'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'الاسم الكامل:' : 'Full Name:'}</span>
              <span className="font-bold text-white text-sm">
                {student.full_name}
              </span>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'رقم الهاتف المسجل:' : 'Phone Number:'}</span>
              <span className="font-mono font-bold text-white text-sm">
                {student.phone}
              </span>
            </div>

            {/* WhatsApp */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'رقم الواتساب:' : 'WhatsApp:'}</span>
              {student.whatsapp_phone || student.phone ? (
                <a
                  href={`https://wa.me/${(student.whatsapp_phone || student.phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  <span>{student.whatsapp_phone || student.phone}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-sans">
                    {isAr ? 'محادثة' : 'Chat'}
                  </span>
                </a>
              ) : (
                <span className="text-neutral-500">{isAr ? 'غير مسجل' : '—'}</span>
              )}
            </div>

            {/* Parent Phone */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'هاتف ولي الأمر:' : 'Parent Phone:'}</span>
              <span className="font-mono font-semibold text-neutral-200">
                {student.parent_phone || (isAr ? 'غير مسجل' : '—')}
              </span>
            </div>

            {/* Academic Year */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'المرحلة الدراسية:' : 'Academic Year:'}</span>
              <span className="font-bold text-emerald-400">
                {isAr
                  ? student.academic_year_name_ar || 'غير محدد'
                  : student.academic_year_name_en || student.academic_year_name_ar || 'Not Assigned'}
              </span>
            </div>

            {/* Section (if applicable) */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'الشعبة التخصصية:' : 'Section:'}</span>
              <span className="font-semibold text-neutral-200">
                {student.section === 'SCIENCE' ? (isAr ? 'علمي علوم' : 'Science') :
                 student.section === 'MATH' ? (isAr ? 'علمي رياضة' : 'Math') :
                 student.section === 'LITERARY' ? (isAr ? 'أدبي' : 'Literary') :
                 student.section || (isAr ? 'غير محدد / عام' : 'General / None')}
              </span>
            </div>

            {/* Education Type */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'نوع التعليم:' : 'Education Type:'}</span>
              <span className="font-semibold text-neutral-200">
                {student.education_type === 'AL_AZHAR' ? (isAr ? 'أزهر شريف' : 'Al-Azhar') : (isAr ? 'تعليم عام' : 'General Education')}
              </span>
            </div>

            {/* Study Type */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'نوع الدراسة:' : 'Study Type:'}</span>
              <span className="font-semibold text-neutral-200">
                {student.study_type === 'LANGUAGES' ? (isAr ? 'لغات / تجريبي' : 'Languages') : (isAr ? 'عربي' : 'Arabic')}
              </span>
            </div>

            {/* Governorate */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'المحافظة:' : 'Governorate:'}</span>
              <span className="font-semibold text-neutral-200">
                {isAr ? student.governorate_name_ar || '—' : student.governorate_name_en || student.governorate_name_ar || '—'}
              </span>
            </div>

            {/* School Name */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'المدرسة:' : 'School:'}</span>
              <span className="font-semibold text-neutral-200">
                {student.school_name || (isAr ? 'غير محدد' : '—')}
              </span>
            </div>

            {/* Gender */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'النوع:' : 'Gender:'}</span>
              <span className="font-semibold text-neutral-200">
                {student.gender === 'MALE'
                  ? isAr ? 'ذكر' : 'Male'
                  : student.gender === 'FEMALE'
                  ? isAr ? 'أنثى' : 'Female'
                  : '—'}
              </span>
            </div>

            {/* Email */}
            <div className="p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
              <span className="font-semibold text-neutral-200 font-mono">
                {student.email || (isAr ? 'غير مسجل' : 'Not Provided')}
              </span>
            </div>

            {/* Address */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#171d19] border border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">{isAr ? 'العنوان بالتفصيل:' : 'Full Address:'}</span>
              <span className="font-medium text-white">
                {student.address || (isAr ? 'غير مسجل' : '—')}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Account State Card (1 col) */}
        <div className="rounded-3xl border border-neutral-800/80 bg-[#101412] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'الأمان وحالة الحساب' : 'Account & Security'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr ? 'حالة التفعيل والنشاط' : 'Verification & activity log'}
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Status */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171d19] border border-neutral-800">
              <span className="text-neutral-400">{isAr ? 'حالة الحساب:' : 'Status:'}</span>
              <StatusBadge status={student.status} isArabic={isAr} />
            </div>

            {/* Phone Verified */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171d19] border border-neutral-800">
              <span className="text-neutral-400">{isAr ? 'توثيق الهاتف:' : 'Phone Verified:'}</span>
              <span className={`font-bold ${student.is_phone_verified ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {student.is_phone_verified ? (isAr ? 'مؤكد ✓' : 'Verified ✓') : (isAr ? 'غير مؤكد' : 'Unverified')}
              </span>
            </div>

            {/* Registration Date */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171d19] border border-neutral-800">
              <span className="text-neutral-400">{isAr ? 'تاريخ التسجيل:' : 'Registered At:'}</span>
              <span className="font-semibold text-neutral-200 font-mono">
                {new Date(student.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Last Login */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171d19] border border-neutral-800">
              <span className="text-neutral-400">{isAr ? 'آخر تسجيل دخول:' : 'Last Login:'}</span>
              <span className="font-semibold text-neutral-200 font-mono">
                {student.last_login_at
                  ? new Date(student.last_login_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : (isAr ? 'لم يسجل بعد' : 'Never')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Devices & Active Sessions Section */}
      <StudentDevicesCard
        studentId={student.id}
        academicYearId={student.academic_year_id || undefined}
        canManage={canManage}
        isArabic={isAr}
      />

      {/* Edit Student Modal */}
      {isEditOpen && (
        <EditStudentModal
          isOpen={isEditOpen}
          student={student}
          onSuccess={handleEditSuccess}
          onClose={() => setIsEditOpen(false)}
          isArabic={isAr}
        />
      )}

      {/* Change Status Modal */}
      {isStatusOpen && (
        <ChangeStatusModal
          isOpen={isStatusOpen}
          student={student}
          onSuccess={handleStatusSuccess}
          onClose={() => setIsStatusOpen(false)}
          isArabic={isAr}
        />
      )}

      {/* Password Reset Modal */}
      {isResetPwdOpen && (
        <ResetPasswordModal
          isOpen={isResetPwdOpen}
          student={student}
          onClose={() => setIsResetPwdOpen(false)}
          isArabic={isAr}
        />
      )}
    </div>
  );
}
