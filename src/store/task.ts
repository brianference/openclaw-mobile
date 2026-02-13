import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskCategory, ReminderType } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  
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
  
  // Filtering helpers
  getActiveTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByCategory: (category: TaskCategory | 'all') => Task[];
  searchTasks: (query: string) => Task[];
  
  // Bulk operations
  deleteAllCompleted: () => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,

      fetchTasks: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase
        // For now, tasks are persisted in AsyncStorage via middleware
        set({ isLoading: false });
      },

      addTask: async (data) => {
        const newTask: Task = {
          id: Date.now().toString(),
          title: data.title,
          completed: false,
          category: data.category,
          dueDate: data.dueDate,
          reminder: data.reminder,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: async (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      toggleTaskComplete: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: async (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },

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

      deleteAllCompleted: async () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
