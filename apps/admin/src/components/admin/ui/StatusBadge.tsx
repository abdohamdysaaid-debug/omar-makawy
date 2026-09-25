'use client';

import React from 'react';

type StatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PAID'
  | 'UNPAID'
  | 'REFUNDED'
  | 'BLOCKED'
  | 'SUSPENDED'
  | 'SUCCESS'
  | 'WARNING'
  | 'CRITICAL'
  | 'INFO';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase() as StatusType;

  let colorClasses = 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 border-gray-200 dark:border-neutral-700';

  switch (normalized) {
    case 'ACTIVE':
    case 'PAID':
    case 'DELIVERED':
    case 'SUCCESS':
    case 'CONFIRMED':
      colorClasses = 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800';
      break;
    case 'PENDING':
    case 'PREPARING':
    case 'SHIPPED':
    case 'WARNING':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      break;
    case 'CANCELLED':
    case 'RETURNED':
    case 'REFUNDED':
    case 'BLOCKED':
    case 'SUSPENDED':
    case 'CRITICAL':
    case 'UNPAID':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800';
      break;
    case 'INFO':
    case 'INACTIVE':
    default:
      colorClasses = 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${colorClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label || status}
    </span>
  );
}
