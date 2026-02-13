import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { WizardContainer } from '../../components/wizard/WizardContainer';
import { Step1Welcome } from './Step1Welcome';
import { Step2AWSCredentials } from './Step2AWSCredentials';
import { Step2GoogleCredentials } from './Step2GoogleCredentials';
import { Step3Storage } from './Step3Storage';
import { Step4Database } from './Step4Database';
import { Step5TestConnection } from './Step5TestConnection';
import { Step6Success } from './Step6Success';
import { WizardState, TestResult } from '../../types/cloudSetup';
import { saveDraft, clearDraft, loadDraft } from '../../services/cloudSetup/storage';

interface CloudSetupWizardProps {
  visible: boolean;
  onClose: () => void;
  initialDraft?: WizardState | null;
}

export const CloudSetupWizard: React.FC<CloudSetupWizardProps> = ({
  visible,
  onClose,
  initialDraft
}) => {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    provider: null,
    
    // AWS
    awsAccessKey: '',
    awsSecretKey: '',
    awsRegion: '',
    
    // Google Cloud
    gcpProjectId: '',
    gcpServiceAccountKey: '',
    
    // Storage
    bucketName: '',
    enableEncryption: true,
    enableVersioning: true,
    
    // Database
    tableName: '',
    capacityMode: 'on-demand',
    readCapacity: 5,
    writeCapacity: 5,
    enableBackups: true,
    
    // Tests
    testResults: [],
  });
  
  // Load initial draft if provided
  useEffect(() => {
    if (initialDraft) {
      setState(initialDraft);
    }
  }, [initialDraft]);
  
  // Auto-save on state changes
  useEffect(() => {
    if (state.currentStep > 1) {
      saveDraft(state);
    }
  }, [state]);
  
  const updateField = (field: string, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };
  
  const nextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };
  
  const prevStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
  };
  
  const handleClose = () => {
    if (state.currentStep > 1) {
      Alert.alert(
        'Save progress?',
        'Your configuration will be saved and you can resume later.',
        [
          {
            text: "Don't Save",
            style: 'destructive',
            onPress: async () => {
              await clearDraft();
              onClose();
            }
          },
          {
            text: 'Save',
            onPress: async () => {
              await saveDraft(state);
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };
  
  const handleFinish = async () => {
    // Clear draft on successful completion
    await clearDraft();
    
    // In production, would save configuration to app settings
    console.log('Cloud setup complete:', state);
    
    onClose();
  };
  
  const handleSkipWizard = () => {
    // In production, would open advanced setup form
    Alert.alert('Skip Wizard', 'Advanced setup form would open here');
    onClose();
  };
  
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1Welcome
            provider={state.provider}
            onProviderSelect={(provider) => updateField('provider', provider)}
            onNext={nextStep}
            onSkipWizard={handleSkipWizard}
          />
        );
      
      case 2:
        if (state.provider === 'aws') {
          return (
            <Step2AWSCredentials
              accessKey={state.awsAccessKey}
              secretKey={state.awsSecretKey}
              region={state.awsRegion}
              onUpdate={updateField}
              onNext={nextStep}
              onBack={prevStep}
            />
          );
        } else if (state.provider === 'google') {
          return (
            <Step2GoogleCredentials
              projectId={state.gcpProjectId}
              serviceAccountKey={state.gcpServiceAccountKey}
              onUpdate={updateField}
              onNext={nextStep}
              onBack={prevStep}
            />
          );
        }
        // Fallback to step 1 if no provider selected
        return <Step1Welcome provider={state.provider} onProviderSelect={(p) => updateField('provider', p)} onNext={nextStep} onSkipWizard={handleSkipWizard} />;
      
      case 3:
        return (
          <Step3Storage
            bucketName={state.bucketName}
            onUpdate={updateField}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      
      case 4:
        return (
          <Step4Database
            tableName={state.tableName}
            onUpdate={updateField}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      
      case 5:
        return (
          <Step5TestConnection
            provider={state.provider || 'aws'}
            config={state}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      
      case 6:
        return (
          <Step6Success
            provider={state.provider || 'aws'}
            config={state}
            onFinish={handleFinish}
          />
        );
      
      default:
        return null;
    }
  };
  
  if (!visible) return null;
  
  return (
    <WizardContainer
      steps={6}
      currentStep={state.currentStep}
      onClose={handleClose}
    >
      {renderCurrentStep()}
    </WizardContainer>
  );
};

export default CloudSetupWizard;
