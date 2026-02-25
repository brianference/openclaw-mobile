/**
 * AdMob Configuration
 * 
 * IMPORTANT: Replace test IDs with your actual AdMob unit IDs before production release
 * Test IDs are provided by Google for development and testing purposes
 */

import { Platform } from 'react-native';

export const ADMOB_CONFIG = {
  // Application IDs (replace with your actual app IDs)
  appId: Platform.select({
    ios: 'ca-app-pub-3940256099942544~1458002511', // Test ID - REPLACE IN PRODUCTION
    android: 'ca-app-pub-3940256099942544~3347511713', // Test ID - REPLACE IN PRODUCTION
  }),

  // Banner Ad Unit IDs
  bannerAdUnitId: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716', // Test ID - REPLACE IN PRODUCTION
    android: 'ca-app-pub-3940256099942544/6300978111', // Test ID - REPLACE IN PRODUCTION
  }),

  // Interstitial Ad Unit IDs
  interstitialAdUnitId: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910', // Test ID - REPLACE IN PRODUCTION
    android: 'ca-app-pub-3940256099942544/1033173712', // Test ID - REPLACE IN PRODUCTION
  }),

  // Rewarded Ad Unit IDs
  rewardedAdUnitId: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313', // Test ID - REPLACE IN PRODUCTION
    android: 'ca-app-pub-3940256099942544/5224354917', // Test ID - REPLACE IN PRODUCTION
  }),

  // Ad-free zones (screens where ads should NEVER appear)
  adFreeZones: [
    '/auth',
    '/login',
    '/signup',
    '/payment',
    '/settings',
    '/vault', // Authentication/sensitive data
  ],

  // Screens where banner ads are appropriate
  bannerAllowedScreens: [
    '/home',
    '/(tabs)/tasks',
    '/(tabs)/scanner',
    '/tasks/completed',
  ],

  // Timing constraints
  timing: {
    minInterstitialInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
    bannerRefreshRate: 60 * 1000, // 1 minute (optional, banner auto-refreshes by default)
  },

  // Test device IDs (for testing real ads without affecting account)
  // Add your test device IDs here during development
  testDeviceIds: [
    // Example: '2077ef9a63d2b398840261c8221a0c9b'
  ],
};

/**
 * Check if ads should be shown on current screen
 */
export function shouldShowAds(currentRoute: string): boolean {
  return !ADMOB_CONFIG.adFreeZones.some(zone => currentRoute.startsWith(zone));
}

/**
 * Check if banner ads are allowed on current screen
 */
export function shouldShowBanner(currentRoute: string): boolean {
  if (!shouldShowAds(currentRoute)) return false;
  return ADMOB_CONFIG.bannerAllowedScreens.some(screen => currentRoute.startsWith(screen));
}
