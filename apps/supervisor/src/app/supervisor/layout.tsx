'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { SupervisorSidebar } from '@/components/supervisor/layout/SupervisorSidebar';
import { SupervisorHeader } from '@/components/supervisor/layout/SupervisorHeader';
import { SupervisorGuard } from '@/components/supervisor/layout/SupervisorGuard';
import { useLanguage } from '@/context/LanguageContext';

export default function SupervisorAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dir } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (pathname === '/supervisor/login' || pathname === '/supervisor/login/') {
    return <>{children}</>;
  }

  return (
    <SupervisorGuard>
      <div
        dir={dir}
        className="flex min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-neutral-100 transition-colors duration-200"
      >
        <SupervisorSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
          <SupervisorHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SupervisorGuard>
  );
}
