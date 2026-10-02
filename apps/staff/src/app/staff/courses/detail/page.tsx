'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseDetailClient } from '../[id]/CourseDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

function CourseDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 font-semibold">
        معرف الكورس غير موجود أو غير صالح.
      </div>
    );
  }

  return <CourseDetailClient courseId={id} />;
}

export default function CourseDetailParamPage() {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات الكورس..." />}>
      <CourseDetailContent />
    </Suspense>
  );
}
