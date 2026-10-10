'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Star,
  Globe,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  EyeOff,
  Sparkles,
  Users,
  PlayCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  PackageItem,
  PackagesListQuery,
  PackageType,
  SystemPermissions,
  resolveMediaUrl,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createPackagesApi } from '@omar-makawy/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PackageFormModal } from '@/components/packages/PackageFormModal';

const staffPackagesApi = createPackagesApi(staffApiClient);

export default function StaffPackagesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const canManage = isTeacher || hasPermission(SystemPermissions.PACKAGES_MANAGE);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [filterYearId, setFilterYearId] = useState<string>(activeAcademicYearId || 'ALL');
  const [packageTypeFilter, setPackageTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [publicFilter, setPublicFilter] = useState<string>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 12;

  // Data
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState<PackageItem | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<PackageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeAcademicYearId) {
      setFilterYearId(activeAcademicYearId);
    } else {
      setFilterYearId('ALL');
    }
  }, [activeAcademicYearId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: PackagesListQuery = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        academic_year_id: filterYearId !== 'ALL' ? filterYearId : undefined,
      };

      if (packageTypeFilter === 'MONTHLY' || packageTypeFilter === 'TERM') {
        query.package_type = packageTypeFilter as PackageType;
      }

      if (statusFilter === 'PUBLISHED') query.is_published = true;
      else if (statusFilter === 'DRAFT') query.is_published = false;

      if (publicFilter === 'PUBLIC') query.is_public = true;
      else if (publicFilter === 'PRIVATE') query.is_public = false;

      if (featuredFilter === 'FEATURED') query.is_featured = true;

      const scopeHeader = filterYearId !== 'ALL' ? filterYearId : undefined;
      const res = await staffPackagesApi.listPackages(query, scopeHeader);
      setPackages(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || (isAr ? 'تعذر تحميل الباقات' : 'Failed to load packages'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterYearId, packageTypeFilter, statusFilter, publicFilter, featuredFilter, isAr]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    if (actionSuccessMessage) {
      const timer = setTimeout(() => setActionSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccessMessage]);

  const handleFormSuccess = (pkg: PackageItem) => {
    setIsFormOpen(false);
    setSelectedPackageForEdit(null);
    setActionSuccessMessage(
      selectedPackageForEdit
        ? isAr ? 'تم تعديل الباقة بنجاح' : 'Package updated'
        : isAr ? 'تم إنشاء الباقة بنجاح' : 'Package created'
    );
    fetchPackages();
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    setIsDeleting(true);
    try {
      await staffPackagesApi.deletePackage(packageToDelete.id, packageToDelete.academic_year_id);
      setActionSuccessMessage(isAr ? 'تم حذف الباقة بنجاح' : 'Package deleted');
      fetchPackages();
    } catch (err: any) {
      setError(err?.message || (isAr ? 'فشل حذف الباقة' : 'Failed to delete package'));
    } finally {
      setIsDeleting(false);
      setPackageToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Success Toast */}
      {actionSuccessMessage && (
        <div className="fixed top-4 end-4 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top duration-200">
          {actionSuccessMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
            <PackageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-neutral-900 dark:text-white">
              {isAr ? 'الباقات' : 'Packages'}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isAr ? 'إدارة الباقات التعليمية والكورسات المجمعة' : 'Manage educational packages'}
              {total > 0 && ` (${total})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPackages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => { setSelectedPackageForEdit(null); setIsFormOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              {isAr ? 'إضافة باقة' : 'Add Package'}
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم...' : 'Search packages...'}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 ps-9 pe-3 py-2 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Year Filter */}
        <select
          value={filterYearId}
          onChange={(e) => { setFilterYearId(e.target.value); setPage(1); }}
          className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">{isAr ? 'جميع المراحل' : 'All Years'}</option>
          {availableYears.map((y) => (
            <option key={y.id} value={y.id}>{isAr ? y.name_ar : y.name_en}</option>
          ))}
        </select>

        {/* Package Type Filter */}
        <select
          value={packageTypeFilter}
          onChange={(e) => { setPackageTypeFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="ALL">{isAr ? 'كل أنواع الباقات' : 'All Package Types'}</option>
          <option value="MONTHLY">{isAr ? 'باقات شهرية' : 'Monthly Packages'}</option>
          <option value="TERM">{isAr ? 'باقات الترم' : 'Term Packages'}</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">{isAr ? 'كل الحالات' : 'All Status'}</option>
          <option value="PUBLISHED">{isAr ? 'منشور' : 'Published'}</option>
          <option value="DRAFT">{isAr ? 'مسودة' : 'Draft'}</option>
        </select>

        {/* Public Filter */}
        <select
          value={publicFilter}
          onChange={(e) => { setPublicFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">{isAr ? 'الكل' : 'All'}</option>
          <option value="PUBLIC">{isAr ? 'عامة' : 'Public'}</option>
          <option value="PRIVATE">{isAr ? 'خاصة' : 'Private'}</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message={isAr ? 'جاري تحميل الباقات...' : 'Loading packages...'} />
      ) : error ? (
        <ErrorState title={isAr ? 'خطأ' : 'Error'} message={error} onRetry={fetchPackages} />
      ) : packages.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا توجد باقات' : 'No packages'}
          description={isAr ? 'لم يتم العثور على أي باقات. يمكنك إنشاء باقة جديدة.' : 'No packages found.'}
          actionLabel={canManage ? (isAr ? 'إضافة باقة' : 'Add Package') : undefined}
          onAction={canManage ? () => { setSelectedPackageForEdit(null); setIsFormOpen(true); } : undefined}
        />
      ) : (
        <>
          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const coursesCount = Array.isArray(pkg.courses) ? pkg.courses.length : 0;
              const isMonthly = (pkg.package_type || 'MONTHLY') === 'MONTHLY';
              const lecturesCount = pkg.lecture_count ?? pkg.lectures_count ?? (isMonthly ? (pkg.target_video_count || 8) : 0);
              const studentsCount = pkg.student_count ?? pkg.students_count ?? 0;
              const hasDiscount = typeof pkg.discount_price === 'number' && pkg.discount_price > 0 && pkg.discount_price < pkg.price;

              return (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* 16:9 Image */}
                  <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                    {pkg.thumbnail_url ? (
                      <img
                        src={resolveMediaUrl(pkg.thumbnail_url)}
                        alt={pkg.title_ar}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <PackageIcon className="h-8 w-8 text-neutral-400 opacity-40" />
                    )}

                    {/* Year Badge */}
                    {pkg.academic_year_name_ar && (
                      <span className="absolute top-2 start-2 px-2 py-0.5 bg-black/70 backdrop-blur text-white text-[10px] font-bold rounded-lg">
                        {isAr ? pkg.academic_year_name_ar : pkg.academic_year_name_en}
                      </span>
                    )}

                    {/* Feature / Public Badges */}
                    <div className="absolute top-2 end-2 flex items-center gap-1">
                      {pkg.is_featured && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-md">
                          <Star className="h-2.5 w-2.5 fill-black" />
                        </span>
                      )}
                      {pkg.is_public && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md">
                          <Globe className="h-2.5 w-2.5" />
                        </span>
                      )}
                      {!pkg.is_published && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-700 text-neutral-300 text-[9px] font-bold rounded-md">
                          <EyeOff className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={pkg.status || 'PUBLISHED'} isArabic={isAr} />
                        {isMonthly ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                            <Sparkles className="h-3 w-3" />
                            {isAr ? 'باقة شهرية' : 'Monthly'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold">
                            <BookOpen className="h-3 w-3" />
                            {isAr ? 'باقة ترم' : 'Term'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                        <BookOpen className="h-3 w-3" />
                        <span>{coursesCount} {isAr ? 'كورس' : 'courses'}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                      {pkg.title_ar}
                    </h3>

                    {/* Statistics Row: Enrolled Students & Included Lectures */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <div className="p-1 rounded-md bg-amber-500/10 dark:bg-amber-400/10">
                          <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        </div>
                        <span>{studentsCount} {isAr ? 'طالب مشترك' : 'students'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <div className="p-1 rounded-md bg-emerald-500/10 dark:bg-emerald-400/10">
                          <PlayCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </div>
                        <span>{lecturesCount} {isAr ? 'محاضرة' : 'lectures'}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {pkg.discount_price} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                          <span className="text-xs text-neutral-400 line-through">{pkg.price}</span>
                        </>
                      ) : pkg.price > 0 ? (
                        <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          {pkg.price} {isAr ? 'ج.م' : 'EGP'}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">{isAr ? 'مجاني' : 'Free'}</span>
                      )}
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={() => { setSelectedPackageForEdit(pkg); setIsFormOpen(true); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          {isAr ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackageToDelete(pkg)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          {isAr ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                {isAr ? 'السابق' : 'Previous'}
              </button>
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                {isAr ? 'التالي' : 'Next'}
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <PackageFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedPackageForEdit(null); }}
        onSuccess={handleFormSuccess}
        initialPackage={selectedPackageForEdit}
      />

      <ConfirmDialog
        isOpen={!!packageToDelete}
        onClose={() => setPackageToDelete(null)}
        onConfirm={handleDelete}
        title={isAr ? 'تأكيد حذف الباقة' : 'Confirm Delete'}
        message={
          isAr
            ? `هل أنت متأكد من حذف الباقة "${packageToDelete?.title_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${packageToDelete?.title_ar}"? This cannot be undone.`
        }
        confirmText={isAr ? 'حذف' : 'Delete'}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
