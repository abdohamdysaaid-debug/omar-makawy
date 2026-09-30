'use client';
import { packages } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Package } from 'lucide-react';

export default function PackagesSection() {
  const { openAuthGate, isAuthenticated } = useAuth();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      openAuthGate();
    } else {
      // Logic to continue to checkout or payment
    }
  };

  return (
    <section id="packages" className="py-16 lg:py-24 bg-warm-50 dark:bg-surface-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-cairo">الباقات المتاحة</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-cairo">
            اختر الباقة المناسبة ليك وابدأ رحلتك الآن
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`relative flex flex-col bg-white dark:bg-bg-dark border ${pkg.isPopular ? 'border-brand-500 shadow-2xl shadow-brand-500/20' : 'border-gray-200 dark:border-gray-800'} rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2`}>
              {pkg.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg font-cairo">
                  الأكثر طلباً
                </div>
              )}
              
              <div className="w-20 h-20 bg-warm-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-brand-500 mb-6 placeholder-img mx-auto">
                <Package className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2 font-cairo">{pkg.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6 h-12 font-cairo text-sm">{pkg.description}</p>
              
              <div className="text-center mb-8">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{pkg.price}</span>
                <span className="text-gray-500 dark:text-gray-400 font-cairo"> / جنيه</span>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-cairo text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={handleSubscribe}
                className={`w-full py-4 rounded-xl font-bold transition-colors font-cairo ${pkg.isPopular ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}`}
              >
                اشترك الآن
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
