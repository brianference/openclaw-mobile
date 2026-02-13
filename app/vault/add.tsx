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
  BottomSheet,
  Toast,
  GlassCard,
  Checkbox,
} from '../../src/components';
import { colors, spacing, typography, radius, shadows } from '../../src/design/tokens';
import { useVaultStore, SecretType } from '../../src/store/vault';

const SECRET_TYPES: { label: string; value: SecretType; icon: string; description: string }[] = [
  { label: 'Login', value: 'login', icon: '🌐', description: 'Username and password' },
  { label: 'API Key', value: 'key', icon: '🔑', description: 'API keys and tokens' },
  { label: 'Note', value: 'note', icon: '📝', description: 'Secure notes' },
  { label: 'Card', value: 'card', icon: '💳', description: 'Credit cards and payment info' },
];

/**
 * Add/Edit Secret Screen
 * 
 * Per design-spec.md Section 5.4
 * - Secret type selector (Login, Card, Note, Key)
 * - Title input (required)
 * - Type-specific fields:
 *   - Login: Username, password, URL
 *   - Card: Card number, CVV, expiry
 *   - API Key: Key value
 *   - Note: Secure text
 * - Password generator (bottom sheet)
 * - Reveal/hide password toggle
 * - Notes field (optional)
 * - Save button
 * - Cancel button
 */
