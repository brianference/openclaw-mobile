/**
 * Ad Consent Manager - GDPR/CCPA Compliance
 * 
 * Manages user consent for personalized ads in compliance with privacy regulations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

const CONSENT_KEY = '@admob_consent_status';
const CONSENT_DATE_KEY = '@admob_consent_date';

export interface ConsentInfo {
  status: AdsConsentStatus;
  canRequestAds: boolean;
  consentDate?: string;
}

/**
 * Request user consent for ads (GDPR/CCPA compliance)
 */
export async function requestAdConsent(): Promise<ConsentInfo> {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();
    
    // Store consent status
    await AsyncStorage.setItem(CONSENT_KEY, consentInfo.status);
    await AsyncStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());

    return {
      status: consentInfo.status,
      canRequestAds: consentInfo.canRequestAds,
      consentDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error requesting ad consent:', error);
    // Default to not showing personalized ads if consent fails
    return {
      status: AdsConsentStatus.NOT_REQUIRED,
      canRequestAds: true,
      consentDate: new Date().toISOString(),
    };
  }
}

/**
 * Get stored consent status
 */
export async function getConsentStatus(): Promise<ConsentInfo | null> {
  try {
    const status = await AsyncStorage.getItem(CONSENT_KEY);
    const date = await AsyncStorage.getItem(CONSENT_DATE_KEY);

    if (!status) return null;

    return {
      status: status as AdsConsentStatus,
      canRequestAds: status === AdsConsentStatus.OBTAINED,
      consentDate: date || undefined,
    };
  } catch (error) {
    console.error('Error getting consent status:', error);
    return null;
  }
}

/**
 * Show consent form if required
 */
export async function showConsentFormIfRequired(): Promise<boolean> {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
      await AdsConsent.showForm();
      const updatedInfo = await AdsConsent.requestInfoUpdate();
      
      // Save updated consent
      await AsyncStorage.setItem(CONSENT_KEY, updatedInfo.status);
      await AsyncStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
      
      return updatedInfo.canRequestAds;
    }

    return consentInfo.canRequestAds;
  } catch (error) {
    console.error('Error showing consent form:', error);
    return false;
  }
}

/**
 * Reset consent (for testing or user request)
 */
export async function resetConsent(): Promise<void> {
  try {
    await AdsConsent.reset();
    await AsyncStorage.removeItem(CONSENT_KEY);
    await AsyncStorage.removeItem(CONSENT_DATE_KEY);
  } catch (error) {
    console.error('Error resetting consent:', error);
  }
}

/**
 * Check if user has given consent
 */
export async function hasConsent(): Promise<boolean> {
  const consentInfo = await getConsentStatus();
  return consentInfo?.canRequestAds ?? false;
}
