'use client';

import React, { useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

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
      image: '/assets/features/feature-3-cutout.png?v=20260930_v6'
    },
    {
      id: 2,
      title: t('features.examsTitle', 'امتحانات تفاعلية وتقييم فوري'),
      description: t('features.examsDesc', 'اختبر مستواك بعد كل درس مع إظهار الإجابات النموذجية والتحليل الفوري لأدائك.'),
      image: '/assets/features/feature-2-cutout.png?v=20260930_v6'
    },
    {
      id: 3,
      title: t('features.storeTitle', 'متجر الكتب والمذكرات الرسمية'),
      description: t('features.storeDesc', 'اطلب مذكرات وكتب المنهج الرسمية لتصلك حتى باب المنزل أو حملها بصيغة PDF.'),
      image: '/assets/features/feature-4-cutout.png?v=20260930_v6'
    },
    {
      id: 4,
      title: t('features.walletTitle', 'متابعة ودعم مستمر'),
      description: t('features.walletDesc', 'دعم فني وتدريسي مباشر للرد على كافة أسئلتكم ومساعدتكم في كل خطوة.'),
      image: '/assets/features/feature-1-cutout.png?v=20260930_v6'
    }
  ];

  return (
    <section id="features" className="py-14 sm:py-20 bg-[#f7f6ed]/70 dark:bg-[#0c1017] transition-colors font-cairo border-y border-stone-200/60 dark:border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center sm:text-start mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0d6e4f]/10 dark:bg-emerald-500/10 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-xs mb-3">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>لماذا تختار منصتنا؟</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('features.heading', 'ما يميّزنا في منصة مستر عمر مكاوي')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1.5 font-medium max-w-2xl">
            {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
          </p>
        </motion.div>

        {/* Horizontal Touch Slider on Mobile / Centered 4-Column Grid on Desktop */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-proximity md:snap-none scrollbar-none scroll-smooth py-6 -mx-4 px-4 md:mx-0 md:px-0 gap-5 sm:gap-6 justify-center max-w-6xl mx-auto touch-pan-x touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        >
          {featureItems.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.04, y: -8 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ amount: 0.55 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="snap-center shrink-0 w-[270px] sm:w-[290px] md:w-full group cursor-pointer flex flex-col rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-[#0d6e4f]/30 dark:hover:shadow-emerald-500/20 transition-all duration-300 touch-pan-y"
              style={{ touchAction: 'pan-x pan-y' }}
            >
              {/* Top White Container with Standing Photo emerging out */}
              <div className="relative bg-white dark:bg-[#161f2e] rounded-t-3xl pt-4 pb-0 overflow-visible flex items-end justify-center h-48 sm:h-52 border-t border-x border-stone-200/90 dark:border-stone-800">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="relative -mb-2 z-10 h-44 sm:h-48 w-auto object-contain transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.15)] pointer-events-none select-none"
                />
              </div>

              {/* Bottom Emerald Green Container with Title & Description */}
              <div className="bg-[#0d6e4f] dark:bg-[#084d37] text-white rounded-b-3xl p-5 sm:p-6 shadow-md border-b border-x border-[#0d6e4f] dark:border-emerald-700/60 flex-1 flex flex-col justify-between text-start">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white mb-2 leading-snug tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-emerald-100 dark:text-emerald-200 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Slider Controls (Mobile Only) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex md:hidden items-center justify-center gap-3"
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
