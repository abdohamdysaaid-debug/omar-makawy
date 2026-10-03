'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LectureDetailClient } from '@/components/lectures/LectureDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

function LectureDetailSearchParamsWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  return <LectureDetailClient lectureId={id} />;
}

export default function StaffLectureDetailFallbackPage() {
  return (
    <Suspense fallback={<LoadingState message="جاري التحميل..." />}>
      <LectureDetailSearchParamsWrapper />
    </Suspense>
  );
}
