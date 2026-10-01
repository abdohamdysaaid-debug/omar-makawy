'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Globe,
  DollarSign,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  CourseItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  defaultCoursesApi,
  AcademicYear,
} from '@omar-makawy/shared';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useLanguage } from '@/context/LanguageContext';
import { CourseCardPreview } from './CourseCardPreview';

export interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseToEdit?: CourseItem | null;
}

export function CourseFormModal({
  isOpen,
  onClose,
  onSuccess,
  courseToEdit,
}: CourseFormModalProps) {
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
      if (courseToEdit) {
        setAcademicYearId(courseToEdit.academic_year_id);
        setTitleAr(courseToEdit.title_ar || '');
        setTitleEn(courseToEdit.title_en || '');
        setDescriptionAr(courseToEdit.description_ar || '');
        setDescriptionEn(courseToEdit.description_en || '');
        setThumbnailUrl(courseToEdit.thumbnail_url || '');
        setPrice(courseToEdit.price ?? 0);

        const discountVal = courseToEdit.discount_price;
        if (discountVal !== null && discountVal !== undefined && discountVal < courseToEdit.price) {
          setHasDiscount(true);
          setDiscountPrice(discountVal);
        } else {
          setHasDiscount(false);
          setDiscountPrice('');
        }

        setStatus(courseToEdit.status || 'PUBLISHED');
        setIsPublished(courseToEdit.is_published ?? true);
        setIsFeatured(courseToEdit.is_featured ?? false);
        setIsPublic(courseToEdit.is_public ?? false);
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
  }, [isOpen, courseToEdit, availableYears, activeAcademicYearId]);

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
      const res = await defaultCoursesApi.uploadThumbnail(file, academicYearId || undefined);
      if (res.url) {
        setThumbnailUrl(res.url);
      }
    } catch (err: any) {
      setImageError(
        err.message ||
          (isArabic
            ? 'تعذر رفع الصورة على السيرفر. تم احتفاظ بالمعاينة المحلية.'
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
      setSubmitError(isArabic ? 'يرجى إدخال اسم الكورس بالعربية' : 'Arabic course title is required');
      return;
    }
    if (!academicYearId) {
      setSubmitError(isArabic ? 'يرجى اختيار السنة الدراسية الكورس' : 'Academic year is required');
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setSubmitError(isArabic ? 'سعر الكورس يجب أن يكون رقماً موجباً أو 0' : 'Price must be a positive number');
      return;
    }

    let finalDiscount: number | undefined = undefined;
    if (hasDiscount) {
      const numericDiscount = Number(discountPrice);
      if (isNaN(numericDiscount) || numericDiscount < 0) {
        setSubmitError(isArabic ? 'سعر الخصم يجب أن يكون رقماً موجباً' : 'Discount price must be positive');
        return;
      }
      if (numericDiscount >= numericPrice) {
        setSubmitError(
          isArabic
            ? 'السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي للكورس'
            : 'Discounted price must be less than regular price'
        );
        return;
      }
      finalDiscount = numericDiscount;
    }

    setIsSubmitting(true);

    try {
      if (courseToEdit) {
        // Update Course
        const payload: UpdateCoursePayload = {
          title_ar: titleAr.trim(),
          title_en: titleEn.trim() || titleAr.trim(),
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          price: numericPrice,
          discount_price: finalDiscount,
          is_published: isPublished,
          is_public: isPublic,
          is_featured: isFeatured,
          status,
        };

        await defaultCoursesApi.updateCourse(courseToEdit.id, payload, academicYearId);
      } else {
        // Create Course
        const payload: CreateCoursePayload = {
          academic_year_id: academicYearId,
          title_ar: titleAr.trim(),
          title_en: titleEn.trim() || titleAr.trim(),
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          price: numericPrice,
          discount_price: finalDiscount,
          is_published: isPublished,
          is_public: isPublic,
          is_featured: isFeatured,
          status,
        };

        await defaultCoursesApi.createCourse(payload, academicYearId);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(
        err.message ||
          (isArabic
            ? 'حدث خطأ أثناء حفظ بيانات الكورس. يرجى إعادة المحاولة.'
            : 'Failed to save course data.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedYearObj = availableYears.find((y) => y.id === academicYearId);
  const selectedYearName = selectedYearObj
    ? isArabic
      ? selectedYearObj.name_ar
      : selectedYearObj.name_en
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {courseToEdit
                ? isArabic
                  ? 'تعديل بيانات الكورس'
                  : 'Edit Course'
                : isArabic
                ? 'إضافة كورس جديد'
                : 'Create New Course'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {isArabic
                ? 'قم بتعبئة بيانات الكورس وإعدادات ظهوره والخصومات'
                : 'Fill course details, homepage visibility and pricing'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Grid split into Form Inputs & Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Fields Column (7 Cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {submitError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Academic Year Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                {isArabic ? 'السنة الدراسية *' : 'Academic Year *'}
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                disabled={Boolean(courseToEdit)} // Cannot modify academic_year_id of existing course
                className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {isArabic ? year.name_ar : year.name_en}
                  </option>
                ))}
              </select>
              {courseToEdit && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  {isArabic
                    ? 'لا يمكن تغيير السنة الدراسية لكورس قائم بالفعل'
                    : 'Academic year cannot be changed after course creation'}
                </p>
              )}
            </div>

            {/* Course Title AR & EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  {isArabic ? 'اسم الكورس بالعربية *' : 'Arabic Course Title *'}
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={isArabic ? 'مثال: كورس المراجعة النهائية' : 'e.g. Final Review Course'}
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  {isArabic ? 'اسم الكورس بالإنجليزية (اختياري)' : 'English Course Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Final Revision Masterclass"
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Thumbnail / Cover Image Uploader */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                {isArabic ? 'صورة الكورس (Cover Image)' : 'Course Thumbnail'}
              </label>

              <div className="p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 text-center space-y-3">
                {thumbnailUrl ? (
                  <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm group">
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-md bg-white/90 text-neutral-900 text-xs font-bold shadow-sm hover:bg-white transition-colors"
                      >
                        {isArabic ? 'تغيير الصورة' : 'Change Image'}
                      </button>
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isArabic ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer py-4 flex flex-col items-center justify-center space-y-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {isArabic ? 'اضغط لرفع صورة الكورس' : 'Click to upload course image'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isArabic
                          ? 'نسبة أبعاد 16:9 بحجم أقل من 5 ميجابايت (PNG, JPG, WebP)'
                          : 'Aspect ratio 16:9 max 5MB (PNG, JPG, WebP)'}
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {isUploadingImage && (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{isArabic ? 'جاري رفع المعاينة...' : 'Uploading image preview...'}</span>
                  </div>
                )}

                {imageError && <p className="text-xs font-semibold text-rose-500 mt-1">{imageError}</p>}
              </div>
            </div>

            {/* Price & Discount Section */}
            <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    {isArabic ? 'سعر الكورس الأصلي (ج.م) *' : 'Regular Price (EGP) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    {isArabic ? 'هل يوجد خصم؟' : 'Has Discount?'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasDiscount(false)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                        !hasDiscount
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {isArabic ? 'لا يوجد خصم' : 'No Discount'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasDiscount(true)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                        hasDiscount
                          ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {isArabic ? 'نعم، يوجد خصم' : 'Yes, Discounted'}
                    </button>
                  </div>
                </div>
              </div>

              {hasDiscount && (
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    {isArabic ? 'السعر بعد الخصم (ج.م) *' : 'Discounted Price (EGP) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discountPrice}
                    onChange={(e) =>
                      setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="مثال: 150"
                    className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-emerald-500/50 bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required={hasDiscount}
                  />
                  {Number(discountPrice) >= Number(price) && Number(price) > 0 && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">
                      {isArabic
                        ? 'تنبيه: يجب أن يكون السعر بعد الخصم أقل من السعر الأصلي (' + price + ' ج.م)'
                        : `Warning: Discount price must be less than original price (${price} EGP)`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Course Descriptions AR & EN */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  {isArabic ? 'وصف الكورس بالعربية' : 'Arabic Description'}
                </label>
                <textarea
                  rows={3}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder={isArabic ? 'تفاصيل ومحتويات هذا الكورس...' : 'Course details...'}
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  {isArabic ? 'وصف الكورس بالإنجليزية' : 'English Description'}
                </label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="English summary..."
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Visibility & Featured Toggles */}
            <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-500" />
                {isArabic ? 'إعدادات الظهور والتمييز' : 'Visibility & Homepage Controls'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Featured Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      {isArabic ? 'هل الكورس مميز؟' : 'Featured Course'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isArabic ? 'إظهار شارة مميز' : 'Display featured badge'}
                    </span>
                  </div>
                  <button
                    type="button"
                    dir="ltr"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isFeatured ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isFeatured ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Homepage Visibility Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      {isArabic ? 'الظهور بالرئيسية' : 'Homepage Visibility'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isArabic ? 'إظهار في الصفحة العامة' : 'Show on student home'}
                    </span>
                  </div>
                  <button
                    type="button"
                    dir="ltr"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublic ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isPublic ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Status Select */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {isArabic ? 'حالة الكورس (النشر)' : 'Publishing Status'}
                </span>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setIsPublished(e.target.value === 'PUBLISHED');
                  }}
                  className="py-1.5 px-3 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="PUBLISHED">{isArabic ? 'منشور (PUBLISHED)' : 'Published'}</option>
                  <option value="DRAFT">{isArabic ? 'مسودة (DRAFT)' : 'Draft'}</option>
                  <option value="ARCHIVED">{isArabic ? 'مؤرشف (ARCHIVED)' : 'Archived'}</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-60"
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
                      {courseToEdit
                        ? isArabic
                          ? 'حفظ التعديلات'
                          : 'Save Changes'
                        : isArabic
                        ? 'إضافة الكورس'
                        : 'Create Course'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Preview Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-3 bg-neutral-50/60 dark:bg-neutral-950/40 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {isArabic ? 'معاينة شكل كارت الكورس للطلاب' : 'Live Student Card Preview'}
              </span>
            </div>

            <CourseCardPreview
              titleAr={titleAr}
              titleEn={titleEn}
              descriptionAr={descriptionAr}
              thumbnailUrl={thumbnailUrl}
              price={Number(price) || 0}
              hasDiscount={hasDiscount}
              discountPrice={hasDiscount ? Number(discountPrice) : undefined}
              academicYearName={selectedYearName}
              status={status}
              isFeatured={isFeatured}
              isPublic={isPublic}
              isArabic={isArabic}
            />

            <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
              {isArabic
                ? 'تتحدث هذه المعاينة مباشرة مع كتابتك ورفعك لصورة الكورس لتعرف تماماً كيف سيبدو الكورس للطالب'
                : 'This card updates live in real-time as you type and upload media'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
