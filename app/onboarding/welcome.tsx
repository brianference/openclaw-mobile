import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, ProgressBar } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';

/**
 * Onboarding Screen 1: Welcome
 * 
 * Per design-spec.md Section 5.1
 * - App icon + welcome message
 * - Stepper indicator (1/3)
 * - Skip button (top right)
 * - Next button (bottom)
 * - Glassmorphic illustration card
 */
export default function WelcomeScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/features');
  };

  const handleSkip = () => {
    router.push('/onboarding/setup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Header with Skip button and Stepper */}
      <View style={styles.header}>
        <Button
          variant="text"
          onPress={handleSkip}
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Jumps to setup screen"
        >
          Skip
        </Button>
        
        <View style={styles.stepper}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* App Icon */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.iconContainer}
        >
          <LinearGradient
            colors={[colors.primary.default, colors.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text style={styles.iconText}>⚡</Text>
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          MobileClaw
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.subtitle}
        >
          Your productivity{'\n'}command center
        </Animated.Text>

        {/* Illustration */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.illustrationContainer}
        >
          <LinearGradient
            colors={['rgba(26, 26, 26, 0.6)', 'rgba(26, 26, 26, 0.3)']}
            style={styles.illustrationCard}
          >
            <View style={styles.mockupRow}>
              <View style={[styles.mockupCard, { backgroundColor: colors.primary.default }]}>
                <View style={styles.mockupLine} />
                <View style={[styles.mockupLine, { width: '60%' }]} />
              </View>
            </View>
            <View style={styles.mockupRow}>
              <View style={[styles.mockupCard, { backgroundColor: colors.accent.default }]}>
                <View style={styles.mockupLine} />
                <View style={[styles.mockupLine, { width: '80%' }]} />
              </View>
            </View>
            <View style={styles.mockupRow}>
              <View style={[styles.mockupCard, { backgroundColor: colors.dark.surface }]}>
                <View style={styles.mockupLine} />
                <View style={[styles.mockupLine, { width: '50%' }]} />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Next Button */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(600)}
        style={styles.footer}
      >
        <Button
          variant="primary"
          onPress={handleNext}
          size="large"
          accessibilityLabel="Next"
          accessibilityHint="Go to features screen"
        >
          Next →
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    minHeight: 56,
  },
  stepper: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.default,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.default,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  iconText: {
    fontSize: 64,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    marginBottom: spacing['2xl'],
  },
  illustrationContainer: {
    width: '100%',
    marginTop: spacing.xl,
  },
  illustrationCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: spacing.md,
  },
  mockupRow: {
    width: '100%',
  },
  mockupCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  mockupLine: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    width: '100%',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
