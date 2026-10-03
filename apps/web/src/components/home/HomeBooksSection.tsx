'use client';

import React, { useRef, useState } from 'react';
import { books } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, ShoppingBag, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export interface HomeBooksSectionProps {
  selectedAcademicYearId?: number | null;
}

export default function HomeBooksSection({ selectedAcademicYearId = null }: HomeBooksSectionProps) {
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

  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchBooks() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.omarmeckawy.com/api/v1';
        const res = await fetch(`${baseUrl}/books?is_active=true`).then((r) => r.json()).catch(() => []);
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setAvailableBooks(list);
        }
      } catch {
        if (isMounted) setAvailableBooks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchBooks();
    return () => { isMounted = false; };
  }, []);

  const booksList = Array.isArray(availableBooks) ? availableBooks : [];

  const featuredBooksList = booksList.filter((b) => b && b.is_featured);
  const displayList = featuredBooksList.length > 0 ? featuredBooksList : booksList;

  const activeBooks = displayList.filter((b) => {
    if (!b) return false;
    const yearId = b.academic_year_id || b.academicYearId;
    if (selectedAcademicYearId !== null && selectedAcademicYearId !== undefined && selectedAcademicYearId !== 0) {
      return yearId === selectedAcademicYearId || String(yearId) === String(selectedAcademicYearId);
    }
    return true;
  }).slice(0, 6);

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

        {/* Horizontal Touch Slider or Empty State */}
        {activeBooks.length > 0 ? (
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
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ amount: 0.55 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => handleBookClick(book.id)}
                className="snap-center shrink-0 w-[260px] sm:w-[300px] group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-2xl hover:shadow-[#0d6e4f]/25 dark:hover:shadow-emerald-500/20 hover:border-[#0d6e4f] dark:hover:border-emerald-400 transition-all duration-300 touch-pan-y"
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

                <div className="flex flex-col flex-1 justify-between">
                  <h3 className="text-base font-black text-gray-900 dark:text-white line-clamp-1 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {book.description}
                  </p>
                  <button className="w-full py-2 bg-[#0d6e4f] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md">
                    <span>طلب المذكرة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="w-full py-12 px-6 rounded-3xl bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا يوجد كتب حالياً</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم إضافة أي كتب أو مذكرات دراسية لهذا الصف حالياً. ستتوفر الكتب والمذكرات فور إضافتها من قبل الإدارة.
            </p>
          </div>
        )}

        {/* Bottom Slider Controls (ONLY when activeBooks > 0) */}
        {activeBooks.length > 0 && (
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
        )}

      </div>
    </section>
  );
}
