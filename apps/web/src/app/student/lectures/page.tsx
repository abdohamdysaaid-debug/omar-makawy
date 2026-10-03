'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLecturesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/subscriptions');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="animate-spin w-8 h-8 border-4 border-[#0d6e4f] border-t-transparent rounded-full" />
    </div>
  );
}
