// Wizard-specific styles based on DESIGN-PATTERNS.md

import { StyleSheet, Platform } from 'react-native';

export const colors = {
  // Primary
  primaryBlue: '#3b82f6',
  primaryBlueDark: '#2563eb',
  primaryBlueLight: '#eff6ff',
  
  // Success
  successGreen: '#10b981',
  successGreenLight: '#ecfdf5',
  
  // Error
  errorRed: '#ef4444',
  errorRedLight: '#fef2f2',
  
  // Warning
  warningAmber: '#f59e0b',
  warningAmberLight: '#fffbeb',
  
  // Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background
  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
  },
};

export const wizardStyles = StyleSheet.create({
  // Wizard Container
  wizardContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.xl,
    maxWidth: 480,
    width: '100%',
    maxHeight: '90%',
  },
  
  wizardContainerMobile: {
    borderRadius: 0,
    maxWidth: '100%',
    height: '100%',
    maxHeight: '100%',
  },
  
  // Progress Indicator
  progressContainer: {
    marginBottom: spacing.lg,
  },
  
  progressCompact: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.gray500,
    marginBottom: spacing.md,
  },
  
  // Selection Card
  selectionCard: {
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  selectionCardSelected: {
    borderColor: colors.primaryBlue,
    borderWidth: 3,
    backgroundColor: colors.primaryBlueLight,
  },
  
  selectionCardIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  
  selectionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  
  selectionCardDescription: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: spacing.md,
  },
  
  // Form Field
  formField: {
    marginBottom: spacing.lg,
  },
  
  formFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  
  formFieldRequired: {
    color: colors.errorRed,
  },
  
  formFieldInputContainer: {
    position: 'relative',
  },
  
  formFieldInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.gray900,
  },
  
  formFieldInputFocus: {
    borderColor: colors.primaryBlue,
    borderWidth: 2,
  },
  
  formFieldInputError: {
    borderColor: colors.errorRed,
  },
  
  formFieldError: {
    color: colors.errorRed,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  
  formFieldHelp: {
    color: colors.gray500,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  
  formFieldSuccess: {
    color: colors.successGreen,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  
  // Help Section
  helpSection: {
    backgroundColor: colors.gray100,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  
  helpSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  helpSectionTitle: {
    fontWeight: '600',
    color: colors.gray700,
    fontSize: 14,
  },
  
  helpSectionIcon: {
    fontSize: 20,
  },
  
  helpSectionContent: {
    marginTop: spacing.md,
    color: colors.gray500,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Test Connection
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
  },
  
  testItemRunning: {
    backgroundColor: colors.primaryBlueLight,
  },
  
  testItemSuccess: {
    backgroundColor: colors.successGreenLight,
  },
  
  testItemError: {
    backgroundColor: colors.errorRedLight,
  },
  
  testIcon: {
    fontSize: 20,
  },
  
  testName: {
    fontSize: 14,
    color: colors.gray700,
    flex: 1,
  },
  
  // Buttons
  btnPrimary: {
    backgroundColor: colors.primaryBlue,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  
  btnPrimaryDisabled: {
    backgroundColor: colors.gray300,
  },
  
  btnPrimaryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gray300,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  btnSecondaryText: {
    color: colors.gray600,
    fontWeight: '600',
    fontSize: 16,
  },
  
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  
  // Utilities
  textCenter: {
    textAlign: 'center',
  },
  
  mb0: { marginBottom: 0 },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },
  
  mt0: { marginTop: 0 },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },
});

export default wizardStyles;
