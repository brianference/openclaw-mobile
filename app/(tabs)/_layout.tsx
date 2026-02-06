import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/theme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          height: 56,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Chat',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />,
      }} />
      <Tabs.Screen name="kanban" options={{
        title: 'Board',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />,
      }} />
      <Tabs.Screen name="scanner" options={{
        title: 'Brain',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'bulb' : 'bulb-outline'} size={22} color={color} />,
      }} />
      <Tabs.Screen name="vault" options={{
        title: 'Vault',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={22} color={color} />,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />,
      }} />
    </Tabs>
  );
}
