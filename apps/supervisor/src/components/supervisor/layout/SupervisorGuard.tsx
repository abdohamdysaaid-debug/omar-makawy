'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupervisorAuth } from '@/context/SupervisorAuthContext';

export function SupervisorGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useSupervisorAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/supervisor/login') {
        router.replace('/supervisor/login');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
          جاري التحقق من صلاحيات المشرف...
        </p>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/supervisor/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
          جاري التحويل إلى صفحة الدخول...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
