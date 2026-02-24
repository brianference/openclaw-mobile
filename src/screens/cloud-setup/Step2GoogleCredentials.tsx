import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FormField } from '../../components/wizard/FormField';
import { ButtonGroup } from '../../components/wizard/ButtonGroup';
import { ProgressIndicator } from '../../components/wizard/ProgressIndicator';
import { HelpSection } from '../../components/wizard/HelpSection';
import { validateGcpProjectId } from '../../services/cloudSetup/validation';
import { colors, spacing } from '../../styles/wizard';

interface Step2GoogleProps {
  projectId: string;
  serviceAccountKey: string;
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2GoogleCredentials: React.FC<Step2GoogleProps> = ({
  projectId,
  serviceAccountKey,
  onUpdate,
  onNext,
  onBack
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  
  const validateField = (field: string, value: string) => {
    let error: string | null = null;
    
    if (field === 'projectId') {
      error = validateGcpProjectId(value);
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const isValid = () => {
    return (
      validateGcpProjectId(projectId) === null &&
      serviceAccountKey.trim() !== ''
    );
  };
  
  const handleUploadJSON = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const response = await fetch(file.uri);
        const content = await response.text();
        
        // Validate JSON format
        try {
          const parsed = JSON.parse(content);
          
          // Basic validation for service account key
          if (parsed.type !== 'service_account') {
            Alert.alert('Invalid File', 'This doesn\'t appear to be a service account key');
            return;
          }
          
          onUpdate('gcpServiceAccountKey', content);
          
          // Auto-fill project ID if available
          if (parsed.project_id && !projectId) {
            onUpdate('gcpProjectId', parsed.project_id);
          }
          
          Alert.alert('Success', 'Service account key loaded successfully');
        } catch (parseError) {
          Alert.alert('Invalid JSON', 'The file contains invalid JSON');
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to read the file');
    }
  };
  
  return (
    <ScrollView>
      <ProgressIndicator steps={6} currentStep={2} />
      
      <Text style={styles.heading}>🔵 Google Cloud Configuration</Text>
      <Text style={styles.description}>
        Enter your GCP credentials. Don't have them?{' '}
        <Text style={styles.link}>Create GCP Account</Text>
      </Text>
      
      <FormField
        label="Project ID"
        value={projectId}
        onChange={(val) => onUpdate('gcpProjectId', val)}
        onBlur={() => validateField('projectId', projectId)}
        error={errors.projectId || undefined}
        required
        placeholder="my-project-12345"
      />
      
      <FormField
        label="Service Account Key (JSON)"
        value={serviceAccountKey}
        onChange={(val) => onUpdate('gcpServiceAccountKey', val)}
        helpText="Paste your service account key JSON"
        required
        placeholder='{"type": "service_account", ...}'
      />
      
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={handleUploadJSON}
        activeOpacity={0.7}
      >
        <Text style={styles.uploadButtonText}>📁 Upload JSON File</Text>
      </TouchableOpacity>
      
      <HelpSection title="How to create service account?">
        <Text style={styles.helpText}>
          1. Go to Google Cloud Console{'\n'}
          2. Select your project{'\n'}
          3. IAM & Admin → Service Accounts{'\n'}
          4. Create Service Account{'\n'}
          5. Grant necessary permissions{'\n'}
          6. Create and download JSON key
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
  
  uploadButton: {
    backgroundColor: colors.gray200,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  uploadButtonText: {
    fontSize: 16,
    color: colors.gray700,
    fontWeight: '600',
  },
  
  helpText: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
});
