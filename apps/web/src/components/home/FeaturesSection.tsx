'use client';

import React, { useRef, useState } from 'react';
import { Video, FileText, BookOpen, Headphones, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
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
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center sm:text-start mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('features.heading', 'ما يميّزنا في منصة مستر عمر مكاوي')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 font-medium">
            {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
          </p>
        </motion.div>

        {/* Horizontal Touch Slider */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-proximity scrollbar-none scroll-smooth py-6 -mx-4 px-4 gap-5 sm:gap-6 touch-pan-x touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        >
          {featureItems.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ amount: 0.55 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="snap-center shrink-0 w-[260px] sm:w-[280px] bg-[#f7f6ed]/60 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-lg flex flex-col justify-between touch-pan-y"
                style={{ touchAction: 'pan-x pan-y' }}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#0d6e4f]/10 dark:bg-emerald-500/10 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#00251e] dark:text-white mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
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
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
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
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#0d6e4f] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
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
