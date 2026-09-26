'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { LoadingState } from '../ui/FeedbackStates';

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, authState } = useStaffAuth();
  const router = useRouter();
  const pathname = usePathname();

  const normalizedPath = pathname?.replace(/\/$/, '') || '';
  const isLoginPage = normalizedPath === '/staff/login';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (!isLoginPage) {
          router.replace('/staff/login');
        }
      } else if (user?.role === 'STUDENT') {
        router.replace('/staff/login');
      } else if (isLoginPage || normalizedPath === '/staff') {
        router.replace('/staff/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, isLoginPage, normalizedPath, router]);

  if (isLoading || authState === 'UNINITIALIZED' || authState === 'HYDRATING') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="جاري التحقق من هوية وصلاحيات الكادر التعليمي..." />
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="جاري التحويل إلى صفحة الدخول..." />
      </div>
    );
  }

  return <>{children}</>;
}
