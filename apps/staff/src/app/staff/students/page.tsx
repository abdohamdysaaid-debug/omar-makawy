'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  School,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  defaultStudentsApi,
  StudentItem,
  StudentAccountStatus,
  StudentsListQuery,
  SystemPermissions,
  ApiError,
} from '@omar-makawy/shared';
import { StaffGuard } from '../../../components/layout/StaffGuard';
import { PermissionGate } from '../../../components/rbac/PermissionGate';
import { useAcademicYear } from '../../../context/AcademicYearContext';
import { useLanguage } from '../../../context/LanguageContext';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Breadcrumbs } from '../../../components/ui/Breadcrumbs';
import { LoadingState, ErrorState, EmptyState } from '../../../components/ui/FeedbackStates';

export default function StaffStudentsPage() {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, activeYear, isGlobalScope } = useAcademicYear();

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentAccountStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Data fetching states
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Debounce search input
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1); // Reset to first page on search
    }, 400);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Fetch students from backend API
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: StudentsListQuery = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }

      if (statusFilter) {
        query.status = statusFilter;
      }

      // Explicit tenancy scope from AcademicYearContext
      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

      const response = await defaultStudentsApi.listStudents(query, yearScope);
      setStudents(response.items || []);
      setTotalStudents(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const hasActiveFilters = Boolean(searchTerm || statusFilter);

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
                ? 'لا تمتلك صلاحية عرض بيانات الطلاب (students.read). يرجى مراجعة المسؤول.'
                : 'You lack the required permission to view student profiles (students.read).'}
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Breadcrumbs
                items={[
                  { label: isArabic ? 'الرئيسية' : 'Dashboard', href: '/staff/dashboard' },
                  { label: isArabic ? 'الطلاب' : 'Students' },
                ]}
                isRtl={isArabic}
              />
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {isArabic ? 'إدارة الطلاب' : 'Students Management'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {totalStudents} {isArabic ? 'طالب' : 'students'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchStudents()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={
                  isArabic
                    ? 'البحث بالاسم، رقم الهاتف، ولي الأمر، المدرسة...'
                    : 'Search by name, phone, parent phone, school...'
                }
                className="w-full pr-9 pl-9 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StudentAccountStatus | '');
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              >
                <option value="">{isArabic ? 'كل الحالات' : 'All Statuses'}</option>
                <option value="ACTIVE">{isArabic ? 'نشط (ACTIVE)' : 'Active'}</option>
                <option value="SUSPENDED">{isArabic ? 'معلّق (SUSPENDED)' : 'Suspended'}</option>
                <option value="BLOCKED">{isArabic ? 'محظور (BLOCKED)' : 'Blocked'}</option>
                <option value="INACTIVE">{isArabic ? 'غير نشط (INACTIVE)' : 'Inactive'}</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium underline underline-offset-2 whitespace-nowrap"
              >
                {isArabic ? 'مسح التصفية' : 'Clear Filters'}
              </button>
            )}
          </div>

          {/* Active Tenancy Scope Indicator */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{isArabic ? 'نطاق العرض الحالي:' : 'Active Scope:'}</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {isGlobalScope
                ? isArabic
                  ? 'كل الصفوف الدراسية (Global Scope)'
                  : 'All Grades (Global)'
                : isArabic
                ? activeYear?.name_ar
                : activeYear?.name_en}
            </span>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8">
              <LoadingState message={isArabic ? 'جاري تحميل قائمة الطلاب...' : 'Loading students...'} />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8">
              <ErrorState
                title={isArabic ? 'تعذر تحميل بيانات الطلاب' : 'Failed to load students'}
                message={error.message}
                onRetry={() => fetchStudents()}
              />
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8">
              <EmptyState
                title={isArabic ? 'لا يوجد طلاب مطابقين' : 'No students found'}
                description={
                  hasActiveFilters
                    ? isArabic
                      ? 'لم يتم العثور على نتائج تطابق معايير البحث الحالية.'
                      : 'No students match the selected search criteria.'
                    : isArabic
                    ? 'لا يوجد طلاب مسجلين في هذا النطاق الدراسي حالياً.'
                    : 'No students are registered in this academic scope.'
                }
              />
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/75 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">{isArabic ? 'الطالب' : 'Student'}</th>
                      <th className="py-3.5 px-4">{isArabic ? 'الهاتف' : 'Phone'}</th>
                      <th className="py-3.5 px-4">{isArabic ? 'ولي الأمر' : 'Parent Phone'}</th>
                      <th className="py-3.5 px-4">{isArabic ? 'الصف الدراسي' : 'Grade'}</th>
                      <th className="py-3.5 px-4">{isArabic ? 'المحافظة / المدرسة' : 'Gov / School'}</th>
                      <th className="py-3.5 px-4">{isArabic ? 'الحالة' : 'Status'}</th>
                      <th className="py-3.5 px-4 text-center">{isArabic ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        {/* Student Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-bold text-xs">
                              {student.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-white">
                                {student.full_name}
                              </div>
                              {student.email && (
                                <div className="text-[11px] text-neutral-400 font-mono">
                                  {student.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                          {student.phone}
                        </td>

                        {/* Parent Phone */}
                        <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                          {student.parent_phone || '—'}
                        </td>

                        {/* Grade */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                            {isArabic
                              ? student.academic_year_name_ar || student.academic_year_code || '—'
                              : student.academic_year_name_en || student.academic_year_code || '—'}
                          </span>
                        </td>

                        {/* Governorate & School */}
                        <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                          <div className="truncate max-w-[180px]">
                            {isArabic
                              ? student.governorate_name_ar || '—'
                              : student.governorate_name_en || '—'}
                          </div>
                          {student.school_name && (
                            <div className="text-[11px] text-neutral-400 truncate max-w-[180px]">
                              {student.school_name}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={student.status} isArabic={isArabic} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/staff/students/${student.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors"
                          >
                            <span>{isArabic ? 'التفاصيل' : 'Details'}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                {students.map((student) => (
                  <div key={student.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-bold text-xs">
                          {student.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-neutral-900 dark:text-white">
                            {student.full_name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                            {student.phone}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={student.status} isArabic={isArabic} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/50 p-2.5 rounded-lg">
                      <div>
                        <span className="block text-[10px] text-neutral-400">
                          {isArabic ? 'الصف الدراسي' : 'Grade'}
                        </span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {isArabic
                            ? student.academic_year_name_ar || student.academic_year_code || '—'
                            : student.academic_year_name_en || student.academic_year_code || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-neutral-400">
                          {isArabic ? 'ولي الأمر' : 'Parent'}
                        </span>
                        <span className="font-mono text-neutral-800 dark:text-neutral-200">
                          {student.parent_phone || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-neutral-400">
                        {isArabic
                          ? student.governorate_name_ar || student.school_name || '—'
                          : student.governorate_name_en || student.school_name || '—'}
                      </div>
                      <Link
                        href={`/staff/students/${student.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold"
                      >
                        <span>{isArabic ? 'عرض الملف' : 'View Profile'}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div>
                  {isArabic ? (
                    <>
                      عرض{' '}
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{' '}
                      إلى{' '}
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {Math.min(currentPage * pageSize, totalStudents)}
                      </span>{' '}
                      من إجمالي{' '}
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {totalStudents}
                      </span>{' '}
                      طالب
                    </>
                  ) : (
                    <>
                      Showing {(currentPage - 1) * pageSize + 1} to{' '}
                      {Math.min(currentPage * pageSize, totalStudents)} of {totalStudents} students
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>{isArabic ? 'السابق' : 'Previous'}</span>
                  </button>

                  <span className="px-2 font-bold text-neutral-800 dark:text-neutral-200">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{isArabic ? 'التالي' : 'Next'}</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PermissionGate>
    </StaffGuard>
  );
}
