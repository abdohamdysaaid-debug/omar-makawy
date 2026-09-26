'use client';

import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function LoadingState({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = 'حدث خطأ غير متوقع',
  message = 'يرجى المحاولة مرة أخرى أو التحقق من الاتصال بالخادم.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي عناصر مسجلة حالياً.',
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-3">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
