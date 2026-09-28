'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
}

export default function EmptyState({ icon, title, description, actionText, actionUrl }: EmptyStateProps) {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.FileQuestion;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-3xl bg-[#faf8f5] dark:bg-[#131b2e] border border-stone-200/80 dark:border-gray-800 shadow-xs">
      <div className="w-16 h-16 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200/50 dark:border-emerald-800/50">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-md leading-relaxed">{description}</p>
      {actionText && actionUrl && (
        <Link href={actionUrl} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20">
          {actionText}
        </Link>
      )}
    </div>
  );
}
