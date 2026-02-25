/**
 * Ad Manager
 * 
 * Central manager for all ad-related functionality
 * Handles initialization, consent, and ad display logic
 */

import React from 'react';
import mobileAds from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../config/admob';
import { requestAdConsent, hasConsent } from './adConsent';
import { initializeInterstitialAd, showInterstitialAd } from '../components/ads/InterstitialAd';
import { initializeRewardedAd, showRewardedAd } from '../components/ads/RewardedAd';

class AdManager {
  private initialized = false;
  private consentObtained = false;

  /**
   * Initialize the AdMob SDK
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      // Check if user has given consent
      this.consentObtained = await hasConsent();
      
      if (!this.consentObtained) {
        // Request consent if not already obtained
        const consentInfo = await requestAdConsent();
        this.consentObtained = consentInfo.canRequestAds;
      }

      // Only initialize ads if we have consent
      if (this.consentObtained) {
        await mobileAds().initialize();
        
        // Set test device IDs if provided
        if (ADMOB_CONFIG.testDeviceIds.length > 0) {
          await mobileAds().setRequestConfiguration({
            testDeviceIdentifiers: ADMOB_CONFIG.testDeviceIds,
          });
        }

        // Initialize interstitial and rewarded ads
        initializeInterstitialAd();
        initializeRewardedAd();

        this.initialized = true;
        console.log('AdMob initialized successfully');
        return true;
      } else {
        console.log('User consent not obtained, ads will not be shown');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      return false;
    }
  }

  /**
   * Check if ads are ready to be shown
   */
  isReady(): boolean {
    return this.initialized && this.consentObtained;
  }

  /**
   * Show an interstitial ad after a major action
   */
  async showInterstitial(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    return await showInterstitialAd();
  }

  /**
   * Show a rewarded ad
   * Returns reward info if user completes the ad
   */
  async showRewarded() {
    if (!this.isReady()) {
      return null;
    }

    return await showRewardedAd();
  }
}

// Export singleton instance
export const adManager = new AdManager();

/**
 * Helper hook to initialize ads in root component
 */
export function useAdManagerInit() {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    adManager.initialize().then((success) => {
      setInitialized(success);
    });
  }, []);

  return initialized;
}

// Re-export for convenience
export { default as BannerAd } from '../components/ads/BannerAd';
export { useInterstitialAd } from '../components/ads/InterstitialAd';
export { useRewardedAd } from '../components/ads/RewardedAd';
