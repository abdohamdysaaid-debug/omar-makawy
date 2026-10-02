import React from 'react';
import { CourseDetailClient } from './CourseDetailClient';

export function generateStaticParams() {
  return [
    { id: 'detail' },
    { id: '86650dd2-e317-4e75-966c-17ce54b622cd' },
  ];
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return <CourseDetailClient courseId={params.id} />;
}
