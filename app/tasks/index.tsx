import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  SearchBar,
  Chip,
  FAB,
  GlassCard,
  Checkbox,
  SkeletonLoader,
  Badge,
} from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { Task, TaskCategory } from '../../src/types';
import { useTaskStore } from '../../src/store/task';

type FilterType = 'all' | 'active' | 'completed';
type CategoryType = 'all' | TaskCategory;

const CATEGORY_COLORS: Record<string, string> = {
  work: colors.primary.default,
  personal: colors.accent.default,
  shopping: colors.semantic.warning,
};

/**
 * Task List Screen
 * 
 * Per design-spec.md Section 5.2
 * - Search bar with debounce
 * - Filter chips (All, Active, Completed)
 * - Swipeable task cards
 * - Empty state
 * - Pull-to-refresh
 * - FAB for adding tasks
 */
export default function TaskListScreen() {
  const router = useRouter();
  
  const { tasks, isLoading, fetchTasks, toggleTaskComplete } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  const handleToggleComplete = (taskId: string) => {
    toggleTaskComplete(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    // TODO: Show toast with undo
  };

  const formatDueDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return 'Overdue';
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d`;
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by completion status
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Filter by category
    if (category !== 'all' && task.category !== category) return false;
    
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const renderTask = ({ item: task, index }: { item: Task; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => router.push(`/tasks/${task.id}`)}
        style={[
          styles.taskCard,
          { borderLeftColor: CATEGORY_COLORS[task.category] || colors.dark.border },
        ]}
      >
        <View style={styles.taskRow}>
          <Checkbox
            checked={task.completed}
            onToggle={() => handleToggleComplete(task.id)}
            accessibilityLabel={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          
          <View style={styles.taskContent}>
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.taskTitleCompleted,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            
            {task.dueDate && (
              <View style={styles.taskMeta}>
                <Text style={styles.taskMetaText}>
                  Due: {formatDueDate(task.dueDate)}
                </Text>
              </View>
            )}
            
            {task.category && (
              <View style={styles.taskMeta}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${CATEGORY_COLORS[task.category] || colors.dark.border}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: CATEGORY_COLORS[task.category] || colors.dark.textSecondary },
                    ]}
                  >
                    {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to create your first task
      </Text>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonLoader key={i} height={72} style={styles.skeletonCard} />
      ))}
    </View>
  );

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="header"
            accessibilityLevel={1}
          >
            Tasks
          </Text>
          {activeCount > 0 && (
            <Badge count={activeCount} />
          )}
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks..."
          accessibilityLabel="Search tasks"
        />

        {/* Filter Chips */}
        <View style={styles.filters}>
          <Chip
            label="All"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <Chip
            label="Active"
            active={filter === 'active'}
            onPress={() => setFilter('active')}
          />
          <Chip
            label="Completed"
            active={filter === 'completed'}
            onPress={() => setFilter('completed')}
          />
        </View>
      </View>

      {/* Task List */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredTasks.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.default}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <FAB
        icon="add"
        onPress={() => router.push('/tasks/add')}
        accessibilityLabel="Add new task"
        accessibilityHint="Opens the create task screen"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bgPrimary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.dark.textPrimary,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  taskCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 72,
  },
  taskRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taskContent: {
    flex: 1,
    gap: spacing.xs,
  },
  taskTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.dark.textPrimary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.md,
  },
  taskTitleCompleted: {
    color: colors.dark.textTertiary,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskMetaText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skeletonCard: {
    marginBottom: spacing.md,
  },
});
