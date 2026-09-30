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
        
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div className="text-start">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
              {t('features.heading', 'ما يميّزنا في منصة مستر عمر مكاوي')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
              {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
            </p>
          </div>

          {/* Desktop Slider Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white transition-colors shadow-xs"
              aria-label="Previous"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white transition-colors shadow-xs"
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

      </div>
    </section>
  );
}
