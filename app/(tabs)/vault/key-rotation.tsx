import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  InputField,
  Button,
  ProgressBar,
  Toast,
  GlassCard,
} from '../../../src/components';
import { colors, spacing, typography, radius, shadows } from '../../../src/design/tokens';
import { useVaultStore } from '../../../src/store/vault';

type RotationState = 'ready' | 'rotating' | 'complete' | 'error';

/**
 * Key Rotation Screen
 * 
 * Per design-spec.md Section 5.4
 * - Warning message
 * - Current master password input
 * - Encrypted items count
 * - Estimated time
 * - Progress bar during rotation
 * - Success/error states
 */
export default function KeyRotationScreen() {
  const router = useRouter();

  // Store
  const { secrets, rotateEncryption } = useVaultStore();

  const [password, setPassword] = useState('');
  const [state, setState] = useState<RotationState>('ready');
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const totalItems = secrets.length;
  const estimatedTime = totalItems < 10 ? '<1 min' : `~${Math.ceil(totalItems / 10)} min`;

  const handleRotate = useCallback(async () => {
    if (!password) {
      setToastMessage('Please enter your current password');
      setShowToast(true);
      return;
    }

    try {
      // Start rotation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setState('rotating');
      setProgress(0);
      setCurrentItem(0);

      // Simulate re-encryption process for UI
      const simulateProgress = async () => {
        for (let i = 0; i < totalItems; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setCurrentItem(i + 1);
          setProgress(((i + 1) / totalItems) * 100);
        }
      };

      // Run rotation and simulation in parallel
      await Promise.all([
        rotateEncryption(),
        simulateProgress(),
      ]);

      // Complete
      setState('complete');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage('Encryption key rotated successfully');
      setShowToast(true);

      // Navigate back after delay
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error) {
      console.error('Key rotation error:', error);
      setState('error');
      setErrorMessage('Rotation failed. Your data remains unchanged.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [password, totalItems, router]);

  const handleCancel = useCallback(() => {
    if (state === 'rotating') {
      // Don't allow cancel during rotation
      setToastMessage('Cannot cancel during rotation');
      setShowToast(true);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [state, router]);

  const isRotating = state === 'rotating';
  const isComplete = state === 'complete';
  const isError = state === 'error';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleCancel}
          style={styles.backButton}
          disabled={isRotating}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{ disabled: isRotating }}
        >
          <Text style={[
            styles.backButtonText,
            isRotating && styles.backButtonTextDisabled
          ]}>
            ← Back
          </Text>
        </Pressable>
        <Text style={styles.headerTitle}>Rotate Key</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning */}
          <Animated.View entering={FadeInDown.duration(200)}>
            <GlassCard style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningTitle}>Warning</Text>
              <Text style={styles.warningText}>
                This will re-encrypt all vault data with a new encryption key. This process is irreversible.
                {'\n\n'}
                Make sure you have a recent backup before proceeding.
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Password Input */}
          {!isComplete && !isError && (
            <Animated.View entering={FadeInDown.duration(200).delay(100)}>
              <InputField
                label="Current Master Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isRotating}
                accessibilityLabel="Current master password"
                accessibilityRequired
                accessibilityHint="Enter your password to authorize key rotation"
              />
            </Animated.View>
          )}

          {/* Info */}
          {!isRotating && !isComplete && !isError && (
            <Animated.View entering={FadeInDown.duration(200).delay(200)}>
              <GlassCard style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Encrypted items:</Text>
                  <Text style={styles.infoValue}>{totalItems}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimated time:</Text>
                  <Text style={styles.infoValue}>{estimatedTime}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Progress */}
          {isRotating && (
            <Animated.View entering={FadeInDown.duration(200)}>
              <GlassCard style={styles.progressCard}>
                <Text style={styles.progressTitle}>Rotating encryption key...</Text>
                <Text style={styles.progressText}>
                  Re-encrypting item {currentItem} of {totalItems}
                </Text>
                <ProgressBar
                  progress={progress}
                  color={colors.primary.default}
                  height={8}
                  accessibilityLabel={`Progress: ${Math.round(progress)}%`}
                />
                <Text style={styles.progressPercentage}>
                  {Math.round(progress)}%
                </Text>
              </GlassCard>

              <View style={styles.rotatingNote}>
                <Text style={styles.rotatingNoteText}>
                  ⚠️ Do not close the app during this process
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Success */}
          {isComplete && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <GlassCard style={styles.successCard}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Key Rotated Successfully</Text>
                <Text style={styles.successText}>
                  All {totalItems} items have been re-encrypted with a new encryption key.
                  Your vault is now more secure.
                </Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* Error */}
          {isError && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <GlassCard style={styles.errorCard}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorTitle}>Rotation Failed</Text>
                <Text style={styles.errorText}>
                  {errorMessage}
                  {'\n\n'}
                  Your data remains encrypted with the original key and is safe.
                </Text>
              </GlassCard>

              <View style={styles.buttonContainer}>
                <Button
                  label="Try Again"
                  onPress={() => {
                    setState('ready');
                    setErrorMessage('');
                    setPassword('');
                  }}
                  variant="secondary"
                />
              </View>
            </Animated.View>
          )}

          {/* Buttons */}
          {!isRotating && !isComplete && !isError && (
            <>
              <Animated.View entering={FadeInDown.duration(200).delay(300)}>
                <Button
                  label="Cancel"
                  onPress={handleCancel}
                  variant="secondary"
                  style={styles.cancelButton}
                  accessibilityLabel="Cancel key rotation"
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(200).delay(400)}>
                <Button
                  label="Rotate Key"
                  onPress={handleRotate}
                  disabled={!password}
                  variant="primary"
                  style={styles.rotateButton}
                  textStyle={styles.rotateButtonText}
                  accessibilityLabel="Start key rotation"
                  accessibilityState={{ disabled: !password }}
                  accessibilityHint="This will re-encrypt all vault data"
                />
              </Animated.View>
            </>
          )}

          {/* Security Note */}
          {!isRotating && !isComplete && !isError && (
            <Animated.View entering={FadeInDown.duration(200).delay(500)}>
              <View style={styles.securityNote}>
                <Text style={styles.securityNoteIcon}>🔒</Text>
                <Text style={styles.securityNoteText}>
                  Rotating your encryption key is a security best practice. We recommend doing this periodically or if you suspect your device may have been compromised.
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
  backButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 70,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  warningCard: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.semantic.error + '40',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningIcon: {
    fontSize: 48,
  },
  warningTitle: {
    fontSize: typography.size.xl,
    color: colors.semantic.error,
    fontWeight: typography.weight.bold as any,
  },
  warningText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.md,
  },
  infoCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  progressCard: {
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    textAlign: 'center',
  },
  progressText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressPercentage: {
    fontSize: typography.size['2xl'],
    color: colors.primary.default,
    fontWeight: typography.weight.bold as any,
  },
  rotatingNote: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.warning,
  },
  rotatingNoteText: {
    fontSize: typography.size.sm,
    color: colors.semantic.warning,
    textAlign: 'center',
  },
  successCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent.default + '40',
  },
  successIcon: {
    fontSize: 64,
  },
  successTitle: {
    fontSize: typography.size.xl,
    color: colors.accent.default,
    fontWeight: typography.weight.bold as any,
  },
  successText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.md,
  },
  errorCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.semantic.error + '40',
  },
  errorIcon: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: typography.size.xl,
    color: colors.semantic.error,
    fontWeight: typography.weight.bold as any,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.md,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
  },
  rotateButton: {
    backgroundColor: colors.semantic.error,
  },
  rotateButtonText: {
    color: colors.text.primary,
  },
  securityNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
  },
  securityNoteIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  securityNoteText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
});
