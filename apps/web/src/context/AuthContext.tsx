'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Student } from '@/types';
import { mockStudent } from '@/data/mock';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  student: Student | null;
  returnUrl: string | null;
  login: (email: string, password: string) => boolean;
  register: (data: RegisterData) => boolean;
  logout: () => void;
  setReturnUrl: (url: string | null) => void;
  showAuthGate: boolean;
  openAuthGate: (returnUrl?: string) => void;
  closeAuthGate: () => void;
  updateStudentAvatar: (avatarUrl: string) => Promise<void>;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  whatsapp?: string;
  parentPhone: string;
  email: string;
  password: string;
  academicYearId: number | string;
  governorateId?: string;
  gender?: string;
  educationType?: string;
  studyType?: string;
  section?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const login = useCallback((email: string, _password: string) => {
    void email;
    void _password;
    setStudent(mockStudent);
    setIsAuthenticated(true);
    setShowAuthGate(false);
    return true;
  }, []);

  const register = useCallback((data: RegisterData) => {
    const newStudent: Student = {
      id: Date.now(),
      fullName: data.fullName,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      parentPhone: data.parentPhone,
      email: data.email,
      academicYearId: typeof data.academicYearId === 'number' ? data.academicYearId : 1,
    };
    setStudent(newStudent);
    setIsAuthenticated(true);
    setShowAuthGate(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setStudent(null);
    setIsAuthenticated(false);
    setReturnUrl(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  const openAuthGate = useCallback((url?: string) => {
    if (url) setReturnUrl(url);
    setShowAuthGate(true);
  }, []);

  const closeAuthGate = useCallback(() => {
    setShowAuthGate(false);
  }, []);

  const updateStudentAvatar = useCallback(async (avatarUrl: string) => {
    setStudent((prev) => (prev ? { ...prev, avatarUrl } : prev));
    try {
      // Backend avatar upload / Drive integration endpoint
      await apiClient.post('/students/avatar', { avatarUrl }).catch(() => null);
    } catch {
      // Keep state fallback
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        student,
        returnUrl,
        login,
        register,
        logout,
        setReturnUrl,
        showAuthGate,
        openAuthGate,
        closeAuthGate,
        updateStudentAvatar,
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
