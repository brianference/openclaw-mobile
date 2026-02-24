import { Stack } from 'expo-router';
import { useTheme } from '../../../src/store/theme';

export default function ScannerLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: -0.3,
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Documents',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          title: 'Scan Document',
          headerShown: false,
          presentation: 'fullScreenCover',
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: 'Preview',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}