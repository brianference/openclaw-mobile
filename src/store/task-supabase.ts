/**
 * Task Store with Supabase Integration
 * 
 * Features:
 * - Bidirectional sync (local ↔ Supabase)
 * - Real-time subscriptions
 * - Offline queue support
 * - Conflict resolution (last-write-wins with version tracking)
 * - AsyncStorage as local cache
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Task, TaskCategory, ReminderType } from '../types';
import NetInfo from '@react-native-community/netinfo';

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  taskId: string;
  data?: Partial<Task>;
  timestamp: number;
  retryCount: number;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  realtimeSubscription: any | null;
  
  // CRUD operations (Supabase-enabled)
  fetchTasks: () => Promise<void>;
  addTask: (data: {
    title: string;
    category: TaskCategory;
    dueDate?: string;
    reminder?: ReminderType;
    notes?: string;
  }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Filtering helpers
  getActiveTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByCategory: (category: TaskCategory | 'all') => Task[];
  searchTasks: (query: string) => Task[];
  
  // Bulk operations
  deleteAllCompleted: () => Promise<void>;
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  processSyncQueue: () => Promise<void>;
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
  
  // Network status
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      syncQueue: [],
      isOnline: true,
      realtimeSubscription: null,

      // =====================================================================
      // FETCH TASKS (from Supabase)
      // =====================================================================
      fetchTasks: async () => {
        set({ isLoading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('No authenticated user, using local cache');
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

          if (error) throw error;

          // Convert Supabase format to app format
          const tasks: Task[] = (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            completed: row.completed,
            category: row.category,
            dueDate: row.due_date,
            reminder: row.reminder,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            version: row.version,
          }));

          set({ 
            tasks, 
            isLoading: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          set({ isLoading: false });
        }
      },

      // =====================================================================
      // ADD TASK (with offline queue)
      // =====================================================================
      addTask: async (data) => {
        const { isOnline, syncQueue } = get();
        
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: data.title,
          completed: false,
          category: data.category,
          dueDate: data.dueDate,
          reminder: data.reminder,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        };

        // Optimistic update (add to local state immediately)
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));

        // Queue for sync or sync immediately
        if (!isOnline) {
          // Offline: Add to queue
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation: 'create',
            taskId: newTask.id,
            data: newTask,
            timestamp: Date.now(),
            retryCount: 0,
          };
          
          set({ syncQueue: [...syncQueue, queueItem] });
        } else {
          // Online: Sync immediately
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
              .from('tasks')
              .insert({
                id: newTask.id,
                user_id: user.id,
                title: newTask.title,
                completed: newTask.completed,
                category: newTask.category,
                due_date: newTask.dueDate,
                reminder: newTask.reminder,
                notes: newTask.notes,
                created_at: newTask.createdAt,
                updated_at: newTask.updatedAt,
                version: newTask.version,
              });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to add task to Supabase:', error);
            
            // Add to queue for retry
            const queueItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              operation: 'create',
              taskId: newTask.id,
              data: newTask,
              timestamp: Date.now(),
              retryCount: 0,
            };
            
            set({ syncQueue: [...get().syncQueue, queueItem] });
          }
        }
      },

      // =====================================================================
      // UPDATE TASK (with offline queue)
      // =====================================================================
      updateTask: async (taskId, updates) => {
        const { isOnline, tasks, syncQueue } = get();
        
        // Optimistic update
        const updatedTasks = tasks.map((task) =>
          task.id === taskId
            ? { 
                ...task, 
                ...updates, 
                updatedAt: new Date().toISOString(),
                version: (task.version || 1) + 1,
              }
            : task
        );
        
        set({ tasks: updatedTasks });

        // Queue for sync or sync immediately
        if (!isOnline) {
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation: 'update',
            taskId,
            data: updates,
            timestamp: Date.now(),
            retryCount: 0,
          };
          
          set({ syncQueue: [...syncQueue, queueItem] });
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
              .from('tasks')
              .update({
                title: updates.title,
                completed: updates.completed,
                category: updates.category,
                due_date: updates.dueDate,
                reminder: updates.reminder,
                notes: updates.notes,
                updated_at: new Date().toISOString(),
              })
              .eq('id', taskId)
              .eq('user_id', user.id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update task in Supabase:', error);
            
            const queueItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              operation: 'update',
              taskId,
              data: updates,
              timestamp: Date.now(),
              retryCount: 0,
            };
            
            set({ syncQueue: [...get().syncQueue, queueItem] });
          }
        }
      },

      // =====================================================================
      // TOGGLE TASK COMPLETE (with offline queue)
      // =====================================================================
      toggleTaskComplete: async (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        await get().updateTask(taskId, { completed: !task.completed });
      },

      // =====================================================================
      // DELETE TASK (soft delete with offline queue)
      // =====================================================================
      deleteTask: async (taskId) => {
        const { isOnline, syncQueue } = get();
        
        // Optimistic update (remove from local state)
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));

        // Queue for sync or sync immediately
        if (!isOnline) {
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation: 'delete',
            taskId,
            timestamp: Date.now(),
            retryCount: 0,
          };
          
          set({ syncQueue: [...syncQueue, queueItem] });
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Soft delete (set deleted_at timestamp)
            const { error } = await supabase
              .from('tasks')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', taskId)
              .eq('user_id', user.id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete task in Supabase:', error);
            
            const queueItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              operation: 'delete',
              taskId,
              timestamp: Date.now(),
              retryCount: 0,
            };
            
            set({ syncQueue: [...get().syncQueue, queueItem] });
          }
        }
      },

      // =====================================================================
      // FILTERING HELPERS (unchanged)
      // =====================================================================
      getActiveTasks: () => {
        return get().tasks.filter((task) => !task.completed);
      },

      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.completed);
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

      // =====================================================================
      // DELETE ALL COMPLETED
      // =====================================================================
      deleteAllCompleted: async () => {
        const completedTasks = get().getCompletedTasks();
        
        // Delete each completed task
        await Promise.all(
          completedTasks.map((task) => get().deleteTask(task.id))
        );
      },

      // =====================================================================
      // SYNC WITH SUPABASE (manual sync)
      // =====================================================================
      syncWithSupabase: async () => {
        set({ isSyncing: true });
        
        try {
          // Process offline queue first
          await get().processSyncQueue();
          
          // Then fetch latest from Supabase
          await get().fetchTasks();
          
          set({ 
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ isSyncing: false });
        }
      },

      // =====================================================================
      // PROCESS SYNC QUEUE (offline → online sync)
      // =====================================================================
      processSyncQueue: async () => {
        const { syncQueue } = get();
        if (syncQueue.length === 0) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const processedIds: string[] = [];

        for (const item of syncQueue) {
          try {
            switch (item.operation) {
              case 'create':
                await supabase.from('tasks').insert({
                  id: item.taskId,
                  user_id: user.id,
                  ...(item.data as any),
                });
                break;
                
              case 'update':
                await supabase
                  .from('tasks')
                  .update(item.data as any)
                  .eq('id', item.taskId)
                  .eq('user_id', user.id);
                break;
                
              case 'delete':
                await supabase
                  .from('tasks')
                  .update({ deleted_at: new Date().toISOString() })
                  .eq('id', item.taskId)
                  .eq('user_id', user.id);
                break;
            }
            
            processedIds.push(item.id);
          } catch (error) {
            console.error(`Failed to process queue item ${item.id}:`, error);
            
            // Retry logic (max 3 retries)
            if (item.retryCount < 3) {
              set((state) => ({
                syncQueue: state.syncQueue.map((qi) =>
                  qi.id === item.id ? { ...qi, retryCount: qi.retryCount + 1 } : qi
                ),
              }));
            } else {
              // Max retries reached, remove from queue
              processedIds.push(item.id);
            }
          }
        }

        // Remove processed items from queue
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => !processedIds.includes(item.id)),
        }));
      },

      // =====================================================================
      // REALTIME SUBSCRIPTION
      // =====================================================================
      subscribeToRealtime: () => {
        const { realtimeSubscription } = get();
        if (realtimeSubscription) return; // Already subscribed

        const subscription = supabase
          .channel('tasks_channel')
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'tasks',
            },
            (payload: any) => {
              console.log('Realtime update:', payload);
              
              const { eventType, new: newRow, old: oldRow } = payload;
              
              if (eventType === 'INSERT') {
                const newTask: Task = {
                  id: newRow.id,
                  title: newRow.title,
                  completed: newRow.completed,
                  category: newRow.category,
                  dueDate: newRow.due_date,
                  reminder: newRow.reminder,
                  notes: newRow.notes,
                  createdAt: newRow.created_at,
                  updatedAt: newRow.updated_at,
                  version: newRow.version,
                };
                
                set((state) => ({
                  tasks: [newTask, ...state.tasks.filter((t) => t.id !== newTask.id)],
                }));
              } else if (eventType === 'UPDATE') {
                const updatedTask: Task = {
                  id: newRow.id,
                  title: newRow.title,
                  completed: newRow.completed,
                  category: newRow.category,
                  dueDate: newRow.due_date,
                  reminder: newRow.reminder,
                  notes: newRow.notes,
                  createdAt: newRow.created_at,
                  updatedAt: newRow.updated_at,
                  version: newRow.version,
                };
                
                set((state) => ({
                  tasks: state.tasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                  ),
                }));
              } else if (eventType === 'DELETE' || newRow.deleted_at) {
                set((state) => ({
                  tasks: state.tasks.filter((task) => task.id !== oldRow.id),
                }));
              }
            }
          )
          .subscribe();

        set({ realtimeSubscription: subscription });
      },

      unsubscribeFromRealtime: () => {
        const { realtimeSubscription } = get();
        if (realtimeSubscription) {
          supabase.removeChannel(realtimeSubscription);
          set({ realtimeSubscription: null });
        }
      },

      // =====================================================================
      // NETWORK STATUS
      // =====================================================================
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        // When coming back online, process sync queue
        if (isOnline) {
          get().processSyncQueue();
        }
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        syncQueue: state.syncQueue,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// ============================================================================
// NETWORK STATUS LISTENER (setup once)
// ============================================================================

let networkUnsubscribe: (() => void) | null = null;

export function setupTaskStoreNetworkListener() {
  if (networkUnsubscribe) return; // Already setup

  networkUnsubscribe = NetInfo.addEventListener((state) => {
    useTaskStore.getState().setOnlineStatus(state.isConnected ?? false);
  });
}

export function cleanupTaskStoreNetworkListener() {
  if (networkUnsubscribe) {
    networkUnsubscribe();
    networkUnsubscribe = null;
  }
}

// ============================================================================
// AUTO-SUBSCRIBE TO REALTIME (when store is used)
// ============================================================================

// Subscribe to realtime on store initialization
if (typeof window !== 'undefined') {
  const store = useTaskStore.getState();
  store.subscribeToRealtime();
  setupTaskStoreNetworkListener();
}
