import React from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { WizardContainerProps } from '../../types/cloudSetup';
import { colors, spacing, wizardStyles } from '../../styles/wizard';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export const WizardContainer: React.FC<WizardContainerProps> = ({
  steps,
  currentStep,
  onClose,
  children
}) => {
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={!isMobile}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          wizardStyles.wizardContainer,
          isMobile && wizardStyles.wizardContainerMobile
        ]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>☁️  Cloud Setup Wizard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: isMobile ? colors.white : 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray900,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeButtonText: {
    fontSize: 24,
    color: colors.gray500,
  },
  
  content: {
    flex: 1,
    padding: spacing.lg,
  },
});
