/**
 * OpenClaw Mobile - Authentication Screen
 * Handles passphrase setup, login, and biometric unlock
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../store/theme';

interface AuthScreenProps {
  isSetup: boolean;
}

export default function AuthScreen({ isSetup }: AuthScreenProps) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    setupPassphrase, 
    verifyPassphrase, 
    unlockWithBiometric,
    biometricAvailable,
    biometricEnabled,
  } = useAuthStore();
  
  const { colors } = useTheme();
  
  // Try biometric on mount if available and enabled
  useEffect(() => {
    if (isSetup && biometricEnabled) {
      handleBiometricUnlock();
    }
  }, [isSetup, biometricEnabled]);
  
  /**
   * Handle biometric unlock
   */
  const handleBiometricUnlock = async () => {
    setIsLoading(true);
    setError(null);
    
    const success = await unlockWithBiometric();
    
    if (!success) {
      // Don't show error - user may have cancelled
      setIsLoading(false);
    }
  };
  
  /**
   * Handle passphrase submit
   */
  const handleSubmit = async () => {
    setError(null);
    
    // Validation
    if (!passphrase.trim()) {
      setError('Please enter a passphrase');
      return;
    }
    
    if (!isSetup) {
      // Setup mode - check confirmation
      if (passphrase.length < 8) {
        setError('Passphrase must be at least 8 characters');
        return;
      }
      
      if (passphrase !== confirmPassphrase) {
        setError('Passphrases do not match');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      let success: boolean;
      
      if (isSetup) {
        // Verify existing passphrase
        success = await verifyPassphrase(passphrase);
        if (!success) {
          setError('Incorrect passphrase');
        }
      } else {
        // Setup new passphrase
        success = await setupPassphrase(passphrase);
        if (!success) {
          setError('Failed to set up passphrase');
        }
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const styles = createStyles(colors);
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Ionicons name="flash" size={64} color={colors.accent} />
          <Text style={styles.title}>OpenClaw</Text>
          <Text style={styles.subtitle}>
            {isSetup ? 'Enter your passphrase' : 'Create a passphrase'}
          </Text>
        </View>
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Passphrase Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Passphrase"
            placeholderTextColor={colors.textMuted}
            value={passphrase}
            onChangeText={setPassphrase}
            secureTextEntry={!showPassphrase}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowPassphrase(!showPassphrase)}
          >
            <Ionicons 
              name={showPassphrase ? 'eye-off' : 'eye'} 
              size={24} 
              color={colors.textDim} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Confirm Passphrase (setup only) */}
        {!isSetup && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm passphrase"
              placeholderTextColor={colors.textMuted}
              value={confirmPassphrase}
              onChangeText={setConfirmPassphrase}
              secureTextEntry={!showPassphrase}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
        )}
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Please wait...' : (isSetup ? 'Unlock' : 'Set Up')}
          </Text>
        </TouchableOpacity>
        
        {/* Biometric Button (if available and setup) */}
        {isSetup && biometricEnabled && (
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={handleBiometricUnlock}
            disabled={isLoading}
          >
            <Ionicons name="finger-print" size={32} color={colors.accent} />
            <Text style={styles.biometricText}>Use Biometric</Text>
          </TouchableOpacity>
        )}
        
        {/* Setup hints */}
        {!isSetup && (
          <View style={styles.hints}>
            <Text style={styles.hintText}>
              • At least 8 characters
            </Text>
            <Text style={styles.hintText}>
              • This passphrase encrypts your vault
            </Text>
            <Text style={styles.hintText}>
              • Cannot be recovered if forgotten
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textDim,
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}15`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 16,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 24,
  },
  biometricText: {
    color: colors.accent,
    fontSize: 16,
    marginLeft: 8,
  },
  hints: {
    marginTop: 32,
  },
  hintText: {
    color: colors.textDim,
    fontSize: 14,
    marginBottom: 8,
  },
});
