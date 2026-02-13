import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { Button } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: '📋',
    title: 'Task Management',
    description: 'Smart task organization with reminders and categories',
    color: colors.primary.default,
  },
  {
    icon: '🧠',
    title: 'Second Brain',
    description: 'Capture ideas, skills, and memories',
    color: colors.accent.default,
  },
  {
    icon: '🔐',
    title: 'Encrypted Vault',
    description: 'Secure password manager with AES-256 encryption',
    color: colors.semantic.error,
  },
  {
    icon: '🗺️',
    title: 'Trip Planning',
    description: 'Plan trips with interactive maps and itineraries',
    color: colors.semantic.warning,
  },
  {
    icon: '📷',
    title: 'OCR Scanner',
    description: 'Extract text from images and documents',
    color: colors.primary.light,
  },
];

/**
 * Onboarding Screen 2: Features
 * 
 * Per design-spec.md Section 5.1
 * - Feature list with icons
 * - Stepper indicator (2/3)
 * - Back button
 * - Next button
 * - Sequential fade-in animation (100ms stagger)
 */
export default function FeaturesScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/setup');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="text"
          onPress={handleBack}
          accessibilityLabel="Back"
          accessibilityHint="Go back to welcome screen"
        >
          ← Back
        </Button>
        
        <View style={styles.stepper}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.duration(600)}
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          Powerful Features
        </Animated.Text>

        <View style={styles.featureList}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInLeft.delay(index * 100).duration(600)}
              style={styles.featureItem}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                <Text style={styles.featureIconText}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(600)}
        style={styles.footer}
      >
        <Button
          variant="primary"
          onPress={handleNext}
          size="large"
          accessibilityLabel="Next"
          accessibilityHint="Go to setup screen"
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.xl,
  },
  featureList: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconText: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
    gap: spacing.xs / 2,
    paddingTop: spacing.xs,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.dark.textPrimary,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
