import React, { Suspense } from 'react';
import StudentLectureDynamicClient from './StudentLectureDynamicClient';

export function generateStaticParams() {
  return [
    { id: 'detail' },
  ];
}

export default function StudentLectureDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-[#0d6e4f] border-t-transparent rounded-full" />
        </div>
      }
    >
      <StudentLectureDynamicClient />
    </Suspense>
  );
}
