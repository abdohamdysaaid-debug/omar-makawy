'use client';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-brand-500 to-brand-600 overflow-hidden">
      {/* Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 whitespace-nowrap pointer-events-none select-none">
        START NOW
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 font-cairo">
          ابدأ رحلتك الآن
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-cairo">
          وتعلم الإنجليزية بطريقة مختلفة مع مستر عمر مكاوي
        </p>
        <Link href="#packages" className="inline-block bg-white text-brand-600 hover:bg-gray-50 px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-xl shadow-black/10 font-cairo">
          اختر الباقة المناسبة
        </Link>
      </div>
    </section>
  );
}
