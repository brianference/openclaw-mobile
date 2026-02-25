import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  pickImage,
  pickMultipleImages,
  takePhoto,
  pickVideo,
  recordVideo,
  pickDocument,
  pickMultipleDocuments,
  uploadFile,
  generateThumbnail,
  validateFile,
} from '../lib/fileUpload';
import { MessageAttachment } from '../types';

interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onAttachmentSelected: (attachment: MessageAttachment) => void;
  messageId: string;
  userId: string;
}

interface FilePreview {
  uri: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size: number;
  thumbnailUri?: string;
}

export function AttachmentPicker({
  visible,
  onClose,
  onAttachmentSelected,
  messageId,
  userId,
}: AttachmentPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<FilePreview | null>(null);

  const handleUpload = async (
    file: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset
  ) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      Alert.alert('Invalid File', validation.error || 'Please select a valid file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate thumbnail for images
      let thumbnailUri: string | undefined;
      if ('uri' in file && !('name' in file)) {
        // ImagePicker asset
        thumbnailUri = await generateThumbnail(file.uri);
      }

      // Show preview
      setPreview({
        uri: file.uri,
        type: 'name' in file ? 'document' : ('type' in file && file.type === 'video' ? 'video' : 'image'),
        name: 'name' in file ? file.name : `image_${Date.now()}.jpg`,
        size: 'size' in file ? (file.size || 0) : (file.fileSize || 0),
        thumbnailUri,
      });

      const result = await uploadFile(file, messageId, userId, {
        onProgress: (progress) => setUploadProgress(progress),
        compress: true,
      });

      if (result.success && result.attachment) {
        onAttachmentSelected(result.attachment);
        setPreview(null);
        onClose();
      } else {
        Alert.alert('Upload Failed', result.error || 'Failed to upload file');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePickImage = async () => {
    try {
      const asset = await pickImage();
      if (asset) {
        await handleUpload(asset);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const asset = await takePhoto();
      if (asset) {
        await handleUpload(asset);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to take photo');
    }
  };

  const handlePickVideo = async () => {
    try {
      const asset = await pickVideo();
      if (asset) {
        await handleUpload(asset);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick video');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const asset = await recordVideo();
      if (asset) {
        await handleUpload(asset);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to record video');
    }
  };

  const handlePickDocument = async () => {
    try {
      const asset = await pickDocument();
      if (asset) {
        await handleUpload(asset);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick document');
    }
  };

  const handleCancel = () => {
    if (uploading) {
      Alert.alert(
        'Cancel Upload',
        'Are you sure you want to cancel the upload?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => {
            setUploading(false);
            setUploadProgress(0);
            setPreview(null);
          }},
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Attachment</Text>
            <TouchableOpacity onPress={handleCancel} disabled={uploading}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {uploading && preview ? (
            <View style={styles.uploadingContainer}>
              {preview.type === 'image' && preview.thumbnailUri && (
                <Image
                  source={{ uri: preview.thumbnailUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.uploadingText}>Uploading {preview.name}...</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{uploadProgress}%</Text>
              <ActivityIndicator size="large" color="#667eea" style={styles.spinner} />
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.option} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={32} color="#667eea" />
                <Text style={styles.optionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={handlePickImage}>
                <Ionicons name="images" size={32} color="#667eea" />
                <Text style={styles.optionText}>Photo Library</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={handleRecordVideo}>
                <Ionicons name="videocam" size={32} color="#667eea" />
                <Text style={styles.optionText}>Record Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={handlePickVideo}>
                <Ionicons name="film" size={32} color="#667eea" />
                <Text style={styles.optionText}>Video Library</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={handlePickDocument}>
                <Ionicons name="document-text" size={32} color="#667eea" />
                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Supported: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV), Documents (PDF, TXT, MD, DOC, DOCX)
            </Text>
            <Text style={styles.infoText}>Maximum file size: 50MB</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  option: {
    width: '48%',
    aspectRatio: 1.2,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 16,
  },
  spinner: {
    marginTop: 16,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    textAlign: 'center',
  },
});
