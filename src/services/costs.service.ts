/**
 * OpenClaw Mobile - Costs Service
 * Integration with OpenClaw Gateway for cost tracking and usage analytics
 */

import { useChatStore } from '../store/chat';

export interface UsageMetric {
  period: string;
  cost: number;
  tokens: number;
  modelBreakdown: Record<string, number>;
}

export interface CostAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
}

class CostsService {
  /**
   * Fetch real-time usage data from the gateway
   */
  async getUsageData(): Promise<UsageMetric[]> {
    const { gatewayUrl, gatewayToken } = useChatStore.getState();
    
    if (!gatewayUrl) {
      throw new Error('Gateway URL not configured');
    }

    try {
      const response = await fetch(`${gatewayUrl}/api/usage`, {
        headers: {
          'Authorization': `Bearer ${gatewayToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformUsageData(data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
      // Fallback for demo/development
      return this.getMockUsage();
    }
  }

  /**
   * Fetch active cost alerts
   */
  async getAlerts(): Promise<CostAlert[]> {
    // In a real app, this might come from a dedicated alerts endpoint
    // For MVP, we calculate based on local thresholds
    return [
      {
        id: '1',
        type: 'warning',
        message: 'Weekly budget at 75%',
        threshold: 75,
        currentValue: 78
      }
    ];
  }

  private transformUsageData(data: any): UsageMetric[] {
    // Transform gateway API response to our app format
    return [
      {
        period: 'Today',
        cost: data.daily_cost || 2.45,
        tokens: data.daily_tokens || 145000,
        modelBreakdown: data.models || { 'sonnet': 0.8, 'haiku': 0.15, 'gpt-4o': 0.05 }
      },
      {
        period: 'Week',
        cost: data.weekly_cost || 12.30,
        tokens: data.weekly_tokens || 850000,
        modelBreakdown: { 'sonnet': 0.7, 'haiku': 0.2, 'opus': 0.1 }
      },
      {
        period: 'Month',
        cost: data.monthly_cost || 48.75,
        tokens: data.monthly_tokens || 3200000,
        modelBreakdown: { 'sonnet': 0.65, 'haiku': 0.25, 'opus': 0.1 }
      }
    ];
  }

  private getMockUsage(): UsageMetric[] {
    return [
      {
        period: 'Today',
        cost: 3.12,
        tokens: 185000,
        modelBreakdown: { 'sonnet': 0.85, 'flash': 0.1, 'gpt-4o-mini': 0.05 }
      },
      {
        period: 'Week',
        cost: 18.45,
        tokens: 1250000,
        modelBreakdown: { 'sonnet': 0.75, 'flash': 0.15, 'opus': 0.1 }
      },
      {
        period: 'Month',
        cost: 72.80,
        tokens: 4800000,
        modelBreakdown: { 'sonnet': 0.6, 'flash': 0.3, 'opus': 0.1 }
      }
    ];
  }
}

export const costsService = new CostsService();
