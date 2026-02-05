/**
 * OpenClaw Mobile - Chat Screen
 * Real-time AI chat with OpenClaw backend
 */

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../src/store/chat';
import { useTheme } from '../../src/store/theme';
import { Message } from '../../src/types';

// ============================================
// Message Bubble Component
// ============================================

interface MessageBubbleProps {
  message: Message;
  colors: any;
}

function MessageBubble({ message, colors }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userBubble : styles.assistantBubble,
      { 
        backgroundColor: isUser ? colors.accent : colors.surface,
        borderColor: isUser ? colors.accent : colors.border,
      }
    ]}>
      <Text style={[
        styles.messageText,
        { color: isUser ? '#ffffff' : colors.text }
      ]}>
        {message.content}
      </Text>
      
      {/* Status indicator for user messages */}
      {isUser && message.status && (
        <View style={styles.statusContainer}>
          {message.status === 'sending' && (
            <Ionicons name="time-outline" size={12} color="#ffffff80" />
          )}
          {message.status === 'sent' && (
            <Ionicons name="checkmark" size={12} color="#ffffff80" />
          )}
          {message.status === 'error' && (
            <Ionicons name="alert-circle" size={12} color="#ff6b6b" />
          )}
        </View>
      )}
    </View>
  );
}

// ============================================
// Typing Indicator Component
// ============================================

function TypingIndicator({ colors }: { colors: any }) {
  return (
    <View style={[styles.typingContainer, { backgroundColor: colors.surface }]}>
      <View style={[styles.typingDot, { backgroundColor: colors.textDim }]} />
      <View style={[styles.typingDot, styles.typingDotDelay1, { backgroundColor: colors.textDim }]} />
      <View style={[styles.typingDot, styles.typingDotDelay2, { backgroundColor: colors.textDim }]} />
    </View>
  );
}

// ============================================
// Chat Screen
// ============================================

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    messages, 
    isConnected, 
    isTyping, 
    error,
    connect,
    sendMessage,
    gatewayUrl,
  } = useChatStore();
  
  const { colors } = useTheme();
  
  // Connect on mount
  useEffect(() => {
    if (gatewayUrl) {
      connect();
    }
  }, [gatewayUrl]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  /**
   * Handle send message
   */
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    
    sendMessage(text);
    setInputText('');
  };
  
  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Welcome to OpenClaw
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>
        {isConnected 
          ? 'Send a message to start chatting'
          : 'Configure gateway in Settings to connect'
        }
      </Text>
    </View>
  );
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Connection Status Bar */}
      {!isConnected && gatewayUrl && (
        <View style={[styles.statusBar, { backgroundColor: colors.warning }]}>
          <Ionicons name="cloud-offline" size={16} color="#000" />
          <Text style={styles.statusBarText}>Disconnected</Text>
          <TouchableOpacity onPress={connect}>
            <Text style={styles.statusBarAction}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Error Banner */}
      {error && (
        <View style={[styles.errorBar, { backgroundColor: colors.error }]}>
          <Text style={styles.errorBarText}>{error}</Text>
        </View>
      )}
      
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} colors={colors} />
        )}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.messagesListEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={isTyping ? <TypingIndicator colors={colors} /> : null}
      />
      
      {/* Input Area */}
      <View style={[styles.inputArea, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      }]}>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={4000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() ? colors.accent : colors.border }
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() ? '#ffffff' : colors.textMuted} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  statusBarText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBarAction: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  errorBarText: {
    color: '#ffffff',
    fontSize: 14,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messagesListEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  typingDotDelay1: {
    opacity: 0.4,
  },
  typingDotDelay2: {
    opacity: 0.2,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
