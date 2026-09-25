'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Student } from '@/types';
import { mockStudent } from '@/data/mock';

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
}

export interface RegisterData {
  fullName: string;
  phone: string;
  whatsapp: string;
  parentPhone: string;
  email: string;
  password: string;
  academicYearId: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const login = useCallback((email: string, _password: string) => {
    // Mock authentication - always succeeds
    void email;
    void _password;
    setStudent(mockStudent);
    setIsAuthenticated(true);
    setShowAuthGate(false);
    return true;
  }, []);

  const register = useCallback((data: RegisterData) => {
    // Mock registration - always succeeds
    const newStudent: Student = {
      id: Date.now(),
      fullName: data.fullName,
      phone: data.phone,
      whatsapp: data.whatsapp,
      parentPhone: data.parentPhone,
      email: data.email,
      academicYearId: data.academicYearId,
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
  }, []);

  const openAuthGate = useCallback((url?: string) => {
    if (url) setReturnUrl(url);
    setShowAuthGate(true);
  }, []);

  const closeAuthGate = useCallback(() => {
    setShowAuthGate(false);
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
