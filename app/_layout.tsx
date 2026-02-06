import { useEffect } from 'react';
import { ActivityIndicator, View, Appearance } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/auth';
import { useThemeStore, useTheme } from '../src/store/theme';
import AuthScreen from '../src/components/AuthScreen';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { ToastProvider } from '../src/components/Toast';

export default function RootLayout() {
  const { session, isLoading, isInitialized, initialize } = useAuthStore();
  const { colors, isDark } = useTheme();
  const { updateSystemTheme } = useThemeStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      updateSystemTheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthScreen />
          <ToastProvider />
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <ToastProvider />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
