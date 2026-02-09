import { forwardRef, ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radius, shadows, glassmorphism } from '../design/tokens';

export type GlassCardVariant = 'default' | 'elevated' | 'pressed';

export interface GlassCardProps {
  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: GlassCardVariant;

  /**
   * Make card tappable with press animation
   * @default false
   */
  pressable?: boolean;

  /**
   * Press handler (only works if pressable is true)
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
   * Blur intensity (0-100)
   * @default 80
   */
  blurIntensity?: number;

  /**
   * Enable press animation
   * @default true
   */
  animatePress?: boolean;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Accessibility role
   */
  accessibilityRole?: 'none' | 'button' | 'link' | 'header' | 'image' | 'text';
}

const VARIANT_STYLES: Record<GlassCardVariant, ViewStyle> = {
  default: {
    backgroundColor: glassmorphism.default.backgroundColor,
    borderColor: glassmorphism.default.borderColor,
  },
  elevated: {
    backgroundColor: glassmorphism.elevated.backgroundColor,
    borderColor: glassmorphism.elevated.borderColor,
  },
  pressed: {
    backgroundColor: glassmorphism.pressed.backgroundColor,
    borderColor: glassmorphism.pressed.borderColor,
  },
};

/**
 * Glass Card Component
 *
 * Implements glassmorphic design with backdrop blur effect.
 * Used as the foundation for many other components.
 *
 * Features:
 * - Backdrop blur effect (iOS/Android 12+)
 * - Three visual variants (default, elevated, pressed)
 * - Optional press animation with scale effect
 * - Graceful degradation on older Android versions
 * - Follows design spec section 1 (Glass Card)
 *
 * @example
 * ```tsx
 * <GlassCard>
 *   <Text>Card content</Text>
 * </GlassCard>
 *
 * <GlassCard
 *   variant="elevated"
 *   pressable
 *   onPress={handlePress}
 * >
 *   <Text>Tappable card</Text>
 * </GlassCard>
 * ```
 */
export const GlassCard = forwardRef<View, GlassCardProps>(
  (
    {
      children,
      variant = 'default',
      pressable = false,
      onPress,
      onLongPress,
      style,
      blurIntensity = 80,
      animatePress = true,
      accessibilityLabel,
      accessibilityRole = 'none',
    },
    ref
  ) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      if (animatePress) {
        scale.value = withSpring(0.98, {
          damping: 15,
          stiffness: 300,
        });
        opacity.value = withTiming(0.8, { duration: 150 });
      }
    };

    const handlePressOut = () => {
      if (animatePress) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
          overshootClamping: false,
        });
        opacity.value = withTiming(1, { duration: 150 });
      }
    };

    const variantStyle = VARIANT_STYLES[variant];

    // On older Android versions (< 12), BlurView may not work well
    // so we use a solid background as fallback
    const useBlur = Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version >= 31);

    const content = (
      <View style={[styles.content, { padding: spacing.md }]}>{children}</View>
    );

    const cardStyle = [
      styles.card,
      variantStyle,
      variant === 'elevated' && shadows.md,
      variant === 'default' && shadows.sm,
      style,
    ];

    if (pressable && onPress) {
      return (
        <Animated.View style={animatedStyle} ref={ref}>
          <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            accessible={true}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole === 'none' ? 'button' : accessibilityRole}
          >
            {useBlur ? (
              <BlurView intensity={blurIntensity} tint="dark" style={cardStyle}>
                {content}
              </BlurView>
            ) : (
              <View style={cardStyle}>{content}</View>
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={animatedStyle} ref={ref}>
        {useBlur ? (
          <BlurView
            intensity={blurIntensity}
            tint="dark"
            style={cardStyle}
            accessible={!!accessibilityLabel}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
          >
            {content}
          </BlurView>
        ) : (
          <View
            style={cardStyle}
            accessible={!!accessibilityLabel}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
          >
            {content}
          </View>
        )}
      </Animated.View>
    );
  }
);

GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: glassmorphism.default.borderWidth,
    overflow: 'hidden',
  },
  content: {
    // Padding is applied dynamically via spacing.md
  },
});

export default GlassCard;
