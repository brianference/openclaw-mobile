import { useState, useCallback, useEffect } from 'react';
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
import {
  GlassCard,
  Badge,
  SkeletonLoader,
} from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { useVaultStore, VaultSecret } from '../../src/store/vault';

type VaultHealth = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Security Audit Screen
 * 
 * Per design-spec.md Section 5.4
 * - Vault health status badge
 * - Weak passwords section with strength indicators
 * - Reused passwords section
 * - Old passwords section
 * - 2FA recommendations
 * - Fix/Review buttons
 */
export default function SecurityAuditScreen() {
  const router = useRouter();

  // Store
  const { getWeakPasswords, getReusedPasswords, getSecurityScore } = useVaultStore();

  const [loading, setLoading] = useState(true);

  const weakPasswords = getWeakPasswords();
  const reusedPasswords = getReusedPasswords();
  const securityScore = getSecurityScore();

  const vaultHealth: VaultHealth = (() => {
    if (securityScore >= 90) return 'excellent';
    if (securityScore >= 70) return 'good';
    if (securityScore >= 50) return 'fair';
    return 'poor';
  })();

  useEffect(() => {
    // Simulate audit process
    const runAudit = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    };
    runAudit();
  }, []);
      
      setLoading(false);
    };

    runAudit();
  }, []);

  const getHealthColor = (): string => {
    switch (vaultHealth) {
      case 'excellent':
        return colors.accent.default;
      case 'good':
        return colors.primary.default;
      case 'fair':
        return colors.semantic.warning;
      case 'poor':
        return colors.semantic.error;
      default:
        return colors.text.tertiary;
    }
  };

  const getHealthLabel = (): string => {
    switch (vaultHealth) {
      case 'excellent':
        return 'Excellent ✓';
      case 'good':
        return 'Good ✓';
      case 'fair':
        return 'Fair ⚠️';
      case 'poor':
        return 'Poor ⚠️';
      default:
        return 'Unknown';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return colors.semantic.error;
      case 'medium':
        return colors.semantic.warning;
      case 'low':
        return colors.primary.default;
      default:
        return colors.text.tertiary;
    }
  };

  const getSeverityLabel = (severity: string): string => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const handleFixIssue = useCallback((issue: AuditIssue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to edit first item
    if (issue.items.length > 0) {
      router.push(`/vault/${issue.items[0].id}`);
    }
  }, [router]);

  const handleReviewIssue = useCallback((issue: AuditIssue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Show bottom sheet with all affected items
  }, []);

  const renderIssue = (issue: AuditIssue, index: number) => {
    const severityColor = getSeverityColor(issue.severity);
    const severityLabel = getSeverityLabel(issue.severity);

    return (
      <Animated.View
        key={issue.id}
        entering={FadeInDown.duration(200).delay(200 + index * 50)}
      >
        <GlassCard style={[styles.issueCard, { borderLeftColor: severityColor }]}>
          <View style={styles.issueHeader}>
            <Text style={styles.issueTitle}>{issue.title}</Text>
            <Badge
              label={severityLabel}
              color={severityColor}
              variant="dot"
            />
          </View>

          <Text style={styles.issueDescription}>{issue.description}</Text>

          {/* Affected Items */}
          <View style={styles.affectedItems}>
            {issue.items.map((item, idx) => {
              let itemLabel = item.name;
              
              // Add password strength for weak passwords
              if (issue.type === 'weak') {
                itemLabel += ' • Strength: Weak';
              }
              
              // Add "Same password" for reused
              if (issue.type === 'reused' && idx > 0) {
                itemLabel += ' • Same password';
              }

              return (
                <View key={item.id} style={styles.affectedItem}>
                  <Text style={styles.affectedItemIcon}>
                    {item.category === 'password' ? '🌐' : '🔑'}
                  </Text>
                  <Text style={styles.affectedItemText} numberOfLines={1}>
                    {itemLabel}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.issueActions}>
            {issue.items.length === 1 ? (
              <Pressable
                onPress={() => handleFixIssue(issue)}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Fix issue"
              >
                <Text style={styles.actionButtonText}>Fix</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleReviewIssue(issue)}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Review affected items"
              >
                <Text style={styles.actionButtonText}>Review ({issue.items.length})</Text>
              </Pressable>
            )}
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  const renderRecommendations = () => {
    const recommendations = [
      { icon: '🔐', text: 'Enable 2FA on 3 sites' },
      { icon: '🔄', text: 'Update 2 weak passwords' },
      { icon: '🗓️', text: 'Rotate passwords older than 1 year' },
    ];

    return (
      <Animated.View entering={FadeInDown.duration(200).delay(400 + issues.length * 50)}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <GlassCard style={styles.recommendationsCard}>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendation}>
              <Text style={styles.recommendationIcon}>{rec.icon}</Text>
              <Text style={styles.recommendationText}>{rec.text}</Text>
            </View>
          ))}
        </GlassCard>
      </Animated.View>
    );
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
        <Text style={styles.headerTitle}>Security Audit</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Analyzing vault security...</Text>
            <SkeletonLoader count={3} height={150} />
          </View>
        ) : (
          <>
            {/* Health Status */}
            <Animated.View entering={FadeInDown.duration(200)}>
              <GlassCard style={styles.healthCard}>
                <Text style={styles.healthLabel}>Vault Health</Text>
                <Text style={[styles.healthStatus, { color: getHealthColor() }]}>
                  {getHealthLabel()}
                </Text>
                {issues.length > 0 && (
                  <Text style={styles.healthDescription}>
                    Found {issues.length} {issues.length === 1 ? 'issue' : 'issues'} that need attention
                  </Text>
                )}
              </GlassCard>
            </Animated.View>

            {/* Issues */}
            {issues.length > 0 ? (
              <View style={styles.issuesContainer}>
                {issues.map((issue, index) => renderIssue(issue, index))}
              </View>
            ) : (
              <Animated.View entering={FadeInDown.duration(200).delay(200)}>
                <GlassCard style={styles.noIssuesCard}>
                  <Text style={styles.noIssuesIcon}>✅</Text>
                  <Text style={styles.noIssuesTitle}>All Clear!</Text>
                  <Text style={styles.noIssuesText}>
                    Your vault is secure. No issues found.
                  </Text>
                </GlassCard>
              </Animated.View>
            )}

            {/* Recommendations */}
            {issues.length > 0 && renderRecommendations()}

            {/* Info */}
            <Animated.View entering={FadeInDown.duration(200).delay(600 + issues.length * 50)}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  Run a security audit regularly to keep your vault secure. We recommend checking at least once a month.
                </Text>
              </View>
            </Animated.View>
          </>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  healthCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  healthLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthStatus: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold as any,
  },
  healthDescription: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  issuesContainer: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  issueCard: {
    padding: spacing.md,
    gap: spacing.sm,
    borderLeftWidth: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  issueDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
  affectedItems: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  affectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
  },
  affectedItemIcon: {
    fontSize: 16,
  },
  affectedItemText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
  issueActions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.default,
    borderRadius: radius.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  noIssuesCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  noIssuesIcon: {
    fontSize: 64,
  },
  noIssuesTitle: {
    fontSize: typography.size.xl,
    color: colors.accent.default,
    fontWeight: typography.weight.bold as any,
  },
  noIssuesText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  recommendationsCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  recommendationIcon: {
    fontSize: 20,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
  },
  infoContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
});
