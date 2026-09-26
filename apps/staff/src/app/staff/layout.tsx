'use client';

import React from 'react';
import { StaffGuard } from '@/components/layout/StaffGuard';
import { StaffLayout } from '@/components/layout/StaffLayout';

export default function ProtectedStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffGuard>
      <StaffLayout>{children}</StaffLayout>
    </StaffGuard>
  );
}
