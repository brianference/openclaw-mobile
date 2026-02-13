import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  useEffect as useReanimatedEffect,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../design/tokens';

export type ProgressBarVariant = 'default' | 'success' | 'error' | 'warning';

export interface ProgressBarProps {
  /**
   * Progress value (0-100 for determinate, ignored for indeterminate)
   */
  value?: number;

  /**
   * Indeterminate mode (animated shimmer, unknown duration)
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Color variant
   * @default 'default'
   */
  variant?: ProgressBarVariant;

  /**
   * Show percentage label
   * @default false
   */
  showLabel?: boolean;

  /**
   * Custom label text (overrides percentage)
   */
  label?: string;

  /**
   * Bar height
   * @default 8
   */
  height?: number;

  /**
   * Container style
   */
  style?: any;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

const VARIANT_COLORS: Record<ProgressBarVariant, string> = {
  default: colors.primary.default,
  success: colors.semantic.success,
  error: colors.semantic.error,
  warning: colors.semantic.warning,
};

/**
 * Progress Bar Component
 *
 * Determinate or indeterminate progress indicator per component-library.md Section 20.
 *
 * Features:
 * - Determinate: Shows exact percentage (0-100%)
 * - Indeterminate: Animated shimmer for unknown duration
 * - Multiple color variants (default/success/error/warning)
 * - Optional percentage label
 * - Smooth animations
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Determinate
 * <ProgressBar value={75} showLabel />
 *
 * // Indeterminate
 * <ProgressBar indeterminate />
 *
 * // Success variant
 * <ProgressBar value={100} variant="success" />
 * ```
 */
export const ProgressBar = ({
  value = 0,
  indeterminate = false,
  variant = 'default',
  showLabel = false,
  label,
  height = 8,
  style,
  accessibilityLabel,
}: ProgressBarProps) => {
  const progress = useSharedValue(0);
  const shimmerPosition = useSharedValue(-100);

  // Animate progress value
  useReanimatedEffect(() => {
    if (!indeterminate) {
      progress.value = withTiming(Math.max(0, Math.min(100, value)), {
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
  }, [value, indeterminate]);

  // Animate indeterminate shimmer
  useReanimatedEffect(() => {
    if (indeterminate) {
      shimmerPosition.value = withRepeat(
        withTiming(100, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1, // infinite
        false
      );
    }
  }, [indeterminate]);

  const fillStyle = useAnimatedStyle(() => {
    if (indeterminate) {
      return {
        width: '100%',
        transform: [{ translateX: `${shimmerPosition.value}%` }],
      };
    }
    return {
      width: `${progress.value}%`,
    };
  });

  const fillColor = VARIANT_COLORS[variant];

  const displayLabel = label || (showLabel && !indeterminate ? `${Math.round(value)}%` : undefined);

  return (
    <View style={[styles.container, style]}>
      {displayLabel && (
        <Text style={styles.label}>{displayLabel}</Text>
      )}
      <View
        style={[styles.track, { height }]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={
          indeterminate
            ? undefined
            : {
                min: 0,
                max: 100,
                now: value,
                text: `${Math.round(value)}%`,
              }
        }
      >
        <Animated.View
          style={[
            styles.fill,
            { height, backgroundColor: fillColor },
            fillStyle,
            indeterminate && styles.fillIndeterminate,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  track: {
    width: '100%',
    backgroundColor: colors.dark.bgTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  fillIndeterminate: {
    position: 'absolute',
    width: '30%',
  },
});

export default ProgressBar;
