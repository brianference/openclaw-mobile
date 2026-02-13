import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange';
export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // HH:MM format
  securityAlerts: boolean; // Always on, can't be disabled
}

export interface AppearanceSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  textSize: TextSize;
  reduceMotion: boolean;
}

export interface AppSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  appVersion: string;
  buildNumber: string;
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  // Appearance
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setTextSize: (size: TextSize) => void;
  setReduceMotion: (enabled: boolean) => void;
  
  // Notifications
  setNotificationsEnabled: (enabled: boolean) => void;
  setTaskReminders: (enabled: boolean) => void;
  setDailySummary: (enabled: boolean) => void;
  setDailySummaryTime: (time: string) => void;
  
  // Utilities
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  appearance: {
    theme: 'dark',
    accentColor: 'blue',
    textSize: 'medium',
    reduceMotion: false,
  },
  notifications: {
    enabled: true,
    taskReminders: true,
    dailySummary: false,
    dailySummaryTime: '09:00',
    securityAlerts: true,
  },
  appVersion: '1.0.0',
  buildNumber: '1',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,

      setTheme: (theme) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, theme },
          },
        }));
      },

      setAccentColor: (accentColor) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, accentColor },
          },
        }));
      },

      setTextSize: (textSize) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, textSize },
          },
        }));
      },

      setReduceMotion: (reduceMotion) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, reduceMotion },
          },
        }));
      },

      setNotificationsEnabled: (enabled) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, enabled },
          },
        }));
      },

      setTaskReminders: (taskReminders) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, taskReminders },
          },
        }));
      },

      setDailySummary: (dailySummary) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, dailySummary },
          },
        }));
      },

      setDailySummaryTime: (dailySummaryTime) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, dailySummaryTime },
          },
        }));
      },

      resetToDefaults: () => {
        set({ settings: DEFAULT_SETTINGS });
      },

      exportSettings: () => {
        const { settings } = get();
        return JSON.stringify(settings, null, 2);
      },

      importSettings: (json) => {
        try {
          const imported = JSON.parse(json);
          set({ settings: { ...DEFAULT_SETTINGS, ...imported } });
          return true;
        } catch (error) {
          console.error('Import settings error:', error);
          return false;
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
