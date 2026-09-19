'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-full transition-transform duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 hover:rotate-90 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 hover:-rotate-90 transition-transform duration-300" />
      )}
    </button>
  );
}
