'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { books, academicYears } from '@/data/mock';
import { BookOpen, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface BookDetailsClientProps {
  bookId: string | number;
}

export default function BookDetailsClient({ bookId }: BookDetailsClientProps) {
  const { addItem } = useCart();
  const [bookData, setBookData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadBook() {
      if (!bookId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res: any = await apiClient.get(`/books/${bookId}`).catch(() => null);
        const data = res?.data || res;

        if (isMounted && data && data.id) {
          setBookData(data);
          setLoading(false);
          return;
        }
      } catch {
        // ignore and fallback
      }

      if (isMounted) {
        const fallbackBook = books.find(b => String(b.id) === String(bookId));
        setBookData(fallbackBook || null);
        setLoading(false);
      }
    }

    loadBook();

    return () => {
      isMounted = false;
    };
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1 pt-24 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-16 flex-1 pt-28 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الكتاب غير موجود</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md">
            عفواً، الكتاب أو المذكرة المطلوبة غير متوفرة أو ربما تم إزالتها.
          </p>
          <Link
            href="/bookstore"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للمكتبة</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const title = bookData.title || bookData.title_ar || bookData.title_en || 'كتاب دراسي';
  const description = bookData.description || bookData.description_ar || bookData.description_en || '';
  
  const rawPrice = Number(bookData.price || 0);
  const discountPrice = Number(bookData.discount_price || bookData.discountPrice || 0);
  const price = discountPrice > 0 && discountPrice < rawPrice ? discountPrice : rawPrice;

  const stock = bookData.stock !== undefined ? bookData.stock : Number(bookData.stock_quantity ?? 1);
  const category = bookData.category || (bookData.type === 'NOTE' ? 'مذكرة' : 'كتاب');
  const coverUrl = bookData.coverImage || bookData.cover_image_url;

  const yearId = bookData.academic_year_id || bookData.academicYearId;
  const gradeMap: Record<string, number> = {
    'a0000000-0000-0000-0000-000000000001': 1,
    'a0000000-0000-0000-0000-000000000002': 2,
    'a0000000-0000-0000-0000-000000000003': 3,
  };
  const parsedGrade = gradeMap[yearId] || parseInt(String(yearId), 10);
  const academicYear = academicYears.find((y) => String(y.id) === String(yearId) || y.id === parsedGrade);

  const handleAdd = () => {
    addItem({ ...bookData, title, description, price, stock, category }, quantity);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 pt-28">
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto border border-gray-100 dark:border-gray-800">
          {/* Image Side */}
          <div className="md:w-1/2 bg-gradient-to-br from-emerald-900 to-gray-950 aspect-square md:aspect-auto p-12 flex flex-col items-center justify-center relative overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-32 h-32 text-emerald-400 opacity-50" />
            )}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {academicYear && (
                <span className="bg-black/70 backdrop-blur-md text-emerald-300 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/20">
                  {academicYear.title}
                </span>
              )}
              <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-xs px-3 py-1 rounded-full font-bold">
                {category}
              </span>
            </div>
          </div>

          {/* Details Side */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-snug">{title}</h1>
            
            {description ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-8 leading-relaxed">
                {description}
              </p>
            ) : null}

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {price.toLocaleString()} <span className="text-base text-gray-500 font-normal">جنيه</span>
              </span>
              {discountPrice > 0 && discountPrice < rawPrice ? (
                <span className="text-sm text-gray-400 line-through">{rawPrice.toLocaleString()} جنيه</span>
              ) : null}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'}`}>
                {stock > 0 ? `متوفر (${stock} قطعة)` : 'نفد المخزون'}
              </span>
            </div>

            {stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">الكمية:</span>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={stock === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>أضف إلى السلة</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
