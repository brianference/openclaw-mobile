import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../src/store/theme';
import { useScannerStore } from '../../../src/store/scanner';
import { Button } from '../../../src/components/Button';
import { GlassCard } from '../../../src/components/GlassCard';
import { format } from 'date-fns';

export default function DocumentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { getDocumentById, deleteDocument, markAsSavedToBrain } = useScannerStore();

  const [document, setDocument] = useState<ReturnType<typeof getDocumentById>>(undefined);

  useEffect(() => {
    if (params.id) {
      const doc = getDocumentById(params.id as string);
      setDocument(doc);
    }
  }, [params.id]);

  const handleCopyText = async () => {
    if (document?.extractedText) {
      await Clipboard.setStringAsync(document.extractedText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied', 'Text copied to clipboard');
    }
  };

  const handleDelete = () => {
    if (!document) return;

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
            deleteDocument(document.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveToBrain = () => {
    if (document) {
      markAsSavedToBrain(document.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Document marked as saved to Brain');
    }
  };

  const handleEdit = () => {
    if (document) {
      router.push({
        pathname: '/(tabs)/scanner/preview',
        params: { documentId: document.id },
      });
    }
  };

  if (!document) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.notFoundText, { color: colors.text }]}>Document not found</Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.notFoundButton} />
        </View>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy \'at\' h:mm a');
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {document.title}
        </Text>
        <TouchableOpacity onPress={handleEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Image */}
        {document.imageUri && (
          <GlassCard style={styles.imageCard}>
            <Image
              source={{ uri: document.imageUri }}
              style={styles.documentImage}
              resizeMode="contain"
            />
          </GlassCard>
        )}

        {/* Document Info */}
        <GlassCard style={styles.infoCard}>
          <Text style={[styles.documentTitle, { color: colors.text }]}>{document.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Created {formatDate(document.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Last updated {formatDate(document.updatedAt)}
            </Text>
          </View>

          {document.savedToBrain && (
            <View style={[styles.savedBadge, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.savedText, { color: colors.success }]}>Saved to Brain</Text>
            </View>
          )}
        </GlassCard>

        {/* Extracted Text */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Extracted Text</Text>
        <GlassCard style={styles.textCard}>
          <ScrollView style={styles.textScroll} nestedScrollEnabled>
            <Text style={[styles.extractedText, { color: colors.text }]}>
              {document.extractedText || 'No text extracted'}
            </Text>
          </ScrollView>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Copy Text"
            onPress={handleCopyText}
            variant="secondary"
            icon={<Ionicons name="copy-outline" size={20} color={colors.primary} />}
            style={styles.actionButton}
          />

          {!document.savedToBrain && (
            <Button
              title="Save to Brain"
              onPress={handleSaveToBrain}
              icon={<Ionicons name="save-outline" size={20} color="#fff" />}
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Danger Zone */}
        <GlassCard style={styles.dangerCard}>
          <Text style={[styles.dangerTitle, { color: colors.error }]}>Danger Zone</Text>
          <Button
            title="Delete Document"
            onPress={handleDelete}
            variant="danger"
            icon={<Ionicons name="trash-outline" size={20} color="#fff" />}
            style={styles.deleteButton}
          />
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
  },
  notFoundButton: {
    marginTop: 16,
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  documentImage: {
    width: '100%',
    height: 250,
  },
  infoCard: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  savedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textCard: {
    marginBottom: 16,
  },
  textScroll: {
    maxHeight: 300,
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 22,
    padding: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  dangerCard: {
    marginTop: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 8,
  },
});