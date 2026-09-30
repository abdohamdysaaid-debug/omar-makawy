'use client';

import React, { useRef } from 'react';
import { books } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, ShoppingBag, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeBooksSection() {
  const { openAuthGate, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleBookClick = (bookId: number) => {
    if (!isAuthenticated) {
      openAuthGate(`/bookstore/${bookId}`);
    } else {
      window.location.href = `/bookstore/${bookId}`;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeBooks = books.slice(0, 6);

  return (
    <section id="books" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div className="text-start">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
              {t('books.title', 'الكتب والمذكرات المتاحة')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
              {t('books.subtitle', 'احصل على المذكرات والكتب الرسمية الخاصة بمنهج مستر عمر مكاوي ورقيًا أو بصيغة PDF.')}
            </p>
          </div>

          {/* Desktop Slider Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white transition-colors shadow-xs"
              aria-label="Previous"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white transition-colors shadow-xs"
              aria-label="Next"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth py-4 -mx-4 px-4 gap-5 sm:gap-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book.id)}
              className="snap-center shrink-0 w-[260px] sm:w-[300px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Top Category Badge & Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                  {book.category}
                </span>
                <span className="text-[#0d6e4f] dark:text-emerald-400 font-black text-xs sm:text-sm">
                  {book.price} ج.م
                </span>
              </div>

              {/* Book Icon Cover Placeholder */}
              <div className="w-full h-32 bg-[#f4f4ee] dark:bg-stone-800/80 rounded-2xl flex items-center justify-center text-[#0d6e4f] dark:text-emerald-400 mb-4 group-hover:scale-102 transition-transform">
                <BookOpen className="w-10 h-10" />
              </div>

              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-2 mb-5 flex-1">
                {book.description}
              </p>

              <button className="w-full py-2.5 bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white font-extrabold rounded-full text-xs flex items-center justify-center gap-2 transition-all">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>تصفح الكتاب والشراء</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
