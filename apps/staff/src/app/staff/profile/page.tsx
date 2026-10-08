'use client';

import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  KeyRound,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  Lock,
  Layers,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CANONICAL_ACADEMIC_YEARS, ALL_SYSTEM_PERMISSIONS } from '@omar-makawy/shared';

export default function StaffProfilePage() {
  const { user, role, isTeacher, isSupervisor, changePassword, logout } = useStaffAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage(isAr ? 'يرجى إدخال كلمة المرور الحالية.' : 'Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setErrorMessage(isAr ? 'يرجى إدخال كلمة المرور الجديدة.' : 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        isAr
          ? 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف.'
          : 'New password must be at least 8 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        isAr
          ? 'كلمة المرور الجديدة وتأكيدها غير متطابقين.'
          : 'New password and confirmation do not match.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await changePassword(currentPassword, newPassword);
      setSuccessMessage(
        isAr
          ? 'تم تغيير كلمة المرور بنجاح! يرجى استخدام كلمة المرور الجديدة في المرات القادمة.'
          : res.message || 'Password changed successfully.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg =
        err?.message ||
        (isAr ? 'تعذر تغيير كلمة المرور، يرجى التأكد من صحة كلمة المرور الحالية.' : 'Failed to change password.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve assigned academic years
  const assignedYearIds = (user?.assigned_academic_years || []).map((y: any) =>
    typeof y === 'string' ? y : y.id || y.code
  );

  const matchedYears = CANONICAL_ACADEMIC_YEARS.filter(
    (ay) => assignedYearIds.includes(ay.id) || assignedYearIds.includes(ay.code)
  );

  // Resolve permissions
  const userPermCodes = (user?.permissions || []).map((p: any) =>
    typeof p === 'string' ? p : p.code
  );

  const matchedPermissions = ALL_SYSTEM_PERMISSIONS.filter((p) =>
    userPermCodes.includes(p.code)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <UserIcon className="h-5 w-5" />
            </div>
            {isAr ? 'الملف الشخصي والحساب' : 'Profile & Account Settings'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'عرض بياناتك وصلاحياتك المعتمدة مع إمكانية تحديث كلمة المرور الخاصة بحسابك'
              : 'View your account credentials, granted roles, and manage your account password'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          {isAr ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111613] p-6 sm:p-8 shadow-xs space-y-6">
        {/* User Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800/80 text-center sm:text-start">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-3xl shadow-lg shadow-emerald-950/30 border-2 border-emerald-400/30">
            {user?.full_name?.charAt(0) || 'OM'}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {user?.full_name || (isAr ? 'مستخدم النظام' : 'Staff User')}
              </h2>
              {role && <RoleBadge role={role} size="md" />}
              <StatusBadge status={user?.status || 'ACTIVE'} isArabic={isAr} />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {user?.phone || '—'}
              </span>
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {user.email}
                </span>
              )}
              {user?.created_at && (
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {isAr ? 'تاريخ الإنشاء:' : 'Joined:'}{' '}
                  {new Date(user.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/60">
            <span className="text-[11px] font-bold text-neutral-400 block mb-1">
              {isAr ? 'الاسم بالكامل' : 'Full Name'}
            </span>
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              {user?.full_name || '—'}
            </span>
          </div>

          {/* Phone */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/60">
            <span className="text-[11px] font-bold text-neutral-400 block mb-1">
              {isAr ? 'رقم الهاتف المسجل' : 'Registered Phone'}
            </span>
            <span className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
              {user?.phone || '—'}
            </span>
          </div>

          {/* Email */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/60">
            <span className="text-[11px] font-bold text-neutral-400 block mb-1">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </span>
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              {user?.email || (isAr ? 'غير مسجل' : 'Not configured')}
            </span>
          </div>

          {/* 2FA Status */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 block mb-1">
                {isAr ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}
              </span>
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {user?.two_factor_enabled
                  ? isAr
                    ? 'مفعلة بحماية TOTP'
                    : 'Enabled (TOTP Protected)'
                  : isAr
                  ? 'غير مفعلة'
                  : 'Disabled'}
              </span>
            </div>
            <div
              className={`p-2 rounded-xl ${
                user?.two_factor_enabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-400'
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Academic Scope Section */}
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? 'نطاق المراحل الدراسية المصرح بها' : 'Assigned Academic Scope'}</span>
            </div>

            {isTeacher ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>
                  {isAr
                    ? 'وصول شامل وغير مقيد لجميع المراحل الدراسية والكورسات (Global Tenancy Override)'
                    : 'Global administrative access across all academic stages and courses.'}
                </span>
              </div>
            ) : matchedYears.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedYears.map((ay) => (
                  <span
                    key={ay.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {isAr ? ay.name_ar : ay.name_en}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAr ? 'لم يتم تعيين مراحل دراسية بعد.' : 'No academic stages currently assigned.'}
              </p>
            )}
          </div>
        </div>

        {/* Granted Permissions (For Supervisors) */}
        {isSupervisor && (
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-bold text-xs">
                  <Shield className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span>{isAr ? 'الصلاحيات الإدارية الممنوحة' : 'Granted Permissions'}</span>
                </div>
                <span className="text-[11px] font-bold text-neutral-500">
                  {matchedPermissions.length} {isAr ? 'صلاحية' : 'permissions'}
                </span>
              </div>

              {matchedPermissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {matchedPermissions.map((perm) => (
                    <span
                      key={perm.code}
                      title={perm.description}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {isAr ? perm.name_ar : perm.name_en}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isAr ? 'لا توجد صلاحيات مخصصة مسندة.' : 'No permissions assigned.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Password Change Form Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111613] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <KeyRound className="h-4 w-4" />
            </div>
            {isAr ? 'تغيير كلمة المرور' : 'Change Account Password'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'قم بإدخال كلمة المرور الحالية ثم كلمة المرور الجديدة مع تأكيدها لحماية حسابك'
              : 'Enter your current password and choose a strong new password (at least 8 characters)'}
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {isAr ? 'كلمة المرور الحالية' : 'Current Password'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isAr ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 end-0 px-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}{' '}
                <span className="text-rose-500">* (8 أحرف على الأقل)</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isAr ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 end-0 px-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isAr ? 'أعد إدخال كلمة المرور الجديدة' : 'Confirm new password'}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 end-0 px-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isAr ? 'جاري حفظ كلمة المرور...' : 'Updating Password...'}</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>{isAr ? 'تحديث كلمة المرور' : 'Save New Password'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
