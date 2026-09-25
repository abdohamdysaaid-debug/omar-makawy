'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SupervisorAuthProvider } from '@/context/SupervisorAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SupervisorAuthProvider>
          {children}
        </SupervisorAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
