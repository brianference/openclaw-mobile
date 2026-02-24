import { Stack } from 'expo-router';
import { useTheme } from '../../../src/store/theme';

export default function VaultLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Vault' }} />
      <Stack.Screen name="add" options={{ title: 'Add Secret', presentation: 'modal' }} />
      <Stack.Screen name="contents" options={{ title: 'Secret Details' }} />
      <Stack.Screen name="settings" options={{ title: 'Vault Settings' }} />
      <Stack.Screen name="security-audit" options={{ title: 'Security Audit' }} />
      <Stack.Screen name="key-rotation" options={{ title: 'Key Rotation' }} />
    </Stack>
  );
}
