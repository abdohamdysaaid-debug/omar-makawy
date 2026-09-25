'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { dir } = useLanguage();
  const ChevronIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <nav className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500 dark:text-neutral-400">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronIcon className="h-3.5 w-3.5 text-gray-400 mx-1 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-gray-900 dark:text-neutral-200 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
