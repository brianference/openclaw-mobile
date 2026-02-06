import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message, Conversation } from '../types';

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
    const { activeConversation } = get();
    if (!activeConversation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === userMessage.id ? { ...(data as Message), status: 'sent' as const } : m
      ),
    }));

    set({ isTyping: true });

    const assistantContent = generateLocalResponse(content);

    const { data: aiMsg } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        user_id: user.id,
        role: 'assistant',
        content: assistantContent,
      })
      .select()
      .maybeSingle();

    set((state) => ({
      isTyping: false,
      messages: aiMsg
        ? [...state.messages, aiMsg as Message]
        : state.messages,
    }));

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConversation.id);
  },

  deleteConversation: async (id) => {
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

function generateLocalResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your OpenClaw AI assistant. How can I help you today? I can assist with brainstorming, coding, writing, analysis, and much more.";
  }
  if (lower.includes('help')) {
    return "I'm here to help! You can ask me anything -- from coding questions to creative brainstorming. Try the Board tab for task management, or Brain tab for capturing ideas.";
  }
  if (lower.includes('code') || lower.includes('programming')) {
    return "I'd be happy to help with coding! Share your code or describe what you're trying to build, and I'll provide guidance, examples, or debug assistance.";
  }
  return `Thanks for your message! I've processed your request: "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}"\n\nThis is a local demo response. Connect to an OpenClaw gateway in Settings for full AI capabilities including GPT-4, Claude, and other models.`;
}
