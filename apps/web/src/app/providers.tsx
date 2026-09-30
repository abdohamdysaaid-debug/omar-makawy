'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import AuthenticationGate from '@/components/auth/AuthenticationGate';

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = event.reason?.message || String(event.reason || '');
      if (
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('ChunkLoadError') ||
        errorMsg.includes('Failed to fetch RSC payload')
      ) {
        // Auto-refresh stale tab when old chunk hash fails after a new deployment
        window.location.reload();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <AuthenticationGate />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
