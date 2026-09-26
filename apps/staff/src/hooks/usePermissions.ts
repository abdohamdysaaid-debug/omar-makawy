'use client';

import { useMemo } from 'react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { SystemPermissions, SystemPermissionCode } from '@omar-makawy/shared';

export function usePermissions() {
  const { user, isTeacher, isSupervisor, isAuthenticated } = useStaffAuth();

  const userPermissions = useMemo(() => {
    return new Set(user?.permissions || []);
  }, [user?.permissions]);

  const assignedYears = useMemo(() => {
    return new Set(user?.assigned_academic_years || []);
  }, [user?.assigned_academic_years]);

  const hasPermission = (permissionCode: SystemPermissionCode | string): boolean => {
    if (!isAuthenticated) return false;
    if (isTeacher) return true; // Teacher has global UI authority (backend enforces)
    if (!isSupervisor) return false;
    return userPermissions.has(permissionCode);
  };

  const hasAnyPermission = (permissionCodes: (SystemPermissionCode | string)[]): boolean => {
    if (!isAuthenticated) return false;
    if (isTeacher) return true;
    if (!isSupervisor) return false;
    return permissionCodes.some((code) => userPermissions.has(code));
  };

  const hasAllPermissions = (permissionCodes: (SystemPermissionCode | string)[]): boolean => {
    if (!isAuthenticated) return false;
    if (isTeacher) return true;
    if (!isSupervisor) return false;
    return permissionCodes.every((code) => userPermissions.has(code));
  };

  const isYearInScope = (academicYearId: string): boolean => {
    if (!isAuthenticated) return false;
    if (isTeacher) return true;
    if (!isSupervisor) return false;
    return assignedYears.has(academicYearId);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isYearInScope,
    permissions: user?.permissions || [],
    assignedYears: user?.assigned_academic_years || [],
    isTeacher,
    isSupervisor,
  };
}
