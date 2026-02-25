/**
 * Rewarded Ad Manager
 * 
 * Manages rewarded video ads
 * User chooses to watch ad in exchange for rewards (premium features, storage, etc.)
 */

import { useEffect, useRef, useState } from 'react';
import { RewardedAd, AdEventType, TestIds, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../../config/admob';

export interface RewardedAdReward {
  type: string;
  amount: number;
}

let rewardedAd: RewardedAd | null = null;
let isAdLoaded = false;
let isAdShowing = false;

/**
 * Initialize rewarded ad
 */
export function initializeRewardedAd() {
  const adUnitId = ADMOB_CONFIG.rewardedAdUnitId || TestIds.REWARDED;
  
  rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });

  // Listen to ad events
  rewardedAd.addAdEventListener(AdEventType.LOADED, () => {
    isAdLoaded = true;
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    isAdShowing = false;
    isAdLoaded = false;
    // Reload a new ad for next time
    rewardedAd?.load();
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log('Rewarded ad error:', error);
    isAdLoaded = false;
    isAdShowing = false;
    // Try to reload
    setTimeout(() => {
      rewardedAd?.load();
    }, 5000);
  });

  // Load the ad
  rewardedAd.load();
}

/**
 * Show rewarded ad
 * Returns a promise that resolves with the reward if user completes the ad
 */
export async function showRewardedAd(): Promise<RewardedAdReward | null> {
  if (!rewardedAd || !isAdLoaded || isAdShowing) {
    console.log('Rewarded ad not ready');
    return null;
  }

  return new Promise((resolve) => {
    let rewardGranted = false;

    // Listen for reward earned event
    const unsubscribeEarned = rewardedAd!.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        rewardGranted = true;
        console.log('User earned reward:', reward);
      }
    );

    // Listen for ad closed event
    const unsubscribeClosed = rewardedAd!.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        // Cleanup listeners
        unsubscribeEarned();
        unsubscribeClosed();

        // Resolve with reward if earned, null otherwise
        if (rewardGranted) {
          resolve({
            type: 'premium_time',
            amount: 1,
          });
        } else {
          resolve(null);
        }
      }
    );

    // Show the ad
    try {
      rewardedAd!.show();
      isAdShowing = true;
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      unsubscribeEarned();
      unsubscribeClosed();
      resolve(null);
    }
  });
}

/**
 * Hook to manage rewarded ads
 */
export function useRewardedAd() {
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!initialized.current) {
      initializeRewardedAd();
      initialized.current = true;
    }

    // Poll ad ready state
    const interval = setInterval(() => {
      setIsReady(isAdLoaded && !isAdShowing);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    showAd: showRewardedAd,
    isReady,
  };
}
