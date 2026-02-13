import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FormFieldProps } from '../../types/cloudSetup';
import { wizardStyles, colors, spacing } from '../../styles/wizard';

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helpText,
  required,
  secureTextEntry,
  showPasswordToggle,
  placeholder,
  onBlur
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={wizardStyles.formField}>
      <Text style={wizardStyles.formFieldLabel}>
        {label}
        {required && <Text style={wizardStyles.formFieldRequired}> *</Text>}
      </Text>
      
      <View style={wizardStyles.formFieldInputContainer}>
        <TextInput
          style={[
            wizardStyles.formFieldInput,
            isFocused && wizardStyles.formFieldInputFocus,
            error && wizardStyles.formFieldInputError
          ]}
          value={value}
          onChangeText={onChange}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
        />
        
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.eyeIconText}>
              {isPasswordVisible ? '👁' : '👁‍🗨'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={wizardStyles.formFieldError}>❌ {error}</Text>
      )}
      
      {!error && value && !helpText && (
        <Text style={wizardStyles.formFieldSuccess}>✓ Valid format</Text>
      )}
      
      {helpText && !error && (
        <Text style={wizardStyles.formFieldHelp}>{helpText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  
  eyeIconText: {
    fontSize: 20,
  },
});
