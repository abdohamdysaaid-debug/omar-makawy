'use client';

import React, { useRef, useState } from 'react';
import { books } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, ShoppingBag, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function HomeBooksSection() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const currentScroll = Math.abs(scrollLeft);
        const progress = Math.min(Math.max(currentScroll / maxScroll, 0), 1);
        setScrollProgress(progress);
      }
    }
  };

  const handleBookClick = (bookId: number) => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(`/bookstore/${bookId}`)}`;
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
    <section id="books" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center sm:text-start mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('books.title', 'الكتب والمذكرات المتاحة')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('books.subtitle', 'احصل على المذكرات والكتب الرسمية الخاصة بمنهج مستر عمر مكاوي ورقيًا أو بصيغة PDF.')}
          </p>
        </motion.div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-proximity scrollbar-none scroll-smooth py-6 -mx-4 px-4 gap-5 sm:gap-6 touch-pan-x touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        >
          {activeBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ amount: 0.55 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onClick={() => handleBookClick(book.id)}
              className="snap-center shrink-0 w-[260px] sm:w-[300px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] touch-pan-y"
              style={{ touchAction: 'pan-x pan-y' }}
            >
              {/* Top Category Badge & Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                  {book.category}
                </span>
                <span className="text-sm font-black text-[#0d6e4f] dark:text-emerald-400">
                  {book.price} ج.م
                </span>
              </div>

              {/* Book Icon Illustration */}
              <div className="w-full h-36 bg-gradient-to-br from-[#0d6e4f]/10 to-[#0d6e4f]/20 dark:from-emerald-950/40 dark:to-stone-800 rounded-2xl flex flex-col items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform">
                <BookOpen className="w-12 h-12 text-[#0d6e4f] dark:text-emerald-400 mb-1" />
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">نسخة معتمدة الأصالة</span>
              </div>

              {/* Title & Description */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-4 font-medium">
                    {book.description}
                  </p>
                </div>

                <button className="w-full py-2.5 bg-stone-50 dark:bg-stone-800 group-hover:bg-[#0d6e4f] text-gray-800 dark:text-gray-200 group-hover:text-white font-extrabold rounded-full text-xs flex items-center justify-center gap-2 transition-all">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>اطلب النسخة الآن</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Slider Controls with Dynamic Animated Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => scroll('right')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Previous"
            title="السابق"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          {/* Dynamic Scroll Progress Bar */}
          <div className="relative h-2 w-14 rounded-full bg-stone-200/90 dark:bg-stone-800 overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 bottom-0 w-6 bg-[#0d6e4f] dark:bg-emerald-500 rounded-full transition-all duration-200 ease-out shadow-sm"
              style={{
                [isRtl ? 'right' : 'left']: `${scrollProgress * 58}%`
              }}
            />
          </div>

          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Next"
            title="التالي"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
