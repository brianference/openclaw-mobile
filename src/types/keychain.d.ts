/**
 * Type declarations for react-native-keychain
 * Note: This is a minimal type definition for MobileClaw's usage
 */

declare module 'react-native-keychain' {
  export enum ACCESSIBLE {
    WHEN_UNLOCKED = 'AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK = 'AccessibleAfterFirstUnlockThisDeviceOnly',
    ALWAYS = 'AccessibleAlwaysThisDeviceOnly',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'AccessibleWhenPasscodeSetThisDeviceOnly',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'AccessibleWhenUnlockedThisDeviceOnly',
  }

  export interface KeychainOptions {
    service?: string;
    accessible?: ACCESSIBLE;
    securityLevel?: 'SECURE_SOFTWARE' | 'SECURE_HARDWARE';
  }

  export interface GenericPasswordResult {
    username: string;
    password: string;
    service?: string;
  }

  /**
   * Store a generic password in the keychain
   */
  export function setGenericPassword(
    username: string,
    password: string,
    options?: KeychainOptions
  ): Promise<boolean>;

  /**
   * Retrieve a generic password from the keychain
   */
  export function getGenericPassword(
    options?: KeychainOptions
  ): Promise<GenericPasswordResult | false>;

  /**
   * Reset a generic password in the keychain
   */
  export function resetGenericPassword(
    options?: KeychainOptions
  ): Promise<boolean>;

  /**
   * Check if a generic password exists
   */
  export function hasGenericPassword(
    options?: KeychainOptions
  ): Promise<{ result: boolean }>;
}