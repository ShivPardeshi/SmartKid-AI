export const COLORS = {
  // Brand blues
  primary: '#4B9FE8',
  primaryLight: '#E8F4FD',
  primaryDark: '#2D7EC4',
  primaryGradStart: '#5BAEF5',
  primaryGradEnd: '#3A7BD5',

  // Warm orange
  secondary: '#FF9F43',
  secondaryLight: '#FFF3E6',

  // Sunny yellow
  accent: '#FFD166',
  accentLight: '#FFFBEB',

  // Lavender
  purple: '#7C63EE',
  purpleLight: '#F0EEFF',
  purpleGrad: '#9B7EDE',

  // Mint
  green: '#34D399',
  greenLight: '#EDFAF2',

  // Coral
  coral: '#FF6B6B',
  coralLight: '#FFF0F0',

  // Neutrals
  background: '#F4F8FB',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  lightText: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  darkText: '#0F172A',
  error: '#EF4444',
  success: '#10B981',

  // Glass
  glassWhite: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.45)',
  glassOverlay: 'rgba(255,255,255,0.18)',

  // Overlay
  overlay: 'rgba(15,23,42,0.35)',
};

/** Soft tints for suggestion chips */
export const CHIP_COLORS = ['#E8F4FD', '#FFF3E6', '#F0EEFF', '#EDFAF2'];

/** Gradient pairs */
export const GRADIENTS = {
  primary: ['#5BAEF5', '#3A7BD5'] as const,
  secondary: ['#FFBA71', '#FF8C00'] as const,
  purple: ['#9B7EDE', '#6D4FD4'] as const,
  green: ['#34D399', '#059669'] as const,
  coral: ['#FF8A80', '#FF5252'] as const,
  sunset: ['#FF9F43', '#FF6B6B'] as const,
  hero: ['#5BAEF5', '#7C63EE'] as const,
  dark: ['#1E293B', '#0F172A'] as const,
};

export const SIZES = {
  xs: 11,
  small: 13,
  medium: 15,
  large: 18,
  xlarge: 24,
  xxlarge: 30,
  borderRadius: 14,
  borderRadiusMd: 16,
  borderRadiusLg: 22,
  borderRadiusXl: 28,
};

export const SHADOWS = {
  xs: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  light: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  strong: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 6,
  }),
};
