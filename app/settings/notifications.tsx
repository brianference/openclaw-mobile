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
import { GlassCard, Toggle, Toast } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { useSettingsStore } from '../../src/store/settings';

/**
 * Notification Settings Screen
 * 
 * Per design-spec.md Section 5.11
 * - Allow notifications toggle (master)
 * - Task reminders toggle
 * - Daily summary toggle with time
 * - Security alerts (always on, disabled toggle)
 */
export default function NotificationSettingsScreen() {
  const router = useRouter();

  // Store
  const {
    settings,
    setNotificationsEnabled,
    setTaskReminders,
    setDailySummary,
    setDailySummaryTime,
  } = useSettingsStore();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAllowNotificationsToggle = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!value) {
      Alert.alert(
        'Disable Notifications',
        'You will no longer receive any notifications from MobileClaw. You can re-enable them anytime in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setNotificationsEnabled(false);
              setTaskReminders(false);
              setDailySummary(false);
              setToastMessage('Notifications disabled');
              setShowToast(true);
            },
          },
        ]
      );
    } else {
      setNotificationsEnabled(true);
      setToastMessage('Notifications enabled');
      setShowToast(true);
    }
  }, [setNotificationsEnabled, setTaskReminders, setDailySummary]);

  const handleTaskRemindersToggle = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTaskReminders(value);
    setToastMessage(value ? 'Task reminders enabled' : 'Task reminders disabled');
    setShowToast(true);
  }, [setTaskReminders]);

  const handleDailySummaryToggle = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDailySummary(value);
    setToastMessage(value ? 'Daily summary enabled' : 'Daily summary disabled');
    setShowToast(true);
  }, [setDailySummary]);

  const handleTimeChange = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Show time picker
    Alert.alert('Time Picker', 'Time picker coming soon');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Allow Notifications */}
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Master Control</Text>
          <GlassCard style={styles.settingCard}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Allow Notifications</Text>
              <Text style={styles.settingDescription}>
                Enable or disable all notifications
              </Text>
            </View>
            <Toggle
              value={settings.notifications.enabled}
              onValueChange={handleAllowNotificationsToggle}
              accessibilityLabel="Allow notifications"
            />
          </GlassCard>
        </Animated.View>

        {/* Task Reminders */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(100)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Task Notifications</Text>
          <GlassCard style={styles.settingCard}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Task Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified before tasks are due
              </Text>
            </View>
            <Toggle
              value={settings.notifications.taskReminders}
              onValueChange={handleTaskRemindersToggle}
              disabled={!settings.notifications.enabled}
              accessibilityLabel="Task reminders"
            />
          </GlassCard>
        </Animated.View>

        {/* Daily Summary */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Daily Updates</Text>
          <GlassCard style={styles.settingCard}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Daily Summary</Text>
              <Text style={styles.settingDescription}>
                Receive a daily summary of tasks and activities
              </Text>
              {settings.notifications.dailySummary && (
                <Pressable
                  onPress={handleTimeChange}
                  style={styles.timeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Change daily summary time, currently ${dailySummaryTime}`}
                >
                  <Text style={styles.timeButtonText}>📅 {dailySummaryTime} daily</Text>
                </Pressable>
              )}
            </View>
            <Toggle
              value={settings.notifications.dailySummary}
              onValueChange={handleDailySummaryToggle}
              disabled={!allowNotifications}
              accessibilityLabel="Daily summary"
            />
          </GlassCard>
        </Animated.View>

        {/* Security Alerts */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Security</Text>
          <GlassCard style={styles.settingCard}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security Alerts</Text>
              <Text style={styles.settingDescription}>
                Important security notifications (always on)
              </Text>
            </View>
            <Toggle
              value={true}
              onValueChange={() => {}}
              disabled={true}
              accessibilityLabel="Security alerts (always enabled)"
            />
          </GlassCard>
          <Text style={styles.helperText}>
            ⚠️ Security alerts cannot be disabled for your protection
          </Text>
        </Animated.View>

        {/* Info Box */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(400)}
        >
          <GlassCard style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Notification preferences require permission from your device.
              If notifications aren't working, check your device settings.
            </Text>
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
        duration={2000}
      />
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
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.size.md,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 70,
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
    marginBottom: spacing.md,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
  timeButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
  helperText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.default,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
});
