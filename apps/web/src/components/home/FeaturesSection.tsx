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
      const delta = direction === 'left' ? -290 : 290;
      const scrollAmount = isRtl ? -delta : delta;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const featureItems = [
    {
      id: 1,
      title: t('features.lecturesTitle', 'محاضرات فيديو عالية الجودة'),
      description: t('features.lecturesDesc', 'شرح تفصيلي للمنهج مع سلايدات توضيحية وأمثلة واقعية لبناء فهم عميق.'),
      image: '/assets/features/feature-3-cutout.png?v=20261001_v60'
    },
    {
      id: 2,
      title: t('features.examsTitle', 'امتحانات تفاعلية وتقييم فوري'),
      description: t('features.examsDesc', 'اختبر مستواك بعد كل درس مع إظهار الإجابات النموذجية والتحليل الفوري لأدائك.'),
      image: '/assets/features/feature-2-cutout.png?v=20261001_v60'
    },
    {
      id: 3,
      title: t('features.storeTitle', 'متجر الكتب والمذكرات'),
      description: t('features.storeDesc', 'اطلب مذكرات وكتب المنهج الرسمية تصلك حتى باب المنزل أو حملها بصيغة PDF.'),
      image: '/assets/features/feature-4-cutout.png?v=20261001_v70'
    },
    {
      id: 4,
      title: t('features.walletTitle', 'محفظة شحن كروت المنصة'),
      description: t('features.walletDesc', 'سهولة الاشتراك وشحن الحساب عبر جميع وسائل الدفع المباشرة أو المحافظ الإلكترونية.'),
      image: '/assets/features/feature-1-cutout.png?v=20261001_v80'
    }
  ];

  return (
    <section id="features" className="py-14 sm:py-20 bg-stone-50/50 dark:bg-[#0c1017] transition-colors font-cairo border-y border-stone-200/60 dark:border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-start max-w-6xl mx-auto mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight mb-2">
            لماذا تشترك <span className="bg-[#005e46]/10 text-[#005e46] dark:bg-emerald-500/20 dark:text-emerald-300 px-3 py-1 rounded-xl inline-block">في منصتنا؟</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
            {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
          </p>
        </motion.div>

        {/* Horizontal Touch Slider on Mobile / Centered 4-Column Grid on Desktop */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-proximity md:snap-none scrollbar-none scroll-smooth py-6 -mx-4 px-4 md:mx-0 md:px-0 gap-5 sm:gap-6 justify-start md:justify-center max-w-6xl mx-auto touch-pan-x touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        >
          {featureItems.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ amount: 0.55 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="snap-center shrink-0 w-[270px] sm:w-[290px] md:w-full group cursor-pointer flex flex-col rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-[#005e46]/25 dark:hover:shadow-emerald-500/20 transition-all duration-300 touch-pan-y bg-white dark:bg-[#161f2e] border border-stone-200/80 dark:border-stone-800"
              style={{ touchAction: 'pan-x pan-y' }}
            >
              {/* Top White Container with Standing Photo slipping down behind green curve */}
              <div className="relative bg-white dark:bg-[#161f2e] rounded-t-3xl pt-2 pb-0 overflow-hidden flex items-end justify-center h-52 sm:h-56 z-0">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="relative z-0 h-[195px] sm:h-[215px] w-auto object-contain object-bottom translate-y-4 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-y-1 filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)] pointer-events-none select-none"
                />
              </div>

              {/* Bottom Emerald Green Container with Title & Description */}
              <div className="bg-[#005e46] dark:bg-[#004d39] text-white rounded-t-[28px] rounded-b-[24px] p-6 text-center shadow-lg -mt-8 relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white mb-2 leading-snug tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-emerald-50 dark:text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
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
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#005e46] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#005e46] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            aria-label="Previous"
            title="السابق"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          {/* Dynamic Scroll Progress Bar */}
          <div className="relative h-2 w-14 rounded-full bg-stone-200/90 dark:bg-stone-800 overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 bottom-0 w-6 bg-[#005e46] dark:bg-emerald-500 rounded-full transition-all duration-200 ease-out shadow-sm"
              style={{
                [isRtl ? 'right' : 'left']: `${scrollProgress * 58}%`
              }}
            />
          </div>

          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-gray-700 dark:text-stone-300 flex items-center justify-center hover:bg-[#005e46] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-[#005e46] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
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

