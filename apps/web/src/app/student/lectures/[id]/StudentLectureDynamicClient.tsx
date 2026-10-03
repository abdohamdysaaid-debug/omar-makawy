'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { StudentLectureViewClient } from '@/components/lectures/StudentLectureViewClient';

export default function StudentLectureDynamicClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawParamId = params?.id ? String(params.id) : '';
  const queryId =
    searchParams?.get('id') ||
    searchParams?.get('lectureId') ||
    searchParams?.get('lecture_id') ||
    '';

  // Use the route param ID if it's a real ID (not 'detail'), otherwise fallback to query ID
  const effectiveLectureId =
    rawParamId && rawParamId !== 'detail' ? rawParamId : queryId;

  return <StudentLectureViewClient lectureId={effectiveLectureId} />;
}
