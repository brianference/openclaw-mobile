/**
 * Pattern Lock Implementation for MobileClaw Vault
 * 
 * Implements a secure 3x3 dot pattern lock system:
 * - Pattern represented as sequence of dot positions (0-8)
 * - Minimum 4 dots, maximum 9 dots
 * - Pattern hashed using existing PBKDF2 (100k iterations)
 * - 5-attempt limit before fallback to full password
 * - Secure storage using expo-secure-store
 * 
 * Security Features:
 * - No plaintext patterns stored
 * - PBKDF2 hashing with unique salt per user
 * - Attempt counter with rate limiting
 * - Constant-time comparison to prevent timing attacks
 */

import * as SecureStore from 'expo-secure-store';
import { deriveKeyFromPassword, generateSalt, verifyPassword } from './crypto';

// Constants
const MIN_PATTERN_LENGTH = 4;
const MAX_PATTERN_LENGTH = 9;
const MAX_FAILED_ATTEMPTS = 5;
const PATTERN_SALT_KEY = 'pattern_lock_salt';
const PATTERN_HASH_KEY = 'pattern_lock_hash';
const PATTERN_ATTEMPTS_KEY = 'pattern_lock_attempts';
const PATTERN_LOCKOUT_KEY = 'pattern_lock_lockout_until';

// Type definitions
export interface PatternPoint {
  row: number; // 0-2
  col: number; // 0-2
}

export interface PatternLockState {
  isEnabled: boolean;
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutUntil?: number; // timestamp
}

/**
 * Convert pattern point to index (0-8)
 * Grid layout:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
function pointToIndex(point: PatternPoint): number {
  return point.row * 3 + point.col;
}

/**
 * Convert index to pattern point
 */
function indexToPoint(index: number): PatternPoint {
  return {
    row: Math.floor(index / 3),
    col: index % 3
  };
}

/**
 * Convert pattern array to string representation
 * Example: [0, 1, 4, 7, 8] -> "0-1-4-7-8"
 */
function patternToString(pattern: PatternPoint[]): string {
  return pattern
    .map(point => pointToIndex(point))
    .join('-');
}

/**
 * Validate pattern meets security requirements
 */
export function validatePattern(pattern: PatternPoint[]): {
  valid: boolean;
  error?: string;
} {
  // Check length
  if (pattern.length < MIN_PATTERN_LENGTH) {
    return {
      valid: false,
      error: `Pattern must have at least ${MIN_PATTERN_LENGTH} dots`
    };
  }
  
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return {
      valid: false,
      error: `Pattern cannot exceed ${MAX_PATTERN_LENGTH} dots`
    };
  }
  
  // Check for duplicates
  const indices = pattern.map(p => pointToIndex(p));
  const uniqueIndices = new Set(indices);
  if (uniqueIndices.size !== indices.length) {
    return {
      valid: false,
      error: 'Pattern cannot use the same dot twice'
    };
  }
  
  // Check all points are valid (0-8)
  for (const point of pattern) {
    if (point.row < 0 || point.row > 2 || point.col < 0 || point.col > 2) {
      return {
        valid: false,
        error: 'Invalid pattern point'
      };
    }
  }
  
  return { valid: true };
}

/**
 * Set up pattern lock
 * @param pattern Array of pattern points (4-9 dots)
 * @returns Success status
 */
export async function setupPatternLock(pattern: PatternPoint[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate pattern
    const validation = validatePattern(pattern);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Convert pattern to string
    const patternString = patternToString(pattern);
    
    // Generate unique salt for pattern
    const salt = await generateSalt();
    
    // Hash pattern using PBKDF2 (same as password hashing)
    const hash = await deriveKeyFromPassword(patternString, salt);
    
    // Store salt and hash in SecureStore
    await SecureStore.setItemAsync(PATTERN_SALT_KEY, salt);
    await SecureStore.setItemAsync(PATTERN_HASH_KEY, hash);
    
    // Reset attempt counter
    await SecureStore.setItemAsync(PATTERN_ATTEMPTS_KEY, '0');
    await SecureStore.deleteItemAsync(PATTERN_LOCKOUT_KEY);
    
    console.log('✅ Pattern lock enabled');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to setup pattern lock:', error);
    return {
      success: false,
      error: error.message || 'Failed to setup pattern lock'
    };
  }
}

/**
 * Verify pattern against stored hash
 * @param pattern Array of pattern points
 * @returns Verification result
 */
