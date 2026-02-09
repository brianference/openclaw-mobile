import { forwardRef, ReactNode } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../design/tokens';

export type ListItemAccessory = 'chevron' | 'badge' | 'toggle' | 'none';

export interface ListItemProps {
  /**
   * Primary text
   */
  title: string;

  /**
   * Secondary text (optional)
   */
  subtitle?: string;

  /**
   * Leading icon
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Icon color
   * @default colors.dark.textPrimary
   */
  iconColor?: string;

  /**
   * Icon background color (for circular icon containers)
   */
  iconBackgroundColor?: string;

  /**
   * Right accessory type
   * @default 'none'
   */
  accessory?: ListItemAccessory;

  /**
   * Badge count (when accessory is 'badge')
   */
  badgeCount?: number;

  /**
   * Toggle state (when accessory is 'toggle')
   */
  toggleValue?: boolean;

  /**
   * Custom right element
   */
  rightElement?: ReactNode;

  /**
   * Divider below item
   * @default true
   */
  showDivider?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Press handler
   */
  onPress?: () => void;

  /**
   * Long press handler (for multi-select mode)
   */
  onLongPress?: () => void;

  /**
   * Toggle change handler
   */
  onToggleChange?: (value: boolean) => void;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom title style
   */
  titleStyle?: TextStyle;

  /**
   * Custom subtitle style
   */
  subtitleStyle?: TextStyle;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint
   */
  accessibilityHint?: string;
}

/**
 * ListItem Component
 *
 * Implements design spec section 5 (Screen Specifications).
 * Used throughout Task List, Vault, Settings, and other list views.
 *
 * Features:
 * - 72px minimum height (WCAG touch target)
 * - Optional icon with circular background
 * - Title and subtitle text hierarchy
 * - Multiple accessory types (chevron, badge, toggle)
 * - Divider support
 * - Press feedback
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <ListItem
 *   title="Appearance"
 *   subtitle="Theme and colors"
 *   icon="color-palette"
 *   accessory="chevron"
 *   onPress={handlePress}
 * />
 *
 * <ListItem
 *   title="Notifications"
 *   icon="notifications"
 *   accessory="toggle"
 *   toggleValue={enabled}
 *   onToggleChange={setEnabled}
 * />
 *
 * <ListItem
 *   title="Tasks"
 *   icon="checkbox"
 *   accessory="badge"
 *   badgeCount={5}
 * />
 * ```
 */
export const ListItem = forwardRef<View, ListItemProps>(
  (
    {
      title,
      subtitle,
      icon,
      iconColor = colors.dark.textPrimary,
      iconBackgroundColor,
      accessory = 'none',
      badgeCount,
      toggleValue = false,
      rightElement,
      showDivider = true,
      disabled = false,
      onPress,
      onLongPress,
      onToggleChange,
      style,
      titleStyle,
      subtitleStyle,
      accessibilityLabel,
      accessibilityHint,
    },
    ref
  ) => {
    const handlePress = () => {
      if (disabled) return;
      if (accessory === 'toggle' && onToggleChange) {
        onToggleChange(!toggleValue);
      } else if (onPress) {
        onPress();
      }
    };

    const renderAccessory = () => {
      if (rightElement) {
        return rightElement;
      }

      switch (accessory) {
        case 'chevron':
          return (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.dark.textTertiary}
            />
          );

        case 'badge':
          if (badgeCount && badgeCount > 0) {
            return (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Text>
              </View>
            );
          }
          return null;

        case 'toggle':
          return (
            <View
              style={[
                styles.toggle,
                toggleValue && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  toggleValue && styles.toggleKnobActive,
                ]}
              />
            </View>
          );

        default:
          return null;
      }
    };

    const accessibilityState = {
      disabled,
      ...(accessory === 'toggle' && { checked: toggleValue }),
    };

    return (
      <View ref={ref} style={[styles.wrapper, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={onLongPress}
          disabled={disabled || (!onPress && accessory !== 'toggle')}
          activeOpacity={0.7}
          style={[
            styles.container,
            disabled && styles.containerDisabled,
          ]}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessory === 'toggle' ? 'switch' : 'button'}
          accessibilityState={accessibilityState}
        >
          {/* Left Icon */}
          {icon && (
            <View
              style={[
                styles.iconContainer,
                iconBackgroundColor && {
                  backgroundColor: iconBackgroundColor,
                },
              ]}
            >
              <Ionicons name={icon} size={24} color={iconColor} />
            </View>
          )}

          {/* Text Content */}
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                disabled && styles.titleDisabled,
                titleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>

            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  disabled && styles.subtitleDisabled,
                  subtitleStyle,
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Accessory */}
          {(accessory !== 'none' || rightElement) && (
            <View style={styles.accessoryContainer}>
              {renderAccessory()}
            </View>
          )}
        </TouchableOpacity>

        {/* Divider */}
        {showDivider && <View style={styles.divider} />}
      </View>
    );
  }
);

ListItem.displayName = 'ListItem';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: 'transparent',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.dark.textPrimary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  titleDisabled: {
    color: colors.dark.textTertiary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
    marginTop: spacing.xs,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  subtitleDisabled: {
    color: colors.dark.textTertiary,
  },
  accessoryContainer: {
    marginLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#ffffff',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.dark.surface,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent.default,
  },
  toggleKnob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark.border,
    marginLeft: icon ? spacing.md + 40 + spacing.md : spacing.md,
  },
});

export default ListItem;
