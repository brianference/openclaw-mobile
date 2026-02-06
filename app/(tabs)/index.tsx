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
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useChatStore } from '../../src/store/chat';
import { useAuthStore } from '../../src/store/auth';
import { useSubscriptionStore } from '../../src/store/subscription';
import { useToast } from '../../src/components/Toast';
import { useTheme, Theme } from '../../src/store/theme';
import { Message } from '../../src/types';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message, colors }: { message: Message; colors: Theme }) {
  const isUser = message.role === 'user';
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
        {isUser ? (
          <Text style={[styles.messageText, { color: '#fff' }]}>{message.content}</Text>
        ) : (
          <Markdown style={mdStyles}>{message.content}</Markdown>
        )}
        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
            {formatTime(message.created_at)}
          </Text>
          {isUser && message.status === 'error' && (
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
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');

    if (!activeConversation) {
      if (!canCreateConversation(conversations.length)) {
        toast.show('Conversation limit reached. Upgrade your plan.', 'error');
        return;
      }
      const conv = await createConversation(text.slice(0, 40));
      if (!conv) return;
    }
    await sendMessage(text);
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
      </View>

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

      <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
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
          style={[styles.sendBtn, { backgroundColor: inputText.trim() && !isTyping ? colors.primary : colors.border }]}
          onPress={handleSend}
          disabled={!inputText.trim() || isTyping}
        >
          <Ionicons name="arrow-up" size={20} color={inputText.trim() && !isTyping ? '#fff' : colors.textMuted} />
        </TouchableOpacity>
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
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
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
});
