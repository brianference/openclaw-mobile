import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Picker } from 'react-native';
import { FormField } from '../../components/wizard/FormField';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { HelpSection } from '../../components/wizard/HelpSection';
import { validateAwsAccessKey, validateAwsSecretKey } from '../../services/cloudSetup/validation';
import { colors, spacing } from '../../styles/wizard';

interface Step2AWSProps {
  accessKey: string;
  secretKey: string;
  region: string;
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const AWS_REGIONS = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (N. California)', value: 'us-west-1' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
  { label: 'EU (Ireland)', value: 'eu-west-1' },
  { label: 'EU (Frankfurt)', value: 'eu-central-1' },
  { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
];

export const Step2AWSCredentials: React.FC<Step2AWSProps> = ({
  accessKey,
  secretKey,
  region,
  onUpdate,
  onNext,
  onBack
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  
  const validateField = (field: string, value: string) => {
    let error: string | null = null;
    
    if (field === 'accessKey') {
      error = validateAwsAccessKey(value);
    } else if (field === 'secretKey') {
      error = validateAwsSecretKey(value);
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const isValid = () => {
    return (
      validateAwsAccessKey(accessKey) === null &&
      validateAwsSecretKey(secretKey) === null &&
      region !== ''
    );
  };
  
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={2} />
      
      <Text style={styles.heading}>🟠 AWS Configuration</Text>
      <Text style={styles.description}>
        Enter your AWS credentials. Don't have them?{' '}
        <Text style={styles.link}>Create AWS Account</Text>
      </Text>
      
      <FormField
        label="AWS Access Key ID"
        value={accessKey}
        onChange={(val) => onUpdate('accessKey', val)}
        onBlur={() => validateField('accessKey', accessKey)}
        error={errors.accessKey || undefined}
        helpText="Starts with AKIA, 20 characters"
        required
        placeholder="AKIAIOSFODNN7EXAMPLE"
      />
      
      <FormField
        label="AWS Secret Access Key"
        value={secretKey}
        onChange={(val) => onUpdate('secretKey', val)}
        onBlur={() => validateField('secretKey', secretKey)}
        error={errors.secretKey || undefined}
        required
        secureTextEntry
        showPasswordToggle
        placeholder="Enter your secret key"
      />
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>AWS Region *</Text>
        <Picker
          selectedValue={region}
          onValueChange={(val) => onUpdate('region', val)}
          style={styles.picker}
        >
          <Picker.Item label="Select a region..." value="" />
          {AWS_REGIONS.map(r => (
            <Picker.Item key={r.value} label={r.label} value={r.value} />
          ))}
        </Picker>
      </View>
      
      <HelpSection title="Where to find these credentials?">
        <Text style={styles.helpText}>
          1. Log in to AWS Console{'\n'}
          2. Go to IAM → Users → Your User{'\n'}
          3. Click "Security credentials" tab{'\n'}
          4. Click "Create access key"{'\n'}
          5. Download or copy the credentials
        </Text>
      </HelpSection>
      
      <ButtonGroup
        onBack={onBack}
        onNext={onNext}
        nextLabel="Save & Continue →"
        nextDisabled={!isValid()}
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
  
  link: {
    color: colors.primaryBlue,
    textDecorationLine: 'underline',
  },
  
  pickerContainer: {
    marginBottom: spacing.lg,
  },
  
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  
  picker: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
  },
  
  helpText: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
});
