import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressIndicatorProps } from '../../types/cloudSetup';
import { colors, spacing, wizardStyles } from '../../styles/wizard';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  variant = isMobile ? 'compact' : 'full',
  labels
}) => {
  if (variant === 'compact') {
    return (
      <Text style={wizardStyles.progressCompact}>
        Step {currentStep} of {steps}
      </Text>
    );
  }
  
  if (variant === 'bar') {
    const progress = (currentStep / steps) * 100;
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  }
  
  // Full variant
  return (
    <View style={styles.fullContainer}>
      {Array.from({ length: steps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <View key={stepNumber} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              isCompleted && styles.stepCircleCompleted,
              isCurrent && styles.stepCircleCurrent
            ]}>
              <Text style={[
                styles.stepNumber,
                (isCompleted || isCurrent) && styles.stepNumberActive
              ]}>
                {stepNumber}
              </Text>
            </View>
            
            {labels && labels[index] && (
              <Text style={styles.stepLabel}>{labels[index]}</Text>
            )}
            
            {index < steps - 1 && (
              <View style={[
                styles.stepConnector,
                stepNumber < currentStep && styles.stepConnectorCompleted
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact variant - handled by wizardStyles
  
  // Bar variant
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 2,
  },
  
  // Full variant
  fullContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  stepCircleCompleted: {
    backgroundColor: colors.primaryBlue,
  },
  
  stepCircleCurrent: {
    backgroundColor: colors.primaryBlue,
  },
  
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray400,
  },
  
  stepNumberActive: {
    color: colors.white,
  },
  
  stepLabel: {
    fontSize: 10,
    color: colors.gray500,
    marginTop: 4,
    textAlign: 'center',
  },
  
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.gray200,
  },
  
  stepConnectorCompleted: {
    backgroundColor: colors.primaryBlue,
  },
});
