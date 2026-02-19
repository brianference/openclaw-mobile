/**
 * MobileClaw Design Tokens
 *
 * Design System: Electric Blue + Emerald Green + Neutral
 * Specification: design-spec.md v1.0
 *
 * COMMANDMENT #5: Maximum 3 colors enforced
 * - Primary: Electric Blue (#0ea5e9)
 * - Accent: Emerald Green (#10b981)
 * - Neutral: Dark/Light mode palettes
 */

export const colors = {
  // Primary: Electric Blue
  primary: {
    light: '#38bdf8',
    default: '#0ea5e9',
    dark: '#0369a1',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
  },

  // Accent: Emerald Green
  accent: {
    light: '#34d399',
    default: '#10b981',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },

  // Neutral Palette - Dark Mode (Primary)
  dark: {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#1a1a1a',
    bgTertiary: '#252525',
    surface: '#2d2d2d',
    surfaceElevated: '#3a3a3a',

    textPrimary: '#f5f5f5',
    textSecondary: '#a3a3a3',
    textTertiary: '#737373',

    border: '#333333',
    borderLight: '#404040',
  },

  // Neutral Palette - Light Mode (Secondary)
  light: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#e5e5e5',
    surface: '#ffffff',
    surfaceElevated: '#f9f9f9',

    textPrimary: '#0a0a0a',
    textSecondary: '#525252',
    textTertiary: '#737373',

    border: '#e5e5e5',
    borderLight: '#d4d4d4',
  },

  // Semantic Colors (shared across modes)
  semantic: {
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9', // Same as primary
    success: '#10b981', // Same as accent
  },


  // Convenience aliases (default to dark mode)
  text: {
    primary: '#f5f5f5',
    secondary: '#a3a3a3',
    tertiary: '#737373',
  },
  background: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    tertiary: '#252525',
  },
  border: {
    default: '#333333',
    light: '#404040',
  },
} as const;

/**
 * Spacing Scale
 * Base unit: 4px grid
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

/**
 * Border Radius
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/**
 * Typography Scale
 */
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  // Convenience alias
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Convenience alias
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

/**
 * Shadows (Elevation System)
 * Note: React Native shadows differ from CSS
 */
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2, // Android
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.30,
    shadowRadius: 48,
    elevation: 12,
  },
} as const;

/**
 * Animation Timings
 */
export const animation = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },
  easing: {
    easeOut: 'ease-out',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: { damping: 0.8, stiffness: 100 },
  },
} as const;

/**
 * Touch Targets
 * Apple HIG / WCAG minimum: 44px
 */
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 52,
} as const;

/**
 * Breakpoints (Responsive)
 */
export const breakpoints = {
  mobile: 375,
  largeMobile: 430,
  tablet: 768,
  largeTablet: 1024,
} as const;

/**
 * Z-Index Layers
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

/**
 * Glassmorphic Effect Tokens
 */
export const glassmorphism = {
  default: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    backdropFilter: 'blur(12px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  elevated: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(16px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pressed: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

/**
 * Type exports for TypeScript
 */
export type ColorMode = 'light' | 'dark';
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type ShadowKey = keyof typeof shadows;

/**
 * Helper: Get themed colors based on mode
 */
export const getThemedColors = (mode: ColorMode) => ({
  ...colors,
  bg: mode === 'dark' ? colors.dark : colors.light,
  text: mode === 'dark'
    ? {
        primary: colors.dark.textPrimary,
        secondary: colors.dark.textSecondary,
        tertiary: colors.dark.textTertiary,
      }
    : {
        primary: colors.light.textPrimary,
        secondary: colors.light.textSecondary,
        tertiary: colors.light.textTertiary,
      },
  border: mode === 'dark' ? colors.dark.border : colors.light.border,
  surface: mode === 'dark' ? colors.dark.surface : colors.light.surface,
});

/**
 * Default export: All tokens
 */
export default {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  animation,
  touchTargets,
  breakpoints,
  zIndex,
  glassmorphism,
  getThemedColors,
} as const;
