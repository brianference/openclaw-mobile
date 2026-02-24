import { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../src/store/theme';
import { useScannerStore, ScannedDocument } from '../../../src/store/scanner';
import { Button } from '../../../src/components/Button';
import { GlassCard } from '../../../src/components/GlassCard';
import { format } from 'date-fns';

export default function DocumentLibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { documents, deleteDocument, isLoading } = useScannerStore();
  const [selectedDoc, setSelectedDoc] = useState<ScannedDocument | null>(null);

  const handleDelete = (doc: ScannedDocument) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this scanned document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDocument(doc.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleView = (doc: ScannedDocument) => {
    setSelectedDoc(doc);
    router.push({
      pathname: '/(tabs)/scanner/preview',
      params: { documentId: doc.id },
    });
  };

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/scanner/camera');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Documents</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="scan-outline" size={24} color={colors.primary} />
          <Text style={[styles.scanButtonText, { color: colors.primary }]}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Document List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.documentList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {}}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {documents.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Documents</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Scan your first document to get started
            </Text>
            <Button
              title="Scan Document"
              onPress={handleScan}
              style={styles.emptyButton}
              icon={<Ionicons name="scan" size={20} color="#fff" />}
            />
          </GlassCard>
        ) : (
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              colors={colors}
              onPress={() => handleView(doc)}
              onDelete={() => handleDelete(doc)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB for Quick Scan */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleScan}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function DocumentCard({
  document,
  colors,
  onPress,
  onDelete,
}: {
  document: ScannedDocument;
  colors: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  // Get preview text (first line or first 50 chars)
  const previewText = document.extractedText
    ? document.extractedText.split('\n')[0].substring(0, 50) +
      (document.extractedText.length > 50 ? '...' : '')
    : 'No text extracted';

  return (
    <GlassCard style={styles.documentCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.documentContent}>
        {/* Thumbnail */}
        <View style={[styles.thumbnail, { backgroundColor: colors.bgSecondary }]}>
          {document.imageUri && !imageError ? (
            <Image
              source={{ uri: document.imageUri }}
              style={styles.thumbnailImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Ionicons name="document-text" size={32} color={colors.textMuted} />
          )}
        </View>

        {/* Info */}
        <View style={styles.documentInfo}>
          <Text style={[styles.documentTitle, { color: colors.text }]} numberOfLines={1}>
            {document.title}
          </Text>
          <Text style={[styles.documentPreview, { color: colors.textMuted }]} numberOfLines={2}>
            {previewText}
          </Text>
          <Text style={[styles.documentDate, { color: colors.textDim }]}>
            {formatDate(document.createdAt)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="eye-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Saved indicator */}
      {document.savedToBrain && (
        <View style={[styles.savedBadge, { backgroundColor: colors.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={[styles.savedText, { color: colors.success }]}>Saved</Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  documentList: {
    padding: 16,
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    minWidth: 180,
  },
  documentCard: {
    padding: 0,
    overflow: 'hidden',
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 64,
    height: 64,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
  },
  documentActions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginRight: 12,
    marginBottom: 12,
  },
  savedText: {
    fontSize: 11,
    fontWeight: '600',
  },
});