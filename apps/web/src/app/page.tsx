'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentHomeClient from '@/components/home/StudentHomeClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroBanner from '@/components/home/HeroBanner';
import PackagesSection from '@/components/home/PackagesSection';
import HomeCoursesSection from '@/components/home/HomeCoursesSection';
import HomeBooksSection from '@/components/home/HomeBooksSection';
import FeaturesSection from '@/components/home/FeaturesSection';

export default function HomePage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fast-path: if authenticated on client initial state, immediately show Student Dashboard
  if (isAuthenticated) {
    return <StudentHomeClient />;
  }

  // Before hydration finishes or auth initialization completes, avoid flashing the visitor home page
  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen bg-[#f7f6ed] dark:bg-[#0b0f19] flex items-center justify-center font-cairo">
        <div className="w-9 h-9 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Otherwise, render the Public Platform Landing Page for visitors/guests
  return (
    <main className="min-h-screen flex flex-col font-cairo bg-[#f7f6ed] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <div className="flex-1">
        {/* 1. Hero Visual Banner */}
        <HeroBanner />

        {/* 2. الباقات الشهرية */}
        <PackagesSection />

        {/* 3. الكورسات */}
        <HomeCoursesSection />

        {/* 4. الكتب والمذكرات */}
        <HomeBooksSection />

        {/* 5. ما يميّزنا */}
        <FeaturesSection />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
