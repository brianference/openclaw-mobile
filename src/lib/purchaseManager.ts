/**
 * Purchase Manager - In-App Purchase System
 * 
 * Handles one-time $4.99 premium purchase for Mobileclaw
 * Features unlocked:
 * - Ad-free experience
 * - Unlimited cloud storage
 * - Advanced vault features
 * - Priority support
 * - All future premium features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Product IDs (replace with actual IDs from App Store Connect / Google Play Console)
export const PRODUCT_IDS = {
  PREMIUM: Platform.select({
    ios: 'com.openclaw.mobile.premium',
    android: 'com.openclaw.mobile.premium',
    default: 'com.openclaw.mobile.premium',
  }) as string,
};

// Storage keys
const STORAGE_KEYS = {
  PREMIUM_STATUS: '@mobileclaw:premium_status',
  PURCHASE_RECEIPT: '@mobileclaw:purchase_receipt',
  TRIAL_START_DATE: '@mobileclaw:trial_start',
};

// Trial duration in days
const TRIAL_DURATION_DAYS = 7;

export interface PurchaseStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  purchaseDate?: string;
  receipt?: string;
}

/**
 * Check if user has premium access
 */
export async function checkPremiumStatus(): Promise<PurchaseStatus> {
  try {
    // Check if premium was purchased
    const premiumStatus = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
    if (premiumStatus === 'true') {
      const purchaseDate = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_RECEIPT);
      return {
        isPremium: true,
        isTrialActive: false,
        trialDaysRemaining: 0,
        purchaseDate: purchaseDate || undefined,
      };
    }

    // Check trial status
    const trialStartDate = await AsyncStorage.getItem(STORAGE_KEYS.TRIAL_START_DATE);
    if (trialStartDate) {
      const startDate = new Date(trialStartDate);
      const now = new Date();
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, TRIAL_DURATION_DAYS - daysSinceStart);

      return {
        isPremium: false,
        isTrialActive: daysRemaining > 0,
        trialDaysRemaining: daysRemaining,
      };
    }

    // No premium, no trial
    return {
      isPremium: false,
      isTrialActive: false,
      trialDaysRemaining: 0,
    };
  } catch (error) {
    console.error('[PurchaseManager] Error checking premium status:', error);
    return {
      isPremium: false,
      isTrialActive: false,
      trialDaysRemaining: 0,
    };
  }
}

/**
 * Start free trial
 */
export async function startFreeTrial(): Promise<void> {
  try {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.TRIAL_START_DATE, now);
    console.log('[PurchaseManager] Free trial started:', now);
  } catch (error) {
    console.error('[PurchaseManager] Error starting trial:', error);
    throw error;
  }
}

/**
 * Purchase premium (mock implementation for MVP)
 * 
 * In production, this should:
 * 1. Use react-native-iap or expo-in-app-purchases
 * 2. Request purchase from App Store / Play Store
 * 3. Validate receipt server-side
 * 4. Store validated receipt
 */
export async function purchasePremium(): Promise<boolean> {
  try {
    // TODO: Replace with actual IAP implementation
    // For now, simulate purchase for testing
    console.log('[PurchaseManager] Initiating premium purchase...');

    // Simulate async purchase flow
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful purchase
    const purchaseDate = new Date().toISOString();
    const mockReceipt = `MOCK_RECEIPT_${Date.now()}`;

    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_RECEIPT, purchaseDate);

    console.log('[PurchaseManager] Premium purchase successful');
    return true;
  } catch (error) {
    console.error('[PurchaseManager] Purchase failed:', error);
    return false;
  }
}

/**
 * Restore previous purchases
 * 
 * In production, this should:
 * 1. Query App Store / Play Store for existing purchases
 * 2. Validate receipts server-side
 * 3. Restore premium status
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    console.log('[PurchaseManager] Restoring purchases...');

    // TODO: Replace with actual restore implementation
    // Check if premium status exists in storage (offline restore)
    const premiumStatus = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);

    if (premiumStatus === 'true') {
      console.log('[PurchaseManager] Premium status restored from local storage');
      return true;
    }

    console.log('[PurchaseManager] No purchases to restore');
    return false;
  } catch (error) {
    console.error('[PurchaseManager] Restore failed:', error);
    return false;
  }
}

/**
 * Get product pricing
 * 
 * In production, fetch from App Store / Play Store
 */
export async function getProductPrice(): Promise<string> {
  // TODO: Fetch actual price from store
  return '$4.99';
}

/**
 * Check if a feature requires premium
 */
export function isFeaturePremium(feature: string): boolean {
  const premiumFeatures = [
    'unlimited_cloud_storage',
    'advanced_vault',
    'priority_support',
    'custom_themes',
    'export_data',
  ];

  return premiumFeatures.includes(feature);
}

/**
 * Clear all purchase data (for testing)
 */
export async function clearPurchaseData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PREMIUM_STATUS,
      STORAGE_KEYS.PURCHASE_RECEIPT,
      STORAGE_KEYS.TRIAL_START_DATE,
    ]);
    console.log('[PurchaseManager] Purchase data cleared');
  } catch (error) {
    console.error('[PurchaseManager] Error clearing purchase data:', error);
  }
}
