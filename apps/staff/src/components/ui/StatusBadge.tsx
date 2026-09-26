'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  isArabic?: boolean;
}

export function StatusBadge({ status, isArabic = true }: StatusBadgeProps) {
  const normalized = (status || 'INACTIVE').toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {isArabic ? 'نشط' : 'Active'}
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {isArabic ? 'منشور' : 'Published'}
        </span>
      );
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {isArabic ? 'مسودة' : 'Draft'}
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          {isArabic ? 'مؤرشف' : 'Archived'}
        </span>
      );
    case 'SUSPENDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {isArabic ? 'معلّق' : 'Suspended'}
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {isArabic ? 'محظور' : 'Blocked'}
        </span>
      );
    case 'INACTIVE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
          {isArabic ? 'غير نشط' : 'Inactive'}
        </span>
      );
  }
}
