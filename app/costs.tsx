import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../src/store/theme';
import { useCostStore } from '../src/store/cost';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CostsScreen() {
  const { colors } = useTheme();
  const { data, fetchUsageData, getSummary, getOptimizationTips } = useCostStore();
  
  const summary = getSummary();
  const tips = getOptimizationTips();

  useEffect(() => {
    fetchUsageData();
  }, []);

  if (!data) {
    return (
      <View style={[styles(colors).container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles(colors).emptyText}>Loading...</Text>
      </View>
    );
  }

  const renderStyles = styles(colors);

  return (
    <View style={renderStyles.container}>
      <View style={renderStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={renderStyles.headerTitle}>💰 Cost Tracking</Text>
        <TouchableOpacity onPress={() => fetchUsageData()}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={renderStyles.content}>
        {/* Summary Cards */}
        <View style={renderStyles.summaryRow}>
          <View style={renderStyles.summaryCard}>
            <Text style={renderStyles.summaryLabel}>This Week</Text>
            <Text style={[renderStyles.summaryValue, { color: '#818cf8' }]}>
              ${summary.weekTotal.toFixed(2)}
            </Text>
          </View>
          <View style={renderStyles.summaryCard}>
            <Text style={renderStyles.summaryLabel}>This Month</Text>
            <Text style={[renderStyles.summaryValue, { color: '#c084fc' }]}>
              ${summary.monthTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={renderStyles.summaryRow}>
          <View style={renderStyles.summaryCard}>
            <Text style={renderStyles.summaryLabel}>Sessions</Text>
            <Text style={[renderStyles.summaryValue, { color: '#34d399' }]}>
              {summary.totalSessions}
            </Text>
          </View>
          <View style={renderStyles.summaryCard}>
            <Text style={renderStyles.summaryLabel}>Requests</Text>
            <Text style={[renderStyles.summaryValue, { color: '#fb923c' }]}>
              {summary.totalRequests.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Provider Breakdown */}
        <View style={renderStyles.section}>
          <Text style={renderStyles.sectionTitle}>Cost by Provider</Text>
          {data.providers.map((provider, index) => (
            <View key={index} style={renderStyles.breakdownItem}>
              <View style={renderStyles.breakdownHeader}>
                <Text style={renderStyles.breakdownName}>{provider.name}</Text>
                <Text style={renderStyles.breakdownCost}>
                  ${provider.cost.toFixed(2)}
                </Text>
              </View>
              <View style={renderStyles.breakdownBar}>
                <View
                  style={[
                    renderStyles.breakdownBarFill,
                    {
                      width: `${(provider.cost / data.summary.monthTotal) * 100}%`,
                      backgroundColor: ['#818cf8', '#c084fc', '#fb923c'][index % 3],
                    },
                  ]}
                />
              </View>
              <Text style={renderStyles.breakdownStats}>
                {provider.requests.toLocaleString()} requests • {(provider.tokens / 1000).toFixed(0)}K tokens
              </Text>
            </View>
          ))}
        </View>

        {/* Model Breakdown */}
        <View style={renderStyles.section}>
          <Text style={renderStyles.sectionTitle}>Cost by Model</Text>
          {data.models.slice(0, 5).map((model, index) => (
            <View key={index} style={renderStyles.breakdownItem}>
              <View style={renderStyles.breakdownHeader}>
                <Text style={renderStyles.breakdownName} numberOfLines={1}>
                  {model.name}
                </Text>
                <Text style={renderStyles.breakdownCost}>
                  ${model.cost.toFixed(2)}
                </Text>
              </View>
              <View style={renderStyles.breakdownBar}>
                <View
                  style={[
                    renderStyles.breakdownBarFill,
                    {
                      width: `${(model.cost / data.summary.monthTotal) * 100}%`,
                      backgroundColor: '#c084fc',
                    },
                  ]}
                />
              </View>
              <Text style={renderStyles.breakdownStats}>
                {model.requests.toLocaleString()} requests
              </Text>
            </View>
          ))}
        </View>

        {/* Task Type Breakdown */}
        <View style={renderStyles.section}>
          <Text style={renderStyles.sectionTitle}>Cost by Task Type</Text>
          {data.taskTypes.map((taskType, index) => (
            <View key={index} style={renderStyles.breakdownItem}>
              <View style={renderStyles.breakdownHeader}>
                <Text style={renderStyles.breakdownName}>{taskType.name}</Text>
                <Text style={renderStyles.breakdownCost}>
                  ${taskType.cost.toFixed(2)}
                </Text>
              </View>
              <View style={renderStyles.breakdownBar}>
                <View
                  style={[
                    renderStyles.breakdownBarFill,
                    {
                      width: `${(taskType.cost / data.summary.monthTotal) * 100}%`,
                      backgroundColor: '#34d399',
                    },
                  ]}
                />
              </View>
              <Text style={renderStyles.breakdownStats}>
                {taskType.requests.toLocaleString()} requests
              </Text>
            </View>
          ))}
        </View>

        {/* Optimization Tips */}
        <View style={renderStyles.section}>
          <Text style={renderStyles.sectionTitle}>💡 Optimization Recommendations</Text>
          {tips.map((tip, index) => (
            <View key={index} style={renderStyles.tipCard}>
              <View style={renderStyles.tipHeader}>
                <Text style={renderStyles.tipIcon}>{tip.icon}</Text>
                <Text style={renderStyles.tipTitle}>{tip.title}</Text>
              </View>
              <Text style={renderStyles.tipDescription}>{tip.description}</Text>
              {tip.saving && (
                <Text style={renderStyles.tipSaving}>
                  💰 Potential savings: ${tip.saving.toFixed(2)}/month
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Last Updated */}
        <Text style={renderStyles.lastUpdated}>
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  breakdownItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  breakdownCost: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownStats: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  tipDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  tipSaving: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '600',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
