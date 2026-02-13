import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FormField } from '../../components/wizard/FormField';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { validateTableName } from '../../services/cloudSetup/validation';
import { colors, spacing } from '../../styles/wizard';
import { Checkbox } from '../../components/Checkbox';

interface Step4Props {
  tableName: string;
  capacityMode?: 'on-demand' | 'provisioned';
  readCapacity?: number;
  writeCapacity?: number;
  enableBackups?: boolean;
  onUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Database: React.FC<Step4Props> = ({
  tableName,
  capacityMode = 'on-demand',
  readCapacity = 5,
  writeCapacity = 5,
  enableBackups = true,
  onUpdate,
  onNext,
  onBack
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const validateField = () => {
    setError(validateTableName(tableName));
  };
  
  const isValid = tableName && !error;
  
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
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Capacity Mode</Text>
        
        <TouchableOpacity
          style={[
            styles.radioOption,
            capacityMode === 'on-demand' && styles.radioOptionSelected
          ]}
          onPress={() => onUpdate('capacityMode', 'on-demand')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.radioCircle,
            capacityMode === 'on-demand' && styles.radioCircleSelected
          ]}>
            {capacityMode === 'on-demand' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.radioLabel}>
            <Text style={styles.radioTitle}>On-Demand (Pay per request)</Text>
            <Text style={styles.radioDescription}>Automatically scales with usage</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.radioOption,
            capacityMode === 'provisioned' && styles.radioOptionSelected
          ]}
          onPress={() => onUpdate('capacityMode', 'provisioned')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.radioCircle,
            capacityMode === 'provisioned' && styles.radioCircleSelected
          ]}>
            {capacityMode === 'provisioned' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.radioLabel}>
            <Text style={styles.radioTitle}>Provisioned (Fixed capacity)</Text>
            <Text style={styles.radioDescription}>Set read/write capacity units</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {capacityMode === 'provisioned' && (
        <View style={styles.capacityInputs}>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityLabel}>Read Capacity Units</Text>
            <View style={styles.capacityControl}>
              <TouchableOpacity
                style={styles.capacityButton}
                onPress={() => onUpdate('readCapacity', Math.max(1, readCapacity - 1))}
              >
                <Text style={styles.capacityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.capacityValue}>{readCapacity}</Text>
              <TouchableOpacity
                style={styles.capacityButton}
                onPress={() => onUpdate('readCapacity', Math.min(100, readCapacity + 1))}
              >
                <Text style={styles.capacityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.capacityRow}>
            <Text style={styles.capacityLabel}>Write Capacity Units</Text>
            <View style={styles.capacityControl}>
              <TouchableOpacity
                style={styles.capacityButton}
                onPress={() => onUpdate('writeCapacity', Math.max(1, writeCapacity - 1))}
              >
                <Text style={styles.capacityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.capacityValue}>{writeCapacity}</Text>
              <TouchableOpacity
                style={styles.capacityButton}
                onPress={() => onUpdate('writeCapacity', Math.min(100, writeCapacity + 1))}
              >
                <Text style={styles.capacityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.checkboxRow}
        onPress={() => onUpdate('enableBackups', !enableBackups)}
        activeOpacity={0.7}
      >
        <Checkbox
          value={enableBackups}
          onChange={(val) => onUpdate('enableBackups', val)}
        />
        <View style={styles.checkboxLabel}>
          <Text style={styles.checkboxTitle}>Point-in-Time Recovery</Text>
          <Text style={styles.checkboxDescription}>Enable automatic backups</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.costContainer}>
        <Text style={styles.costEstimate}>
          💾 Estimated Cost: ~${capacityMode === 'on-demand' ? '2.50' : ((readCapacity + writeCapacity) * 0.5).toFixed(2)}/month
        </Text>
        {capacityMode === 'provisioned' && (
          <Text style={styles.costDescription}>
            Based on {readCapacity} read + {writeCapacity} write capacity units
          </Text>
        )}
      </View>
      
      <ButtonGroup
        onBack={onBack}
        onNext={onNext}
        nextLabel="Save & Continue →"
        nextDisabled={!isValid}
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
  
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  
  radioOptionSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlueLight,
  },
  
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  
  radioCircleSelected: {
    borderColor: colors.primaryBlue,
  },
  
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryBlue,
  },
  
  radioLabel: {
    flex: 1,
  },
  
  radioTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  
  radioDescription: {
    fontSize: 13,
    color: colors.gray500,
  },
  
  capacityInputs: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  capacityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    flex: 1,
  },
  
  capacityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  
  capacityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  capacityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  
  capacityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    minWidth: 32,
    textAlign: 'center',
  },
  
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
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
});
