'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              isDestructive
                ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
              {title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-750"
          >
            {cancelText || t('common.cancel')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500'
            }`}
          >
            {isLoading ? t('common.loading') : confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
