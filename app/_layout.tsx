/**
 * OpenClaw Mobile - Root Layout
 * Handles auth gate, theme provider, and navigation structure
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Appearance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/auth';
import { useThemeStore, useTheme } from '../src/store/theme';
import AuthScreen from '../src/components/AuthScreen';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const { isUnlocked, isSetup, initialize } = useAuthStore();
  const { updateSystemTheme } = useThemeStore();
  const { colors, isDark } = useTheme();
  
  // Initialize auth on app start
  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsLoading(false);
    };
    init();
  }, []);
  
  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      updateSystemTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);
  
  // Check auto-lock periodically
  useEffect(() => {
    const interval = setInterval(() => {
      useAuthStore.getState().checkAutoLock();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.bg,
      }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  
  // Show auth screen if locked or not set up
  if (!isUnlocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthScreen isSetup={isSetup} />
        </View>
      </GestureHandlerRootView>
    );
  }
  
  // Main app navigation
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
