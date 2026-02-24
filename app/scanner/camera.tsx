import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraPermission, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import {
  Button,
  GlassCard,
  Toast,
} from '../../src/components';
import { colors, spacing, typography, radius, shadows } from '../../src/design/tokens';

/**
 * Scanner Camera View
 * 
 * Per design-spec.md Section 5.6
 * - Full-screen camera with document overlay
 * - OCR guide overlay box
 * - Capture button (center)
 * - Gallery, flash, flip controls
 * - Processing state with "Extracting text..."
 * - Error state with "OCR failed. Try again."
 */
export default function ScannerCameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const captureScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0.7)).current;

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = useCallback(async () => {
    if (isCapturing || isProcessing) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);
    setError(null);

    // Animate capture feedback
    Animated.sequence([
      Animated.timing(captureScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(captureScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate OCR processing (in production, use expo-vision or similar)
    setTimeout(() => {
      setIsCapturing(false);
      setIsProcessing(true);
      
      // Simulate extraction
      setTimeout(() => {
        setIsProcessing(false);
        // Navigate to preview with sample OCR result
        router.push({
          pathname: '/scanner/preview',
          params: {
            imageUri: 'captured_image',
            extractedText: 'Sample extracted OCR text from document.\n\nThis is the text that was extracted from your scan.',
          },
        });
      }, 2000);
    }, 500);
  }, [isCapturing, isProcessing, router, captureScale]);

  const handleFlipCamera = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setToastMessage('Camera flipped');
    setShowToast(true);
  }, []);

  const handleGallery = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setToastMessage('Gallery picker would open');
    setShowToast(true);
  }, []);

  const handleToggleFlash = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode(prev => {
      const next = prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off';
      setToastMessage(`Flash: ${next}`);
      setShowToast(true);
      return next;
    });
  }, []);

  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan documents, we need access to your camera.
          </Text>
          <Button
            label="Grant Permission"
            onPress={requestPermission}
            variant="primary"
            style={styles.permissionButton}
          />
          <Button
            label="Go Back"
            onPress={handleClose}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.processingContainer}>
          <Animated.View
            style={[
              styles.processingCircle,
              {
                transform: [{ scale: captureScale }],
              },
            ]}
          >
            <Text style={styles.processingIcon}>📝</Text>
          </Animated.View>
          <Text style={styles.processingTitle}>Extracting Text...</Text>
          <Text style={styles.processingText}>
            Analyzing your document
          </Text>
          <View style={styles.processingBar}>
            <Animated.View
              style={[
                styles.processingProgress,
                {
                  width: '60%',
                },
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Scan Document</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          flash={flashMode}
          mute={true}
          zoom={0}
        />
        
        {/* Document Guide Overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySides} />
            <View style={styles.guideBox}>
              <View style={styles.guideCornerTL} />
              <View style={styles.guideCornerTR} />
              <View style={styles.guideCornerBL} />
              <View style={styles.guideCornerBR} />
              <Text style={styles.guideText}>Position document here</Text>
            </View>
            <View style={styles.overlaySides} />
          </View>
          <View style={styles.overlayBottom} />
        </View>

        {/* Error Banner */}
        {error && (
          <GlassCard style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Pressable onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </GlassCard>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlRow}>
            {/* Gallery */}
            <Pressable
              onPress={handleGallery}
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel="Open gallery"
            >
              <Text style={styles.controlIcon}>🖼️</Text>
            </Pressable>

            {/* Capture */}
            <Animated.View
              style={[
                styles.captureButton,
                {
                  transform: [{ scale: captureScale }],
                },
              ]}
            >
              <Pressable
                onPress={handleCapture}
                style={styles.captureButtonInner}
                accessibilityRole="button"
                accessibilityLabel="Capture document"
                accessibilityHint="Takes a photo for OCR scanning"
              />
            </Animated.View>

            {/* Flash */}
            <Pressable
              onPress={handleToggleFlash}
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel={`Flash: ${flashMode}`}
            >
              <Text style={styles.controlIcon}>
                {flashMode === 'on' ? '🔦' : flashMode === 'auto' ? '✨' : '🚫'}
              </Text>
            </Pressable>
          </View>
          
          <Text style={styles.flashLabel}>
            {flashMode === 'on' ? 'Flash On' : flashMode === 'auto' ? 'Flash Auto' : 'Flash Off'}
          </Text>
        </View>
      </View>

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
        duration={2000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.text.primary,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.size.md,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 280,
  },
  overlaySides: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  guideBox: {
    flex: 1,
    margin: spacing.md,
    borderWidth: 2,
    borderColor: `${colors.primary.default}80`,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  guideCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary.default,
    borderTopLeftRadius: radius.sm,
  },
  guideCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary.default,
    borderTopRightRadius: radius.sm,
  },
  guideCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary.default,
    borderBottomLeftRadius: radius.sm,
  },
  guideCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary.default,
    borderBottomRightRadius: radius.sm,
  },
  guideText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorBanner: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.semantic.error,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.default,
    borderRadius: radius.sm,
  },
  retryText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  controls: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomControls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.text.primary,
  },
  flashLabel: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    fontSize: typography.size.xs,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  processingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary.default}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIcon: {
    fontSize: 48,
  },
  processingTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.text.primary,
  },
  processingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  processingBar: {
    width: 200,
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  processingProgress: {
    height: '100%',
    backgroundColor: colors.primary.default,
    borderRadius: radius.full,
  },
});