import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';
import { AttachmentType, MessageAttachment } from '../types';

// US-061: Increased from 10MB to 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// US-061: Extended supported file types
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
];

interface UploadResult {
  success: boolean;
  attachment?: MessageAttachment;
  error?: string;
  progress?: number;
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
  compress?: boolean;
}

/**
 * US-061: Pick image from gallery
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access media library is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    allowsMultipleSelection: false, // US-061: Can be changed to true for multiple selection
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * US-061: Pick multiple images from gallery
 */
export async function pickMultipleImages(): Promise<ImagePicker.ImagePickerAsset[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access media library is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.8,
    allowsMultipleSelection: true,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets;
}

/**
 * US-061: Take photo with camera
 */
export async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access camera is required');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * US-061: Pick video from gallery
 */
export async function pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access media library is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    quality: 0.8,
    videoMaxDuration: 300, // 5 minutes max
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * US-061: Record video with camera
 */
export async function recordVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access camera is required');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    videoMaxDuration: 300, // 5 minutes max
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * US-061: Pick document from file system
 */
export async function pickDocument(): Promise<DocumentPicker.DocumentPickerAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      ...ALLOWED_DOCUMENT_TYPES,
      'text/*', // Catch-all for text files
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * US-061: Pick multiple documents
 */
export async function pickMultipleDocuments(): Promise<DocumentPicker.DocumentPickerAsset[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      ...ALLOWED_DOCUMENT_TYPES,
      'text/*',
    ],
    copyToCacheDirectory: true,
    multiple: true,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets;
}

/**
 * US-061: Compress image if needed (reduce size for upload)
 */
async function compressImage(uri: string): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }], // Max width 1920px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.warn('Image compression failed, using original', error);
    return uri;
  }
}

/**
 * Fetch file as blob for upload
 */
async function fetchFileAsBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Failed to fetch file');
  }
  return await response.blob();
}

/**
 * Determine attachment type from MIME type
 */
function getAttachmentType(mimeType: string): AttachmentType | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return 'video';
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType) || mimeType.startsWith('text/')) {
    return 'document';
  }
  return null;
}

/**
 * US-061: Upload file with progress tracking, compression, and error handling
 */
export async function uploadFile(
  file: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset,
  messageId: string,
  userId: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const isDocPicker = 'name' in file;
    const fileName = isDocPicker ? file.name : `image_${Date.now()}.jpg`;
    const mimeType = isDocPicker ? (file.mimeType || 'application/octet-stream') : (file.mimeType || 'image/jpeg');
    const fileSize = isDocPicker ? (file.size || 0) : (file.fileSize || 0);

    // US-061: Check 50MB size limit
    if (fileSize > MAX_FILE_SIZE) {
      return { 
        success: false, 
        error: `File size exceeds 50MB limit (${(fileSize / (1024 * 1024)).toFixed(1)}MB)` 
      };
    }

    // US-061: Validate file type
    const fileType = getAttachmentType(mimeType);
    if (!fileType) {
      const supportedTypes = 'Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV), Documents (PDF, TXT, MD, DOC, DOCX)';
      return { 
        success: false, 
        error: `Unsupported file type. Supported: ${supportedTypes}` 
      };
    }

    let uploadUri = file.uri;

    // US-061: Compress images if requested and file is large
    if (options.compress && fileType === 'image' && fileSize > 1024 * 1024) {
      options.onProgress?.(10); // Show progress
      uploadUri = await compressImage(file.uri);
    }

    const storagePath = `${userId}/${messageId}/${fileName}`;

    options.onProgress?.(25);

    // Fetch file as blob
    const blob = await fetchFileAsBlob(uploadUri);

    options.onProgress?.(50);

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(storagePath, blob, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    options.onProgress?.(75);

    // Save attachment record to database
    const { data: attachmentData, error: dbError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        mime_type: mimeType,
        file_size: fileSize,
        storage_path: storagePath,
      })
      .select()
      .maybeSingle();

    if (dbError || !attachmentData) {
      // Cleanup uploaded file if database insert fails
      await supabase.storage.from('chat-attachments').remove([storagePath]);
      return { success: false, error: 'Failed to save attachment record' };
    }

    options.onProgress?.(100);

    return { success: true, attachment: attachmentData as MessageAttachment };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get public URL for attachment
 */
export async function getAttachmentUrl(storagePath: string): Promise<string | null> {
  const { data } = supabase.storage.from('chat-attachments').getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

/**
 * Delete attachment (both storage and database record)
 */
export async function deleteAttachment(attachmentId: string, storagePath: string): Promise<boolean> {
  const { error: dbError } = await supabase
    .from('message_attachments')
    .delete()
    .eq('id', attachmentId);

  if (dbError) {
    return false;
  }

  await supabase.storage.from('chat-attachments').remove([storagePath]);
  return true;
}

/**
 * US-061: Generate thumbnail for image
 */
export async function generateThumbnail(uri: string): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.warn('Thumbnail generation failed', error);
    return uri;
  }
}

/**
 * US-061: Validate file before upload
 */
export function validateFile(
  file: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset
): { valid: boolean; error?: string } {
  const isDocPicker = 'name' in file;
  const mimeType = isDocPicker ? (file.mimeType || '') : (file.mimeType || 'image/jpeg');
  const fileSize = isDocPicker ? (file.size || 0) : (file.fileSize || 0);

  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (${(fileSize / (1024 * 1024)).toFixed(1)}MB). Maximum: 50MB`,
    };
  }

  if (!getAttachmentType(mimeType)) {
    return {
      valid: false,
      error: 'Unsupported file type',
    };
  }

  return { valid: true };
}
