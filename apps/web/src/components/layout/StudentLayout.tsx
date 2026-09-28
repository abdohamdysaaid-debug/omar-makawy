'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-[#f6f8f5] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 flex flex-col font-cairo transition-colors duration-300 overflow-x-hidden">
      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main App Layout Container offset by sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col min-h-screen pb-20 lg:pb-8 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ms-20' : 'lg:ms-64'
        }`}
      >
        <Header
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Centered Dashboard Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300">
          {children}
        </main>
      </div>

      {/* Responsive Bottom Navigation for Mobile Devices */}
      <MobileBottomNav />
    </div>
  );
}
