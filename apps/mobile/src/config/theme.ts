export interface ThemeColors {
  mode: 'dark' | 'light';
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBorder: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  cardBg: string;
  inputBg: string;
  headerBg: string;
  tabBarBg: string;
  badgeBg: string;
}

export const darkTheme: ThemeColors = {
  mode: 'dark',
  background: '#090A0F',
  surface: '#12141D',
  surfaceLight: '#1A1D2B',
  surfaceBorder: '#272B3C',
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryGlow: 'rgba(16, 185, 129, 0.18)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#272B3C',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  cardBg: '#12141D',
  inputBg: '#161926',
  headerBg: '#12141D',
  tabBarBg: '#12141D',
  badgeBg: 'rgba(16, 185, 129, 0.15)',
};

export const lightTheme: ThemeColors = {
  mode: 'light',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceBorder: '#E2E8F0',
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10B981',
  primaryGlow: 'rgba(5, 150, 105, 0.12)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  error: '#DC2626',
  warning: '#D97706',
  success: '#059669',
  cardBg: '#FFFFFF',
  inputBg: '#F8FAFC',
  headerBg: '#FFFFFF',
  tabBarBg: '#FFFFFF',
  badgeBg: 'rgba(5, 150, 105, 0.1)',
};

export const COLORS = darkTheme;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
