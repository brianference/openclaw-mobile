/**
 * OpenClaw Mobile - Tab Navigation Layout
 * Five main tabs: Chat, Kanban, Vault, Scanner, Settings
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: IconName;
  color: string;
  focused: boolean;
}

function TabIcon({ name, color, focused }: TabIconProps) {
  return (
    <Ionicons 
      name={focused ? name : (`${name}-outline` as IconName)} 
      size={24} 
      color={color} 
    />
  );
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        
        // Header styling
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      {/* Chat Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubble" color={color} focused={focused} />
          ),
          headerTitle: 'OpenClaw',
        }}
      />
      
      {/* Kanban Tab */}
      <Tabs.Screen
        name="kanban"
        options={{
          title: 'Kanban',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid" color={color} focused={focused} />
          ),
          headerTitle: 'Kanban Board',
        }}
      />
      
      {/* Vault Tab */}
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="lock-closed" color={color} focused={focused} />
          ),
          headerTitle: 'Secrets Vault',
        }}
      />
      
      {/* Security Scanner Tab */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Security',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shield-checkmark" color={color} focused={focused} />
          ),
          headerTitle: 'Security Scanner',
        }}
      />
      
      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
