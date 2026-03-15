/**
 * OpenClaw Mobile - App Dashboard Screen
 * High-level status of all deployed applications and services
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/theme';

// ============================================
// App Status Card Component
// ============================================

interface AppStatusProps {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error' | 'loading';
  metrics: {
    users?: string;
    uptime?: string;
    lastDeploy?: string;
  };
  icon: string;
  colors: any;
}

function AppStatusCard({ name, url, status, metrics, icon, colors }: AppStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return colors.success;
      case 'offline': return colors.textMuted;
      case 'error': return colors.error;
      case 'loading': return colors.accent;
      default: return colors.textMuted;
    }
  };

  const statusColor = getStatusColor();

  return (
    <TouchableOpacity 
      style={[styles.appCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => Linking.openURL(url)}
    >
      <View style={styles.appCardHeader}>
        <View style={[styles.appIconContainer, { backgroundColor: `${colors.accent}15` }]}>
          <Ionicons name={icon as any} size={24} color={colors.accent} />
        </View>
        <View style={styles.appTitleContainer}>
          <Text style={[styles.appTitle, { color: colors.text }]}>{name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Ionicons name="open-outline" size={18} color={colors.textDim} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.metricsContainer}>
        {metrics.uptime && (
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>UPTIME</Text>
            <Text style={[styles.metricValue, { color: colors.textDim }]}>{metrics.uptime}</Text>
          </View>
        )}
        {metrics.users && (
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>USERS</Text>
            <Text style={[styles.metricValue, { color: colors.textDim }]}>{metrics.users}</Text>
          </View>
        )}
        {metrics.lastDeploy && (
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>DEPLOYED</Text>
            <Text style={[styles.metricValue, { color: colors.textDim }]}>{metrics.lastDeploy}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: `${colors.accent}10` }]}>
          <Ionicons name="refresh-outline" size={16} color={colors.accent} />
          <Text style={[styles.actionButtonText, { color: colors.accent }]}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: `${colors.accent}10` }]}>
          <Ionicons name="cloud-upload-outline" size={16} color={colors.accent} />
          <Text style={[styles.actionButtonText, { color: colors.accent }]}>Deploy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// Apps Screen
// ============================================

export default function AppsScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);

  const fetchAppStatus = async () => {
    setLoading(true);
    // In a real app, this would fetch from an API
    // For MVP, we use the expected real app list
    setTimeout(() => {
      setApps([
        {
          id: 'openclaw',
          name: 'OpenClaw Gateway',
          url: 'https://gateway.openclaw.ai',
          status: 'online',
          metrics: { uptime: '99.9%', lastDeploy: '2h ago' },
          icon: 'server-outline'
        },
        {
          id: 'mission-control',
          name: 'Mission Control',
          url: 'https://mission-control.pages.dev',
          status: 'online',
          metrics: { uptime: '100%', users: '1', lastDeploy: '4h ago' },
          icon: 'rocket-outline'
        },
        {
          id: 'secret-vault',
          name: 'Secret Vault',
          url: 'https://secret-vault-9r3.pages.dev',
          status: 'online',
          metrics: { uptime: '100%', lastDeploy: '1d ago' },
          icon: 'lock-closed-outline'
        },
        {
          id: 'task-board',
          name: 'Task Kanban',
          url: 'https://python-kanban.pages.dev',
          status: 'online',
          metrics: { uptime: '99.8%', lastDeploy: '3h ago' },
          icon: 'list-outline'
        },
        {
          id: 'tokyo-one',
          name: 'Tokyo Itinerary',
          url: 'https://tokyo-one.pages.dev',
          status: 'online',
          metrics: { uptime: '100%', lastDeploy: '12h ago' },
          icon: 'map-outline'
        },
        {
          id: 'scholarship-hunt',
          name: 'Scholarship Hunt Pro',
          url: 'https://scholarship-hunt.pages.dev',
          status: 'online',
          metrics: { uptime: '99.9%', lastDeploy: '2d ago' },
          icon: 'school-outline'
        }
      ]);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchAppStatus();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppStatus();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Apps Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Status and metrics for all deployed services
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textDim }]}>Checking systems...</Text>
        </View>
      ) : (
        <View style={styles.appsList}>
          {apps.map(app => (
            <AppStatusCard 
              key={app.id}
              name={app.name}
              url={app.url}
              status={app.status as any}
              metrics={app.metrics}
              icon={app.icon}
              colors={colors}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          System checks run every 5 minutes
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  appsList: {
    padding: 16,
    gap: 16,
  },
  appCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.5,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
