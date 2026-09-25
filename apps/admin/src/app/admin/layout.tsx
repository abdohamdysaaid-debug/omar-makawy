'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { AdminGuard } from '@/components/admin/layout/AdminGuard';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dir } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If we are on the admin login page, bypass layout shell
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div
        dir={dir}
        className="flex min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-neutral-100 transition-colors duration-200"
      >
        {/* Responsive Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Application Area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
          <AdminHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
