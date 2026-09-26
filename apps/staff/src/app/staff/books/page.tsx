'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Calendar,
  Layers,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Scale,
  Plus,
  Eye,
} from 'lucide-react';
import {
  defaultBooksApi,
  BookItem,
  BookQueryOptions,
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
import { CreateBookModal } from '../../../components/books/CreateBookModal';

export default function StaffBooksPage() {
  const { isArabic } = useLanguage();
  const { availableYears } = useAcademicYear();

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Data fetching states
  const [books, setBooks] = useState<BookItem[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Create Book Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    setStatusFilter('ALL');
    setYearFilter('ALL');
    setCurrentPage(1);
  };

  // Fetch books from backend API
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: BookQueryOptions = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }

      if (statusFilter === 'ACTIVE') {
        query.is_active = true;
      } else if (statusFilter === 'INACTIVE') {
        query.is_active = false;
      }

      // Explicit academic year filter selection (cross-year browsing by default)
      if (yearFilter !== 'ALL') {
        query.academic_year_id = yearFilter;
      }

      const yearScope = yearFilter !== 'ALL' ? yearFilter : undefined;

      const response = await defaultBooksApi.listBooks(query, yearScope);
      setBooks(response.data || []);
      setTotalBooks(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, yearFilter]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const hasActiveFilters = Boolean(searchTerm || statusFilter !== 'ALL' || yearFilter !== 'ALL');

  return (
    <StaffGuard>
      <PermissionGate
        permission={SystemPermissions.BOOKS_READ}
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
                ? 'لا تمتلك صلاحية عرض متجر ودليل الكتب (books.read). يرجى مراجعة المسؤول.'
                : 'You lack the required permission to view the book catalog (books.read).'}
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
                  { label: isArabic ? 'دليل الكتب والمذكرات' : 'Books' },
                ]}
                isRtl={isArabic}
              />
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {isArabic ? 'دليل الكتب والمذكرات' : 'Books Catalog'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {totalBooks} {isArabic ? 'كتاب / مذكرة' : 'books'}
                </span>
                {yearFilter !== 'ALL' && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Calendar className="h-3 w-3" />
                    {availableYears.find((y) => y.id === yearFilter)?.[isArabic ? 'name_ar' : 'name_en'] || yearFilter}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchBooks()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>

              <PermissionGate permission={SystemPermissions.BOOKS_MANAGE}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isArabic ? 'إضافة كتاب' : 'New Book'}
                </button>
              </PermissionGate>
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
                    ? 'البحث باسم الكتاب أو الكود التعريفي (SKU)...'
                    : 'Search book title or SKU...'
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

            {/* Academic Year Filter (Explicit User Choice) */}
            <div className="w-full sm:w-56">
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'كل المراحل الدراسية' : 'All Academic Years'}</option>
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {isArabic ? year.name_ar : year.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'كل الحالات (المتجر)' : 'All Statuses'}</option>
                <option value="ACTIVE">{isArabic ? 'المعروضة للبيع فقط' : 'Active Only'}</option>
                <option value="INACTIVE">{isArabic ? 'غير المعروضة / المتوقفة' : 'Inactive Only'}</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                {isArabic ? 'إعادة ضبط' : 'Reset'}
              </button>
            )}
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <LoadingState message={isArabic ? 'جاري تحميل قائمة الكتب...' : 'Loading books...'} />
          ) : error ? (
            <ErrorState
              title={
                error.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
                  ? isArabic
                    ? 'نطاق العام الدراسي غير مصرح به'
                    : 'Academic Year Scope Denied'
                  : isArabic
                  ? 'حدث خطأ أثناء تحميل الكتب'
                  : 'Error Loading Books'
              }
              message={
                error.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
                  ? isArabic
                    ? 'ليس لديك صلاحية الوصول إلى العام الدراسي المحدد. يرجى اختيار عام دراسي من النطاق المصرح لك به.'
                    : 'You do not have permission to view books for the selected academic year scope.'
                  : error.message || (isArabic ? 'تعذر الاتصال بالخادم.' : 'Unable to reach backend server.')
              }
              onRetry={fetchBooks}
            />
          ) : books.length === 0 ? (
            <EmptyState
              title={
                hasActiveFilters
                  ? isArabic
                    ? 'لم يتم العثور على كتب مطابقة'
                    : 'No matching books found'
                  : isArabic
                  ? 'لا توجد كتب مسجلة في هذا النطاق'
                  : 'No books registered in this scope'
              }
              description={
                hasActiveFilters
                  ? isArabic
                    ? 'جرّب تعديل مصطلحات البحث أو تصفية المرحلة الدراسية أو حالة العرض.'
                    : 'Try changing your search terms or filters.'
                  : isArabic
                  ? 'لم يتم إضافة كتب أو مذكرات بعد لهذا النطاق الدراسي.'
                  : 'No books or learning materials have been created yet.'
              }
              actionLabel={hasActiveFilters ? (isArabic ? 'إلغاء الفلاتر' : 'Clear Filters') : undefined}
              onAction={hasActiveFilters ? clearAllFilters : undefined}
            />
          ) : (
            <div className="space-y-4">
              {/* Books Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => {
                  const numPrice = typeof book.price === 'string' ? parseFloat(book.price) : book.price;
                  const numDiscount =
                    book.discount_price !== null && book.discount_price !== undefined
                      ? typeof book.discount_price === 'string'
                        ? parseFloat(book.discount_price)
                        : book.discount_price
                      : null;

                  const hasDiscount = numDiscount !== null && numDiscount < numPrice;
                  const isOutOfStock = book.stock_quantity <= 0;
                  const isLowStock = !isOutOfStock && book.stock_quantity <= book.low_stock_threshold;

                  return (
                    <div
                      key={book.id}
                      className="group flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all overflow-hidden"
                    >
                      {/* Book Cover Header */}
                      <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={book.title_ar}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                            <BookMarked className="h-12 w-12 stroke-1 mb-1" />
                            <span className="text-[11px] font-medium tracking-wider uppercase">
                              {isArabic ? 'لا يوجد غلاف' : 'No Cover'}
                            </span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                          <StatusBadge status={book.is_active ? 'ACTIVE' : 'INACTIVE'} isArabic={isArabic} />
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900/80 text-white backdrop-blur-sm shadow-sm">
                            {book.sku}
                          </span>
                        </div>
                      </div>

                      {/* Book Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            <Layers className="h-3.5 w-3.5 text-neutral-400" />
                            <span>
                              {book.academic_year_name_ar || (isArabic ? 'العام الدراسي' : 'Academic Year')}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {book.title_ar}
                          </h3>

                          {book.title_en && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 font-mono">
                              {book.title_en}
                            </p>
                          )}

                          {book.description_ar && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                              {book.description_ar}
                            </p>
                          )}
                        </div>

                        {/* Inventory & Stock Indicators */}
                        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                              <PackageCheck className="h-3.5 w-3.5" />
                              {isArabic ? 'المخزون الحالي:' : 'Stock:'}
                            </span>
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="h-3 w-3" />
                                {isArabic ? 'نفد المخزون (0)' : 'Out of Stock (0)'}
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" />
                                {isArabic ? `منخفض (${book.stock_quantity})` : `Low Stock (${book.stock_quantity})`}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                {isArabic ? `${book.stock_quantity} نسخة` : `${book.stock_quantity} units`}
                              </span>
                            )}
                          </div>

                          {book.weight_kg !== undefined && book.weight_kg !== null && (
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span className="flex items-center gap-1">
                                <Scale className="h-3.5 w-3.5" />
                                {isArabic ? 'الوزن للطلب:' : 'Weight:'}
                              </span>
                              <span className="font-mono text-[11px]">
                                {book.weight_kg} {isArabic ? 'كجم' : 'kg'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Pricing & Details Action */}
                        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-neutral-400 font-medium block">
                              {isArabic ? 'سعر البيع' : 'Retail Price'}
                            </span>
                            <div className="flex items-baseline gap-2">
                              {numPrice === 0 ? (
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                  {isArabic ? 'مجاني' : 'Free'}
                                </span>
                              ) : (
                                <>
                                  <span className="text-base font-bold text-neutral-900 dark:text-white">
                                    {hasDiscount ? numDiscount : numPrice}{' '}
                                    <span className="text-xs font-normal text-neutral-500">{isArabic ? 'ج.م' : 'EGP'}</span>
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs text-neutral-400 line-through">
                                      {numPrice} {isArabic ? 'ج.م' : 'EGP'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <PermissionGate permission={SystemPermissions.BOOKS_READ}>
                            <Link
                              href={`/staff/books/${book.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {isArabic ? 'التفاصيل' : 'Details'}
                            </Link>
                          </PermissionGate>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm mt-6">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isArabic
                      ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(
                          currentPage * pageSize,
                          totalBooks
                        )} من أصل ${totalBooks} كتاب`
                      : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                          currentPage * pageSize,
                          totalBooks
                        )} of ${totalBooks} books`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isArabic ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                      {isArabic ? 'السابق' : 'Previous'}
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, index, array) => {
                          const prev = array[index - 1];
                          const showEllipsis = prev && page - prev > 1;

                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="px-2 text-xs text-neutral-400">...</span>}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                disabled={isLoading}
                                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                                  currentPage === page
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                    : 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isArabic ? 'التالي' : 'Next'}
                      {isArabic ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Book Modal */}
        <CreateBookModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchBooks();
          }}
        />
      </PermissionGate>
    </StaffGuard>
  );
}
