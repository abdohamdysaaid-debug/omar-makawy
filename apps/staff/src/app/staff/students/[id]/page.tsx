import React from 'react';
import { StudentDetailClient } from './StudentDetailClient';

export function generateStaticParams() {
  return [
    { id: 'detail' },
  ];
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return <StudentDetailClient studentId={params.id} />;
}
