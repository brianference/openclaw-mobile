import { useState, useCallback, useEffect } from 'react';
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
import * as LocalAuthentication from 'expo-local-authentication';
import {
  GlassCard,
  Toggle,
  BottomSheetPicker,
  Toast,
} from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { useVaultStore } from '../../src/store/vault';

type AutoLockDuration = '0' | '1' | '5' | '15' | '30';

const AUTO_LOCK_OPTIONS: { label: string; value: AutoLockDuration }[] = [
  { label: 'Never', value: '0' },
  { label: 'After 1 minute', value: '1' },
  { label: 'After 5 minutes', value: '5' },
  { label: 'After 15 minutes', value: '15' },
  { label: 'After 30 minutes', value: '30' },
];

/**
 * Vault Settings Screen
 * 
 * Per design-spec.md Section 5.4
 * - Auto-lock timeout dropdown
 * - Biometric unlock toggle
 * - Change master password
 * - Rotate encryption key (danger zone)
 */
export default function VaultSettingsScreen() {
  const router = useRouter();

  // Store
  const { settings, updateSettings, changePassword } = useVaultStore();

  const [biometricAvailable, setBiometricAvailable] = useState(true);
  const [showAutoLockPicker, setShowAutoLockPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync local state with store
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const getAutoLockLabel = () => {
    const option = AUTO_LOCK_OPTIONS.find(opt => opt.value === settings.autoLockTimeout.toString());
    return option?.label || 'After 5 minutes';
  };

  const handleAutoLockChange = useCallback((value: string) => {
    updateSettings({ autoLockTimeout: parseInt(value) });
    setShowAutoLockPicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setToastMessage(`Auto-lock set to ${AUTO_LOCK_OPTIONS.find(o => o.value === value)?.label.toLowerCase()}`);
    setShowToast(true);
  }, [updateSettings]);

  const handleBiometricToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      // Verify biometric is available
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        setToastMessage('Biometric authentication not available');
        setShowToast(true);
        return;
      }

      // Authenticate before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric unlock',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        updateSettings({ biometricEnabled: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToastMessage('Biometric unlock enabled');
        setShowToast(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      updateSettings({ biometricEnabled: false });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setToastMessage('Biometric unlock disabled');
      setShowToast(true);
    }
  }, [updateSettings]);

  const handleChangePassword = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to change password screen
    router.push('/vault/change-password');
  }, [router]);

  const handleKeyRotation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Rotate Encryption Key',
      'This will re-encrypt all vault data with a new key. This is a security operation that cannot be undone. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            router.push('/vault/key-rotation');
          },
        },
      ]
    );
  }, [router]);

  const handleSecurityAudit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/vault/security-audit');
  }, [router]);

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
        <Text style={styles.headerTitle}>Vault Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <Animated.View entering={FadeInDown.duration(200)}>
          <Text style={styles.sectionTitle}>Security</Text>
        </Animated.View>

        {/* Auto-lock */}
        <Animated.View entering={FadeInDown.duration(200).delay(100)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAutoLockPicker(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Auto-lock timeout"
          >
            <GlassCard style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Auto-lock</Text>
                  <Text style={styles.settingValue}>{getAutoLockLabel()}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Biometric Unlock */}
        {biometricAvailable && (
          <Animated.View entering={FadeInDown.duration(200).delay(200)}>
            <GlassCard style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Biometric unlock</Text>
                  <Text style={styles.settingDescription}>
                    Use Face ID or Touch ID
                  </Text>
                </View>
                <Toggle
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  accessibilityLabel="Biometric unlock toggle"
                />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Master Password Section */}
        <Animated.View entering={FadeInDown.duration(200).delay(300)}>
          <Text style={styles.sectionTitle}>Master Password</Text>
        </Animated.View>

        {/* Change Password */}
        <Animated.View entering={FadeInDown.duration(200).delay(400)}>
          <Pressable
            onPress={handleChangePassword}
            accessibilityRole="button"
            accessibilityLabel="Change master password"
          >
            <GlassCard style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Change master password</Text>
                  <Text style={styles.settingDescription}>
                    Update your vault password
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Security Audit */}
        <Animated.View entering={FadeInDown.duration(200).delay(500)}>
          <Pressable
            onPress={handleSecurityAudit}
            accessibilityRole="button"
            accessibilityLabel="Security audit"
          >
            <GlassCard style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Security audit</Text>
                  <Text style={styles.settingDescription}>
                    Check vault health and password strength
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.duration(200).delay(600)}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
        </Animated.View>

        {/* Key Rotation */}
        <Animated.View entering={FadeInDown.duration(200).delay(700)}>
          <Pressable
            onPress={handleKeyRotation}
            accessibilityRole="button"
            accessibilityLabel="Rotate encryption key"
          >
            <GlassCard style={[styles.settingCard, styles.dangerCard]}>
              <View style={styles.settingRow}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, styles.dangerLabel]}>
                    Rotate encryption key
                  </Text>
                  <Text style={styles.settingDescription}>
                    Re-encrypt all vault data with a new key
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.duration(200).delay(800)}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              All vault data is encrypted with AES-256-GCM. Your master password is never stored and cannot be recovered if forgotten.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Auto-lock Picker */}
      <BottomSheetPicker
        visible={showAutoLockPicker}
        onClose={() => setShowAutoLockPicker(false)}
        title="Auto-lock Timeout"
        options={AUTO_LOCK_OPTIONS}
        selectedValue={autoLockDuration}
        onSelect={handleAutoLockChange}
      />

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
        duration={3000}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dangerTitle: {
    color: colors.semantic.error,
  },
  settingCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: colors.semantic.error + '40',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingContent: {
    flex: 1,
    gap: spacing.xs,
  },
  settingLabel: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  dangerLabel: {
    color: colors.semantic.error,
  },
  settingValue: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  warningIcon: {
    fontSize: 24,
  },
  infoContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
});
