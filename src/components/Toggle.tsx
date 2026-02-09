import { forwardRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, touchTargets } from '../design/tokens';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface ToggleProps {
  /**
   * Toggle label
   */
  label?: string;

  /**
   * Toggle state
   */
  value: boolean;

  /**
   * Change handler
   */
  onValueChange: (value: boolean) => void;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom label style
   */
  labelStyle?: TextStyle;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Toggle Component
 *
 * Implements design spec section 9 with:
 * - Smooth thumb animation with spring physics
 * - Track color transition
 * - Haptic feedback on toggle
 * - 44px minimum touch target (WCAG compliance)
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <Toggle
 *   label="Enable dark mode"
 *   value={isDarkMode}
 *   onValueChange={setIsDarkMode}
 * />
 *
 * <Toggle
 *   label="Notifications"
 *   value={notificationsEnabled}
 *   onValueChange={handleToggle}
 *   disabled={!hasPermission}
 * />
 * ```
 */
export const Toggle = forwardRef<View, ToggleProps>(
  (
    {
      label,
      value,
      onValueChange,
      disabled = false,
      style,
      labelStyle,
      accessibilityLabel,
    },
    ref
  ) => {
    const thumbPosition = useSharedValue(value ? 22 : 2);
    const trackProgress = useSharedValue(value ? 1 : 0);

    const thumbAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: thumbPosition.value }],
    }));

    const trackAnimatedStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        trackProgress.value,
        [0, 1],
        [colors.dark.border, colors.primary.default]
      );

      return { backgroundColor };
    });

    const handleToggle = () => {
      if (disabled) return;

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newValue = !value;

      // Animate thumb
      thumbPosition.value = withSpring(newValue ? 22 : 2, {
        damping: 15,
        stiffness: 200,
      });

      // Animate track color
      trackProgress.value = withTiming(newValue ? 1 : 0, {
        duration: 200,
      });

      onValueChange(newValue);
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handleToggle}
        disabled={disabled}
        accessible={true}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={accessibilityLabel || label}
        style={[styles.container, style]}
        activeOpacity={0.7}
      >
        {label && (
          <Text
            style={[
              styles.label,
              disabled && styles.labelDisabled,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        )}

        <AnimatedView
          style={[
            styles.track,
            trackAnimatedStyle,
            disabled && styles.trackDisabled,
          ]}
        >
          <AnimatedView
            style={[
              styles.thumb,
              thumbAnimatedStyle,
              {
                backgroundColor: value ? '#ffffff' : colors.dark.textTertiary,
              },
            ]}
          />
        </AnimatedView>
      </TouchableOpacity>
    );
  }
);

Toggle.displayName = 'Toggle';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTargets.minimum,
  },
  label: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.normal,
    marginRight: spacing.md,
  },
  labelDisabled: {
    color: colors.dark.textSecondary,
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Toggle;
