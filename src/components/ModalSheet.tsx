import { forwardRef, ReactNode, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, shadows } from '../design/tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const DISMISS_THRESHOLD = 100; // Swipe down distance to dismiss

export interface ModalSheetProps {
  /**
   * Modal visibility
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Show drag handle
   * @default true
   */
  showDragHandle?: boolean;

  /**
   * Enable swipe to dismiss
   * @default true
   */
  swipeToDismiss?: boolean;

  /**
   * Enable backdrop dismiss
   * @default true
   */
  backdropDismiss?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom title style
   */
  titleStyle?: TextStyle;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Modal Sheet Component
 *
 * Bottom-anchored modal sheet with swipe-to-dismiss gesture.
 * Implements design spec section 6.5 (Bottom Sheet).
 *
 * Features:
 * - Spring animation entrance/exit
 * - Drag handle (optional)
 * - Swipe down to dismiss gesture
 * - Backdrop tap to dismiss
 * - Focus trap (modal accessibility)
 * - Max height 90vh
 * - Respects safe area insets
 *
 * @example
 * ```tsx
 * <ModalSheet
 *   visible={isOpen}
 *   onClose={handleClose}
 *   title="Filter Tasks"
 * >
 *   <Text>Sheet content...</Text>
 * </ModalSheet>
 *
 * <ModalSheet
 *   visible={isOpen}
 *   onClose={handleClose}
 *   swipeToDismiss={false}
 *   backdropDismiss={false}
 * >
 *   <Text>Non-dismissible sheet</Text>
 * </ModalSheet>
 * ```
 */
export const ModalSheet = forwardRef<View, ModalSheetProps>(
  (
    {
      visible,
      onClose,
      title,
      children,
      showDragHandle = true,
      swipeToDismiss = true,
      backdropDismiss = true,
      style,
      titleStyle,
      accessibilityLabel,
    },
    ref
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);

    // Animate in/out when visibility changes
    useEffect(() => {
      if (visible) {
        translateY.value = withSpring(0, {
          damping: 30,
          stiffness: 250,
        });
        backdropOpacity.value = withTiming(0.6, { duration: 250 });
      } else {
        translateY.value = withSpring(SCREEN_HEIGHT, {
          damping: 30,
          stiffness: 250,
        });
        backdropOpacity.value = withTiming(0, { duration: 250 });
      }
    }, [visible]);

    // Swipe gesture handler
    const panGesture = Gesture.Pan()
      .enabled(swipeToDismiss)
      .onUpdate((event) => {
        // Only allow downward swipes
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      })
      .onEnd((event) => {
        if (event.translationY > DISMISS_THRESHOLD) {
          // Dismiss if swiped beyond threshold
          translateY.value = withSpring(SCREEN_HEIGHT, {
            damping: 30,
            stiffness: 250,
          });
          backdropOpacity.value = withTiming(0, { duration: 250 });
          runOnJS(onClose)();
        } else {
          // Snap back if not enough swipe distance
          translateY.value = withSpring(0, {
            damping: 30,
            stiffness: 250,
          });
        }
      });

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const handleBackdropPress = () => {
      if (backdropDismiss) {
        onClose();
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none" // We handle animation with Reanimated
        onRequestClose={onClose}
        statusBarTranslucent
        accessible={true}
        accessibilityLabel={accessibilityLabel || title || 'Modal sheet'}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleBackdropPress}
          >
            <Animated.View
              style={[styles.backdrop, backdropAnimatedStyle]}
            />
          </TouchableOpacity>

          {/* Sheet */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              ref={ref}
              style={[
                styles.sheet,
                sheetAnimatedStyle,
                style,
              ]}
            >
              {/* Drag handle */}
              {showDragHandle && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}

              {/* Title */}
              {title && (
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, titleStyle]}>{title}</Text>
                </View>
              )}

              {/* Content */}
              <View style={styles.contentContainer}>{children}</View>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    );
  }
);

ModalSheet.displayName = 'ModalSheet';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: colors.dark.bgSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: MAX_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg + 20 : spacing.lg, // iOS safe area
    ...shadows.xl,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.dark.textPrimary,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
  },
});

export default ModalSheet;
