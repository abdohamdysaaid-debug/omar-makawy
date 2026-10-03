'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PackageDetailsClient from '@/components/packages/PackageDetailsClient';

function PackageDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || searchParams.get('package_id') || '';

  return <PackageDetailsClient packageId={id} />;
}

export default function PublicPackageDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PackageDetailContent />
    </Suspense>
  );
}
