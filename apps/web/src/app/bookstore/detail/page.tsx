'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookDetailsClient from '@/components/bookstore/BookDetailsClient';

function BookDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || searchParams.get('book_id') || '';

  return <BookDetailsClient bookId={id} />;
}

export default function PublicBookDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black font-cairo">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <BookDetailContent />
    </Suspense>
  );
}
