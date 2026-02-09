import { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../design/tokens';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthMeterProps {
  /**
   * Password value to evaluate
   */
  password: string;

  /**
   * Show strength label
   * @default true
   */
  showLabel?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Callback with strength level
   */
  onStrengthChange?: (strength: PasswordStrength, score: number) => void;
}

interface StrengthResult {
  strength: PasswordStrength;
  score: number;
  percentage: number;
  color: string;
  label: string;
}

/**
 * Calculate password strength score
 *
 * Scoring system (design spec section 6.9):
 * - Length: +2 per character (max 20 points for 10+ chars)
 * - Uppercase: +10
 * - Lowercase: +10
 * - Numbers: +10
 * - Special chars: +15
 * - Mix bonus: +15 (if has 3+ categories)
 * - Max score: 80 points
 */
const calculateStrength = (password: string): StrengthResult => {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      percentage: 0,
      color: colors.semantic.error,
      label: 'Weak',
    };
  }

  let score = 0;
  let categories = 0;

  // Length: +2 per char, max 20
  const lengthScore = Math.min(password.length * 2, 20);
  score += lengthScore;

  // Uppercase
  if (/[A-Z]/.test(password)) {
    score += 10;
    categories++;
  }

  // Lowercase
  if (/[a-z]/.test(password)) {
    score += 10;
    categories++;
  }

  // Numbers
  if (/[0-9]/.test(password)) {
    score += 10;
    categories++;
  }

  // Special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 15;
    categories++;
  }

  // Mix bonus (if 3+ categories)
  if (categories >= 3) {
    score += 15;
  }

  // Max score is 80
  const percentage = Math.min((score / 80) * 100, 100);

  // Determine strength level
  let strength: PasswordStrength;
  let color: string;
  let label: string;

  if (percentage <= 40) {
    strength = 'weak';
    color = colors.semantic.error;
    label = 'Weak';
  } else if (percentage <= 70) {
    strength = 'medium';
    color = colors.semantic.warning;
    label = 'Medium';
  } else {
    strength = 'strong';
    color = colors.accent.default;
    label = 'Strong';
  }

  return { strength, score, percentage, color, label };
};

/**
 * Password Strength Meter Component
 *
 * Implements design spec section 6.9 with:
 * - Visual strength bar (4px height, 10 segments)
 * - Color-coded feedback (red/yellow/green)
 * - Real-time strength calculation
 * - Scoring algorithm: length, uppercase, lowercase, numbers, special chars
 * - Strength label (Weak/Medium/Strong)
 * - WCAG 2.2 AA compliance (color + text label)
 *
 * @example
 * ```tsx
 * <PasswordStrengthMeter
 *   password={passwordValue}
 *   onStrengthChange={(strength, score) => {
 *     console.log(`Password is ${strength} (${score}/80)`);
 *   }}
 * />
 * ```
 */
export const PasswordStrengthMeter = forwardRef<View, PasswordStrengthMeterProps>(
  ({ password, showLabel = true, style, onStrengthChange }, ref) => {
    const result = useMemo(() => {
      const strengthResult = calculateStrength(password);

      if (onStrengthChange) {
        onStrengthChange(strengthResult.strength, strengthResult.score);
      }

      return strengthResult;
    }, [password, onStrengthChange]);

    const { percentage, color, label } = result;

    // Render 10 segments
    const segments = Array.from({ length: 10 }, (_, index) => {
      const segmentThreshold = ((index + 1) / 10) * 100;
      const isFilled = percentage >= segmentThreshold;

      return (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: isFilled ? color : colors.dark.border,
            },
          ]}
        />
      );
    });

    return (
      <View ref={ref} style={[styles.container, style]}>
        {/* Strength bar */}
        <View style={styles.bar}>{segments}</View>

        {/* Strength label */}
        {showLabel && password.length > 0 && (
          <Text
            style={[styles.label, { color }]}
            accessibilityRole="text"
            accessibilityLabel={`Password strength: ${label}`}
          >
            Strength: {label}
          </Text>
        )}
      </View>
    );
  }
);

PasswordStrengthMeter.displayName = 'PasswordStrengthMeter';

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
    borderRadius: 2,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
  },
});

export default PasswordStrengthMeter;
