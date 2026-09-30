'use client';

import React, { useRef, useState } from 'react';
import { Video, FileText, BookOpen, Headphones, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
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
      badge: 'شرح مرئي 🎥',
      tag: 'متاح 24/7 ⚡',
      title: t('features.lecturesTitle', 'محاضرات فيديو عالية الجودة'),
      description: t('features.lecturesDesc', 'شرح تفصيلي للمنهج مع سيناريوهات توضيحية وأمثلة واقعية لبناء فهم عميق.'),
      icon: Video,
      gradient: 'from-[#0d6e4f] via-[#0b5c42] to-[#073b2a]',
      image: '/assets/hero/hero-visual-mobile-seamless.png?v=20260930_v5'
    },
    {
      id: 2,
      badge: 'تقييم فوري 📝',
      tag: 'تصحيح تلقائي ✨',
      title: t('features.examsTitle', 'امتحانات تفاعلية وتقييم فوري'),
      description: t('features.examsDesc', 'اختبر مستواك بعد كل درس مع إظهار الإجابات النموذجية والتحليل الفوري لأدائك.'),
      icon: FileText,
      gradient: 'from-[#073b2a] via-[#0d6e4f] to-[#0b5c42]',
      image: '/assets/hero/hero-visual-mobile-dark-seamless.png?v=20260930_v5'
    },
    {
      id: 3,
      badge: 'كتب ومذكرات 📚',
      tag: 'توصيل للمنزل 🚚',
      title: t('features.storeTitle', 'متجر الكتب والمذكرات الرسمية'),
      description: t('features.storeDesc', 'اطلب مذكرات وكتب المنهج الرسمية لتصلك حتى باب المنزل أو حملها بصيغة PDF.'),
      icon: BookOpen,
      gradient: 'from-[#0b5c42] via-[#073b2a] to-[#0d6e4f]',
      image: '/assets/hero/hero-visual-seamless.png?v=20260930_v5'
    },
    {
      id: 4,
      badge: 'متابعة شخصية 🎧',
      tag: 'دعم مباشر 💬',
      title: t('features.walletTitle', 'متابعة ودعم مستمر'),
      description: t('features.walletDesc', 'دعم فني وتدريسي مباشر للرد على كافة أسئلتكم ومساعدتكم في كل خطوة.'),
      icon: Headphones,
      gradient: 'from-[#0d6e4f] via-[#073b2a] to-[#0b5c42]',
      image: '/assets/hero/hero-visual-desktop-dark-seamless.png?v=20260930_v5'
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d6e4f]/10 dark:bg-emerald-500/10 text-[#0d6e4f] dark:text-emerald-400 font-extrabold text-xs mb-3">
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
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0.75, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ amount: 0.55 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="snap-center shrink-0 w-[270px] sm:w-[290px] md:w-full group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#0d6e4f]/25 dark:hover:shadow-emerald-500/20 hover:border-[#0d6e4f] dark:hover:border-emerald-400 transition-all duration-300 touch-pan-y"
                style={{ touchAction: 'pan-x pan-y' }}
              >
                {/* Visual Header with Mr. Omar Visual Image Banner */}
                <div className={`relative h-44 bg-gradient-to-br ${feature.gradient} p-4 flex flex-col justify-between overflow-hidden text-white`}>
                  
                  {/* Decorative Background Circles */}
                  <div className="absolute -end-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                  
                  {/* Top Badge */}
                  <div className="flex items-center justify-between relative z-20">
                    <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                      <Icon className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{feature.badge}</span>
                    </span>
                  </div>

                  {/* Centered Mr. Omar Photo Composition */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center pt-2 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-110 filter drop-shadow-md"
                    />
                  </div>

                  {/* Bottom Tag */}
                  <div className="relative z-20 flex justify-end">
                    <span className="bg-emerald-400 text-stone-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                      {feature.tag}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between text-start">
                  <div>
                    <h3 className="text-base font-black text-[#00251e] dark:text-white mb-2 leading-snug group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed mb-4">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] font-extrabold text-[#0d6e4f] dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>ميزة معتمدة بالمنصة</span>
                    </span>
                    <ChevronLeft className={`w-4 h-4 transition-transform ${isRtl ? '' : 'rotate-180'} group-hover:-translate-x-1`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
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

