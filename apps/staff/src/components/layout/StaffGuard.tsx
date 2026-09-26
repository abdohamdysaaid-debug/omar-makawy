'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { LoadingState } from '../ui/FeedbackStates';

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, authState } = useStaffAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (pathname !== '/staff/login') {
          router.replace('/staff/login');
        }
      } else if (user?.role === 'STUDENT') {
        router.replace('/staff/login');
      } else if (pathname === '/staff/login' || pathname === '/staff') {
        router.replace('/staff/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || authState === 'UNINITIALIZED' || authState === 'HYDRATING') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="جاري التحقق من هوية وصلاحيات الكادر التعليمي..." />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/staff/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="جاري التحويل إلى صفحة الدخول..." />
      </div>
    );
  }

  return <>{children}</>;
}
