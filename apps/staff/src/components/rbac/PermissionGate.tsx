'use client';

import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemPermissionCode } from '@omar-makawy/shared';

export interface PermissionGateProps {
  permission?: SystemPermissionCode | string;
  anyPermissions?: (SystemPermissionCode | string)[];
  allPermissions?: (SystemPermissionCode | string)[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
    return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
