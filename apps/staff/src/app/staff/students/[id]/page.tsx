import React, { Suspense } from 'react';
import { StudentDetailClient } from '@/components/students/StudentDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

export function generateStaticParams() {
  return [
    { id: 'detail' },
  ];
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات الطالب..." />}>
      <StudentDetailClient studentId={params.id} />
    </Suspense>
  );
}
