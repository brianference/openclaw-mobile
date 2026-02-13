import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO
  endTime?: string; // ISO
  allDay: boolean;
  tags: string[];
  reminder?: number; // minutes before
  createdAt: string;
  updatedAt: string;
}

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  
  // CRUD operations
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Filtering
  getEventsForDate: (date: string) => CalendarEvent[]; // YYYY-MM-DD
  getEventsForMonth: (year: number, month: number) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [
        // Mock data for development
        {
          id: '1',
          title: 'Mission Control Demo',
          description: 'Present the new dashboard to the team',
          startTime: new Date(2026, 1, 12, 14, 0).toISOString(), // Feb 12, 2:00 PM
          endTime: new Date(2026, 1, 12, 15, 0).toISOString(),
          allDay: false,
          tags: ['meeting', 'demo'],
          reminder: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Content Review',
          description: 'Review pending blog posts and social media content',
          startTime: new Date(2026, 1, 15, 10, 0).toISOString(), // Feb 15, 10:00 AM
          endTime: new Date(2026, 1, 15, 11, 0).toISOString(),
          allDay: false,
          tags: ['content'],
          reminder: 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Server Maintenance',
          description: 'Scheduled downtime for infrastructure upgrades',
          startTime: new Date(2026, 1, 18, 0, 0).toISOString(), // Feb 18, All Day
          allDay: true,
          tags: ['maintenance', 'critical'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      isLoading: false,

      fetchEvents: async () => {
        set({ isLoading: true });
        // In production, fetch from Supabase
        // For now, events are persisted via middleware
        set({ isLoading: false });
      },

      addEvent: async (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          events: [...state.events, newEvent].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          ),
        }));
      },

      updateEvent: async (eventId, updates) => {
        set((state) => ({
          events: state.events
            .map((event) =>
              event.id === eventId
                ? { ...event, ...updates, updatedAt: new Date().toISOString() }
                : event
            )
            .sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
        }));
      },

      deleteEvent: async (eventId) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        }));
      },

      getEventsForDate: (date) => {
        const { events } = get();
        return events.filter((event) => {
          const eventDate = new Date(event.startTime).toISOString().split('T')[0];
          return eventDate === date;
        });
      },

      getEventsForMonth: (year, month) => {
        const { events } = get();
        return events.filter((event) => {
          const eventDate = new Date(event.startTime);
          return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
      },

      getUpcomingEvents: (limit = 10) => {
        const { events } = get();
        const now = new Date();
        return events
          .filter((event) => new Date(event.startTime) >= now)
          .slice(0, limit);
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
