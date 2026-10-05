'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  GraduationCap,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  SupervisorItem,
  CreateSupervisorPayload,
  UpdateSupervisorPayload,
  PermissionDefinition,
} from '@omar-makawy/shared';
import { defaultSupervisorsApi } from '@omar-makawy/shared';

interface AcademicYearOption {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
}

interface SupervisorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: SupervisorItem | null;
  permissionsCatalog: PermissionDefinition[];
  availableAcademicYears: AcademicYearOption[];
}

export function SupervisorFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  permissionsCatalog,
  availableAcademicYears,
}: SupervisorFormModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const isEditing = Boolean(initialData);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [role, setRole] = useState<'SUPERVISOR' | 'TEACHER'>('SUPERVISOR');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate data when opening
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setEmail(initialData.email || '');
      setPhoneNumber(initialData.phone_number || initialData.phone || '');
      setPassword('');
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : initialData.status === 'ACTIVE');
      setRole((initialData.role as any) || 'SUPERVISOR');

      const yearIds = (initialData.assigned_academic_years || initialData.academic_years || []).map((y) => y.id);
      setSelectedYears(yearIds);

      const permCodes = (initialData.permissions || []).map((p) => p.code);
      setSelectedPermissions(permCodes);
    } else {
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setIsActive(true);
      setRole('SUPERVISOR');
      setSelectedYears(availableAcademicYears.map((y) => y.id));
      setSelectedPermissions([]);
    }
    setError(null);
  }, [initialData, isOpen, availableAcademicYears]);

  if (!isOpen) return null;

  // Group permissions by module
  const groupedPermissions: Record<string, PermissionDefinition[]> = {};
  permissionsCatalog.forEach((p) => {
    // Filter out forbidden tenancy.global_override from normal selection
    if (p.code === 'tenancy.global_override') return;
    const mod = p.module || 'GENERAL';
    if (!groupedPermissions[mod]) {
      groupedPermissions[mod] = [];
    }
    groupedPermissions[mod].push(p);
  });

  const getModuleLabel = (mod: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      STUDENTS: { ar: 'شؤون الطلاب والبيانات', en: 'Students Management' },
      COURSES: { ar: 'الكورسات التعليمية', en: 'Courses' },
      LECTURES: { ar: 'المحاضرات والدروس', en: 'Lectures' },
      VIDEOS: { ar: 'الفيديوهات والبث', en: 'Videos & Streaming' },
      ATTACHMENTS: { ar: 'المذكرات والمرفقات', en: 'Attachments' },
      PACKAGES: { ar: 'الباقات والعروض', en: 'Packages & Bundles' },
      SUBSCRIPTIONS: { ar: 'الاشتراكات والتسجيل', en: 'Subscriptions' },
      WALLET: { ar: 'المحافظ والمالية', en: 'Wallet & Finance' },
      BOOKSTORE: { ar: 'الكتب والمطبوعات', en: 'Books & Bookstore' },
      INVENTORY: { ar: 'إدارة المخزون', en: 'Inventory' },
      ORDERS: { ar: 'طلبات الشحن والتوصيل', en: 'Orders & Deliveries' },
      NOTIFICATIONS: { ar: 'الإشعارات والتنبيهات', en: 'Notifications' },
      DEVICES: { ar: 'الأجهزة والجلسات', en: 'Devices & Sessions' },
      SUPPORT: { ar: 'خدمة العملاء والدعم', en: 'Customer Support' },
      ANALYTICS: { ar: 'الإحصائيات والتقارير', en: 'Analytics' },
      AUDIT: { ar: 'سجل العمليات والتدقيق', en: 'Audit Logs' },
      SECURITY: { ar: 'أحداث الأمان والتحذيرات', en: 'Security Events' },
      SETTINGS: { ar: 'إعدادات المنصة العامة', en: 'Platform Settings' },
    };
    return map[mod] ? (isAr ? map[mod].ar : map[mod].en) : mod;
  };

  const isSensitivePermission = (code: string) => {
    return (
      code.includes('delete') ||
      code.includes('wallet.manage') ||
      code.includes('settings.manage') ||
      code.includes('security_events.manage')
    );
  };

  const toggleAcademicYear = (id: string) => {
    setSelectedYears((prev) =>
      prev.includes(id) ? prev.filter((y) => y !== id) : [...prev, id]
    );
  };

  const toggleAllAcademicYears = () => {
    if (selectedYears.length === availableAcademicYears.length) {
      setSelectedYears([]);
    } else {
      setSelectedYears(availableAcademicYears.map((y) => y.id));
    }
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModulePermissions = (mod: string) => {
    const modPerms = groupedPermissions[mod] || [];
    const modCodes = modPerms.map((p) => p.code);
    const allSelected = modCodes.every((c) => selectedPermissions.includes(c));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((c) => !modCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modCodes])));
    }
  };

  const selectSafeDefaults = () => {
    const safeCodes = permissionsCatalog
      .filter((p) => !isSensitivePermission(p.code) && p.code !== 'tenancy.global_override')
      .map((p) => p.code);
    setSelectedPermissions(safeCodes);
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError(isAr ? 'يرجى إدخال الاسم بالكامل' : 'Please enter full name');
      return;
    }
    if (!phoneNumber.trim()) {
      setError(isAr ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }
    if (!email.trim()) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email address');
      return;
    }
    if (!isEditing && (!password || password.length < 8)) {
      setError(
        isAr
          ? 'كلمة المرور يجب أن لا تقل عن 8 أحرف عند إنشاء مشرف جديد'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    try {
      setLoading(true);

      if (isEditing && initialData) {
        // 1. Update basic info
        const updatePayload: UpdateSupervisorPayload = {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phoneNumber.trim(),
          is_active: isActive,
          role,
        };
        if (password.trim()) {
          updatePayload.password = password.trim();
        }
        await defaultSupervisorsApi.updateSupervisor(initialData.id, updatePayload);

        // 2. Update permissions
        await defaultSupervisorsApi.assignPermissions(initialData.id, selectedPermissions);

        // 3. Update academic years
        await defaultSupervisorsApi.assignAcademicYears(initialData.id, selectedYears);
      } else {
        // Create new supervisor
        const createPayload: CreateSupervisorPayload = {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phoneNumber.trim(),
          password: password.trim(),
          role,
          permissions: selectedPermissions,
          academic_year_ids: selectedYears,
        };
        await defaultSupervisorsApi.createSupervisor(createPayload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Supervisor save error:', err);
      setError(err?.response?.data?.message || err?.message || (isAr ? 'حدث خطأ أثناء حفظ بيانات المشرف' : 'Failed to save supervisor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#111612] border border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isEditing
                  ? isAr
                    ? `تعديل بيانات المشرف: ${initialData?.full_name}`
                    : `Edit Supervisor: ${initialData?.full_name}`
                  : isAr
                  ? 'إضافة مشرف جديد وتعيين الصلاحيات'
                  : 'Add New Supervisor & Assign Permissions'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'تحديد المراحل الدراسية المصرح بها والصلاحيات الدقيقة لكل مشرف'
                  : 'Assign academic year scope and granular system permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <User className="h-4 w-4" />
              <span>{isAr ? 'البيانات الشخصية وبيانات الدخول' : 'Account & Credentials'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: أ / أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                    required
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {isAr ? 'رقم الهاتف (المستخدم لتسجيل الدخول) *' : 'Phone Number (Login) *'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01012345678"
                    required
                    dir="ltr"
                    className="w-full text-start rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supervisor@omarmeckawy.com"
                    required
                    dir="ltr"
                    className="w-full text-start rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {isEditing
                    ? isAr
                      ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)'
                      : 'New Password (leave blank to keep current)'
                    : isAr
                    ? 'كلمة المرور (8 أحرف على الأقل) *'
                    : 'Password (min 8 chars) *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditing ? '••••••••' : (isAr ? 'أدخل كلمة مرور قوية' : 'Enter strong password')}
                    required={!isEditing}
                    dir="ltr"
                    className="w-full text-start rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-hidden font-mono pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Status Toggle (if editing) */}
            {isEditing && (
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    {isAr ? 'حالة حساب المشرف' : 'Account Status'}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {isAr
                      ? 'عند تعطيل الحساب يتم إنهاء كافة جلسات المشرف وتسجيل خروجه فوراً.'
                      : 'Deactivating immediately terminates all active sessions.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isActive ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Academic Years Scope Selection */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <GraduationCap className="h-4 w-4" />
                <span>{isAr ? 'نطاق المراحل الدراسية المصرح بها' : 'Academic Years Scope'}</span>
              </div>
              <button
                type="button"
                onClick={toggleAllAcademicYears}
                className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {selectedYears.length === availableAcademicYears.length
                  ? isAr
                    ? 'إلغاء تحديد الكل'
                    : 'Deselect All'
                  : isAr
                  ? 'تحديد كل المراحل'
                  : 'Select All Grades'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {availableAcademicYears.map((year) => {
                const isSelected = selectedYears.includes(year.id);
                return (
                  <button
                    key={year.id}
                    type="button"
                    onClick={() => toggleAcademicYear(year.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-start transition-all ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-600 text-white'
                          : 'border-neutral-300 dark:border-neutral-700 bg-transparent'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-xs font-bold truncate">
                      {isAr ? year.name_ar : year.name_en}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedYears.length === 0 && (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 mt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {isAr
                    ? 'تنبيه: المشرف بدون مراحل دراسية لن يتمكن من الوصول لأي بيانات طلاب أو كورسات.'
                    : 'Warning: Supervisor with no grades selected will not see students or courses.'}
                </span>
              </div>
            )}
          </div>

          {/* Granular Permissions Selection */}
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Shield className="h-4 w-4" />
                <span>
                  {isAr ? 'الصلاحيات الإدارية الدقيقة (Granular Permissions)' : 'Granular Permissions'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {selectedPermissions.length} {isAr ? 'صلاحية محددة' : 'selected'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectSafeDefaults}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  <span>{isAr ? 'الصلاحيات الآمنة المقترحة' : 'Safe Defaults'}</span>
                </button>
                <button
                  type="button"
                  onClick={clearAllPermissions}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {isAr ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>
            </div>

            {/* Permissions Accordions / Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(groupedPermissions).map(([mod, perms]) => {
                const modCodes = perms.map((p) => p.code);
                const selectedCount = modCodes.filter((c) => selectedPermissions.includes(c)).length;
                const isAllSelected = selectedCount === modCodes.length && modCodes.length > 0;

                return (
                  <div
                    key={mod}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-100/50 dark:bg-neutral-850/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {getModuleLabel(mod)}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          ({selectedCount}/{modCodes.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModulePermissions(mod)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {isAllSelected ? (isAr ? 'إلغاء' : 'Deselect') : (isAr ? 'تحديد الكل' : 'Select All')}
                      </button>
                    </div>

                    <div className="p-3 space-y-2">
                      {perms.map((p) => {
                        const isChecked = selectedPermissions.includes(p.code);
                        const isSensitive = isSensitivePermission(p.code);

                        return (
                          <label
                            key={p.code}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-neutral-900 dark:text-white'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.code)}
                              className="mt-0.5 rounded-sm border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold">
                                  {isAr ? p.name_ar : p.name_en}
                                </span>
                                {isSensitive && (
                                  <span className="px-1.5 py-0.2 rounded-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold">
                                    {isAr ? 'صلاحية حساسة' : 'Sensitive'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                                {p.description || p.code}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isEditing
                ? isAr
                  ? 'حفظ التعديلات'
                  : 'Save Changes'
                : isAr
                ? 'إنشاء المشرف وتفعيل الصلاحيات'
                : 'Create Supervisor'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
