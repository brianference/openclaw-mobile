import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  InputField,
  Button,
  DatePicker,
  BottomSheetPicker,
  TextArea,
  GlassCard,
  Toast,
} from '../../src/components';
import { colors, spacing, typography, radius, shadows } from '../../src/design/tokens';
import { TaskCategory, ReminderType } from '../../src/types';
import { useTaskStore } from '../../src/store/task';

const CATEGORY_OPTIONS: { label: string; value: TaskCategory; icon: string }[] = [
  { label: 'Work', value: 'work', icon: '💼' },
  { label: 'Personal', value: 'personal', icon: '🏠' },
  { label: 'Shopping', value: 'shopping', icon: '🛒' },
];

const REMINDER_OPTIONS: { label: string; value: ReminderType }[] = [
  { label: 'None', value: 'none' },
  { label: '1 hour before', value: '1h' },
  { label: '2 hours before', value: '2h' },
  { label: '1 day before', value: '1d' },
  { label: '1 week before', value: '1w' },
];

/**
 * Add Task Screen
 * 
 * Per design-spec.md Section 5.2
 * - Title input (autofocus, required)
 * - Due date picker (optional)
 * - Category picker (required, bottom sheet)
 * - Reminder picker (optional, bottom sheet)
 * - Notes textarea (optional)
 * - Create button (disabled until valid)
 * - Cancel button
 * - Inline validation
 */
export default function AddTaskScreen() {
  const router = useRouter();
  const { addTask } = useTaskStore();

  // State
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [category, setCategory] = useState<TaskCategory | undefined>();
  const [reminder, setReminder] = useState<ReminderType>('none');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [titleError, setTitleError] = useState('');

  // Validation
  const isValid = title.trim().length > 0 && category !== undefined;

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    if (!category) {
      setToastMessage('Please select a category');
      setShowToast(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCreating(true);

    // Add task using store
    await addTask({
      title: title.trim(),
      category,
      dueDate: dueDate?.toISOString(),
      reminder: reminder !== 'none' ? reminder : undefined,
      notes: notes.trim() || undefined,
    });

    setCreating(false);
    setToastMessage('Task created');
    setShowToast(true);

    // Navigate back after short delay
    setTimeout(() => {
      router.back();
    }, 1000);
  }, [addTask, title, category, dueDate, reminder, notes, router]);

  const handleCancel = useCallback(() => {
    if (title || notes || category || dueDate) {
      // Show confirmation if user has entered data
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // In production, show alert dialog
      router.back();
    } else {
      router.back();
    }
  }, [title, notes, category, dueDate, router]);

  const getCategoryLabel = () => {
    if (!category) return 'Select category';
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
    return option ? `${option.icon} ${option.label}` : 'Select category';
  };

  const getReminderLabel = () => {
    const option = REMINDER_OPTIONS.find(opt => opt.value === reminder);
    return option?.label || 'None';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add Task</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Animated.View entering={FadeInDown.duration(200)}>
            <InputField
              label="Task Title"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError('');
              }}
              placeholder="What needs to be done?"
              autoCapitalize="sentences"
              autoFocus
              maxLength={200}
              error={titleError}
              accessibilityLabel="Task title"
              accessibilityRequired
              accessibilityHint="Enter the name of your task"
            />
          </Animated.View>

          {/* Due Date */}
          <Animated.View entering={FadeInDown.duration(200).delay(100)}>
            <GlassCard style={styles.fieldCard}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldIcon}>📅</Text>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Due Date</Text>
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    placeholder="Not set"
                    mode="datetime"
                    minimumDate={new Date()}
                    accessibilityLabel="Task due date"
                    accessibilityHint="Optional. Select when this task is due"
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.duration(200).delay(200)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCategoryPicker(true);
              }}
              style={styles.fieldCard}
              accessibilityRole="button"
              accessibilityLabel="Select category"
              accessibilityRequired
              accessibilityHint="Choose a category for this task"
            >
              <GlassCard style={!category && styles.fieldRequired}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldIcon}>📋</Text>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>
                      Category <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <Text style={[
                      styles.fieldValue,
                      !category && styles.fieldPlaceholder
                    ]}>
                      {getCategoryLabel()}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* Reminder */}
          <Animated.View entering={FadeInDown.duration(200).delay(300)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReminderPicker(true);
              }}
              style={styles.fieldCard}
              accessibilityRole="button"
              accessibilityLabel="Select reminder"
              accessibilityHint="Optional. Set a reminder for this task"
            >
              <GlassCard>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldIcon}>🔔</Text>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Reminder</Text>
                    <Text style={styles.fieldValue}>{getReminderLabel()}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeInDown.duration(200).delay(400)}>
            <GlassCard style={styles.fieldCard}>
              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <Text style={styles.fieldIcon}>📝</Text>
                  <Text style={styles.fieldLabel}>Notes</Text>
                </View>
                <TextArea
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add additional details..."
                  minHeight={100}
                  maxLength={1000}
                  showCharacterCount
                  accessibilityLabel="Task notes"
                  accessibilityHint="Optional. Add any additional information"
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Validation Helper */}
          {!isValid && (
            <Animated.View entering={FadeInDown.duration(200).delay(500)}>
              <View style={styles.validationHelper}>
                <Text style={styles.validationText}>
                  {!title.trim() ? '• Task title is required\n' : ''}
                  {!category ? '• Category is required' : ''}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Spacing for bottom button */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Create Button (Bottom-anchored) */}
        <Animated.View
          entering={FadeInDown.duration(200).delay(600)}
          style={styles.createContainer}
        >
          <Button
            label={creating ? 'Creating...' : 'Create Task'}
            onPress={handleCreate}
            disabled={!isValid || creating}
            loading={creating}
            variant="primary"
            accessibilityLabel="Create task"
            accessibilityState={{ disabled: !isValid || creating }}
            accessibilityHint={
              isValid
                ? 'Double tap to create this task'
                : 'Fill in required fields to enable'
            }
          />
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Category Picker */}
      <BottomSheetPicker
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        title="Select Category"
        options={CATEGORY_OPTIONS.map(opt => ({
          label: `${opt.icon} ${opt.label}`,
          value: opt.value,
        }))}
        selectedValue={category}
        onSelect={(value) => {
          setCategory(value as TaskCategory);
          setShowCategoryPicker(false);
        }}
      />

      {/* Reminder Picker */}
      <BottomSheetPicker
        visible={showReminderPicker}
        onClose={() => setShowReminderPicker(false)}
        title="Set Reminder"
        options={REMINDER_OPTIONS}
        selectedValue={reminder}
        onSelect={(value) => {
          setReminder(value as ReminderType);
          setShowReminderPicker(false);
        }}
      />

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
        duration={3000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  cancelButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.size.md,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 70, // Match cancel button width for centering
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  fieldCard: {
    marginBottom: spacing.md,
  },
  fieldRequired: {
    borderWidth: 1,
    borderColor: colors.primary.default,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldIcon: {
    fontSize: 24,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  requiredAsterisk: {
    color: colors.semantic.error,
  },
  fieldValue: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  fieldPlaceholder: {
    color: colors.text.tertiary,
    fontWeight: typography.weight.normal as any,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  notesContainer: {
    gap: spacing.sm,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  validationHelper: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.error,
  },
  validationText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
  bottomSpacing: {
    height: 100,
  },
  createContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    ...shadows.lg,
  },
});
