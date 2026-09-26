'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookMarked,
  Layers,
  Calendar,
  Clock,
  ShieldAlert,
  Edit3,
  RefreshCw,
  Tag,
  Scale,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  Power,
  PowerOff,
  History,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
} from 'lucide-react';
import {
  defaultBooksApi,
  BookItem,
  InventoryLedgerItem,
  SystemPermissions,
  ApiError,
} from '@omar-makawy/shared';
import { StaffGuard } from '../../../../components/layout/StaffGuard';
import { PermissionGate } from '../../../../components/rbac/PermissionGate';
import { usePermissions } from '../../../../hooks/usePermissions';
import { useLanguage } from '../../../../context/LanguageContext';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../../../../components/ui/Breadcrumbs';
import { LoadingState, ErrorState, EmptyState } from '../../../../components/ui/FeedbackStates';
import { EditBookModal } from '../../../../components/books/EditBookModal';
import { AdjustInventoryModal } from '../../../../components/books/AdjustInventoryModal';

export function BookDetailClient() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id as string;

  const { isArabic } = useLanguage();
  const { hasPermission } = usePermissions();

  // Book Data State
  const [book, setBook] = useState<BookItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Inventory Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<InventoryLedgerItem[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [ledgerPages, setLedgerPages] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<ApiError | null>(null);
  const ledgerLimit = 10;

  // Modals & Dialogs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  // Fetch Book Details
  const fetchBookDetails = useCallback(async () => {
    if (!bookId || bookId === 'detail') return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await defaultBooksApi.getBookById(bookId);
      setBook(data);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  // Fetch Inventory Ledger History
  const fetchInventoryLedger = useCallback(async () => {
    if (!bookId || bookId === 'detail') return;

    setIsLedgerLoading(true);
    setLedgerError(null);

    try {
      const res = await defaultBooksApi.getInventoryLedger(
        bookId,
        { page: ledgerPage, limit: ledgerLimit },
        book?.academic_year_id
      );
      setLedgerEntries(res.data || []);
      setLedgerTotal(res.meta?.total || 0);
      setLedgerPages(res.meta?.pages || 1);
    } catch (err: any) {
      setLedgerError(err as ApiError);
    } finally {
      setIsLedgerLoading(false);
    }
  }, [bookId, ledgerPage, ledgerLimit, book?.academic_year_id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  useEffect(() => {
    if (book) {
      fetchInventoryLedger();
    }
  }, [book, fetchInventoryLedger]);

  // Handle Publish / Unpublish Actions
  const handlePublishToggle = async () => {
    if (!book) return;
    setIsActionPending(true);

    try {
      if (book.is_active) {
        const updated = await defaultBooksApi.unpublishBook(book.id, book.academic_year_id);
        setBook(updated);
        setIsUnpublishDialogOpen(false);
      } else {
        const updated = await defaultBooksApi.publishBook(book.id, book.academic_year_id);
        setBook(updated);
        setIsPublishDialogOpen(false);
      }
    } catch (err: any) {
      alert(err.message || (isArabic ? 'فشلت عملية تغيير حالة النشر' : 'Failed to update publication status'));
    } finally {
      setIsActionPending(false);
    }
  };

  if (isLoading) {
    return (
      <StaffGuard>
        <LoadingState message={isArabic ? 'جاري تحميل تفاصيل الكتاب...' : 'Loading book details...'} />
      </StaffGuard>
    );
  }

  if (error || !book) {
    return (
      <StaffGuard>
        <ErrorState
          title={
            error?.error_code === 'BOOK_NOT_FOUND'
              ? isArabic
                ? 'الكتاب غير موجود'
                : 'Book Not Found'
              : error?.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
              ? isArabic
                ? 'نطاق العام الدراسي غير مصرح به'
                : 'Academic Year Scope Denied'
              : isArabic
              ? 'حدث خطأ أثناء تحميل بيانات الكتاب'
              : 'Error Loading Book'
          }
          message={
            error?.error_code === 'BOOK_NOT_FOUND'
              ? isArabic
                ? 'لم يتم العثور على سجل هذا الكتاب في قاعدة البيانات.'
                : 'The requested book record was not found in database.'
              : error?.error_code === 'ACADEMIC_YEAR_SCOPE_DENIED'
              ? isArabic
                ? 'ليس لديك صلاحية الوصول إلى المرحلة الدراسية التابع لها هذا الكتاب.'
                : 'You lack permission to access the academic scope of this book.'
              : error?.message || (isArabic ? 'تعذر الاتصال بالخادم.' : 'Unable to reach backend server.')
          }
          onRetry={fetchBookDetails}
        />
      </StaffGuard>
    );
  }

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
                ? 'لا تمتلك صلاحية عرض تفاصيل الكتب (books.read). يرجى مراجعة المسؤول.'
                : 'You lack the required permission to view book details (books.read).'}
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
                  { label: isArabic ? 'دليل الكتب والمذكرات' : 'Books Catalog', href: '/staff/books' },
                  { label: book.title_ar },
                ]}
                isRtl={isArabic}
              />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {book.title_ar}
                </h1>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm">
                  {book.sku}
                </span>
                <StatusBadge status={book.is_active ? 'ACTIVE' : 'INACTIVE'} isArabic={isArabic} />
              </div>
              {book.title_en && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {book.title_en}
                </p>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  fetchBookDetails();
                  fetchInventoryLedger();
                }}
                disabled={isLoading || isLedgerLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>

              {/* Adjust Stock Button */}
              <PermissionGate permission={SystemPermissions.BOOKS_MANAGE}>
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <PackageCheck className="h-3.5 w-3.5" />
                  {isArabic ? 'تسوية المخزون' : 'Adjust Stock'}
                </button>
              </PermissionGate>

              {/* Edit Metadata Button */}
              <PermissionGate permission={SystemPermissions.BOOKS_MANAGE}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  {isArabic ? 'تعديل البيانات' : 'Edit Metadata'}
                </button>
              </PermissionGate>

              {/* Publish / Unpublish Toggle */}
              <PermissionGate permission={SystemPermissions.BOOKS_MANAGE}>
                {book.is_active ? (
                  <button
                    type="button"
                    onClick={() => setIsUnpublishDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors"
                  >
                    <PowerOff className="h-3.5 w-3.5" />
                    {isArabic ? 'إيقاف العرض' : 'Unpublish'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPublishDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {isArabic ? 'تفعيل وعرض' : 'Publish'}
                  </button>
                )}
              </PermissionGate>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Info & Inventory Ledger */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview & Metadata Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                    {isArabic ? 'نظرة عامة على الكتاب' : 'Book Overview'}
                  </h2>
                  {book.description_ar ? (
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {book.description_ar}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">
                      {isArabic ? 'لا يوجد وصف باللغة العربية.' : 'No Arabic description provided.'}
                    </p>
                  )}

                  {book.description_en && (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-mono">
                      {book.description_en}
                    </p>
                  )}
                </div>

                {/* Specifications Grid */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    {isArabic ? 'المواصفات والبيانات الأساسية' : 'Specifications'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-0.5">
                        {isArabic ? 'المرحلة الدراسية' : 'Academic Year'}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-neutral-400" />
                        {book.academic_year_name_ar || (isArabic ? 'العام الدراسي' : 'Academic Scope')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-0.5">
                        {isArabic ? 'سعر البيع' : 'Retail Price'}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {hasDiscount ? numDiscount : numPrice} {isArabic ? 'ج.م' : 'EGP'}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            {numPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-0.5">
                        {isArabic ? 'وزن الشحن' : 'Weight'}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1 font-mono">
                        <Scale className="h-3.5 w-3.5 text-neutral-400" />
                        {book.weight_kg ?? 0.5} {isArabic ? 'كجم' : 'kg'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-0.5">
                        {isArabic ? 'كود الصنف (SKU)' : 'SKU Code'}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                        {book.sku}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-0.5">
                        {isArabic ? 'تاريخ الإضافة' : 'Created At'}
                      </span>
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                        {new Date(book.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-0.5">
                        {isArabic ? 'آخر تحديث' : 'Last Updated'}
                      </span>
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                        {new Date(book.updated_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Ledger Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-neutral-500" />
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {isArabic ? 'سجل حركات المخزون (Ledger History)' : 'Inventory Movement Ledger'}
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">
                    {ledgerTotal} {isArabic ? 'حركة مسجلة' : 'movements'}
                  </span>
                </div>

                {isLedgerLoading ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-neutral-400" />
                    {isArabic ? 'جاري تحميل سجل الحركات...' : 'Loading movement history...'}
                  </div>
                ) : ledgerError ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                    {ledgerError.message || (isArabic ? 'تعذر تحميل سجل المخزون' : 'Failed to load ledger history')}
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400 text-xs">
                    <PackageCheck className="h-8 w-8 mx-auto mb-2 stroke-1 opacity-50" />
                    {isArabic ? 'لا توجد حركات مخزون مسجلة لهذا الكتاب حتى الآن' : 'No inventory movements recorded yet'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 text-start">{isArabic ? 'التاريخ والوقت' : 'Date & Time'}</th>
                          <th className="py-2.5 px-3 text-start">{isArabic ? 'نوع الحركة' : 'Type'}</th>
                          <th className="py-2.5 px-3 text-start">{isArabic ? 'قبل' : 'Before'}</th>
                          <th className="py-2.5 px-3 text-start">{isArabic ? 'التغيير' : 'Change'}</th>
                          <th className="py-2.5 px-3 text-start">{isArabic ? 'بعد' : 'After'}</th>
                          <th className="py-2.5 px-3 text-start">{isArabic ? 'ملاحظات / السبب' : 'Notes / Reason'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {ledgerEntries.map((entry) => {
                          const isPositive = entry.change_amount > 0;
                          return (
                            <tr key={entry.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                              <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap text-start">
                                {new Date(entry.created_at).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-start">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                    entry.type === 'RESTOCK'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : entry.type === 'ADJUSTMENT_IN'
                                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                      : entry.type === 'ADJUSTMENT_OUT'
                                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                      : entry.type === 'SALE'
                                      ? 'bg-neutral-500/10 text-neutral-700 dark:text-neutral-300'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                  }`}
                                >
                                  {entry.type}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-neutral-500 text-start">{entry.quantity_before}</td>
                              <td className="py-3 px-3 font-mono font-bold text-start">
                                <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                  {isPositive ? `+${entry.change_amount}` : entry.change_amount}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white text-start">
                                {entry.quantity_after}
                              </td>
                              <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300 text-start max-w-xs truncate">
                                {entry.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination Bar for Ledger */}
                    {ledgerPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                        <span className="text-[11px] text-neutral-400">
                          {isArabic
                            ? `صفحة ${ledgerPage} من ${ledgerPages}`
                            : `Page ${ledgerPage} of ${ledgerPages}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                            disabled={ledgerPage === 1 || isLedgerLoading}
                            className="p-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 disabled:opacity-40"
                          >
                            {isArabic ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setLedgerPage((p) => Math.min(ledgerPages, p + 1))}
                            disabled={ledgerPage === ledgerPages || isLedgerLoading}
                            className="p-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 disabled:opacity-40"
                          >
                            {isArabic ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Cover Image & Live Inventory Status Card */}
            <div className="space-y-6">
              {/* Cover Preview Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="relative h-64 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title_ar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                      <BookMarked className="h-16 w-16 stroke-1 mb-2" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {isArabic ? 'لا توجد صورة غلاف' : 'No Cover Image'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Inventory Status Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <PackageCheck className="h-4 w-4 text-neutral-400" />
                    {isArabic ? 'حالة المخزون الحالي' : 'Live Inventory Status'}
                  </h3>
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      {isArabic ? 'نفد المخزون' : 'Out of Stock'}
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      {isArabic ? 'مخزون منخفض' : 'Low Stock'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {isArabic ? 'متوفر' : 'In Stock'}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isArabic ? 'الكمية المتوفرة حالياً:' : 'Current Stock:'}
                    </span>
                    <span className="text-xl font-mono font-bold text-neutral-900 dark:text-white">
                      {book.stock_quantity}{' '}
                      <span className="text-xs font-normal text-neutral-400">{isArabic ? 'نسخة' : 'units'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isArabic ? 'حد التنبيه بالانخفاض:' : 'Low Stock Threshold:'}</span>
                    <span className="font-mono">{book.low_stock_threshold} {isArabic ? 'نسخ' : 'units'}</span>
                  </div>
                </div>

                <PermissionGate permission={SystemPermissions.BOOKS_MANAGE}>
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(true)}
                    className="w-full mt-2 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PackageCheck className="h-3.5 w-3.5" />
                    {isArabic ? 'إجراء تسوية أو توريد' : 'Perform Restock / Adjustment'}
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>

        {/* Modals & Dialogs */}
        <EditBookModal
          isOpen={isEditModalOpen}
          book={book}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => {
            setBook(updated);
          }}
        />

        <AdjustInventoryModal
          isOpen={isAdjustModalOpen}
          book={book}
          onClose={() => setIsAdjustModalOpen(false)}
          onSuccess={() => {
            fetchBookDetails();
            fetchInventoryLedger();
          }}
        />

        {/* Confirm Dialogs */}
        <ConfirmDialog
          isOpen={isPublishDialogOpen}
          title={isArabic ? 'تأكيد تفعيل وعرض الكتاب' : 'Confirm Book Publication'}
          message={
            isArabic
              ? `هل أنت متأكد من تفعيل الكتاب (${book.title_ar}) وعرضه للبيع لطلاب المرحلة؟`
              : `Are you sure you want to publish (${book.title_en || book.title_ar}) to students?`
          }
          confirmText={isArabic ? 'تفعيل وعرض' : 'Publish'}
          cancelText={isArabic ? 'إلغاء' : 'Cancel'}
          isDestructive={false}
          isLoading={isActionPending}
          onConfirm={handlePublishToggle}
          onClose={() => setIsPublishDialogOpen(false)}
        />

        <ConfirmDialog
          isOpen={isUnpublishDialogOpen}
          title={isArabic ? 'تأكيد إيقاف عرض الكتاب' : 'Confirm Book Unpublishing'}
          message={
            isArabic
              ? `هل أنت متأكد من إيقاف عرض الكتاب (${book.title_ar})؟ لن يتمكن الطلاب من شرائه من المتجر.`
              : `Are you sure you want to unpublish (${book.title_en || book.title_ar})? Students will not be able to purchase it.`
          }
          confirmText={isArabic ? 'إيقاف العرض' : 'Unpublish'}
          cancelText={isArabic ? 'إلغاء' : 'Cancel'}
          isDestructive={true}
          isLoading={isActionPending}
          onConfirm={handlePublishToggle}
          onClose={() => setIsUnpublishDialogOpen(false)}
        />
      </PermissionGate>
    </StaffGuard>
  );
}
