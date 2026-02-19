import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Task, TaskCategory, ReminderType, SyncStatus } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  
  // Network monitoring
  checkNetworkStatus: () => Promise<void>;
  
  // CRUD operations
  fetchTasks: () => Promise<void>;
  addTask: (data: {
    title: string;
    category: TaskCategory;
    dueDate?: string;
    reminder?: ReminderType;
    notes?: string;
  }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  toggleTaskComplete: (taskId: string) => void;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Sync operations
  syncPendingTasks: () => Promise<void>;
  markTaskSynced: (taskId: string) => void;
  
  // Filtering helpers
  getActiveTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByCategory: (category: TaskCategory | 'all') => Task[];
  getPendingTasks: () => Task[];
  searchTasks: (query: string) => Task[];
  
  // Bulk operations
  deleteAllCompleted: () => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      isOnline: true,
      pendingSyncCount: 0,

      checkNetworkStatus: async () => {
        const netInfo = await NetInfo.fetch();
        const isOnline = netInfo.isConnected ?? true;
        set({ isOnline });

        // If coming back online, sync pending tasks
        if (isOnline && get().pendingSyncCount > 0) {
          await get().syncPendingTasks();
        }
      },

      fetchTasks: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase
        // For now, tasks are persisted in AsyncStorage via middleware
        set({ isLoading: false });
      },

      addTask: async (data) => {
        const { isOnline } = get();
        const syncStatus: SyncStatus = isOnline ? 'synced' : 'offline';

        const newTask: Task = {
          id: Date.now().toString(),
          title: data.title,
          completed: false,
          category: data.category,
          dueDate: data.dueDate,
          reminder: data.reminder,
          notes: data.notes,
          syncStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
          pendingSyncCount: isOnline ? state.pendingSyncCount : state.pendingSyncCount + 1,
        }));

        // Try to sync if online
        if (isOnline) {
          // In production: await supabase.from('tasks').insert(newTask);
          get().markTaskSynced(newTask.id);
        }
      },

      updateTask: async (taskId, updates) => {
        const { isOnline } = get();
        const currentTask = get().tasks.find(t => t.id === taskId);
        const syncStatus: SyncStatus = isOnline ? 'synced' : 'pending';

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { 
                  ...task, 
                  ...updates, 
                  syncStatus: task.syncStatus === 'synced' ? syncStatus : task.syncStatus,
                  updatedAt: new Date().toISOString() 
                }
              : task
          ),
          pendingSyncCount: isOnline ? state.pendingSyncCount : state.pendingSyncCount + 1,
        }));

        // Try to sync if online
        if (isOnline) {
          // In production: await supabase.from('tasks').update(updates).eq('id', taskId);
          get().markTaskSynced(taskId);
        }
      },

      toggleTaskComplete: (taskId) => {
        const { isOnline } = get();
        const syncStatus: SyncStatus = isOnline ? 'synced' : 'pending';

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { 
                  ...task, 
                  completed: !task.completed,
                  syncStatus: task.syncStatus === 'synced' ? syncStatus : task.syncStatus,
                  updatedAt: new Date().toISOString() 
                }
              : task
          ),
          pendingSyncCount: isOnline ? state.pendingSyncCount : state.pendingSyncCount + 1,
        }));

        // Try to sync if online
        if (isOnline) {
          get().markTaskSynced(taskId);
        }
      },

      deleteTask: async (taskId) => {
        const { isOnline } = get();
        
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          pendingSyncCount: isOnline ? state.pendingSyncCount : state.pendingSyncCount + 1,
        }));

        // Try to sync if online
        if (isOnline) {
          // In production: await supabase.from('tasks').delete().eq('id', taskId);
          get().markTaskSynced(taskId);
        }
      },

      syncPendingTasks: async () => {
        const { tasks } = get();
        const pendingTasks = tasks.filter(t => t.syncStatus === 'pending' || t.syncStatus === 'offline');
        
        if (pendingTasks.length === 0) return;

        // In production: Batch sync pending tasks to Supabase
        // await supabase.from('tasks').upsert(pendingTasks.map(t => ({...t, syncStatus: 'synced'})));

        // Mark all as synced
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.syncStatus === 'pending' || task.syncStatus === 'offline'
              ? { ...task, syncStatus: 'synced' }
              : task
          ),
          pendingSyncCount: 0,
        }));
      },

      markTaskSynced: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, syncStatus: 'synced' }
              : task
          ),
          pendingSyncCount: Math.max(0, state.pendingSyncCount - 1),
        }));
      },

      getActiveTasks: () => {
        return get().tasks.filter((task) => !task.completed);
      },

      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.completed);
      },

      getPendingTasks: () => {
        return get().tasks.filter((task) => 
          task.syncStatus === 'pending' || task.syncStatus === 'offline'
        );
      },

      getTasksByCategory: (category) => {
        const { tasks } = get();
        if (category === 'all') return tasks;
        return tasks.filter((task) => task.category === category);
      },

      searchTasks: (query) => {
        const { tasks } = get();
        const lowerQuery = query.toLowerCase();
        return tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(lowerQuery) ||
            task.notes?.toLowerCase().includes(lowerQuery)
        );
      },

      deleteAllCompleted: async () => {
        const { isOnline } = get();
        
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
          pendingSyncCount: isOnline ? state.pendingSyncCount : state.pendingSyncCount + 1,
        }));

        if (isOnline) {
          // In production: await supabase.from('tasks').delete().eq('completed', true);
        }
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
