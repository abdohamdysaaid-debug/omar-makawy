'use client';
import { Presentation, FileText, Video, Headphones, BookOpen, Wallet, Award } from 'lucide-react';
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
      title: t('features.storeTitle', 'متجر الكتب والمذكرات'),
      description: t('features.storeDesc', 'اطلب مذكرات وكتب المنهج الرسمية لتصلك حتى باب المنزل أو حملها بصيغة PDF.'),
      icon: BookOpen
    },
    {
      id: 4,
      title: t('features.walletTitle', 'محفظة شحن كروت المنصة'),
      description: t('features.walletDesc', 'سهولة الاشتراك وشحن الحساب عبر كروت الشحن المباشرة أو المحافظ الإلكترونية.'),
      icon: Wallet
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-white dark:bg-bg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white font-cairo">
            {t('features.heading', 'لماذا تشترك في منصتنا؟')}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
            {t('features.subheading', 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex flex-col items-center text-center group p-6 rounded-3xl bg-gray-50 dark:bg-stone-900/40 border border-gray-100 dark:border-stone-800 hover:border-emerald-500/40 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-cairo">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-cairo leading-relaxed">
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
