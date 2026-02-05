/**
 * OpenClaw Mobile - Theme Store
 * Manages app theme (light/dark/system)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { ThemeMode } from '../types';

// ============================================
// Theme Colors
// ============================================

export const lightTheme = {
  // Background
  bg: '#f5f6f8',
  surface: '#ffffff',
  surface2: '#f0f1f3',
  
  // Text
  text: '#1a1d21',
  textDim: '#5a6270',
  textMuted: '#8b949e',
  
  // Borders
  border: '#d8dce2',
  borderLight: '#e8eaed',
  
  // Accent
  accent: '#2563eb',
  accentHover: '#3b82f6',
  
  // Status
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  
  // Priority colors
  priorityHigh: '#dc2626',
  priorityMedium: '#ca8a04',
  priorityLow: '#16a34a',
  
  // Tag colors
  tagInfra: { bg: '#dbeafe', text: '#1d4ed8' },
  tagResearch: { bg: '#ede9fe', text: '#7c3aed' },
  tagContent: { bg: '#ffedd5', text: '#c2410c' },
  tagCoding: { bg: '#dcfce7', text: '#15803d' },
  tagOrg: { bg: '#fef9c3', text: '#a16207' },
  tagDefault: { bg: '#e5e7eb', text: '#6b7280' },
};

export const darkTheme = {
  // Background
  bg: '#0d1117',
  surface: '#161b22',
  surface2: '#1c2129',
  
  // Text
  text: '#e6edf3',
  textDim: '#8b949e',
  textMuted: '#6e7681',
  
  // Borders
  border: '#30363d',
  borderLight: '#21262d',
  
  // Accent
  accent: '#58a6ff',
  accentHover: '#79c0ff',
  
  // Status
  success: '#3fb950',
  warning: '#d29922',
  error: '#f85149',
  
  // Priority colors
  priorityHigh: '#f85149',
  priorityMedium: '#d29922',
  priorityLow: '#3fb950',
  
  // Tag colors
  tagInfra: { bg: '#388bfd33', text: '#58a6ff' },
  tagResearch: { bg: '#a371f733', text: '#bc8cff' },
  tagContent: { bg: '#f7883533', text: '#ffa657' },
  tagCoding: { bg: '#3fb95033', text: '#56d364' },
  tagOrg: { bg: '#d2992233', text: '#e3b341' },
  tagDefault: { bg: '#30363d', text: '#8b949e' },
};

export type Theme = typeof lightTheme;

// ============================================
// Theme Store
// ============================================

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
      mode: 'system',
      systemTheme: Appearance.getColorScheme(),
      
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

// Hook to get current theme colors
export const useTheme = () => {
  const { mode, systemTheme, getTheme } = useThemeStore();
  const isDark = mode === 'system' 
    ? systemTheme === 'dark' 
    : mode === 'dark';
  
  return {
    colors: getTheme(),
    isDark,
    mode,
  };
};
