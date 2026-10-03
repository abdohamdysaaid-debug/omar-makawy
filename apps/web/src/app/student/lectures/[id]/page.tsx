import React, { Suspense } from 'react';
import { StudentLectureViewClient } from '@/components/lectures/StudentLectureViewClient';

export function generateStaticParams() {
  return [
    { id: 'detail' },
  ];
}

export default function StudentLectureDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <StudentLectureViewClient lectureId={params.id} />
    </Suspense>
  );
}
