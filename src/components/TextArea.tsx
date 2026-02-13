import { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, touchTargets } from '../design/tokens';

export interface TextAreaProps extends Omit<TextInputProps, 'multiline' | 'style'> {
  /**
   * Field label
   */
  label?: string;

  /**
   * Error message (shows red border + message)
   */
  error?: string;

  /**
   * Helper text (shows below input)
   */
  helper?: string;

  /**
   * Mark field as required
   */
  required?: boolean;

  /**
   * Disable the input
   */
  disabled?: boolean;

  /**
   * Success state (green border)
   */
  success?: boolean;

  /**
   * Minimum height
   * @default 120
   */
  minHeight?: number;

  /**
   * Maximum height (scrollable beyond this)
   * @default 300
   */
  maxHeight?: number;

  /**
   * Character counter (shows current/max)
   */
  maxLength?: number;

  /**
   * Show character count
   * @default false
   */
  showCount?: boolean;

  /**
   * Custom container style
   */
  containerStyle?: any;
}

/**
 * TextArea Component
 *
 * Multiline text input with auto-expand behavior per component-library.md Section 6.
 *
 * Features:
 * - Auto-expands to fit content (up to maxHeight)
 * - Floating label animation
 * - Inline validation (error/success states)
 * - Character counter (optional)
 * - Keyboard-aware scrolling
 * - Full accessibility support
 *
 * Same visual style as InputField but multiline.
 *
 * @example
 * ```tsx
 * <TextArea
 *   label="Notes"
 *   value={notes}
 *   onChangeText={setNotes}
 *   placeholder="Add notes..."
 *   maxLength={500}
 *   showCount
 * />
 * ```
 */
export const TextArea = forwardRef<TextInput, TextAreaProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      helper,
      required = false,
      disabled = false,
      success = false,
      minHeight = 120,
      maxHeight = 300,
      maxLength,
      showCount = false,
      placeholder,
      containerStyle,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [contentHeight, setContentHeight] = useState(minHeight);

    const labelTop = useSharedValue(label && (isFocused || value) ? -8 : 16);
    const labelFontSize = useSharedValue(
      label && (isFocused || value) ? typography.fontSize.xs : typography.fontSize.md
    );

    const labelStyle = useAnimatedStyle(() => ({
      top: withTiming(labelTop.value, { duration: 200 }),
      fontSize: withTiming(labelFontSize.value, { duration: 200 }),
    }));

    const handleFocus = () => {
      setIsFocused(true);
      if (label) {
        labelTop.value = -8;
        labelFontSize.value = typography.fontSize.xs;
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (label && !value) {
        labelTop.value = 16;
        labelFontSize.value = typography.fontSize.md;
      }
    };

    const handleContentSizeChange = (event: any) => {
      const height = event.nativeEvent.contentSize.height;
      const boundedHeight = Math.max(minHeight, Math.min(maxHeight, height));
      setContentHeight(boundedHeight);
    };

    const errorId = error ? `${label}-error` : undefined;
    const helperId = helper ? `${label}-helper` : undefined;

    const characterCount = value?.length || 0;
    const showCounter = showCount && maxLength;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Animated.Text
              style={[
                styles.label,
                labelStyle,
                isFocused && styles.labelFocused,
                error && styles.labelError,
              ]}
            >
              {label}
            </Animated.Text>
            {required && <Text style={styles.required}>*</Text>}
          </View>
        )}

        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onContentSizeChange={handleContentSizeChange}
          placeholder={!label || isFocused ? placeholder : undefined}
          placeholderTextColor={colors.dark.textTertiary}
          editable={!disabled}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          style={[
            styles.input,
            { height: contentHeight },
            isFocused && styles.inputFocused,
            error && styles.inputError,
            success && !error && styles.inputSuccess,
            disabled && styles.inputDisabled,
          ]}
          accessible={true}
          accessibilityLabel={label}
          accessibilityRequired={required}
          accessibilityInvalid={!!error}
          accessibilityDescribedBy={errorId || helperId}
          {...textInputProps}
        />

        {showCounter && (
          <Text style={styles.counter}>
            {characterCount}/{maxLength}
          </Text>
        )}

        {error && (
          <Text
            nativeID={errorId}
            style={styles.errorText}
            accessible={true}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        )}

        {!error && helper && (
          <Text
            nativeID={helperId}
            style={styles.helperText}
          >
            {helper}
          </Text>
        )}
      </View>
    );
  }
);

TextArea.displayName = 'TextArea';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textSecondary,
    position: 'absolute',
    left: spacing.md,
    backgroundColor: colors.dark.bgPrimary,
    paddingHorizontal: spacing.xs,
  },
  labelFocused: {
    color: colors.primary.default,
  },
  labelError: {
    color: colors.semantic.error,
  },
  required: {
    color: colors.semantic.error,
    fontSize: typography.fontSize.md,
    marginLeft: spacing.xs / 2,
  },
  input: {
    backgroundColor: 'rgba(37, 37, 37, 0.8)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    minHeight: 120,
    ...Platform.select({
      ios: {
        paddingTop: spacing.md,
      },
      android: {
        textAlignVertical: 'top',
      },
    }),
  },
  inputFocused: {
    borderColor: colors.primary.default,
    backgroundColor: 'rgba(37, 37, 37, 1)',
    shadowColor: colors.primary.default,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  inputSuccess: {
    borderColor: colors.semantic.success,
  },
  inputDisabled: {
    backgroundColor: 'rgba(37, 37, 37, 0.4)',
    color: colors.dark.textTertiary,
    opacity: 0.5,
  },
  counter: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.textTertiary,
    marginTop: spacing.xs,
  },
});

export default TextArea;
