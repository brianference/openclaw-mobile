import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard, SkeletonLoader } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';
import { useBrainStore } from '../../src/store/brain';

/**
 * Skills are stored as 'research' category notes in the Brain store
 * Each note represents a skill, learning resource, or knowledge area
 */

/**
 * Skill Browser Screen
 * 
 * Per design-spec.md Section 5.3
 * - Shows research/learning notes from Brain store
 * - Each note represents a skill, resource, or knowledge area
 * - Tap to view skill details
 * 
 * Connected to Brain Store (useBrainStore)
 * - Uses category='research' filter
 * - Displays all research notes
 */
export default function SkillBrowserScreen() {
  const router = useRouter();
  const { notes, isLoading, fetchNotes, setFilterCategory } = useBrainStore();
  const [refreshing, setRefreshing] = useState(false);

  // Filter to show only research/skill notes
  useEffect(() => {
    setFilterCategory('research');
    fetchNotes();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [fetchNotes]);

  const handleSkillPress = useCallback((skillId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to skill/note detail (using brain note viewer)
    router.push(`/brain/${skillId}` as any);
  }, [router]);

  // Get research/skill notes
  const skillNotes = notes.filter(note => note.category === 'research');

  const renderSkill = (note: any, index: number) => {
    const noteColor = note.color === 'default' ? colors.primary.default : note.color;

    return (
      <Animated.View
        key={note.id}
        entering={FadeInDown.duration(200).delay(index * 50)}
      >
        <Pressable
          onPress={() => handleSkillPress(note.id)}
          accessibilityRole="button"
          accessibilityLabel={`Skill: ${note.title}. ${note.content.substring(0, 100)}`}
        >
          <GlassCard style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <View style={[styles.skillIcon, { backgroundColor: noteColor + '20' }]}>
                <Text style={styles.skillIconText}>📚</Text>
              </View>
              <View style={styles.skillContent}>
                <Text style={styles.skillTitle}>{note.title}</Text>
                {note.content && (
                  <Text style={styles.skillDescription} numberOfLines={2}>
                    {note.content}
                  </Text>
                )}
                {note.pinned && (
                  <View style={styles.pinnedBadge}>
                    <Text style={styles.pinnedText}>📌 Pinned</Text>
                  </View>
                )}
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
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No Skills Yet</Text>
        <Text style={styles.emptyText}>
          Add notes with 'research' category to track your skills, learning resources, and knowledge areas.
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
        <Text style={styles.headerTitle}>Skills</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Skills List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.default}
            colors={[colors.primary.default]}
          />
        }
      >
        <Text style={styles.subtitle}>
          Browse your skills and learning resources
        </Text>
        {skillNotes.length === 0 ? renderEmpty() : skillNotes.map((note, index) => renderSkill(note, index))}
      </ScrollView>
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
  scrollContent: {
    padding: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  skillCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  skillHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  skillIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillIconText: {
    fontSize: 24,
  },
  skillContent: {
    flex: 1,
  },
  skillTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeight.semibold as any,
    marginBottom: spacing.xs,
  },
  skillDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  pinnedBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  pinnedText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.textTertiary,
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
