import { forwardRef, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, touchTargets } from '../design/tokens';

export type HeaderAlignment = 'left' | 'center';

export interface HeaderAction {
  /**
   * Icon name from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Action handler
   */
  onPress: () => void;

  /**
   * Accessibility label
   */
  accessibilityLabel: string;

  /**
   * Badge count (optional)
   */
  badge?: number;
}

export interface HeaderProps {
  /**
   * Header title text
   */
  title: string;

  /**
   * Title alignment
   * @default 'left'
   */
  alignment?: HeaderAlignment;

  /**
   * Show back button
   * @default false
   */
  showBack?: boolean;

  /**
   * Back button handler
   */
  onBack?: () => void;

  /**
   * Right-side action buttons (max 3 recommended)
   */
  actions?: HeaderAction[];

  /**
   * Custom content below title (e.g., search bar)
   */
  children?: ReactNode;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom title style
   */
  titleStyle?: TextStyle;

  /**
   * Include safe area padding
   * @default true
   */
  safeArea?: boolean;
}

/**
 * Header Component
 *
 * Universal app header used across all screens.
 * Implements design spec navigation patterns.
 *
 * Features:
 * - Optional back button (left)
 * - Title text (left or center aligned)
 * - Action buttons (right, max 3)
 * - Optional children (search bar, filters, etc.)
 * - SafeArea compatible
 * - 44px minimum touch targets (WCAG)
 * - Badge support for notifications
 *
 * @example
 * ```tsx
 * <Header
 *   title="Tasks"
 *   actions={[
 *     {
 *       icon: 'add',
 *       onPress: handleAdd,
 *       accessibilityLabel: 'Add task',
 *     },
 *   ]}
 * />
 *
 * <Header
 *   title="Task Detail"
 *   showBack
 *   onBack={handleBack}
 *   actions={[
 *     {
 *       icon: 'ellipsis-horizontal',
 *       onPress: handleMore,
 *       accessibilityLabel: 'More options',
 *     },
 *   ]}
 * />
 * ```
 */
export const Header = forwardRef<View, HeaderProps>(
  (
    {
      title,
      alignment = 'left',
      showBack = false,
      onBack,
      actions = [],
      children,
      style,
      titleStyle,
      safeArea = true,
    },
    ref
  ) => {
    const statusBarHeight = safeArea
      ? Platform.OS === 'ios'
        ? 44 // iOS status bar
        : StatusBar.currentHeight || 24 // Android status bar
      : 0;

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          { paddingTop: statusBarHeight + spacing.sm },
          style,
        ]}
      >
        <View style={styles.header}>
          {/* Left: Back button or spacer */}
          <View style={styles.leftSection}>
            {showBack && onBack ? (
              <TouchableOpacity
                onPress={onBack}
                style={styles.iconButton}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.dark.textPrimary}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButtonSpacer} />
            )}
          </View>

          {/* Center: Title */}
          <View
            style={[
              styles.titleContainer,
              alignment === 'center' && styles.titleContainerCenter,
            ]}
          >
            <Text
              style={[
                styles.title,
                alignment === 'center' && styles.titleCenter,
                titleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* Right: Action buttons */}
          <View style={styles.rightSection}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={styles.iconButton}
                accessibilityLabel={action.accessibilityLabel}
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={action.icon}
                  size={24}
                  color={colors.dark.textPrimary}
                />
                {action.badge !== undefined && action.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {action.badge > 99 ? '99+' : action.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {actions.length === 0 && <View style={styles.iconButtonSpacer} />}
          </View>
        </View>

        {/* Optional children (search bar, filters, etc.) */}
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>
    );
  }
);

Header.displayName = 'Header';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: touchTargets.minimum, // 44px WCAG minimum
  },
  leftSection: {
    width: touchTargets.minimum,
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconButtonSpacer: {
    width: touchTargets.minimum,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  titleContainerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.dark.textPrimary,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  titleCenter: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.semantic.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#ffffff',
    lineHeight: 12,
  },
  childrenContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});

export default Header;
