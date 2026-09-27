'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  KeyRound,
  GraduationCap,
  X,
  Filter,
  Check,
} from 'lucide-react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  defaultSupervisorsApi,
  SupervisorItem,
  CreateSupervisorPayload,
  SystemPermissions,
} from '@omar-makawy/shared';

const AVAILABLE_PERMISSIONS = [
  { code: 'courses.read', name_ar: 'عرض الكورسات', name_en: 'View Courses', module: 'courses' },
  { code: 'courses.create', name_ar: 'إنشاء كورسات', name_en: 'Create Courses', module: 'courses' },
  { code: 'courses.update', name_ar: 'تعديل الكورسات', name_en: 'Edit Courses', module: 'courses' },
  { code: 'lectures.read', name_ar: 'عرض المحاضرات', name_en: 'View Lectures', module: 'lectures' },
  { code: 'lectures.manage', name_ar: 'إدارة المحاضرات', name_en: 'Manage Lectures', module: 'lectures' },
  { code: 'students.read', name_ar: 'عرض دليل الطلاب', name_en: 'View Students', module: 'students' },
  { code: 'students.manage', name_ar: 'إدارة الطلاب والأجهزة', name_en: 'Manage Students', module: 'students' },
  { code: 'books.read', name_ar: 'عرض متجر الكتب', name_en: 'View Books', module: 'books' },
  { code: 'books.manage', name_ar: 'إدارة مخزون الكتب', name_en: 'Manage Books', module: 'books' },
  { code: 'wallet.read', name_ar: 'عرض العمليات المالية', name_en: 'View Finance', module: 'financial' },
  { code: 'wallet.manage', name_ar: 'إدارة أكواد الشحن والخصومات', name_en: 'Manage Wallet', module: 'financial' },
  { code: 'notifications.read', name_ar: 'عرض الإشعارات', name_en: 'View Notifications', module: 'notifications' },
  { code: 'notifications.send', name_ar: 'إرسال الإشعارات', name_en: 'Send Notifications', module: 'notifications' },
];

