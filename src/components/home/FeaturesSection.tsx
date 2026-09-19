'use client';
import { features } from '@/data/mock';
import { Presentation, FileText, Video, Headphones } from 'lucide-react';

const iconMap: Record<string, any> = {
  Presentation,
  FileText,
  Video,
  Headphones
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24 bg-white dark:bg-bg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white font-cairo">
            ماذا ستحصل مع مستر عمر مكاوي؟
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Presentation;
            return (
              <div key={feature.id} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-warm-100 dark:bg-surface-dark rounded-full flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-cairo">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-cairo leading-relaxed">
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
