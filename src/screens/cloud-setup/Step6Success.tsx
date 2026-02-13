import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { colors, spacing } from '../../styles/wizard';

interface Step6Props {
  provider: 'aws' | 'google';
  config: any;
  onFinish: () => void;
}

export const Step6Success: React.FC<Step6Props> = ({
  provider,
  config,
  onFinish
}) => {
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={6} />
      
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.heading}>Cloud Storage Configured!</Text>
        <Text style={styles.description}>
          Your Mobileclaw data will now sync automatically to {provider === 'aws' ? 'AWS' : 'Google Cloud'}.
        </Text>
      </View>
      
      <View style={styles.nextSteps}>
        <Text style={styles.nextStepsTitle}>Next Steps:</Text>
        <Text style={styles.nextStep}>1. ✓ Initial backup starting now</Text>
        <Text style={styles.nextStep}>2. ⏳ Enable auto-sync (Settings)</Text>
        <Text style={styles.nextStep}>3. 💡 Set up sync schedule</Text>
      </View>
      
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Configuration Summary:</Text>
        <Text style={styles.summaryItem}>• Provider: {provider === 'aws' ? 'AWS' : 'Google Cloud'}</Text>
        {provider === 'aws' && (
          <>
            <Text style={styles.summaryItem}>• Region: {config.awsRegion}</Text>
            <Text style={styles.summaryItem}>• Storage: {config.bucketName}</Text>
            <Text style={styles.summaryItem}>• Database: {config.tableName}</Text>
          </>
        )}
      </View>
      
      <ButtonGroup
        onNext={onFinish}
        nextLabel="Start Using App →"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  description: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
  },
  
  nextSteps: {
    backgroundColor: colors.primaryBlueLight,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue,
  },
  
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  
  nextStep: {
    fontSize: 14,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  
  summary: {
    backgroundColor: colors.gray50,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  
  summaryItem: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
});
