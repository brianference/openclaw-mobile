import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TestConnectionProps, TestResult } from '../../types/cloudSetup';
import { wizardStyles, colors, spacing } from '../../styles/wizard';

const getTestIcon = (status: TestResult['status']): string => {
  switch (status) {
    case 'pending': return '⏺️';
    case 'running': return '⏳';
    case 'success': return '✓';
    case 'error': return '❌';
    default: return '⏺️';
  }
};

const getTestStyle = (status: TestResult['status']) => {
  switch (status) {
    case 'running': return wizardStyles.testItemRunning;
    case 'success': return wizardStyles.testItemSuccess;
    case 'error': return wizardStyles.testItemError;
    default: return {};
  }
};

export const TestConnection: React.FC<TestConnectionProps> = ({
  tests,
  onRetry
}) => {
  const hasErrors = tests.some(t => t.status === 'error');
  const allSuccess = tests.every(t => t.status === 'success');
  
  return (
    <View>
      {tests.map((test, index) => (
        <View key={index} style={[wizardStyles.testItem, getTestStyle(test.status)]}>
          {test.status === 'running' ? (
            <ActivityIndicator size="small" color={colors.primaryBlue} />
          ) : (
            <Text style={wizardStyles.testIcon}>{getTestIcon(test.status)}</Text>
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={wizardStyles.testName}>{test.name}</Text>
            {test.error && (
              <Text style={styles.errorText}>{test.error}</Text>
            )}
          </View>
        </View>
      ))}
      
      {hasErrors && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Retry Failed Tests</Text>
        </TouchableOpacity>
      )}
      
      {allSuccess && (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>
            ✅ All tests passed successfully!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    color: colors.errorRed,
    marginTop: 4,
  },
  
  retryButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  successBanner: {
    backgroundColor: colors.successGreenLight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.successGreen,
  },
  
  successBannerText: {
    color: colors.successGreen,
    fontWeight: '600',
    fontSize: 16,
  },
});
