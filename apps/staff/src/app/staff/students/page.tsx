'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  Edit2,
  ShieldAlert,
  KeyRound,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  StudentItem,
  StudentsListQuery,
  StudentDetail,
  StudentAccountStatus,
  SystemPermissions,
  UpdateStudentStatusResponse,
  formatSectionLabel,
} from '@omar-makawy/shared';
import { staffApiClient, staffAuthApi } from '@/context/StaffAuthContext';
import { createStudentsApi } from '@omar-makawy/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { ChangeStatusModal } from '@/components/students/ChangeStatusModal';
import { ResetPasswordModal } from '@/components/students/ResetPasswordModal';

const staffStudentsApi = createStudentsApi(staffApiClient);

interface GovernorateOption {
  id: string;
  name_ar: string;
  name_en: string;
}

export default function StaffStudentsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const canManage = isTeacher || hasPermission(SystemPermissions.STUDENTS_MANAGE);

  // Approval Setting State
  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [isTogglingApproval, setIsTogglingApproval] = useState<boolean>(false);
  const [approvalSettingLoaded, setApprovalSettingLoaded] = useState<boolean>(false);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [filterYearId, setFilterYearId] = useState<string>(activeAcademicYearId || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [governorateFilter, setGovernorateFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  // Data State
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateOption[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action State
  const [approvingStudentId, setApprovingStudentId] = useState<string | null>(null);

  // Modals State
  const [studentForEdit, setStudentForEdit] = useState<StudentDetail | null>(null);
  const [studentForStatus, setStudentForStatus] = useState<StudentDetail | null>(null);
  const [studentForResetPwd, setStudentForResetPwd] = useState<StudentDetail | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync active academic year change
  useEffect(() => {
    if (activeAcademicYearId) {
      setFilterYearId(activeAcademicYearId);
    } else {
      setFilterYearId('ALL');
    }
  }, [activeAcademicYearId]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Governorates list and Approval Setting
  useEffect(() => {
    async function loadMeta() {
      try {
        const govs = await staffAuthApi.getGovernorates();
        setGovernorates(govs || []);
      } catch {}

      try {
        const res = await staffStudentsApi.getApprovalSetting();
        setRequireApproval(Boolean(res?.require_approval));
        setApprovalSettingLoaded(true);
      } catch {
        setApprovalSettingLoaded(true);
      }
    }
    loadMeta();
  }, []);

  // Fetch Students from backend
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: StudentsListQuery = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        academic_year_id: filterYearId !== 'ALL' ? filterYearId : undefined,
        governorate_id: governorateFilter !== 'ALL' ? governorateFilter : undefined,
      };

      if (statusFilter !== 'ALL') {
        query.status = statusFilter as StudentAccountStatus;
      }

      const scopeHeader = filterYearId !== 'ALL' ? filterYearId : undefined;
      const res = await staffStudentsApi.listStudents(query, scopeHeader);

      setStudents(res.items || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل تحميل قائمة الطلاب من الخادم' : 'Failed to fetch students list')
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterYearId, governorateFilter, isAr, page, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle Toggle Approval Requirement
  const handleToggleApproval = async (newVal: boolean) => {
    if (isTogglingApproval) return;
    setIsTogglingApproval(true);

    try {
      await staffStudentsApi.setApprovalSetting(newVal);
      setRequireApproval(newVal);
      setActionSuccessMessage(
        newVal
          ? (isAr
              ? 'تم تفعيل نظام المراجعة: يجب مراجعة واعتماد أي طالب جديد قبل دخوله.'
              : 'Student approval enabled: New registrations require admin review.')
          : (isAr
              ? 'تم تفعيل القبول التلقائي: يتم قبول وتفعيل أي طالب جديد فور تسجيله.'
              : 'Auto approval enabled: New registrations are activated immediately.')
      );
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل تحديث إعداد مراجعة الطلاب' : 'Failed to update approval setting')
      );
    } finally {
      setIsTogglingApproval(false);
    }
  };

  // Handle 1-Click Quick Approval
  const handleQuickApprove = async (student: StudentItem) => {
    if (approvingStudentId) return;
    setApprovingStudentId(student.id);

    try {
      await staffStudentsApi.updateStudentStatus(
        student.id,
        {
          status: 'ACTIVE',
          reason: 'تمت مراجعة وقبول الحساب من إدارة المنصة',
        },
        student.academic_year_id || undefined
      );

      setActionSuccessMessage(
        isAr
          ? `تمت الموافقة على حساب الطالب "${student.full_name}" وتفعيله بنجاح.`
          : `Student "${student.full_name}" approved and activated successfully.`
      );
      setTimeout(() => setActionSuccessMessage(null), 5000);
      fetchStudents();
    } catch (err: any) {
      setError(
        err?.message ||
          (isAr ? 'فشل قبول حساب الطالب' : 'Failed to approve student account')
      );
    } finally {
      setApprovingStudentId(null);
    }
  };

  const handleEditSuccess = (updated: StudentDetail) => {
    setActionSuccessMessage(
      isAr
        ? `تم تحديث بيانات الطالب "${updated.full_name}" بنجاح.`
        : `Student "${updated.full_name}" updated successfully.`
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
    fetchStudents();
  };

  const handleStatusSuccess = (res: UpdateStudentStatusResponse) => {
    setActionSuccessMessage(
      isAr
        ? `تم تغيير حالة الحساب إلى "${res.status}" بنجاح.`
        : `Student status updated to "${res.status}".`
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
    fetchStudents();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isAr ? 'إدارة الطلاب' : 'Students Management'}
            </h1>
          </div>
          <p className="text-xs text-neutral-400 font-medium">
            {isAr
              ? `إجمالي الطلاب في هذا العرض: ${total} طالب`
              : `Total students in this view: ${total}`}
          </p>
        </div>
      </div>

      {/* Student Approval System Settings Card */}
      {canManage && (
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-[#121815] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl border transition-colors shrink-0 ${
                requireApproval
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {isAr ? 'نظام مراجعة وقبول الطلاب الجدد' : 'New Student Approval System'}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    requireApproval
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {requireApproval
                    ? isAr
                      ? 'المراجعة والاعتماد مفعّلة'
                      : 'Manual Review Required'
                    : isAr
                    ? 'القبول التلقائي الفوري مفعّل'
                    : 'Auto-Accept Active'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                {requireApproval
                  ? isAr
                    ? 'الوضع الحالي: أي طالب يسجل حسابه جديداً يدخل في حالة (بانتظار المراجعة) ولن يتمكن من الدخول إلا بعد قيامك بمراجعة بياناته والموافقة عليها.'
                    : 'Currently: New registrations enter "Pending Approval" and cannot log in until approved.'
                  : isAr
                  ? 'الوضع الحالي: أي طالب يسجل في المنصة يتم قبوله وتفعيله تلقائياً وبشكل فوري دون الحاجة للمراجعة اليدوية.'
                  : 'Currently: New students are accepted and activated immediately upon registration.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <button
              type="button"
              disabled={isTogglingApproval || !approvalSettingLoaded}
              onClick={() => handleToggleApproval(!requireApproval)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 ${
                requireApproval ? 'bg-amber-500' : 'bg-neutral-700'
              }`}
              role="switch"
              aria-checked={requireApproval}
              title={
                isAr
                  ? requireApproval
                    ? 'انقر للتبديل إلى القبول التلقائي الفوري'
                    : 'انقر لتفعيل نظام المراجعة اليدوية'
                  : 'Toggle approval requirement'
              }
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  requireApproval ? (isAr ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold min-w-[50px]">
              {isTogglingApproval ? (
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                </span>
              ) : requireApproval ? (
                <span className="text-amber-400 font-bold">{isAr ? 'مُفعّل' : 'ON'}</span>
              ) : (
                <span className="text-neutral-400 font-bold">{isAr ? 'معطّل' : 'OFF'}</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('ALL');
            setPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[#121815] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
          }`}
        >
          {isAr ? 'جميع الطلاب' : 'All Students'}
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('PENDING_APPROVAL');
            setPage(1);
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'PENDING_APPROVAL'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-950/30 text-amber-400 border border-amber-800/60 hover:bg-amber-900/40'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>{isAr ? 'بانتظار المراجعة' : 'Pending Approval'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('ACTIVE');
            setPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[#121815] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
          }`}
        >
          {isAr ? 'النشطون' : 'Active'}
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('SUSPENDED');
            setPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'SUSPENDED'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-[#121815] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
          }`}
        >
          {isAr ? 'المعلقون' : 'Suspended'}
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('BLOCKED');
            setPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'BLOCKED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-[#121815] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
          }`}
        >
          {isAr ? 'المحظورون' : 'Blocked'}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl border border-neutral-800/80 bg-[#101412] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="h-4 w-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، الهاتف، البريد، أو المدرسة...' : 'Search by name, phone, email, school...'}
              className="block w-full rounded-xl border border-neutral-800 bg-[#171d19] py-2.5 ps-10 pe-3.5 text-xs text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={filterYearId}
              onChange={(e) => {
                setFilterYearId(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-neutral-800 bg-[#171d19] py-2.5 px-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              {isTeacher && <option value="ALL">{isAr ? 'جميع المراحل' : 'All Stages'}</option>}
              {availableYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {isAr ? year.name_ar : year.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-neutral-800 bg-[#171d19] py-2.5 px-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="PENDING_APPROVAL">{isAr ? 'بانتظار المراجعة (PENDING_APPROVAL)' : 'Pending Approval'}</option>
              <option value="ACTIVE">{isAr ? 'نشط (ACTIVE)' : 'Active'}</option>
              <option value="INACTIVE">{isAr ? 'غير نشط (INACTIVE)' : 'Inactive'}</option>
              <option value="SUSPENDED">{isAr ? 'معلق (SUSPENDED)' : 'Suspended'}</option>
              <option value="BLOCKED">{isAr ? 'محظور (BLOCKED)' : 'Blocked'}</option>
            </select>
          </div>

          {/* Governorate Filter */}
          <div>
            <select
              value={governorateFilter}
              onChange={(e) => {
                setGovernorateFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-neutral-800 bg-[#171d19] py-2.5 px-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              <option value="ALL">{isAr ? 'كل المحافظات' : 'All Governorates'}</option>
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {isAr ? g.name_ar : g.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={fetchStudents}
              disabled={loading}
              title={isAr ? 'إعادة التحميل' : 'Refresh'}
              className="p-2.5 rounded-xl border border-neutral-800 bg-[#171d19] hover:bg-neutral-800 text-neutral-300 transition-colors shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Students List View */}
      {loading ? (
        <LoadingState message={isAr ? 'جاري تحميل قائمة الطلاب...' : 'Loading students...'} />
      ) : error ? (
        <ErrorState
          title={isAr ? 'خطأ في جلب بيانات الطلاب' : 'Failed to Load Students'}
          message={error}
          onRetry={fetchStudents}
        />
      ) : students.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا يوجد طلاب مطابقون' : 'No Students Found'}
          description={
            statusFilter === 'PENDING_APPROVAL'
              ? isAr
                ? 'لا يوجد أي طلاب بانتظار المراجعة والاعتماد حالياً. جميع الطلاب مفعلون ومقبولون.'
                : 'No pending student registrations currently.'
              : isAr
              ? 'لم يتم العثور على أي حسابات طلاب تطابق معايير البحث أو المرحلة المحددة.'
              : 'No student accounts match the current filter or search criteria.'
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block rounded-2xl border border-neutral-800/80 bg-[#101412] overflow-hidden shadow-xs">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#151c18] border-b border-neutral-800 text-neutral-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? 'الطالب' : 'Student'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الهاتف' : 'Phone'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الواتساب' : 'WhatsApp'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المرحلة الدراسية' : 'Academic Year'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المحافظة والمدرسة' : 'Location & School'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'تاريخ التسجيل' : 'Registered'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 font-medium text-neutral-200">
                {students.map((student) => {
                  const waNumber = (student.whatsapp_phone || student.phone || '').replace(/[^0-9]/g, '');
                  const isPending = student.status === 'PENDING_APPROVAL';

                  return (
                    <tr
                      key={student.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('button') && !target.closest('a')) {
                          router.push(`/staff/students/detail?id=${student.id}`);
                        }
                      }}
                      className={`transition-colors cursor-pointer group ${
                        isPending
                          ? 'bg-amber-950/15 hover:bg-amber-950/25'
                          : 'hover:bg-emerald-950/25'
                      }`}
                    >
                      {/* Name and Email */}
                      <td className="py-3.5 px-4">
                        <div>
                          <Link
                            href={`/staff/students/detail?id=${student.id}`}
                            className="font-bold text-white group-hover:text-emerald-400 transition-colors block"
                          >
                            {student.full_name}
                          </Link>
                          {student.email && (
                            <span className="text-[11px] text-neutral-400 block truncate max-w-xs font-mono">
                              {student.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-neutral-200 font-semibold">
                          {student.phone}
                        </div>
                        {student.parent_phone && (
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            {isAr ? `ولي الأمر: ${student.parent_phone}` : `Parent: ${student.parent_phone}`}
                          </span>
                        )}
                      </td>

                      {/* WhatsApp Phone */}
                      <td className="py-3.5 px-4">
                        {waNumber ? (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-mono text-emerald-400 hover:text-emerald-300 hover:underline font-semibold"
                            title={isAr ? 'فتح محادثة واتساب' : 'Open WhatsApp Chat'}
                          >
                            <span>{student.whatsapp_phone || student.phone}</span>
                          </a>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>

                      {/* Academic Year */}
                      <td className="py-3.5 px-4 text-neutral-200 font-semibold">
                        <div>
                          {isAr
                            ? student.academic_year_name_ar || 'غير محدد'
                            : student.academic_year_name_en || student.academic_year_name_ar || 'Not Assigned'}
                        </div>
                        {student.section && (
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            {formatSectionLabel(student.section, student.education_type, isAr)}
                          </span>
                        )}
                      </td>

                      {/* Governorate & School */}
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-200">
                          {isAr ? student.governorate_name_ar || '—' : student.governorate_name_en || student.governorate_name_ar || '—'}
                        </div>
                        {student.school_name && (
                          <span className="text-[11px] text-neutral-400 block truncate max-w-[180px]">
                            {student.school_name}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={student.status} isArabic={isAr} />
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-neutral-400 text-[11px] font-mono">
                        {new Date(student.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {/* 1-Click Approve Button for Pending Students */}
                          {canManage && isPending && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(student)}
                              disabled={approvingStudentId === student.id}
                              title={isAr ? 'قبول وتفعيل حساب الطالب فوراً' : 'Approve & Activate Now'}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                            >
                              {approvingStudentId === student.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                              <span>{isAr ? 'قبول وتفعيل' : 'Approve'}</span>
                            </button>
                          )}

                          <Link
                            href={`/staff/students/detail?id=${student.id}`}
                            title={isAr ? 'عرض الملف الكامل والمعلومات' : 'View Full Profile & Details'}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1a231e] hover:bg-emerald-700/60 border border-neutral-700/80 shadow-xs transition-all active:scale-95"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{isAr ? 'عرض الملف' : 'Profile'}</span>
                          </Link>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => setStudentForEdit(student as StudentDetail)}
                                title={isAr ? 'تعديل بيانات الطالب' : 'Edit Student'}
                                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-emerald-400 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentForStatus(student as StudentDetail)}
                                title={isAr ? 'تغيير حالة الحساب (قبول/حظر/تعليق)' : 'Change Account Status'}
                                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-amber-400 transition-colors"
                              >
                                <ShieldAlert className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentForResetPwd(student as StudentDetail)}
                                title={isAr ? 'إنشاء رابط استعادة كلمة السر' : 'Reset Password'}
                                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-amber-400 transition-colors"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards List */}
          <div className="md:hidden space-y-3">
            {students.map((student) => {
              const waNumber = (student.whatsapp_phone || student.phone || '').replace(/[^0-9]/g, '');
              const isPending = student.status === 'PENDING_APPROVAL';

              return (
                <div
                  key={student.id}
                  className={`rounded-2xl border p-4 shadow-xs space-y-3 transition-colors ${
                    isPending
                      ? 'border-amber-700/60 bg-[#16130b]'
                      : 'border-neutral-800/80 bg-[#101412]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/staff/students/detail?id=${student.id}`}
                        className="font-bold text-sm text-white line-clamp-1 hover:text-emerald-400"
                      >
                        {student.full_name}
                      </Link>
                      <span className="text-xs text-neutral-400 font-mono font-semibold block">
                        {student.phone}
                      </span>
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 font-mono font-bold block"
                        >
                          واتساب: {student.whatsapp_phone || student.phone}
                        </a>
                      )}
                    </div>
                    <StatusBadge status={student.status} isArabic={isAr} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300 pt-2 border-t border-neutral-800">
                    <div>
                      <span className="text-neutral-500 block">{isAr ? 'المرحلة:' : 'Stage:'}</span>
                      <span className="font-semibold text-neutral-200">
                        {isAr ? student.academic_year_name_ar : student.academic_year_name_en}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">{isAr ? 'المحافظة:' : 'Gov:'}</span>
                      <span className="font-semibold text-neutral-200">
                        {isAr ? student.governorate_name_ar || '—' : student.governorate_name_en || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(student.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Quick Approve Button Mobile */}
                      {canManage && isPending && (
                        <button
                          type="button"
                          onClick={() => handleQuickApprove(student)}
                          disabled={approvingStudentId === student.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {approvingStudentId === student.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserCheck className="h-3 w-3" />
                          )}
                          <span>{isAr ? 'قبول وتفعيل' : 'Approve'}</span>
                        </button>
                      )}

                      <Link
                        href={`/staff/students/detail?id=${student.id}`}
                        className="px-3 py-1.5 rounded-xl bg-[#1a231e] border border-neutral-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                      >
                        {isAr ? 'الملف' : 'Profile'}
                      </Link>

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => setStudentForEdit(student as StudentDetail)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-emerald-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentForStatus(student as StudentDetail)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-amber-400"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-800/80 bg-[#101412] text-xs text-neutral-400 font-semibold">
              <div>
                {isAr
                  ? `عرض الصفحة ${page} من إجمالي ${totalPages} صفحات`
                  : `Showing page ${page} of ${totalPages}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-800 bg-[#171d19] hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>{isAr ? 'السابق' : 'Previous'}</span>
                </button>

                <div className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white font-mono">
                  {page} / {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-800 bg-[#171d19] hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <span>{isAr ? 'التالي' : 'Next'}</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Student Modal */}
      {studentForEdit && (
        <EditStudentModal
          isOpen={Boolean(studentForEdit)}
          onClose={() => setStudentForEdit(null)}
          student={studentForEdit}
          onSuccess={handleEditSuccess}
          isArabic={isAr}
        />
      )}

      {/* Change Status Modal */}
      {studentForStatus && (
        <ChangeStatusModal
          isOpen={Boolean(studentForStatus)}
          onClose={() => setStudentForStatus(null)}
          student={studentForStatus}
          onSuccess={handleStatusSuccess}
          isArabic={isAr}
        />
      )}

      {/* Reset Password Modal */}
      {studentForResetPwd && (
        <ResetPasswordModal
          isOpen={Boolean(studentForResetPwd)}
          onClose={() => setStudentForResetPwd(null)}
          student={studentForResetPwd}
          isArabic={isAr}
        />
      )}
    </div>
  );
}
