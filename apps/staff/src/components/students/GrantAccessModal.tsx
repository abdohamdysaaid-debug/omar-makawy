'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  BookOpen,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  StudentDetail,
  AdminGrantAccessPayload,
  AdminGrantAccessResponse,
  createStudentsApi,
  createPackagesApi,
  createCoursesApi,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';

const staffStudentsApi = createStudentsApi(staffApiClient);
const staffPackagesApi = createPackagesApi(staffApiClient);
const staffCoursesApi = createCoursesApi(staffApiClient);

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetail | null;
  onSuccess: (res: AdminGrantAccessResponse) => void;
  isArabic?: boolean;
}

export function GrantAccessModal({
  isOpen,
  onClose,
  student,
  onSuccess,
  isArabic = true,
}: GrantAccessModalProps) {
  const [itemType, setItemType] = useState<'PACKAGE' | 'COURSE'>('PACKAGE');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [customDays, setCustomDays] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const [itemsLoading, setItemsLoading] = useState<boolean>(false);
  const [packages, setPackages] = useState<Array<{ id: string; title_ar: string; package_type: string; duration_days: number }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title_ar: string }>>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !student) return;

    let isMounted = true;
    setItemsLoading(true);
    setError(null);
    setSelectedItemId('');
    setCustomDays('');
    setReason('');

    const loadItems = async () => {
      try {
        const academicYearId = student.academic_year_id || undefined;
        const [pkgsRes, coursesRes] = await Promise.all([
          staffPackagesApi.listPackages({ academic_year_id: academicYearId, limit: 100 }, academicYearId),
          staffCoursesApi.listCourses({ academic_year_id: academicYearId, limit: 100 }, academicYearId),
        ]);

        if (isMounted) {
          setPackages(
            (pkgsRes?.data || []).map((p: any) => ({
              id: p.id,
              title_ar: p.title_ar || p.title || 'باقة بدون اسم',
              package_type: p.package_type,
              duration_days: p.duration_days,
            }))
          );
          setCourses(
            (coursesRes?.data || []).map((c: any) => ({
              id: c.id,
              title_ar: c.title_ar || c.title || 'كورس بدون اسم',
            }))
          );
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message ||
              (isArabic ? 'فشل تحميل قائمة الباقات والكورسات' : 'Failed to load packages and courses')
          );
        }
      } finally {
        if (isMounted) setItemsLoading(false);
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [isOpen, student, isArabic]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      setError(
        isArabic
          ? itemType === 'PACKAGE'
            ? 'يرجى اختيار الباقة المراد تفعيلها'
            : 'يرجى اختيار الكورس المراد تفعيله'
          : 'Please select an item to grant access'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: AdminGrantAccessPayload = {
        item_type: itemType,
        item_id: selectedItemId,
        custom_duration_days: customDays.trim() ? parseInt(customDays, 10) : undefined,
        reason: reason.trim() || undefined,
      };

      const res = await staffStudentsApi.grantStudentAccess(
        student.id,
        payload,
        student.academic_year_id || undefined
      );

      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic
            ? 'فشل تفعيل المحتوى للطالب، يرجى التحقق والمحاولة مجدداً'
            : 'Failed to grant access to student')
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selectedItemId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-neutral-800 bg-[#101412] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isArabic ? 'تفعيل باقة / كورس للطالب' : 'Grant Package / Course Access'}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isArabic ? `للطالب: ${student.full_name}` : `For student: ${student.full_name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Type Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              {isArabic ? 'نوع المحتوى المراد تفعيله' : 'Content Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setItemType('PACKAGE');
                  setSelectedItemId('');
                }}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  itemType === 'PACKAGE'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-[#171d19] text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>{isArabic ? 'باقة تعليمية' : 'Package'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType('COURSE');
                  setSelectedItemId('');
                }}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  itemType === 'COURSE'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-[#171d19] text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>{isArabic ? 'كورس فردي' : 'Course'}</span>
              </button>
            </div>
          </div>

          {/* Select Item */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              {itemType === 'PACKAGE'
                ? isArabic
                  ? 'اختر الباقة'
                  : 'Select Package'
                : isArabic
                ? 'اختر الكورس'
                : 'Select Course'}
              <span className="text-rose-400 mx-1">*</span>
            </label>
            {itemsLoading ? (
              <div className="flex items-center justify-center py-4 text-xs text-neutral-400 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <span>{isArabic ? 'جارٍ تحميل القائمة...' : 'Loading items...'}</span>
              </div>
            ) : (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
                className="w-full rounded-2xl border border-neutral-800 bg-[#171d19] px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              >
                <option value="">
                  {isArabic ? '-- اضغط للاختيار من القائمة --' : '-- Choose from list --'}
                </option>
                {itemType === 'PACKAGE'
                  ? packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title_ar}{' '}
                        {pkg.package_type === 'MONTHLY'
                          ? `(باقة شهرية - ${pkg.duration_days || 30} يوم)`
                          : `(باقة ترم)`}
                      </option>
                    ))
                  : courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title_ar}
                      </option>
                    ))}
              </select>
            )}
            {itemType === 'PACKAGE' && selectedPkg && (
              <p className="text-[11px] text-emerald-400/90 pt-1">
                {isArabic
                  ? `سيتم تفعيل جميع كورسات هذه الباقة تلقائياً للطالب وتمديد صلاحيتها لمدة ${
                      customDays || selectedPkg.duration_days || 30
                    } يوم.`
                  : `All courses in this package will be automatically unlocked for ${
                      customDays || selectedPkg.duration_days || 30
                    } days.`}
              </p>
            )}
          </div>

          {/* Custom Duration (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                {isArabic ? 'مدة التفعيل المخصصة (بالأيام - اختياري)' : 'Custom Duration (Days - Optional)'}
              </label>
              <span className="text-[10px] text-neutral-500">
                {isArabic ? 'اتركها فارغة لاستخدام المدة الافتراضية' : 'Leave empty for default duration'}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="365"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder={
                  itemType === 'PACKAGE'
                    ? isArabic
                      ? `الافتراضي: ${selectedPkg?.duration_days || 30} يوم`
                      : `Default: ${selectedPkg?.duration_days || 30} days`
                    : isArabic
                    ? 'الافتراضي: 30 يوم'
                    : 'Default: 30 days'
                }
                className="w-full rounded-2xl border border-neutral-800 bg-[#171d19] px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
              <Calendar className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Reason / Note (Optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              {isArabic ? 'سبب التفعيل / ملاحظة للمشرف (اختياري)' : 'Reason / Note (Optional)'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isArabic ? 'مثال: تعويض عن كود تفعيل / تحويل يدوي' : 'e.g. Manual activation / voucher issue'}
              className="w-full rounded-2xl border border-neutral-800 bg-[#171d19] px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl border border-neutral-800 bg-[#171d19] text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || !selectedItemId || itemsLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-950 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isArabic ? 'جارٍ التفعيل...' : 'Activating...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isArabic ? 'تأكيد التفعيل الآن' : 'Confirm Activation'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
