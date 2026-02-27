import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';

interface SettingsItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  onPress?: () => void;
}

/**
 * Settings Home Screen
 * 
 * Per design-spec.md Section 5.11
 * - General settings (Appearance, Notifications)
 * - Account settings (Cloud Sync, Backup)
 * - App settings (About, Help)
 * - List items with chevron indicators
 */
export default function SettingsHomeScreen() {
  const router = useRouter();

  const handleAppearance = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/appearance');
  }, [router]);

  const handleNotifications = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/notifications');
  }, [router]);

  const handleCloudSync = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to cloud sync settings
    Alert.alert('Cloud Sync', 'Cloud sync settings coming soon');
  }, []);

  const handleBackup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to backup settings
    Alert.alert('Backup & Restore', 'Backup settings coming soon');
  }, []);

  const handleAbout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/about');
  }, [router]);

  const handleHelp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to help screen
    Alert.alert('Help & Feedback', 'Help center coming soon');
  }, []);

  const handleScanner = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/scanner');
  }, [router]);

  const handleSecurity = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/security');
  }, [router]);

  const handlePlaces = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to places
    Alert.alert('Places', 'Places feature coming soon');
  }, []);

  const featureSettings: SettingsItem[] = [
    { id: '0', title: 'Scanner / OCR', icon: '📷', onPress: handleScanner },
    { id: '1a', title: 'Security Dashboard', icon: '🛡️', onPress: handleSecurity },
    { id: '1b', title: 'Places', icon: '🗺️', onPress: handlePlaces },
  ];

  const generalSettings: SettingsItem[] = [
    { id: '1', title: 'Appearance', icon: '🎨', onPress: handleAppearance },
    { id: '2', title: 'Notifications', icon: '🔔', onPress: handleNotifications },
  ];

  const accountSettings: SettingsItem[] = [
    { id: '3', title: 'Cloud Sync', icon: '☁️', onPress: handleCloudSync },
    { id: '4', title: 'Backup & Restore', icon: '💾', onPress: handleBackup },
  ];

  const appSettings: SettingsItem[] = [
    { id: '5', title: 'About', icon: 'ℹ️', onPress: handleAbout },
    { id: '6', title: 'Help & Feedback', icon: '❓', onPress: handleHelp },
  ];

  const renderSettingsSection = (
    title: string,
    items: SettingsItem[],
    startDelay: number = 0
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.duration(200).delay(startDelay + index * 50)}
        >
          <Pressable
            onPress={item.onPress}
            style={styles.settingItem}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} settings`}
          >
            <GlassCard style={styles.settingCard}>
              <Text style={styles.settingIcon}>{item.icon}</Text>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </GlassCard>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>More</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSettingsSection('Features', featureSettings, 0)}
        {renderSettingsSection('General', generalSettings, 100)}
        {renderSettingsSection('Account', accountSettings, 200)}
        {renderSettingsSection('App', appSettings, 300)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold as any,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  settingItem: {
    marginBottom: spacing.sm,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingTitle: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
});
