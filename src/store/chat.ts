import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message, Conversation, MessageAttachment, APIEndpointConfig } from '../types';
import { uploadFile, getAttachmentUrl, deleteAttachment } from '../lib/fileUpload';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const DEFAULT_FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

interface QueuedMessage {
  content: string;
  attachments?: (ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset)[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  messageQueue: QueuedMessage[];
  isProcessingQueue: boolean;
  customEndpoint: APIEndpointConfig | null;

  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  setActiveConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, files?: (ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset)[]) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setCustomEndpoint: (config: APIEndpointConfig) => void;
  processQueue: () => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  messageQueue: [],
  isProcessingQueue: false,
  customEndpoint: null,

  fetchConversations: async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) {
      set({ conversations: data as Conversation[] });
    }
  },

  createConversation: async (title = 'New Chat') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select()
      .maybeSingle();

    if (error || !data) return null;

    const conversation = data as Conversation;
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversation: conversation,
      messages: [],
    }));
    return conversation;
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation, messages: [], messageQueue: [] });
    get().fetchMessages(conversation.id);
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });

    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!messagesData) {
      set({ isLoading: false });
      return;
    }

    const { data: attachmentsData } = await supabase
      .from('message_attachments')
      .select('*')
      .in('message_id', messagesData.map(m => m.id));

    const attachmentsByMessage = (attachmentsData || []).reduce((acc, att) => {
      if (!acc[att.message_id]) acc[att.message_id] = [];
      acc[att.message_id].push(att as MessageAttachment);
      return acc;
    }, {} as Record<string, MessageAttachment[]>);

    const messages = messagesData.map(msg => ({
      ...msg,
      attachments: attachmentsByMessage[msg.id] || [],
    })) as Message[];

    set({ messages, isLoading: false });
  },

  sendMessage: async (content, files = []) => {
    const { activeConversation, messageQueue, isProcessingQueue } = get();
    if (!activeConversation) return;

    set((state) => ({
      messageQueue: [...state.messageQueue, { content, attachments: files }],
    }));

    if (!isProcessingQueue) {
      get().processQueue();
    }
  },

  processQueue: async () => {
    const { messageQueue, activeConversation, customEndpoint } = get();
    if (!activeConversation || messageQueue.length === 0) return;

    set({ isProcessingQueue: true });

    while (get().messageQueue.length > 0) {
      const { messageQueue: currentQueue, messages } = get();
      const queuedMsg = currentQueue[0];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) break;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) break;

      const tempId = `temp_${Date.now()}`;
      const userMessage: Message = {
        id: tempId,
        role: 'user',
        content: queuedMsg.content,
        conversation_id: activeConversation.id,
        created_at: new Date().toISOString(),
        status: 'sending',
      };

      set((state) => ({ messages: [...state.messages, userMessage] }));

      const { data: savedMsgData, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          user_id: user.id,
          role: 'user',
          content: queuedMsg.content,
          status: 'sent',
        })
        .select()
        .maybeSingle();

      if (msgError || !savedMsgData) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId ? { ...m, status: 'failed' } : m
          ),
          messageQueue: state.messageQueue.slice(1),
        }));
        continue;
      }

      const savedUserMsg = savedMsgData as Message;
      const uploadedAttachments: MessageAttachment[] = [];

      if (queuedMsg.attachments && queuedMsg.attachments.length > 0) {
        for (const file of queuedMsg.attachments) {
          const result = await uploadFile(file, savedUserMsg.id, user.id);
          if (result.success && result.attachment) {
            uploadedAttachments.push(result.attachment);
          }
        }
      }

      savedUserMsg.attachments = uploadedAttachments;

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...savedUserMsg, status: 'sent' } : m
        ),
      }));

      set({ isTyping: true });

      try {
        const chatMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: queuedMsg.content },
        ];

        const apiUrl = customEndpoint?.enabled && customEndpoint.url
          ? `${customEndpoint.url}/chat`
          : `${DEFAULT_FUNCTIONS_URL}/chat-completion`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (!customEndpoint?.enabled || customEndpoint.type === 'default') {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          headers['Apikey'] = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: chatMessages,
            conversationId: activeConversation.id,
            attachments: uploadedAttachments.map(a => ({
              type: a.file_type,
              name: a.file_name,
              url: getAttachmentUrl(a.storage_path),
            })),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to get response');
        }

        if (result.message) {
          set((state) => ({
            isTyping: false,
            messages: [...state.messages, result.message as Message],
          }));

          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', activeConversation.id);
        } else {
          set({ isTyping: false });
        }
      } catch (error) {
        set({ isTyping: false });

        const fallbackContent = customEndpoint?.enabled
          ? `Connection to ${customEndpoint.type} endpoint failed. Please check your connection settings.`
          : generateFallbackResponse(queuedMsg.content);

        const { data: fallbackMsg } = await supabase
          .from('messages')
          .insert({
            conversation_id: activeConversation.id,
            user_id: user.id,
            role: 'assistant',
            content: fallbackContent,
          })
          .select()
          .maybeSingle();

        if (fallbackMsg) {
          set((state) => ({
            messages: [...state.messages, fallbackMsg as Message],
          }));
        }

        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeConversation.id);
      }

      set((state) => ({
        messageQueue: state.messageQueue.slice(1),
      }));
    }

    set({ isProcessingQueue: false });
  },

  renameConversation: async (id, title) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title } : c
        ),
        activeConversation:
          state.activeConversation?.id === id
            ? { ...state.activeConversation, title }
            : state.activeConversation,
      }));
    }
  },

  deleteConversation: async (id) => {
    await supabase.from('messages').delete().eq('conversation_id', id);
    await supabase.from('conversations').delete().eq('id', id);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversation:
        state.activeConversation?.id === id ? null : state.activeConversation,
      messages: state.activeConversation?.id === id ? [] : state.messages,
    }));
  },

  deleteMessage: async (messageId) => {
    const message = get().messages.find(m => m.id === messageId);
    if (!message) return;

    if (message.attachments) {
      for (const att of message.attachments) {
        await deleteAttachment(att.id, att.storage_path);
      }
    }

    await supabase.from('messages').delete().eq('id', messageId);
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }));
  },

  setCustomEndpoint: (config) => {
    set({ customEndpoint: config });
  },

  reset: () => {
    set({
      conversations: [],
      activeConversation: null,
      messages: [],
      isTyping: false,
      messageQueue: [],
      isProcessingQueue: false,
    });
  },
}));

function generateFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm **OpenClaw AI**. How can I help you today?\n\n*Note: Running in offline mode. Connect to the gateway for full AI capabilities.*";
  }
  if (lower.includes('help')) {
    return "Here's what you can do:\n\n- **Chat** tab for AI conversations\n- **Board** for kanban task management\n- **Brain** for notes and brainstorming\n- **Vault** for secure storage\n\n*Running in offline mode.*";
  }
  return `I received: *"${userMessage.slice(0, 60)}${userMessage.length > 60 ? '...' : ''}"*\n\n*Running in offline mode. The Edge Function may be unavailable. Check your connection and try again.*`;
}
