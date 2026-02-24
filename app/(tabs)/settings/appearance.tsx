import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard, RadioGroup, Toggle, Toast } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';
import { useSettingsStore } from '../../../src/store/settings';

/**
 * Appearance Settings Screen
 * 
 * Per design-spec.md Section 5.11
 * - Theme selector (Light, Dark, Auto)
 * - Live preview
 * - Accent color picker
 * - Text size slider
 * - Reduce motion toggle
 */
export default function AppearanceSettingsScreen() {
  const router = useRouter();

  // Store
  const { 
    settings, 
    setTheme, 
    setAccentColor, 
    setTextSize, 
    setReduceMotion 
  } = useSettingsStore();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleThemeChange = useCallback((value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(value as 'light' | 'dark' | 'auto');
    setToastMessage(`Theme changed to ${value}`);
    setShowToast(true);
  }, [setTheme]);

  const handleAccentColorChange = useCallback((color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccentColor(color as 'blue' | 'purple' | 'green' | 'orange');
    setToastMessage(`Accent color changed`);
    setShowToast(true);
  }, [setAccentColor]);

  const handleTextSizeDecrease = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sizes: ('small' | 'medium' | 'large' | 'xlarge')[] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(settings.appearance.textSize);
    if (currentIndex > 0) {
      setTextSize(sizes[currentIndex - 1]);
    }
  }, [settings.appearance.textSize, setTextSize]);

  const handleTextSizeIncrease = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sizes: ('small' | 'medium' | 'large' | 'xlarge')[] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(settings.appearance.textSize);
    if (currentIndex < sizes.length - 1) {
      setTextSize(sizes[currentIndex + 1]);
    }
  }, [settings.appearance.textSize, setTextSize]);

  const handleReduceMotionToggle = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReduceMotion(value);
    setToastMessage(value ? 'Animations reduced' : 'Animations enabled');
    setShowToast(true);
  }, [setReduceMotion]);

  const ACCENT_COLORS = {
    blue: colors.primary.default,
    green: colors.accent.default,
    purple: '#a855f7',
    orange: '#f59e0b',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Section */}
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Theme</Text>
          <RadioGroup
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'Auto (system)', value: 'auto' },
            ]}
            value={settings.appearance.theme}
            onChange={handleThemeChange}
            accessibilityLabel="Theme selection"
          />
        </Animated.View>

        {/* Preview Section */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(100)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Preview</Text>
          <GlassCard style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              Sample Card
            </Text>
            <Text style={styles.previewText}>
              This is how text will appear with your current settings.
            </Text>
            <View style={styles.previewButton}>
              <Text style={styles.previewButtonText}>Button</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Accent Color Section */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Accent Color</Text>
          <View style={styles.colorPicker}>
            {(['blue', 'purple', 'green', 'orange'] as const).map((color) => (
              <Pressable
                key={color}
                onPress={() => handleAccentColorChange(color)}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: ACCENT_COLORS[color],
                    borderWidth: settings.appearance.accentColor === color ? 3 : 0,
                    borderColor: colors.text.primary,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: settings.appearance.accentColor === color }}
                accessibilityLabel={`${color} accent color`}
              >
                {settings.appearance.accentColor === color && (
                  <Text style={styles.colorCheckmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Text Size Section */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Text Size</Text>
          <View style={styles.textSizeControl}>
            <Pressable
              onPress={handleTextSizeDecrease}
              style={[styles.textSizeButton, textSize === 75 && styles.textSizeButtonDisabled]}
              disabled={textSize === 75}
              accessibilityRole="button"
              accessibilityLabel="Decrease text size"
            >
              <Text style={styles.textSizeButtonText}>A</Text>
            </Pressable>
            <View style={styles.textSizeSlider}>
              <View style={[styles.textSizeTrack, { width: `${((textSize - 75) / 75) * 100}%` }]} />
              <Text style={styles.textSizeValue}>{textSize}%</Text>
            </View>
            <Pressable
              onPress={handleTextSizeIncrease}
              style={[styles.textSizeButton, styles.textSizeButtonLarge, textSize === 150 && styles.textSizeButtonDisabled]}
              disabled={textSize === 150}
              accessibilityRole="button"
              accessibilityLabel="Increase text size"
            >
              <Text style={[styles.textSizeButtonText, styles.textSizeButtonTextLarge]}>A</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Reduce Motion Section */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(400)}
          style={styles.section}
        >
          <GlassCard style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Reduce Motion</Text>
              <Text style={styles.toggleDescription}>
                Minimize animations for accessibility
              </Text>
            </View>
            <Toggle
              value={settings.appearance.reduceMotion}
              onValueChange={handleReduceMotionToggle}
              accessibilityLabel="Reduce motion"
            />
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
        duration={2000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.size.md,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 70,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold as any,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  previewCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewTitle: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  previewText: {
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
  previewButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.default,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  previewButtonText: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheckmark: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: typography.weight.bold as any,
  },
  textSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textSizeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSizeButtonLarge: {
    // Same size but different text size
  },
  textSizeButtonDisabled: {
    opacity: 0.4,
  },
  textSizeButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  textSizeButtonTextLarge: {
    fontSize: 20,
  },
  textSizeSlider: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSizeTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary.default + '40',
  },
  textSizeValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
});
