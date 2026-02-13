import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, spacing, radius, typography, touchTargets } from '../design/tokens';
import { GlassCard } from './GlassCard';
import Button from './Button';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DatePickerProps {
  /**
   * Selected date value
   */
  value: Date;

  /**
   * Change handler
   */
  onChange: (date: Date) => void;

  /**
   * Picker mode
   * @default 'date'
   */
  mode?: DatePickerMode;

  /**
   * Field label
   */
  label?: string;

  /**
   * Minimum selectable date
   */
  minimumDate?: Date;

  /**
   * Maximum selectable date
   */
  maximumDate?: Date;

  /**
   * Placeholder text when no value
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Required field indicator
   */
  required?: boolean;

  /**
   * Container style
   */
  style?: any;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Date Picker Component
 *
 * Platform-native date/time picker wrapper per component-library.md Section 22.
 *
 * Features:
 * - Uses native platform pickers (iOS spinner/inline, Android calendar)
 * - Date, time, or datetime modes
 * - Min/max date constraints
 * - Modal presentation
 * - Inline validation (error states)
 * - Full accessibility support
 *
 * iOS: Modal with spinner/inline picker
 * Android: Native Material calendar dialog
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Due Date"
 *   value={dueDate}
 *   onChange={setDueDate}
 *   mode="datetime"
 *   minimumDate={new Date()}
 * />
 * ```
 */
export const DatePicker = ({
  value,
  onChange,
  mode = 'date',
  label,
  minimumDate,
  maximumDate,
  placeholder = 'Select date...',
  disabled = false,
  error,
  required = false,
  style,
  accessibilityLabel,
}: DatePickerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const formatDate = (date: Date, mode: DatePickerMode): string => {
    if (!date) return '';

    const options: Intl.DateTimeFormatOptions = {};

    if (mode === 'date' || mode === 'datetime') {
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
    }

    if (mode === 'time' || mode === 'datetime') {
      options.hour = 'numeric';
      options.minute = '2-digit';
    }

    return date.toLocaleString('en-US', options);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS: Update temp date while picker is open
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleIOSCancel = () => {
    setTempDate(value);
    setShowPicker(false);
  };

  const openPicker = () => {
    if (!disabled) {
      setTempDate(value);
      setShowPicker(true);
    }
  };

  const displayValue = value ? formatDate(value, mode) : placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={`Opens ${mode} picker`}
        accessibilityState={{ disabled }}
      >
        <Text
          style={[
            styles.triggerText,
            !value && styles.triggerPlaceholder,
            disabled && styles.triggerTextDisabled,
          ]}
        >
          {displayValue}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>

      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}

      {/* iOS: Modal with picker + confirm/cancel */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalOverlay}>
            <GlassCard style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={colors.dark.textPrimary}
                themeVariant="dark"
              />
              <View style={styles.modalActions}>
                <Button
                  variant="secondary"
                  onPress={handleIOSCancel}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleIOSConfirm}
                  style={styles.modalButton}
                >
                  Confirm
                </Button>
              </View>
            </GlassCard>
          </View>
        </Modal>
      )}

      {/* Android: Native dialog (auto-dismisses) */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          themeVariant="dark"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.dark.textSecondary,
  },
  required: {
    color: colors.semantic.error,
    fontSize: typography.fontSize.md,
    marginLeft: spacing.xs / 2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37, 37, 37, 0.8)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs / 2,
    minHeight: touchTargets.minimum,
  },
  triggerError: {
    borderColor: colors.semantic.error,
  },
  triggerDisabled: {
    backgroundColor: 'rgba(37, 37, 37, 0.4)',
    opacity: 0.5,
  },
  triggerText: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  triggerPlaceholder: {
    color: colors.dark.textTertiary,
  },
  triggerTextDisabled: {
    color: colors.dark.textTertiary,
  },
  icon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    margin: spacing.md,
    paddingVertical: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default DatePicker;
