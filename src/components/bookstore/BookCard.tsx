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
  const academicYear = academicYears.find(y => y.id === book.academicYearId);

  return (
    <div className="card flex flex-col group h-full">
      <Link href={`/bookstore/${book.id}`} className="block relative aspect-[3/4] bg-gradient-to-br from-brand-500/20 to-brand-500/5 rounded-t-xl overflow-hidden flex items-center justify-center p-4">
        <BookOpen className="w-16 h-16 text-brand-500 opacity-50 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 end-3 flex flex-col gap-2">
          {academicYear && (
            <span className="bg-white/90 dark:bg-surface-dark/90 text-brand-500 text-xs px-2 py-1 rounded font-bold shadow-sm">
              {academicYear.title}
            </span>
          )}
          <span className="bg-warm-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded shadow-sm text-center">
            {book.category}
          </span>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/bookstore/${book.id}`}>
          <h3 className="font-bold text-lg mb-1 group-hover:text-brand-500 transition-colors line-clamp-1">{book.title}</h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
          {book.description}
        </p>
        <div className="flex items-center justify-between mt-auto mb-4">
          <span className="font-bold text-xl text-brand-500">{book.price} جنيه</span>
          {book.stock > 0 ? (
            <span className="text-sm text-brand-400">متوفر</span>
          ) : (
            <span className="text-sm text-red-500">نفد المخزون</span>
          )}
        </div>
        <button
          onClick={() => addItem(book, 1)}
          disabled={book.stock === 0}
          className="w-full py-2 px-4 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-brand-500 hover:bg-brand-400 text-white"
        >
          أضف إلى السلة
        </button>
      </div>
    </div>
  );
}
