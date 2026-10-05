'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  GraduationCap,
  KeyRound,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import {
  SupervisorItem,
  PermissionDefinition,
  defaultSupervisorsApi,
  UserRole,
} from '@omar-makawy/shared';
import { SupervisorFormModal } from '@/components/supervisors/SupervisorFormModal';
import { SupervisorPermissionsModal } from '@/components/supervisors/SupervisorPermissionsModal';
import { SupervisorAcademicYearsModal } from '@/components/supervisors/SupervisorAcademicYearsModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';

export default function StaffSupervisorsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { isTeacher } = usePermissions();
  const { availableYears } = useAcademicYearScope();

  // State
  const [supervisors, setSupervisors] = useState<SupervisorItem[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<SupervisorItem | null>(null);

  const [permsModalOpen, setPermsModalOpen] = useState(false);
  const [permsSupervisor, setPermsSupervisor] = useState<SupervisorItem | null>(null);

  const [yearsModalOpen, setYearsModalOpen] = useState(false);
  const [yearsSupervisor, setYearsSupervisor] = useState<SupervisorItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState<SupervisorItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load permissions catalog once
  useEffect(() => {
    async function loadCatalog() {
      try {
        const catalog = await defaultSupervisorsApi.getPermissionsCatalog();
        setPermissionsCatalog(catalog);
      } catch (err) {
        console.error('Failed to load permissions catalog:', err);
      }
    }
    if (isTeacher) {
      loadCatalog();
    }
  }, [isTeacher]);

  // Fetch supervisors
  const fetchSupervisors = useCallback(async () => {
    if (!isTeacher) return;
    try {
      setLoading(true);
      setError(null);

      const queryParams: any = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) {
        queryParams.search = debouncedSearch.trim();
      }

      if (statusFilter !== 'ALL') {
        queryParams.is_active = statusFilter === 'ACTIVE';
      }

      const res = await defaultSupervisorsApi.listSupervisors(queryParams);
      let list = res.data || [];

      // Filter by academic year client-side if needed
      if (gradeFilter !== 'ALL') {
        list = list.filter((s) => {
          const years = s.assigned_academic_years || s.academic_years || [];
          return years.some((y) => y.id === gradeFilter);
        });
      }

      setSupervisors(list);
      setTotalPages(res.meta?.total_pages || 1);
      setTotalCount(res.meta?.total || list.length);
    } catch (err: any) {
      console.error('Error fetching supervisors:', err);
      setError(err?.message || (isAr ? 'فشل تحميل قائمة المشرفين' : 'Failed to load supervisors list'));
    } finally {
      setLoading(false);
    }
  }, [isTeacher, page, limit, debouncedSearch, statusFilter, gradeFilter, isAr]);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  // Delete supervisor
  const handleDeleteConfirm = async () => {
    if (!supervisorToDelete) return;
    try {
      setDeleteLoading(true);
      await defaultSupervisorsApi.deleteSupervisor(supervisorToDelete.id);
      setDeleteDialogOpen(false);
      setSupervisorToDelete(null);
      fetchSupervisors();
    } catch (err: any) {
      console.error('Failed to delete supervisor:', err);
      alert(err?.response?.data?.message || err?.message || (isAr ? 'فشل حذف المشرف' : 'Failed to delete supervisor'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick toggle status
  const handleToggleStatus = async (s: SupervisorItem) => {
    try {
      const nextActive = !s.is_active;
      await defaultSupervisorsApi.updateSupervisor(s.id, {
        is_active: nextActive,
      });
      fetchSupervisors();
    } catch (err: any) {
      console.error('Toggle status error:', err);
      alert(err?.response?.data?.message || err?.message || (isAr ? 'فشل تغيير حالة المشرف' : 'Failed to change status'));
    }
  };

  // If not Teacher, show strictly enforced 403 screen
  if (!isTeacher) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              {isAr ? 'المشرفين والصلاحيات' : 'Supervisors & Permissions'}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900/50 dark:bg-red-950/30 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-red-900 dark:text-red-200">
            {isAr ? 'غير مصرح بالوصول إلى إدارة المشرفين' : 'Access Denied: Teacher Only'}
          </h3>
          <p className="text-xs text-red-700 dark:text-red-400 max-w-md mx-auto leading-relaxed">
            {isAr
              ? 'قسم إدارة المشرفين وتوزيع الصلاحيات مخصص فقط للمعلم (Teacher / Platform Owner). لا يمكن لأي مشرف الوصول لهذه الصفحة أو تعديل الصلاحيات.'
              : 'The supervisors and permissions management module is strictly restricted to the Teacher / Platform Owner.'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const activeSupervisorsCount = supervisors.filter((s) => s.is_active).length;
  const inactiveSupervisorsCount = supervisors.filter((s) => !s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            {isAr ? 'المشرفين والصلاحيات الإدارية' : 'Supervisors & Permissions'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'إدارة حسابات المشرفين، تحديد المراحل الدراسية المصرح بها، وتوزيع الصلاحيات الدقيقة'
              : 'Manage supervisor accounts, academic year scopes, and granular authorization'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSupervisor(null);
            setFormModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isAr ? 'إضافة مشرف جديد' : 'Add New Supervisor'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111612] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              {isAr ? 'إجمالي المشرفين' : 'Total Supervisors'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {totalCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111612] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {isAr ? 'المشرفين النشطين' : 'Active Supervisors'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {activeSupervisorsCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111612] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 dark:text-rose-400">
              {isAr ? 'المشرفين المعطلين' : 'Inactive Supervisors'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {inactiveSupervisorsCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111612]">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، رقم الهاتف، أو البريد الإلكتروني...' : 'Search by name, phone, or email...'}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 ps-9 pe-4 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-40 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="ACTIVE">{isAr ? 'نشط فقط' : 'Active Only'}</option>
            <option value="INACTIVE">{isAr ? 'معطل فقط' : 'Inactive Only'}</option>
          </select>

          {/* Academic Year Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">{isAr ? 'كل المراحل الدراسية' : 'All Grades'}</option>
            {availableYears.map((y) => (
              <option key={y.id} value={y.id}>
                {isAr ? y.name_ar : y.name_en}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchSupervisors}
            title={isAr ? 'تحديث' : 'Refresh'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table / Content */}
      {loading ? (
        <LoadingState message={isAr ? 'جاري تحميل قائمة المشرفين...' : 'Loading supervisors...'} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSupervisors} />
      ) : supervisors.length === 0 ? (
        <EmptyState
          title={isAr ? 'لم يتم العثور على مشرفين' : 'No Supervisors Found'}
          description={
            isAr
              ? 'لم يتم إضافة أي مشرفين يطابقون خيارات البحث الحالية.'
              : 'No supervisors match the current search or filters.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111612] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'المشرف' : 'Supervisor'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'بيانات الاتصال' : 'Contact'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'المراحل المصرح بها' : 'Academic Scope'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'الصلاحيات الممنوحة' : 'Permissions'}</th>
                  <th className="px-4 py-3.5 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {supervisors.map((s) => {
                  const years = s.assigned_academic_years || s.academic_years || [];
                  const perms = s.permissions || [];
                  const isTeacherRole = s.role === 'TEACHER';

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                    >
                      {/* Supervisor Name & Role */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-xs">
                            {s.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              <span>{s.full_name}</span>
                              {isTeacherRole && (
                                <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                                  {isAr ? 'المعلم / المالك' : 'Teacher / Owner'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ID: {s.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-mono">
                            <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
                            <span>{s.phone_number || s.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                            <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                            <span>{s.email || '—'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => !isTeacherRole && handleToggleStatus(s)}
                          disabled={isTeacherRole}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            s.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300'
                          } ${isTeacherRole ? 'cursor-default' : 'cursor-pointer'}`}
                          title={
                            isTeacherRole
                              ? ''
                              : isAr
                              ? 'اضغط لتغيير الحالة'
                              : 'Click to toggle status'
                          }
                        >
                          {s.is_active ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{isAr ? 'نشط' : 'Active'}</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                              <span>{isAr ? 'معطل' : 'Inactive'}</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Assigned Academic Years */}
                      <td className="px-4 py-3.5">
                        {isTeacherRole ? (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            {isAr ? 'وصول شامل لجميع المراحل (Global)' : 'Global All Grades'}
                          </span>
                        ) : years.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {years.map((y) => (
                              <span
                                key={y.id}
                                className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold"
                              >
                                {isAr ? y.name_ar : y.name_en}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-500 font-semibold">
                            {isAr ? 'لا توجد مراحل محددة' : 'No grades assigned'}
                          </span>
                        )}
                      </td>

                      {/* Granted Permissions */}
                      <td className="px-4 py-3.5">
                        {isTeacherRole ? (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            {isAr ? 'صلاحيات كاملة (Full Access)' : 'Full Access'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPermsSupervisor(s);
                              setPermsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                          >
                            <Shield className="h-3.5 w-3.5 text-emerald-500" />
                            <span>
                              {perms.length} {isAr ? 'صلاحيات' : 'permissions'}
                            </span>
                          </button>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Full */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSupervisor(s);
                              setFormModalOpen(true);
                            }}
                            title={isAr ? 'تعديل البيانات والصلاحيات' : 'Edit Supervisor'}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Academic Scope Modal Button */}
                          {!isTeacherRole && (
                            <button
                              type="button"
                              onClick={() => {
                                setYearsSupervisor(s);
                                setYearsModalOpen(true);
                              }}
                              title={isAr ? 'تعديل المراحل المصرح بها' : 'Edit Academic Scope'}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <GraduationCap className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {!isTeacherRole && (
                            <button
                              type="button"
                              onClick={() => {
                                setSupervisorToDelete(s);
                                setDeleteDialogOpen(true);
                              }}
                              title={isAr ? 'حذف المشرف' : 'Delete Supervisor'}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
              <span className="text-xs text-neutral-500">
                {isAr
                  ? `صفحة ${page} من ${totalPages} (${totalCount} مشرف)`
                  : `Page ${page} of ${totalPages} (${totalCount} supervisors)`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 disabled:opacity-40 transition-colors"
                >
                  {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 disabled:opacity-40 transition-colors"
                >
                  {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <SupervisorFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingSupervisor(null);
        }}
        onSuccess={fetchSupervisors}
        initialData={editingSupervisor}
        permissionsCatalog={permissionsCatalog}
        availableAcademicYears={availableYears}
      />

      <SupervisorPermissionsModal
        isOpen={permsModalOpen}
        onClose={() => {
          setPermsModalOpen(false);
          setPermsSupervisor(null);
        }}
        onSuccess={fetchSupervisors}
        supervisor={permsSupervisor}
        permissionsCatalog={permissionsCatalog}
      />

      <SupervisorAcademicYearsModal
        isOpen={yearsModalOpen}
        onClose={() => {
          setYearsModalOpen(false);
          setYearsSupervisor(null);
        }}
        onSuccess={fetchSupervisors}
        supervisor={yearsSupervisor}
        availableAcademicYears={availableYears}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSupervisorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={isAr ? 'تأكيد حذف المشرف' : 'Confirm Delete Supervisor'}
        message={
          isAr
            ? `هل أنت متأكد من حذف المشرف "${supervisorToDelete?.full_name}" نهائياً؟ سيتم إلغاء كافة الصلاحيات وإنهاء الجلسات فوراً.`
            : `Are you sure you want to permanently delete supervisor "${supervisorToDelete?.full_name}"? All sessions and permissions will be revoked.`
        }
        confirmText={isAr ? 'نعم، حذف نهائي' : 'Yes, Delete'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        isDestructive
        isLoading={deleteLoading}
      />
    </div>
  );
}
