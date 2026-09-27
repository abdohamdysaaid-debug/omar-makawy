'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function StaffProfilePage() {
  const { user, role, isTeacher, changePassword, refreshProfile } = useStaffAuth();
  const { t, language, dir } = useLanguage();
  const isAr = language === 'ar';

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage(isAr ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter your current password');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage(
        isAr
          ? 'يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل'
          : 'New password must be at least 8 characters long'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        isAr
          ? 'كلمة المرور الجديدة وتأكيدها غير متطابقين'
          : 'New password and confirmation do not match'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setSuccessMessage(
        res.message || (isAr ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!')
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshProfile();
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (isAr
            ? 'فشل تغيير كلمة المرور. يرجى التأكد من صحة كلمة المرور الحالية.'
            : 'Failed to update password. Please check your current password.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/staff/dashboard' },
    { label: isAr ? 'الملف الشخصي والأمان' : 'Profile & Security' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cairo">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2.5">
            <User className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            <span>{isAr ? 'الملف الشخصي وإعدادات الأمان' : 'Profile & Security Settings'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'إدارة بيانات الحساب وتحديث كلمة المرور وإعدادات الأمان الخاصة بالمنصة'
              : 'Manage your administrator profile, update password, and configure security'}
          </p>
        </div>

        {role && <RoleBadge role={role} size="lg" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Profile Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm overflow-hidden relative">
            {/* Ambient Corner Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -end-12 w-36 h-36 rounded-full bg-brand-100/50 dark:bg-brand-900/10 blur-xl"
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Avatar Initial */}
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-600 text-white font-black text-3xl shadow-xl shadow-brand-950/20 border-4 border-white dark:border-neutral-800 mb-4 select-none">
                {user?.full_name?.charAt(0) || 'OM'}
              </div>

              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                {user?.full_name || (isAr ? 'مستر عمر مكاوي' : 'Mr. Omar Meckawy')}
              </h2>

              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                {isTeacher
                  ? isAr
                    ? 'المشرف العام / المعلم'
                    : 'Super Admin / Teacher'
                  : isAr
                  ? 'مشرف أكاديمي'
                  : 'Academic Supervisor'}
              </p>

              <div className="w-full my-5 border-t border-neutral-100 dark:border-neutral-800" />

              {/* Quick Info List */}
              <div className="w-full space-y-3.5 text-xs text-start">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
                    <Smartphone className="h-4 w-4 text-neutral-400" />
                    <span>{isAr ? 'رقم الهاتف' : 'Phone'}</span>
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono" dir="ltr">
                    {user?.phone || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <span>{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[150px]">
                    {user?.email || (isAr ? 'غير مسجل' : 'Not set')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
                    <Shield className="h-4 w-4 text-neutral-400" />
                    <span>{isAr ? 'حالة الحساب' : 'Account Status'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isAr ? 'نشط ومصرح' : 'Active'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
                    <ShieldCheck className="h-4 w-4 text-neutral-400" />
                    <span>{isAr ? 'المصادقة الثنائية' : '2FA Security'}</span>
                  </span>
                  <span className={`font-bold ${user?.two_factor_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}>
                    {user?.two_factor_enabled ? (isAr ? 'مفعلة' : 'Enabled') : (isAr ? 'غير مفعلة' : 'Disabled')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice Card */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 dark:border-brand-900/60 dark:bg-brand-950/30 p-4">
            <div className="flex items-start gap-2.5 text-xs text-brand-900 dark:text-brand-300">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-brand-600 dark:text-brand-400" />
              <p className="leading-relaxed">
                {isAr
                  ? 'يتم تشفير كافة كلمات المرور والجلسات الإدارية بأحدث خوارزميات التشفير العالمية (Argon2id) مع تسجيل كامل لجميع العمليات في سجل الأمان المركزي.'
                  : 'All administrator passwords and sessions are hashed with Argon2id and monitored via central security audit logs.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column / Password Update Form & Security Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Password Change Form Card */}
          <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {isAr
                    ? 'أدخل كلمة المرور الحالية ثم عيّن كلمة مرور جديدة قوية تتكون من 8 خانات على الأقل'
                    : 'Enter your current password and choose a strong new password'}
                </p>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/95 dark:border-emerald-900/60 dark:bg-emerald-950/40 p-4 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 animate-in fade-in"
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="font-semibold">{successMessage}</div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/95 dark:border-rose-900/50 dark:bg-rose-950/40 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-300 animate-in fade-in"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <div className="font-semibold">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1.5"
                >
                  {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative rounded-2xl">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-[#1a2522] py-3 px-4 ps-11 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-brand-600 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-brand-600/20 transition-all font-mono"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 end-0 flex items-center pe-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1.5"
                >
                  {isAr ? 'كلمة المرور الجديدة (8 خانات على الأقل)' : 'New Password (min 8 characters)'}
                </label>
                <div className="relative rounded-2xl">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-[#1a2522] py-3 px-4 ps-11 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-brand-600 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-brand-600/20 transition-all font-mono"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-neutral-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 end-0 flex items-center pe-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1.5"
                >
                  {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <div className="relative rounded-2xl">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-[#1a2522] py-3 px-4 ps-11 pe-11 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-brand-600 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-[#1f2d29] focus:outline-none focus:ring-2 focus:ring-brand-600/20 transition-all font-mono"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-neutral-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 end-0 flex items-center pe-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-950/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-600/50 disabled:opacity-60 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>
                    {isLoading
                      ? isAr
                        ? 'جاري الحفظ والتحديث...'
                        : 'Saving...'
                      : isAr
                      ? 'حفظ وتحديث كلمة المرور'
                      : 'Update Password'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full sm:w-auto rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors"
                >
                  {isAr ? 'إعادة تعيين الحقول' : 'Reset Fields'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
