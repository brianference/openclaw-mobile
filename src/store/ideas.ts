import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type IdeaStatus = 'new' | 'in-progress' | 'done';
export type IdeaPriority = 'low' | 'medium' | 'high';

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  tags: string[];
  priority?: IdeaPriority;
  createdAt: string;
  updatedAt: string;
}

interface IdeasState {
  ideas: Idea[];
  isLoading: boolean;
  
  // CRUD operations
  fetchIdeas: () => Promise<void>;
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (ideaId: string) => Promise<void>;
  
  // Filtering
  getIdeasByStatus: (status: IdeaStatus | 'all') => Idea[];
  getIdeasByPriority: (priority: IdeaPriority) => Idea[];
}

export const useIdeasStore = create<IdeasState>()(
  persist(
    (set, get) => ({
      ideas: [
        // Mock data for development
        {
          id: '1',
          title: 'Mission Control Dashboard',
          description: 'Central hub for all applications with live stats and glassmorphism design',
          status: 'done',
          tags: ['dashboard', 'ui/ux', 'priority-high'],
          priority: 'high',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'AI Content Generator',
          description: 'Automated content creation for @swordtruth using Claude and GPT-4',
          status: 'in-progress',
          tags: ['ai', 'content'],
          priority: 'high',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Personal Knowledge Graph',
          description: 'Visual representation of all memories and connections using D3.js',
          status: 'new',
          tags: ['memory', 'visualization'],
          priority: 'medium',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          title: 'Agent Collaboration Platform',
          description: 'Allow multiple agents to work together on complex tasks with shared context',
          status: 'new',
          tags: ['agents', 'collaboration'],
          priority: 'low',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      isLoading: false,

      fetchIdeas: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase
        // For now, ideas are persisted via middleware
        set({ isLoading: false });
      },

      addIdea: async (ideaData) => {
        const newIdea: Idea = {
          ...ideaData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          ideas: [newIdea, ...state.ideas], // Newest first
        }));
      },

      updateIdea: async (ideaId, updates) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === ideaId
              ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
              : idea
          ),
        }));
      },

      deleteIdea: async (ideaId) => {
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== ideaId),
        }));
      },

      getIdeasByStatus: (status) => {
        const { ideas } = get();
        if (status === 'all') return ideas;
        return ideas.filter((idea) => idea.status === status);
      },

      getIdeasByPriority: (priority) => {
        const { ideas } = get();
        return ideas.filter((idea) => idea.priority === priority);
      },
    }),
    {
      name: 'ideas-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
