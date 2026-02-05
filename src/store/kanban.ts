/**
 * OpenClaw Mobile - Kanban Store
 * Manages kanban board state with sync to web version
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { KanbanCard, KanbanColumn, KanbanState, ColumnId, Priority } from '../types';

// ============================================
// Constants
// ============================================

const KANBAN_SYNC_URL = 'https://swordtruth-kanban.netlify.app';

// Default columns
const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', cards: [] },
  { id: 'progress', title: 'In Progress', cards: [] },
  { id: 'done', title: 'Done', cards: [] },
];

// ============================================
// Encryption Utilities (matching web kanban)
// ============================================

/**
 * Derive encryption key from passphrase using SHA-256
 * Matches the web kanban's deriveKey function
 */
async function deriveKey(passphrase: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    passphrase
  );
}

/**
 * Simple XOR-based encryption for demo
 * In production, use proper AES-256-GCM via native modules
 * TODO: Implement proper AES-256-GCM encryption matching web version
 */
function xorEncrypt(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  // Base64 encode the result
  return btoa(result);
}

function xorDecrypt(encrypted: string, key: string): string {
  const data = atob(encrypted);
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

// ============================================
// Card ID Generator
// ============================================

function generateCardId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Kanban Store
// ============================================

interface KanbanStore extends KanbanState {
  // Sync config
  syncPassphrase: string | null;
  syncEnabled: boolean;
  
  // Actions
  setSyncConfig: (passphrase: string) => void;
  addCard: (columnId: ColumnId, card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void;
  moveCard: (cardId: string, fromColumn: ColumnId, toColumn: ColumnId, index?: number) => void;
  deleteCard: (cardId: string, columnId: ColumnId) => void;
  syncFromWeb: () => Promise<boolean>;
  syncToWeb: () => Promise<boolean>;
  reset: () => void;
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // State
      columns: DEFAULT_COLUMNS,
      lastSync: null,
      isSyncing: false,
      syncPassphrase: null,
      syncEnabled: false,
      
      /**
       * Configure sync with passphrase
       */
      setSyncConfig: (passphrase) => {
        set({ 
          syncPassphrase: passphrase, 
          syncEnabled: !!passphrase,
        });
      },
      
      /**
       * Add a new card to a column
       */
      addCard: (columnId, cardData) => {
        const card: KanbanCard = {
          ...cardData,
          id: generateCardId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId
              ? { ...col, cards: [...col.cards, card] }
              : col
          ),
        }));
      },
      
      /**
       * Update an existing card
       */
      updateCard: (cardId, updates) => {
        set((state) => ({
          columns: state.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId
                ? { ...card, ...updates, updatedAt: Date.now() }
                : card
            ),
          })),
        }));
      },
      
      /**
       * Move a card between columns
       */
      moveCard: (cardId, fromColumn, toColumn, index) => {
        set((state) => {
          // Find the card
          const fromCol = state.columns.find((c) => c.id === fromColumn);
          const card = fromCol?.cards.find((c) => c.id === cardId);
          
          if (!card) return state;
          
          // Remove from source, add to destination
          return {
            columns: state.columns.map((col) => {
              if (col.id === fromColumn) {
                return {
                  ...col,
                  cards: col.cards.filter((c) => c.id !== cardId),
                };
              }
              if (col.id === toColumn) {
                const newCards = [...col.cards];
                const updatedCard = { ...card, updatedAt: Date.now() };
                if (index !== undefined) {
                  newCards.splice(index, 0, updatedCard);
                } else {
                  newCards.push(updatedCard);
                }
                return { ...col, cards: newCards };
              }
              return col;
            }),
          };
        });
      },
      
      /**
       * Delete a card
       */
      deleteCard: (cardId, columnId) => {
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId
              ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
              : col
          ),
        }));
      },
      
      /**
       * Sync data from web kanban
       * TODO: Implement localStorage bridge or API
       */
      syncFromWeb: async () => {
        const { syncPassphrase, syncEnabled } = get();
        
        if (!syncEnabled || !syncPassphrase) {
          return false;
        }
        
        set({ isSyncing: true });
        
        try {
          // In a full implementation, this would:
          // 1. Fetch encrypted data from a shared backend/API
          // 2. Decrypt with passphrase
          // 3. Merge with local state
          
          // For now, just mark as synced
          set({ lastSync: Date.now(), isSyncing: false });
          return true;
        } catch (error) {
          console.error('Sync from web failed:', error);
          set({ isSyncing: false });
          return false;
        }
      },
      
      /**
       * Sync data to web kanban
       * TODO: Implement localStorage bridge or API
       */
      syncToWeb: async () => {
        const { syncPassphrase, syncEnabled, columns } = get();
        
        if (!syncEnabled || !syncPassphrase) {
          return false;
        }
        
        set({ isSyncing: true });
        
        try {
          // In a full implementation, this would:
          // 1. Encrypt current state with passphrase
          // 2. Push to shared backend/API
          
          // For now, just mark as synced
          set({ lastSync: Date.now(), isSyncing: false });
          return true;
        } catch (error) {
          console.error('Sync to web failed:', error);
          set({ isSyncing: false });
          return false;
        }
      },
      
      /**
       * Reset to default state
       */
      reset: () => {
        set({
          columns: DEFAULT_COLUMNS,
          lastSync: null,
          isSyncing: false,
        });
      },
    }),
    {
      name: 'openclaw-kanban',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        columns: state.columns,
        lastSync: state.lastSync,
        syncEnabled: state.syncEnabled,
        // Don't persist passphrase - require re-entry
      }),
    }
  )
);
