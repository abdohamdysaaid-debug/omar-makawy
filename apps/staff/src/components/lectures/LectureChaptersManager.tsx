'use client';

import React, { useState } from 'react';
import {
  ListOrdered,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LectureChapterItem } from '@omar-makawy/shared';

export interface ChapterDraft {
  id?: string;
  timestamp_seconds: number;
  title_ar: string;
  title_en?: string;
}

interface LectureChaptersManagerProps {
  chapters: ChapterDraft[];
  onChange: (chapters: ChapterDraft[]) => void;
  disabled?: boolean;
}

function parseTimeStringToSeconds(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  // Direct number
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  // MM:SS or HH:MM:SS
  const parts = trimmed.split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p) || p < 0)) return null;

  if (parts.length === 2) {
    const [mins, secs] = parts;
    if (secs >= 60) return null;
    return mins * 60 + secs;
  }

  if (parts.length === 3) {
    const [hours, mins, secs] = parts;
    if (mins >= 60 || secs >= 60) return null;
    return hours * 3600 + mins * 60 + secs;
  }

  return null;
}

function formatSecondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function LectureChaptersManager({
  chapters,
  onChange,
  disabled = false,
}: LectureChaptersManagerProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [timeInput, setTimeInput] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAddChapter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const cleanTitleAr = titleAr.trim();
    if (!cleanTitleAr) {
      setInputError(isAr ? 'يرجى إدخال عنوان الفصل بالعربية' : 'Arabic chapter title is required');
      return;
    }

    const seconds = parseTimeStringToSeconds(timeInput);
    if (seconds === null || seconds < 0) {
      setInputError(
        isAr
          ? 'صيغة الوقت غير صحيحة (مثال: 05:20 أو 01:15:30)'
          : 'Invalid time format (e.g. 05:20 or 01:15:30)'
      );
      return;
    }

    const newChapter: ChapterDraft = {
      timestamp_seconds: seconds,
      title_ar: cleanTitleAr,
      title_en: titleEn.trim() || undefined,
    };

    const updated = [...chapters, newChapter].sort(
      (a, b) => a.timestamp_seconds - b.timestamp_seconds
    );

    onChange(updated);

    // Reset inputs
    setTimeInput('');
    setTitleAr('');
    setTitleEn('');
  };

  const handleRemoveChapter = (indexToRemove: number) => {
    const updated = chapters.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-neutral-200">
            {isAr ? 'فهرس المحاضرة (الفصول)' : 'Lecture Chapters & Index'}
          </h3>
        </div>
        <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full font-mono">
          {chapters.length} {isAr ? 'فصل' : 'chapters'}
        </span>
      </div>

      {/* Add Chapter Form */}
      <div className="bg-[#121814] p-3.5 rounded-xl border border-neutral-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          {/* Timestamp */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              {isAr ? 'وقت البداية' : 'Start Time'}
            </label>
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="05:20"
              disabled={disabled}
              className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Title AR */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400">
              {isAr ? 'عنوان الفصل بالعربي *' : 'Arabic Title *'}
            </label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={isAr ? 'شرح القاعدة الأولى' : 'Chapter title in Arabic'}
              disabled={disabled}
              className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Title EN */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400">
              {isAr ? 'العنوان بالإنجليزي' : 'English Title'}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Grammar Rule 1"
              disabled={disabled}
              dir="ltr"
              className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Add Button */}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => handleAddChapter()}
              disabled={disabled || !titleAr.trim() || !timeInput.trim()}
              className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAr ? 'إضافة' : 'Add'}
            </button>
          </div>
        </div>

        {inputError && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-950/40 p-2 rounded-lg border border-red-900/50">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* Chapters List */}
      {chapters.length > 0 ? (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {chapters.map((chapter, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#101612] border border-neutral-800 text-xs group hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="flex-shrink-0 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  {formatSecondsToTimeString(chapter.timestamp_seconds)}
                </span>
                <span className="font-semibold text-neutral-200 truncate">{chapter.title_ar}</span>
                {chapter.title_en && (
                  <span className="text-neutral-500 text-[11px] font-sans truncate" dir="ltr">
                    ({chapter.title_en})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveChapter(idx)}
                disabled={disabled}
                className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-950/40 transition-colors"
                title={isAr ? 'حذف الفصل' : 'Delete chapter'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-500 italic text-center py-3 bg-[#0d120f] rounded-xl border border-dashed border-neutral-800">
          {isAr ? 'لا يوجد فصول مضافة بعد. يمكنك تقسيم المحاضرة إلى أجزاء.' : 'No chapters added yet.'}
        </p>
      )}
    </div>
  );
}
