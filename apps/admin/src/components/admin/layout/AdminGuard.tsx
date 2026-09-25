'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { LoadingState } from '../ui/FeedbackStates';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } else if (user?.role === 'STUDENT') {
        // Students are not permitted in admin portal
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="جاري التحقق من الصلاحيات الإدارية..." />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="جاري إعادة التوجيه إلى صفحة الدخول..." />
      </div>
    );
  }

  return <>{children}</>;
}
