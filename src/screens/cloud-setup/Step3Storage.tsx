import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FormField } from '../../components/wizard/FormField';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { validateBucketName } from '../../services/cloudSetup/validation';
import { colors, spacing } from '../../styles/wizard';

interface Step3Props {
  bucketName: string;
  onUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Storage: React.FC<Step3Props> = ({
  bucketName,
  onUpdate,
  onNext,
  onBack
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const validateField = () => {
    setError(validateBucketName(bucketName));
  };
  
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={3} />
      
      <Text style={styles.heading}>Configure Your Storage Bucket</Text>
      
      <FormField
        label="S3 Bucket Name"
        value={bucketName}
        onChange={(val) => onUpdate('bucketName', val)}
        onBlur={validateField}
        error={error || undefined}
        helpText="Must be globally unique"
        required
        placeholder="mobileclaw-backup-yourname"
      />
      
      <Text style={styles.costEstimate}>💾 Estimated Cost: ~$0.50/month</Text>
      <Text style={styles.costDescription}>(Based on 5GB storage)</Text>
      
      <ButtonGroup
        onBack={onBack}
        onNext={onNext}
        nextLabel="Save & Continue →"
        nextDisabled={!bucketName || error !== null}
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
  
  costDescription: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
});
