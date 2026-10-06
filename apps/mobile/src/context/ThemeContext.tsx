import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkTheme, lightTheme, ThemeColors } from '../config/theme';

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
}

const THEME_STORAGE_KEY = 'omar_mobile_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) return saved === 'dark';
      } catch {}
    }
    return true; // Default dark
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
        } catch {}
      }
      return next;
    });
  };

  const setThemeMode = (mode: 'dark' | 'light') => {
    const dark = mode === 'dark';
    setIsDark(dark);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {}
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
