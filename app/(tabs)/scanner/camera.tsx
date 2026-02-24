import { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../src/store/theme';
import { useScannerStore } from '../../../src/store/scanner';
import { Button } from '../../../src/components/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock OCR function - in production, integrate with Google Cloud Vision, Azure, or similar
async function performOCR(imageUri: string): Promise<string> {
  // Simulate OCR processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return mock extracted text
  return `RECEIPT

Date: ${new Date().toLocaleDateString()}
Store: Example Store

Items:
1. Coffee.............. $4.50
2. Sandwich............ $8.99
3. Water Bottle........ $2.50

Subtotal:............... $15.99
Tax:.................... $1.28

TOTAL:.................. $17.27

Thank you for your purchase!`;
}

export default function CameraScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setCurrentScan, setProcessing } = useScannerStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessingLocal] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // In production, request camera permission here
    // For demo, we'll simulate having permission
    setHasPermission(true);
  }, []);

  const handleCapture = async () => {
    if (isProcessing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate capturing an image
    // In production: await cameraRef.current.takePictureAsync()
    const mockImageUri = 'mock://captured_image_' + Date.now();

    setIsProcessingLocal(true);
    setProcessing(true);

    try {
      // Perform OCR
      const extractedText = await performOCR(mockImageUri);

      // Store the scan data
      setCurrentScan(mockImageUri, extractedText);

      // Navigate to preview
      router.push('/(tabs)/scanner/preview');
    } catch (error) {
      console.error('OCR failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessingLocal(false);
      setProcessing(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismiss();
  };

  const handleGallery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production: open image picker
    Alert.alert('Gallery', 'Image picker would open here. For demo, tap the capture button.');
  };

  const handleFlashToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode((prev) => {
      switch (prev) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        default:
          return 'off';
      }
    });
  };

  const handleFlipCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production: flip camera
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-off" size={64} color={colors.textMuted} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Access Required</Text>
          <Text style={[styles.permissionText, { color: colors.textMuted }]}>
            Please enable camera permissions in your device settings to scan documents.
          </Text>
          <Button
            title="Open Settings"
            onPress={() => setShowPermissionModal(true)}
            style={styles.permissionButton}
          />
          <Button
            title="Go Back"
            onPress={handleClose}
            variant="secondary"
            style={styles.permissionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {/* Simulated camera feed with overlay */}
        <View style={styles.cameraFeed}>
          {/* Document guide overlay */}
          <View style={styles.overlay}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {/* Guide text */}
            <View style={styles.guideContainer}>
              <Text style={styles.guideText}>Position document within frame</Text>
            </View>
          </View>

          {/* Processing overlay */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <View style={styles.processingCard}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingText}>Extracting text...</Text>
                <Text style={styles.processingSubtext}>This may take a few seconds</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.flashButton} onPress={handleFlashToggle}>
          <Ionicons
            name={flashMode === 'on' ? 'flash' : flashMode === 'off' ? 'flash-off' : 'flash-auto'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.galleryButton} onPress={handleGallery}>
          <Ionicons name="images-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureRing} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
          <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Permission Modal */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPermissionModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Ionicons name="settings-outline" size={48} color={colors.primary} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enable Camera Access</Text>
            <Text style={[styles.modalText, { color: colors.textMuted }]}>
              Go to Settings → MobileClaw → Camera and enable access.
            </Text>
            <Button
              title="OK"
              onPress={() => setShowPermissionModal(false)}
              style={styles.modalButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFeed: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
    borderBottomRightRadius: 8,
  },
  guideContainer: {
    position: 'absolute',
    bottom: 100,
  },
  guideText: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    alignItems: 'center',
    padding: 32,
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  processingSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#000',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    marginTop: 16,
    minWidth: 160,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 320,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 24,
    minWidth: 100,
  },
});