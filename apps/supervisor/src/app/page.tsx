'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupervisorAuth } from '@/context/SupervisorAuthContext';

export default function RootSupervisorPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSupervisorAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/supervisor');
      } else {
        router.replace('/supervisor/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
        جاري الدخول إلى بوابة المشرفين...
      </p>
    </div>
  );
}
