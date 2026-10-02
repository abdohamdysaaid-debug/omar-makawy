'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StaffShippingPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {isAr ? 'أسعار وإعدادات الشحن للمحافظات' : 'Shipping Rates & Governorates'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr ? 'تحديد تكاليف وأسعار الشحن للمحافظات المصرية' : 'Configure governorate shipping fees & delivery coverage'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
          <Truck className="h-7 w-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {isAr ? 'تعريفات وأسعار الشحن' : 'Governorate Shipping Rates'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            {isAr
              ? 'إدارة جدول أسعار توصيل وشحن الكتب والمذكرات بكافة المحافظات.'
              : 'Manage delivery rates and logistics coverage per governorate.'}
          </p>
        </div>
      </div>
    </div>
  );
}
