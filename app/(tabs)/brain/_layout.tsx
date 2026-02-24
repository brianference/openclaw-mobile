import { Stack } from 'expo-router';
import { useTheme } from '../../../src/store/theme';

export default function BrainLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Knowledge Base' }} />
      <Stack.Screen name="skills" options={{ title: 'Skills' }} />
      <Stack.Screen name="memories" options={{ title: 'Memories' }} />
      <Stack.Screen name="search" options={{ title: 'Search', presentation: 'modal' }} />
    </Stack>
  );
}