export default function SupervisorsPage() {
  const { isTeacher, user: currentUser } = useStaffAuth();
  const { language } = useLanguage();
  const { availableYears } = useAcademicYear();
  const isAr = language === 'ar';

  const [supervisors, setSupervisors] = useState<SupervisorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TEACHER' | 'SUPERVISOR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupervisorItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Create/Edit Form Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'SUPERVISOR' | 'TEACHER'>('SUPERVISOR');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedAcademicYears, setSelectedAcademicYears] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const fetchSupervisors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await defaultSupervisorsApi.listSupervisors({
        search: search.trim() || undefined,
        is_active: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      });
      setSupervisors(res.data || []);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل قائمة المشرفين والإدارة' : 'Failed to load staff list'));
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, isAr]);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  const openCreateModal = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setSelectedRole('SUPERVISOR');
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.code));
    setSelectedAcademicYears(availableYears.map((ay: any) => ay.id));
    setIsActive(true);
    setFormError(null);
    setFormSuccess(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (sup: SupervisorItem) => {
    setSelectedSupervisor(sup);
    setFullName(sup.full_name);
    setEmail(sup.email);
    setPhoneNumber(sup.phone || sup.phone_number || '');
    setPassword('');
    setSelectedRole(sup.role === 'TEACHER' ? 'TEACHER' : 'SUPERVISOR');
    setSelectedPermissions(sup.permissions?.map((p) => p.code) || []);
    setSelectedAcademicYears(sup.academic_years?.map((ay) => ay.id) || []);
    setIsActive(sup.status === 'ACTIVE');
    setFormError(null);
    setFormSuccess(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      setFormError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (password.length < 8) {
      setFormError(isAr ? 'يجب ألا تقل كلمة المرور عن 8 خانات' : 'Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSupervisorPayload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        password: password.trim(),
        role: selectedRole,
        permissions: selectedRole === 'SUPERVISOR' ? selectedPermissions : undefined,
        academic_year_ids: selectedRole === 'SUPERVISOR' ? selectedAcademicYears : undefined,
      };

      await defaultSupervisorsApi.createSupervisor(payload);
      setFormSuccess(isAr ? 'تمت إضافة الحساب بنجاح!' : 'Account created successfully!');
      setTimeout(() => {
        setIsCreateOpen(false);
        fetchSupervisors();
      }, 700);
    } catch (err: any) {
      setFormError(err.message || (isAr ? 'فشل إنشاء الحساب' : 'Failed to create account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupervisor) return;
    setFormError(null);
    setFormSuccess(null);

    setIsSubmitting(true);
    try {
      await defaultSupervisorsApi.updateSupervisor(selectedSupervisor.id, {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        password: password.trim() ? password.trim() : undefined,
        is_active: isActive,
        role: selectedRole,
      });

      if (selectedRole === 'SUPERVISOR') {
        await defaultSupervisorsApi.assignPermissions(selectedSupervisor.id, selectedPermissions);
        await defaultSupervisorsApi.assignAcademicYears(selectedSupervisor.id, selectedAcademicYears);
      }

      setFormSuccess(isAr ? 'تم تحديث بيانات الحساب بنجاح!' : 'Account updated successfully!');
      setTimeout(() => {
        setIsEditOpen(false);
        fetchSupervisors();
      }, 700);
    } catch (err: any) {
      setFormError(err.message || (isAr ? 'فشل تحديث الحساب' : 'Failed to update account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await defaultSupervisorsApi.deleteSupervisor(deleteTarget.id);
      setDeleteTarget(null);
      fetchSupervisors();
    } catch (err: any) {
      alert(err.message || (isAr ? 'فشل حذف الحساب' : 'Failed to delete account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleAcademicYear = (id: string) => {
    setSelectedAcademicYears((prev) =>
      prev.includes(id) ? prev.filter((y) => y !== id) : [...prev, id]
    );
  };

  const filteredSupervisors = supervisors.filter((s) => {
    if (roleFilter === 'ALL') return true;
    return s.role === roleFilter;
  });

  const breadcrumbs = [
    { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/staff/dashboard' },
    { label: isAr ? 'المشرفين والإدارة' : 'Admins & Supervisors' },
  ];

  if (!isTeacher) {
    return (
      <div className="p-6">
        <ErrorState
          title={isAr ? 'غير مصرح بالوصول' : 'Access Denied'}
          message={isAr ? 'هذه الصفحة مخصصة للمشرف العام / المعلم فقط.' : 'This page is restricted to Super Admins only.'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-cairo">
      <Breadcrumbs items={breadcrumbs} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            <span>{isAr ? 'إدارة المشرفين والإدارة العامة' : 'Admins & Supervisors Management'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'إضافة وتعديل حسابات المعلمين، المديرين، والمشرفين وتحديد الصلاحيات والمراحل المصرح بها'
              : 'Add, update, and manage administrators, teachers, and academic supervisors'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-950/20 hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isAr ? 'إضافة مشرف / أدمن جديد' : 'Add Admin / Supervisor'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'البحث بالاسم، الهاتف، أو البريد الإلكتروني...' : 'Search by name, phone, or email...'}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 py-2.5 px-4 ps-10 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
          <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-neutral-400" />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 py-2.5 px-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="ALL">{isAr ? 'جميع الأدوار' : 'All Roles'}</option>
            <option value="TEACHER">{isAr ? 'معلم / إدارة عامة' : 'Teacher / Admin'}</option>
            <option value="SUPERVISOR">{isAr ? 'مشرف أكاديمي' : 'Supervisor'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 py-2.5 px-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="ACTIVE">{isAr ? 'نشط' : 'Active'}</option>
            <option value="INACTIVE">{isAr ? 'غير نشط' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Main Table / Content */}
      {isLoading ? (
        <LoadingState message={isAr ? 'جاري تحميل قائمة المشرفين...' : 'Loading supervisors...'} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSupervisors} />
      ) : filteredSupervisors.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا يوجد أعضاء مطابقين للبحث' : 'No staff members found'}
          description={isAr ? 'لم يتم العثور على أي مشرفين أو أدمن مطابقين للشروط الحالية.' : 'Try adjusting your search filters.'}
          actionLabel={isAr ? 'إضافة مشرف جديد' : 'Add Supervisor'}
          onAction={openCreateModal}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-neutral-50/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'العضو' : 'Staff Member'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'بيانات الاتصال' : 'Contact'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الدور' : 'Role'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'المراحل المصرحة' : 'Stages'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredSupervisors.map((sup) => {
                  const isCurrent = currentUser?.id === sup.id;
                  return (
                    <tr key={sup.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-bold text-sm dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex-shrink-0">
                            {sup.full_name?.charAt(0) || 'OM'}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                              {sup.full_name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                                {isAr ? '(حسابك الحالي)' : '(Your Account)'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-mono text-xs" dir="ltr">
                            <Smartphone className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{sup.phone || sup.phone_number}</span>
                          </div>
                          {sup.email && (
                            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-xs">
                              <Mail className="h-3.5 w-3.5 text-neutral-400" />
                              <span className="truncate max-w-[170px]">{sup.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <RoleBadge role={sup.role} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {sup.role === 'TEACHER' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-bold">
                            <ShieldCheck className="h-3 w-3" />
                            <span>{isAr ? 'وصول شامل (Global)' : 'Global'}</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {sup.academic_years && sup.academic_years.length > 0 ? (
                              sup.academic_years.map((ay) => (
                                <span
                                  key={ay.id}
                                  className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300"
                                >
                                  {isAr ? ay.name_ar : ay.name_en}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-400 text-[11px]">
                                {isAr ? 'غير محدد' : 'None'}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={sup.status} />
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(sup)}
                            title={isAr ? 'تعديل الصلاحيات والبيانات' : 'Edit'}
                            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(sup)}
                              title={isAr ? 'حذف الحساب' : 'Delete'}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  {isAr ? 'إضافة مشرف أو أدمن جديد' : 'Add New Admin / Supervisor'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: أ / أحمد محمود' : 'e.g. John Doe'}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'رقم الهاتف المسجل *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01012345678"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@omarmeckawy.com"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'كلمة المرور الابتدائية (8 خانات على الأقل) *' : 'Initial Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 pe-10 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {isAr ? 'نوع الحساب والصلاحيات الأساسية' : 'Account Role'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('SUPERVISOR')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-start transition-all ${
                      selectedRole === 'SUPERVISOR'
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 dark:border-brand-500 ring-2 ring-brand-600/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Shield className="h-5 w-5 text-brand-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {isAr ? 'مشرف أكاديمي' : 'Academic Supervisor'}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {isAr ? 'صلاحيات ومراحل دراسية محددة' : 'Scoped access to assigned years'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('TEACHER')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-start transition-all ${
                      selectedRole === 'TEACHER'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 ring-2 ring-emerald-600/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {isAr ? 'معلم / إدارة عامة' : 'Teacher / Super Admin'}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {isAr ? 'صلاحيات وتحكم شامل لجميع المراحل' : 'Full global control & override'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* If Supervisor, show Academic Years and Permissions */}
              {selectedRole === 'SUPERVISOR' && (
                <>
                  {/* Academic Years Checklist */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isAr ? 'المراحل الدراسية المصرح له بالإشراف عليها' : 'Assigned Academic Stages'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {availableYears.map((ay: any) => {
                        const checked = selectedAcademicYears.includes(ay.id);
                        return (
                          <button
                            type="button"
                            key={ay.id}
                            onClick={() => toggleAcademicYear(ay.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              checked
                                ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:border-brand-500 text-brand-900 dark:text-brand-200'
                                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
                            }`}
                          >
                            <span>{isAr ? ay.name_ar : ay.name_en}</span>
                            {checked && <Check className="h-3.5 w-3.5 text-brand-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isAr ? 'الصلاحيات الإدارية الممنوحة' : 'Granted Permissions'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                      {AVAILABLE_PERMISSIONS.map((p) => {
                        const checked = selectedPermissions.includes(p.code);
                        return (
                          <button
                            type="button"
                            key={p.code}
                            onClick={() => togglePermission(p.code)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-semibold text-start transition-all ${
                              checked
                                ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200'
                                : 'border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            <span>{isAr ? p.name_ar : p.name_en}</span>
                            {checked && <Check className="h-3 w-3 text-brand-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جاري الإضافة...' : 'Adding...') : isAr ? 'إضافة الحساب الآن' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  <Edit2 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  {isAr ? 'تعديل بيانات الحساب والصلاحيات' : 'Edit Staff Account'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'تغيير كلمة المرور (اتركه فارغاً للإبقاء عليها)' : 'Reset Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 pe-10 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-600/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'نوع الحساب' : 'Role'}
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e: any) => setSelectedRole(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="SUPERVISOR">{isAr ? 'مشرف أكاديمي' : 'Academic Supervisor'}</option>
                    <option value="TEACHER">{isAr ? 'معلم / إدارة عامة' : 'Teacher / Super Admin'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'حالة الحساب' : 'Account Status'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    <span>{isActive ? (isAr ? 'الحساب نشط' : 'Active') : (isAr ? 'الحساب معطل' : 'Inactive')}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </button>
                </div>
              </div>

              {selectedRole === 'SUPERVISOR' && (
                <>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isAr ? 'المراحل الدراسية المصرحة' : 'Assigned Stages'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {availableYears.map((ay: any) => {
                        const checked = selectedAcademicYears.includes(ay.id);
                        return (
                          <button
                            type="button"
                            key={ay.id}
                            onClick={() => toggleAcademicYear(ay.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              checked
                                ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200'
                                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            <span>{isAr ? ay.name_ar : ay.name_en}</span>
                            {checked && <Check className="h-3.5 w-3.5 text-brand-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isAr ? 'الصلاحيات الإدارية الممنوحة' : 'Permissions'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                      {AVAILABLE_PERMISSIONS.map((p) => {
                        const checked = selectedPermissions.includes(p.code);
                        return (
                          <button
                            type="button"
                            key={p.code}
                            onClick={() => togglePermission(p.code)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-semibold text-start transition-all ${
                              checked
                                ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200'
                                : 'border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            <span>{isAr ? p.name_ar : p.name_en}</span>
                            {checked && <Check className="h-3 w-3 text-brand-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          title={isAr ? 'حذف حساب العضو الإداري' : 'Delete Staff Account'}
          message={
            isAr
              ? `هل أنت متأكد من رغبتك في حذف حساب "${deleteTarget.full_name}"؟ سيتم إلغاء كافة صلاحياته وجلساته بشكل دائم.`
              : `Are you sure you want to delete "${deleteTarget.full_name}"? All sessions and permissions will be permanently revoked.`
          }
          confirmText={isAr ? 'نعم، حذف الحساب' : 'Delete Account'}
          cancelText={isAr ? 'إلغاء' : 'Cancel'}
          isDestructive={true}
          isLoading={isSubmitting}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
