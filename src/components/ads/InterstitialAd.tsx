/**
 * Interstitial Ad Manager
 * 
 * Manages interstitial ad loading and display
 * Enforces timing rules (max 1 ad per 5 minutes)
 * Never interrupts critical workflows
 */

import { useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../../config/admob';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_INTERSTITIAL_KEY = '@last_interstitial_time';

let interstitialAd: InterstitialAd | null = null;
let isAdLoaded = false;
let isAdShowing = false;

/**
 * Initialize interstitial ad
 */
export function initializeInterstitialAd() {
  const adUnitId = ADMOB_CONFIG.interstitialAdUnitId || TestIds.INTERSTITIAL;
  
  interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });

  // Listen to ad events
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isAdLoaded = true;
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    isAdShowing = false;
    isAdLoaded = false;
    // Reload a new ad for next time
    interstitialAd?.load();
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log('Interstitial ad error:', error);
    isAdLoaded = false;
    isAdShowing = false;
    // Try to reload
    setTimeout(() => {
      interstitialAd?.load();
    }, 5000);
  });

  // Load the ad
  interstitialAd.load();
}

/**
 * Check if enough time has passed since last interstitial
 */
async function canShowInterstitial(): Promise<boolean> {
  try {
    const lastShowTime = await AsyncStorage.getItem(LAST_INTERSTITIAL_KEY);
    
    if (!lastShowTime) return true;

    const timeSinceLastAd = Date.now() - parseInt(lastShowTime, 10);
    return timeSinceLastAd >= ADMOB_CONFIG.timing.minInterstitialInterval;
  } catch (error) {
    console.error('Error checking interstitial timing:', error);
    return true; // Default to allowing ad if check fails
  }
}

/**
 * Show interstitial ad if conditions are met
 */
export async function showInterstitialAd(): Promise<boolean> {
  // Check if ad is ready and timing allows
  if (!interstitialAd || !isAdLoaded || isAdShowing) {
    return false;
  }

  const canShow = await canShowInterstitial();
  if (!canShow) {
    return false;
  }

  try {
    await interstitialAd.show();
    isAdShowing = true;
    
    // Update last show time
    await AsyncStorage.setItem(LAST_INTERSTITIAL_KEY, Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    return false;
  }
}

/**
 * Hook to automatically show interstitial after major actions
 */
export function useInterstitialAd() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initializeInterstitialAd();
      initialized.current = true;
    }
  }, []);

  return {
    showAd: showInterstitialAd,
    isReady: isAdLoaded && !isAdShowing,
  };
}
