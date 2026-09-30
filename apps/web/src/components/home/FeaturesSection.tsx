'use client';

import React, { useRef } from 'react';
import { Video, FileText, BookOpen, Headphones, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FeaturesSection() {
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -290 : 290;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const featureItems = [
    {
      id: 1,
      title: t('features.lecturesTitle', 'محاضرات فيديو عالية الجودة'),
      description: t('features.lecturesDesc', 'شرح تفصيلي للمنهج مع سيناريوهات توضيحية وأمثلة واقعية لبناء فهم عميق.'),
      icon: Video
    },
    {
      id: 2,
      title: t('features.examsTitle', 'امتحانات تفاعلية وتقييم فوري'),
      description: t('features.examsDesc', 'اختبر مستواك بعد كل درس مع إظهار الإجابات النموذجية والتحليل الفوري لأدائك.'),
      icon: FileText
    },
    {
      id: 3,
      title: t('features.storeTitle', 'متجر الكتب والمذكرات الرسمية'),
      description: t('features.storeDesc', 'اطلب مذكرات وكتب المنهج الرسمية لتصلك حتى باب المنزل أو حملها بصيغة PDF.'),
      icon: BookOpen
    },
    {
      id: 4,
      title: t('features.walletTitle', 'متابعة ودعم مستمر'),
      description: t('features.walletDesc', 'دعم فني وتدريسي مباشر للرد على كافة أسئلتكم ومساعدتكم في كل خطوة.'),
      icon: Headphones
    }
  ];

  return (
    <section id="features" className="py-14 sm:py-20 bg-white dark:bg-[#080b11] transition-colors font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center sm:text-start mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('features.heading', 'ما يميّزنا في منصة مستر عمر مكاوي')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
          </p>
        </div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth py-4 -mx-4 px-4 gap-5 sm:gap-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="snap-center shrink-0 w-[250px] sm:w-[280px] flex flex-col items-center text-center group p-6 sm:p-7 rounded-3xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#0d6e4f] group-hover:text-white transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Slider Controls (Centered International Style) */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => scroll('right')}
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Previous"
            title="السابق"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          <div className="h-1.5 w-10 rounded-full bg-stone-300/80 dark:bg-stone-800 overflow-hidden">
            <div className="h-full w-1/2 bg-[#0d6e4f] dark:bg-emerald-500 rounded-full" />
          </div>

          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Next"
            title="التالي"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
