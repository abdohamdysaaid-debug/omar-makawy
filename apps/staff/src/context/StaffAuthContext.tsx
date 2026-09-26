'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Tokens,
  UserRole,
  LoginResponse,
  AuthSuccessResponse,
  TwoFactorChallengeResponse,
  ApiError,
  createApiClient,
  createAuthApi,
  DEFAULT_STORAGE_KEYS,
} from '@omar-makawy/shared';

export type AuthState =
  | 'UNINITIALIZED'
  | 'HYDRATING'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATION_ERROR';

export interface StaffAuthContextType {
  authState: AuthState;
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isSupervisor: boolean;
  isLoading: boolean;
  permissions: string[];
  assignedAcademicYears: string[];
  login: (phone: string, password: string) => Promise<LoginResponse>;
  verifyTwoFactor: (challengeToken: string, code: string) => Promise<AuthSuccessResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const staffApiClient = createApiClient();
export const staffAuthApi = createAuthApi(staffApiClient);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('UNINITIALIZED');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Unified Hydration
  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      setAuthState('HYDRATING');
      try {
        const token = staffApiClient.getAccessToken();
        const cachedUser = staffApiClient.getStoredUser() as User | null;

        if (!token) {
          if (isMounted) {
            setUser(null);
            setAuthState('UNAUTHENTICATED');
          }
          return;
        }

        // Optimistically set cached user if available to prevent UI flash
        if (cachedUser && isMounted) {
          if (cachedUser.role === 'STUDENT') {
            staffApiClient.clearStoredAuth();
            setUser(null);
            setAuthState('UNAUTHENTICATED');
            return;
          }
          setUser(cachedUser);
        }

        // Authoritative backend validation & permission hydration
        try {
          const freshUser = await staffAuthApi.getMe();
          if (isMounted) {
            if (freshUser.role === 'STUDENT') {
              staffApiClient.clearStoredAuth();
              setUser(null);
              setAuthState('UNAUTHENTICATED');
              return;
            }
            setUser(freshUser);
            staffApiClient.storeUser(freshUser);
            setAuthState('AUTHENTICATED');
          }
        } catch (fetchErr: any) {
          if (isMounted) {
            if (fetchErr?.statusCode === 401 || fetchErr?.statusCode === 403) {
              staffApiClient.clearStoredAuth();
              setUser(null);
              setAuthState('UNAUTHENTICATED');
            } else if (cachedUser && (cachedUser.role === 'TEACHER' || cachedUser.role === 'SUPERVISOR')) {
              // Network blip: retain cached session if valid role
              setUser(cachedUser);
              setAuthState('AUTHENTICATED');
            } else {
              setAuthState('UNAUTHENTICATED');
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setAuthState('UNAUTHENTICATED');
        }
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (phone: string, password: string): Promise<LoginResponse> => {
    try {
      const res = await staffAuthApi.login({ phone, password });

      // Handle 2FA Challenge
      if ('two_factor_required' in res && res.two_factor_required) {
        return res as TwoFactorChallengeResponse;
      }

      const success = res as AuthSuccessResponse;

      // Reject non-staff roles
      if (success.user?.role === 'STUDENT') {
        staffApiClient.clearStoredAuth();
        setUser(null);
        setAuthState('UNAUTHENTICATED');
        const error: ApiError = {
          message: 'هذا الحساب غير مصرح له بالدخول إلى بوابة الكادر التعليمي.',
          error_code: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403,
        };
        throw error;
      }

      if (success.tokens && success.user) {
        staffApiClient.storeTokens(success.tokens);
        staffApiClient.storeUser(success.user);
        setUser(success.user);
        setAuthState('AUTHENTICATED');

        // Silently fetch full permissions & academic years
        try {
          const profile = await staffAuthApi.getMe();
          setUser(profile);
          staffApiClient.storeUser(profile);
        } catch {}
      }

      return success;
    } catch (err) {
      throw err;
    }
  };

  const verifyTwoFactor = async (
    challengeToken: string,
    code: string
  ): Promise<AuthSuccessResponse> => {
    try {
      const res = await staffAuthApi.verifyTwoFactorChallenge({
        challenge_token: challengeToken,
        code,
      });

      if (res.user?.role === 'STUDENT') {
        staffApiClient.clearStoredAuth();
        setUser(null);
        setAuthState('UNAUTHENTICATED');
        const error: ApiError = {
          message: 'هذا الحساب غير مصرح له بالدخول إلى بوابة الكادر التعليمي.',
          error_code: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403,
        };
        throw error;
      }

      if (res.tokens && res.user) {
        staffApiClient.storeTokens(res.tokens);
        staffApiClient.storeUser(res.user);
        setUser(res.user);
        setAuthState('AUTHENTICATED');

        try {
          const profile = await staffAuthApi.getMe();
          setUser(profile);
          staffApiClient.storeUser(profile);
        } catch {}
      }

      return res;
    } catch (err) {
      throw err;
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      await staffAuthApi.logout().catch(() => {});
    } finally {
      staffApiClient.clearStoredAuth();
      setUser(null);
      setAuthState('UNAUTHENTICATED');
      router.push('/staff/login');
    }
  }, [router]);

  const refreshProfile = async (): Promise<void> => {
    try {
      const fresh = await staffAuthApi.getMe();
      if (fresh.role === 'STUDENT') {
        await logout();
        return;
      }
      setUser(fresh);
      staffApiClient.storeUser(fresh);
    } catch (err) {
      console.error('Failed to refresh staff profile', err);
    }
  };

  const isAuthenticated = authState === 'AUTHENTICATED' && !!user && user.role !== 'STUDENT';
  const role = user?.role || null;
  const isTeacher = role === 'TEACHER';
  const isSupervisor = role === 'SUPERVISOR';
  const isLoading = authState === 'UNINITIALIZED' || authState === 'HYDRATING';
  const permissions = user?.permissions || [];
  const assignedAcademicYears = user?.assigned_academic_years || [];

  return (
    <StaffAuthContext.Provider
      value={{
        authState,
        user,
        role,
        isAuthenticated,
        isTeacher,
        isSupervisor,
        isLoading,
        permissions,
        assignedAcademicYears,
        login,
        verifyTwoFactor,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}
