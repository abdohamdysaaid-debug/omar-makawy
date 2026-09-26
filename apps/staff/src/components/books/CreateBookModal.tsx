'use client';

import React, { useState } from 'react';
import { X, BookMarked, Layers, Tag, DollarSign, Scale, Image as ImageIcon, AlertCircle } from 'lucide-react';
import {
  defaultBooksApi,
  CreateBookPayload,
  BookItem,
  ApiError,
} from '@omar-makawy/shared';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useLanguage } from '../../context/LanguageContext';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBook: BookItem) => void;
}

export function CreateBookModal({ isOpen, onClose, onSuccess }: CreateBookModalProps) {
  const { isArabic } = useLanguage();
  const { availableYears, activeAcademicYearId } = useAcademicYear();

  // Form fields
  const [academicYearId, setAcademicYearId] = useState<string>(
    activeAcademicYearId || (availableYears.length > 0 ? availableYears[0].id : '')
  );
  const [sku, setSku] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [price, setPrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('0.5');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    // Client-side validation
    if (!academicYearId) {
      setValidationError(isArabic ? 'يرجى اختيار المرحلة الدراسية' : 'Please select an academic year');
      return;
    }
    if (!sku.trim()) {
      setValidationError(isArabic ? 'يرجى إدخال الكود التعريفي (SKU)' : 'Please enter SKU');
      return;
    }
    if (!titleAr.trim()) {
      setValidationError(isArabic ? 'يرجى إدخال عنوان الكتاب بالعربية' : 'Please enter Arabic title');
      return;
    }
    if (!titleEn.trim()) {
      setValidationError(isArabic ? 'يرجى إدخال عنوان الكتاب بالإنجليزية' : 'Please enter English title');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setValidationError(isArabic ? 'يرجى إدخال سعر صحيح (0 أو أكثر)' : 'Please enter a valid price');
      return;
    }

    let numDiscount: number | null = null;
    if (discountPrice.trim() !== '') {
      numDiscount = parseFloat(discountPrice);
      if (isNaN(numDiscount) || numDiscount < 0) {
        setValidationError(isArabic ? 'يرجى إدخال سعر خصم صحيح' : 'Please enter a valid discount price');
        return;
      }
      if (numDiscount > numPrice) {
        setValidationError(isArabic ? 'سعر الخصم لا يمكن أن يتجاوز السعر الأساسي' : 'Discount price cannot exceed regular price');
        return;
      }
    }

    const numWeight = parseFloat(weightKg);
    if (isNaN(numWeight) || numWeight < 0) {
      setValidationError(isArabic ? 'يرجى إدخال وزن صحيح بالكيلوجرام' : 'Please enter a valid weight');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateBookPayload = {
        academic_year_id: academicYearId,
        sku: sku.trim().toUpperCase(),
        title_ar: titleAr.trim(),
        title_en: titleEn.trim(),
        price: numPrice,
        discount_price: numDiscount,
        description_ar: descriptionAr.trim() || undefined,
        description_en: descriptionEn.trim() || undefined,
        weight_kg: numWeight,
        cover_image_url: coverImageUrl.trim() || undefined,
        is_active: isActive,
      };

      const created = await defaultBooksApi.createBook(payload, academicYearId);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setApiError(err as ApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'إضافة كتاب أو مذكرة جديدة' : 'Create New Book'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isArabic ? 'إدخال البيانات الأساسية للكتاب في متجر المنصة' : 'Enter book metadata for the platform catalog'}
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
            <span>{apiError.message || (isArabic ? 'فشل إنشاء الكتاب في الخادم' : 'Server error creating book')}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'المرحلة الدراسية *' : 'Academic Year *'}
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              >
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {isArabic ? year.name_ar : year.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'كود الصنف (SKU) *' : 'SKU Code *'}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="BK-ENG-S1-EXP"
                required
                className="w-full py-2 px-3 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Arabic Title */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'عنوان الكتاب بالعربية *' : 'Arabic Title *'}
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="كتاب الشرح - الصف الأول الثانوي"
                required
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* English Title */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'عنوان الكتاب بالإنجليزية *' : 'English Title *'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Explanation Book - 1st Secondary"
                required
                className="w-full py-2 px-3 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'سعر البيع الأساسي (ج.م) *' : 'Retail Price (EGP) *'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
                required
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'سعر الخصم (اختياري - ج.م)' : 'Discount Price (Optional - EGP)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="120"
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'وزن الكتاب (كجم) *' : 'Weight (kg) *'}
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.5"
                required
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {isArabic ? 'رابط صورة الغلاف (اختياري)' : 'Cover Image URL (Optional)'}
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          {/* Description Arabic */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {isArabic ? 'الوصف بالعربية' : 'Arabic Description'}
            </label>
            <textarea
              rows={2}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف تفصيلي لمحتويات الكتاب والمذكرات المرفقة..."
              className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all resize-none"
            />
          </div>

          {/* Description English */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {isArabic ? 'الوصف بالإنجليزية' : 'English Description'}
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Detailed description of book curriculum..."
              className="w-full py-2 px-3 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="create_is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900 dark:focus:ring-white"
            />
            <label htmlFor="create_is_active" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
              {isArabic ? 'عرض الكتاب فوراً في المتجر (نشط / Active)' : 'Publish immediately in bookstore (Active)'}
            </label>
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
              {isSubmitting ? (isArabic ? 'جاري الحفظ...' : 'Creating...') : isArabic ? 'إنشاء الكتاب' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
