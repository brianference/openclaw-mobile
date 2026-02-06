import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { BrainNote, NoteCategory } from '../types';

interface BrainState {
  notes: BrainNote[];
  isLoading: boolean;
  searchQuery: string;
  filterCategory: NoteCategory | 'all';

  fetchNotes: () => Promise<void>;
  addNote: (data: { title: string; content: string; category: NoteCategory; color?: string }) => Promise<void>;
  updateNote: (id: string, updates: Partial<BrainNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: NoteCategory | 'all') => void;
  getFilteredNotes: () => BrainNote[];
}

export const useBrainStore = create<BrainState>()((set, get) => ({
  notes: [],
  isLoading: false,
  searchQuery: '',
  filterCategory: 'all',

  fetchNotes: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('brain_notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    set({ notes: (data as BrainNote[]) || [], isLoading: false });
  },

  addNote: async (noteData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('brain_notes')
      .insert({
        user_id: user.id,
        title: noteData.title,
        content: noteData.content,
        category: noteData.category,
        color: noteData.color || 'default',
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      set((state) => ({ notes: [data as BrainNote, ...state.notes] }));
    }
  },

  updateNote: async (id, updates) => {
    const { error } = await supabase
      .from('brain_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
        ),
      }));
    }
  },

  deleteNote: async (id) => {
    await supabase.from('brain_notes').delete().eq('id', id);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;

    await get().updateNote(id, { pinned: !note.pinned });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCategory: (category) => set({ filterCategory: category }),

  getFilteredNotes: () => {
    const { notes, searchQuery, filterCategory } = get();
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || note.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  },
}));
