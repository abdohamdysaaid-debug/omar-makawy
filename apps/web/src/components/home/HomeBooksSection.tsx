'use client';

import React from 'react';
import { books } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeBooksSection() {
  const { openAuthGate, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleBookClick = (bookId: number) => {
    if (!isAuthenticated) {
      openAuthGate(`/bookstore/${bookId}`);
    } else {
      window.location.href = `/bookstore/${bookId}`;
    }
  };

  const activeBooks = books.slice(0, 6);

  return (
    <section id="books" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('books.title', 'الكتب والمذكرات المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
            {t('books.subtitle', 'احصل على المذكرات والكتب الرسمية الخاصة بمنهج مستر عمر مكاوي ورقيًا أو بصيغة PDF.')}
          </p>
        </div>

        {/* Books Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activeBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book.id)}
              className="group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Top Category Badge & Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-xs px-3 py-1 rounded-full">
                  {book.category}
                </span>
                <span className="text-[#0d6e4f] dark:text-emerald-400 font-black text-sm">
                  {book.price} ج.م
                </span>
              </div>

              {/* Book Icon Cover Placeholder */}
              <div className="w-full h-36 bg-[#f4f4ee] dark:bg-stone-800/80 rounded-2xl flex items-center justify-center text-[#0d6e4f] dark:text-emerald-400 mb-5 group-hover:scale-102 transition-transform">
                <BookOpen className="w-12 h-12" />
              </div>

              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-2 mb-6 flex-1">
                {book.description}
              </p>

              <button className="w-full py-3 bg-[#e2ede5] dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-400 group-hover:text-white font-extrabold rounded-full text-xs flex items-center justify-center gap-2 transition-all">
                <ShoppingBag className="w-4 h-4" />
                <span>تصفح الكتاب والشراء</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
