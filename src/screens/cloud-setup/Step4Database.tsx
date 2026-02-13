import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FormField } from '../../components/wizard/FormField';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { validateTableName } from '../../services/cloudSetup/validation';
import { colors, spacing } from '../../styles/wizard';

interface Step4Props {
  tableName: string;
  onUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Database: React.FC<Step4Props> = ({
  tableName,
  onUpdate,
  onNext,
  onBack
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const validateField = () => {
    setError(validateTableName(tableName));
  };
  
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={4} />
      
      <Text style={styles.heading}>Configure DynamoDB for Data Sync</Text>
      
      <FormField
        label="Table Name"
        value={tableName}
        onChange={(val) => onUpdate('tableName', val)}
        onBlur={validateField}
        error={error || undefined}
        required
        placeholder="mobileclaw-sync-data"
      />
      
      <Text style={styles.costEstimate}>💾 Estimated Cost: ~$2.50/month</Text>
      
      <ButtonGroup
        onBack={onBack}
        onNext={onNext}
        nextLabel="Save & Continue →"
        nextDisabled={!tableName || error !== null}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  
  costEstimate: {
    fontSize: 16,
    color: colors.gray700,
    marginTop: spacing.lg,
  },
});
