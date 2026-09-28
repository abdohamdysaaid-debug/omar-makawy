'use client';

import React from 'react';
import Link from 'next/link';
import { Book as BookType } from '@/types';
import { academicYears } from '@/data/mock';
import { BookOpen } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface BookCardProps {
  book: BookType;
}

export default function BookCard({ book }: BookCardProps) {
  const { addItem } = useCart();
  const academicYear = academicYears.find((y) => y.id === book.academicYearId);

  return (
    <div className="group rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      <Link
        href={`/bookstore/${book.id}`}
        className="block relative aspect-[4/3] bg-gradient-to-br from-emerald-800 to-gray-900 overflow-hidden flex items-center justify-center p-4"
      >
        <BookOpen className="w-14 h-14 text-emerald-400 opacity-60 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 start-3 flex items-center gap-1.5 flex-wrap">
          {academicYear && (
            <span className="bg-black/70 backdrop-blur-md text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
              {academicYear.title}
            </span>
          )}
          <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
            {book.category}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 space-y-3">
        <Link href={`/bookstore/${book.id}`}>
          <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {book.title}
          </h3>
        </Link>

        {book.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {book.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="font-extrabold text-base text-gray-900 dark:text-white">
            <span className="text-emerald-600 dark:text-emerald-400">{book.price}</span>{' '}
            <span className="text-xs text-gray-500 font-normal">جنيه</span>
          </span>

          {book.stock > 0 ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">متوفر</span>
          ) : (
            <span className="text-xs font-bold text-red-500">نفد المخزون</span>
          )}
        </div>

        <button
          onClick={() => addItem(book, 1)}
          disabled={book.stock === 0}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
        >
          أضف إلى السلة
        </button>
      </div>
    </div>
  );
}
