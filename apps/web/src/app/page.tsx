'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentHomeClient from '@/components/home/StudentHomeClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroBanner from '@/components/home/HeroBanner';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // If the student is authenticated, render their Student Dashboard Home
  if (isAuthenticated) {
    return <StudentHomeClient />;
  }

  // Otherwise, render the Public Platform Landing Page for visitors/guests
  return (
    <main className="min-h-screen flex flex-col font-cairo bg-[#f7f6ed] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <div className="flex-1">
        <HeroBanner />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
