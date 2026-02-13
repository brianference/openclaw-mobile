import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SelectionCardProps } from '../../types/cloudSetup';
import { wizardStyles, colors, spacing } from '../../styles/wizard';

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  icon,
  selected,
  onClick,
  features
}) => {
  return (
    <TouchableOpacity
      style={[
        wizardStyles.selectionCard,
        selected && wizardStyles.selectionCardSelected
      ]}
      onPress={onClick}
      activeOpacity={0.7}
    >
      <Text style={wizardStyles.selectionCardIcon}>{icon}</Text>
      <Text style={wizardStyles.selectionCardTitle}>{title}</Text>
      <Text style={wizardStyles.selectionCardDescription}>{description}</Text>
      
      {features && features.length > 0 && (
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Text key={index} style={styles.feature}>
              ✓ {feature}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuresContainer: {
    marginTop: spacing.sm,
  },
  
  feature: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 4,
  },
});
