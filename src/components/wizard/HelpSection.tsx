import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HelpSectionProps } from '../../types/cloudSetup';
import { wizardStyles, colors } from '../../styles/wizard';

export const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  icon = '💡',
  defaultExpanded = false,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <TouchableOpacity
      style={wizardStyles.helpSection}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.8}
    >
      <View style={wizardStyles.helpSectionHeader}>
        <Text style={wizardStyles.helpSectionIcon}>{icon}</Text>
        <Text style={wizardStyles.helpSectionTitle}>{title}</Text>
        <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
      </View>
      
      {isExpanded && (
        <View style={wizardStyles.helpSectionContent}>
          {children}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chevron: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 'auto',
  },
});
