'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { LoadingState } from '@/components/ui/FeedbackStates';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/staff/dashboard');
      } else {
        router.replace('/staff/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
      <LoadingState message="جاري توجيهك إلى البوابة..." />
    </div>
  );
}
