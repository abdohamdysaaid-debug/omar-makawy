'use client';

import React, { useState, ReactNode } from 'react';
import { StaffHeader } from './StaffHeader';
import { StaffSidebar } from './StaffSidebar';

export function StaffLayout({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-cairo">
      {/* Sidebar */}
      <StaffSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <StaffHeader onMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
