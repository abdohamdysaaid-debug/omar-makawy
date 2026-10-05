'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Upload,
  Package as PackageIcon,
  DollarSign,
  Sparkles,
  Globe,
  FileText,
  Trash2,
  BookOpen,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import {
  PackageItem,
  CreatePackagePayload,
  UpdatePackagePayload,
  CourseItem,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createCoursesApi, createPackagesApi } from '@omar-makawy/shared';
import { PackageCardPreview } from './PackageCardPreview';
import { ImageCropperModal } from '../courses/ImageCropperModal';

const staffCoursesApi = createCoursesApi(staffApiClient);
const staffPackagesApi = createPackagesApi(staffApiClient);

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pkg: PackageItem) => void;
  initialPackage?: PackageItem | null;
}

export function PackageFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialPackage = null,
}: PackageFormModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const isEdit = Boolean(initialPackage);

  // Form Fields
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [price, setPrice] = useState<string>('0');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [status, setStatus] = useState<string>('PUBLISHED');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // Thumbnail
  const [currentServerThumbnail, setCurrentServerThumbnail] = useState<string | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);

  // Courses
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(false);
  const [courseSearch, setCourseSearch] = useState<string>('');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setErrorMessage(null);
      setUploadProgressStatus(null);
      setPendingCropFile(null);
      setCourseSearch('');

      if (initialPackage) {
        setAcademicYearId(initialPackage.academic_year_id);
        setTitleAr(initialPackage.title_ar || '');
        setTitleEn(initialPackage.title_en || '');
        setDescriptionAr(initialPackage.description_ar || '');
        setDescriptionEn(initialPackage.description_en || '');
        setPrice(String(initialPackage.price ?? 0));
        setDiscountPrice(
          initialPackage.discount_price != null ? String(initialPackage.discount_price) : ''
        );
        setStatus(initialPackage.status || 'PUBLISHED');
        setIsPublished(initialPackage.is_published ?? true);
        setIsPublic(initialPackage.is_public ?? false);
        setIsFeatured(initialPackage.is_featured ?? false);
        setCurrentServerThumbnail(initialPackage.thumbnail_url || null);
        setLocalPreviewUrl(initialPackage.thumbnail_url || null);
        setSelectedCourseIds(
          initialPackage.courses?.map((c) => c.course_id) || []
        );
      } else {
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
        setCurrentServerThumbnail(null);
        setLocalPreviewUrl(null);
        setSelectedCourseIds([]);
      }
    }
  }, [isOpen, initialPackage, activeAcademicYearId, availableYears]);

  // Fetch courses when academic year changes
  const fetchCourses = useCallback(async (yearId: string) => {
    if (!yearId) {
      setAvailableCourses([]);
      return;
    }
    setCoursesLoading(true);
    try {
      const res = await staffCoursesApi.listCourses(
        { academic_year_id: yearId, limit: 100 },
        yearId
      );
      const coursesList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : (res as any)?.items || (res as any)?.courses || [];
      setAvailableCourses(coursesList);
    } catch {
      setAvailableCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && academicYearId) {
      fetchCourses(academicYearId);
    }
  }, [isOpen, academicYearId, fetchCourses]);

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

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanTitleAr = titleAr.trim();
    if (!cleanTitleAr) {
      setErrorMessage(isAr ? 'يرجى إدخال اسم الباقة بالعربية' : 'Arabic title is required');
      return;
    }
    if (!isEdit && !academicYearId) {
      setErrorMessage(isAr ? 'يرجى اختيار المرحلة الدراسية' : 'Academic year is required');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage(isAr ? 'يرجى إدخال سعر صحيح (0 أو أكثر)' : 'Price must be >= 0');
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
          isAr ? 'لا يمكن أن يتجاوز سعر الخصم السعر الأصلي' : 'Discount cannot exceed price'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let finalThumbnailUrl: string | undefined = currentServerThumbnail || undefined;

      if (pendingCropFile) {
        setUploadProgressStatus(
          isAr ? 'جاري رفع صورة الغلاف...' : 'Uploading thumbnail...'
        );
        const targetYear = isEdit ? initialPackage!.academic_year_id : academicYearId;
        const uploadRes = await staffPackagesApi.uploadThumbnail(pendingCropFile, targetYear);
        if (!uploadRes?.url) {
          throw new Error(isAr ? 'فشل رفع الصورة' : 'Upload failed');
        }
        finalThumbnailUrl = uploadRes.url;
      } else if (currentServerThumbnail === null && isEdit) {
        finalThumbnailUrl = '';
      }

      setUploadProgressStatus(isAr ? 'جاري حفظ بيانات الباقة...' : 'Saving package...');

      if (isEdit && initialPackage) {
        const payload: UpdatePackagePayload = {
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
          thumbnail_url: finalThumbnailUrl,
        };

        const updated = await staffPackagesApi.updatePackage(
          initialPackage.id,
          payload,
          initialPackage.academic_year_id
        );

        // Sync courses: find added and removed
        const existingIds = initialPackage.courses?.map((c) => c.course_id) || [];
        const toAdd = selectedCourseIds.filter((id) => !existingIds.includes(id));
        const toRemove = existingIds.filter((id) => !selectedCourseIds.includes(id));

        if (toAdd.length > 0) {
          await staffPackagesApi.attachCourses(initialPackage.id, toAdd, initialPackage.academic_year_id);
        }
        for (const cid of toRemove) {
          await staffPackagesApi.removeCourse(initialPackage.id, cid, initialPackage.academic_year_id);
        }

        onSuccess(updated);
      } else {
        const payload: CreatePackagePayload = {
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
          thumbnail_url: finalThumbnailUrl,
          course_ids: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
        };

        const created = await staffPackagesApi.createPackage(payload, academicYearId);
        onSuccess(created);
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isAr ? 'حدث خطأ أثناء حفظ الباقة' : 'Failed to save package')
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgressStatus(null);
    }
  };

  const selectedYearObj = availableYears.find((y) => y.id === academicYearId);
  const selectedYearName = isAr ? selectedYearObj?.name_ar : selectedYearObj?.name_en;

  const filteredCourses = availableCourses.filter((c) => {
    if (!courseSearch.trim()) return true;
    const s = courseSearch.trim().toLowerCase();
    return (
      c.title_ar?.toLowerCase().includes(s) ||
      c.title_en?.toLowerCase().includes(s)
    );
  });

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
                <PackageIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  {isEdit
                    ? isAr ? 'تعديل الباقة' : 'Edit Package'
                    : isAr ? 'إضافة باقة جديدة' : 'Create Package'}
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {isAr ? 'أدخل تفاصيل الباقة والكورسات المضمنة' : 'Enter package details and included courses'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[75vh]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-3 space-y-5">
                {/* Error */}
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3">
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-300">{errorMessage}</p>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgressStatus && (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3">
                    <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{uploadProgressStatus}</p>
                  </div>
                )}

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'المرحلة الدراسية *' : 'Academic Year *'}
                  </label>
                  <select
                    value={academicYearId}
                    onChange={(e) => {
                      setAcademicYearId(e.target.value);
                      setSelectedCourseIds([]);
                    }}
                    disabled={isEdit || isSubmitting}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  >
                    <option value="">{isAr ? 'اختر المرحلة' : 'Select Year'}</option>
                    {availableYears.map((y) => (
                      <option key={y.id} value={y.id}>
                        {isAr ? y.name_ar : y.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title Arabic */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'اسم الباقة بالعربي *' : 'Arabic Title *'}
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    disabled={isSubmitting}
                    placeholder={isAr ? 'مثال: باقة الترم الأول' : 'e.g. First Term Package'}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  />
                </div>

                {/* Title English */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'اسم الباقة بالإنجليزي (اختياري)' : 'English Title (optional)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  />
                </div>

                {/* Description Arabic */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'الوصف بالعربي (اختياري)' : 'Arabic Description (optional)'}
                  </label>
                  <textarea
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    disabled={isSubmitting}
                    rows={2}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isAr ? 'السعر (ج.م) *' : 'Price (EGP) *'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {isAr ? 'سعر الخصم (اختياري)' : 'Discount Price'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      disabled={isSubmitting}
                      placeholder={isAr ? 'اتركه فارغ إن لم يوجد' : 'Leave empty if none'}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  >
                    <option value="PUBLISHED">{isAr ? 'منشور' : 'Published'}</option>
                    <option value="DRAFT">{isAr ? 'مسودة' : 'Draft'}</option>
                    <option value="ARCHIVED">{isAr ? 'مؤرشف' : 'Archived'}</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                        {isAr ? 'حالة النشر (مرئية للطلاب في صفحة الباقات)' : 'Published (visible to students in packages catalog)'}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isAr ? 'عند التفعيل، تظهر الباقة في صفحة باقات الطلاب تلقائياً' : 'When enabled, package appears in Student Packages page'}
                      </span>
                    </div>
                    <button type="button" onClick={() => setIsPublished(!isPublished)} disabled={isSubmitting} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isPublished ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isPublished ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                        {isAr ? 'إظهار الباقة في الصفحة الرئيسية' : 'Show on homepage'}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isAr ? 'إلغاء هذا الخيار يخفي الباقة من الصفحة الرئيسية فقط، وتبقى متاحة في صفحة الباقات' : 'Hiding from homepage does not affect student packages catalog'}
                      </span>
                    </div>
                    <button type="button" onClick={() => setIsPublic(!isPublic)} disabled={isSubmitting} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isPublic ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                        {isAr ? 'باقة مميزة' : 'Featured Package'}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isAr ? 'عرض شارة "الأكثر طلباً" على كارت الباقة' : 'Displays "Most Popular" badge on package card'}
                      </span>
                    </div>
                    <button type="button" onClick={() => setIsFeatured(!isFeatured)} disabled={isSubmitting} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isFeatured ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isFeatured ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </label>
                </div>

                {/* Thumbnail */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    {isAr ? 'صورة الغلاف (16:9)' : 'Cover Image (16:9)'}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {localPreviewUrl
                        ? isAr ? 'تغيير الصورة' : 'Change Image'
                        : isAr ? 'اختيار صورة' : 'Select Image'}
                    </button>
                    {localPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isAr ? 'حذف' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Course Selector */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    {isAr
                      ? `اختيار الكورسات (${selectedCourseIds.length} مختار)`
                      : `Select Courses (${selectedCourseIds.length} selected)`}
                  </label>

                  {/* Course Search */}
                  <div className="relative mb-3">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder={isAr ? 'بحث في الكورسات...' : 'Search courses...'}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 ps-9 pe-3 py-2 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {coursesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                    </div>
                  ) : !academicYearId ? (
                    <p className="text-xs text-neutral-400 text-center py-4">
                      {isAr ? 'اختر المرحلة الدراسية أولاً' : 'Select academic year first'}
                    </p>
                  ) : filteredCourses.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-4">
                      {isAr ? 'لا توجد كورسات لهذه المرحلة' : 'No courses for this year'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700 p-2 bg-neutral-50 dark:bg-neutral-800/50">
                      {filteredCourses.map((course) => {
                        const isSelected = selectedCourseIds.includes(course.id);
                        return (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => toggleCourse(course.id)}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-start transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                            } disabled:opacity-50`}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-neutral-300 dark:border-neutral-600'
                            }`}>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                {course.title_ar}
                              </p>
                              {course.price != null && (
                                <p className="text-[10px] text-neutral-400">
                                  {course.price} {isAr ? 'ج.م' : 'EGP'}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Live Preview */}
              <div className="lg:col-span-2">
                <div className="sticky top-0">
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-3 text-center">
                    {isAr ? 'معاينة مباشرة' : 'Live Preview'}
                  </p>
                  <PackageCardPreview
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
                    coursesCount={selectedCourseIds.length}
                    isArabic={isAr}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-5 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEdit
                  ? isAr ? 'حفظ التعديلات' : 'Save Changes'
                  : isAr ? 'إنشاء الباقة' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 9}
      />
    </>
  );
}
