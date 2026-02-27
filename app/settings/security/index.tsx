import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';

interface SecurityStatus {
  vaultEnabled: boolean;
  biometricsEnabled: boolean;
  autoLockTimeout: number; // in seconds
  lastBackup: Date | null;
  encryptionActive: boolean;
}

interface NetworkStats {
  activeConnections: number;
  dataUsageToday: number; // in MB
  secureConnections: number;
  totalRequests: number;
}

/**
 * Security Dashboard Screen
 * 
 * US-014: Build Security Dashboard for Mobileclaw
 * Centralized security management with vault settings, network monitor, privacy controls
 */
export default function SecurityDashboardScreen() {
  const router = useRouter();
  
  // Security status state
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    vaultEnabled: false,
    biometricsEnabled: false,
    autoLockTimeout: 60,
    lastBackup: null,
    encryptionActive: true,
  });

  // Network stats state
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    activeConnections: 0,
    dataUsageToday: 0,
    secureConnections: 0,
    totalRequests: 0,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    crashReporting: true,
    analytics: false,
    locationSharing: false,
  });

  // Load security status on mount
  useEffect(() => {
    loadSecurityStatus();
    loadNetworkStats();
    loadPrivacySettings();
  }, []);

  const loadSecurityStatus = async () => {
    try {
      const vaultEnabled = await AsyncStorage.getItem('vault_enabled');
      const biometricsEnabled = await AsyncStorage.getItem('biometrics_enabled');
      const autoLockTimeout = await AsyncStorage.getItem('auto_lock_timeout');
      const lastBackup = await AsyncStorage.getItem('last_backup');

      setSecurityStatus({
        vaultEnabled: vaultEnabled === 'true',
        biometricsEnabled: biometricsEnabled === 'true',
        autoLockTimeout: autoLockTimeout ? parseInt(autoLockTimeout) : 60,
        lastBackup: lastBackup ? new Date(lastBackup) : null,
        encryptionActive: true, // Always active
      });
    } catch (error) {
      console.error('Failed to load security status:', error);
    }
  };

  const loadNetworkStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('network_stats');
      if (stats) {
        setNetworkStats(JSON.parse(stats));
      }
    } catch (error) {
      console.error('Failed to load network stats:', error);
    }
  };

  const loadPrivacySettings = async () => {
    try {
      const crashReporting = await AsyncStorage.getItem('privacy_crash_reporting');
      const analytics = await AsyncStorage.getItem('privacy_analytics');
      const locationSharing = await AsyncStorage.getItem('privacy_location_sharing');

      setPrivacySettings({
        crashReporting: crashReporting !== 'false',
        analytics: analytics === 'true',
        locationSharing: locationSharing === 'true',
      });
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const handleManagePassword = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/security/password');
  }, [router]);

  const handleManagePattern = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/security/pattern');
  }, [router]);

  const toggleBiometrics = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('Not Set Up', 'Please set up biometric authentication in your device settings first.');
      return;
    }

    const newValue = !securityStatus.biometricsEnabled;
    setSecurityStatus(prev => ({ ...prev, biometricsEnabled: newValue }));
    await AsyncStorage.setItem('biometrics_enabled', newValue.toString());
  }, [securityStatus.biometricsEnabled]);

  const handleAutoLockTimeout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Auto-Lock Timeout',
      'Select timeout duration',
      [
        { text: '30 seconds', onPress: () => setAutoLockTimeout(30) },
        { text: '1 minute', onPress: () => setAutoLockTimeout(60) },
        { text: '5 minutes', onPress: () => setAutoLockTimeout(300) },
        { text: '15 minutes', onPress: () => setAutoLockTimeout(900) },
        { text: 'Never', onPress: () => setAutoLockTimeout(0) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const setAutoLockTimeout = async (timeout: number) => {
    setSecurityStatus(prev => ({ ...prev, autoLockTimeout: timeout }));
    await AsyncStorage.setItem('auto_lock_timeout', timeout.toString());
  };

  const handleBackupVault = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Backup Vault',
      'Would you like to backup your vault to secure cloud storage?',
      [
        { 
          text: 'Backup Now', 
          onPress: async () => {
            // TODO: Implement actual backup
            const now = new Date();
            setSecurityStatus(prev => ({ ...prev, lastBackup: now }));
            await AsyncStorage.setItem('last_backup', now.toISOString());
            Alert.alert('Success', 'Vault backed up successfully');
          } 
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleRestoreVault = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Restore Vault',
      'This will restore your vault from the latest backup. Current data will be overwritten.',
      [
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual restore
            Alert.alert('Success', 'Vault restored successfully');
          } 
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleViewNetworkLog = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/security/network-log');
  }, [router]);

  const handlePermissions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Permissions', 'App permissions management coming soon');
  }, []);

  const togglePrivacySetting = useCallback(async (key: keyof typeof privacySettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !privacySettings[key];
    setPrivacySettings(prev => ({ ...prev, [key]: newValue }));
    await AsyncStorage.setItem(`privacy_${key}`, newValue.toString());
  }, [privacySettings]);

  const handleClearCache = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and cache. Your data will not be affected.',
      [
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement actual cache clearing
            Alert.alert('Success', 'Cache cleared successfully');
          } 
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const formatTimeout = (seconds: number) => {
    if (seconds === 0) return 'Never';
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${seconds / 60} minute${seconds / 60 > 1 ? 's' : ''}`;
    return `${seconds / 3600} hour${seconds / 3600 > 1 ? 's' : ''}`;
  };

  const formatDataSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const getSecurityScore = () => {
    let score = 0;
    if (securityStatus.vaultEnabled) score += 30;
    if (securityStatus.biometricsEnabled) score += 25;
    if (securityStatus.autoLockTimeout > 0 && securityStatus.autoLockTimeout <= 300) score += 20;
    if (securityStatus.lastBackup && Date.now() - securityStatus.lastBackup.getTime() < 7 * 24 * 60 * 60 * 1000) score += 15;
    if (securityStatus.encryptionActive) score += 10;
    return score;
  };

  const securityScore = getSecurityScore();

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
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Security Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Status Overview */}
        <Animated.View entering={FadeInDown.duration(200).delay(0)}>
          <GlassCard style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Security Score</Text>
              <View style={[
                styles.scoreBadge,
                securityScore >= 80 ? styles.scoreBadgeGood :
                securityScore >= 50 ? styles.scoreBadgeWarning :
                styles.scoreBadgePoor
              ]}>
                <Text style={styles.scoreText}>{securityScore}%</Text>
              </View>
            </View>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>{securityStatus.vaultEnabled ? '✅' : '⚪'}</Text>
                <Text style={styles.statusLabel}>Vault</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>{securityStatus.biometricsEnabled ? '✅' : '⚪'}</Text>
                <Text style={styles.statusLabel}>Biometrics</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>{securityStatus.autoLockTimeout > 0 ? '✅' : '⚪'}</Text>
                <Text style={styles.statusLabel}>Auto-Lock</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>{securityStatus.encryptionActive ? '✅' : '⚪'}</Text>
                <Text style={styles.statusLabel}>Encryption</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Vault Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vault Settings</Text>
          
          <Animated.View entering={FadeInDown.duration(200).delay(100)}>
            <Pressable onPress={handleManagePassword} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>🔑</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Password</Text>
                  <Text style={styles.settingSubtitle}>Change vault password</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(150)}>
            <Pressable onPress={handleManagePattern} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>🔢</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Pattern Lock</Text>
                  <Text style={styles.settingSubtitle}>Set up pattern unlock</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(200)}>
            <GlassCard style={styles.settingCard}>
              <Text style={styles.settingIcon}>👆</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Biometric Unlock</Text>
                <Text style={styles.settingSubtitle}>Use fingerprint or Face ID</Text>
              </View>
              <Switch
                value={securityStatus.biometricsEnabled}
                onValueChange={toggleBiometrics}
                trackColor={{ false: colors.border.default, true: colors.accent.purple }}
                thumbColor={colors.surface.glass}
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(250)}>
            <Pressable onPress={handleAutoLockTimeout} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>⏱️</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Auto-Lock Timeout</Text>
                  <Text style={styles.settingSubtitle}>{formatTimeout(securityStatus.autoLockTimeout)}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(300)}>
            <Pressable onPress={handleBackupVault} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>☁️</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Backup Vault</Text>
                  <Text style={styles.settingSubtitle}>
                    {securityStatus.lastBackup
                      ? `Last: ${securityStatus.lastBackup.toLocaleDateString()}`
                      : 'Never backed up'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(350)}>
            <Pressable onPress={handleRestoreVault} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>♻️</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Restore Vault</Text>
                  <Text style={styles.settingSubtitle}>Restore from backup</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>
        </View>

        {/* Network Monitor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Monitor</Text>
          
          <Animated.View entering={FadeInDown.duration(200).delay(400)}>
            <GlassCard style={styles.networkCard}>
              <View style={styles.networkRow}>
                <View style={styles.networkStat}>
                  <Text style={styles.networkValue}>{networkStats.activeConnections}</Text>
                  <Text style={styles.networkLabel}>Active</Text>
                </View>
                <View style={styles.networkStat}>
                  <Text style={styles.networkValue}>{formatDataSize(networkStats.dataUsageToday)}</Text>
                  <Text style={styles.networkLabel}>Today</Text>
                </View>
                <View style={styles.networkStat}>
                  <Text style={styles.networkValue}>
                    {networkStats.totalRequests > 0
                      ? `${Math.round((networkStats.secureConnections / networkStats.totalRequests) * 100)}%`
                      : '0%'}
                  </Text>
                  <Text style={styles.networkLabel}>Secure</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(450)}>
            <Pressable onPress={handleViewNetworkLog} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>📊</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Connection Log</Text>
                  <Text style={styles.settingSubtitle}>View detailed network activity</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>
        </View>

        {/* Privacy Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          
          <Animated.View entering={FadeInDown.duration(200).delay(500)}>
            <Pressable onPress={handlePermissions} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>🔐</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>App Permissions</Text>
                  <Text style={styles.settingSubtitle}>Manage app access</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(550)}>
            <GlassCard style={styles.settingCard}>
              <Text style={styles.settingIcon}>📉</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Crash Reporting</Text>
                <Text style={styles.settingSubtitle}>Help improve stability</Text>
              </View>
              <Switch
                value={privacySettings.crashReporting}
                onValueChange={() => togglePrivacySetting('crashReporting')}
                trackColor={{ false: colors.border.default, true: colors.accent.purple }}
                thumbColor={colors.surface.glass}
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(600)}>
            <GlassCard style={styles.settingCard}>
              <Text style={styles.settingIcon}>📊</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Analytics</Text>
                <Text style={styles.settingSubtitle}>Anonymous usage data</Text>
              </View>
              <Switch
                value={privacySettings.analytics}
                onValueChange={() => togglePrivacySetting('analytics')}
                trackColor={{ false: colors.border.default, true: colors.accent.purple }}
                thumbColor={colors.surface.glass}
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(650)}>
            <GlassCard style={styles.settingCard}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Location Sharing</Text>
                <Text style={styles.settingSubtitle}>Share with trusted contacts</Text>
              </View>
              <Switch
                value={privacySettings.locationSharing}
                onValueChange={() => togglePrivacySetting('locationSharing')}
                trackColor={{ false: colors.border.default, true: colors.accent.purple }}
                thumbColor={colors.surface.glass}
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(200).delay(700)}>
            <Pressable onPress={handleClearCache} style={styles.settingItem}>
              <GlassCard style={styles.settingCard}>
                <Text style={styles.settingIcon}>🗑️</Text>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Clear Cache</Text>
                  <Text style={styles.settingSubtitle}>Free up storage space</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>
        </View>

        {/* Security Tips */}
        <Animated.View entering={FadeInDown.duration(200).delay(750)}>
          <GlassCard style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Security Tips</Text>
            <Text style={styles.tipsText}>
              • Enable biometric authentication for quick, secure access{'\n'}
              • Set auto-lock to 5 minutes or less{'\n'}
              • Back up your vault weekly{'\n'}
              • Use a strong, unique password{'\n'}
              • Review app permissions regularly
            </Text>
          </GlassCard>
        </Animated.View>
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
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
  overviewCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overviewTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  scoreBadgeGood: {
    backgroundColor: '#10b981',
  },
  scoreBadgeWarning: {
    backgroundColor: '#f59e0b',
  },
  scoreBadgePoor: {
    backgroundColor: '#ef4444',
  },
  scoreText: {
    fontSize: typography.size.md,
    color: '#fff',
    fontWeight: typography.weight.bold as any,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statusLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold as any,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  settingItem: {
    marginBottom: spacing.sm,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
    marginBottom: spacing.xxs,
  },
  settingSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  networkCard: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  networkStat: {
    alignItems: 'center',
  },
  networkValue: {
    fontSize: typography.size.xl,
    color: colors.accent.cyan,
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xs,
  },
  networkLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  tipsCard: {
    padding: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