export async function verifyPatternLock(pattern: PatternPoint[]): Promise<{
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
  requiresFullPassword?: boolean;
}> {
  try {
    // Check if pattern lock is enabled
    const isEnabled = await isPatternLockEnabled();
    if (!isEnabled) {
      return {
        success: false,
        error: 'Pattern lock is not enabled'
      };
    }
    
    // Check lockout status
    const lockoutStatus = await checkLockoutStatus();
    if (lockoutStatus.isLockedOut) {
      return {
        success: false,
        error: 'Too many failed attempts. Please use full password.',
        requiresFullPassword: true,
        attemptsRemaining: 0
      };
    }
    
    // Validate pattern format
    const validation = validatePattern(pattern);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Get stored salt and hash
    const salt = await SecureStore.getItemAsync(PATTERN_SALT_KEY);
    const storedHash = await SecureStore.getItemAsync(PATTERN_HASH_KEY);
    
    if (!salt || !storedHash) {
      return {
        success: false,
        error: 'Pattern lock not properly configured'
      };
    }
    
    // Convert pattern to string
    const patternString = patternToString(pattern);
    
    // Hash the entered pattern
    const enteredHash = await deriveKeyFromPassword(patternString, salt);
    
    // Constant-time comparison
    let mismatch = 0;
    const len = Math.max(enteredHash.length, storedHash.length);
    for (let i = 0; i < len; i++) {
      const a = i < enteredHash.length ? enteredHash.charCodeAt(i) : 0;
      const b = i < storedHash.length ? storedHash.charCodeAt(i) : 0;
      mismatch |= a ^ b;
    }
    
    const isMatch = mismatch === 0 && enteredHash.length === storedHash.length;
    
    if (isMatch) {
      // Reset attempt counter on success
      await SecureStore.setItemAsync(PATTERN_ATTEMPTS_KEY, '0');
      await SecureStore.deleteItemAsync(PATTERN_LOCKOUT_KEY);
      console.log('✅ Pattern verified');
      return { success: true };
    } else {
      // Increment failed attempts
      const failedAttempts = await incrementFailedAttempts();
      const attemptsRemaining = MAX_FAILED_ATTEMPTS - failedAttempts;
      
      console.log(`❌ Pattern verification failed (${failedAttempts}/${MAX_FAILED_ATTEMPTS})`);
      
      if (attemptsRemaining <= 0) {
        // Lock out after max attempts
        await setLockout();
        return {
          success: false,
          error: 'Too many failed attempts. Please use full password.',
          requiresFullPassword: true,
          attemptsRemaining: 0
        };
      }
      
      return {
        success: false,
        error: `Incorrect pattern. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining
      };
    }
  } catch (error: any) {
    console.error('❌ Pattern verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify pattern'
    };
  }
}

/**
 * Check if pattern lock is enabled
 */
export async function isPatternLockEnabled(): Promise<boolean> {
  try {
    const hash = await SecureStore.getItemAsync(PATTERN_HASH_KEY);
    return hash !== null;
  } catch (error) {
    console.error('Failed to check pattern lock status:', error);
    return false;
  }
}

/**
 * Disable pattern lock
 */
export async function disablePatternLock(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PATTERN_SALT_KEY);
    await SecureStore.deleteItemAsync(PATTERN_HASH_KEY);
    await SecureStore.deleteItemAsync(PATTERN_ATTEMPTS_KEY);
    await SecureStore.deleteItemAsync(PATTERN_LOCKOUT_KEY);
    console.log('✅ Pattern lock disabled');
  } catch (error) {
    console.error('❌ Failed to disable pattern lock:', error);
    throw error;
  }
}

/**
 * Get current pattern lock state
 */
export async function getPatternLockState(): Promise<PatternLockState> {
  try {
    const isEnabled = await isPatternLockEnabled();
    
    if (!isEnabled) {
      return {
        isEnabled: false,
        failedAttempts: 0,
        isLockedOut: false
      };
    }
    
    const attemptsStr = await SecureStore.getItemAsync(PATTERN_ATTEMPTS_KEY);
    const failedAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    
    const lockoutStatus = await checkLockoutStatus();
    
    return {
      isEnabled: true,
      failedAttempts,
      isLockedOut: lockoutStatus.isLockedOut,
      lockoutUntil: lockoutStatus.lockoutUntil
    };
  } catch (error) {
    console.error('Failed to get pattern lock state:', error);
    return {
      isEnabled: false,
      failedAttempts: 0,
      isLockedOut: false
    };
  }
}

/**
 * Reset failed attempts (called after successful full password authentication)
 */
export async function resetPatternAttempts(): Promise<void> {
  try {
    await SecureStore.setItemAsync(PATTERN_ATTEMPTS_KEY, '0');
    await SecureStore.deleteItemAsync(PATTERN_LOCKOUT_KEY);
    console.log('✅ Pattern attempts reset');
  } catch (error) {
    console.error('Failed to reset pattern attempts:', error);
  }
}

/**
 * Increment failed attempts counter
 * @returns New failed attempts count
 */
async function incrementFailedAttempts(): Promise<number> {
  try {
    const attemptsStr = await SecureStore.getItemAsync(PATTERN_ATTEMPTS_KEY);
    const currentAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    const newAttempts = currentAttempts + 1;
    
    await SecureStore.setItemAsync(PATTERN_ATTEMPTS_KEY, newAttempts.toString());
    
    return newAttempts;
  } catch (error) {
    console.error('Failed to increment attempts:', error);
    return 0;
  }
}

/**
 * Set lockout timestamp (15 minutes from now)
 */
async function setLockout(): Promise<void> {
  try {
    const lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
    await SecureStore.setItemAsync(PATTERN_LOCKOUT_KEY, lockoutUntil.toString());
    console.log('🔒 Pattern lock locked out for 15 minutes');
  } catch (error) {
    console.error('Failed to set lockout:', error);
  }
}

/**
 * Check if currently locked out
 */
async function checkLockoutStatus(): Promise<{
  isLockedOut: boolean;
  lockoutUntil?: number;
}> {
  try {
    const lockoutStr = await SecureStore.getItemAsync(PATTERN_LOCKOUT_KEY);
    
    if (!lockoutStr) {
      return { isLockedOut: false };
    }
    
    const lockoutUntil = parseInt(lockoutStr, 10);
    const now = Date.now();
    
    if (now < lockoutUntil) {
      return {
        isLockedOut: true,
        lockoutUntil
      };
    } else {
      // Lockout expired, clear it
      await SecureStore.deleteItemAsync(PATTERN_LOCKOUT_KEY);
      await SecureStore.setItemAsync(PATTERN_ATTEMPTS_KEY, '0');
      return { isLockedOut: false };
    }
  } catch (error) {
    console.error('Failed to check lockout status:', error);
    return { isLockedOut: false };
  }
}

/**
 * Test pattern lock functionality
 */
export async function testPatternLock(): Promise<boolean> {
  try {
    console.log('🔒 Testing pattern lock...\n');
    
    // Test pattern: L-shape (0-1-2-5-8)
    const testPattern: PatternPoint[] = [
      { row: 0, col: 0 }, // 0
      { row: 0, col: 1 }, // 1
      { row: 0, col: 2 }, // 2
      { row: 1, col: 2 }, // 5
      { row: 2, col: 2 }  // 8
    ];
    
    console.log('Test Pattern (L-shape): 0-1-2-5-8');
    
    // Test 1: Setup pattern
    console.log('\n1. Setting up pattern...');
    const setupResult = await setupPatternLock(testPattern);
    if (!setupResult.success) {
      console.log('❌ Setup failed:', setupResult.error);
      return false;
    }
    console.log('✅ Pattern setup successful');
    
    // Test 2: Verify correct pattern
    console.log('\n2. Verifying correct pattern...');
    const verifyCorrect = await verifyPatternLock(testPattern);
    if (!verifyCorrect.success) {
      console.log('❌ Verification failed:', verifyCorrect.error);
      return false;
    }
    console.log('✅ Correct pattern verified');
    
    // Test 3: Verify incorrect pattern
    console.log('\n3. Testing incorrect pattern...');
    const wrongPattern: PatternPoint[] = [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 1 }
    ];
    const verifyWrong = await verifyPatternLock(wrongPattern);
    if (verifyWrong.success) {
      console.log('❌ Wrong pattern accepted!');
      return false;
    }
    console.log('✅ Wrong pattern rejected');
    console.log('   Attempts remaining:', verifyWrong.attemptsRemaining);
    
    // Test 4: Test 5-attempt limit
    console.log('\n4. Testing 5-attempt limit...');
    for (let i = 0; i < 4; i++) {
      const result = await verifyPatternLock(wrongPattern);
      console.log(`   Attempt ${i + 2}/5: ${result.attemptsRemaining} remaining`);
    }
    
    // 5th attempt should trigger lockout
    const finalAttempt = await verifyPatternLock(wrongPattern);
    if (!finalAttempt.requiresFullPassword) {
      console.log('❌ Lockout not triggered after 5 attempts');
      return false;
    }
    console.log('✅ Lockout triggered correctly');
    console.log('   Message:', finalAttempt.error);
    
    // Test 5: Verify state
    console.log('\n5. Checking pattern lock state...');
    const state = await getPatternLockState();
    console.log('   Enabled:', state.isEnabled);
    console.log('   Failed attempts:', state.failedAttempts);
    console.log('   Locked out:', state.isLockedOut);
    
    // Test 6: Reset and verify
    console.log('\n6. Resetting attempts...');
    await resetPatternAttempts();
    const verifyAfterReset = await verifyPatternLock(testPattern);
    if (!verifyAfterReset.success) {
      console.log('❌ Verification failed after reset');
      return false;
    }
    console.log('✅ Pattern verified after reset');
    
    // Cleanup
    console.log('\n7. Cleaning up...');
    await disablePatternLock();
    console.log('✅ Pattern lock disabled');
    
    console.log('\n✅ All tests PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ Test FAILED:', error);
    return false;
  }
}
