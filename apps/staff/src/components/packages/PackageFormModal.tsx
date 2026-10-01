'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Package as PackageIcon,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  PackageItem,
  CreatePackagePayload,
  UpdatePackagePayload,
  defaultPackagesApi,
  AcademicYear,
} from '@omar-makawy/shared';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useLanguage } from '@/context/LanguageContext';
import { PackageCardPreview } from './PackageCardPreview';

export interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageToEdit?: PackageItem | null;
}

export function PackageFormModal({
  isOpen,
  onClose,
  onSuccess,
  packageToEdit,
}: PackageFormModalProps) {
  const { isArabic } = useLanguage();
  const { availableYears, activeAcademicYearId, isGlobalScope } = useAcademicYear();

  // Form Fields
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [price, setPrice] = useState<number | ''>(0);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');

  const [status, setStatus] = useState<string>('PUBLISHED');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  // Image Upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form validation & submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize or Reset Form
  useEffect(() => {
    if (isOpen) {
      if (packageToEdit) {
        setAcademicYearId(packageToEdit.academic_year_id);
        setTitleAr(packageToEdit.title_ar || '');
        setTitleEn(packageToEdit.title_en || '');
        setDescriptionAr(packageToEdit.description_ar || '');
        setDescriptionEn(packageToEdit.description_en || '');
        setThumbnailUrl(packageToEdit.thumbnail_url || '');
        setPrice(packageToEdit.price ?? 0);

        const discountVal = packageToEdit.discount_price;
        if (discountVal !== null && discountVal !== undefined && discountVal < packageToEdit.price) {
          setHasDiscount(true);
          setDiscountPrice(discountVal);
        } else {
          setHasDiscount(false);
          setDiscountPrice('');
        }

        setStatus(packageToEdit.status || 'PUBLISHED');
        setIsPublished(packageToEdit.is_published ?? true);
        setIsFeatured(packageToEdit.is_featured ?? false);
        setIsPublic(packageToEdit.is_public ?? false);
      } else {
        // Create Mode
        const initialYear = activeAcademicYearId || availableYears[0]?.id || '';
        setAcademicYearId(initialYear);
        setTitleAr('');
        setTitleEn('');
        setDescriptionAr('');
        setDescriptionEn('');
        setThumbnailUrl('');
        setPrice(0);
        setHasDiscount(false);
        setDiscountPrice('');
        setStatus('PUBLISHED');
        setIsPublished(true);
        setIsFeatured(false);
        setIsPublic(false);
      }

      setImageError(null);
      setSubmitError(null);
    }
  }, [isOpen, packageToEdit, availableYears, activeAcademicYearId]);

  if (!isOpen) return null;

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError(
        isArabic
          ? 'حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت). يرجى تقليل حجم الصورة.'
          : 'File size exceeds maximum limit of 5MB.'
      );
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageError(
        isArabic
          ? 'صيغة الملف غير مدعومة. الصيغ المسموحة هي PNG, JPEG, WebP فقط.'
          : 'Unsupported image format. Allowed formats: PNG, JPEG, WebP.'
      );
      return;
    }

    // Local instant preview
    const objectUrl = URL.createObjectURL(file);
    setThumbnailUrl(objectUrl);

    setIsUploadingImage(true);
    try {
      const res = await defaultPackagesApi.uploadThumbnail(file, academicYearId || undefined);
      if (res.url) {
        setThumbnailUrl(res.url);
      }
    } catch (err: any) {
      setImageError(
        err.message ||
          (isArabic
            ? 'تعذر رفع الصورة على السيرفر. تم الاحتفاظ بالمعاينة المحلية.'
            : 'Failed to upload thumbnail to server.')
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic Validation
    if (!titleAr.trim()) {
      setSubmitError(isArabic ? 'يرجى إدخال اسم الباقة بالعربية' : 'Arabic package title is required');
      return;
    }
    if (!academicYearId) {
      setSubmitError(isArabic ? 'يرجى اختيار السنة الدراسية للباقة' : 'Academic year is required');
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setSubmitError(isArabic ? 'سعر الباقة يجب أن يكون رقماً موجباً أو 0' : 'Price must be a positive number');
      return;
    }

    let finalDiscountPrice: number | undefined = undefined;
    if (hasDiscount) {
      const numericDiscount = Number(discountPrice);
      if (isNaN(numericDiscount) || numericDiscount <= 0) {
        setSubmitError(
          isArabic ? 'يرجى إدخال قيمة خصم تزيد عن 0' : 'Discount price must be greater than 0'
        );
        return;
      }
      if (numericDiscount >= numericPrice) {
        setSubmitError(
          isArabic
            ? 'السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي للباقة'
            : 'Discount price must be strictly lower than original price'
        );
        return;
      }
      finalDiscountPrice = numericDiscount;
    }

    setIsSubmitting(true);

    try {
      if (packageToEdit) {
        // Edit Mode
        const updatePayload: UpdatePackagePayload = {
          title_ar: titleAr.trim(),
          title_en: titleEn.trim() || titleAr.trim(),
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          price: numericPrice,
          discount_price: finalDiscountPrice !== undefined ? finalDiscountPrice : undefined,
          status,
          is_published: isPublished,
          is_featured: isFeatured,
          is_public: isPublic,
        };

        await defaultPackagesApi.updatePackage(packageToEdit.id, updatePayload, academicYearId);
      } else {
        // Create Mode
        const createPayload: CreatePackagePayload = {
          academic_year_id: academicYearId,
          title_ar: titleAr.trim(),
          title_en: titleEn.trim() || titleAr.trim(),
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          price: numericPrice,
          discount_price: finalDiscountPrice,
          status,
          is_published: isPublished,
          is_featured: isFeatured,
          is_public: isPublic,
        };

        await defaultPackagesApi.createPackage(createPayload, academicYearId);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || (isArabic ? 'حدث خطأ أثناء حفظ الباقة' : 'Failed to save package'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedYear = availableYears.find((y) => y.id === academicYearId);
  const yearDisplayName = selectedYear
    ? isArabic
      ? selectedYear.name_ar
      : selectedYear.name_en
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PackageIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {packageToEdit
                  ? isArabic
                    ? 'تعديل بيانات الباقة'
                    : 'Edit Package'
                  : isArabic
                  ? 'إضافة باقة جديدة'
                  : 'Create New Package'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isArabic
                  ? 'أدخل بيانات الباقة وشاهد المعاينة المباشرة قبل الحفظ'
                  : 'Enter package information and view live preview before saving'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Split view grid (Form on left/right, Live Preview on opposite side) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Main Form (7 cols on LG) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {submitError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* 1. Academic Year Scope */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {isArabic ? 'السنة الدراسية' : 'Academic Year'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="" disabled>
                    {isArabic ? 'اختر السنة الدراسية...' : 'Select Academic Year...'}
                  </option>
                  {availableYears.map((year: AcademicYear) => (
                    <option key={year.id} value={year.id}>
                      {isArabic ? year.name_ar : year.name_en} ({year.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Titles (Bilingual) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? 'اسم الباقة بالعربية' : 'Package Title (Arabic)'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={isArabic ? 'مثال: باقة الثانوية العامة الشاملة' : 'e.g. Comprehensive General Secondary Package'}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? 'اسم الباقة بالإنجليزية (اختياري)' : 'Package Title (English Optional)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder={isArabic ? 'مثال: Complete Highschool Package' : 'e.g. Complete Highschool Package'}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* 3. Image Upload Section with Aspect Ratio Guide */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {isArabic ? 'صورة الغلاف للباقة' : 'Package Thumbnail Image'}
              </label>
              
              <div className="p-4 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    {isArabic
                      ? 'النسبة الموصى بها: 16:9 (أبعاد 1280x720 بكسل)'
                      : 'Recommended Aspect Ratio: 16:9 (1280x720 px)'}
                  </span>
                  <span>{isArabic ? 'الحد الأقصى: 5 ميجابايت' : 'Max size: 5MB'}</span>
                </div>

                {thumbnailUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 group bg-neutral-900">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 rounded-xl bg-white/90 text-neutral-900 hover:bg-white text-xs font-bold transition-all"
                      >
                        {isArabic ? 'تغيير الصورة' : 'Change Image'}
                      </button>
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full aspect-video rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col items-center justify-center gap-2 bg-white dark:bg-neutral-900 cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-neutral-400" />
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {isArabic ? 'اضغط لرفع صورة الباقة' : 'Click to upload package image'}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          PNG, JPEG, WebP
                        </span>
                      </>
                    )}
                  </button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                {imageError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Pricing & Discount Section */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {isArabic ? 'التسعير والخصومات' : 'Pricing & Discount'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? 'سعر الباقة الأصلي (ج.م)' : 'Original Price (EGP)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Has Discount Switch */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? 'هل يوجد خصم على الباقة؟' : 'Apply Discount?'}
                  </label>
                  <div className="flex items-center gap-2 h-11">
                    <button
                      type="button"
                      onClick={() => setHasDiscount(false)}
                      className={`flex-1 h-full rounded-xl text-xs font-bold border transition-all ${
                        !hasDiscount
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {isArabic ? 'لا يوجد خصم' : 'No Discount'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasDiscount(true)}
                      className={`flex-1 h-full rounded-xl text-xs font-bold border transition-all ${
                        hasDiscount
                          ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {isArabic ? 'يوجد خصم' : 'Apply Discount'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Discount Price Input (Shown conditionally) */}
              {hasDiscount && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {isArabic ? 'السعر النهائي بعد الخصم (ج.م)' : 'Discounted Price (EGP)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={isArabic ? 'مثال: 450' : 'e.g. 450'}
                    required={hasDiscount}
                    className="w-full h-11 px-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-neutral-900 text-sm font-extrabold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {price !== '' && discountPrice !== '' && Number(discountPrice) < Number(price) && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {isArabic
                        ? `وفر الطالب ${Number(price) - Number(discountPrice)} ج.م (${Math.round(
                            ((Number(price) - Number(discountPrice)) / Number(price)) * 100
                          )}%خصم)`
                        : `Discount savings: ${Number(price) - Number(discountPrice)} EGP`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 5. Descriptions (Bilingual) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? 'وصف الباقة (بالعربية)' : 'Description (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder={isArabic ? 'أدخل تفاصيل ومميزات الباقة...' : 'Enter package details...'}
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? 'وصف الباقة (بالإنجليزية)' : 'Description (English)'}
                </label>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder={isArabic ? 'Enter package details...' : 'Enter package details...'}
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* 6. Settings & Visibility Toggles */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {isArabic ? 'إعدادات الظهور والحالة' : 'Visibility & Status Settings'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? 'حالة الباقة' : 'Package Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PUBLISHED">{isArabic ? 'منشور (PUBLISHED)' : 'PUBLISHED'}</option>
                    <option value="DRAFT">{isArabic ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
                    <option value="ARCHIVED">{isArabic ? 'مؤرشف (ARCHIVED)' : 'ARCHIVED'}</option>
                  </select>
                </div>

                {/* Featured Toggle */}
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                      {isArabic ? 'باقة مميزة' : 'Featured Package'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {isArabic ? 'تمييز الباقة بنجمة' : 'Highlight package'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-5 w-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Homepage visibility Toggle */}
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                      {isArabic ? 'الظهور بالرئيسية' : 'Homepage Visibility'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {isArabic ? 'عرض في الصفحة الرئيسية' : 'Show on homepage'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-5 w-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {packageToEdit
                        ? isArabic
                          ? 'تحديث الباقة'
                          : 'Update Package'
                        : isArabic
                        ? 'حفظ وإضافة الباقة'
                        : 'Save Package'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Side Column: Live Preview (5 cols on LG) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4 bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60">
            <div className="w-full text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                {isArabic ? 'معاينة شكل الباقة للطلاب' : 'Student Live Preview'}
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {isArabic
                  ? 'هذا هو الشكل الدقيق الذي سيظهر للطالب في المنصة'
                  : 'This is the exact view students will see on the platform'}
              </p>
            </div>

            <div className="w-full pt-2">
              <PackageCardPreview
                titleAr={titleAr}
                titleEn={titleEn}
                descriptionAr={descriptionAr}
                thumbnailUrl={thumbnailUrl}
                price={typeof price === 'number' ? price : 0}
                hasDiscount={hasDiscount}
                discountPrice={typeof discountPrice === 'number' ? discountPrice : undefined}
                academicYearName={yearDisplayName}
                status={status}
                isFeatured={isFeatured}
                isPublic={isPublic}
                isArabic={isArabic}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
