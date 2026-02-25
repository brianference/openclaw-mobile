/**
 * Premium Upgrade Screen
 * 
 * Displays feature comparison, pricing, and purchase flow
 * $4.99 one-time purchase, 7-day free trial
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import {
  checkPremiumStatus,
  purchasePremium,
  restorePurchases,
  startFreeTrial,
  getProductPrice,
  type PurchaseStatus,
} from '../../src/lib/purchaseManager';

interface Feature {
  id: string;
  title: string;
  icon: string;
  free: boolean;
  premium: boolean;
}

const features: Feature[] = [
  { id: '1', title: 'Basic chat with AI', icon: '💬', free: true, premium: true },
  { id: '2', title: 'Task board', icon: '✓', free: true, premium: true },
  { id: '3', title: 'Encrypted vault', icon: '🔐', free: true, premium: true },
  { id: '4', title: 'Security scanner', icon: '🔍', free: true, premium: true },
  { id: '5', title: 'Banner ads', icon: '📢', free: true, premium: false },
  { id: '6', title: 'Ad-free experience', icon: '🚫', free: false, premium: true },
  { id: '7', title: 'Unlimited cloud storage', icon: '☁️', free: false, premium: true },
  { id: '8', title: 'Advanced vault features', icon: '🛡️', free: false, premium: true },
  { id: '9', title: 'Priority support', icon: '⚡', free: false, premium: true },
  { id: '10', title: 'All future features', icon: '✨', free: false, premium: true },
];

export default function PremiumUpgradeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PurchaseStatus | null>(null);
  const [price, setPrice] = useState('$4.99');

  useEffect(() => {
    loadPremiumStatus();
    loadPrice();
  }, []);

  const loadPremiumStatus = async () => {
    const purchaseStatus = await checkPremiumStatus();
    setStatus(purchaseStatus);
  };

  const loadPrice = async () => {
    const productPrice = await getProductPrice();
    setPrice(productPrice);
  };

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await purchasePremium();

      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Purchase Successful! 🎉',
          'Thank you for upgrading to Premium! You now have access to all premium features.',
          [
            {
              text: 'Done',
              onPress: () => {
                loadPremiumStatus();
                router.back();
              },
            },
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Purchase Failed',
          'Unable to complete the purchase. Please try again or contact support.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[Premium] Purchase error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred during purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleStartTrial = useCallback(async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await startFreeTrial();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Trial Started! 🎉',
        'Enjoy 7 days of premium features for free. You can upgrade anytime during or after the trial.',
        [
          {
            text: 'Start Using',
            onPress: () => {
              loadPremiumStatus();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Premium] Trial error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Unable to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleRestore = useCallback(async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const restored = await restorePurchases();

      if (restored) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Purchase Restored',
          'Your premium purchase has been restored successfully!',
          [
            {
              text: 'Done',
              onPress: () => {
                loadPremiumStatus();
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[Premium] Restore error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Unable to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // If already premium, show confirmation
  if (status?.isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.premiumContainer}>
          <Text style={styles.premiumIcon}>✨</Text>
          <Text style={styles.premiumTitle}>You're Premium!</Text>
          <Text style={styles.premiumText}>
            Thank you for supporting Mobileclaw. You have access to all premium features.
          </Text>

          {status.purchaseDate && (
            <Text style={styles.premiumDate}>
              Purchased: {new Date(status.purchaseDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close premium upgrade"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeIn.duration(400)}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroIcon}>✨</Text>
            <Text style={styles.heroTitle}>Premium</Text>
            <Text style={styles.heroPrice}>{price}</Text>
            <Text style={styles.heroSubtitle}>One-time purchase</Text>
            <Text style={styles.heroDescription}>
              Unlock all features, remove ads, and support development
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Trial Status */}
        {status?.isTrialActive && (
          <Animated.View entering={FadeInDown.duration(300).delay(100)}>
            <GlassCard style={styles.trialBanner}>
              <Text style={styles.trialIcon}>🎉</Text>
              <View style={styles.trialInfo}>
                <Text style={styles.trialTitle}>Trial Active</Text>
                <Text style={styles.trialText}>
                  {status.trialDaysRemaining} {status.trialDaysRemaining === 1 ? 'day' : 'days'} remaining
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Feature Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>

          {features.map((feature, index) => (
            <Animated.View
              key={feature.id}
              entering={FadeInDown.duration(200).delay(200 + index * 30)}
            >
              <GlassCard style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                {feature.premium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                )}
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        {/* Purchase Buttons */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(500)}
          style={styles.buttonSection}
        >
          {!status?.isTrialActive && (
            <Pressable
              onPress={handleStartTrial}
              style={styles.trialButton}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Start 7-day free trial"
            >
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.trialButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.trialButtonText}>Start 7-Day Free Trial</Text>
                    <Text style={styles.trialButtonSubtext}>No payment required</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          )}

          <Pressable
            onPress={handlePurchase}
            style={styles.purchaseButton}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={`Purchase premium for ${price}`}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.purchaseButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.purchaseButtonText}>Purchase Premium</Text>
                  <Text style={styles.purchaseButtonSubtext}>{price} one-time</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={handleRestore}
            style={styles.restoreButton}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Restore previous purchases"
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </Pressable>
        </Animated.View>

        {/* Refund Policy */}
        <Text style={styles.disclaimer}>
          Payment will be charged to your App Store or Google Play account. No subscription
          required. One-time purchase grants lifetime access to all premium features.
          Refunds available within 14 days of purchase according to store policies.
        </Text>
      </ScrollView>
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
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    padding: spacing.md,
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size.xxl,
    color: '#ffffff',
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xs,
  },
  heroPrice: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xxs,
  },
  heroSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.md,
  },
  heroDescription: {
    fontSize: typography.size.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  trialIcon: {
    fontSize: 32,
  },
  trialInfo: {
    flex: 1,
  },
  trialTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.xxs,
  },
  trialText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
  },
  premiumBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  premiumBadgeText: {
    fontSize: typography.size.xs,
    color: '#ffffff',
    fontWeight: typography.weight.bold as any,
  },
  buttonSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  trialButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  trialButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  trialButtonText: {
    fontSize: typography.size.lg,
    color: '#ffffff',
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xxs,
  },
  trialButtonSubtext: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  purchaseButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  purchaseButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: typography.size.lg,
    color: '#ffffff',
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xxs,
  },
  purchaseButtonSubtext: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  restoreButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium as any,
  },
  disclaimer: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  premiumIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  premiumTitle: {
    fontSize: typography.size.xxl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.md,
  },
  premiumText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  premiumDate: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
});
