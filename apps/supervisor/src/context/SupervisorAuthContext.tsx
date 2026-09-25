'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Tokens, LoginResponse, AuthSuccessResponse } from '@omar-makawy/shared';
import { createApiClient, getOrCreateDeviceUuid } from '@omar-makawy/shared';

const TOKEN_KEY = 'omar_supervisor_access_token';
const REFRESH_KEY = 'omar_supervisor_refresh_token';
const USER_KEY = 'omar_supervisor_user';

export const supervisorApiClient = createApiClient(TOKEN_KEY, REFRESH_KEY);

interface SupervisorAuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const SupervisorAuthContext = createContext<SupervisorAuthContextType | undefined>(undefined);

export function SupervisorAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      try {
        const token = supervisorApiClient.getAccessToken();
        const stored = localStorage.getItem(USER_KEY);
        if (token && stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          try {
            const fresh = await supervisorApiClient.get<User>('/auth/me');
            setUser(fresh);
            localStorage.setItem(USER_KEY, JSON.stringify(fresh));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to init supervisor auth', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (phone: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const deviceUuid = getOrCreateDeviceUuid('omar_supervisor_device_uuid');
      const res = await supervisorApiClient.post<LoginResponse>('/auth/login', {
        phone,
        password,
        device_uuid: deviceUuid,
        device_type: 'WEB',
        os_info: typeof navigator !== 'undefined' ? navigator.platform : 'Desktop',
        browser_info: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Browser',
        model_name: 'Supervisor Dashboard',
      });

      if ('two_factor_required' in res && res.two_factor_required) {
        setIsLoading(false);
        return res;
      }

      const success = res as AuthSuccessResponse;
      if (success.tokens && success.user) {
        supervisorApiClient.storeTokens(success.tokens);
        localStorage.setItem(USER_KEY, JSON.stringify(success.user));
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

  const logout = async (): Promise<void> => {
    try {
      await supervisorApiClient.post('/auth/logout').catch(() => {});
    } finally {
      supervisorApiClient.clearTokens();
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setTokens(null);
      router.push('/supervisor/login');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const fresh = await supervisorApiClient.get<User>('/auth/me');
      setUser(fresh);
      localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {}
  };

  const isAuthenticated = !!user;

  return (
    <SupervisorAuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </SupervisorAuthContext.Provider>
  );
}

export function useSupervisorAuth() {
  const context = useContext(SupervisorAuthContext);
  if (!context) {
    throw new Error('useSupervisorAuth must be used within a SupervisorAuthProvider');
  }
  return context;
}
