import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../src/store/theme';
import { useScannerStore } from '../../../src/store/scanner';
import { useBrainStore } from '../../../src/store/brain';
import { Button } from '../../../src/components/Button';
import { GlassCard } from '../../../src/components/GlassCard';
import { TextArea } from '../../../src/components/TextArea';
import { Toast } from '../../../src/components/Toast';
import { BrainNote, NoteCategory } from '../../../src/types';

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const {
    currentScan,
    saveDocument,
    clearCurrentScan,
    setExtractedText,
    getDocumentById,
  } = useScannerStore();
  const { addNote } = useBrainStore();

  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    // Check if we're editing an existing document
    if (params.documentId) {
      const existingDoc = getDocumentById(params.documentId as string);
      if (existingDoc) {
        setDocumentId(existingDoc.id);
        setEditedText(existingDoc.extractedText);
      }
    } else if (currentScan.imageUri) {
      // New scan
      setEditedText(currentScan.extractedText);
    }
  }, [params.documentId, currentScan]);

  const handleCopyToClipboard = async () => {
    await Clipboard.setStringAsync(editedText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToastMessage('Text copied to clipboard');
    setToastType('success');
  };

  const handleSaveToBrain = async () => {
    if (!editedText.trim()) {
      setToastMessage('No text to save');
      setToastType('error');
      return;
    }

    setIsSaving(true);

    try {
      // Generate a title from the first line of text
      const title = editedText.split('\n')[0].substring(0, 50) || 'Scanned Document';

      // Create a brain note from the scanned text
      await addNote({
        title,
        content: editedText,
        category: 'research' as NoteCategory,
        color: 'blue',
        pinned: false,
      });

      // If we have a document, mark it as saved
      if (documentId) {
        // Would call markAsSavedToBrain here
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage('Saved to Brain');
      setToastType('success');

      // Navigate back after a brief delay
      setTimeout(() => {
        router.dismiss();
      }, 1000);
    } catch (error) {
      console.error('Failed to save to brain:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToastMessage('Failed to save');
      setToastType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!editedText.trim()) {
      setToastMessage('No text to save');
      setToastType('error');
      return;
    }

    setIsSaving(true);

    try {
      const title = editedText.split('\n')[0].substring(0, 50) || 'Scanned Document';

      await saveDocument(title, editedText, currentScan.imageUri || '');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage('Document saved');
      setToastType('success');

      setTimeout(() => {
        router.dismiss();
      }, 1000);
    } catch (error) {
      console.error('Failed to save document:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToastMessage('Failed to save');
      setToastType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearCurrentScan();
    router.dismiss();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={colors.text} />
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {documentId ? 'Edit Document' : 'Preview Scan'}
        </Text>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveDocument}
          disabled={isSaving || !editedText.trim()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="checkmark" size={24} color={isSaving || !editedText.trim() ? colors.textMuted : colors.primary} />
          <Text style={[styles.saveText, { color: isSaving || !editedText.trim() ? colors.textMuted : colors.primary }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Image Preview */}
        <GlassCard style={styles.imageCard}>
          {currentScan.imageUri ? (
            <Image
              source={{ uri: currentScan.imageUri }}
              style={styles.documentImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.bgSecondary }]}>
              <Ionicons name="image-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>No image available</Text>
            </View>
          )}
        </GlassCard>

        {/* Extracted Text Section */}
        <View style={styles.textSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Extracted Text</Text>

          <TextArea
            value={editedText}
            onChangeText={(text) => {
              setEditedText(text);
              setExtractedText(text);
            }}
            placeholder="Tap to edit the extracted text..."
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            minHeight={200}
            maxLength={10000}
          />

          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {editedText.length} / 10000
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Copy Text"
            onPress={handleCopyToClipboard}
            variant="secondary"
            icon={<Ionicons name="copy-outline" size={20} color={colors.primary} />}
            style={styles.actionButton}
          />

          <Button
            title={isSaving ? 'Saving...' : 'Save to Brain'}
            onPress={handleSaveToBrain}
            disabled={isSaving || !editedText.trim()}
            icon={<Ionicons name="save-outline" size={20} color="#fff" />}
            style={styles.actionButton}
          />
        </View>

        {/* Tips */}
        <GlassCard style={styles.tipsCard}>
          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.text }]}>
              Tip: Edit the text above if the OCR missed anything
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.text }]}>
              Save to Brain to search and organize your scans later
            </Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastMessage(null)}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  documentImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
  },
  textSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 200,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  tipsCard: {
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});