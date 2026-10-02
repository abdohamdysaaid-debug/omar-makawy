'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Building,
} from 'lucide-react';
import {
  StudentDetail,
  UpdateStudentPayload,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { createStudentsApi, createAuthApi } from '@omar-makawy/shared';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { usePermissions } from '@/hooks/usePermissions';

const staffStudentsApi = createStudentsApi(staffApiClient);
const staffAuthApi = createAuthApi(staffApiClient);

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetail | null;
  onSuccess: (updated: StudentDetail) => void;
  isArabic?: boolean;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
  isArabic = true,
}: EditStudentModalProps) {
  const { availableYears } = useAcademicYearScope();
  const { isTeacher } = usePermissions();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [governorateId, setGovernorateId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');

  const [governorates, setGovernorates] = useState<
    Array<{ id: string; code: string; name_ar: string; name_en: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      staffAuthApi
        .getGovernorates()
        .then((data) => setGovernorates(data))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      setFullName(student.full_name || '');
      setPhone(student.phone || '');
      setEmail(student.email || '');
      setAcademicYearId(student.academic_year_id || '');
      setGovernorateId(student.governorate_id || '');
      setSchoolName(student.school_name || '');
      setGender((student.gender as 'MALE' | 'FEMALE') || 'MALE');
      setParentPhone(student.parent_phone || '');
      setAddress(student.address || '');
      setError(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError(isArabic ? 'اسم الطالب الكامل مطلوب' : 'Full name is required');
      return;
    }
    if (!phone.trim()) {
      setError(isArabic ? 'رقم الهاتف مطلوب' : 'Phone number is required');
      return;
    }

    const payload: UpdateStudentPayload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      academic_year_id: academicYearId || undefined,
      governorate_id: governorateId || undefined,
      school_name: schoolName.trim() || undefined,
      gender,
      parent_phone: parentPhone.trim() || undefined,
      address: address.trim() || undefined,
    };

    setLoading(true);
    try {
      const updated = await staffStudentsApi.updateStudent(
        student.id,
        payload,
        student.academic_year_id || undefined
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic ? 'فشل تحديث بيانات الطالب' : 'Failed to update student details')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'تعديل بيانات الطالب' : 'Edit Student Details'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {student.full_name} ({student.phone})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'الاسم الكامل للطالب *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isArabic ? 'أدخل اسم الطالب رباعي...' : 'Enter full name...'}
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'رقم هاتف الطالب (واتساب / تسجيل) *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+2010xxxxxxxx"
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'المرحلة الدراسية *' : 'Academic Year *'}
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
              >
                <option value="">{isArabic ? 'اختر المرحلة الدراسية...' : 'Select Stage...'}</option>
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {isArabic ? year.name_ar : year.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Governorate */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'المحافظة' : 'Governorate'}
              </label>
              <select
                value={governorateId}
                onChange={(e) => setGovernorateId(e.target.value)}
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
              >
                <option value="">{isArabic ? 'اختر المحافظة...' : 'Select Governorate...'}</option>
                {governorates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {isArabic ? g.name_ar : g.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* School Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'اسم المدرسة' : 'School Name'}
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder={isArabic ? 'مدرسة المتفوقين...' : 'School name...'}
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'النوع' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-semibold text-neutral-900 dark:text-white focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
              >
                <option value="MALE">{isArabic ? 'ذكر (طالب)' : 'Male'}</option>
                <option value="FEMALE">{isArabic ? 'أنثى (طالبة)' : 'Female'}</option>
              </select>
            </div>

            {/* Parent Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'هاتف ولي الأمر' : 'Parent Phone'}
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+2010xxxxxxxx"
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {isArabic ? 'العنوان' : 'Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isArabic ? 'المنطقة / المركز...' : 'Address...'}
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
