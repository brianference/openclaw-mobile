import { forwardRef, ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { colors, spacing, typography } from '../design/tokens';

export type CardType = 'task' | 'secret' | 'note' | 'place';

export interface CardProps {
  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Card type (determines left border color)
   */
  type?: CardType;

  /**
   * Card title
   */
  title?: string;

  /**
   * Subtitle or metadata text
   */
  subtitle?: string;

  /**
   * Completed state (for tasks)
   * @default false
   */
  completed?: boolean;

  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Make card tappable
   */
  onPress?: () => void;

  /**
   * Long press handler
   */
  onLongPress?: () => void;

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
}

const TYPE_COLORS: Record<CardType, string> = {
  task: colors.primary.default, // Blue
  secret: colors.semantic.error, // Red (secure)
  note: colors.accent.default, // Green
  place: colors.semantic.warning, // Orange
};

const TYPE_ICONS: Record<CardType, keyof typeof Ionicons.glyphMap> = {
  task: 'checkbox-outline',
  secret: 'lock-closed',
  note: 'document-text',
  place: 'location',
};

/**
 * Card Component
 *
 * Implements design spec section 16 (Card - Task/Secret/Note).
 * Built on top of GlassCard with type-specific styling.
 *
 * Features:
 * - Four card types with distinct left border colors
 * - Optional icon and metadata
 * - Completed state with strikethrough (tasks)
 * - Swipeable (when used with gesture handler)
 * - Inherits GlassCard press animations
 *
 * @example
 * ```tsx
 * <Card
 *   type="task"
 *   title="Write design spec"
 *   subtitle="Due: Feb 9, 2PM"
 *   onPress={handlePress}
 * >
 *   <Text>Task details...</Text>
 * </Card>
 *
 * <Card
 *   type="secret"
 *   title="GitHub Login"
 *   subtitle="brianference"
 *   completed={false}
 * >
 *   <Text>•••••••••••</Text>
 * </Card>
 * ```
 */
export const Card = forwardRef<View, CardProps>(
  (
    {
      children,
      type = 'task',
      title,
      subtitle,
      completed = false,
      icon,
      onPress,
      onLongPress,
      style,
      titleStyle,
      subtitleStyle,
      accessibilityLabel,
    },
    ref
  ) => {
    const borderLeftColor = TYPE_COLORS[type];
    const defaultIcon = icon || TYPE_ICONS[type];

    return (
      <GlassCard
        ref={ref}
        pressable={!!onPress}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={onPress ? 'button' : 'none'}
        style={[
          styles.card,
          {
            borderLeftColor,
            borderLeftWidth: 4,
          },
          completed && styles.cardCompleted,
          style,
        ]}
      >
        <View style={styles.header}>
          {defaultIcon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name={completed && type === 'task' ? 'checkbox' : defaultIcon}
                size={24}
                color={
                  completed ? colors.dark.textTertiary : colors.dark.textPrimary
                }
              />
            </View>
          )}

          <View style={styles.headerText}>
            {title && (
              <Text
                style={[
                  styles.title,
                  completed && styles.titleCompleted,
                  titleStyle,
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>
            )}

            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  completed && styles.subtitleCompleted,
                  subtitleStyle,
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {children && <View style={styles.content}>{children}</View>}
      </GlassCard>
    );
  }
);

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.sm + 2,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  titleCompleted: {
    color: colors.dark.textTertiary,
    textDecorationLine: 'line-through',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
  },
  subtitleCompleted: {
    color: colors.dark.textTertiary,
  },
  content: {
    marginTop: spacing.sm + 2,
  },
});

export default Card;
