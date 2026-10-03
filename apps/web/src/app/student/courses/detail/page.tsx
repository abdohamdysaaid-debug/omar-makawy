'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseDetailsClient from '@/components/courses/CourseDetailsClient';

function CourseDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || searchParams.get('course_id') || '';

  return <CourseDetailsClient courseId={id} />;
}

export default function StudentCourseDetailQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CourseDetailContent />
    </Suspense>
  );
}
