import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import {
  Button,
  GlassCard,
  TextArea,
  Toast,
  FAB,
} from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/design/tokens';

/**
 * Scanner Preview/Edit Screen
 * 
 * Per design-spec.md Section 5.6
 * - Document image preview (cropped)
 * - Editable extracted text
 * - Copy text action
 * - Save to Brain action
 */
export default function ScannerPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [extractedText, setExtractedText] = useState(
    (params.extractedText as string) || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopyText = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(extractedText);
    setToastMessage('Text copied to clipboard');
    setShowToast(true);
  }, [extractedText]);

  const handleSaveToBrain = useCallback(async () => {
    if (!extractedText.trim()) {
      setToastMessage('No text to save');
      setShowToast(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    // Simulate saving to brain
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('Saved to Second Brain');
      setShowToast(true);
      
      // Navigate to brain after short delay
      setTimeout(() => {
        router.push('/brain');
      }, 1000);
    }, 1000);
  }, [extractedText, router]);

  const handleRetake = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/scanner');
  }, [router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissAll();
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Document Preview */}
        <Animated.View entering={FadeIn.duration(300)}>
          <GlassCard style={styles.previewCard}>
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewIcon}>📄</Text>
              <Text style={styles.previewText}>Document Image</Text>
              <Text style={styles.previewSubtext}>
                {params.imageUri ? 'Captured document preview' : 'No image available'}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(100)}
          style={styles.actionsRow}
        >
          <Button
            label="📋 Copy Text"
            onPress={handleCopyText}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            label="💾 Save to Brain"
            onPress={handleSaveToBrain}
            variant="secondary"
            style={styles.actionButton}
            disabled={isSaving}
            loading={isSaving}
          />
        </Animated.View>

        {/* Extracted Text */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(200)}
        >
          <Text style={styles.sectionTitle}>Extracted Text</Text>
          <TextArea
            value={extractedText}
            onChangeText={setExtractedText}
            placeholder="Extracted text will appear here..."
            multiline
            numberOfLines={12}
            maxLength={10000}
            style={styles.textArea}
            showCharacterCount
          />
        </Animated.View>

        {/* Spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View
        entering={FadeInDown.duration(300).delay(300)}
        style={styles.bottomActions}
      >
        <Button
          label="Retake"
          onPress={handleRetake}
          variant="secondary"
          style={styles.retakeButton}
        />
        <Button
          label="Done"
          onPress={handleClose}
          variant="primary"
          style={styles.doneButton}
        />
      </Animated.View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  previewCard: {
    padding: 0,
    overflow: 'hidden',
  },
  previewPlaceholder: {
    height: 200,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  previewText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.text.secondary,
  },
  previewSubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 250,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  retakeButton: {
    flex: 1,
  },
  doneButton: {
    flex: 2,
  },
});