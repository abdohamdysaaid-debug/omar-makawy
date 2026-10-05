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
  const yearId = (book as any).academic_year_id || book.academicYearId;
  const gradeMap: Record<string, number> = {
    'a0000000-0000-0000-0000-000000000001': 1,
    'a0000000-0000-0000-0000-000000000002': 2,
    'a0000000-0000-0000-0000-000000000003': 3,
  };
  const parsedGrade = gradeMap[yearId] || parseInt(String(yearId), 10);
  const academicYear = academicYears.find((y) => String(y.id) === String(yearId) || y.id === parsedGrade);

  const title = book.title || (book as any).title_ar || (book as any).title_en || 'كتاب دراسي';
  const description = book.description || (book as any).description_ar || (book as any).description_en || '';

  const rawPrice = Number((book as any).price || book.price || 0);
  const discountPrice = Number((book as any).discount_price || (book as any).discountPrice || 0);
  const price = discountPrice > 0 && discountPrice < rawPrice ? discountPrice : rawPrice;

  const stock = book.stock !== undefined ? book.stock : Number((book as any).stock_quantity ?? 1);
  const category = book.category || ((book as any).type === 'NOTE' ? 'مذكرة' : 'كتاب');
  const coverUrl = (book as any).coverImage || (book as any).cover_image_url;

  return (
    <div className="group rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden font-cairo">
      <Link
        href={`/bookstore/detail?id=${book.id}`}
        className="block relative aspect-[4/3] bg-neutral-900 overflow-hidden flex items-center justify-center"
      >
        {coverUrl ? (
          <>
            <img src={coverUrl} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          </>
        ) : (
          <BookOpen className="w-14 h-14 text-emerald-400 opacity-60 group-hover:scale-110 transition-transform duration-300" />
        )}
        <div className="absolute top-3 start-3 flex items-center gap-1.5 flex-wrap z-10">
          {academicYear && (
            <span className="bg-black/70 backdrop-blur-md text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
              {academicYear.title}
            </span>
          )}
          <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
            {category}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 space-y-3">
        <Link href={`/bookstore/detail?id=${book.id}`}>
          <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>

        {description ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        ) : null}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="font-extrabold text-base text-gray-900 dark:text-white">
            <span className="text-emerald-600 dark:text-emerald-400">{price.toLocaleString()}</span>{' '}
            <span className="text-xs text-gray-500 font-normal">جنيه</span>
          </span>

          {stock > 0 ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">متوفر</span>
          ) : (
            <span className="text-xs font-bold text-red-500">غير متوفر حالياً</span>
          )}
        </div>

        <button
          onClick={() => addItem({ ...book, title, description, price, stock, category }, 1)}
          disabled={stock === 0}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
        >
          أضف إلى السلة
        </button>
      </div>
    </div>
  );
}
