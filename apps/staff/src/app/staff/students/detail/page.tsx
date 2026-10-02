'use client';

import React, { Suspense } from 'react';
import { StudentDetailClient } from '@/components/students/StudentDetailClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

export default function StudentDetailPage() {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل بيانات الطالب..." />}>
      <StudentDetailClient />
    </Suspense>
  );
}
