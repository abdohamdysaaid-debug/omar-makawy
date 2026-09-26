'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  isRtl?: boolean;
}

export function Breadcrumbs({ items, isRtl = true }: BreadcrumbsProps) {
  const Separator = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-semibold text-neutral-900 dark:text-white' : ''}>
                  {item.label}
                </span>
              )}

              {!isLast && <Separator className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
