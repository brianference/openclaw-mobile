import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { AttachmentType, MessageAttachment } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const ALLOWED_MARKDOWN_TYPES = ['text/markdown', 'text/plain'];

interface UploadResult {
  success: boolean;
  attachment?: MessageAttachment;
  error?: string;
}

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access media library is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

export async function pickDocument(): Promise<DocumentPicker.DocumentPickerAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/markdown', 'text/plain'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

async function fetchFileAsBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Failed to fetch file');
  }
  return await response.blob();
}

export async function uploadFile(
  file: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset,
  messageId: string,
  userId: string
): Promise<UploadResult> {
  try {
    const isDocPicker = 'name' in file;
    const fileName = isDocPicker ? file.name : `image_${Date.now()}.jpg`;
    const mimeType = isDocPicker ? (file.mimeType || 'application/octet-stream') : (file.mimeType || 'image/jpeg');
    const fileSize = isDocPicker ? (file.size || 0) : (file.fileSize || 0);

    if (fileSize > MAX_FILE_SIZE) {
      return { success: false, error: 'File size exceeds 10MB limit' };
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isMarkdown = ALLOWED_MARKDOWN_TYPES.includes(mimeType);

    if (!isImage && !isMarkdown) {
      return { success: false, error: 'Invalid file type. Only images and markdown files are allowed' };
    }

    const fileType: AttachmentType = isImage ? 'image' : 'markdown';
    const storagePath = `${userId}/${messageId}/${fileName}`;

    const blob = await fetchFileAsBlob(file.uri);

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(storagePath, blob, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

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
      await supabase.storage.from('chat-attachments').remove([storagePath]);
      return { success: false, error: 'Failed to save attachment record' };
    }

    return { success: true, attachment: attachmentData as MessageAttachment };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAttachmentUrl(storagePath: string): Promise<string | null> {
  const { data } = supabase.storage.from('chat-attachments').getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

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
