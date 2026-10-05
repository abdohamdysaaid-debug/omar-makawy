'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ExamRunnerClient from '@/components/exams/ExamRunnerClient';

export default function ExamRunnerDynamicClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawParamId = params?.id ? String(params.id) : '';
  const queryId = searchParams?.get('id') || searchParams?.get('examId') || searchParams?.get('exam_id') || '';

  const effectiveExamId = rawParamId && rawParamId !== 'detail' ? rawParamId : queryId;

  return <ExamRunnerClient examId={effectiveExamId} />;
}
