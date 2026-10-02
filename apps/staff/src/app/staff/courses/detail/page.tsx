'use client';

import React, { Suspense } from 'react';
import { CourseDetailClient } from '@/components/courses/CourseDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات الكورس..." />}>
      <CourseDetailClient />
    </Suspense>
  );
}
