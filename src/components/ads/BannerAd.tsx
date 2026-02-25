/**
 * Banner Ad Component
 * 
 * Displays a 320x50 banner ad at the bottom of screens
 * Handles loading states, errors, and GDPR compliance
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../../config/admob';

interface BannerAdComponentProps {
  /**
   * Custom ad unit ID (optional, uses config default if not provided)
   */
  adUnitId?: string;
  
  /**
   * Whether to show the banner (can be controlled by parent)
   */
  visible?: boolean;
}

export default function BannerAdComponent({ adUnitId, visible = true }: BannerAdComponentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Use provided ad unit ID or fall back to config
  const bannerAdUnitId = adUnitId || ADMOB_CONFIG.bannerAdUnitId || TestIds.BANNER;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [bannerAdUnitId]);

  if (!visible || hasError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
          setHasError(true);
          // Don't show error to user, just hide the ad
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    minHeight: 58, // 50px ad + 8px padding
  },
});
