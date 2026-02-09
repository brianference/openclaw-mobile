import { forwardRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography } from '../design/tokens';

export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeType = 'count' | 'dot';

export interface BadgeProps {
  /**
   * Badge count (for count type)
   */
  count?: number;

  /**
   * Badge type
   * @default 'count'
   */
  type?: BadgeType;

  /**
   * Size variant
   * @default 'medium'
   */
  size?: BadgeSize;

  /**
   * Maximum count to display (shows "max+" above this)
   * @default 99
   */
  maxCount?: number;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Background color
   * @default colors.semantic.error (red)
   */
  backgroundColor?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

const SIZE_STYLES = {
  small: {
    minWidth: 16,
    minHeight: 16,
    borderRadius: 8,
    fontSize: 10,
    paddingHorizontal: 3,
  },
  medium: {
    minWidth: 20,
    minHeight: 20,
    borderRadius: 10,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  large: {
    minWidth: 24,
    minHeight: 24,
    borderRadius: 12,
    fontSize: 14,
    paddingHorizontal: 5,
  },
} as const;

/**
 * Badge Component
 *
 * Implements design spec section 17.
 * Used for notification counts and presence indicators.
 *
 * Features:
 * - Count display with max limit (shows "99+" above max)
 * - Dot variant for presence indicators
 * - Three size variants
 * - Position absolute styling (typically top-right of parent)
 *
 * @example
 * ```tsx
 * <View>
 *   <Icon name="notifications" />
 *   <Badge count={5} />
 * </View>
 *
 * <Badge
 *   count={150}
 *   maxCount={99}
 *   size="large"
 * />
 *
 * <Badge type="dot" />
 * ```
 */
export const Badge = forwardRef<View, BadgeProps>(
  (
    {
      count = 0,
      type = 'count',
      size = 'medium',
      maxCount = 99,
      style,
      textStyle,
      backgroundColor = colors.semantic.error,
      accessibilityLabel,
    },
    ref
  ) => {
    const sizeStyle = SIZE_STYLES[size];

    // Don't render if count is 0 or negative
    if (count <= 0 && type === 'count') {
      return null;
    }

    const displayText =
      count > maxCount ? `${maxCount}+` : count.toString();

    const defaultAccessibilityLabel =
      type === 'dot'
        ? 'New notification'
        : `${count} unread notification${count !== 1 ? 's' : ''}`;

    if (type === 'dot') {
      return (
        <View
          ref={ref}
          accessible={true}
          accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
          accessibilityRole="text"
          style={[
            styles.badge,
            {
              width: sizeStyle.minWidth / 2,
              height: sizeStyle.minHeight / 2,
              borderRadius: sizeStyle.borderRadius / 2,
              backgroundColor,
            },
            style,
          ]}
        />
      );
    }

    return (
      <View
        ref={ref}
        accessible={true}
        accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
        accessibilityRole="text"
        style={[
          styles.badge,
          {
            minWidth: sizeStyle.minWidth,
            minHeight: sizeStyle.minHeight,
            borderRadius: sizeStyle.borderRadius,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            backgroundColor,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyle.fontSize,
            },
            textStyle,
          ]}
        >
          {displayText}
        </Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  text: {
    color: '#ffffff',
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
});

export default Badge;
