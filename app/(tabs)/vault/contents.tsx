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
import * as Clipboard from 'expo-clipboard';
import {
  SearchBar,
  Chip,
  FAB,
  GlassCard,
  Toast,
  SkeletonLoader,
} from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/design/tokens';
import { useVaultStore, SecretType, VaultSecret } from '../../../src/store/vault';

type VaultCategory = 'all' | SecretType;

const CATEGORY_CONFIG: Record<VaultCategory, { icon: string; label: string }> = {
  all: { icon: '📁', label: 'All' },
  login: { icon: '🌐', label: 'Login' },
  key: { icon: '🔑', label: 'Key' },
  note: { icon: '📝', label: 'Note' },
  card: { icon: '💳', label: 'Card' },
};

/**
 * Vault Contents Screen
 * 
 * Per design-spec.md Section 5.4
 * - Search bar
 * - Type filters (All, Login, Card, Note, Key)
 * - Secret cards with:
 *   - Icon by type
 *   - Name
 *   - Masked value preview
 *   - Reveal button (👁️) - shows for 10 seconds
 *   - Copy button (📋) - copies to clipboard
 * - Swipe left: Delete (confirmation)
 * - Tap card: View details
 * - FAB: Add new secret
 * - Auto-lock after 5 min inactivity
 */
