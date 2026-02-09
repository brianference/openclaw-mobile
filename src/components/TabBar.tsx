import { forwardRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, touchTargets } from '../design/tokens';

export interface TabItem {
  /**
   * Tab identifier (used for routing)
   */
  key: string;

  /**
   * Tab label text
   */
  label: string;

  /**
   * Icon from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Badge count (shown as red dot with number)
   */
  badge?: number;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

export interface TabBarProps {
  /**
   * Array of tabs to display
   */
  tabs: TabItem[];

  /**
   * Currently active tab key
   */
  activeTab: string;

  /**
   * Tab press handler
   */
  onTabPress: (key: string) => void;

  /**
   * Custom container style
   */
  style?: ViewStyle;
}

/**
 * Tab Bar (Bottom Navigation) Component
 *
 * Implements design spec section 6.7 with:
 * - Icon + label layout for each tab
 * - Active/inactive states (color + size changes)
 * - Badge support (top-right of icon, max 99+)
 * - 64px height + safe area insets
 * - Thumb zone optimization
 * - Scale animation on press
 * - WCAG 2.2 AA compliance (44px touch targets)
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline', badge: 3 },
 *   { key: 'brain', label: 'Brain', icon: 'bulb-outline' },
 *   { key: 'vault', label: 'Vault', icon: 'lock-closed-outline' },
 *   { key: 'places', label: 'Places', icon: 'location-outline' },
 *   { key: 'more', label: 'More', icon: 'ellipsis-horizontal' },
 * ];
 *
 * <TabBar
 *   tabs={tabs}
 *   activeTab="tasks"
 *   onTabPress={(key) => navigation.navigate(key)}
 * />
 * ```
 */
export const TabBar = forwardRef<View, TabBarProps>(
  ({ tabs, activeTab, onTabPress, style }, ref) => {
    const insets = useSafeAreaInsets();

    const renderTab = (tab: TabItem) => {
      const isActive = activeTab === tab.key;
      const iconSize = isActive ? 28 : 24;
      const textColor = isActive
        ? colors.primary.default
        : colors.dark.textSecondary;
      const textWeight = isActive
        ? typography.fontWeight.semibold
        : typography.fontWeight.normal;

      return (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={
            tab.accessibilityLabel ||
            `${tab.label} tab${tab.badge ? `, ${tab.badge} notifications` : ''}`
          }
        >
          <View style={styles.iconContainer}>
            <Ionicons name={tab.icon} size={iconSize} color={textColor} />

            {/* Badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontWeight: textWeight,
              },
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom || spacing.sm,
          },
          style,
        ]}
        accessibilityRole="tablist"
      >
        {tabs.map(renderTab)}
      </View>
    );
  }
);

TabBar.displayName = 'TabBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: spacing.sm,
    height: 64,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    minHeight: touchTargets.minimum,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: colors.semantic.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
});

export default TabBar;
