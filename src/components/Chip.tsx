import { forwardRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography } from '../design/tokens';

export interface ChipProps {
  /**
   * Chip label
   */
  label: string;

  /**
   * Active/selected state
   * @default false
   */
  active?: boolean;

  /**
   * Press handler
   */
  onPress?: () => void;

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
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Chip Component (Filter Tag)
 *
 * Implements design spec section 19 with:
 * - Active/inactive states
 * - Haptic feedback on toggle
 * - 36px minimum height
 * - Accessible with proper ARIA attributes
 *
 * Used for filters, categories, and tags.
 *
 * @example
 * ```tsx
 * <Chip
 *   label="Active"
 *   active={filter === 'active'}
 *   onPress={() => setFilter('active')}
 * />
 *
 * <Chip
 *   label="Work"
 *   active={selectedCategories.includes('work')}
 *   onPress={() => toggleCategory('work')}
 * />
 * ```
 */
export const Chip = forwardRef<View, ChipProps>(
  (
    {
      label,
      active = false,
      onPress,
      disabled = false,
      style,
      textStyle,
      accessibilityLabel,
    },
    ref
  ) => {
    const handlePress = () => {
      if (disabled || !onPress) return;

      // Haptic feedback
      Haptics.selectionAsync();

      onPress();
    };

    const getBackgroundColor = () => {
      if (disabled) return 'rgba(37, 37, 37, 0.4)';
      if (active) return colors.primary.default;
      return 'rgba(37, 37, 37, 0.8)';
    };

    const getTextColor = () => {
      if (disabled) return colors.dark.textTertiary;
      if (active) return '#ffffff';
      return colors.dark.textSecondary;
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: active, disabled }}
        accessibilityLabel={accessibilityLabel || `Filter: ${label}`}
        style={[
          styles.chip,
          {
            backgroundColor: getBackgroundColor(),
          },
          disabled && styles.chipDisabled,
          style,
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
);

Chip.displayName = 'Chip';

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default Chip;
