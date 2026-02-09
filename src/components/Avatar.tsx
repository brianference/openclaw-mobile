import { forwardRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../design/tokens';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarType = 'initials' | 'image' | 'icon';

export interface AvatarProps {
  /**
   * Avatar type
   * @default 'initials'
   */
  type?: AvatarType;

  /**
   * User initials (1-2 characters)
   */
  initials?: string;

  /**
   * Image source
   */
  source?: ImageSourcePropType;

  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Size variant
   * @default 'medium'
   */
  size?: AvatarSize;

  /**
   * Background color
   * @default colors.primary.default
   */
  backgroundColor?: string;

  /**
   * Text/icon color
   * @default '#ffffff'
   */
  color?: string;

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

const SIZE_STYLES = {
  small: {
    size: 32,
    fontSize: 14,
    iconSize: 16,
  },
  medium: {
    size: 40,
    fontSize: 16,
    iconSize: 20,
  },
  large: {
    size: 56,
    fontSize: 20,
    iconSize: 28,
  },
  xlarge: {
    size: 80,
    fontSize: 28,
    iconSize: 40,
  },
} as const;

/**
 * Avatar Component
 *
 * Implements design spec section 18.
 * Displays user profile pictures, initials, or icons.
 *
 * Features:
 * - Three types: initials, image, icon
 * - Four size variants
 * - Fallback to initials if image fails to load
 * - Circular design
 *
 * @example
 * ```tsx
 * <Avatar
 *   type="initials"
 *   initials="BF"
 * />
 *
 * <Avatar
 *   type="image"
 *   source={{ uri: 'https://...' }}
 *   initials="BF"
 *   size="large"
 * />
 *
 * <Avatar
 *   type="icon"
 *   icon="person"
 * />
 * ```
 */
export const Avatar = forwardRef<View, AvatarProps>(
  (
    {
      type = 'initials',
      initials,
      source,
      icon = 'person',
      size = 'medium',
      backgroundColor = colors.primary.default,
      color = '#ffffff',
      style,
      textStyle,
      accessibilityLabel,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const sizeStyle = SIZE_STYLES[size];

    const containerStyle = {
      width: sizeStyle.size,
      height: sizeStyle.size,
      borderRadius: sizeStyle.size / 2,
      backgroundColor,
    };

    const defaultAccessibilityLabel =
      type === 'image' && !imageError
        ? `Profile picture${initials ? `. ${initials}` : ''}`
        : type === 'initials'
        ? `Avatar with initials ${initials}`
        : 'Profile icon';

    // If image type and source provided and no error
    if (type === 'image' && source && !imageError) {
      return (
        <View
          ref={ref}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
          style={[styles.container, containerStyle, style]}
        >
          <Image
            source={source}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        </View>
      );
    }

    // If icon type or image failed and no initials
    if (type === 'icon' || (imageError && !initials)) {
      return (
        <View
          ref={ref}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
          style={[styles.container, containerStyle, style]}
        >
          <Ionicons name={icon} size={sizeStyle.iconSize} color={color} />
        </View>
      );
    }

    // Fallback to initials
    const displayInitials = initials?.substring(0, 2).toUpperCase() || '?';

    return (
      <View
        ref={ref}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
        style={[styles.container, containerStyle, style]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyle.fontSize,
              color,
            },
            textStyle,
          ]}
        >
          {displayInitials}
        </Text>
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

export default Avatar;
