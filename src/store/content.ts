import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ContentStatus = 'draft' | 'scheduled' | 'published';
export type ContentPlatform = 'twitter' | 'blog' | 'linkedin' | 'other';

export interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  status: ContentStatus;
  platform: ContentPlatform;
  scheduledFor?: string; // ISO
  publishedAt?: string; // ISO
  stats?: {
    views: number;
    comments: number;
    likes: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContentState {
  items: ContentItem[];
  isLoading: boolean;
  
  // CRUD operations
  fetchContent: () => Promise<void>;
  addDraft: (content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateContent: (contentId: string, updates: Partial<ContentItem>) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  
  // Publishing
  scheduleContent: (contentId: string, scheduledFor: string) => Promise<void>;
  publishContent: (contentId: string) => Promise<void>;
  
  // Stats
  getStats: () => {
    drafts: number;
    scheduled: number;
    published30d: number;
    totalReach: number;
  };
  
  // Filtering
  getContentByStatus: (status: ContentStatus | 'all') => ContentItem[];
  getContentByPlatform: (platform: ContentPlatform) => ContentItem[];
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      items: [
        // Mock data for development
        {
          id: '1',
          title: 'The Future of AI Agents',
          excerpt: 'Exploring how autonomous AI agents will transform software development...',
          body: 'Full article content would go here...',
          status: 'draft',
          platform: 'blog',
          tags: ['ai', 'agents', 'future'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Building Glassmorphic UIs',
          excerpt: 'A deep dive into modern glassmorphism design patterns...',
          body: 'Full article content would go here...',
          status: 'scheduled',
          platform: 'twitter',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          tags: ['ui', 'design', 'glassmorphism'],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Memory Systems for Developers',
          excerpt: 'How to build a second brain using mem0 and supermemory...',
          body: 'Full article content would go here...',
          status: 'published',
          platform: 'blog',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            views: 1200,
            comments: 24,
            likes: 156,
          },
          tags: ['memory', 'productivity', 'tools'],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      isLoading: false,

      fetchContent: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase
        // For now, content is persisted via middleware
        set({ isLoading: false });
      },

      addDraft: async (contentData) => {
        const newContent: ContentItem = {
          ...contentData,
          id: Date.now().toString(),
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [newContent, ...state.items], // Newest first
        }));
      },

      updateContent: async (contentId, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === contentId
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteContent: async (contentId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== contentId),
        }));
      },

      scheduleContent: async (contentId, scheduledFor) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  status: 'scheduled' as ContentStatus,
                  scheduledFor,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      },

      publishContent: async (contentId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  status: 'published' as ContentStatus,
                  publishedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      },

      getStats: () => {
        const { items } = get();
        const drafts = items.filter((item) => item.status === 'draft').length;
        const scheduled = items.filter((item) => item.status === 'scheduled').length;
        
        // Published in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const published30d = items.filter(
          (item) =>
            item.status === 'published' &&
            item.publishedAt &&
            new Date(item.publishedAt) >= thirtyDaysAgo
        ).length;
        
        // Total reach (sum of views)
        const totalReach = items
          .filter((item) => item.stats)
          .reduce((sum, item) => sum + (item.stats?.views || 0), 0);
        
        return { drafts, scheduled, published30d, totalReach };
      },

      getContentByStatus: (status) => {
        const { items } = get();
        if (status === 'all') return items;
        return items.filter((item) => item.status === status);
      },

      getContentByPlatform: (platform) => {
        const { items } = get();
        return items.filter((item) => item.platform === platform);
      },
    }),
    {
      name: 'content-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
