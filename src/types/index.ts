export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversation_id?: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export type Priority = 'high' | 'medium' | 'low';
export type ColumnId = 'backlog' | 'progress' | 'done';

export interface KanbanCard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  column_id: ColumnId;
  priority: Priority;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export type NoteCategory = 'idea' | 'note' | 'todo' | 'research';

export interface BrainNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface VaultItem {
  id: string;
  name: string;
  category: 'api_key' | 'password' | 'note' | 'other';
  value: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  credits: number;
  created_at: string;
  updated_at: string;
}
