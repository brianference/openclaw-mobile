import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard, SkeletonLoader } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { useBrainStore } from '../../src/store/brain';
import type { BrainNote } from '../../src/types';

interface MemorySection {
  title: string;
  data: BrainNote[];
}

/**
 * Memory Timeline - shows all brain notes in chronological order
 * Uses Brain store with date-based grouping (Today, Yesterday, This Week, etc.)
 */

/**
 * Memory Timeline Screen
 * 
 * Per design-spec.md Section 5.3
 * - Chronological memory view
 * - Sectioned by date (Today, Yesterday, This Week, etc.)
 * - Memory icon and timestamp
 * - Tap to view memory details
 * 
 * Connected to Brain Store (useBrainStore)
 * - Shows ALL brain notes sorted by date
 * - Groups by relative time (Today, Yesterday, etc.)
 */
export default function MemoryTimelineScreen() {
  const router = useRouter();
  const { notes, isLoading, fetchNotes } = useBrainStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [fetchNotes]);

  const handleMemoryPress = useCallback((memoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to note detail
    router.push(`/brain/${memoryId}` as any);
  }, [router]);

  // Group notes by date sections
  const sections = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const grouped: { [key: string]: BrainNote[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': [],
    };

    notes.forEach(note => {
      const noteDate = new Date(note.updated_at);
      const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());

      if (noteDateOnly.getTime() === today.getTime()) {
        grouped['Today'].push(note);
      } else if (noteDateOnly.getTime() === yesterday.getTime()) {
        grouped['Yesterday'].push(note);
      } else if (noteDateOnly > thisWeek) {
        grouped['This Week'].push(note);
      } else {
        grouped['Older'].push(note);
      }
    });

    // Convert to section array and filter out empty sections
    return Object.entries(grouped)
      .filter(([_, data]) => data.length > 0)
      .map(([title, data]) => ({ title, data }));
  }, [notes]);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get category emoji
  const getCategoryEmoji = (category: string): string => {
    switch (category) {
      case 'idea': return '💡';
      case 'note': return '📝';
      case 'todo': return '✅';
      case 'research': return '📚';
      default: return '🧠';
    }
  };

  const renderSectionHeader = ({ section }: { section: MemorySection }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  const renderItem = ({ item, index }: { item: BrainNote; index: number }) => {
    const time = formatTime(item.updated_at);
    const emoji = getCategoryEmoji(item.category);
    const noteColor = item.color === 'default' ? colors.primary.default : item.color;

    return (
      <Animated.View
        entering={FadeInDown.duration(200).delay(index * 50)}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleMemoryPress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Memory: ${item.title}. ${item.content}. Recorded at ${time}`}
        >
          <GlassCard style={styles.memoryCard}>
            <View style={styles.memoryHeader}>
              <View style={[styles.memoryIconContainer, { backgroundColor: noteColor + '20' }]}>
                <Text style={styles.memoryIcon}>{emoji}</Text>
              </View>
              <View style={styles.memoryContent}>
                <Text style={styles.memoryTitle}>{item.title}</Text>
                <Text style={styles.memoryText} numberOfLines={2}>{item.content}</Text>
                <View style={styles.memoryFooter}>
                  <Text style={styles.categoryBadge}>{item.category}</Text>
                  <Text style={styles.memoryTime}>{time}</Text>
                  {item.pinned && <Text style={styles.pinnedBadge}>📌</Text>}
                </View>
              </View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <SkeletonLoader count={5} height={100} />
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>🧠</Text>
        <Text style={styles.emptyTitle}>No Memories Yet</Text>
        <Text style={styles.emptyText}>
          All your brain notes will appear here in chronological order.
          {'\n'}Create notes, ideas, or todos to see your memory timeline.
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
        <Text style={styles.headerTitle}>Memories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Memory Timeline */}
      <SectionList
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.default}
            colors={[colors.primary.default]}
          />
        }
        accessibilityRole="list"
        accessibilityLabel="Memory timeline"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary.default,
    fontWeight: typography.fontWeight.medium as any,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.semibold as any,
  },
  headerSpacer: {
    width: 70,
  },
  listContent: {
    padding: spacing.md,
  },
  sectionHeader: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.semibold as any,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.dark.bgPrimary,
    paddingVertical: spacing.xs,
  },
  memoryCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  memoryHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  memoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#a855f7' + '20', // Purple with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryIcon: {
    fontSize: 20,
  },
  memoryContent: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.semibold as any,
    marginBottom: spacing.xs,
  },
  memoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  memoryTime: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textTertiary,
  },
  memoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.textTertiary,
    backgroundColor: colors.dark.bgSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    textTransform: 'uppercase',
  },
  pinnedBadge: {
    fontSize: typography.fontSize.xs,
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
    fontSize: typography.fontSize.xl,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.semibold as any,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
});