export default function AddSecretScreen() {
  const router = useRouter();

  // Store
  const { addSecret } = useVaultStore();

  const [secretType, setSecretType] = useState<SecretType>('login');
  const [name, setName] = useState('');
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  
  // API Key / Note fields
  const [value, setValue] = useState('');
  
  // Common
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [creating, setCreating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [nameError, setNameError] = useState('');

  // Password generator state
  const [genLength, setGenLength] = useState(16);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Validation
  const isValid = (() => {
    if (!name.trim()) return false;
    
    switch (secretType) {
      case 'login':
        return username.trim() !== '' && password.trim() !== '';
      case 'card':
        return cardNumber.trim() !== '' && cvv.trim() !== '' && expiry.trim() !== '';
      case 'key':
      case 'note':
        return value.trim() !== '';
      default:
        return false;
    }
  })();

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (genUppercase) chars += uppercase;
    if (genLowercase) chars += lowercase;
    if (genNumbers) chars += numbers;
    if (genSymbols) chars += symbols;

    if (chars === '') {
      setToastMessage('Select at least one character type');
      setShowToast(true);
      return;
    }

    let password = '';
    for (let i = 0; i < genLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedPassword(password);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [genLength, genUppercase, genLowercase, genNumbers, genSymbols]);

  const useGeneratedPassword = useCallback(() => {
    setPassword(generatedPassword);
    setShowGenerator(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToastMessage('Password applied');
    setShowToast(true);
  }, [generatedPassword]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCreating(true);

    try {
      // Build secret data based on type
      const secretData: any = {
        type: secretType,
        name: name.trim(),
        notes: notes.trim() || undefined,
      };

      switch (secretType) {
        case 'login':
          secretData.username = username.trim();
          secretData.password = password.trim();
          secretData.url = url.trim() || undefined;
          break;
        case 'card':
          secretData.cardNumber = cardNumber.trim();
          secretData.cvv = cvv.trim();
          secretData.expiryDate = expiry.trim();
          secretData.cardHolder = ''; // Could add a field for this
          break;
        case 'key':
          secretData.apiKey = value.trim();
          break;
        case 'note':
          secretData.note = value.trim();
          break;
      }

      await addSecret(secretData);

      setCreating(false);
      setToastMessage('Secret saved');
      setShowToast(true);

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Error creating secret:', error);
      setCreating(false);
      setToastMessage('Failed to save secret');
      setShowToast(true);
    }
  }, [name, secretType, username, password, url, cardNumber, cvv, expiry, value, notes, router]);

  const handleCancel = useCallback(() => {
    if (name || username || password || value || cardNumber) {
      // User has entered data, confirm
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // In production, show confirmation alert
    }
    router.back();
  }, [name, username, password, value, cardNumber, router]);

  const renderFields = () => {
    switch (secretType) {
      case 'login':
        return (
          <>
            <Animated.View entering={FadeInDown.duration(200).delay(100)}>
              <InputField
                label="Username / Email"
                value={username}
                onChangeText={setUsername}
                placeholder="username@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                accessibilityLabel="Username or email"
                accessibilityRequired
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(200).delay(200)}>
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Password"
                accessibilityRequired
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.iconButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles.icon}>{showPassword ? '🙈' : '👁️'}</Text>
                  </Pressable>
                }
              />
              <Pressable
                onPress={() => {
                  generatePassword();
                  setShowGenerator(true);
                }}
                style={styles.generateButton}
                accessibilityRole="button"
                accessibilityLabel="Generate secure password"
              >
                <Text style={styles.generateIcon}>🎲</Text>
                <Text style={styles.generateText}>Generate Password</Text>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(200).delay(300)}>
              <InputField
                label="URL (Optional)"
                value={url}
                onChangeText={setUrl}
                placeholder="https://example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                accessibilityLabel="Website URL"
              />
            </Animated.View>
          </>
        );

      case 'card':
        return (
          <>
            <Animated.View entering={FadeInDown.duration(200).delay(100)}>
              <InputField
                label="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="4242 4242 4242 4242"
                keyboardType="number-pad"
                maxLength={19}
                accessibilityLabel="Card number"
                accessibilityRequired
              />
            </Animated.View>

            <View style={styles.row}>
              <Animated.View entering={FadeInDown.duration(200).delay(200)} style={styles.halfField}>
                <InputField
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  accessibilityLabel="CVV"
                  accessibilityRequired
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(200).delay(300)} style={styles.halfField}>
                <InputField
                  label="Expiry"
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                  accessibilityLabel="Expiry date"
                  accessibilityRequired
                />
              </Animated.View>
            </View>
          </>
        );

      case 'key':
        return (
          <Animated.View entering={FadeInDown.duration(200).delay(100)}>
            <InputField
              label="API Key"
              value={value}
              onChangeText={setValue}
              placeholder="Enter API key"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              accessibilityLabel="API key value"
              accessibilityRequired
              rightIcon={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide key' : 'Show key'}
                >
                  <Text style={styles.icon}>{showPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              }
            />
          </Animated.View>
        );

      case 'note':
        return (
          <Animated.View entering={FadeInDown.duration(200).delay(100)}>
            <InputField
              label="Secure Note"
              value={value}
              onChangeText={setValue}
              placeholder="Enter your secure note"
              multiline
              numberOfLines={6}
              maxLength={2000}
              accessibilityLabel="Secure note content"
              accessibilityRequired
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add Secret</Text>
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Secret Type Selector */}
          <Animated.View entering={FadeInDown.duration(200)}>
            <Text style={styles.sectionLabel}>Secret Type</Text>
            <View style={styles.typeSelector}>
              {SECRET_TYPES.map(type => (
                <Pressable
                  key={type.value}
                  onPress={() => {
                    setSecretType(type.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.typeButton,
                    secretType === type.value && styles.typeButtonActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${type.label}. ${type.description}`}
                  accessibilityState={{ selected: secretType === type.value }}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    secretType === type.value && styles.typeLabelActive,
                  ]}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Name */}
          <Animated.View entering={FadeInDown.duration(200).delay(50)}>
            <InputField
              label="Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              placeholder="e.g., GitHub, AWS, Personal Note"
              autoCapitalize="words"
              maxLength={100}
              error={nameError}
              accessibilityLabel="Secret name"
              accessibilityRequired
            />
          </Animated.View>

          {/* Type-specific fields */}
          {renderFields()}

          {/* Notes */}
          <Animated.View entering={FadeInDown.duration(200).delay(400)}>
            <InputField
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add additional notes..."
              multiline
              numberOfLines={3}
              maxLength={500}
              accessibilityLabel="Optional notes"
            />
          </Animated.View>

          {/* Spacing for bottom button */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Save Button */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(500)}
          style={styles.saveContainer}
        >
          <Button
            label={creating ? 'Saving...' : 'Save Secret'}
            onPress={handleCreate}
            disabled={!isValid || creating}
            loading={creating}
            variant="primary"
            accessibilityLabel="Save secret"
            accessibilityState={{ disabled: !isValid || creating }}
          />
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Password Generator Bottom Sheet */}
      <BottomSheet
        visible={showGenerator}
        onClose={() => setShowGenerator(false)}
        title="Generate Password"
      >
        <View style={styles.generatorContent}>
          <Text style={styles.generatorLabel}>Length: {genLength}</Text>
          {/* TODO: Add slider component for length */}
          
          <View style={styles.generatorOptions}>
            <Checkbox
              checked={genUppercase}
              onChange={setGenUppercase}
              label="Uppercase (A-Z)"
            />
            <Checkbox
              checked={genLowercase}
              onChange={setGenLowercase}
              label="Lowercase (a-z)"
            />
            <Checkbox
              checked={genNumbers}
              onChange={setGenNumbers}
              label="Numbers (0-9)"
            />
            <Checkbox
              checked={genSymbols}
              onChange={setGenSymbols}
              label="Symbols (!@#$)"
            />
          </View>

          {generatedPassword && (
            <GlassCard style={styles.previewCard}>
              <Text style={styles.previewLabel}>Generated Password</Text>
              <Text style={styles.previewPassword} selectable>
                {generatedPassword}
              </Text>
            </GlassCard>
          )}

          <View style={styles.generatorActions}>
            <Button
              label="Generate"
              onPress={generatePassword}
              variant="secondary"
              style={styles.generatorButton}
            />
            <Button
              label="Use Password"
              onPress={useGeneratedPassword}
              variant="primary"
              style={styles.generatorButton}
              disabled={!generatedPassword}
            />
          </View>
        </View>
      </BottomSheet>

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
  cancelButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButtonText: {
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium as any,
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '48%',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeButtonActive: {
    borderColor: colors.primary.default,
    backgroundColor: `${colors.primary.default}20`,
  },
  typeIcon: {
    fontSize: 32,
  },
  typeLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium as any,
  },
  typeLabelActive: {
    color: colors.primary.default,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  iconButton: {
    padding: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary.default,
  },
  generateIcon: {
    fontSize: 20,
  },
  generateText: {
    fontSize: typography.size.sm,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  bottomSpacing: {
    height: 100,
  },
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    ...shadows.lg,
  },
  generatorContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  generatorLabel: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  generatorOptions: {
    gap: spacing.sm,
  },
  previewCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  previewLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  previewPassword: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: typography.weight.semibold as any,
  },
  generatorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  generatorButton: {
    flex: 1,
  },
});
