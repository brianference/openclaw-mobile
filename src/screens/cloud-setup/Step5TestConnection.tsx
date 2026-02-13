import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { TestConnection } from '../../components/wizard/TestConnection';
import { runConnectionTests } from '../../services/cloudSetup/api';
import { TestResult } from '../../types/cloudSetup';
import { colors, spacing } from '../../styles/wizard';

interface Step5Props {
  provider: 'aws' | 'google';
  config: any;
  onNext: () => void;
  onBack: () => void;
}

export const Step5TestConnection: React.FC<Step5Props> = ({
  provider,
  config,
  onNext,
  onBack
}) => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isTestComplete, setIsTestComplete] = useState(false);
  
  useEffect(() => {
    runTests();
  }, []);
  
  const runTests = async () => {
    setIsTestComplete(false);
    const results = await runConnectionTests(provider, config, setTests);
    setTests(results);
    setIsTestComplete(true);
  };
  
  const allPassed = tests.every(t => t.status === 'success');
  const hasErrors = tests.some(t => t.status === 'error');
  
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={5} />
      
      <Text style={styles.heading}>
        {allPassed ? '✅ Connection Successful!' : 'Testing Your Configuration...'}
      </Text>
      
      {!isTestComplete && (
        <Text style={styles.description}>
          This may take 30-60 seconds...
        </Text>
      )}
      
      <TestConnection tests={tests} onRetry={runTests} />
      
      {hasErrors && (
        <View style={styles.troubleshooting}>
          <Text style={styles.troubleshootingTitle}>💡 Troubleshooting:</Text>
          <Text style={styles.troubleshootingText}>
            • Check that your IAM user has the required permissions{'\n'}
            • Verify your AWS region matches{'\n'}
            • Ensure your account has free tier available
          </Text>
        </View>
      )}
      
      <ButtonGroup
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue →"
        nextDisabled={!allPassed}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  
  description: {
    fontSize: 16,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  
  troubleshooting: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAmber,
  },
  
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  
  troubleshootingText: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
});
