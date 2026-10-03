import React, { Suspense } from 'react';
import { StudentLectureViewClient } from '@/components/lectures/StudentLectureViewClient';

export function generateStaticParams() {
  return [
    { id: '1', lectureId: 'detail' },
  ];
}

export default function LectureDetailsPage({
  params,
}: {
  params: { id: string; lectureId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-[#0d6e4f] border-t-transparent rounded-full" />
        </div>
      }
    >
      <StudentLectureViewClient
        lectureId={params.lectureId}
        courseId={params.id}
      />
    </Suspense>
  );
}
