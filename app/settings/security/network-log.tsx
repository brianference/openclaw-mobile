import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';

interface NetworkLogEntry {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status: number;
  secure: boolean;
  duration: number; // ms
  dataSize: number; // bytes
}

/**
 * Network Log Screen
 * 
 * Part of US-014 Security Dashboard
 * Displays detailed network activity log for security monitoring
 */
export default function NetworkLogScreen() {
  const router = useRouter();

  // Mock data for demonstration
  const [networkLogs] = useState<NetworkLogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      method: 'GET',
      url: 'https://api.openclaw.ai/session',
      status: 200,
      secure: true,
      duration: 245,
      dataSize: 1024,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      method: 'POST',
      url: 'https://api.openclaw.ai/message',
      status: 201,
      secure: true,
      duration: 512,
      dataSize: 2048,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      method: 'GET',
      url: 'https://api.openclaw.ai/vault/data',
      status: 200,
      secure: true,
      duration: 189,
      dataSize: 4096,
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      method: 'PUT',
      url: 'https://api.openclaw.ai/vault/backup',
      status: 200,
      secure: true,
      duration: 1234,
      dataSize: 102400,
    },
  ]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return colors.accent.green;
    if (status >= 300 && status < 400) return colors.accent.blue;
    if (status >= 400 && status < 500) return colors.accent.orange;
    return colors.accent.red;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return colors.accent.blue;
      case 'POST': return colors.accent.green;
      case 'PUT': return colors.accent.orange;
      case 'DELETE': return colors.accent.red;
      default: return colors.text.tertiary;
    }
  };

  const renderLogEntry = ({ item, index }: { item: NetworkLogEntry; index: number }) => (
    <Animated.View entering={FadeInDown.duration(200).delay(index * 50)}>
      <GlassCard style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.logLeft}>
            <Text style={[styles.method, { color: getMethodColor(item.method) }]}>
              {item.method}
            </Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <View style={styles.logRight}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            {item.secure && <Text style={styles.secure}>🔒</Text>}
          </View>
        </View>
        <Text style={styles.url} numberOfLines={1}>
          {item.url}
        </Text>
        <View style={styles.logFooter}>
          <Text style={styles.metric}>{item.duration}ms</Text>
          <Text style={styles.metric}>•</Text>
          <Text style={styles.metric}>{formatDataSize(item.dataSize)}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  );

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
        <Text style={styles.headerTitle}>Network Log</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary */}
      <Animated.View entering={FadeInDown.duration(200).delay(0)}>
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Connection Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{networkLogs.length}</Text>
              <Text style={styles.summaryLabel}>Total Requests</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {networkLogs.filter(log => log.secure).length}
              </Text>
              <Text style={styles.summaryLabel}>Secure (HTTPS)</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(
                  networkLogs.reduce((sum, log) => sum + log.duration, 0) / networkLogs.length
                )}ms
              </Text>
              <Text style={styles.summaryLabel}>Avg Response</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Log Entries */}
      <FlatList
        data={networkLogs}
        renderItem={renderLogEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No network activity yet</Text>
          </GlassCard>
        }
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
  summaryCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.size.xl,
    color: colors.accent.cyan,
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  logCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  method: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold as any,
  },
  status: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
  },
  timestamp: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  secure: {
    fontSize: 12,
  },
  url: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metric: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
  },
});
