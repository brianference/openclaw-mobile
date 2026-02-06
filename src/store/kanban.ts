import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { KanbanCard, ColumnId, Priority } from '../types';

interface KanbanState {
  cards: KanbanCard[];
  isLoading: boolean;

  fetchCards: () => Promise<void>;
  addCard: (columnId: ColumnId, data: { title: string; description?: string; priority: Priority; tags: string[] }) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => Promise<void>;
  moveCard: (cardId: string, toColumn: ColumnId) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getColumnCards: (columnId: ColumnId) => KanbanCard[];
}

export const useKanbanStore = create<KanbanState>()((set, get) => ({
  cards: [],
  isLoading: false,

  fetchCards: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('kanban_cards')
      .select('*')
      .order('position', { ascending: true });

    set({ cards: (data as KanbanCard[]) || [], isLoading: false });
  },

  addCard: async (columnId, cardData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { cards } = get();
    const columnCards = cards.filter((c) => c.column_id === columnId);
    const position = columnCards.length;

    const { data, error } = await supabase
      .from('kanban_cards')
      .insert({
        user_id: user.id,
        title: cardData.title,
        description: cardData.description || null,
        column_id: columnId,
        priority: cardData.priority,
        tags: cardData.tags,
        position,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      set((state) => ({ cards: [...state.cards, data as KanbanCard] }));
    }
  },

  updateCard: async (cardId, updates) => {
    const { error } = await supabase
      .from('kanban_cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cardId);

    if (!error) {
      set((state) => ({
        cards: state.cards.map((c) =>
          c.id === cardId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
        ),
      }));
    }
  },

  moveCard: async (cardId, toColumn) => {
    const { error } = await supabase
      .from('kanban_cards')
      .update({ column_id: toColumn, updated_at: new Date().toISOString() })
      .eq('id', cardId);

    if (!error) {
      set((state) => ({
        cards: state.cards.map((c) =>
          c.id === cardId ? { ...c, column_id: toColumn, updated_at: new Date().toISOString() } : c
        ),
      }));
    }
  },

  deleteCard: async (cardId) => {
    await supabase.from('kanban_cards').delete().eq('id', cardId);
    set((state) => ({ cards: state.cards.filter((c) => c.id !== cardId) }));
  },

  getColumnCards: (columnId) => {
    return get().cards.filter((c) => c.column_id === columnId);
  },
}));
