import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  Checkbox,
  GlassCard,
  Toast,
} from '../../src/components';
import { colors, spacing, typography, radius, shadows } from '../../src/design/tokens';
import { Task, TaskCategory, ReminderType } from '../../src/types';
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
 * Task Detail Screen
 * 
 * Per design-spec.md Section 5.2
 * - View/edit task details
 * - Editable title (inline)
 * - Date/time picker
 * - Category picker (bottom sheet)
 * - Reminder picker (bottom sheet)
 * - Multi-line notes
 * - Save button (bottom-anchored)
 * - Delete button (in More menu)
 */
export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const taskId = params.id;

  // Store
  const { tasks, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [category, setCategory] = useState<TaskCategory>('work');
  const [reminder, setReminder] = useState<ReminderType>('none');
  const [notes, setNotes] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load task from store on mount
  useEffect(() => {
    if (taskId) {
      const loadedTask = tasks.find(t => t.id === taskId);
      if (loadedTask) {
        setTask(loadedTask);
        setTitle(loadedTask.title);
        setCompleted(loadedTask.completed);
        setDueDate(loadedTask.dueDate ? new Date(loadedTask.dueDate) : undefined);
        setCategory(loadedTask.category);
        setReminder(loadedTask.reminder || 'none');
        setNotes(loadedTask.notes || '');
      }
    }
  }, [taskId, tasks]);

  // Track changes
  useEffect(() => {
    if (task) {
      const hasChanges =
        title !== task.title ||
        completed !== task.completed ||
        dueDate?.toISOString() !== task.dueDate ||
        category !== task.category ||
        reminder !== (task.reminder || 'none') ||
        notes !== (task.notes || '');
      setIsEdited(hasChanges);
    }
  }, [title, completed, dueDate, category, reminder, notes, task]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setToastMessage('Task title is required');
      setShowToast(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    try {
      await updateTask(taskId, {
        title: title.trim(),
        completed,
        dueDate: dueDate?.toISOString(),
        category,
        reminder: reminder !== 'none' ? reminder : undefined,
        notes: notes.trim() || undefined,
      });

      setSaving(false);
      setIsEdited(false);
      setToastMessage('Task updated');
      setShowToast(true);
    } catch (error) {
      console.error('Error saving task:', error);
      setSaving(false);
      setToastMessage('Failed to save task');
      setShowToast(true);
    }
  }, [title, completed, dueDate, category, reminder, notes, taskId, updateTask]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            try {
              await deleteTask(taskId);
              setToastMessage('Task deleted');
              setShowToast(true);
              setTimeout(() => router.back(), 1000);
            } catch (error) {
              console.error('Error deleting task:', error);
              setToastMessage('Failed to delete task');
              setShowToast(true);
            }
          },
        },
      ]
    );
  }, [router, taskId, deleteTask]);

  const handleToggleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompleted(prev => !prev);
  }, []);

  const getCategoryLabel = () => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
    return option ? `${option.icon} ${option.label}` : 'Select category';
  };

  const getReminderLabel = () => {
    const option = REMINDER_OPTIONS.find(opt => opt.value === reminder);
    return option?.label || 'None';
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
          <Button
            label="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Delete task"
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
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
        >
          {/* Completion Checkbox */}
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={styles.section}
          >
            <Pressable
              onPress={handleToggleComplete}
              style={styles.completionRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
            >
              <Checkbox
                checked={completed}
                onChange={handleToggleComplete}
                label=""
              />
              <Text style={[styles.completionText, completed && styles.completionTextCompleted]}>
                {completed ? 'Completed' : 'Mark as complete'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.duration(200).delay(100)}>
            <InputField
              label="Task Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title..."
              autoCapitalize="sentences"
              maxLength={200}
              accessibilityLabel="Task title"
              accessibilityRequired
            />
          </Animated.View>

          {/* Due Date */}
          <Animated.View entering={FadeInDown.duration(200).delay(200)}>
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
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.duration(200).delay(300)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCategoryPicker(true);
              }}
              style={styles.fieldCard}
              accessibilityRole="button"
              accessibilityLabel="Select category"
            >
              <GlassCard>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldIcon}>📋</Text>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <Text style={styles.fieldValue}>{getCategoryLabel()}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* Reminder */}
          <Animated.View entering={FadeInDown.duration(200).delay(400)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReminderPicker(true);
              }}
              style={styles.fieldCard}
              accessibilityRole="button"
              accessibilityLabel="Select reminder"
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
          <Animated.View entering={FadeInDown.duration(200).delay(500)}>
            <GlassCard style={styles.fieldCard}>
              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <Text style={styles.fieldIcon}>📝</Text>
                  <Text style={styles.fieldLabel}>Notes</Text>
                </View>
                <TextArea
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes..."
                  minHeight={100}
                  maxLength={1000}
                  showCharacterCount
                  accessibilityLabel="Task notes"
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Spacing for bottom button */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Save Button (Bottom-anchored) */}
        {isEdited && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={styles.saveContainer}
          >
            <Button
              label={saving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={!title.trim() || saving}
              loading={saving}
              variant="primary"
              accessibilityLabel="Save task changes"
            />
          </Animated.View>
        )}
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
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.size.md,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  deleteButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    fontWeight: typography.weight.medium as any,
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
  section: {
    marginBottom: spacing.md,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completionText: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  completionTextCompleted: {
    color: colors.accent.default,
  },
  fieldCard: {
    marginBottom: spacing.md,
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
  fieldValue: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
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
  bottomSpacing: {
    height: 100,
  },
  saveContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  errorButton: {
    minWidth: 200,
  },
});
