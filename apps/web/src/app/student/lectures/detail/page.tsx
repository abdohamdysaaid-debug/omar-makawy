'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudentLectureViewClient } from '@/components/lectures/StudentLectureViewClient';

function LectureDetailFromQuery() {
  const searchParams = useSearchParams();
  const id =
    searchParams.get('id') ||
    searchParams.get('lectureId') ||
    searchParams.get('lecture_id') ||
    '';

  return <StudentLectureViewClient lectureId={id} />;
}

export default function StudentLectureDetailQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-[#0d6e4f] border-t-transparent rounded-full" />
        </div>
      }
    >
      <LectureDetailFromQuery />
    </Suspense>
  );
}
