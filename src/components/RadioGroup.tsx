import { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, touchTargets } from '../design/tokens';

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /**
   * Radio options
   */
  options: RadioOption[];

  /**
   * Currently selected value
   */
  value: string | null;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Group label
   */
  label?: string;

  /**
   * Disabled state for entire group
   */
  disabled?: boolean;

  /**
   * Custom container style
   */
  style?: any;

  /**
   * Orientation
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Accessibility label for group
   */
  accessibilityLabel?: string;
}

interface RadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const RadioButton = ({
  label,
  value,
  selected,
  disabled,
  onSelect,
}: RadioButtonProps) => {
  const scale = useSharedValue(selected ? 1 : 0);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1 : 0, { damping: 15, stiffness: 300 }) }],
  }));

  const handlePress = () => {
    if (!disabled) {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      onSelect();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.radioContainer, disabled && styles.disabled]}
      accessible={true}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.radioOuter,
          selected && styles.radioOuterSelected,
          disabled && styles.radioDisabled,
        ]}
      >
        <Animated.View style={[styles.radioInner, dotStyle]} />
      </View>
      <Text
        style={[
          styles.radioLabel,
          disabled && styles.radioLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

/**
 * Radio Group Component
 *
 * Single-selection radio button group per component-library.md Section 10.
 *
 * Features:
 * - Single selection (mutually exclusive)
 * - Animated inner dot with spring physics
 * - Haptic feedback on selection (iOS/Android)
 * - Full keyboard navigation support
 * - WCAG 2.2 AA compliant (≥44px touch targets)
 * - Vertical or horizontal orientation
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *     { label: 'Option 3', value: '3' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   label="Choose one"
 * />
 * ```
 */
export const RadioGroup = ({
  options,
  value,
  onChange,
  label,
  disabled = false,
  style,
  orientation = 'vertical',
  accessibilityLabel,
}: RadioGroupProps) => {
  return (
    <View
      style={[
        styles.container,
        orientation === 'horizontal' && styles.horizontal,
        style,
      ]}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel || label}
    >
      {label && (
        <Text style={styles.groupLabel}>{label}</Text>
      )}
      <View
        style={[
          styles.optionsContainer,
          orientation === 'horizontal' && styles.optionsHorizontal,
        ]}
      >
        {options.map((option) => (
          <RadioButton
            key={option.value}
            label={option.label}
            value={option.value}
            selected={value === option.value}
            disabled={disabled || option.disabled}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionsHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTargets.minimum,
    paddingVertical: spacing.sm,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.dark.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioOuterSelected: {
    borderColor: colors.primary.default,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.default,
  },
  radioLabel: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  radioLabelDisabled: {
    color: colors.dark.textTertiary,
    opacity: 0.5,
  },
  radioDisabled: {
    borderColor: colors.dark.bgTertiary,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default RadioGroup;
