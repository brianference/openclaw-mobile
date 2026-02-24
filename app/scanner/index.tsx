import { useState, useCallback } from 'react';
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
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  SearchBar,
  FAB,
  GlassCard,
  Toast,
  EmptyState,
} from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';

/**
 * Scanner Document Library Screen
 * 
 * Per design-spec.md Section 5.6
 * - List of scanned documents
 * - Document preview with text snippet
 * - View and delete actions
 * - FAB to scan new document
 */
interface ScannedDocument {
  id: string;
  title: string;
  preview: string;
  date: string;
}

// Sample data (in production, this would come from a store/DB)
const SAMPLE_DOCUMENTS: ScannedDocument[] = [
  {
    id: '1',
    title: 'Receipt - Coffee Shop',
    preview: 'Total: $45.67',
    date: '2/8/26',
  },
  {
    id: '2',
    title: 'Business Card - John',
    preview: 'John Doe - Software Engineer',
    date: '2/7/26',
  },
  {
    id: '3',
    title: 'Meeting Notes',
    preview: 'Action items for Q1 planning...',
    date: '2/5/26',
  },
  {
    id: '4',
    title: 'Invoice #1234',
    preview: 'Payment due: March 1st...',
    date: '2/3/26',
  },
  {
    id: '5',
    title: 'Recipe - Pasta',
    preview: 'Ingredients: 1lb spaghetti...',
    date: '2/1/26',
  },
];

export default function ScannerDocumentsScreen() {
  const router = useRouter();
  
  const [documents, setDocuments] = useState<ScannedDocument[]>(SAMPLE_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocumentPress = useCallback((doc: ScannedDocument) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to document detail
    router.push({
      pathname: '/scanner/preview',
      params: {
        documentId: doc.id,
        extractedText: `Sample OCR text for ${doc.title}\n\n${doc.preview}`,
      },
    });
  }, [router]);

  const handleDeleteDocument = useCallback((doc: ScannedDocument) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
            setToastMessage('Document deleted');
            setShowToast(true);
          },
        },
      ]
    );
  }, []);

  const handleScanNew = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    router.push('/scanner/camera');
  }, [router]);

  const renderDocument = ({ item: doc, index }: { item: ScannedDocument; index: number }) => (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 50)}
    >
      <Pressable
        onPress={() => handleDocumentPress(doc)}
        onLongPress={() => handleDeleteDocument(doc)}
        accessibilityRole="button"
        accessibilityLabel={`${doc.title}. ${doc.preview}. Double tap to open, long press to delete.`}
      >
        <GlassCard style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Text style={styles.documentIcon}>📄</Text>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle} numberOfLines={1}>
                {doc.title}
              </Text>
              <Text style={styles.documentPreview} numberOfLines={2}>
                {doc.preview}
              </Text>
            </View>
          </View>
          
          <View style={styles.documentFooter}>
            <Text style={styles.documentDate}>{doc.date}</Text>
            <View style={styles.documentActions}>
              <Pressable
                onPress={() => handleDocumentPress(doc)}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="View document"
              >
                <Text style={styles.actionIcon}>👁️</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDeleteDocument(doc)}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Delete document"
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </Pressable>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <EmptyState
        icon="📄"
        title="No Documents Yet"
        description="Scan your first document to get started"
        actionLabel="Scan Document"
        onAction={handleScanNew}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search documents..."
          accessibilityLabel="Search scanned documents"
        />
      </View>

      {/* Document List */}
      <FlatList
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredDocuments.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      />

      {/* FAB */}
      <FAB
        icon="add"
        onPress={handleScanNew}
        accessibilityLabel="Scan new document"
        accessibilityHint="Opens camera for document scanning"
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  documentCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  documentIcon: {
    fontSize: 32,
  },
  documentInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  documentTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.text.primary,
  },
  documentPreview: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  documentDate: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  documentActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  actionIcon: {
    fontSize: 18,
  },
});