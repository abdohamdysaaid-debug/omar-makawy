'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  searchable = true,
  searchPlaceholder,
  onSearch,
  page = 1,
  totalPages = 1,
  totalItems,
  onPageChange,
  emptyMessage,
  headerActions,
}: DataTableProps<T>) {
  const { t, dir } = useLanguage();
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearch) onSearch(val);
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="w-full rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
      {/* Top Filter & Actions Bar */}
      {(searchable || headerActions) && (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-neutral-800">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder || t('common.search')}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 ps-9 pe-4 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          )}

          {headerActions && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs text-gray-700 dark:text-neutral-300">
          <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-600 uppercase font-semibold text-[11px] tracking-wider dark:bg-neutral-800/50 dark:border-neutral-800 dark:text-neutral-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3.5 text-start ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80 font-normal">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500 dark:text-neutral-400 text-xs"
                >
                  {emptyMessage || t('common.empty')}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  className="hover:bg-gray-50/60 transition-colors dark:hover:bg-neutral-800/40"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-start align-middle ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row, index)
                        : (row as any)[col.key] !== undefined
                        ? String((row as any)[col.key])
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <div>
            {totalItems !== undefined ? (
              <span>
                إجمالي العناصر: <strong className="text-gray-900 dark:text-neutral-200">{totalItems}</strong> (صفحة {page} من {totalPages})
              </span>
            ) : (
              <span>صفحة {page} من {totalPages}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <PrevIcon className="h-3.5 w-3.5" />
              <span>السابق</span>
            </button>

            <span className="px-3 py-1 font-semibold text-gray-800 dark:text-neutral-200">
              {page}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <span>التالي</span>
              <NextIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
