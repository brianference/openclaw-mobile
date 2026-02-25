/**
 * usePremium Hook
 * 
 * Manages premium status throughout the app
 * Used to show/hide ads and restrict premium features
 */

import { useState, useEffect, useCallback } from 'react';
import { checkPremiumStatus, type PurchaseStatus } from './purchaseManager';

export function usePremium() {
  const [status, setStatus] = useState<PurchaseStatus>({
    isPremium: false,
    isTrialActive: false,
    trialDaysRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    try {
      const newStatus = await checkPremiumStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('[usePremium] Error refreshing status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Helper: Check if user has premium access (purchased or in trial)
  const hasP remiumAccess = status.isPremium || status.isTrialActive;

  // Helper: Check if ads should be shown
  const shouldShowAds = !hasPremiumAccess;

  // Helper: Check if a specific feature is available
  const hasFeature = useCallback((feature: string): boolean => {
    // Basic features available to everyone
    const basicFeatures = [
      'chat',
      'tasks',
      'vault_basic',
      'scanner',
    ];

    if (basicFeatures.includes(feature)) {
      return true;
    }

    // Premium features require premium access
    return hasPremiumAccess;
  }, [hasPremiumAccess]);

  return {
    ...status,
    hasPremiumAccess,
    shouldShowAds,
    hasFeature,
    loading,
    refreshStatus,
  };
}
