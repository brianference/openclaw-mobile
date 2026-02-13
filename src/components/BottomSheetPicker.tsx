import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import BottomSheet from './BottomSheet';
import { colors, spacing, typography, radius, touchTargets } from '../design/tokens';
import Checkbox from './Checkbox';
import RadioGroup, { RadioOption } from './RadioGroup';
import Button from './Button';

export type PickerMode = 'single' | 'multi' | 'list';

export interface PickerOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface BottomSheetPickerProps {
  /**
   * Picker options
   */
  options: PickerOption[];

  /**
   * Selected value(s)
   * - Single: string
   * - Multi: string[]
   */
  value: string | string[];

  /**
   * Change handler
   */
  onChange: (value: string | string[]) => void;

  /**
   * Picker mode
   * @default 'single'
   */
  mode?: PickerMode;

  /**
   * Sheet title
   */
  title?: string;

  /**
   * Visible state
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Cancel button label
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Confirm button label
   * @default 'Done'
   */
  confirmLabel?: string;

  /**
   * Search functionality (future enhancement)
   */
  searchable?: boolean;
}

/**
 * Bottom Sheet Picker Component
 *
 * Modal bottom sheet for single or multi-select per component-library.md Section 23.
 *
 * Features:
 * - Single selection (radio buttons)
 * - Multi selection (checkboxes)
 * - Plain list (tap to select)
 * - Swipe to dismiss
 * - Cancel/Done actions
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Single select
 * <BottomSheetPicker
 *   title="Select Category"
 *   options={categories}
 *   value={selectedCategory}
 *   onChange={setSelectedCategory}
 *   mode="single"
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 * />
 *
 * // Multi select
 * <BottomSheetPicker
 *   title="Select Tags"
 *   options={tags}
 *   value={selectedTags}
 *   onChange={setSelectedTags}
 *   mode="multi"
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 * />
 * ```
 */
export const BottomSheetPicker = ({
  options,
  value,
  onChange,
  mode = 'single',
  title = 'Select',
  visible,
  onClose,
  cancelLabel = 'Cancel',
  confirmLabel = 'Done',
  searchable = false,
}: BottomSheetPickerProps) => {
  // Track temporary selection for multi-select (only committed on "Done")
  const [tempSelection, setTempSelection] = useState<string[]>(
    Array.isArray(value) ? value : [value]
  );

  const handleSingleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    onClose();
  };

  const handleMultiToggle = (optionValue: string) => {
    setTempSelection((prev) => {
      if (prev.includes(optionValue)) {
        return prev.filter((v) => v !== optionValue);
      } else {
        return [...prev, optionValue];
      }
    });
  };

  const handleConfirm = () => {
    if (mode === 'multi') {
      onChange(tempSelection);
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset temp selection
    setTempSelection(Array.isArray(value) ? value : [value]);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleCancel}
      title={title}
      snapPoints={['60%', '90%']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {mode === 'single' && (
          <RadioGroup
            options={options as RadioOption[]}
            value={value as string}
            onChange={handleSingleSelect}
          />
        )}

        {mode === 'multi' && (
          <View style={styles.multiContainer}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleMultiToggle(option.value)}
                disabled={option.disabled}
                style={[
                  styles.multiOption,
                  option.disabled && styles.multiOptionDisabled,
                ]}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: tempSelection.includes(option.value),
                  disabled: option.disabled,
                }}
                accessibilityLabel={option.label}
              >
                <Checkbox
                  checked={tempSelection.includes(option.value)}
                  onToggle={() => handleMultiToggle(option.value)}
                  disabled={option.disabled}
                  label={option.label}
                />
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'list' && (
          <View style={styles.listContainer}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSingleSelect(option.value)}
                disabled={option.disabled}
                style={[
                  styles.listOption,
                  option.disabled && styles.listOptionDisabled,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={{ disabled: option.disabled }}
                accessibilityLabel={option.label}
              >
                <Text
                  style={[
                    styles.listOptionText,
                    option.disabled && styles.listOptionTextDisabled,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button
          variant="secondary"
          onPress={handleCancel}
          style={styles.actionButton}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          onPress={handleConfirm}
          style={styles.actionButton}
        >
          {confirmLabel}
        </Button>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  multiContainer: {
    gap: spacing.xs,
  },
  multiOption: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
  },
  multiOptionDisabled: {
    opacity: 0.5,
  },
  listContainer: {
    gap: spacing.xs / 2,
  },
  listOption: {
    backgroundColor: 'rgba(37, 37, 37, 0.6)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs / 2,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
  },
  listOptionDisabled: {
    opacity: 0.5,
  },
  listOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
  },
  listOptionTextDisabled: {
    color: colors.dark.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default BottomSheetPicker;
