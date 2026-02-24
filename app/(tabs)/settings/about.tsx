import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';

/**
 * About Screen
 * 
 * Per design-spec.md Section 5.11
 * - App icon
 * - App name and version
 * - What's New link
 * - Privacy Policy link
 * - Terms of Service link
 * - Licenses link
 * - Made by credit
 * - Rate on App Store button
 */
export default function AboutScreen() {
  const router = useRouter();

  const APP_VERSION = '1.0.0';
  const BUILD_NUMBER = '1';
  const AUTHOR = 'Brian Ference';

  const handleWhatsNew = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to changelog screen
    console.log('Show changelog');
  }, []);

  const handlePrivacyPolicy = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = 'https://mobileclaw.app/privacy';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  const handleTermsOfService = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = 'https://mobileclaw.app/terms';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  const handleLicenses = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to licenses screen
    console.log('Show licenses');
  }, []);

  const handleRate = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Open App Store rating page
    // iOS: itms-apps://itunes.apple.com/app/id{APP_ID}?action=write-review
    // Android: market://details?id={PACKAGE_NAME}
    console.log('Open rating page');
  }, []);

  const menuItems = [
    { id: '1', title: "What's New", icon: '✨', onPress: handleWhatsNew },
    { id: '2', title: 'Privacy Policy', icon: '🔒', onPress: handlePrivacyPolicy },
    { id: '3', title: 'Terms of Service', icon: '📄', onPress: handleTermsOfService },
    { id: '4', title: 'Licenses', icon: '📜', onPress: handleLicenses },
  ];

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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Icon & Info */}
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.appInfo}
        >
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>🦅</Text>
          </View>
          <Text style={styles.appName}>MobileClaw</Text>
          <Text style={styles.appVersion}>
            Version {APP_VERSION} (Build {BUILD_NUMBER})
          </Text>
          <Text style={styles.appTagline}>
            Your productivity command center
          </Text>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(100)}
          style={styles.menuSection}
        >
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.duration(200).delay(200 + index * 50)}
            >
              <Pressable
                onPress={item.onPress}
                style={styles.menuItem}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <GlassCard style={styles.menuCard}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.chevron}>›</Text>
                </GlassCard>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Made By */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(400)}
          style={styles.authorSection}
        >
          <Text style={styles.authorLabel}>Made with ⚡ by</Text>
          <Text style={styles.authorName}>{AUTHOR}</Text>
        </Animated.View>

        {/* Rate Button */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(500)}
          style={styles.rateSection}
        >
          <Pressable
            onPress={handleRate}
            style={styles.rateButton}
            accessibilityRole="button"
            accessibilityLabel="Rate on App Store"
          >
            <Text style={styles.rateButtonText}>⭐ Rate on App Store</Text>
          </Pressable>
        </Animated.View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2026 MobileClaw. All rights reserved.
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
    paddingBottom: spacing['3xl'],
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 22,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  appIconText: {
    fontSize: 56,
  },
  appName: {
    fontSize: typography.size['3xl'],
    color: colors.text.primary,
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  appTagline: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: spacing.xl,
  },
  menuItem: {
    marginBottom: spacing.sm,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTitle: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  authorSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  authorLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  authorName: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  rateSection: {
    marginBottom: spacing.xl,
  },
  rateButton: {
    backgroundColor: colors.primary.default,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  rateButtonText: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  copyright: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
