import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  ActionSheetIOS,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useChatStore } from '../../../src/store/chat';
import { useAuthStore } from '../../../src/store/auth';
import { useSubscriptionStore } from '../../../src/store/subscription';
import { useToast } from '../../../src/components/Toast';
import { useTheme, Theme } from '../../../src/store/theme';
import { Message } from '../../../src/types';
import { getAttachmentUrl, takePhoto, pickVideo, recordVideo, validateFile } from '../../../src/lib/fileUpload';
import UploadProgressIndicator, { UploadProgress } from '../../../src/components/UploadProgressIndicator';
import { getDatabase } from '../../../src/lib/messageDatabase';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StreamingCursor({ colors }: { colors: Theme }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 450 }),
        withTiming(1, { duration: 450 })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[styles.streamingCursor, { backgroundColor: colors.primary }, style]} />
  );
}

function MessageBubble({ message, colors }: { message: Message; colors: Theme }) {
  const isUser = message.role === 'user';
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (message.attachments && message.attachments.length > 0) {
      message.attachments.forEach(async (att) => {
        const url = await getAttachmentUrl(att.storage_path);
        if (url) {
          setImageUrls(prev => ({ ...prev, [att.id]: url }));
        }
      });
    }
  }, [message.attachments]);

  const mdStyles = {
    body: { color: isUser ? '#fff' : colors.text, fontSize: 15, lineHeight: 22 },
    strong: { fontWeight: '700' as const },
    em: { fontStyle: 'italic' as const },
    code_inline: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : colors.surface2,
      color: isUser ? '#fff' : colors.primaryLight,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      fontSize: 13,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    fence: {
      backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : colors.bg,
      borderRadius: 8,
      padding: 12,
      marginVertical: 6,
    },
    code_block: {
      color: isUser ? '#e2e8f0' : colors.text,
      fontSize: 13,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    paragraph: { marginVertical: 2 },
    link: { color: isUser ? '#93c5fd' : colors.accent },
  };

  return (
    <View style={[
      styles.bubble,
      isUser ? styles.bubbleUser : styles.bubbleAssistant,
      { backgroundColor: isUser ? colors.primary : colors.surface },
    ]}>
      {!isUser && (
        <View style={[styles.avatarSmall, { backgroundColor: colors.primaryBg }]}>
          <Ionicons name="flash" size={12} color={colors.primary} />
        </View>
      )}
      <View style={styles.bubbleContent}>
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsWrap}>
            {message.attachments.map((att) => (
              <View key={att.id} style={[styles.attachmentItem, { backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : colors.bg }]}>
                {att.file_type === 'image' && imageUrls[att.id] ? (
                  <Image source={{ uri: imageUrls[att.id] }} style={styles.attachmentImage} resizeMode="cover" />
                ) : att.file_type === 'video' ? (
                  <View style={styles.fileAttachment}>
                    <Ionicons name="videocam" size={20} color={isUser ? '#fff' : colors.primary} />
                    <Text style={[styles.fileName, { color: isUser ? '#fff' : colors.text }]} numberOfLines={1}>
                      {att.file_name}
                    </Text>
                    <Text style={[styles.fileSize, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
                      {(att.file_size / (1024 * 1024)).toFixed(1)}MB
                    </Text>
                  </View>
                ) : (
                  <View style={styles.fileAttachment}>
                    <Ionicons 
                      name={att.mime_type?.includes('pdf') ? 'document-text' : 'document'} 
                      size={20} 
                      color={isUser ? '#fff' : colors.text} 
                    />
                    <Text style={[styles.fileName, { color: isUser ? '#fff' : colors.text }]} numberOfLines={1}>
                      {att.file_name}
                    </Text>
                    <Text style={[styles.fileSize, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
                      {(att.file_size / 1024).toFixed(0)}KB
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
        {isUser ? (
          <Text style={[styles.messageText, { color: '#fff' }]}>{message.content}</Text>
        ) : (
          <>
            <Markdown style={mdStyles}>{message.content}</Markdown>
            {message.isStreaming && <StreamingCursor colors={colors} />}
          </>
        )}
        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
            {formatTime(message.created_at)}
          </Text>
          {isUser && message.status === 'failed' && (
            <Ionicons name="alert-circle" size={12} color="#ff6b6b" />
          )}
        </View>
      </View>
    </View>
  );
}

function AnimatedDot({ delay, color }: { delay: number; color: string }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

function TypingDots({ colors }: { colors: Theme }) {
  return (
    <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatarSmall, { backgroundColor: colors.primaryBg }]}>
        <Ionicons name="flash" size={12} color={colors.primary} />
      </View>
      <View style={styles.dotsWrap}>
        <AnimatedDot delay={0} color={colors.textMuted} />
        <AnimatedDot delay={150} color={colors.textMuted} />
        <AnimatedDot delay={300} color={colors.textMuted} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<(ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset)[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const listRef = useRef<FlatList>(null);
  const { colors } = useTheme();
  const { profile, fetchProfile } = useAuthStore();
  const { canCreateConversation } = useSubscriptionStore();
  const toast = useToast();
  const {
    messages,
    isTyping,
    activeConversation,
    conversations,
    fetchConversations,
    createConversation,
    setActiveConversation,
    sendMessage,
    renameConversation,
    deleteConversation,
    isLoading,
    activeUploads,
    cancelUpload,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // US-061: Enhanced file picker with support for images, videos, and documents
  const handlePickFile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const showPicker = () => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Photo Library', 'Take Photo', 'Choose Video', 'Record Video', 'Choose Document'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) await handlePickImage();
            if (buttonIndex === 2) await handleTakePhoto();
            if (buttonIndex === 3) await handlePickVideo();
            if (buttonIndex === 4) await handleRecordVideo();
            if (buttonIndex === 5) await handlePickDocument();
          }
        );
      } else {
        Alert.alert('Add Attachment', 'Choose file type', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Image', onPress: handlePickImage },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Video', onPress: handlePickVideo },
          { text: 'Record Video', onPress: handleRecordVideo },
          { text: 'Document', onPress: handlePickDocument },
        ]);
      }
    };

    showPicker();
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFiles(prev => [...prev, result.assets[0]]);
        toast.show('Image added', 'success');
      }
    } catch (error) {
      toast.show('Failed to pick image', 'error');
    }
  };

  // US-061: Take photo with camera
  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto();
      if (result) {
        const validation = validateFile(result);
        if (!validation.valid) {
          toast.show(validation.error || 'Invalid file', 'error');
          return;
        }
        setSelectedFiles(prev => [...prev, result]);
        toast.show('Photo added', 'success');
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Failed to take photo', 'error');
    }
  };

  // US-061: Pick video from gallery
  const handlePickVideo = async () => {
    try {
      const result = await pickVideo();
      if (result) {
        const validation = validateFile(result);
        if (!validation.valid) {
          toast.show(validation.error || 'Invalid file', 'error');
          return;
        }
        setSelectedFiles(prev => [...prev, result]);
        toast.show('Video added', 'success');
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Failed to pick video', 'error');
    }
  };

  // US-061: Record video with camera
  const handleRecordVideo = async () => {
    try {
      const result = await recordVideo();
      if (result) {
        const validation = validateFile(result);
        if (!validation.valid) {
          toast.show(validation.error || 'Invalid file', 'error');
          return;
        }
        setSelectedFiles(prev => [...prev, result]);
        toast.show('Video added', 'success');
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Failed to record video', 'error');
    }
  };

  // US-061: Pick document - now supports all document types (PDF, TXT, MD, DOC, DOCX)
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'text/markdown',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const validation = validateFile(result.assets[0]);
        if (!validation.valid) {
          toast.show(validation.error || 'Invalid file', 'error');
          return;
        }
        setSelectedFiles(prev => [...prev, result.assets[0]]);
        toast.show('Document added', 'success');
      }
    } catch (error) {
      toast.show('Failed to pick document', 'error');
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if ((!text && selectedFiles.length === 0) || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');
    const filesToSend = [...selectedFiles];
    setSelectedFiles([]);

    if (!activeConversation) {
      if (!canCreateConversation(conversations.length)) {
        toast.show('Conversation limit reached. Upgrade your plan.', 'error');
        return;
      }
      const conv = await createConversation(text.slice(0, 40) || 'New Chat');
      if (!conv) return;
    }
    await sendMessage(text || '(Attachment)', filesToSend);
    fetchProfile();
  };

  const handleDeleteConversation = (id: string, title: string) => {
    Alert.alert('Delete Chat', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(id) },
    ]);
  };

  const handleRenameConversation = () => {
    if (!activeConversation) return;
    Alert.prompt(
      'Rename Chat',
      'Enter a new title:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: (newTitle?: string) => {
            if (newTitle?.trim()) {
              renameConversation(activeConversation.id, newTitle.trim());
              toast.show('Chat renamed', 'success');
            }
          },
        },
      ],
      'plain-text',
      activeConversation.title
    );
  };

  // US-067: Search messages
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const db = await getDatabase();
      const results = await db.searchMessages(query, 20);
      setSearchResults(results.map(r => ({
        id: r.id,
        conversation_id: r.conversation_id,
        role: r.role as 'user' | 'assistant',
        content: r.snippet, // Use snippet with search highlights
        created_at: r.timestamp,
        status: 'sent' as const,
      })));
    } catch (err) {
      toast.show('Search failed', 'error');
      console.error('Search error:', err);
    }
  };

  // US-067: Export conversation
  const handleExport = async (format: 'json' | 'txt' | 'csv') => {
    if (!activeConversation) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toast.show('Exporting...', 'info');
    
    try {
      const db = await getDatabase();
      let content = '';
      let filename = '';
      
      switch (format) {
        case 'json':
          content = await db.exportToJSON(activeConversation.id);
          filename = `chat-${activeConversation.id}-${Date.now()}.json`;
          break;
        case 'txt':
          content = await db.exportToTXT(activeConversation.id);
          filename = `chat-${activeConversation.id}-${Date.now()}.txt`;
          break;
        case 'csv':
          content = await db.exportToCSV(activeConversation.id);
          filename = `chat-${activeConversation.id}-${Date.now()}.csv`;
          break;
      }
      
      const path = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain',
          dialogTitle: `Export Chat as ${format.toUpperCase()}`,
        });
        toast.show('Exported successfully', 'success');
      } else {
        toast.show(`Saved to ${filename}`, 'success');
      }
    } catch (err) {
      toast.show('Export failed', 'error');
      console.error('Export error:', err);
    }
  };

  if (!activeConversation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.emptyCenter}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="chatbubbles" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>OpenClaw AI</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>
            Your intelligent assistant for coding, writing, analysis, and brainstorming
          </Text>

          {profile && (
            <View style={[styles.creditsBanner, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="flash" size={16} color={colors.primary} />
              <Text style={[styles.creditsLabel, { color: colors.primary }]}>
                {profile.credits} credits remaining
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.newChatBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (!canCreateConversation(conversations.length)) {
                toast.show('Conversation limit reached. Upgrade your plan.', 'error');
                return;
              }
              createConversation();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.newChatBtnText}>New Conversation</Text>
          </TouchableOpacity>

          {conversations.length > 0 && (
            <FlatList
              style={styles.recentSection}
              data={conversations.slice(0, 10)}
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchConversations} tintColor={colors.primary} />}
              ListHeaderComponent={
                <Text style={[styles.recentLabel, { color: colors.textMuted }]}>RECENT</Text>
              }
              renderItem={({ item: conv }) => (
                <TouchableOpacity
                  style={[styles.recentItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setActiveConversation(conv)}
                  onLongPress={() => handleDeleteConversation(conv.id, conv.title)}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={colors.textDim} />
                  <View style={styles.recentInfo}>
                    <Text style={[styles.recentText, { color: colors.text }]} numberOfLines={1}>
                      {conv.title}
                    </Text>
                    <Text style={[styles.recentDate, { color: colors.textMuted }]}>
                      {new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.chatHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => useChatStore.setState({ activeConversation: null, messages: [] })}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatHeaderInfo}
          onPress={Platform.OS === 'ios' ? handleRenameConversation : undefined}
          activeOpacity={0.7}
        >
          <Text style={[styles.chatHeaderTitle, { color: colors.text }]} numberOfLines={1}>
            {activeConversation.title}
          </Text>
        </TouchableOpacity>
        {profile && (
          <View style={[styles.creditsChip, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="flash" size={12} color={colors.primary} />
            <Text style={[styles.creditsChipText, { color: colors.primary }]}>{profile.credits}</Text>
          </View>
        )}
        
        {/* US-067: Search button */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setSearchVisible(!searchVisible)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={searchVisible ? "close" : "search"} size={22} color={colors.text} />
        </TouchableOpacity>
        
        {/* US-067: Export button */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            if (Platform.OS === 'ios') {
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: ['Cancel', 'Export as JSON', 'Export as TXT', 'Export as CSV'],
                  cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                  if (buttonIndex === 1) await handleExport('json');
                  if (buttonIndex === 2) await handleExport('txt');
                  if (buttonIndex === 3) await handleExport('csv');
                }
              );
            } else {
              Alert.alert('Export Conversation', 'Choose export format:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'JSON', onPress: () => handleExport('json') },
                { text: 'TXT', onPress: () => handleExport('txt') },
                { text: 'CSV', onPress: () => handleExport('csv') },
              ]);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="download-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* US-067: Search overlay */}
      {searchVisible && (
        <View style={[styles.searchOverlay, { backgroundColor: colors.bg }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search messages..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) => `search-${idx}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.searchResult, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSearchVisible(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    toast.show('Jump to message (coming soon)', 'info');
                  }}
                >
                  <View style={styles.searchResultHeader}>
                    <Ionicons 
                      name={item.role === 'user' ? 'person' : 'flash'} 
                      size={14} 
                      color={item.role === 'user' ? colors.primary : colors.accent} 
                    />
                    <Text style={[styles.searchResultRole, { color: colors.textMuted }]}>
                      {item.role === 'user' ? 'You' : 'Assistant'}
                    </Text>
                    <Text style={[styles.searchResultTime, { color: colors.textMuted }]}>
                      {formatTime(item.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.searchResultText, { color: colors.text }]} numberOfLines={3}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : searchQuery.length >= 2 ? (
            <View style={styles.emptyCenter}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptySearchText, { color: colors.textDim }]}>
                No results for "{searchQuery}"
              </Text>
            </View>
          ) : searchQuery.length > 0 ? (
            <View style={styles.emptyCenter}>
              <Text style={[styles.emptySearchText, { color: colors.textDim }]}>
                Type at least 2 characters to search
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} colors={colors} />}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.messagesListEmpty,
        ]}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={styles.emptyCenter}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.chatEmptyText, { color: colors.textDim }]}>
                Start the conversation
              </Text>
            </View>
          )
        }
        ListFooterComponent={isTyping ? <TypingDots colors={colors} /> : null}
      />

      {/* US-066: Upload progress indicator */}
      <UploadProgressIndicator 
        uploads={Array.from(activeUploads.values())}
        onCancel={cancelUpload}
      />

      <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {selectedFiles.length > 0 && (
          <View style={styles.filesPreview}>
            {selectedFiles.map((file, index) => {
              const isDocPicker = 'name' in file;
              const mimeType = isDocPicker ? file.mimeType : file.mimeType;
              const fileName = isDocPicker ? file.name : 'Image';
              
              // US-061: Determine icon based on file type
              let iconName: any = 'document-text';
              if (mimeType?.startsWith('image/')) {
                iconName = 'image';
              } else if (mimeType?.startsWith('video/')) {
                iconName = 'videocam';
              } else if (mimeType?.includes('pdf')) {
                iconName = 'document-text';
              }
              
              return (
                <View key={index} style={[styles.fileChip, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name={iconName} size={14} color={colors.primary} />
                  <Text style={[styles.fileChipText, { color: colors.text }]} numberOfLines={1}>
                    {fileName}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFile(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.attachBtn, { backgroundColor: colors.bg }]}
            onPress={handlePickFile}
          >
            <Ionicons name="attach" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Message OpenClaw..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: (inputText.trim() || selectedFiles.length > 0) && !isTyping ? colors.primary : colors.border }]}
            onPress={handleSend}
            disabled={(!inputText.trim() && selectedFiles.length === 0) || isTyping}
          >
            <Ionicons name="arrow-up" size={20} color={(inputText.trim() || selectedFiles.length > 0) && !isTyping ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  chatHeaderInfo: { flex: 1 },
  chatHeaderTitle: { fontSize: 16, fontWeight: '600' },
  creditsChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  creditsChipText: { fontSize: 12, fontWeight: '700' },
  creditsBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  creditsLabel: { fontSize: 14, fontWeight: '600' },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    gap: 8,
  },
  newChatBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  recentSection: { width: '100%', marginTop: 24 },
  recentLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  recentInfo: { flex: 1 },
  recentText: { fontSize: 15 },
  recentDate: { fontSize: 11, marginTop: 2 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12 },
  messagesListEmpty: { flex: 1, justifyContent: 'center' },
  chatEmptyText: { fontSize: 15, marginTop: 12 },
  bubble: { flexDirection: 'row', maxWidth: '85%', marginBottom: 10, borderRadius: 18, padding: 14, gap: 10 },
  bubbleUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAssistant: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  avatarSmall: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  bubbleContent: { flex: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  timeText: { fontSize: 11 },
  dotsWrap: { flexDirection: 'row', gap: 4, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  streamingCursor: { width: 8, height: 16, borderRadius: 2, marginTop: 4 },
  inputArea: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  filesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    maxWidth: 150,
  },
  fileChipText: {
    fontSize: 13,
    flex: 1,
  },
  attachBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 15,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  attachmentsWrap: {
    gap: 8,
    marginBottom: 8,
  },
  attachmentItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  fileName: {
    fontSize: 13,
    flex: 1,
  },
  fileSize: {
    fontSize: 11,
    marginLeft: 8,
  },
  // US-067: Search & Export styles
  headerBtn: {
    padding: 8,
    marginLeft: 8,
  },
  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  searchResult: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  searchResultRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchResultTime: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  searchResultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptySearchText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
});
