import { forwardRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '../design/tokens';

export type SkeletonShape = 'rect' | 'circle' | 'text';

export interface SkeletonLoaderProps {
  /**
   * Skeleton shape
   * @default 'rect'
   */
  shape?: SkeletonShape;

  /**
   * Width in pixels or percentage
   * @default '100%'
   */
  width?: number | string;

  /**
   * Height in pixels
   * @default 72
   */
  height?: number;

  /**
   * Border radius (overrides shape default)
   */
  borderRadius?: number;

  /**
   * Disable shimmer animation (for reduced motion)
   * @default false
   */
  disableAnimation?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;
}

/**
 * Skeleton Loader Component
 *
 * Implements design spec section 13.
 * Shows placeholder content while data is loading.
 *
 * Features:
 * - Shimmer animation (1.5s loop)
 * - Three shape variants
 * - Respects prefers-reduced-motion
 * - Smooth transition to real content (use with opacity)
 *
 * @example
 * ```tsx
 * // Loading state
 * {loading ? (
 *   <>
 *     <SkeletonLoader width="100%" height={72} />
 *     <SkeletonLoader width="100%" height={72} />
 *     <SkeletonLoader width="100%" height={72} />
 *   </>
 * ) : (
 *   <TaskList tasks={tasks} />
 * )}
 *
 * // Circle avatar
 * <SkeletonLoader shape="circle" width={40} height={40} />
 *
 * // Text line
 * <SkeletonLoader shape="text" width={200} height={16} />
 * ```
 */
export const SkeletonLoader = forwardRef<View, SkeletonLoaderProps>(
  (
    {
      shape = 'rect',
      width = '100%',
      height = 72,
      borderRadius: customBorderRadius,
      disableAnimation = false,
      style,
    },
    ref
  ) => {
    const shimmerPosition = useSharedValue(-1);

    useEffect(() => {
      if (!disableAnimation) {
        shimmerPosition.value = withRepeat(
          withTiming(1, {
            duration: 1500,
            easing: Easing.linear,
          }),
          -1, // Infinite
          false
        );
      }
    }, [disableAnimation, shimmerPosition]);

    const animatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerPosition.value,
        [-1, 1],
        [-200, 200]
      );

      return {
        transform: [{ translateX }],
      };
    });

    const getBorderRadius = () => {
      if (customBorderRadius !== undefined) return customBorderRadius;

      switch (shape) {
        case 'circle':
          return typeof width === 'number' ? width / 2 : 50;
        case 'text':
          return radius.sm - 4; // 4px
        case 'rect':
        default:
          return radius.sm; // 8px
      }
    };

    const getHeight = () => {
      if (shape === 'text') return 16;
      if (shape === 'circle' && typeof width === 'number') return width;
      return height;
    };

    return (
      <View
        ref={ref}
        accessible={true}
        accessibilityRole="status"
        accessibilityLabel="Loading"
        accessibilityLiveRegion="polite"
        style={[
          styles.container,
          {
            width: width as any,
            height: getHeight(),
            borderRadius: getBorderRadius(),
          },
          style,
        ]}
      >
        {!disableAnimation && (
          <Animated.View style={[styles.shimmer, animatedStyle]} />
        )}
      </View>
    );
  }
);

SkeletonLoader.displayName = 'SkeletonLoader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.bgSecondary,
    overflow: 'hidden',
  },
  shimmer: {
    width: '200%',
    height: '100%',
    backgroundColor: 'transparent',
    opacity: 0.5,
    shadowColor: colors.dark.bgTertiary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
});

export default SkeletonLoader;