export default function VaultContentsScreen() {
  const router = useRouter();

  // Store
  const { 
    secrets, 
    isLoading, 
    fetchSecrets, 
    deleteSecret, 
    recordAccess,
    searchSecrets, 
    getSecretsByType 
  } = useVaultStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<VaultCategory>('all');
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load secrets on mount
  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  // Auto-hide revealed items after 10 seconds
  useEffect(() => {
    if (revealedItems.size > 0) {
      const timer = setTimeout(() => {
        setRevealedItems(new Set());
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [revealedItems]);

  // TODO: Implement auto-lock after 5 min inactivity
  useEffect(() => {
    // Track last activity time
    // Lock vault after 5 minutes of inactivity
  }, []);

  const handleReveal = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
        // Record access when revealing
        recordAccess(itemId);
      }
      return newSet;
    });
  }, [recordAccess]);

  const handleCopy = useCallback(async (item: VaultSecret) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    let valueToCopy = '';
    
    // Get the appropriate value based on type
    switch (item.type) {
      case 'login':
        valueToCopy = item.password || '';
        break;
      case 'card':
        valueToCopy = item.cardNumber || '';
        break;
      case 'key':
        valueToCopy = item.apiKey || '';
        break;
      case 'note':
        valueToCopy = item.note || '';
        break;
    }

    await Clipboard.setStringAsync(valueToCopy);
    setToastMessage('Copied to clipboard (auto-clears in 30s)');
    setShowToast(true);
    recordAccess(item.id);

    // Auto-clear clipboard after 30 seconds
    setTimeout(async () => {
      await Clipboard.setStringAsync('');
    }, 30000);
  }, [recordAccess]);

  const handleDelete = useCallback((item: VaultSecret) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Secret',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
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
              await deleteSecret(item.id);
              setToastMessage('Secret deleted');
              setShowToast(true);
            } catch (error) {
              console.error('Error deleting secret:', error);
              setToastMessage('Failed to delete secret');
              setShowToast(true);
            }
          },
        },
      ]
    );
  }, [deleteSecret]);

  const handleItemPress = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/vault/${itemId}`);
  }, [router]);

  const getMaskedValue = (item: VaultSecret, revealed: boolean): string => {
    switch (item.type) {
      case 'login':
        return item.username || '••••••••••••';
      case 'card':
        if (item.cardNumber) {
          return `•••• ${item.cardNumber.slice(-4)}`;
        }
        return '••••••••••••';
      case 'key':
        if (revealed && item.apiKey) {
          return item.apiKey.length > 20 ? item.apiKey.substring(0, 20) + '...' : item.apiKey;
        }
        return '••••••••••••';
      case 'note':
        if (revealed && item.note) {
          return item.note.length > 30 ? item.note.substring(0, 30) + '...' : item.note;
        }
        return '••••••••••••';
      default:
        return '••••••••••••';
    }
  };

  const getSecondaryValue = (item: VaultSecret, revealed: boolean): string | null => {
    if (!revealed) {
      return '••••••••••••';
    }

    switch (item.type) {
      case 'login':
        return item.password || null;
      case 'card':
        return item.cvv ? `CVV: ${item.cvv}` : null;
      default:
        return null;
    }
  };

  // Filter items using store methods
  const filteredItems = (() => {
    let items = filter === 'all' ? secrets : getSecretsByType(filter);
    if (searchQuery) {
      items = searchSecrets(searchQuery);
      if (filter !== 'all') {
        items = items.filter(item => item.type === filter);
      }
    }
    return items;
  })();

  const renderItem = ({ item, index }: { item: VaultSecret; index: number }) => {
    const config = CATEGORY_CONFIG[item.type];
    const isRevealed = revealedItems.has(item.id);
    const maskedValue = getMaskedValue(item, isRevealed);
    const secondaryValue = getSecondaryValue(item, isRevealed);

    return (
      <Animated.View
        entering={FadeInDown.duration(200).delay(index * 50)}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleItemPress(item.id)}
          onLongPress={() => handleDelete(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}. ${config.label}. Double tap to view details, long press to delete.`}
        >
          <GlassCard style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemIcon}>{config.icon}</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </View>

            <View style={styles.itemContent}>
              <View style={styles.itemValues}>
                <Text style={styles.itemValue} numberOfLines={1}>
                  {maskedValue}
                </Text>
                {secondaryValue && (
                  <Text style={[styles.itemValue, styles.itemSecondaryValue]} numberOfLines={1}>
                    {secondaryValue}
                  </Text>
                )}
              </View>

              <View style={styles.itemActions}>
                <Pressable
                  onPress={() => handleReveal(item.id)}
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel={isRevealed ? 'Hide value' : 'Reveal value'}
                >
                  <Text style={styles.actionIcon}>{isRevealed ? '🙈' : '👁️'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCopy(item)}
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="Copy to clipboard"
                >
                  <Text style={styles.actionIcon}>📋</Text>
                </Pressable>
              </View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <SkeletonLoader count={3} height={110} />
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>🔐</Text>
        <Text style={styles.emptyTitle}>No Secrets Yet</Text>
        <Text style={styles.emptyText}>
          Tap the + button to add your first secret
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Vault</Text>
          <Pressable
            onPress={() => router.push('/vault/settings')}
            style={styles.settingsButton}
            accessibilityRole="button"
            accessibilityLabel="Vault settings"
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search secrets..."
          accessibilityLabel="Search vault secrets"
        />

        {/* Filter Chips */}
        <View style={styles.filters}>
          {(Object.keys(CATEGORY_CONFIG) as VaultCategory[]).map(cat => (
            <Chip
              key={cat}
              label={`${CATEGORY_CONFIG[cat].icon} ${CATEGORY_CONFIG[cat].label}`}
              active={filter === cat}
              onPress={() => setFilter(cat)}
            />
          ))}
        </View>
      </View>

      {/* Item List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="Vault secrets"
      />

      {/* FAB */}
      <FAB
        icon="add"
        onPress={() => router.push('/vault/add')}
        accessibilityLabel="Add new secret"
        accessibilityHint="Opens the create secret screen"
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  itemCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemHeader: {
    marginBottom: spacing.xs,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemName: {
    flex: 1,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as any,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemValues: {
    flex: 1,
    gap: spacing.xs,
  },
  itemValue: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  itemSecondaryValue: {
    color: colors.text.tertiary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionIcon: {
    fontSize: 20,
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
