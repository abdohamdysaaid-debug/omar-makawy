'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { LoadingState } from '@/components/admin/ui/FeedbackStates';

export default function RootAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/admin');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingState message="جاري الدخول إلى لوحة الإدارة..." />
    </div>
  );
}
