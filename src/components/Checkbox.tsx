import { forwardRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography, touchTargets } from '../design/tokens';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface CheckboxProps {
  /**
   * Checkbox label
   */
  label?: string;

  /**
   * Checked state
   */
  checked: boolean;

  /**
   * Change handler
   */
  onChange: (checked: boolean) => void;

  /**
   * Indeterminate state (for parent checkboxes)
   * @default false
   */
  indeterminate?: boolean;

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
 * Checkbox Component
 *
 * Implements design spec section 8 with:
 * - Check/uncheck animation with scale burst
 * - Haptic feedback on selection
 * - Indeterminate state support
 * - 44px minimum touch target (WCAG compliance)
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Mark as complete"
 *   checked={isComplete}
 *   onChange={setIsComplete}
 * />
 *
 * <Checkbox
 *   checked={allSelected}
 *   indeterminate={someSelected}
 *   onChange={handleSelectAll}
 * />
 * ```
 */
export const Checkbox = forwardRef<View, CheckboxProps>(
  (
    {
      label,
      checked,
      onChange,
      indeterminate = false,
      disabled = false,
      style,
      labelStyle,
      accessibilityLabel,
    },
    ref
  ) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handleToggle = () => {
      if (disabled) return;

      // Haptic feedback
      Haptics.selectionAsync();

      // Scale animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      onChange(!checked);
    };

    const isChecked = checked || indeterminate;

    const getBackgroundColor = () => {
      if (disabled) return colors.dark.bgSecondary;
      if (isChecked) return colors.primary.default;
      return 'transparent';
    };

    const getBorderColor = () => {
      if (disabled) return colors.dark.border;
      if (isChecked) return colors.primary.default;
      return colors.dark.border;
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handleToggle}
        disabled={disabled}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
        accessibilityLabel={accessibilityLabel || label}
        style={[styles.container, style]}
        activeOpacity={0.7}
      >
        <AnimatedView
          style={[
            styles.checkbox,
            animatedStyle,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
            },
            disabled && styles.checkboxDisabled,
          ]}
        >
          {isChecked && (
            <Ionicons
              name={indeterminate ? 'remove' : 'checkmark'}
              size={16}
              color="#ffffff"
            />
          )}
        </AnimatedView>

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
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTargets.minimum,
    minWidth: touchTargets.minimum,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm - 2, // 6px
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: spacing.sm + 2,
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.normal,
    flex: 1,
  },
  labelDisabled: {
    color: colors.dark.textSecondary,
  },
});

export default Checkbox;
