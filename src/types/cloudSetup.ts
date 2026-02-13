// TypeScript interfaces for Cloud Setup Wizard

export interface WizardState {
  currentStep: number;
  provider: 'aws' | 'google' | null;
  
  // AWS Configuration
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion: string;
  
  // Google Cloud Configuration
  gcpProjectId: string;
  gcpServiceAccountKey: string;
  
  // Storage Configuration
  bucketName: string;
  enableEncryption: boolean;
  enableVersioning: boolean;
  
  // Database Configuration
  tableName: string;
  capacityMode: 'on-demand' | 'provisioned';
  readCapacity: number;
  writeCapacity: number;
  enableBackups: boolean;
  
  // Test Results
  testResults: TestResult[];
  
  // Metadata
  savedAt?: number;
}

export interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}

export interface SelectionCardProps {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  features?: string[];
}

export interface WizardContainerProps {
  steps: number;
  currentStep: number;
  onClose: () => void;
  children: React.ReactNode;
}

export interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
  variant?: 'full' | 'compact' | 'bar';
  labels?: string[];
}

export interface ButtonGroupProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export interface HelpSectionProps {
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export interface TestConnectionProps {
  tests: TestResult[];
  onRetry?: () => void;
}
