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
import * as Haptics from 'expo-haptics';
import {
  SearchBar,
  Chip,
  FAB,
  GlassCard,
  SkeletonLoader,
} from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';
import { useBrainStore } from '../../../src/store/brain';
import { NoteCategory } from '../../../src/types';

type FilterType = 'all' | 'skill' | 'idea' | 'note' | 'research';

const TYPE_CONFIG = {
  skill: {
    icon: '💡',
    label: 'Skill',
    color: colors.primary.default,
  },
  idea: {
    icon: '🚀',
    label: 'Idea',
    color: colors.accent.default,
  },
  note: {
    icon: '📝',
    label: 'Note',
    color: colors.text.secondary,
  },
  memory: {
    icon: '🧠',
    label: 'Memory',
    color: '#a855f7', // Purple accent (exception: 4th color for memories)
  },
};

/**
 * Knowledge Base Home Screen
 * 
 * Per design-spec.md Section 5.3
 * - Search bar
 * - Filter chips (All, Skills, Ideas, Notes, Memories)
 * - Knowledge cards with type icon, title, timestamp
 * - Empty state
 * - Pull-to-refresh
 * - FAB for adding knowledge
 */
export default function KnowledgeBaseScreen() {
  const router = useRouter();

  // Store
  const { 
    notes, 
    isLoading, 
    searchQuery, 
    filterCategory,
    fetchNotes, 
    setSearchQuery, 
    setFilterCategory,
    getFilteredNotes 
  } = useBrainStore();

  const [refreshing, setRefreshing] = useState(false);

  const items = getFilteredNotes();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [fetchNotes]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterCategory(newFilter);
  }, [setFilterCategory]);

  const handleItemPress = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to item detail screen
    console.log('Navigate to item:', itemId);
  }, []);

  const handleAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to add knowledge screen
    console.log('Add knowledge');
  }, []);

  const handleSkillsBrowser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/brain/skills');
  }, [router]);

  const handleMemoryTimeline = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/brain/memories');
  }, [router]);

  const handleSearchFocus = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/brain/search');
  }, [router]);

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
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

  // Filter items
  const filteredItems = items.filter(item => {
    // Filter by type
    if (filterCategory !== 'all') {
      const typeMatch = filterCategory === 'skill' ? item.category === 'skill'
        : filterCategory === 'idea' ? item.category === 'idea'
        : filterCategory === 'note' ? item.category === 'note'
        : filterCategory === 'research' ? item.category === 'memory'
        : false;
      if (!typeMatch) return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const renderItem = useCallback(({ item, index }: { item: BrainNote; index: number }) => {
    const config = TYPE_CONFIG[item.category];
    const relativeTime = getRelativeTime(item.updatedAt);

    return (
      <Animated.View
        entering={FadeInDown.duration(200).delay(index * 50)}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleItemPress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`${config.label}: ${item.title}. Created ${relativeTime}`}
        >
          <GlassCard style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemIcon}>{config.icon}</Text>
              <View style={styles.itemTitleContainer}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {config.label} · {relativeTime}
                </Text>
              </View>
            </View>
            <Text style={styles.itemContent} numberOfLines={2}>
              {item.content}
            </Text>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  }, [handleItemPress, getRelativeTime]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <>{[...Array(4)].map((_, i) => <SkeletonLoader key={i} height={110} style={{marginBottom: 12}} />)}</>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>🧠</Text>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No Results' : 'Your Second Brain is Empty'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? `No knowledge found for "${searchQuery}"`
            : 'Start capturing skills, ideas, notes, and memories.\nTap + to begin building your knowledge base.'}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Second Brain</Text>
        <Pressable
          onPress={handleAdd}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add knowledge"
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search knowledge..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleSearchFocus}
          accessibilityLabel="Search knowledge base"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Chip
          label="All"
          active={filterCategory === 'all'}
          onPress={() => handleFilterChange('all')}
          
          accessibilityState={{ checked: filterCategory === 'all' }}
        />
        <Chip
          label="Skills"
          active={filterCategory === 'skill'}
          onPress={() => handleFilterChange('skill')}
          
          
          accessibilityState={{ checked: filterCategory === 'skill' }}
        />
        <Chip
          label="Ideas"
          active={filterCategory === 'idea'}
          onPress={() => handleFilterChange('idea')}
          
          
          accessibilityState={{ checked: filterCategory === 'idea' }}
        />
        <Chip
          label="Notes"
          active={filterCategory === 'note'}
          onPress={() => handleFilterChange('note')}
          
          
          accessibilityState={{ checked: filterCategory === 'note' }}
        />
        <Chip
          label="Memories"
          active={filterCategory === 'research'}
          onPress={() => handleFilterChange('research')}
          
          
          accessibilityState={{ checked: filterCategory === 'research' }}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          onPress={handleSkillsBrowser}
          style={styles.quickAction}
          accessibilityRole="button"
          accessibilityLabel="Browse skills by category"
        >
          <Text style={styles.quickActionIcon}>🎨</Text>
          <Text style={styles.quickActionText}>Browse Skills</Text>
        </Pressable>
        <Pressable
          onPress={handleMemoryTimeline}
          style={styles.quickAction}
          accessibilityRole="button"
          accessibilityLabel="View memory timeline"
        >
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={styles.quickActionText}>Timeline</Text>
        </Pressable>
      </View>

      {/* Knowledge List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.default}
            colors={[colors.primary.default]}
          />
        }
        accessibilityRole="list"
        accessibilityLabel="Knowledge items"
      />

      {/* FAB */}
      <FAB
        onPress={handleAdd}
        icon="+"
        label="Add"
        accessibilityLabel="Add knowledge"
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
  headerTitle: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold as any,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary.default,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexWrap: 'wrap',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    minHeight: 44,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  itemCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    lineHeight: typography.lineHeight.normal * typography.size.md,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  itemContent: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
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
});
