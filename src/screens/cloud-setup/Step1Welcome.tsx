import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SelectionCard } from '../../components/wizard/SelectionCard';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { colors, spacing } from '../../styles/wizard';

interface Step1Props {
  provider: 'aws' | 'google' | null;
  onProviderSelect: (provider: 'aws' | 'google') => void;
  onNext: () => void;
  onSkipWizard: () => void;
}

export const Step1Welcome: React.FC<Step1Props> = ({
  provider,
  onProviderSelect,
  onNext,
  onSkipWizard
}) => {
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={1} />
      
      <Text style={styles.heading}>Choose Your Cloud Provider</Text>
      <Text style={styles.description}>
        Select where you'd like to store your Mobileclaw data securely.
      </Text>
      
      <SelectionCard
        title="AWS"
        description="Amazon S3, DynamoDB, Lambda"
        icon="🟠"
        selected={provider === 'aws'}
        onClick={() => onProviderSelect('aws')}
        features={[
          'Most reliable',
          'Free tier available'
        ]}
      />
      
      <SelectionCard
        title="Google Cloud"
        description="Cloud Storage, Firestore"
        icon="🔵"
        selected={provider === 'google'}
        onClick={() => onProviderSelect('google')}
        features={[
          'Fast global sync',
          'Free tier available'
        ]}
      />
      
      <Text style={styles.helpLink} onPress={onSkipWizard}>
        Skip Wizard (Advanced)
      </Text>
      
      <ButtonGroup
        onNext={onNext}
        nextDisabled={!provider}
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
  
  helpLink: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.md,
    textDecorationLine: 'underline',
  },
});
