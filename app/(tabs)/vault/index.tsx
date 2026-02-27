import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  InputField,
  Button,
  Toast,
} from '../../../src/components';
import { colors, spacing, typography, radius, shadows } from '../../../src/design/tokens';
import { useVaultStore } from '../../../src/store/vault';

/**
 * Vault Unlock Screen
 * 
 * Per design-spec.md Section 5.4
 * - Password input (secure)
 * - Biometric unlock button (Face ID/Touch ID/Fingerprint)
 * - Unlock button
 * - Auto-lock after 5 min inactivity
 * - 5 failed attempts: 1 min lockout
 * - Shake animation on error
 * - No password hints visible
 */
export default function VaultUnlockScreen() {
  const router = useRouter();

  // Store
  const { unlock, unlockWithBiometric, settings, failedAttempts, lockoutUntil } = useVaultStore();

  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Shake animation value
  const shakeValue = useSharedValue(0);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Check lockout status (handled by store now, but keep for UI updates)
  useEffect(() => {
    if (lockoutUntil && lockoutUntil > Date.now()) {
      const timeout = setTimeout(() => {
        // Trigger re-render when lockout expires
      }, lockoutUntil - Date.now());
      return () => clearTimeout(timeout);
    }
  }, [lockoutUntil]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (compatible && enrolled) {
        setBiometricAvailable(true);
        
        // Determine biometric type
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const shakeAnimation = useCallback(() => {
    shakeValue.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const handleUnlock = useCallback(async () => {
    // Check if locked out
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setToastMessage(`Locked out. Try again in ${remainingSeconds}s`);
      setShowToast(true);
      shakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!password) {
      setToastMessage('Please enter your password');
      setShowToast(true);
      shakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setUnlocking(true);

    try {
      const success = await unlock(password);

      if (success) {
        // Success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/vault/contents');
      } else {
        // Failed
        shakeAnimation();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        const attemptsRemaining = 5 - failedAttempts;
        if (attemptsRemaining <= 0) {
          setToastMessage('Too many failed attempts. Locked for 5 minutes.');
        } else {
          setToastMessage(`Incorrect password (${attemptsRemaining} attempts remaining)`);
        }
        setShowToast(true);
        setPassword('');
      }
    } catch (error) {
      console.error('Unlock error:', error);
      setToastMessage('An error occurred. Please try again.');
      setShowToast(true);
      shakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUnlocking(false);
    }
  }, [password, failedAttempts, lockoutUntil, router, shakeAnimation, unlock]);

  const handleBiometricUnlock = useCallback(async () => {
    if (!biometricAvailable || !settings.biometricEnabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const success = await unlockWithBiometric();

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/vault/contents');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToastMessage('Biometric authentication failed');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Biometric error:', error);
      setToastMessage('Biometric authentication error');
      setShowToast(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [biometricAvailable, settings.biometricEnabled, unlockWithBiometric, router]);

  const isLockedOut = lockoutUntil && Date.now() < lockoutUntil;
  const lockoutSeconds = isLockedOut && lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.centerContent}>
          {/* Lock Icon */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.iconContainer}
          >
            <Text style={styles.lockIcon}>🔐</Text>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.duration(300).delay(100)}>
            <Text style={styles.title}>Vault Locked</Text>
            <Text style={styles.subtitle}>
              Enter your password to access your secrets
            </Text>
          </Animated.View>

          {/* Password Input */}
          <Animated.View
            entering={FadeInDown.duration(300).delay(200)}
            style={[styles.inputContainer, animatedStyle]}
          >
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              showPasswordToggle
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleUnlock}
              editable={!isLockedOut && !unlocking}
              accessibilityLabel="Vault password"
              accessibilityHint="Enter your master password to unlock the vault"
            />
          </Animated.View>

          {/* Lockout Warning */}
          {isLockedOut && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={styles.lockoutContainer}
            >
              <Text style={styles.lockoutIcon}>⏱️</Text>
              <Text style={styles.lockoutText}>
                Too many failed attempts.{'\n'}
                Try again in {lockoutSeconds}s
              </Text>
            </Animated.View>
          )}

          {/* Biometric Button */}
          {biometricAvailable && !isLockedOut && (
            <Animated.View entering={FadeInDown.duration(300).delay(300)}>
              <Pressable
                onPress={handleBiometricUnlock}
                style={styles.biometricButton}
                accessibilityRole="button"
                accessibilityLabel={`Use ${biometricType} to unlock`}
              >
                <Text style={styles.biometricIcon}>
                  {biometricType === 'Face ID' ? '👤' : '👆'}
                </Text>
                <Text style={styles.biometricText}>
                  Use {biometricType}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Unlock Button */}
          <Animated.View
            entering={FadeInDown.duration(300).delay(400)}
            style={styles.buttonContainer}
          >
            <Button
              label={unlocking ? 'Unlocking...' : 'Unlock'}
              onPress={handleUnlock}
              disabled={!password || isLockedOut || unlocking}
              loading={unlocking}
              variant="primary"
              accessibilityLabel="Unlock vault"
              accessibilityState={{ disabled: !password || isLockedOut || unlocking }}
            />
          </Animated.View>

          {/* Security Note */}
          <Animated.View entering={FadeInDown.duration(300).delay(500)}>
            <Text style={styles.securityNote}>
              🔒 Your vault is protected with AES-256 encryption
            </Text>
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  lockIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.size['2xl'],
    color: colors.text.primary,
    fontWeight: typography.weight.bold as any,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.md,
  },
  inputContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  lockoutContainer: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  lockoutIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  lockoutText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    minWidth: 200,
    justifyContent: 'center',
    minHeight: 44,
  },
  biometricIcon: {
    fontSize: 24,
  },
  biometricText: {
    fontSize: typography.size.md,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  securityNote: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
