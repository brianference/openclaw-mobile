import { forwardRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows, touchTargets } from '../design/tokens';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Button text content
   */
  children: string;

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size variant
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Optional icon from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Icon position relative to text
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';

  /**
   * Disable button interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;

  /**
   * Press handler
   */
  onPress?: () => void;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom text style
   */
  textStyle?: TextStyle;
}

const VARIANT_COLORS = {
  primary: {
    gradientColors: [colors.primary.default, colors.primary.dark],
    textColor: '#ffffff',
    disabledOpacity: 0.5,
  },
  accent: {
    gradientColors: [colors.accent.default, colors.accent.dark],
    textColor: '#ffffff',
    disabledOpacity: 0.5,
  },
  secondary: {
    gradientColors: [colors.dark.surface, colors.dark.surfaceElevated],
    textColor: colors.dark.textPrimary,
    disabledOpacity: 0.5,
  },
  ghost: {
    gradientColors: ['transparent', 'transparent'],
    textColor: colors.primary.default,
    disabledOpacity: 0.5,
  },
} as const;

const SIZE_STYLES = {
  small: {
    height: 36,
    paddingHorizontal: spacing.lg, // 20px
    fontSize: typography.fontSize.sm,
    iconSize: 16,
  },
  medium: {
    height: touchTargets.minimum, // 44px
    paddingHorizontal: spacing.lg, // 24px
    fontSize: typography.fontSize.md,
    iconSize: 20,
  },
  large: {
    height: touchTargets.large, // 52px
    paddingHorizontal: 28,
    fontSize: typography.fontSize.lg,
    iconSize: 24,
  },
} as const;

/**
 * Primary Button Component
 *
 * Implements design spec section 6.2 with:
 * - Gradient backgrounds (primary/accent variants)
 * - Three size variants (small, medium, large)
 * - Loading and disabled states
 * - Optional icons
 * - 44px minimum touch target (WCAG compliance)
 * - Scale animation on press
 *
 * @example
 * ```tsx
 * <Button onPress={handleSubmit}>
 *   Save Changes
 * </Button>
 *
 * <Button
 *   variant="accent"
 *   size="large"
 *   icon="checkmark-circle"
 *   onPress={handleComplete}
 * >
 *   Complete Task
 * </Button>
 * ```
 */
export const Button = forwardRef<View, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      icon,
      iconPosition = 'left',
      disabled = false,
      loading = false,
      onPress,
      style,
      textStyle,
    },
    ref
  ) => {
    const sizeStyle = SIZE_STYLES[size];
    const variantStyle = VARIANT_COLORS[variant];
    const isDisabled = disabled || loading;

    const iconElement = icon && !loading && (
      <Ionicons
        name={icon}
        size={sizeStyle.iconSize}
        color={variantStyle.textColor}
        style={styles.icon}
      />
    );

    const content = (
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variantStyle.textColor} size="small" />
        ) : (
          <>
            {iconPosition === 'left' && iconElement}
            <Text
              style={[
                styles.text,
                {
                  color: variantStyle.textColor,
                  fontSize: sizeStyle.fontSize,
                  fontWeight: typography.fontWeight.semibold,
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
            {iconPosition === 'right' && iconElement}
          </>
        )}
      </View>
    );

    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.container,
          {
            height: sizeStyle.height,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            opacity: isDisabled ? variantStyle.disabledOpacity : 1,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={variantStyle.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    // Icon spacing handled by gap in content container
  },
});

export default Button;
