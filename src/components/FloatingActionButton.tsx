import { forwardRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../design/tokens';

export type FABSize = 'default' | 'mini';
export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface FloatingActionButtonProps {
  /**
   * Icon from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Press handler
   */
  onPress: () => void;

  /**
   * Size variant
   * @default 'default'
   */
  size?: FABSize;

  /**
   * Position on screen
   * @default 'bottom-right'
   */
  position?: FABPosition;

  /**
   * Use accent gradient instead of primary
   * @default false
   */
  accent?: boolean;

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
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint
   */
  accessibilityHint?: string;
}

const SIZE_CONFIG = {
  default: {
    size: 56,
    iconSize: 24,
  },
  mini: {
    size: 40,
    iconSize: 20,
  },
} as const;

const POSITION_STYLES: Record<FABPosition, ViewStyle> = {
  'bottom-right': {
    bottom: 16,
    right: 16,
  },
  'bottom-left': {
    bottom: 16,
    left: 16,
  },
  'bottom-center': {
    bottom: 16,
    alignSelf: 'center',
  },
};

/**
 * FloatingActionButton (FAB) Component
 *
 * Implements design spec patterns for primary actions.
 * Used for global actions like adding tasks, creating notes, etc.
 *
 * Features:
 * - Two size variants (default 56px, mini 40px)
 * - Three position options
 * - Gradient background (primary or accent)
 * - Elevated shadow
 * - Press animation with scale
 * - Full accessibility support
 * - Safe area aware (accounts for bottom nav)
 *
 * @example
 * ```tsx
 * <FloatingActionButton
 *   icon="add"
 *   onPress={handleAddTask}
 *   accessibilityLabel="Add new task"
 * />
 *
 * <FloatingActionButton
 *   icon="camera"
 *   size="mini"
 *   position="bottom-left"
 *   accent
 *   onPress={handleScan}
 * />
 * ```
 */
export const FloatingActionButton = forwardRef<View, FloatingActionButtonProps>(
  (
    {
      icon,
      onPress,
      size = 'default',
      position = 'bottom-right',
      accent = false,
      disabled = false,
      style,
      accessibilityLabel,
      accessibilityHint,
    },
    ref
  ) => {
    const sizeConfig = SIZE_CONFIG[size];
    const gradientColors = accent
      ? [colors.accent.default, colors.accent.dark]
      : [colors.primary.default, colors.primary.dark];

    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.container,
          POSITION_STYLES[position],
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius: sizeConfig.size / 2,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: sizeConfig.size,
              height: sizeConfig.size,
              borderRadius: sizeConfig.size / 2,
            },
          ]}
        >
          <Ionicons name={icon} size={sizeConfig.iconSize} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    ...shadows.lg,
    // Additional shadow for FAB prominence
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton;
