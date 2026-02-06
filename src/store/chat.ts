import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message, Conversation } from '../types';

const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;

  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  setActiveConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isTyping: false,
  isLoading: false,

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
    set({ activeConversation: conversation, messages: [] });
    get().fetchMessages(conversation.id);
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    set({
      messages: (data as Message[]) || [],
      isLoading: false,
    });
  },

  sendMessage: async (content) => {
    const { activeConversation, messages } = get();
    if (!activeConversation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content,
      conversation_id: activeConversation.id,
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    set((state) => ({ messages: [...state.messages, userMessage] }));

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        user_id: user.id,
        role: 'user',
        content,
      })
      .select()
      .maybeSingle();

    if (error || !data) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === userMessage.id ? { ...m, status: 'error' as const } : m
        ),
      }));
      return;
    }

    const savedUserMsg = data as Message;
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === userMessage.id ? { ...savedUserMsg, status: 'sent' as const } : m
      ),
    }));

    set({ isTyping: true });

    try {
      const chatMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      const response = await fetch(`${FUNCTIONS_URL}/chat-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          messages: chatMessages,
          conversationId: activeConversation.id,
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
    } catch {
      set({ isTyping: false });

      const fallbackContent = generateFallbackResponse(content);
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

  reset: () => {
    set({
      conversations: [],
      activeConversation: null,
      messages: [],
      isTyping: false,
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
