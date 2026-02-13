import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  GlassCard,
  Badge,
  Button,
  Toast,
  SkeletonLoader,
} from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { Task } from '../../src/types';
import { useTaskStore } from '../../src/store/task';

const CATEGORY_COLORS: Record<string, string> = {
  work: colors.primary.default,
  personal: colors.accent.default,
  shopping: colors.semantic.warning,
};

const CATEGORY_LABELS: Record<string, string> = {
  work: '💼 Work',
  personal: '🏠 Personal',
  shopping: '🛒 Shopping',
};

/**
 * Completed Tasks Archive Screen
 * 
 * Per design-spec.md Section 5.2
 * - List of completed tasks
 * - Timestamp (e.g., "Completed 2h ago")
 * - Category badge
 * - "Clear All Completed" button (danger style)
 * - Confirmation dialog for clear
 * - Empty state
 */
export default function CompletedTasksScreen() {
  const router = useRouter();

  // Store
  const { getCompletedTasks, deleteAllCompleted, isLoading, fetchTasks } = useTaskStore();
  const tasks = getCompletedTasks();

  const [clearing, setClearing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const updatedAt = new Date(timestamp);
    const diffMs = now.getTime() - updatedAt.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return `${diffWeeks}w ago`;
    }
  };

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Clear All Completed Tasks',
      `This will permanently delete ${tasks.length} completed ${tasks.length === 1 ? 'task' : 'tasks'}. This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setClearing(true);
            
            try {
              await deleteAllCompleted();
              setClearing(false);
              setToastMessage('All completed tasks cleared');
              setShowToast(true);
            } catch (error) {
              console.error('Error clearing completed tasks:', error);
              setClearing(false);
              setToastMessage('Failed to clear tasks');
              setShowToast(true);
            }
          },
        },
      ]
    );
  }, [tasks.length, deleteAllCompleted]);

  const handleTaskPress = useCallback((taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tasks/${taskId}`);
  }, [router]);

  const renderTask = useCallback(({ item, index }: { item: Task; index: number }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || colors.text.tertiary;
    const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
    const relativeTime = getRelativeTime(item.updatedAt);

    return (
      <Animated.View
        entering={FadeInDown.duration(200).delay(index * 50)}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleTaskPress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. Completed ${relativeTime}. Category: ${categoryLabel}`}
        >
          <GlassCard style={styles.taskCard}>
            <View style={[styles.categoryBorder, { backgroundColor: categoryColor }]} />
            <View style={styles.taskContent}>
              <View style={styles.taskHeader}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.taskFooter}>
                <Text style={styles.timestamp}>Completed {relativeTime}</Text>
                <Badge
                  label={categoryLabel}
                  variant="dot"
                  color={categoryColor}
                />
              </View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  }, [handleTaskPress]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <SkeletonLoader count={3} height={90} />
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>✓</Text>
        <Text style={styles.emptyTitle}>No Completed Tasks</Text>
        <Text style={styles.emptyText}>
          Completed tasks will appear here.{'\n'}
          Keep up the good work!
        </Text>
      </Animated.View>
    );
  };

  const renderFooter = () => {
    if (tasks.length === 0) return null;

    return (
      <Animated.View
        entering={FadeInDown.duration(200).delay(tasks.length * 50 + 100)}
        style={styles.footer}
      >
        <Button
          label={clearing ? 'Clearing...' : `Clear All Completed (${tasks.length})`}
          onPress={handleClearAll}
          disabled={clearing}
          loading={clearing}
          variant="secondary"
          style={styles.clearButton}
          textStyle={styles.clearButtonText}
          accessibilityLabel={`Clear all ${tasks.length} completed tasks`}
          accessibilityHint="This action cannot be undone"
        />
        <Text style={styles.footerNote}>
          This action cannot be undone
        </Text>
      </Animated.View>
    );
  };

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
        <Text style={styles.headerTitle}>Completed</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="Completed tasks"
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
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  headerSpacer: {
    width: 70,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  taskCard: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 90,
  },
  categoryBorder: {
    width: 4,
    marginRight: spacing.sm,
  },
  taskContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checkmark: {
    fontSize: 20,
    color: colors.accent.default,
    marginTop: 2,
  },
  taskTitle: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
    lineHeight: typography.lineHeight.normal * typography.size.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timestamp: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.md,
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  clearButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  clearButtonText: {
    color: colors.semantic.error,
  },
  footerNote: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
