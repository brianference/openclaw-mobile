import { Stack } from 'expo-router';
import { useTheme } from '../../../src/store/theme';

export default function TasksLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Tasks' }} />
      <Stack.Screen name="add" options={{ title: 'New Task', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Task Details' }} />
      <Stack.Screen name="completed" options={{ title: 'Completed' }} />
    </Stack>
  );
}
