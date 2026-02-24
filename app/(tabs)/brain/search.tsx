import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';
import { useBrainStore } from '../../../src/store/brain';

interface SearchResult {
  id: string;
  title: string;
  type: 'skill' | 'idea' | 'note' | 'memory';
  content: string;
  matchText?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggested';
}

// Mock recent searches
const RECENT_SEARCHES: SearchSuggestion[] = [
  { id: '1', text: 'mobile design', type: 'recent' },
  { id: '2', text: 'task management', type: 'recent' },
  { id: '3', text: 'react native', type: 'recent' },
];

// Mock suggestions
const SUGGESTIONS: SearchSuggestion[] = [
  { id: '1', text: 'Skills', type: 'suggested' },
  { id: '2', text: 'Ideas about productivity', type: 'suggested' },
  { id: '3', text: 'Recent notes', type: 'suggested' },
];

// Mock search results
const ALL_ITEMS: SearchResult[] = [
  {
    id: '1',
    title: 'Mobile Design Patterns',
    type: 'skill',
    content: 'Modern mobile UI/UX patterns including glassmorphism, spring animations...',
  },
  {
    id: '2',
    title: 'Task Management Best Practices',
    type: 'skill',
    content: 'GTD method, time blocking, priority matrices...',
  },
  {
    id: '3',
    title: 'App Monetization Ideas',
    type: 'idea',
    content: 'Freemium model, in-app purchases, subscription tiers...',
  },
  {
    id: '4',
    title: 'Meeting Notes - Q1 Planning',
    type: 'note',
    content: 'Discussed roadmap, prioritized features, set milestones...',
  },
  {
    id: '5',
    title: 'Shipped v1.0',
    type: 'memory',
    content: 'Successfully launched MobileClaw to App Store',
  },
];

const TYPE_CONFIG = {
  skill: { icon: '💡', label: 'Skill', color: colors.primary.default },
  idea: { icon: '🚀', label: 'Idea', color: colors.accent.default },
  note: { icon: '📝', label: 'Note', color: colors.text.secondary },
  memory: { icon: '🧠', label: 'Memory', color: '#a855f7' },
};

/**
 * Knowledge Search Screen
 * 
 * Per design-spec.md Section 5.3
 * - Full-text search
 * - Recent searches (tappable)
 * - Suggestions
 * - Categorized results
 * - Real-time search
 */
export default function KnowledgeSearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  // Store
  const { setSearchQuery: setStoreQuery, getFilteredNotes } = useBrainStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  
  const results = getFilteredNotes();

  useEffect(() => {
    // Auto-focus input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setStoreQuery('');
      return;
    }

    // Debounced search
    setSearching(true);
    const timer = setTimeout(() => {
      setStoreQuery(searchQuery);
      setSearching(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, setStoreQuery]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSuggestionPress = useCallback((text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(text);
  }, []);

  const handleResultPress = useCallback((resultId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to result detail
    console.log('View result:', resultId);
  }, []);

  const renderSuggestion = ({ item, index }: { item: SearchSuggestion; index: number }) => (
    <Animated.View
      entering={FadeInDown.duration(200).delay(index * 30)}
      exiting={FadeOut.duration(150)}
    >
      <Pressable
        onPress={() => handleSuggestionPress(item.text)}
        style={styles.suggestionItem}
        accessibilityRole="button"
        accessibilityLabel={`${item.type === 'recent' ? 'Recent search' : 'Suggestion'}: ${item.text}`}
      >
        <Text style={styles.suggestionIcon}>
          {item.type === 'recent' ? '🕐' : '💡'}
        </Text>
        <Text style={styles.suggestionText}>{item.text}</Text>
      </Pressable>
    </Animated.View>
  );

  const renderResult = ({ item, index }: { item: SearchResult; index: number }) => {
    const config = TYPE_CONFIG[item.type];

    return (
      <Animated.View
        entering={FadeInDown.duration(200).delay(index * 50)}
        exiting={FadeOut.duration(150)}
      >
        <Pressable
          onPress={() => handleResultPress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`${config.label}: ${item.title}`}
        >
          <GlassCard style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{config.icon}</Text>
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultType}>{config.label}</Text>
              </View>
            </View>
            {item.matchText && (
              <Text style={styles.resultMatch}>{item.matchText}</Text>
            )}
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (!searchQuery.trim()) {
      return (
        <View style={styles.defaultContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <FlatList
              data={RECENT_SEARCHES}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested</Text>
            <FlatList
              data={SUGGESTIONS}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>
      );
    }

    if (searching) {
      return (
        <View style={styles.searchingContainer}>
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.emptyContainer}
        >
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>
            No knowledge found for "{searchQuery}".
            {'\n'}Try different keywords or browse by category.
          </Text>
        </Animated.View>
      );
    }

    return (
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={styles.resultsHeader}>
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </Text>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search knowledge..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus={true}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search knowledge base"
          />
        </View>
        <Pressable
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel search"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 2,
    borderColor: colors.primary.default,
  },
  searchIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    padding: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: typography.size.md,
    color: colors.primary.default,
    fontWeight: typography.weight.medium as any,
  },
  defaultContent: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  suggestionIcon: {
    fontSize: 18,
  },
  suggestionText: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  searchingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  resultsContent: {
    padding: spacing.md,
  },
  resultsHeader: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  resultCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
    marginBottom: spacing.xs,
  },
  resultType: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  resultMatch: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
});
