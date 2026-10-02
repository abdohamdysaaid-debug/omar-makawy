'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudentDetailClient } from '../[id]/StudentDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

function StudentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 font-semibold">
        معرف الطالب غير موجود أو غير صالح.
      </div>
    );
  }

  return <StudentDetailClient studentId={id} />;
}

export default function StudentDetailParamPage() {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات الطالب..." />}>
      <StudentDetailContent />
    </Suspense>
  );
}
