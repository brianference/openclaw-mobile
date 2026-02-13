import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ButtonGroupProps } from '../../types/cloudSetup';
import { wizardStyles, colors } from '../../styles/wizard';

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  onBack,
  onNext,
  nextLabel = 'Next →',
  backLabel = '← Back',
  nextDisabled,
  loading
}) => {
  return (
    <View style={wizardStyles.buttonGroup}>
      {onBack && (
        <TouchableOpacity
          style={wizardStyles.btnSecondary}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={wizardStyles.btnSecondaryText}>{backLabel}</Text>
        </TouchableOpacity>
      )}
      
      {onNext && (
        <TouchableOpacity
          style={[
            wizardStyles.btnPrimary,
            (nextDisabled || loading) && wizardStyles.btnPrimaryDisabled
          ]}
          onPress={onNext}
          disabled={nextDisabled || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={wizardStyles.btnPrimaryText}>{nextLabel}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
