'use client';

import React from 'react';
import { Video, FileText, BookOpen, Headphones, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FeaturesSection() {
  const { t } = useLanguage();

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
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00251e] dark:text-white tracking-tight">
            {t('features.heading', 'ما يميّزنا في منصة مستر عمر مكاوي')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
            {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="flex flex-col items-center text-center group p-6 sm:p-8 rounded-3xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0d6e4f] group-hover:text-white transition-all duration-300">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">
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
