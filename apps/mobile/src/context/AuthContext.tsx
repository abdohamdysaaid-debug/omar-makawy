import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mobileApiClient } from '../services/api';

export interface StudentUser {
  id: string;
  phone: string;
  full_name: string;
  role: 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED';
  academic_year_id?: string;
  academic_year_name_ar?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: StudentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial session / cached credentials
    const checkAuth = async () => {
      try {
        const profile = await mobileApiClient.get('/auth/me').catch(() => null);
        if (profile && profile.role === 'STUDENT') {
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await mobileApiClient.post('/auth/login', { phone, password });
      if (res.access_token) {
        mobileApiClient.setToken(res.access_token);
        if (res.user && res.user.role === 'STUDENT') {
          setUser(res.user);
        } else {
          // Fetch student profile
          const profile = await mobileApiClient.get('/auth/me');
          setUser(profile);
        }
      } else {
        throw new Error('فشل تسجيل الدخول، تأكد من البيانات المدخلة');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await mobileApiClient.post('/auth/register', payload);
      if (res.access_token) {
        mobileApiClient.setToken(res.access_token);
        setUser(res.user || res);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await mobileApiClient.post('/auth/logout').catch(() => null);
    } finally {
      mobileApiClient.setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
