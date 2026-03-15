/**
 * OpenClaw Mobile - Cost Tracker Screen
 * Real-time AI token usage and cost analytics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/theme';
import { costsService, UsageMetric, CostAlert } from '../../src/services/costs.service';

const { width } = Dimensions.get('window');

// ============================================
// Chart Bar Component (Simple representation)
// ============================================

function ChartBar({ label, value, maxValue, color, colors }: { label: string; value: number; maxValue: number; color: string; colors: any }) {
  const barWidth = maxValue > 0 ? (value / maxValue) * (width - 100) : 0;
  
  return (
    <View style={styles.chartBarRow}>
      <Text style={[styles.barLabel, { color: colors.textDim }]} numberOfLines={1}>{label}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: Math.max(barWidth, 4), backgroundColor: color }]} />
        <Text style={[styles.barValue, { color: colors.textMuted }]}>
          {value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// Cost Tracker Screen
// ============================================

export default function CostTrackerScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usage, setUsage] = useState<UsageMetric[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const fetchData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const [usageData, alertData] = await Promise.all([
        costsService.getUsageData(),
        costsService.getAlerts()
      ]);
      setUsage(usageData);
      setAlerts(alertData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const currentUsage = usage[selectedPeriod] || { cost: 0, tokens: 0, modelBreakdown: {} };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Cost Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Monitor your AI token usage and spending
        </Text>
      </View>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          {alerts.map(alert => (
            <View 
              key={alert.id} 
              style={[
                styles.alertCard, 
                { backgroundColor: alert.type === 'critical' ? `${colors.error}15` : `${colors.warning || '#FF9500'}15` }
              ]}
            >
              <Ionicons 
                name={alert.type === 'critical' ? "alert-circle" : "warning"} 
                size={20} 
                color={alert.type === 'critical' ? colors.error : (colors.warning || '#FF9500')} 
              />
              <Text style={[
                styles.alertText, 
                { color: alert.type === 'critical' ? colors.error : (colors.warning || '#FF9500') }
              ]}>
                {alert.message} ({alert.currentValue}%)
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: colors.surface }]}>
        {usage.map((p, index) => (
          <TouchableOpacity 
            key={p.period}
            style={[
              styles.periodBtn, 
              selectedPeriod === index && { backgroundColor: colors.accent }
            ]}
            onPress={() => setSelectedPeriod(index)}
          >
            <Text style={[
              styles.periodBtnText, 
              { color: selectedPeriod === index ? '#ffffff' : colors.textDim }
            ]}>
              {p.period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL COST</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>${currentUsage.cost.toFixed(2)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL TOKENS</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{(currentUsage.tokens / 1000).toFixed(0)}k</Text>
        </View>
      </View>

      {/* Model Breakdown Chart */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Model Usage Breakdown</Text>
        <View style={styles.chartContainer}>
          {Object.entries(currentUsage.modelBreakdown).map(([model, value]) => (
            <ChartBar 
              key={model}
              label={model.toUpperCase()}
              value={Math.round(value * 100)} 
              maxValue={100}
              color={model.includes('sonnet') ? '#60A5FA' : model.includes('opus') ? colors.accent : '#34C759'}
              colors={colors}
            />
          ))}
        </View>
      </View>

      {/* Optimization Tips */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb-outline" size={20} color={colors.warning || '#FF9500'} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8, marginBottom: 0 }]}>Optimization Tips</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Text style={[styles.tipText, { color: colors.textDim }]}>• Use Gemini Flash for simple tasks to save ~40%</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={[styles.tipText, { color: colors.textDim }]}>• High context usage detected in 3 sessions</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={[styles.tipText, { color: colors.textDim }]}>• Consolidate short cron jobs into batch runs</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.syncBtn, { backgroundColor: `${colors.accent}10`, borderColor: colors.accent }]}
        onPress={() => fetchData()}
      >
        <Ionicons name="sync-outline" size={18} color={colors.accent} />
        <Text style={[styles.syncBtnText, { color: colors.accent }]}>Sync with Mission Control</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Pricing data updated: Mar 14, 2026
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  alertsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 16,
  },
  chartBarRow: {
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 20,
  },
  syncBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
