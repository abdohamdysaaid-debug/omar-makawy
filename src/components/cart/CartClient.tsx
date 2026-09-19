'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmptyState from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, BookOpen } from 'lucide-react';

export default function CartClient() {
  const { items, totalPrice, removeItem, updateQuantity } = useCart();

  const handleCheckout = () => {
    alert('هذه نسخة تجريبية - ستتوفر عملية الدفع قريباً');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1 pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">سلة التسوق</h1>

        {items.length === 0 ? (
          <EmptyState
            icon="ShoppingCart"
            title="السلة فارغة"
            description="تصفح المتجر لإضافة بعض الكتب"
            actionText="الذهاب للمتجر"
            actionUrl="/bookstore"
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.book.id} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4 border border-gray-100 dark:border-gray-800">
                  <div className="w-24 h-24 bg-gradient-to-br from-brand-500/20 to-brand-500/5 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-10 h-10 text-brand-500 opacity-50" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-start">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{item.book.title}</h3>
                    <p className="text-brand-500 font-bold">{item.book.price} جنيه</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.book.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="إزالة"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="w-full lg:w-1/3 bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 lg:sticky lg:top-24 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalPrice} جنيه</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>الشحن</span>
                  <span className="text-sm">يحدد عند الدفع</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">الإجمالي</span>
                  <span className="font-bold text-2xl text-brand-500">{totalPrice} جنيه</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-lg font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
              >
                إتمام الشراء
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
