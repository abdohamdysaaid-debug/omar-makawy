import React, { Suspense } from 'react';
import { CourseDetailClient } from '@/components/courses/CourseDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

export function generateStaticParams() {
  return [
    { id: 'detail' },
  ];
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات الكورس..." />}>
      <CourseDetailClient courseId={params.id} />
    </Suspense>
  );
}
