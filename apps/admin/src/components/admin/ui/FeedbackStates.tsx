'use client';

import React from 'react';
import { Inbox, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-neutral-100">
        {title || t('common.empty')}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400 max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
      <p className="mt-3 text-xs font-medium text-gray-600 dark:text-neutral-400">
        {message || t('common.loading')}
      </p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-red-900 dark:text-red-200">
        {title || t('common.error')}
      </h3>
      {message && (
        <p className="mt-1 text-xs text-red-700 dark:text-red-300 max-w-md">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{t('common.retry')}</span>
        </button>
      )}
    </div>
  );
}
