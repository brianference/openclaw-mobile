/**
 * Upload Progress Indicator Component
 * 
 * Displays real-time file upload progress with:
 * - Circular progress indicator
 * - File size and uploaded amount
 * - Estimated time remaining
 * - Cancel button
 * - Multiple file upload support
 * 
 * @see US-066 - Implement file upload progress indicators
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface UploadProgress {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  uploadedBytes: number; // bytes
  progress: number; // 0-100
  status: 'preparing' | 'uploading' | 'uploaded' | 'failed';
  error?: string;
  startTime: number;
}

interface Props {
  uploads: UploadProgress[];
  onCancel: (uploadId: string) => void;
  onRetry?: (uploadId: string) => void;
}

export default function UploadProgressIndicator({ uploads, onCancel, onRetry }: Props) {
  if (uploads.length === 0) return null;

  return (
    <View style={styles.container}>
      {uploads.map((upload) => (
        <UploadItem 
          key={upload.id} 
          upload={upload} 
          onCancel={onCancel}
          onRetry={onRetry}
        />
      ))}
    </View>
  );
}

interface UploadItemProps {
  upload: UploadProgress;
  onCancel: (id: string) => void;
  onRetry?: (id: string) => void;
}

function UploadItem({ upload, onCancel, onRetry }: UploadItemProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calculate estimated time remaining
  const getETA = (): string => {
    if (upload.status !== 'uploading' || upload.progress === 0) {
      return '';
    }

    const elapsed = Date.now() - upload.startTime;
    const uploadSpeed = upload.uploadedBytes / (elapsed / 1000); // bytes per second
    const remaining = upload.fileSize - upload.uploadedBytes;
    const eta = remaining / uploadSpeed; // seconds

    if (eta < 60) {
      return `${Math.ceil(eta)}s remaining`;
    }
    return `${Math.ceil(eta / 60)}m remaining`;
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (upload.status) {
      case 'preparing':
        return <ActivityIndicator size="small" color="#007AFF" />;
      case 'uploading':
        return <CircularProgress progress={upload.progress} />;
      case 'uploaded':
        return <Ionicons name="checkmark-circle" size={24} color="#34C759" />;
      case 'failed':
        return <Ionicons name="close-circle" size={24} color="#FF3B30" />;
    }
  };

  // Get status text
  const getStatusText = (): string => {
    switch (upload.status) {
      case 'preparing':
        return 'Preparing...';
      case 'uploading':
        return `${formatBytes(upload.uploadedBytes)} / ${formatBytes(upload.fileSize)}`;
      case 'uploaded':
        return 'Uploaded';
      case 'failed':
        return upload.error || 'Upload failed';
    }
  };

  return (
    <Animated.View style={[styles.uploadItem, { opacity: fadeAnim }]}>
      <View style={styles.statusIcon}>
        {getStatusIcon()}
      </View>

      <View style={styles.uploadInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {upload.fileName}
        </Text>
        <Text style={styles.statusText}>
          {getStatusText()}
        </Text>
        {upload.status === 'uploading' && (
          <Text style={styles.eta}>{getETA()}</Text>
        )}
      </View>

      <View style={styles.actions}>
        {upload.status === 'uploading' && (
          <TouchableOpacity
            onPress={() => onCancel(upload.id)}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
        {upload.status === 'failed' && onRetry && (
          <TouchableOpacity
            onPress={() => onRetry(upload.id)}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// Simple activity indicator (no external deps)
function ActivityIndicator({ size, color }: { size: 'small' | 'large'; color: string }) {
  const [rotation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerSize = size === 'small' ? 20 : 36;

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name="sync" size={spinnerSize} color={color} />
    </Animated.View>
  );
}

// Circular progress indicator
function CircularProgress({ progress }: { progress: number }) {
  const size = 24;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // SVG not available in React Native, use simpler approach
  // Show percentage text instead of actual circle
  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above message input
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  eta: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  actions: {
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
});
