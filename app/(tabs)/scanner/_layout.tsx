import { Stack } from 'expo-router';
import { useTheme } from '../../../src/store/theme';

export default function ScannerLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Documents',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          title: 'Scan Document',
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: 'Review Scan',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Document',
        }}
      />
    </Stack>
  );
}
