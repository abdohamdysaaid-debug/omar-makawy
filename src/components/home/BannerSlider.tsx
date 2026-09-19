'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { promotionalBanners } from '@/data/mock';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BannerSlider() {
  const activeBanners = promotionalBanners.filter(b => b.isActive);

  if (activeBanners.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-bg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          spaceBetween={30}
          slidesPerView={1}
          className="rounded-3xl overflow-hidden shadow-2xl"
          dir="rtl"
        >
          {activeBanners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-[400px] sm:h-[300px] bg-gradient-to-r from-brand-500 to-brand-400 dark:from-brand-600 dark:to-brand-800 flex items-center p-8 sm:p-12 overflow-hidden">
                {/* Decorative text */}
                <div className="absolute top-0 end-0 opacity-10 text-8xl font-black uppercase pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-white">
                  Success
                </div>
                
                <div className="relative z-10 max-w-2xl text-white">
                  <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight font-cairo">
                    {banner.title}
                  </h2>
                  <p className="text-lg sm:text-xl text-white/90 mb-8 font-cairo">
                    {banner.subtitle}
                  </p>
                  <Link href={banner.link} className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-bold transition-colors font-cairo">
                    {banner.buttonText}
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
