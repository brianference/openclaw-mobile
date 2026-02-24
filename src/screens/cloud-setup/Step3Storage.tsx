import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FormField } from '../../components/wizard/FormField';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { validateBucketName } from '../../services/cloudSetup/validation';
import { checkBucketAvailability } from '../../services/cloudSetup/api';
import { colors, spacing } from '../../styles/wizard';
import { Checkbox } from '../../components/Checkbox';

// Debounce utility
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface Step3Props {
  bucketName: string;
  enableEncryption?: boolean;
  enableVersioning?: boolean;
  onUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Storage: React.FC<Step3Props> = ({
  bucketName,
  enableEncryption = true,
  enableVersioning = true,
  onUpdate,
  onNext,
  onBack
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  
  const validateField = () => {
    const validationError = validateBucketName(bucketName);
    setError(validationError);
    
    // Only check availability if bucket name is valid
    if (!validationError && bucketName) {
      checkAvailability(bucketName);
    }
  };
  
  const checkAvailability = useCallback(
    debounce(async (name: string) => {
      setIsCheckingAvailability(true);
      setAvailabilityMessage(null);
      
      try {
        const available = await checkBucketAvailability(name);
        if (!available) {
          const suggestion = `${name}-${Date.now().toString().slice(-4)}`;
          setError(`Bucket name "${name}" is already taken. Try: ${suggestion}`);
          setAvailabilityMessage(`❌ Name taken. Suggestion: ${suggestion}`);
        } else {
          setAvailabilityMessage('✅ Name available');
        }
      } catch (err) {
        setAvailabilityMessage('⚠️ Could not check availability');
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 800),
    []
  );
  
  useEffect(() => {
    // Clear availability check when bucket name changes
    setAvailabilityMessage(null);
  }, [bucketName]);
  
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
        helpText="Must be globally unique (lowercase, numbers, hyphens)"
        required
        placeholder="mobileclaw-backup-yourname"
      />
      
      {isCheckingAvailability && (
        <View style={styles.availabilityCheck}>
          <ActivityIndicator size="small" color={colors.primaryBlue} />
          <Text style={styles.availabilityText}>Checking availability...</Text>
        </View>
      )}
      
      {!isCheckingAvailability && availabilityMessage && (
        <View style={styles.availabilityCheck}>
          <Text style={[
            styles.availabilityText,
            availabilityMessage.startsWith('✅') && styles.availabilitySuccess,
            availabilityMessage.startsWith('❌') && styles.availabilityError
          ]}>
            {availabilityMessage}
          </Text>
        </View>
      )}
      
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Storage Options</Text>
        
        <TouchableOpacity 
          style={styles.checkboxRow}
          onPress={() => onUpdate('enableEncryption', !enableEncryption)}
          activeOpacity={0.7}
        >
          <Checkbox
            value={enableEncryption}
            onChange={(val) => onUpdate('enableEncryption', val)}
          />
          <View style={styles.checkboxLabel}>
            <Text style={styles.checkboxTitle}>Enable server-side encryption</Text>
            <Text style={styles.checkboxDescription}>(Recommended for security)</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.checkboxRow}
          onPress={() => onUpdate('enableVersioning', !enableVersioning)}
          activeOpacity={0.7}
        >
          <Checkbox
            value={enableVersioning}
            onChange={(val) => onUpdate('enableVersioning', val)}
          />
          <View style={styles.checkboxLabel}>
            <Text style={styles.checkboxTitle}>Enable version history</Text>
            <Text style={styles.checkboxDescription}>(Allows file recovery)</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.costContainer}>
        <Text style={styles.costEstimate}>💾 Estimated Cost: ~$0.50/month</Text>
        <Text style={styles.costDescription}>(Based on 5GB storage)</Text>
      </View>
      
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
  
  optionsContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  
  checkboxLabel: {
    flex: 1,
  },
  
  checkboxTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  checkboxDescription: {
    fontSize: 13,
    color: colors.gray500,
  },
  
  costContainer: {
    marginTop: spacing.lg,
  },
  
  costEstimate: {
    fontSize: 16,
    color: colors.gray700,
  },
  
  costDescription: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  
  availabilityCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  
  availabilityText: {
    fontSize: 14,
    color: colors.gray600,
  },
  
  availabilitySuccess: {
    color: colors.successGreen,
    fontWeight: '500',
  },
  
  availabilityError: {
    color: colors.errorRed,
    fontWeight: '500',
  },
});
