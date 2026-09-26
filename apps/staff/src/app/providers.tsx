'use client';

import React, { ReactNode } from 'react';
import { StaffAuthProvider } from '@/context/StaffAuthContext';
import { AcademicYearProvider } from '@/context/AcademicYearContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StaffAuthProvider>
          <AcademicYearProvider>
            {children}
          </AcademicYearProvider>
        </StaffAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
