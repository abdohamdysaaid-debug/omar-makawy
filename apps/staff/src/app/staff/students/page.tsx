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

  // Load Governorates list for filter dropdown
  useEffect(() => {
    async function loadMeta() {
      try {
        const govs = await staffAuthApi.getGovernorates();
        setGovernorates(govs || []);
      } catch {}
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
              ? `إجمالي الطلاب المسجلين: ${total} طالب`
              : `Total registered students: ${total}`}
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

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
            isAr
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
                  return (
                    <tr
                      key={student.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('button') && !target.closest('a')) {
                          router.push(`/staff/students/detail?id=${student.id}`);
                        }
                      }}
                      className="hover:bg-emerald-950/25 transition-colors cursor-pointer group"
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
                            {student.section === 'SCIENCE' ? (isAr ? 'علمي علوم' : 'Science') :
                             student.section === 'MATH' ? (isAr ? 'علمي رياضة' : 'Math') :
                             student.section === 'LITERARY' ? (isAr ? 'أدبي' : 'Literary') : student.section}
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
                          <Link
                            href={`/staff/students/detail?id=${student.id}`}
                            title={isAr ? 'عرض الملف الكامل والمعلومات' : 'View Full Profile & Details'}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-all active:scale-95"
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
                                title={isAr ? 'تغيير حالة الحساب' : 'Change Account Status'}
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
              return (
                <div
                  key={student.id}
                  className="rounded-2xl border border-neutral-800/80 bg-[#101412] p-4 shadow-xs space-y-3"
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

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(student.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/staff/students/detail?id=${student.id}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors"
                    >
                      {isAr ? 'عرض الملف' : 'Profile'}
                    </Link>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setStudentForEdit(student as StudentDetail)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-emerald-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
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
                  : `Page ${page} of ${totalPages}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-800 bg-[#171d19] text-xs font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>{isAr ? 'السابق' : 'Previous'}</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-neutral-600">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                            p === page
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-800 bg-[#171d19] text-xs font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <span>{isAr ? 'التالي' : 'Next'}</span>
                  <ChevronLeft className="h-4 w-4" />
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
          student={studentForEdit}
          onSuccess={handleEditSuccess}
          onClose={() => setStudentForEdit(null)}
          isArabic={isAr}
        />
      )}

      {/* Change Status Modal */}
      {studentForStatus && (
        <ChangeStatusModal
          isOpen={Boolean(studentForStatus)}
          student={studentForStatus}
          onSuccess={handleStatusSuccess}
          onClose={() => setStudentForStatus(null)}
          isArabic={isAr}
        />
      )}

      {/* Password Reset Modal */}
      {studentForResetPwd && (
        <ResetPasswordModal
          isOpen={Boolean(studentForResetPwd)}
          student={studentForResetPwd}
          onClose={() => setStudentForResetPwd(null)}
          isArabic={isAr}
        />
      )}
    </div>
  );
}
