import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Subscription, SubscriptionTier } from '../types';

export const TIER_CONFIG = {
  free: {
    name: 'Free',
    price: '$0',
    priceDetail: 'forever',
    credits_per_month: 50,
    max_conversations: 5,
    max_notes: 20,
    max_cards: 10,
    features: [
      '50 AI credits per month',
      '5 conversations',
      '20 brain notes',
      '10 kanban cards',
      'Secure vault storage',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$9.99',
    priceDetail: 'per month',
    credits_per_month: 500,
    max_conversations: -1,
    max_notes: -1,
    max_cards: -1,
    popular: true,
    features: [
      '500 AI credits per month',
      'Unlimited conversations',
      'Unlimited brain notes',
      'Unlimited kanban cards',
      'Secure vault storage',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    price: '$19.99',
    priceDetail: 'per month',
    credits_per_month: -1,
    max_conversations: -1,
    max_notes: -1,
    max_cards: -1,
    features: [
      'Unlimited AI credits',
      'Unlimited everything',
      'Early access to new features',
      'Premium support',
      'Custom themes',
      'Advanced analytics',
    ],
  },
};

export interface TierLimits {
  name: string;
  price: string;
  priceDetail: string;
  credits_per_month: number;
  max_conversations: number;
  max_notes: number;
  max_cards: number;
  features: string[];
  popular?: boolean;
}

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;

  fetchSubscription: () => Promise<void>;
  getTier: () => SubscriptionTier;
  getTierLimits: () => TierLimits;
  canCreateConversation: (currentCount: number) => boolean;
  canCreateNote: (currentCount: number) => boolean;
  canCreateCard: (currentCount: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  subscription: null,
  isLoading: false,

  fetchSubscription: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ isLoading: true });
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    set({ subscription: data as Subscription | null, isLoading: false });
  },

  getTier: () => {
    return get().subscription?.tier || 'free';
  },

  getTierLimits: () => {
    const tier = get().getTier();
    return TIER_CONFIG[tier];
  },

  canCreateConversation: (currentCount) => {
    const limits = get().getTierLimits();
    return limits.max_conversations === -1 || currentCount < limits.max_conversations;
  },

  canCreateNote: (currentCount) => {
    const limits = get().getTierLimits();
    return limits.max_notes === -1 || currentCount < limits.max_notes;
  },

  canCreateCard: (currentCount) => {
    const limits = get().getTierLimits();
    return limits.max_cards === -1 || currentCount < limits.max_cards;
  },
}));
