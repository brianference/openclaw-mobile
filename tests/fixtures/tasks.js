/**
 * Test fixtures for Task Board
 */

export const mockTask = {
  id: 'task-001',
  title: 'Write design spec',
  completed: false,
  dueDate: '2026-02-09T14:00:00Z',
  category: 'work',
  reminder: '2026-02-09T13:00:00Z',
  notes: 'Complete all 25 screens',
  createdAt: '2026-02-08T10:00:00Z',
  updatedAt: '2026-02-08T10:00:00Z',
  syncStatus: 'synced',
};

export const mockCompletedTask = {
  ...mockTask,
  id: 'task-002',
  title: 'Review PR #423',
  completed: true,
  completedAt: '2026-02-08T12:00:00Z',
};

export const mockTasks = [
  mockTask,
  mockCompletedTask,
  {
    id: 'task-003',
    title: 'Buy groceries',
    completed: false,
    dueDate: '2026-02-10T18:00:00Z',
    category: 'personal',
    notes: 'Milk, eggs, bread',
    createdAt: '2026-02-08T09:00:00Z',
    updatedAt: '2026-02-08T09:00:00Z',
    syncStatus: 'synced',
  },
];

export const createMockTasks = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${String(i).padStart(3, '0')}`,
    title: `Task ${i + 1}`,
    completed: i % 3 === 0,
    dueDate: new Date(Date.now() + i * 86400000).toISOString(),
    category: ['work', 'personal', 'shopping'][i % 3],
    notes: `Notes for task ${i + 1}`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    syncStatus: 'synced',
  }));
};
