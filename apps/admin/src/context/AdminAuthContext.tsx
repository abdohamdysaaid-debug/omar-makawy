'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  Tokens,
  LoginResponse,
  AuthSuccessResponse,
  TwoFactorChallengeResponse,
} from '@/lib/api/types';
import {
  authApi,
  LoginCredentials,
} from '@/lib/api/auth';
import {
  getStoredAccessToken,
  getStoredUser,
  storeTokens,
  storeUser,
  clearStoredAuth,
} from '@/lib/api/client';

interface AdminAuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isSupervisor: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  verifyTwoFactor: (challengeToken: string, code: string) => Promise<AuthSuccessResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getStoredAccessToken();
        const storedUser = getStoredUser();

        if (token && storedUser) {
          setUser(storedUser);
          // Verify with backend silently
          try {
            const freshUser = await authApi.getMe();
            setUser(freshUser);
            storeUser(freshUser);
          } catch {
            // Token might be refreshed by client interceptor, if completely invalid client will clear
          }
        }
      } catch (err) {
        console.error('Failed to initialize admin auth', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);

      // Check if 2FA challenge is returned
      if ('two_factor_required' in res && res.two_factor_required) {
        setIsLoading(false);
        return res as TwoFactorChallengeResponse;
      }

      const success = res as AuthSuccessResponse;
      if (success.tokens && success.user) {
        storeTokens(success.tokens);
        storeUser(success.user);
        setUser(success.user);
        setTokens(success.tokens);
      }

      setIsLoading(false);
      return success;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const verifyTwoFactor = async (challengeToken: string, code: string): Promise<AuthSuccessResponse> => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyTwoFactorChallenge(challengeToken, code);
      if (res.tokens && res.user) {
        storeTokens(res.tokens);
        storeUser(res.user);
        setUser(res.user);
        setTokens(res.tokens);
      }
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      clearStoredAuth();
      setUser(null);
      setTokens(null);
      router.push('/admin/login');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const fresh = await authApi.getMe();
      setUser(fresh);
      storeUser(fresh);
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  const isAuthenticated = !!user;
  const isTeacher = user?.role === 'TEACHER';
  const isSupervisor = user?.role === 'SUPERVISOR';

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated,
        isTeacher,
        isSupervisor,
        isLoading,
        login,
        verifyTwoFactor,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
