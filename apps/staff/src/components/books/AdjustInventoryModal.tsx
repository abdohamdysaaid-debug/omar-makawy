'use client';

import React, { useState } from 'react';
import { X, PackageCheck, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import {
  defaultBooksApi,
  AdjustInventoryPayload,
  InventoryLedgerType,
  BookItem,
  ApiError,
} from '@omar-makawy/shared';
import { useLanguage } from '../../context/LanguageContext';

interface AdjustInventoryModalProps {
  isOpen: boolean;
  book: BookItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustInventoryModal({
  isOpen,
  book,
  onClose,
  onSuccess,
}: AdjustInventoryModalProps) {
  const { isArabic } = useLanguage();

  const [adjustmentType, setAdjustmentType] = useState<InventoryLedgerType>('RESTOCK');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty <= 0) {
      setValidationError(
        isArabic
          ? 'يرجى إدخال كمية صحيحة موجبة (1 أو أكثر)'
          : 'Please enter a positive integer quantity'
      );
      return;
    }

    if (!reason.trim()) {
      setValidationError(
        isArabic
          ? 'يرجى إدخال سبب العملية أو ملاحظات التسوية'
          : 'Please provide a reason for the adjustment'
      );
      return;
    }

    // Pre-check for outward adjustment exceeding stock
    if (adjustmentType === 'ADJUSTMENT_OUT' && numQty > book.stock_quantity) {
      setValidationError(
        isArabic
          ? `الكمية المراد خصمها (${numQty}) تتجاوز المخزون الحالي (${book.stock_quantity})`
          : `Adjustment quantity (${numQty}) exceeds available stock (${book.stock_quantity})`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const idempotencyKey = `adj_${book.id}_${Date.now()}`;
      const payload: AdjustInventoryPayload = {
        quantity: numQty,
        type: adjustmentType,
        reason: reason.trim(),
        idempotency_key: idempotencyKey,
      };

      await defaultBooksApi.adjustInventory(book.id, payload, book.academic_year_id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(err as ApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'تسوية وتحديث المخزون' : 'Adjust Book Inventory'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {book.sku} • {isArabic ? `المخزون الحالي: ${book.stock_quantity}` : `Current: ${book.stock_quantity}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Banners */}
        {validationError && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
        {apiError && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError.message || (isArabic ? 'فشلت عملية تسوية المخزون' : 'Inventory adjustment failed')}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adjustment Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {isArabic ? 'نوع عملية المخزون *' : 'Adjustment Type *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('RESTOCK')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  adjustmentType === 'RESTOCK'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <RefreshCcw className="h-4 w-4 mb-1" />
                <span className="text-[11px]">{isArabic ? 'توريد جديد' : 'Restock'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('ADJUSTMENT_IN')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  adjustmentType === 'ADJUSTMENT_IN'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 mb-1" />
                <span className="text-[11px]">{isArabic ? 'تسوية وارد (+)' : 'Adjustment In'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('ADJUSTMENT_OUT')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  adjustmentType === 'ADJUSTMENT_OUT'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <ArrowDownRight className="h-4 w-4 mb-1" />
                <span className="text-[11px]">{isArabic ? 'تسوية صادر (-)' : 'Adjustment Out'}</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {isArabic ? 'الكمية (عدد النسخ) *' : 'Quantity (units) *'}
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              required
              className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {isArabic ? 'سبب العملية / ملاحظات الجرد والتوريد *' : 'Reason / Adjustment Notes *'}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isArabic
                  ? 'مثال: استلام دفعة جديدة من المطبعة / جرد دوري وتسوية عجز...'
                  : 'e.g., Received printing batch / periodic inventory audit...'
              }
              required
              className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (isArabic ? 'جاري التنفيذ...' : 'Processing...') : isArabic ? 'تأكيد التسوية' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
