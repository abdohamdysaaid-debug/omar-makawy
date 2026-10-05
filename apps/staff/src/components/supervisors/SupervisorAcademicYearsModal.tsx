'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  SupervisorItem,
  defaultSupervisorsApi,
} from '@omar-makawy/shared';

interface AcademicYearOption {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
}

interface SupervisorAcademicYearsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supervisor: SupervisorItem | null;
  availableAcademicYears: AcademicYearOption[];
}

export function SupervisorAcademicYearsModal({
  isOpen,
  onClose,
  onSuccess,
  supervisor,
  availableAcademicYears,
}: SupervisorAcademicYearsModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supervisor) {
      const yearIds = (supervisor.assigned_academic_years || supervisor.academic_years || []).map((y) => y.id);
      setSelectedYears(yearIds);
    } else {
      setSelectedYears([]);
    }
    setError(null);
  }, [supervisor, isOpen]);

  if (!isOpen || !supervisor) return null;

  const toggleAcademicYear = (id: string) => {
    setSelectedYears((prev) =>
      prev.includes(id) ? prev.filter((y) => y !== id) : [...prev, id]
    );
  };

  const toggleAllAcademicYears = () => {
    if (selectedYears.length === availableAcademicYears.length) {
      setSelectedYears([]);
    } else {
      setSelectedYears(availableAcademicYears.map((y) => y.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await defaultSupervisorsApi.assignAcademicYears(supervisor.id, selectedYears);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Assign academic years error:', err);
      setError(err?.response?.data?.message || err?.message || (isAr ? 'حدث خطأ أثناء حفظ المراحل الدراسية' : 'Failed to update academic years'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="w-full max-w-xl flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#111612] border border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isAr ? `المراحل المصرح بها: ${supervisor.full_name}` : `Academic Years: ${supervisor.full_name}`}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'اختر المراحل الدراسية التي يسمح لهذا المشرف بالوصول إليها وإدارتها'
                  : 'Select academic years this supervisor is authorized to access and manage'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {isAr ? 'المراحل الدراسية المتاحة:' : 'Available grades:'}
            </span>
            <button
              type="button"
              onClick={toggleAllAcademicYears}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {selectedYears.length === availableAcademicYears.length
                ? isAr
                  ? 'إلغاء تحديد الكل'
                  : 'Deselect All'
                : isAr
                ? 'تحديد كل المراحل'
                : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableAcademicYears.map((year) => {
              const isSelected = selectedYears.includes(year.id);
              return (
                <button
                  key={year.id}
                  type="button"
                  onClick={() => toggleAcademicYear(year.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all ${
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-600 text-white'
                        : 'border-neutral-300 dark:border-neutral-700 bg-transparent'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      {isAr ? year.name_ar : year.name_en}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {year.code}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedYears.length === 0 && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {isAr
                  ? 'تنبيه: لن يتمكن المشرف من رؤية أو تعديل أي كورسات أو طلاب حتى يتم تحديد مرحلة واحدة على الأقل.'
                  : 'Warning: Supervisor cannot see or manage courses/students until at least 1 grade is selected.'}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isAr ? 'حفظ المراحل' : 'Save Grades'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
