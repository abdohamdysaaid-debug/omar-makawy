'use client';

import React, { ReactNode } from 'react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { UserRole } from '@omar-makawy/shared';

export interface RoleGateProps {
  role: UserRole | UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({
  role,
  fallback = null,
  children,
}: RoleGateProps) {
  const { user, isAuthenticated } = useStaffAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
