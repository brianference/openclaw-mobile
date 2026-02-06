export type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversation_id?: string;
  created_at: string;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
}

export type AttachmentType = 'image' | 'markdown';

export interface MessageAttachment {
  id: string;
  message_id: string;
  user_id: string;
  file_name: string;
  file_type: AttachmentType;
  mime_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
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
export type ColumnId = 'backlog' | 'next-up' | 'progress' | 'done';

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

export type APIEndpointType = 'default' | 'local' | 'cloud';

export interface APIEndpointConfig {
  type: APIEndpointType;
  url?: string;
  token?: string;
  enabled: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  credits: number;
  subscription_tier: SubscriptionTier;
  api_endpoint?: APIEndpointConfig;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  credits_per_month: number;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}
