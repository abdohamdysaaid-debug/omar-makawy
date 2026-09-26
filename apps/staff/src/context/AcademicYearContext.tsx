'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { AcademicYear, CANONICAL_ACADEMIC_YEARS } from '@omar-makawy/shared';

const STORAGE_SCOPE_KEY = 'staff_active_academic_year_id';

export interface AcademicYearContextType {
  activeAcademicYearId: string | null;
  activeYear: AcademicYear | null;
  availableYears: AcademicYear[];
  isGlobalScope: boolean;
  canChangeScope: boolean;
  setActiveAcademicYear: (yearId: string | null) => boolean;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const { user, isTeacher, isSupervisor, isAuthenticated } = useStaffAuth();
  const [activeAcademicYearId, setActiveAcademicYearIdState] = useState<string | null>(null);

  // Derive allowed years for current authenticated user
  const availableYears = useMemo<AcademicYear[]>(() => {
    if (!isAuthenticated || !user) return [];

    if (isTeacher) {
      // Teacher has access to all canonical academic years
      return CANONICAL_ACADEMIC_YEARS;
    }

    if (isSupervisor) {
      // Supervisor can ONLY see and select their explicitly assigned academic years
      const assignedSet = new Set(user.assigned_academic_years || []);
      return CANONICAL_ACADEMIC_YEARS.filter((year) => assignedSet.has(year.id));
    }

    return [];
  }, [isAuthenticated, user, isTeacher, isSupervisor]);

  // Validate and hydrate active scope on auth change
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveAcademicYearIdState(null);
      return;
    }

    const persisted = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SCOPE_KEY) : null;

    if (isTeacher) {
      // Teacher: can restore a specific year or remain in global scope (null)
      if (persisted && CANONICAL_ACADEMIC_YEARS.some((y) => y.id === persisted)) {
        setActiveAcademicYearIdState(persisted);
      } else {
        setActiveAcademicYearIdState(null); // Default to Global Scope
      }
    } else if (isSupervisor) {
      const assigned = user.assigned_academic_years || [];
      // Safety: Supervisor must NEVER have an unassigned year
      if (persisted && assigned.includes(persisted)) {
        setActiveAcademicYearIdState(persisted);
      } else if (assigned.length > 0) {
        // Fallback to first legitimately assigned year
        setActiveAcademicYearIdState(assigned[0]);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_SCOPE_KEY, assigned[0]);
        }
      } else {
        setActiveAcademicYearIdState(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_SCOPE_KEY);
        }
      }
    }
  }, [isAuthenticated, user, isTeacher, isSupervisor]);

  const setActiveAcademicYear = useCallback(
    (yearId: string | null): boolean => {
      if (!isAuthenticated) return false;

      // 1. Global Scope selection (yearId === null)
      if (yearId === null) {
        if (!isTeacher) {
          // Supervisors are NOT permitted global scope
          return false;
        }
        setActiveAcademicYearIdState(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_SCOPE_KEY);
        }
        return true;
      }

      // 2. Specific Academic Year selection
      if (isTeacher) {
        const isValid = CANONICAL_ACADEMIC_YEARS.some((y) => y.id === yearId);
        if (isValid) {
          setActiveAcademicYearIdState(yearId);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_SCOPE_KEY, yearId);
          }
          return true;
        }
        return false;
      }

      if (isSupervisor) {
        const assigned = user?.assigned_academic_years || [];
        const isAssigned = assigned.includes(yearId);
        if (isAssigned) {
          setActiveAcademicYearIdState(yearId);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_SCOPE_KEY, yearId);
          }
          return true;
        }
        // Reject unassigned selection
        return false;
      }

      return false;
    },
    [isAuthenticated, isTeacher, isSupervisor, user?.assigned_academic_years]
  );

  const activeYear = useMemo(() => {
    if (!activeAcademicYearId) return null;
    return CANONICAL_ACADEMIC_YEARS.find((y) => y.id === activeAcademicYearId) || null;
  }, [activeAcademicYearId]);

  const isGlobalScope = activeAcademicYearId === null && isTeacher;
  const canChangeScope = isTeacher || (isSupervisor && availableYears.length > 1);

  return (
    <AcademicYearContext.Provider
      value={{
        activeAcademicYearId,
        activeYear,
        availableYears,
        isGlobalScope,
        canChangeScope,
        setActiveAcademicYear,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYearScope() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error('useAcademicYearScope must be used within an AcademicYearProvider');
  }
  return context;
}

export const useAcademicYear = useAcademicYearScope;
