// Validation functions for Cloud Setup Wizard

export const validateAwsAccessKey = (key: string): string | null => {
  if (!key) return "Access Key is required";
  if (!key.startsWith('AKIA')) return "Access Key must start with 'AKIA'";
  if (key.length !== 20) return "Access Key must be 20 characters";
  return null;
};

export const validateAwsSecretKey = (key: string): string | null => {
  if (!key) return "Secret Key is required";
  if (key.length < 40) return "Secret Key must be at least 40 characters";
  return null;
};

export const validateAwsRegion = (region: string): string | null => {
  if (!region) return "Region is required";
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'
  ];
  if (!validRegions.includes(region)) {
    return "Please select a valid AWS region";
  }
  return null;
};

export const validateGcpProjectId = (projectId: string): string | null => {
  if (!projectId) return "Project ID is required";
  if (projectId.length < 6 || projectId.length > 30) {
    return "Project ID must be 6-30 characters";
  }
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(projectId)) {
    return "Invalid Project ID format (lowercase, numbers, hyphens only)";
  }
  return null;
};

export const validateBucketName = (name: string): string | null => {
  if (!name) return "Bucket name is required";
  if (name.length < 3 || name.length > 63) {
    return "Bucket name must be 3-63 characters";
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
    return "Invalid bucket name (lowercase, numbers, hyphens only, no starting/ending hyphen)";
  }
  return null;
};

export const validateTableName = (name: string): string | null => {
  if (!name) return "Table name is required";
  if (name.length < 3 || name.length > 255) {
    return "Table name must be 3-255 characters";
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
    return "Invalid table name (letters, numbers, _, -, . only)";
  }
  return null;
};

export const validateCapacity = (capacity: number): string | null => {
  if (!capacity || capacity < 1) return "Capacity must be at least 1";
  if (capacity > 40000) return "Capacity cannot exceed 40,000";
  return null;
};
