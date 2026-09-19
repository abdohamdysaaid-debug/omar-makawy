'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import AuthenticationGate from '@/components/auth/AuthenticationGate';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <AuthenticationGate />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
