/**
 * OpenClaw Mobile - Chat Store
 * Manages chat messages and WebSocket connection to OpenClaw gateway
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatState } from '../types';

// ============================================
// Message ID Generator
// ============================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Chat Store
// ============================================

interface ChatStore extends ChatState {
  // Connection
  ws: WebSocket | null;
  gatewayUrl: string;
  gatewayToken: string;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // Actions
  setGatewayConfig: (url: string, token: string) => void;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (id: string, status: Message['status']) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // State
      messages: [],
      isConnected: false,
      isTyping: false,
      error: null,
      ws: null,
      gatewayUrl: '',
      gatewayToken: '',
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      
      /**
       * Configure gateway connection
       */
      setGatewayConfig: (url, token) => {
        set({ gatewayUrl: url, gatewayToken: token });
      },
      
      /**
       * Connect to OpenClaw gateway via WebSocket
       */
      connect: () => {
        const { gatewayUrl, gatewayToken, ws: existingWs, reconnectAttempts, maxReconnectAttempts } = get();
        
        // Don't connect if no config
        if (!gatewayUrl || !gatewayToken) {
          set({ error: 'Gateway not configured' });
          return;
        }
        
        // Close existing connection
        if (existingWs) {
          existingWs.close();
        }
        
        // Check reconnect limit
        if (reconnectAttempts >= maxReconnectAttempts) {
          set({ error: 'Max reconnection attempts reached' });
          return;
        }
        
        try {
          // Build WebSocket URL with auth
          const wsUrl = `${gatewayUrl.replace('http', 'ws')}/ws?token=${gatewayToken}`;
          const ws = new WebSocket(wsUrl);
          
          ws.onopen = () => {
            console.log('WebSocket connected');
            set({ 
              isConnected: true, 
              error: null, 
              reconnectAttempts: 0,
              ws,
            });
          };
          
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              switch (data.type) {
                case 'message':
                  // Incoming message from assistant
                  const assistantMessage: Message = {
                    id: generateMessageId(),
                    role: 'assistant',
                    content: data.content,
                    timestamp: Date.now(),
                    status: 'sent',
                  };
                  get().addMessage(assistantMessage);
                  get().setTyping(false);
                  break;
                  
                case 'typing':
                  get().setTyping(data.isTyping);
                  break;
                  
                case 'status':
                  // Connection status update
                  console.log('Status update:', data);
                  break;
                  
                case 'error':
                  get().setError(data.message);
                  break;
              }
            } catch (err) {
              console.error('Failed to parse WebSocket message:', err);
            }
          };
          
          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            set({ error: 'Connection error' });
          };
          
          ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            set({ isConnected: false, ws: null });
            
            // Auto-reconnect with exponential backoff
            if (event.code !== 1000) { // Not a normal close
              const { reconnectAttempts } = get();
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
              
              set({ reconnectAttempts: reconnectAttempts + 1 });
              
              setTimeout(() => {
                get().connect();
              }, delay);
            }
          };
          
          set({ ws });
        } catch (err) {
          console.error('Failed to create WebSocket:', err);
          set({ error: 'Failed to connect' });
        }
      },
      
      /**
       * Disconnect from gateway
       */
      disconnect: () => {
        const { ws } = get();
        if (ws) {
          ws.close(1000, 'User disconnect');
        }
        set({ 
          isConnected: false, 
          ws: null, 
          reconnectAttempts: get().maxReconnectAttempts, // Prevent auto-reconnect
        });
      },
      
      /**
       * Send a message to the assistant
       */
      sendMessage: (content) => {
        const { ws, isConnected } = get();
        
        // Create optimistic message
        const message: Message = {
          id: generateMessageId(),
          role: 'user',
          content,
          timestamp: Date.now(),
          status: 'sending',
        };
        
        get().addMessage(message);
        
        if (!isConnected || !ws) {
          get().updateMessageStatus(message.id, 'error');
          get().setError('Not connected to gateway');
          return;
        }
        
        try {
          ws.send(JSON.stringify({
            type: 'message',
            content,
          }));
          get().updateMessageStatus(message.id, 'sent');
          get().setTyping(true); // Assistant will be typing
        } catch (err) {
          console.error('Failed to send message:', err);
          get().updateMessageStatus(message.id, 'error');
          get().setError('Failed to send message');
        }
      },
      
      /**
       * Add a message to the list
       */
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },
      
      /**
       * Update message status
       */
      updateMessageStatus: (id, status) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, status } : msg
          ),
        }));
      },
      
      /**
       * Set typing indicator
       */
      setTyping: (typing) => {
        set({ isTyping: typing });
      },
      
      /**
       * Set error message
       */
      setError: (error) => {
        set({ error });
      },
      
      /**
       * Clear all messages
       */
      clearMessages: () => {
        set({ messages: [] });
      },
    }),
    {
      name: 'openclaw-chat',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-100), // Keep last 100 messages
        gatewayUrl: state.gatewayUrl,
        gatewayToken: state.gatewayToken,
      }),
    }
  )
);
