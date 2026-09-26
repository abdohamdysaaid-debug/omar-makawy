'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, ChevronDown, Check, Globe } from 'lucide-react';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function AcademicYearSelector() {
  const { activeAcademicYearId, activeYear, availableYears, isGlobalScope, canChangeScope, setActiveAcademicYear } =
    useAcademicYearScope();
  const { isTeacher } = useStaffAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAr = language === 'ar';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!canChangeScope && availableYears.length === 1) {
    // Single assigned year for supervisor: render locked indicator
    const singleYear = availableYears[0];
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
        <GraduationCap className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
        <span className="max-w-[140px] truncate">{isAr ? singleYear.name_ar : singleYear.name_en}</span>
      </div>
    );
  }

  if (availableYears.length === 0 && !isTeacher) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
        <span>{isAr ? 'بدون مرحلة معينة' : 'No Stage Assigned'}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <GraduationCap className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
        <span className="max-w-[150px] truncate">
          {isGlobalScope
            ? isAr
              ? 'جميع المراحل (Global)'
              : 'All Stages (Global)'
            : activeYear
            ? isAr
              ? activeYear.name_ar
              : activeYear.name_en
            : isAr
            ? 'اختر المرحلة'
            : 'Select Stage'}
        </span>
        <ChevronDown className="h-3 w-3 text-neutral-400 transition-transform duration-150" />
      </button>

      {isOpen && (
        <div className="absolute start-0 mt-1.5 w-64 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {isAr ? 'نطاق المرحلة الدراسية' : 'Academic Scope'}
          </div>

          {/* Global Option for Teacher */}
          {isTeacher && (
            <button
              type="button"
              onClick={() => {
                setActiveAcademicYear(null);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                isGlobalScope
                  ? 'bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/60 dark:text-brand-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span className="truncate">{isAr ? 'جميع المراحل الدراسية (Global)' : 'All Academic Stages (Global)'}</span>
              </div>
              {isGlobalScope && <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
            </button>
          )}

          {isTeacher && availableYears.length > 0 && (
            <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
          )}

          {/* Available Scoped Years */}
          <div className="space-y-0.5 max-h-60 overflow-y-auto">
            {availableYears.map((year) => {
              const isSelected = activeAcademicYearId === year.id;
              return (
                <button
                  key={year.id}
                  type="button"
                  onClick={() => {
                    setActiveAcademicYear(year.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{isAr ? year.name_ar : year.name_en}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
