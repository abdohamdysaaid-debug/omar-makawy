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
  loginAsDemo: () => void;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = mobileApiClient.getToken();
        if (!token) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
        const fetchPromise = mobileApiClient.get('/auth/me').catch(() => null);
        const profile: any = await Promise.race([fetchPromise, timeoutPromise]);

        if (isMounted && profile && profile.role === 'STUDENT') {
          setUser(profile);
        } else if (isMounted) {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();
    return () => { isMounted = false; };
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

  const loginAsDemo = () => {
    const demoUser: StudentUser = {
      id: 'demo-student-id',
      phone: '01000000000',
      full_name: 'طالب تجريبي (Demo Student)',
      role: 'STUDENT',
      status: 'ACTIVE',
      academic_year_id: 'a0000000-0000-0000-0000-000000000004',
      academic_year_name_ar: 'الصف الثالث الثانوي',
    };
    setUser(demoUser);
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
        loginAsDemo,
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
