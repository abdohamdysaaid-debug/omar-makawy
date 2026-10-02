'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StaffOrdersPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {isAr ? 'طلبات الشراء وشحن الكتب' : 'Bookstore Orders'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr ? 'متابعة طلبات شراء المذكرات والكتب وحالات الشحن' : 'Track book purchase orders & shipping statuses'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
          <ShoppingCart className="h-7 w-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {isAr ? 'إدارة الطلبات والشحن' : 'Bookstore Orders Ledger'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            {isAr
              ? 'متابعة وتجهيز طلبيات شحن الكتب والمذكرات للطلاب.'
              : 'Fulfill & manage student book shipping orders.'}
          </p>
        </div>
      </div>
    </div>
  );
}
