import React, { Suspense } from 'react';
import { LectureDetailClient } from '@/components/lectures/LectureDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

export function generateStaticParams() {
  return [
    { id: 'detail' },
  ];
}

export default function StaffLectureDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات المحاضرة..." />}>
      <LectureDetailClient lectureId={params.id} />
    </Suspense>
  );
}
