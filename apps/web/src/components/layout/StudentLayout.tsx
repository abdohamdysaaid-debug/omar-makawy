'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 flex flex-col font-cairo transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area offset by sidebar width on desktop (lg:ms-64) */}
      <div className="flex-1 lg:ms-64 flex flex-col min-h-screen pb-20 lg:pb-8">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Responsive Bottom Navigation for Mobile Devices */}
      <MobileBottomNav />
    </div>
  );
}
