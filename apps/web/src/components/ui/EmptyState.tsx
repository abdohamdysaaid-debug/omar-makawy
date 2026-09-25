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
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <div className="w-16 h-16 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-cairo text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 font-cairo mb-6 max-w-md">{description}</p>
      {actionText && actionUrl && (
        <Link href={actionUrl} className="px-6 py-2 bg-brand-500 text-white rounded-md font-cairo font-medium hover:bg-brand-600 transition-colors">
          {actionText}
        </Link>
      )}
    </div>
  );
}
