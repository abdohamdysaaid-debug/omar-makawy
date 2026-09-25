'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900 ${
        onClick ? 'cursor-pointer hover:border-brand-500/50 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-50">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-gray-100 text-xs dark:border-neutral-800">
          <span
            className={`font-semibold ${
              trend.isPositive !== false
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-gray-400 dark:text-neutral-500">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
