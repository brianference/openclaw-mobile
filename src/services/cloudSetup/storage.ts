// AsyncStorage draft management for Cloud Setup Wizard

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WizardState } from '../../types/cloudSetup';

export const DRAFT_KEY = 'cloud-setup-wizard-draft';
export const DRAFT_EXPIRY_DAYS = 7;

export const saveDraft = async (state: WizardState): Promise<void> => {
  try {
    const draft = {
      ...state,
      savedAt: Date.now()
    };
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save wizard draft:', error);
  }
};

export const loadDraft = async (): Promise<WizardState | null> => {
  try {
    const draftStr = await AsyncStorage.getItem(DRAFT_KEY);
    if (!draftStr) return null;
    
    const draft = JSON.parse(draftStr);
    const daysSince = (Date.now() - draft.savedAt) / (1000 * 60 * 60 * 24);
    
    if (daysSince > DRAFT_EXPIRY_DAYS) {
      await clearDraft();
      return null;
    }
    
    return draft;
  } catch (error) {
    console.error('Failed to load wizard draft:', error);
    return null;
  }
};

export const clearDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Failed to clear wizard draft:', error);
  }
};

export const hasDraft = async (): Promise<boolean> => {
  const draft = await loadDraft();
  return draft !== null;
};
