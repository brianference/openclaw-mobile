import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  cost: number;
  tokens: number;
  requests: number;
}

export interface ProviderUsage {
  name: string; // anthropic, openai, etc.
  cost: number;
  tokens: number;
  requests: number;
}

export interface ModelUsage {
  name: string; // claude-sonnet-4-5, gpt-4o, etc.
  cost: number;
  tokens: number;
  requests: number;
}

export interface TaskTypeUsage {
  name: string; // coding, design, writing, automation, general
  cost: number;
  tokens: number;
  requests: number;
}

export interface UsageSummary {
  weekTotal: number;
  monthTotal: number;
  totalSessions: number;
  totalRequests: number;
}

export interface OptimizationTip {
  icon: string;
  title: string;
  description: string;
  saving?: number; // potential monthly savings
}

export interface UsageData {
  summary: UsageSummary;
  daily: DailyUsage[];
  providers: ProviderUsage[];
  models: ModelUsage[];
  taskTypes: TaskTypeUsage[];
  lastUpdated: string;
}

interface CostState {
  data: UsageData | null;
  isLoading: boolean;
  
  // Data operations
  fetchUsageData: () => Promise<void>;
  getSummary: () => UsageSummary;
  getOptimizationTips: () => OptimizationTip[];
}

// Mock data generator
function generateMockData(): UsageData {
  const now = new Date();
  const daily: DailyUsage[] = [];
  
  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    daily.push({
      date: date.toISOString().split('T')[0],
      cost: Math.random() * 5 + 1, // $1-6 per day
      tokens: Math.floor(Math.random() * 100000 + 50000),
      requests: Math.floor(Math.random() * 50 + 20),
    });
  }
  
  const weekTotal = daily.slice(-7).reduce((sum, d) => sum + d.cost, 0);
  const monthTotal = daily.reduce((sum, d) => sum + d.cost, 0);
  const totalSessions = 42;
  const totalRequests = daily.reduce((sum, d) => sum + d.requests, 0);
  
  return {
    summary: {
      weekTotal,
      monthTotal,
      totalSessions,
      totalRequests,
    },
    daily,
    providers: [
      { name: 'Anthropic', cost: monthTotal * 0.6, tokens: 1500000, requests: 800 },
      { name: 'OpenAI', cost: monthTotal * 0.3, tokens: 800000, requests: 450 },
      { name: 'Other', cost: monthTotal * 0.1, tokens: 200000, requests: 150 },
    ],
    models: [
      { name: 'Claude Sonnet 4.5', cost: monthTotal * 0.5, tokens: 1200000, requests: 650 },
      { name: 'GPT-4o', cost: monthTotal * 0.2, tokens: 600000, requests: 350 },
      { name: 'Claude Opus 4', cost: monthTotal * 0.15, tokens: 300000, requests: 100 },
      { name: 'GPT-4o Mini', cost: monthTotal * 0.1, tokens: 400000, requests: 250 },
      { name: 'Claude Haiku 4', cost: monthTotal * 0.05, tokens: 200000, requests: 150 },
    ],
    taskTypes: [
      { name: 'Coding', cost: monthTotal * 0.35, tokens: 800000, requests: 400 },
      { name: 'Design', cost: monthTotal * 0.25, tokens: 600000, requests: 300 },
      { name: 'Writing', cost: monthTotal * 0.2, tokens: 500000, requests: 250 },
      { name: 'Automation', cost: monthTotal * 0.1, tokens: 250000, requests: 200 },
      { name: 'General', cost: monthTotal * 0.1, tokens: 250000, requests: 250 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export const useCostStore = create<CostState>()(
  persist(
    (set, get) => ({
      data: generateMockData(), // Start with mock data
      isLoading: false,

      fetchUsageData: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase or OpenClaw API
        // For now, use mock data
        const mockData = generateMockData();
        set({ data: mockData, isLoading: false });
      },

      getSummary: () => {
        const { data } = get();
        return data?.summary || {
          weekTotal: 0,
          monthTotal: 0,
          totalSessions: 0,
          totalRequests: 0,
        };
      },

      getOptimizationTips: () => {
        const { data } = get();
        if (!data) return [];
        
        const tips: OptimizationTip[] = [];
        const { models, taskTypes, summary } = data;
        
        // Tip 1: Check if expensive models are used for simple tasks
        const expensiveModels = models.filter(
          (m) => m.name.includes('Opus') || (m.name.includes('GPT-4') && !m.name.includes('Mini'))
        );
        const simpleTasks = taskTypes.find((t) => t.name === 'General' || t.name === 'Automation');
        
        if (expensiveModels.length > 0 && simpleTasks) {
          const potentialSaving = expensiveModels.reduce((sum, m) => sum + m.cost, 0) * 0.3;
          tips.push({
            icon: '⚡',
            title: 'Consider cheaper models for routine tasks',
            description: `You're using ${expensiveModels.map((m) => m.name).join(', ')} for some tasks. Claude Sonnet 4.5 or GPT-4o Mini could handle many routine operations at 5-10x lower cost.`,
            saving: potentialSaving,
          });
        }
        
        // Tip 2: Check for high general usage
        const generalUsage = taskTypes.find((t) => t.name === 'General');
        if (generalUsage && generalUsage.cost > summary.monthTotal * 0.5) {
          tips.push({
            icon: '🎯',
            title: 'Classify more tasks',
            description: `${Math.round((generalUsage.cost / summary.monthTotal) * 100)}% of costs are in 'general' category. Better task classification can help identify optimization opportunities.`,
          });
        }
        
        // Tip 3: Automation efficiency
        const automationUsage = taskTypes.find((t) => t.name === 'Automation');
        if (automationUsage && automationUsage.cost > 50) {
          tips.push({
            icon: '🤖',
            title: 'Optimize cron jobs',
            description: `Automation tasks cost $${automationUsage.cost.toFixed(2)}/month. Review cron frequency and consider batching similar checks.`,
            saving: automationUsage.cost * 0.2,
          });
        }
        
        // Tip 4: Use prompt caching
        if (summary.monthTotal > 100) {
          tips.push({
            icon: '💾',
            title: 'Leverage prompt caching',
            description: "For repeated system prompts and context, Anthropic's prompt caching can reduce costs by 90%. Ensure large context blocks are reused across requests.",
            saving: summary.monthTotal * 0.15,
          });
        }
        
        // Default tip if no specific recommendations
        if (tips.length === 0) {
          tips.push({
            icon: '✅',
            title: 'Usage looks optimized',
            description: 'Your current model selection and task distribution appear well-balanced. Continue monitoring for trends.',
          });
        }
        
        return tips;
      },
    }),
    {
      name: 'cost-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
