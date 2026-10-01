'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, GraduationCap, Filter, Check, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GradeOption {
  id: number | null;
  title: string;
  badge?: string;
}

export const GRADE_OPTIONS: GradeOption[] = [
  { id: null, title: 'جميع المراحل الدراسية', badge: 'الكل' },
  { id: 4, title: 'الصف الثالث الثانوي', badge: 'ثانوية عامة' },
  { id: 3, title: 'الصف الثاني الثانوي', badge: 'ثانوي' },
  { id: 2, title: 'الصف الأول الثانوي', badge: 'ثانوي' },
  { id: 1, title: 'الصف الثالث الإعدادي', badge: 'إعدادي' },
];

export interface HomeGradeFilterProps {
  selectedAcademicYearId: number | null;
  onSelectGrade: (gradeId: number | null) => void;
}

export function HomeGradeFilter({
  selectedAcademicYearId,
  onSelectGrade,
}: HomeGradeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption =
    GRADE_OPTIONS.find((opt) => opt.id === selectedAcademicYearId) || GRADE_OPTIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full pt-10 pb-4 px-4 font-cairo">
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-3">
        {/* Section Label */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
          <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <Filter className="w-4 h-4" />
          </span>
          <span>تصفية المحتوى حسب الصف الدراسي:</span>
        </div>

        {/* Dropdown Container */}
        <div className="relative w-full max-w-md" ref={dropdownRef}>
          {/* Main Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full py-3.5 px-5 rounded-2xl bg-white dark:bg-stone-900 border transition-all duration-300 shadow-md flex items-center justify-between gap-3 text-start ${
              isOpen
                ? 'border-[#0d6e4f] dark:border-emerald-500 ring-4 ring-[#0d6e4f]/10 dark:ring-emerald-500/20'
                : 'border-stone-200/90 dark:border-stone-800 hover:border-[#0d6e4f]/60 dark:hover:border-emerald-500/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#0d6e4f]/10 dark:bg-emerald-500/10 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="block text-sm font-extrabold text-[#00251e] dark:text-white truncate">
                  {activeOption.title}
                </span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {selectedAcademicYearId === null
                    ? 'يعرض جميع الكورسات والباقات والكتب'
                    : `عرض محتوى ${activeOption.title} فقط`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeOption.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0d6e4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                  {activeOption.badge}
                </span>
              )}
              <ChevronDown
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-[#0d6e4f] dark:text-emerald-400' : ''
                }`}
              />
            </div>
          </button>

          {/* Animated Options Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute z-40 start-0 end-0 mt-2 p-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl backdrop-blur-xl space-y-1"
              >
                {GRADE_OPTIONS.map((opt) => {
                  const isSelected = selectedAcademicYearId === opt.id;
                  return (
                    <button
                      key={opt.id === null ? 'all' : opt.id}
                      type="button"
                      onClick={() => {
                        onSelectGrade(opt.id);
                        setIsOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-start text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0d6e4f] text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap
                          className={`w-4 h-4 ${
                            isSelected ? 'text-white' : 'text-[#0d6e4f] dark:text-emerald-400'
                          }`}
                        />
                        <span>{opt.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {opt.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-100 dark:bg-stone-800 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Pill when a specific grade is selected */}
        {selectedAcademicYearId !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-1"
          >
            <button
              type="button"
              onClick={() => onSelectGrade(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>إظهار جميع المراحل الدراسية</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default HomeGradeFilter;
