'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Package as PackageIcon,
  Calendar,
  Layers,
  ShieldAlert,
  Plus,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Globe,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  defaultPackagesApi,
  PackageItem,
  PackagesListQuery,
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
import { PackageFormModal } from '../../../components/packages/PackageFormModal';

export default function StaffPackagesPage() {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, activeYear, availableYears, isGlobalScope } = useAcademicYear();

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('ALL');
  const [publicationFilter, setPublicationFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<'ALL' | 'FEATURED' | 'REGULAR'>('ALL');
  const [publicFilter, setPublicFilter] = useState<'ALL' | 'PUBLIC' | 'HIDDEN'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<PackageItem | null>(null);

  // Data fetching states
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [totalPackages, setTotalPackages] = useState(0);
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
      setCurrentPage(1);
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
    setAcademicYearFilter('ALL');
    setPublicationFilter('ALL');
    setFeaturedFilter('ALL');
    setPublicFilter('ALL');
    setCurrentPage(1);
  };

  // Fetch packages from backend API
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: PackagesListQuery = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }

      if (publicationFilter === 'PUBLISHED') {
        query.is_published = true;
      } else if (publicationFilter === 'DRAFT') {
        query.is_published = false;
      }

      if (featuredFilter === 'FEATURED') {
        query.is_featured = true;
      } else if (featuredFilter === 'REGULAR') {
        query.is_featured = false;
      }

      if (publicFilter === 'PUBLIC') {
        query.is_public = true;
      } else if (publicFilter === 'HIDDEN') {
        query.is_public = false;
      }

      // Academic Year Scope
      if (academicYearFilter !== 'ALL') {
        query.academic_year_id = academicYearFilter;
      } else if (!isGlobalScope && activeAcademicYearId) {
        query.academic_year_id = activeAcademicYearId;
      }

      const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

      const response = await defaultPackagesApi.listPackages(query, yearScope);
      setPackagesList(response.data || []);
      setTotalPackages(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    publicationFilter,
    featuredFilter,
    publicFilter,
    academicYearFilter,
    activeAcademicYearId,
    isGlobalScope,
  ]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenCreateModal = () => {
    setPackageToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: PackageItem) => {
    setPackageToEdit(pkg);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (pkg: PackageItem) => {
    try {
      const newStatus = pkg.is_published ? false : true;
      await defaultPackagesApi.updatePackage(pkg.id, { is_published: newStatus }, pkg.academic_year_id);
      fetchPackages();
    } catch (err: any) {
      alert(err.message || (isArabic ? 'فشل تغيير حالة الباقة' : 'Failed to update package status'));
    }
  };

  const handleDeletePackage = async (pkg: PackageItem) => {
    const confirmMsg = isArabic
      ? `هل أنت أأكد من رغبتك في حذف الباقة "${pkg.title_ar}"؟`
      : `Are you sure you want to delete package "${pkg.title_ar}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await defaultPackagesApi.deletePackage(pkg.id, pkg.academic_year_id);
      fetchPackages();
    } catch (err: any) {
      alert(err.message || (isArabic ? 'فشل حذف الباقة' : 'Failed to delete package'));
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      academicYearFilter !== 'ALL' ||
      publicationFilter !== 'ALL' ||
      featuredFilter !== 'ALL' ||
      publicFilter !== 'ALL'
  );

  return (
    <PermissionGate
        permission={SystemPermissions.PACKAGES_READ}
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              {isArabic ? 'غير مصرح لك بالوصول' : 'Access Restricted'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
              {isArabic
                ? 'ليس لديك الصلاحية الكافية لعرض أو إدارة الباقات. يرجى التواصل مع مسؤول النظام.'
                : 'You do not have permission to view or manage packages.'}
            </p>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          {/* Breadcrumbs Navigation */}
          <Breadcrumbs
            items={[
              { label: isArabic ? 'المحتوى التعليمي' : 'Educational Content', href: '/staff/courses' },
              { label: isArabic ? 'الباقات' : 'Packages' },
            ]}
          />

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {isArabic ? 'إدارة الباقات' : 'Packages Management'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {totalPackages} {isArabic ? 'باقة' : 'Packages'}
                </span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {isArabic
                  ? 'إنشاء وإدارة الباقات التجميعية وعرضها في المنصة والصفحة الرئيسية'
                  : 'Manage, create, and filter student educational packages'}
              </p>
            </div>

            <PermissionGate permission={SystemPermissions.PACKAGES_MANAGE}>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>{isArabic ? 'إضافة باقة جديدة' : 'Add New Package'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Filters & Controls Section */}
          <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search Bar (LG 4 cols) */}
              <div className="lg:col-span-4 relative">
                <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={
                    isArabic
                      ? 'البحث باسم الباقة بالعربية أو الإنجليزية...'
                      : 'Search package title...'
                  }
                  className="w-full h-10 ps-9 pe-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 end-3 my-auto h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Academic Year Filter (LG 3 cols) */}
              <div className="lg:col-span-3">
                <select
                  value={academicYearFilter}
                  onChange={(e) => {
                    setAcademicYearFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="ALL">
                    {isArabic ? 'جميع السنوات الدراسية' : 'All Academic Years'}
                  </option>
                  {availableYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {isArabic ? year.name_ar : year.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter (LG 2 cols) */}
              <div className="lg:col-span-2">
                <select
                  value={publicationFilter}
                  onChange={(e) => {
                    setPublicationFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="ALL">{isArabic ? 'كافة الحالات' : 'All Statuses'}</option>
                  <option value="PUBLISHED">{isArabic ? 'منشورة' : 'Published'}</option>
                  <option value="DRAFT">{isArabic ? 'غير منشورة / مسودة' : 'Draft'}</option>
                </select>
              </div>

              {/* Featured Filter (LG 1.5 cols) */}
              <div className="lg:col-span-1.5 sm:col-span-1">
                <select
                  value={featuredFilter}
                  onChange={(e) => {
                    setFeaturedFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="ALL">{isArabic ? 'الكل (مميز/عادي)' : 'All Featured'}</option>
                  <option value="FEATURED">{isArabic ? 'مميزة فقط' : 'Featured Only'}</option>
                  <option value="REGULAR">{isArabic ? 'عادية فقط' : 'Regular Only'}</option>
                </select>
              </div>

              {/* Homepage Visibility Filter (LG 1.5 cols) */}
              <div className="lg:col-span-1.5 sm:col-span-1">
                <select
                  value={publicFilter}
                  onChange={(e) => {
                    setPublicFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="ALL">{isArabic ? 'الكل بالرئيسية' : 'All Visibility'}</option>
                  <option value="PUBLIC">{isArabic ? 'تظهر بالرئيسية' : 'Homepage Only'}</option>
                  <option value="HIDDEN">{isArabic ? 'مخفية عن الرئيسية' : 'Hidden Only'}</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {isArabic ? 'يتم تطبيق الفلاتر المختارة...' : 'Filters active...'}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
                >
                  {isArabic ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <LoadingState message={isArabic ? 'جاري تحميل الباقات...' : 'Loading packages...'} />
          ) : error ? (
            <ErrorState
              title={isArabic ? 'حدث خطأ أثناء تحميل الباقات' : 'Error Loading Packages'}
              message={error.message || (isArabic ? 'تعذر الاتصال بالسيرفر' : 'Failed to load packages')}
              onRetry={fetchPackages}
            />
          ) : packagesList.length === 0 ? (
            <EmptyState
              title={
                hasActiveFilters
                  ? isArabic
                    ? 'لم يتم العثور على باقات مطابقة للفلاتر'
                    : 'No matching packages found'
                  : isArabic
                  ? 'لا توجد باقات مسجلة'
                  : 'No packages registered'
              }
              description={
                hasActiveFilters
                  ? isArabic
                    ? 'جرّب تعديل مصطلحات البحث أو ضبط الفلاتر'
                    : 'Try modifying your search query or filters'
                  : isArabic
                  ? 'يمكنك إضافة أول باقة بالضغط على زر "إضافة باقة جديدة"'
                  : 'You can create your first package by clicking "Add New Package"'
              }
              actionLabel={hasActiveFilters ? (isArabic ? 'إلغاء الفلاتر' : 'Reset Filters') : undefined}
              onAction={hasActiveFilters ? clearAllFilters : undefined}
            />
          ) : (
            <div className="space-y-6">
              {/* Desktop View Table */}
              <div className="hidden lg:block rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs text-neutral-700 dark:text-neutral-300">
                    <thead className="bg-neutral-50 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-4 px-4 text-start">{isArabic ? 'الباقة' : 'Package'}</th>
                        <th className="py-4 px-4 text-start">{isArabic ? 'السنة الدراسية' : 'Academic Year'}</th>
                        <th className="py-4 px-4 text-start">{isArabic ? 'السعر' : 'Price'}</th>
                        <th className="py-4 px-4 text-center">{isArabic ? 'مميزة' : 'Featured'}</th>
                        <th className="py-4 px-4 text-center">{isArabic ? 'الرئيسية' : 'Homepage'}</th>
                        <th className="py-4 px-4 text-center">{isArabic ? 'الحالة' : 'Status'}</th>
                        <th className="py-4 px-4 text-end">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                      {packagesList.map((pkg) => {
                        const yearObj = availableYears.find((y) => y.id === pkg.academic_year_id);
                        const yearName = yearObj
                          ? isArabic
                            ? yearObj.name_ar
                            : yearObj.name_en
                          : '—';

                        const hasDiscount =
                          pkg.discount_price !== null &&
                          pkg.discount_price !== undefined &&
                          pkg.discount_price < pkg.price;

                        return (
                          <tr
                            key={pkg.id}
                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            {/* Package Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-20 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                  {pkg.thumbnail_url ? (
                                    <img
                                      src={pkg.thumbnail_url}
                                      alt={pkg.title_ar}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-neutral-400">
                                      <PackageIcon className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-0.5 max-w-xs">
                                  <h4 className="font-bold text-neutral-900 dark:text-white line-clamp-1 text-sm">
                                    {pkg.title_ar}
                                  </h4>
                                  {pkg.title_en && (
                                    <p className="text-[11px] text-neutral-400 font-mono line-clamp-1">
                                      {pkg.title_en}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Academic Year */}
                            <td className="py-3.5 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                              {yearName}
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                {pkg.price === 0 ? (
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {isArabic ? 'مجاني' : 'Free'}
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-extrabold text-neutral-900 dark:text-white">
                                      {hasDiscount ? pkg.discount_price : pkg.price}{' '}
                                      <span className="text-[10px] font-normal text-neutral-400">
                                        {isArabic ? 'ج.م' : 'EGP'}
                                      </span>
                                    </span>
                                    {hasDiscount && (
                                      <span className="text-[11px] text-neutral-400 line-through">
                                        {pkg.price} {isArabic ? 'ج.م' : 'EGP'}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Featured Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {pkg.is_featured ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  <Sparkles className="h-3 w-3" />
                                  {isArabic ? 'مميز' : 'Featured'}
                                </span>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Homepage Public Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {pkg.is_public ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <Globe className="h-3 w-3" />
                                  {isArabic ? 'تظهر' : 'Visible'}
                                </span>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <StatusBadge status={pkg.status || 'DRAFT'} isArabic={isArabic} />
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-end">
                              <div className="flex items-center justify-end gap-1.5">
                                <PermissionGate permission={SystemPermissions.PACKAGES_MANAGE}>
                                  <button
                                    onClick={() => handleToggleStatus(pkg)}
                                    title={
                                      pkg.is_published
                                        ? isArabic
                                          ? 'تحويل إلى مسودة'
                                          : 'Unpublish'
                                        : isArabic
                                        ? 'نشر الباقة'
                                        : 'Publish'
                                    }
                                    className={`p-2 rounded-xl transition-colors ${
                                      pkg.is_published
                                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                        : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                    }`}
                                  >
                                    {pkg.is_published ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditModal(pkg)}
                                    title={isArabic ? 'تعديل الباقة' : 'Edit Package'}
                                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeletePackage(pkg)}
                                    title={isArabic ? 'حذف الباقة' : 'Delete Package'}
                                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </PermissionGate>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                {packagesList.map((pkg) => {
                  const yearObj = availableYears.find((y) => y.id === pkg.academic_year_id);
                  const yearName = yearObj
                    ? isArabic
                      ? yearObj.name_ar
                      : yearObj.name_en
                    : '—';

                  const hasDiscount =
                    pkg.discount_price !== null &&
                    pkg.discount_price !== undefined &&
                    pkg.discount_price < pkg.price;

                  return (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-24 shrink-0 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                          {pkg.thumbnail_url ? (
                            <img
                              src={pkg.thumbnail_url}
                              alt={pkg.title_ar}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-neutral-400">
                              <PackageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {yearName}
                            </span>
                            <StatusBadge status={pkg.status || 'DRAFT'} isArabic={isArabic} />
                          </div>
                          <h4 className="font-bold text-neutral-900 dark:text-white line-clamp-1 text-sm">
                            {pkg.title_ar}
                          </h4>
                          {pkg.title_en && (
                            <p className="text-xs text-neutral-400 font-mono line-clamp-1">
                              {pkg.title_en}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                        <div>
                          {pkg.price === 0 ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {isArabic ? 'مجاني' : 'Free'}
                            </span>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-extrabold text-neutral-900 dark:text-white">
                                {hasDiscount ? pkg.discount_price : pkg.price}{' '}
                                <span className="text-[10px] font-normal text-neutral-500">
                                  {isArabic ? 'ج.م' : 'EGP'}
                                </span>
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] text-neutral-400 line-through">
                                  {pkg.price}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {pkg.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <Sparkles className="h-3 w-3" />
                              {isArabic ? 'مميزة' : 'Featured'}
                            </span>
                          )}
                          {pkg.is_public && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Globe className="h-3 w-3" />
                              {isArabic ? 'الرئيسية' : 'Homepage'}
                            </span>
                          )}
                        </div>
                      </div>

                      <PermissionGate permission={SystemPermissions.PACKAGES_MANAGE}>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                          <button
                            onClick={() => handleToggleStatus(pkg)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                          >
                            {pkg.is_published
                              ? isArabic
                                ? 'إلغاء النشر'
                                : 'Unpublish'
                              : isArabic
                              ? 'نشر الباقة'
                              : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(pkg)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold"
                          >
                            {isArabic ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg)}
                            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </PermissionGate>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {isArabic
                      ? `عرض الصفحة ${currentPage} من ${totalPages}`
                      : `Page ${currentPage} of ${totalPages}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4 rtl:rotate-0 rotate-180" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4 rtl:rotate-0 rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create / Edit Form Modal */}
        <PackageFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchPackages}
          packageToEdit={packageToEdit}
        />
      </PermissionGate>
  );
}
