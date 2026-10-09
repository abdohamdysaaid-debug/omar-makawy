'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentHomeClient from '@/components/home/StudentHomeClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroBanner from '@/components/home/HeroBanner';
import HomeGradeFilter from '@/components/home/HomeGradeFilter';
import PackagesSection from '@/components/home/PackagesSection';
import HomeCoursesSection from '@/components/home/HomeCoursesSection';
import HomeBooksSection from '@/components/home/HomeBooksSection';
import FeaturesSection from '@/components/home/FeaturesSection';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);

  // If student is authenticated, render Student Dashboard
  if (isAuthenticated) {
    return <StudentHomeClient />;
  }

  // Statically exported HTML & guest visitor view
  return (
    <main className="min-h-screen flex flex-col font-cairo bg-[#f7f6ed] dark:bg-[#020d08] text-gray-900 dark:text-stone-100 transition-colors">
      <Navbar />

      <div className="flex-1">
        {/* 1. Hero Visual Banner with Crawlable Headings */}
        <HeroBanner />

        {/* 2. Centered Grade Dropdown Filter Bar */}
        <HomeGradeFilter
          selectedAcademicYearId={selectedAcademicYearId}
          onSelectGrade={(gradeId) => setSelectedAcademicYearId(gradeId)}
        />

        {/* 4. الباقات الشهرية */}
        <PackagesSection selectedAcademicYearId={selectedAcademicYearId} />

        {/* 5. الكورسات */}
        <HomeCoursesSection selectedAcademicYearId={selectedAcademicYearId} />

        {/* 6. الكتب والمذكرات */}
        <HomeBooksSection selectedAcademicYearId={selectedAcademicYearId} />

        {/* 7. مميزات المنصة */}
        <FeaturesSection />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
