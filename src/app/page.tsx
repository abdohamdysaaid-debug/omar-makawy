import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroBanner from '@/components/home/HeroBanner';
import AcademicYearSection from '@/components/home/AcademicYearSection';
import BannerSlider from '@/components/home/BannerSlider';
import PackagesSection from '@/components/home/PackagesSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen pb-20 lg:pb-0 flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <HeroBanner />
        <AcademicYearSection />
        <BannerSlider />
        <PackagesSection />
        <FeaturesSection />
        <CTASection />
      </div>
      
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
