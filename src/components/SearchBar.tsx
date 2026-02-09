import { forwardRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, touchTargets, glassmorphism } from '../design/tokens';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  /**
   * Search value
   */
  value: string;

  /**
   * Change handler
   */
  onChangeText: (text: string) => void;

  /**
   * Clear handler (called when X button is pressed)
   */
  onClear?: () => void;

  /**
   * Search handler (called after debounce delay)
   */
  onSearch?: (text: string) => void;

  /**
   * Loading state (shows spinner instead of search icon)
   */
  loading?: boolean;

  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceDelay?: number;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Placeholder text
   * @default "Search..."
   */
  placeholder?: string;
}

/**
 * Search Bar Component
 *
 * Implements design spec section 7 with:
 * - Pill-shaped glassmorphic background
 * - Search icon on left
 * - Clear button on right (appears when typing)
 * - Debounced search (300ms default)
 * - Loading state with spinner
 * - 44px minimum height (WCAG compliance)
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   onSearch={handleSearch}
 *   placeholder="Search tasks..."
 * />
 *
 * <SearchBar
 *   value={query}
 *   onChangeText={setQuery}
 *   loading={isSearching}
 *   onClear={() => setQuery('')}
 * />
 * ```
 */
export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      onClear,
      onSearch,
      loading = false,
      debounceDelay = 300,
      style,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const clearOpacity = useSharedValue(0);

    // Debounced search
    useEffect(() => {
      if (!onSearch) return;

      const timer = setTimeout(() => {
        if (value) {
          onSearch(value);
        }
      }, debounceDelay);

      return () => clearTimeout(timer);
    }, [value, debounceDelay, onSearch]);

    // Animate clear button
    useEffect(() => {
      clearOpacity.value = withTiming(value ? 1 : 0, { duration: 200 });
    }, [value, clearOpacity]);

    const animatedClearStyle = useAnimatedStyle(() => ({
      opacity: clearOpacity.value,
    }));

    const handleClear = () => {
      onChangeText('');
      onClear?.();
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: glassmorphism.default.backgroundColor,
            borderColor: isFocused
              ? colors.primary.default
              : glassmorphism.default.borderColor,
          },
          isFocused && styles.containerFocused,
          style,
        ]}
      >
        {/* Search Icon or Loading Spinner */}
        <View style={styles.iconContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.dark.textSecondary} />
          ) : (
            <Ionicons
              name="search"
              size={20}
              color={isFocused ? colors.primary.default : colors.dark.textSecondary}
            />
          )}
        </View>

        {/* Input */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.dark.textTertiary}
          returnKeyType="search"
          accessible={true}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
          style={styles.input}
          {...props}
        />

        {/* Clear Button */}
        {value && !loading && (
          <AnimatedTouchableOpacity
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.clearButton, animatedClearStyle]}
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.dark.textSecondary}
            />
          </AnimatedTouchableOpacity>
        )}
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTargets.minimum,
    borderRadius: radius.full,
    borderWidth: glassmorphism.default.borderWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  containerFocused: {
    borderWidth: 2,
  },
  iconContainer: {
    marginRight: spacing.sm + 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.normal,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    marginLeft: spacing.sm,
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;
