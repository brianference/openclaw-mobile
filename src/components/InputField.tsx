import { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, touchTargets } from '../design/tokens';

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label (always visible)
   */
  label: string;

  /**
   * Helper text displayed below input
   */
  helper?: string;

  /**
   * Error message (overrides helper text)
   */
  error?: string;

  /**
   * Success state (shows green border)
   */
  success?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom input style
   */
  inputStyle?: TextStyle;

  /**
   * Custom label style
   */
  labelStyle?: TextStyle;

  /**
   * Disable floating label animation
   * @default false
   */
  disableFloating?: boolean;
}

/**
 * Input Field Component
 *
 * Implements design spec section 5 with:
 * - Floating label animation
 * - Inline validation with error/success states
 * - Focus state with glow effect
 * - Helper text and error messages
 * - 44px minimum height (WCAG compliance)
 *
 * @example
 * ```tsx
 * <InputField
 *   label="Task title"
 *   value={title}
 *   onChangeText={setTitle}
 *   placeholder="Enter task title"
 * />
 *
 * <InputField
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error="Invalid email address"
 *   keyboardType="email-address"
 * />
 * ```
 */
export const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      value,
      helper,
      error,
      success = false,
      style,
      inputStyle,
      labelStyle,
      disableFloating = false,
      onFocus,
      onBlur,
      editable = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const labelPosition = useSharedValue(value ? -8 : 16);
    const labelScale = useSharedValue(value ? 0.85 : 1);

    const hasValue = !!value;
    const shouldFloat = !disableFloating && (isFocused || hasValue);

    // Animate label on focus/blur
    const animatedLabelStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: labelPosition.value },
        { scale: labelScale.value },
      ],
      transformOrigin: 'left',
    }));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (!disableFloating) {
        labelPosition.value = withSpring(-8, { damping: 20 });
        labelScale.value = withSpring(0.85, { damping: 20 });
      }
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (!disableFloating && !value) {
        labelPosition.value = withSpring(16, { damping: 20 });
        labelScale.value = withSpring(1, { damping: 20 });
      }
      onBlur?.(e);
    };

    // Determine border color based on state
    const getBorderColor = () => {
      if (error) return colors.semantic.error;
      if (success && !isFocused) return colors.semantic.success;
      if (isFocused) return colors.primary.default;
      return 'transparent';
    };

    const borderColor = getBorderColor();

    // Determine background opacity
    const getBackgroundOpacity = () => {
      if (!editable) return 0.4;
      if (isFocused) return 1;
      return 0.8;
    };

    return (
      <View style={[styles.container, style]}>
        {/* Label */}
        <Animated.View
          style={[
            styles.labelContainer,
            animatedLabelStyle,
            shouldFloat && styles.labelFloating,
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.label,
              shouldFloat && styles.labelFloatingText,
              isFocused && { color: colors.primary.default },
              error && { color: colors.semantic.error },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </Animated.View>

        {/* Input */}
        <TextInput
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          placeholderTextColor={colors.dark.textTertiary}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={error || helper}
          style={[
            styles.input,
            {
              borderColor,
              backgroundColor: `rgba(37, 37, 37, ${getBackgroundOpacity()})`,
              color: editable ? colors.dark.textPrimary : colors.dark.textSecondary,
            },
            isFocused && styles.inputFocused,
            error && styles.inputError,
            !editable && styles.inputDisabled,
            inputStyle,
          ]}
          {...props}
        />

        {/* Helper or Error Text */}
        {(error || helper) && (
          <Text
            nativeID={error ? `${label}-error` : `${label}-helper`}
            style={[
              styles.helperText,
              error && styles.errorText,
            ]}
            accessibilityRole="alert"
            accessibilityLiveRegion={error ? 'assertive' : 'polite'}
          >
            {error || helper}
          </Text>
        )}
      </View>
    );
  }
);

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    position: 'absolute',
    left: spacing.md + 2,
    zIndex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  labelFloating: {
    backgroundColor: colors.dark.bgPrimary,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textSecondary,
    fontWeight: typography.fontWeight.normal,
  },
  labelFloatingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  input: {
    minHeight: touchTargets.minimum,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm + 2,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    ...Platform.select({
      ios: {
        paddingTop: spacing.md + 4,
      },
      android: {
        paddingTop: spacing.md,
      },
    }),
  },
  inputFocused: {
    shadowColor: colors.primary.default,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    // Border color handled dynamically
  },
  inputDisabled: {
    opacity: 0.5,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.textTertiary,
    marginTop: spacing.xs,
    marginLeft: spacing.md + 2,
  },
  errorText: {
    color: colors.semantic.error,
  },
});

export default InputField;
