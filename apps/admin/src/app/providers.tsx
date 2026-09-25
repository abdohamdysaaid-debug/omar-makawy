'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
