import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DocSection = 'projects' | 'skills' | 'agents' | 'config';

export interface Doc {
  id: string;
  title: string;
  path: string;
  section: DocSection;
  content: string; // Markdown
  updatedAt: string;
  createdAt: string;
}

interface DocsState {
  docs: Doc[];
  isLoading: boolean;
  searchQuery: string;
  
  // CRUD operations
  fetchDocs: () => Promise<void>;
  addDoc: (doc: Omit<Doc, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDoc: (docId: string, updates: Partial<Doc>) => Promise<void>;
  deleteDoc: (docId: string) => Promise<void>;
  
  // Search & filter
  setSearchQuery: (query: string) => void;
  searchDocs: (query: string) => Doc[];
  getDocsBySection: (section: DocSection) => Doc[];
  getRecentDocs: (limit?: number) => Doc[];
  getSectionStats: () => Record<DocSection, { count: number; lastUpdated: string }>;
}

export const useDocsStore = create<DocsState>()(
  persist(
    (set, get) => ({
      docs: [
        // Mock data for development
        {
          id: '1',
          title: 'Mission Control Dashboard Spec',
          path: '/projects/mission-control/',
          section: 'projects',
          content: '# Mission Control Dashboard\n\nCentral hub for all applications...',
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Designer Agent Guide',
          path: '/agents/morpheus/',
          section: 'agents',
          content: '# Designer Agent (Morpheus)\n\nThe Designer Agent creates...',
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Browser Control Skill',
          path: '/skills/browser/',
          section: 'skills',
          content: '# Browser Control\n\nControl web browsers via OpenClaw...',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          title: 'Supabase Configuration',
          path: '/config/supabase/',
          section: 'config',
          content: '# Supabase Setup\n\nConfiguration for Supabase backend...',
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      isLoading: false,
      searchQuery: '',

      fetchDocs: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase or file system
        // For now, docs are persisted via middleware
        set({ isLoading: false });
      },

      addDoc: async (docData) => {
        const newDoc: Doc = {
          ...docData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          docs: [newDoc, ...state.docs],
        }));
      },

      updateDoc: async (docId, updates) => {
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === docId
              ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
              : doc
          ),
        }));
      },

      deleteDoc: async (docId) => {
        set((state) => ({
          docs: state.docs.filter((doc) => doc.id !== docId),
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      searchDocs: (query) => {
        const { docs } = get();
        const lowerQuery = query.toLowerCase();
        return docs.filter(
          (doc) =>
            doc.title.toLowerCase().includes(lowerQuery) ||
            doc.path.toLowerCase().includes(lowerQuery) ||
            doc.content.toLowerCase().includes(lowerQuery)
        );
      },

      getDocsBySection: (section) => {
        const { docs } = get();
        return docs.filter((doc) => doc.section === section);
      },

      getRecentDocs: (limit = 5) => {
        const { docs } = get();
        return [...docs]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      getSectionStats: () => {
        const { docs } = get();
        const sections: DocSection[] = ['projects', 'skills', 'agents', 'config'];
        
        return sections.reduce((acc, section) => {
          const sectionDocs = docs.filter((doc) => doc.section === section);
          const lastUpdated = sectionDocs.length > 0
            ? sectionDocs.reduce((latest, doc) =>
                new Date(doc.updatedAt) > new Date(latest) ? doc.updatedAt : latest,
                sectionDocs[0].updatedAt
              )
            : new Date().toISOString();
          
          acc[section] = {
            count: sectionDocs.length,
            lastUpdated,
          };
          return acc;
        }, {} as Record<DocSection, { count: number; lastUpdated: string }>);
      },
    }),
    {
      name: 'docs-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
