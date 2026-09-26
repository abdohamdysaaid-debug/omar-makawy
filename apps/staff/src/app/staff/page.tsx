'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/FeedbackStates';

export default function StaffIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/dashboard');
  }, [router]);

  return <LoadingState message="جاري التحويل إلى لوحة التحكم..." />;
}
