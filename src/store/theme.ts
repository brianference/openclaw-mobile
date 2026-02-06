import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export const lightTheme = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  surface3: '#e2e8f0',

  text: '#0f172a',
  textDim: '#475569',
  textMuted: '#94a3b8',

  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  primary: '#0d9488',
  primaryLight: '#14b8a6',
  primaryDark: '#0f766e',
  primaryBg: '#f0fdfa',

  accent: '#0284c7',
  accentLight: '#38bdf8',

  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',

  priorityHigh: '#dc2626',
  priorityMedium: '#d97706',
  priorityLow: '#059669',

  card1: '#f0fdfa',
  card2: '#eff6ff',
  card3: '#fef3c7',
  card4: '#fce7f3',
  card5: '#f0fdf4',
  card6: '#fff7ed',

  tagDefault: { bg: '#f1f5f9', text: '#475569' },
  tagBlue: { bg: '#dbeafe', text: '#1d4ed8' },
  tagGreen: { bg: '#dcfce7', text: '#15803d' },
  tagAmber: { bg: '#fef3c7', text: '#92400e' },
  tagRose: { bg: '#ffe4e6', text: '#be123c' },
  tagTeal: { bg: '#ccfbf1', text: '#0f766e' },

  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkTheme = {
  bg: '#0f172a',
  surface: '#1e293b',
  surface2: '#283548',
  surface3: '#334155',

  text: '#f1f5f9',
  textDim: '#94a3b8',
  textMuted: '#64748b',

  border: '#334155',
  borderLight: '#1e293b',

  primary: '#14b8a6',
  primaryLight: '#2dd4bf',
  primaryDark: '#0d9488',
  primaryBg: '#042f2e',

  accent: '#38bdf8',
  accentLight: '#7dd3fc',

  success: '#10b981',
  successLight: '#064e3b',
  warning: '#f59e0b',
  warningLight: '#451a03',
  error: '#f43f5e',
  errorLight: '#4c0519',

  priorityHigh: '#f43f5e',
  priorityMedium: '#f59e0b',
  priorityLow: '#10b981',

  card1: '#042f2e',
  card2: '#0c1929',
  card3: '#451a03',
  card4: '#4c0519',
  card5: '#052e16',
  card6: '#431407',

  tagDefault: { bg: '#334155', text: '#94a3b8' },
  tagBlue: { bg: '#1e3a5f', text: '#7dd3fc' },
  tagGreen: { bg: '#14532d', text: '#86efac' },
  tagAmber: { bg: '#451a03', text: '#fbbf24' },
  tagRose: { bg: '#4c0519', text: '#fda4af' },
  tagTeal: { bg: '#042f2e', text: '#5eead4' },

  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export type Theme = typeof lightTheme;

interface ThemeState {
  mode: ThemeMode;
  systemTheme: ColorSchemeName;
  setMode: (mode: ThemeMode) => void;
  updateSystemTheme: (scheme: ColorSchemeName) => void;
  getTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      systemTheme: Appearance.getColorScheme() ?? 'dark',
      setMode: (mode) => set({ mode }),
      updateSystemTheme: (scheme) => set({ systemTheme: scheme }),
      getTheme: () => {
        const { mode, systemTheme } = get();
        if (mode === 'system') {
          return systemTheme === 'dark' ? darkTheme : lightTheme;
        }
        return mode === 'dark' ? darkTheme : lightTheme;
      },
    }),
    {
      name: 'openclaw-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

export const useTheme = () => {
  const { mode, systemTheme, getTheme } = useThemeStore();
  const isDark = mode === 'system'
    ? systemTheme === 'dark'
    : mode === 'dark';

  return { colors: getTheme(), isDark, mode };
};
