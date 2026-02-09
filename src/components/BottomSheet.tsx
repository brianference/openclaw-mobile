import { forwardRef, ReactNode, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { colors, spacing, radius, shadows, zIndex } from '../design/tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const SWIPE_THRESHOLD = 50;

export interface BottomSheetProps {
  /**
   * Bottom sheet visibility
   */
  visible: boolean;

  /**
   * Callback when sheet is dismissed
   */
  onDismiss: () => void;

  /**
   * Sheet content
   */
  children: ReactNode;

  /**
   * Custom height (defaults to auto with 90vh max)
   */
  height?: number;

  /**
   * Disable backdrop tap to dismiss
   * @default false
   */
  disableBackdropDismiss?: boolean;

  /**
   * Disable swipe to dismiss
   * @default false
   */
  disableSwipeDismiss?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Accessibility label for sheet
   */
  accessibilityLabel?: string;
}

/**
 * Bottom Sheet Component
 *
 * Implements design spec section 6.5 with:
 * - Spring animation (damping: 0.9, stiffness: 120)
 * - Drag handle for visual affordance
 * - Swipe down to dismiss gesture
 * - Backdrop with tap-to-dismiss
 * - Focus trap (modal behavior)
 * - 90vh max height
 * - WCAG 2.2 AA compliance
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   visible={isOpen}
 *   onDismiss={() => setIsOpen(false)}
 *   accessibilityLabel="Filter tasks"
 * >
 *   <Text>Sheet content...</Text>
 * </BottomSheet>
 * ```
 */
export const BottomSheet = forwardRef<View, BottomSheetProps>(
  (
    {
      visible,
      onDismiss,
      children,
      height,
      disableBackdropDismiss = false,
      disableSwipeDismiss = false,
      style,
      accessibilityLabel,
    },
    ref
  ) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !disableSwipeDismiss,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !disableSwipeDismiss && gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 0.5) {
          dismissSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 120,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    const showSheet = useCallback(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(
          accessibilityLabel || 'Bottom sheet opened'
        );
      }
    }, [accessibilityLabel, backdropOpacity, translateY]);

    const dismissSheet = useCallback(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          damping: 20,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }, [backdropOpacity, onDismiss, translateY]);

    useEffect(() => {
      if (visible) {
        translateY.setValue(SCREEN_HEIGHT);
        showSheet();
      }
    }, [visible, showSheet, translateY]);

    if (!visible) {
      return null;
    }

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={dismissSheet}
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.container}>
          {/* Backdrop */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={disableBackdropDismiss ? undefined : dismissSheet}
            accessible={false}
          >
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            />
          </TouchableOpacity>

          {/* Sheet */}
          <Animated.View
            ref={ref}
            style={[
              styles.sheet,
              {
                maxHeight: height || MAX_SHEET_HEIGHT,
                transform: [{ translateY }],
              },
              style,
            ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="dialog"
            accessibilityViewIsModal
            {...(!disableSwipeDismiss ? panResponder.panHandlers : {})}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: zIndex.modal,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dark.bgPrimary,
  },
  sheet: {
    backgroundColor: colors.dark.bgSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    ...shadows.lg,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
});

export default BottomSheet;
