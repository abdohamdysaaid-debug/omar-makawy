'use client';

import React, { Suspense } from 'react';
import { StaffTicketDetailsClient } from '@/components/support/StaffTicketDetailsClient';
import { LoadingState } from '@/components/ui/FeedbackStates';

export default function StaffTicketDetailPage() {
  return (
    <Suspense fallback={<LoadingState message="جاري تحميل تفاصيل تذكرة الدعم..." />}>
      <StaffTicketDetailsClient />
    </Suspense>
  );
}
