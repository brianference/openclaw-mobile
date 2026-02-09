import { forwardRef, ReactNode, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ViewStyle,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors, spacing, shadows, zIndex } from '../design/tokens';

export type DrawerPosition = 'left' | 'right';

export interface DrawerProps {
  /**
   * Drawer visibility
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Drawer content
   */
  children: ReactNode;

  /**
   * Drawer position
   * @default 'left'
   */
  position?: DrawerPosition;

  /**
   * Drawer width
   * @default 280
   */
  width?: number;

  /**
   * Custom drawer style
   */
  style?: ViewStyle;

  /**
   * Custom backdrop style
   */
  backdropStyle?: ViewStyle;

  /**
   * Backdrop opacity
   * @default 0.4
   */
  backdropOpacity?: number;

  /**
   * Enable backdrop blur
   * @default true
   */
  blurBackdrop?: boolean;

  /**
   * Animation duration (ms)
   * @default 300
   */
  animationDuration?: number;

  /**
   * Accessibility label for drawer
   */
  accessibilityLabel?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Drawer Component (Navigation Drawer)
 *
 * Implements design spec navigation patterns.
 * Side navigation drawer with glassmorphic styling and smooth animations.
 *
 * Features:
 * - Slides in from left or right
 * - Backdrop with optional blur
 * - Spring animations for natural feel
 * - Tap outside to dismiss
 * - Proper z-index layering
 * - Safe area aware
 * - Full accessibility support
 * - Keyboard dismissible (hardware back button on Android)
 *
 * @example
 * ```tsx
 * <Drawer
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <View style={styles.drawerContent}>
 *     <ListItem
 *       title="Settings"
 *       icon="settings"
 *       onPress={handleSettings}
 *     />
 *     <ListItem
 *       title="About"
 *       icon="information-circle"
 *       onPress={handleAbout}
 *     />
 *   </View>
 * </Drawer>
 * ```
 */
export const Drawer = forwardRef<View, DrawerProps>(
  (
    {
      visible,
      onClose,
      children,
      position = 'left',
      width = 280,
      style,
      backdropStyle,
      backdropOpacity = 0.4,
      blurBackdrop = true,
      animationDuration = 300,
      accessibilityLabel,
    },
    ref
  ) => {
    const translateX = useSharedValue(position === 'left' ? -width : width);
    const backdropOpacityValue = useSharedValue(0);

    useEffect(() => {
      if (visible) {
        // Animate drawer in
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 120,
        });
        backdropOpacityValue.value = withTiming(backdropOpacity, {
          duration: animationDuration,
        });
      } else {
        // Animate drawer out
        translateX.value = withTiming(
          position === 'left' ? -width : width,
          { duration: animationDuration }
        );
        backdropOpacityValue.value = withTiming(0, {
          duration: animationDuration,
        });
      }
    }, [visible, position, width, backdropOpacity, animationDuration]);

    const drawerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacityValue.value,
    }));

    const handleBackdropPress = () => {
      onClose();
    };

    if (!visible) {
      return null;
    }

    const drawerPositionStyle: ViewStyle =
      position === 'left' ? { left: 0 } : { right: 0 };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
        hardwareAccelerated
      >
        <View style={styles.container}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <Animated.View
              style={[
                styles.backdrop,
                backdropAnimatedStyle,
                backdropStyle,
              ]}
            >
              {blurBackdrop && Platform.OS === 'ios' ? (
                <BlurView
                  intensity={30}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: colors.dark.bgPrimary },
                  ]}
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>

          {/* Drawer */}
          <Animated.View
            ref={ref}
            style={[
              styles.drawer,
              drawerPositionStyle,
              { width },
              drawerAnimatedStyle,
              style,
            ]}
            accessible={true}
            accessibilityLabel={accessibilityLabel || 'Navigation drawer'}
            accessibilityRole="menu"
            accessibilityViewIsModal={true}
          >
            <View style={styles.drawerInner}>{children}</View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

Drawer.displayName = 'Drawer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: zIndex.modalBackdrop,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.dark.bgSecondary,
    zIndex: zIndex.modal,
    ...shadows.xl,
    // Safe area handling
    paddingTop: Platform.select({
      ios: 44, // Status bar + notch
      android: StatusBar.currentHeight || 24,
    }),
  },
  drawerInner: {
    flex: 1,
    paddingVertical: spacing.md,
  },
});

export default Drawer;
