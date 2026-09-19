'use client';

import React, { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { books, academicYears } from '@/data/mock';
import { BookOpen, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function BookDetailsPage() {
  const params = useParams();
  const bookId = Number(params.id);
  const book = books.find(b => b.id === bookId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!book) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1 pt-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الكتاب غير موجود</h1>
        </main>
        <Footer />
      </div>
    );
  }

  const academicYear = academicYears.find(y => y.id === book.academicYearId);

  const handleAdd = () => {
    addItem(book, quantity);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1 pt-24">
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto border border-gray-100 dark:border-gray-800">
          {/* Image Side */}
          <div className="md:w-1/2 bg-gradient-to-br from-brand-500/20 to-brand-500/5 aspect-square md:aspect-auto p-12 flex flex-col items-center justify-center relative">
            <BookOpen className="w-32 h-32 text-brand-500 opacity-50" />
            <div className="absolute top-4 right-4 flex gap-2">
              {academicYear && (
                <span className="bg-white/90 dark:bg-gray-800/90 text-brand-500 text-sm px-3 py-1 rounded-md font-bold shadow-sm">
                  {academicYear.title}
                </span>
              )}
              <span className="bg-warm-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-md shadow-sm">
                {book.category}
              </span>
            </div>
          </div>
          
          {/* Details Side */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{book.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
              {book.description}
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-brand-500">{book.price} جنيه</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${book.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {book.stock > 0 ? `متوفر (${book.stock} قطعة)` : 'نفد المخزون'}
              </span>
            </div>

            {book.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 dark:text-gray-300 font-bold">الكمية:</span>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    disabled={quantity >= book.stock}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={handleAdd}
              disabled={book.stock === 0}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-brand-500 hover:bg-brand-400 text-white"
            >
              <ShoppingCart className="w-6 h-6" />
              أضف إلى السلة
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
