'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Upload,
  BookOpen,
  DollarSign,
  Layers,
  Sparkles,
  Globe,
  FileText,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import {
  CourseItem,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createCoursesApi } from '@omar-makawy/shared';
import { CourseCardPreview } from './CourseCardPreview';
import { ImageCropperModal } from './ImageCropperModal';

const staffCoursesApi = createCoursesApi(staffApiClient);

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (course: CourseItem) => void;
  initialCourse?: CourseItem | null;
}

export function CourseFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialCourse = null,
}: CourseFormModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const isEdit = Boolean(initialCourse);

  // Form Fields State
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [price, setPrice] = useState<string>('0');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [status, setStatus] = useState<string>('PUBLISHED');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Thumbnail State
  const [currentServerThumbnail, setCurrentServerThumbnail] = useState<string | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form data
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setUploadProgressStatus(null);
      setPendingCropFile(null);

      if (initialCourse) {
        setAcademicYearId(initialCourse.academic_year_id);
        setTitleAr(initialCourse.title_ar || '');
        setTitleEn(initialCourse.title_en || '');
        setDescriptionAr(initialCourse.description_ar || '');
        setDescriptionEn(initialCourse.description_en || '');
        setPrice(String(initialCourse.price ?? 0));
        setDiscountPrice(
          initialCourse.discount_price !== undefined && initialCourse.discount_price !== null
            ? String(initialCourse.discount_price)
            : ''
        );
        setStatus(initialCourse.status || 'PUBLISHED');
        setIsPublished(initialCourse.is_published ?? true);
        setIsPublic(initialCourse.is_public ?? false);
        setIsFeatured(initialCourse.is_featured ?? false);
        setSortOrder(initialCourse.sort_order ?? 0);
        setCurrentServerThumbnail(initialCourse.thumbnail_url || null);
        setLocalPreviewUrl(initialCourse.thumbnail_url || null);
      } else {
        // Create mode defaults
        const defaultYear = activeAcademicYearId || (availableYears[0]?.id ?? '');
        setAcademicYearId(defaultYear);
        setTitleAr('');
        setTitleEn('');
        setDescriptionAr('');
        setDescriptionEn('');
        setPrice('0');
        setDiscountPrice('');
        setStatus('PUBLISHED');
        setIsPublished(true);
        setIsPublic(true);
        setIsFeatured(false);
        setSortOrder(0);
        setCurrentServerThumbnail(null);
        setLocalPreviewUrl(null);
      }
    }
  }, [isOpen, initialCourse, activeAcademicYearId, availableYears]);

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    setPendingCropFile(croppedFile);
    setLocalPreviewUrl(previewUrl);
    setErrorMessage(null);
  };

  const handleRemoveImage = () => {
    setPendingCropFile(null);
    setLocalPreviewUrl(null);
    setCurrentServerThumbnail(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    const cleanTitleAr = titleAr.trim();
    if (!cleanTitleAr) {
      setErrorMessage(isAr ? 'يرجى إدخال اسم الكورس بالعربية' : 'Arabic title is required');
      return;
    }

    if (!isEdit && !academicYearId) {
      setErrorMessage(isAr ? 'يرجى اختيار المرحلة الدراسية' : 'Academic year is required');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage(isAr ? 'يرجى إدخال سعر صحيح للكورس (0 أو أكثر)' : 'Price must be a valid number >= 0');
      return;
    }

    let numDiscount: number | undefined = undefined;
    if (discountPrice.trim() !== '') {
      numDiscount = parseFloat(discountPrice);
      if (isNaN(numDiscount) || numDiscount < 0) {
        setErrorMessage(isAr ? 'سعر الخصم غير صحيح' : 'Invalid discount price');
        return;
      }
      if (numDiscount > numPrice) {
        setErrorMessage(
          isAr
            ? 'لا يمكن أن يتجاوز سعر الخصم السعر الأصلي للكورس'
            : 'Discount price cannot exceed base price'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 2. Upload thumbnail if a new cropped file was provided
      let finalThumbnailUrl: string | undefined = currentServerThumbnail || undefined;

      if (pendingCropFile) {
        setUploadProgressStatus(
          isAr ? 'جاري رفع صورة الغلاف إلى Google Drive...' : 'Uploading image to Google Drive...'
        );

        const targetYearForUpload = isEdit ? initialCourse!.academic_year_id : academicYearId;
        const uploadRes = await staffCoursesApi.uploadThumbnail(
          pendingCropFile,
          targetYearForUpload
        );

        if (!uploadRes || !uploadRes.url) {
          throw new Error(
            isAr ? 'فشل استلام رابط الصورة من الخادم' : 'Failed to receive thumbnail URL from server'
          );
        }

        finalThumbnailUrl = uploadRes.url;
      } else if (currentServerThumbnail === null && isEdit) {
        finalThumbnailUrl = '';
      }

      setUploadProgressStatus(
        isAr ? 'جاري حفظ بيانات الكورس...' : 'Saving course record...'
      );

      // 3. Execute Create or Update
      if (isEdit && initialCourse) {
        const payload: UpdateCoursePayload = {
          title_ar: cleanTitleAr,
          title_en: titleEn.trim() || undefined,
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          price: numPrice,
          discount_price: numDiscount,
          status,
          is_published: isPublished,
          is_public: isPublic,
          is_featured: isFeatured,
          sort_order: sortOrder,
          thumbnail_url: finalThumbnailUrl,
        };

        const updated = await staffCoursesApi.updateCourse(
          initialCourse.id,
          payload,
          initialCourse.academic_year_id
        );
        onSuccess(updated);
      } else {
        const payload: CreateCoursePayload = {
          academic_year_id: academicYearId,
          title_ar: cleanTitleAr,
          title_en: titleEn.trim() || undefined,
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          price: numPrice,
          discount_price: numDiscount,
          status,
          is_published: isPublished,
          is_public: isPublic,
          is_featured: isFeatured,
          sort_order: sortOrder,
          thumbnail_url: finalThumbnailUrl,
        };

        const created = await staffCoursesApi.createCourse(payload, academicYearId);
        onSuccess(created);
      }

      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setUploadProgressStatus(null);
      setErrorMessage(
        err?.message ||
          (isAr
            ? 'حدث خطأ أثناء حفظ الكورس. يرجى مراجعة البيانات والمحاولة مجدداً.'
            : 'Failed to save course. Please verify input and try again.')
      );
    }
  };

  const selectedYearObj = availableYears.find((y) => y.id === academicYearId);
  const selectedYearName = isAr ? selectedYearObj?.name_ar : selectedYearObj?.name_en;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
        <div
          className="w-full max-w-5xl my-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {isEdit
                    ? isAr
                      ? `تعديل الكورس: ${initialCourse?.title_ar}`
                      : `Edit Course: ${initialCourse?.title_en || initialCourse?.title_ar}`
                    : isAr
                    ? 'إضافة كورس تعليمي جديد'
                    : 'Create New Course'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isAr
                    ? 'أدخل بيانات الكورس وصورة الغلاف بدقة'
                    : 'Fill in course details and 16:9 banner thumbnail'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content Grid (Form + Live Preview) */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Left/Main Form Fields (7 Columns) */}
              <div className="lg:col-span-7 space-y-4">
                {errorMessage && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-semibold">{errorMessage}</span>
                  </div>
                )}

                {/* Academic Year Selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                    {isAr ? 'المرحلة الدراسية' : 'Academic Year'} *
                  </label>
                  <select
                    disabled={isEdit || isSubmitting}
                    value={academicYearId}
                    onChange={(e) => setAcademicYearId(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {availableYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {isAr ? year.name_ar : year.name_en}
                      </option>
                    ))}
                  </select>
                  {isEdit && (
                    <p className="mt-1 text-[11px] text-neutral-400">
                      {isAr
                        ? 'لا يمكن تغيير المرحلة الدراسية بعد إنشاء الكورس للحفاظ على سلامة البيانات.'
                        : 'Academic year is immutable after course creation.'}
                    </p>
                  )}
                </div>

                {/* Title Fields (Arabic & English) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                      {isAr ? 'اسم الكورس بالعربي' : 'Arabic Title'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder={isAr ? 'مثال: كورس شهر أكتوبر - قواعد ومحادثة' : 'Arabic course title'}
                      className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors text-start"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                      {isAr ? 'اسم الكورس بالإنجليزي' : 'English Title'}
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. October Comprehensive Course"
                      className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors text-start"
                    />
                  </div>
                </div>

                {/* Pricing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                      {isAr ? 'السعر الأصلي (ج.م)' : 'Base Price (EGP)'} *
                    </label>
                    <div className="relative rounded-xl">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-mono font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors text-start"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                      {isAr ? 'سعر الخصم (اختياري)' : 'Discount Price (Optional)'}
                    </label>
                    <div className="relative rounded-xl">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder={isAr ? 'اتركه فارغاً إن لم يوجد خصم' : 'Leave empty if none'}
                        className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-mono font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors text-start"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Fields */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                    {isAr ? 'الوصف بالعربي' : 'Arabic Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder={isAr ? 'وصف تفصيلي لمحتويات الكورس والأهداف التعليمية...' : 'Course description in Arabic...'}
                    className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2 px-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors text-start"
                  />
                </div>

                {/* Publication and Visibility Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  {/* is_published */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300"
                    />
                    <div className="text-start">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        {isAr ? 'منشور للطلاب' : 'Published'}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        {isAr ? 'متاح لطلاب المرحلة' : 'Visible to enrolled'}
                      </span>
                    </div>
                  </label>

                  {/* is_public */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300"
                    />
                    <div className="text-start">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        {isAr ? 'الصفحة الرئيسية' : 'Public Homepage'}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        {isAr ? 'عرض للزوار بالخارج' : 'Public catalog'}
                      </span>
                    </div>
                  </label>

                  {/* is_featured */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300"
                    />
                    <div className="text-start">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        {isAr ? 'كورس مميز' : 'Featured'}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        {isAr ? 'شارة تمييز خاصة' : 'Featured badge'}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Status & Sort Order */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                      {isAr ? 'الحالة العامة' : 'Status'}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2 px-3 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                    >
                      <option value="PUBLISHED">{isAr ? 'نشط / منشور (PUBLISHED)' : 'PUBLISHED'}</option>
                      <option value="DRAFT">{isAr ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
                      <option value="ARCHIVED">{isAr ? 'مؤرشف (ARCHIVED)' : 'ARCHIVED'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 text-start">
                      {isAr ? 'ترتيب الظهور' : 'Sort Order'}
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                      className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2 px-3 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors text-start"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: 16:9 Thumbnail Uploader & Live Card Preview (5 Columns) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Thumbnail Action Box */}
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                      {isAr ? 'صورة غلاف الكورس (16:9)' : 'Course Thumbnail (16:9)'}
                    </span>

                    {localPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        title={isAr ? 'إزالة الصورة' : 'Remove Image'}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إزالة' : 'Remove'}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCropperOpen(true)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-brand-600 dark:hover:border-brand-500 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>
                      {localPreviewUrl
                        ? isAr
                          ? 'تغيير واقتصاص الصورة'
                          : 'Change & Crop Thumbnail'
                        : isAr
                        ? 'اختيار واقتصاص صورة الغلاف'
                        : 'Select & Crop Thumbnail'}
                    </span>
                  </button>

                  <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                    {isAr
                      ? 'يتم تخزين صور الكورسات في Google Drive الخاص بالمنصة بنسبة 16:9'
                      : 'Course images are stored securely on Google Drive with 16:9 ratio'}
                  </p>
                </div>

                {/* Live Card Preview Box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {isAr ? 'معاينة حية لشكل الكورس' : 'Live Course Preview'}
                    </span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                      {isAr ? 'تحديث فوري' : 'Live Sync'}
                    </span>
                  </div>

                  <CourseCardPreview
                    titleAr={titleAr}
                    titleEn={titleEn}
                    descriptionAr={descriptionAr}
                    academicYearName={selectedYearName}
                    price={parseFloat(price) || 0}
                    discountPrice={discountPrice ? parseFloat(discountPrice) : null}
                    thumbnailUrl={localPreviewUrl}
                    status={status}
                    isPublished={isPublished}
                    isPublic={isPublic}
                    isFeatured={isFeatured}
                    isArabic={isAr}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80">
              <div className="text-xs text-neutral-500">
                {uploadProgressStatus && (
                  <span className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadProgressStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploadProgressStatus || (isAr ? 'جاري الحفظ...' : 'Saving...')}</span>
                    </>
                  ) : (
                    <span>{isEdit ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء الكورس' : 'Create Course')}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 16:9 Image Cropper Sub-Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 9}
      />
    </>
  );
}
