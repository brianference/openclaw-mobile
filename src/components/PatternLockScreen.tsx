/**
 * Pattern Lock Screen Component
 * 
 * Interactive 3x3 dot pattern lock interface for MobileClaw vault.
 * Features:
 * - Smooth touch tracking with visual feedback
 * - 44x44px touch targets (accessibility)
 * - Error states with clear messaging
 * - Success/failure animations
 * - Attempt counter display
 * - Fallback to full password after 5 attempts
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
  TouchableOpacity
} from 'react-native';
import {
  PatternPoint,
  validatePattern,
  verifyPatternLock,
  setupPatternLock,
  getPatternLockState
} from '../lib/pattern-lock';

const { width } = Dimensions.get('window');
const GRID_SIZE = Math.min(width * 0.8, 350); // Max 350px
const DOT_SIZE = 20;
const DOT_SPACING = GRID_SIZE / 4; // Space between dots
const TOUCH_TARGET_SIZE = 44; // WCAG minimum

interface PatternLockScreenProps {
  mode: 'setup' | 'verify'; // setup = create pattern, verify = unlock
  onSuccess: (pattern?: PatternPoint[]) => void;
  onCancel?: () => void;
  onFallbackToPassword?: () => void;
}

export default function PatternLockScreen({
  mode,
  onSuccess,
  onCancel,
  onFallbackToPassword
}: PatternLockScreenProps) {
  const [pattern, setPattern] = useState<PatternPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(5);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [confirmPattern, setConfirmPattern] = useState<PatternPoint[] | null>(null);
  
  // Animated values for feedback
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  
  // Check initial state
  useEffect(() => {
    if (mode === 'verify') {
      checkLockoutStatus();
    }
  }, [mode]);
  
  async function checkLockoutStatus() {
    const state = await getPatternLockState();
    if (state.isLockedOut) {
      setIsLockedOut(true);
      setError('Too many failed attempts. Please use full password.');
      setAttemptsRemaining(0);
    } else {
      setAttemptsRemaining(5 - state.failedAttempts);
    }
  }
  
  // Calculate dot positions (3x3 grid centered)
  const getDotPosition = (row: number, col: number): { x: number; y: number } => {
    const startX = (width - GRID_SIZE) / 2 + DOT_SPACING;
    const startY = 100; // Top margin
    
    return {
      x: startX + col * DOT_SPACING,
      y: startY + row * DOT_SPACING
    };
  };
  
  // Find closest dot to touch point
  const findClosestDot = (touchX: number, touchY: number): PatternPoint | null => {
    let closest: PatternPoint | null = null;
    let minDistance = TOUCH_TARGET_SIZE / 2;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dotPos = getDotPosition(row, col);
        const distance = Math.sqrt(
          Math.pow(touchX - dotPos.x, 2) + Math.pow(touchY - dotPos.y, 2)
        );
        
        if (distance < minDistance) {
          closest = { row, col };
          minDistance = distance;
        }
      }
    }
    
    return closest;
  };
  
  // Check if dot already in pattern
  const isDotInPattern = (point: PatternPoint): boolean => {
    return pattern.some(p => p.row === point.row && p.col === point.col);
  };
  
  // Pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLockedOut,
      onMoveShouldSetPanResponder: () => !isLockedOut,
      
      onPanResponderGrant: (evt) => {
        setIsDrawing(true);
        setError('');
        setPattern([]);
        
        const { locationX, locationY } = evt.nativeEvent;
        const closestDot = findClosestDot(locationX, locationY);
        
        if (closestDot) {
          setPattern([closestDot]);
        }
      },
      
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const closestDot = findClosestDot(locationX, locationY);
        
        if (closestDot && !isDotInPattern(closestDot)) {
          setPattern(prev => [...prev, closestDot]);
        }
      },
      
      onPanResponderRelease: () => {
        setIsDrawing(false);
        handlePatternComplete();
      }
    })
  ).current;
  
  // Handle pattern completion
  async function handlePatternComplete() {
    if (pattern.length === 0) return;
    
    const validation = validatePattern(pattern);
    
    if (!validation.valid) {
      showError(validation.error || 'Invalid pattern');
      clearPattern();
      return;
    }
    
    if (mode === 'setup') {
      handleSetupMode();
    } else {
      await handleVerifyMode();
    }
  }
  
  // Setup mode: first draw = confirm, second draw = save
  function handleSetupMode() {
    if (!confirmPattern) {
      // First draw: store for confirmation
      setConfirmPattern(pattern);
      setError('');
      setSuccess(false);
      setTimeout(() => {
        setPattern([]);
        setError('Draw pattern again to confirm');
      }, 300);
    } else {
      // Second draw: verify match
      if (patternsMatch(pattern, confirmPattern)) {
        savePattern();
      } else {
        showError('Patterns do not match. Try again.');
        setConfirmPattern(null);
        clearPattern();
      }
    }
  }
  
  // Verify mode: check against stored pattern
  async function handleVerifyMode() {
    const result = await verifyPatternLock(pattern);
    
    if (result.success) {
      showSuccess();
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      if (result.requiresFullPassword) {
        setIsLockedOut(true);
        setError(result.error || 'Too many failed attempts');
        setAttemptsRemaining(0);
        
        // Offer fallback to password
        if (onFallbackToPassword) {
          setTimeout(() => {
            Alert.alert(
              'Pattern Lock Disabled',
              'Too many failed attempts. Please use your full password.',
              [{ text: 'OK', onPress: onFallbackToPassword }]
            );
          }, 1000);
        }
      } else {
        showError(result.error || 'Incorrect pattern');
        setAttemptsRemaining(result.attemptsRemaining || 0);
      }
      clearPattern();
    }
  }
  
  // Save pattern (setup mode)
  async function savePattern() {
    if (!confirmPattern) return;
    
    const result = await setupPatternLock(confirmPattern);
    
    if (result.success) {
      showSuccess();
      setTimeout(() => {
        onSuccess(confirmPattern);
      }, 800);
    } else {
      showError(result.error || 'Failed to save pattern');
      setConfirmPattern(null);
      clearPattern();
    }
  }
  
  // Compare two patterns
  function patternsMatch(p1: PatternPoint[], p2: PatternPoint[]): boolean {
    if (p1.length !== p2.length) return false;
    
    for (let i = 0; i < p1.length; i++) {
      if (p1[i].row !== p2[i].row || p1[i].col !== p2[i].col) {
        return false;
      }
    }
    
    return true;
  }
  
  // Show error animation
  function showError(message: string) {
    setError(message);
    
    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true
      })
    ]).start();
  }
  
  // Show success animation
  function showSuccess() {
    setSuccess(true);
    setError('');
    
    // Fade animation
    Animated.timing(fadeAnimation, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true
    }).start();
  }
  
  // Clear pattern
  function clearPattern() {
    setTimeout(() => {
      setPattern([]);
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }, 500);
  }
  
  // Render 3x3 grid of dots
  function renderDots() {
    const dots: JSX.Element[] = [];
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const point = { row, col };
        const position = getDotPosition(row, col);
        const isActive = isDotInPattern(point);
        const index = pattern.findIndex(p => p.row === row && p.col === col);
        
        dots.push(
          <View
            key={`${row}-${col}`}
            style={[
              styles.dotContainer,
              {
                left: position.x - TOUCH_TARGET_SIZE / 2,
                top: position.y - TOUCH_TARGET_SIZE / 2,
                width: TOUCH_TARGET_SIZE,
                height: TOUCH_TARGET_SIZE
              }
            ]}
          >
            <View
              style={[
                styles.dot,
                isActive && styles.dotActive,
                success && isActive && styles.dotSuccess,
                error && isActive && styles.dotError
              ]}
            >
              {isActive && (
                <Text style={styles.dotNumber}>{index + 1}</Text>
              )}
            </View>
          </View>
        );
      }
    }
    
    return dots;
  }
  
  // Render connecting lines
  function renderLines() {
    if (pattern.length < 2) return null;
    
    const lines: JSX.Element[] = [];
    
    for (let i = 0; i < pattern.length - 1; i++) {
      const start = getDotPosition(pattern[i].row, pattern[i].col);
      const end = getDotPosition(pattern[i + 1].row, pattern[i + 1].col);
      
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      lines.push(
        <View
          key={`line-${i}`}
          style={[
            styles.line,
            {
              left: start.x,
              top: start.y,
              width: length,
              transform: [{ rotate: `${angle}deg` }]
            },
            success && styles.lineSuccess,
            error && styles.lineError
          ]}
        />
      );
    }
    
    return lines;
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'setup' 
            ? (confirmPattern ? 'Confirm Pattern' : 'Create Pattern')
            : 'Enter Pattern'}
        </Text>
        
        {mode === 'verify' && !isLockedOut && (
          <Text style={styles.attemptsText}>
            {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
          </Text>
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {!error && !confirmPattern && mode === 'setup' && (
          <Text style={styles.instructionText}>
            Draw a pattern with 4-9 dots
          </Text>
        )}
        
        {success && (
          <Text style={styles.successText}>✓ Pattern verified</Text>
        )}
      </View>
      
      {/* Pattern Grid */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.patternArea,
          {
            opacity: fadeAnimation,
            transform: [{ translateX: shakeAnimation }]
          }
        ]}
      >
        {renderLines()}
        {renderDots()}
      </Animated.View>
      
      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {mode === 'verify' && isLockedOut && onFallbackToPassword && (
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={onFallbackToPassword}
          >
            <Text style={styles.passwordButtonText}>Use Password</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FAFAFA',
    marginBottom: 12
  },
  attemptsText: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 8
  },
  instructionText: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 8
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center'
  },
  successText: {
    fontSize: 16,
    color: '#10B981',
    marginTop: 8,
    fontWeight: '600'
  },
  patternArea: {
    width: GRID_SIZE + 100,
    height: GRID_SIZE + 100,
    position: 'relative'
  },
  dotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#3F3F46',
    borderWidth: 2,
    borderColor: '#52525B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
    transform: [{ scale: 1.5 }]
  },
  dotSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#34D399'
  },
  dotError: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171'
  },
  dotNumber: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600'
  },
  line: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#3B82F6',
    transformOrigin: '0 50%'
  },
  lineSuccess: {
    backgroundColor: '#10B981'
  },
  lineError: {
    backgroundColor: '#EF4444'
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#52525B'
  },
  cancelButtonText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600'
  },
  passwordButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3B82F6'
  },
  passwordButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
