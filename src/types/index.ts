/**
 * OpenClaw Mobile - Type Definitions
 * Core types used throughout the app
 */

// ============================================
// Chat Types
// ============================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  uri: string;
  name?: string;
  size?: number;
}

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
}

// ============================================
// Kanban Types
// ============================================

export type Priority = 'high' | 'medium' | 'low';
export type ColumnId = 'backlog' | 'progress' | 'done';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface KanbanColumn {
  id: ColumnId;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanState {
  columns: KanbanColumn[];
  lastSync: number | null;
  isSyncing: boolean;
}

// ============================================
// Vault Types
// ============================================

export type SecretCategory = 'api_key' | 'password' | 'note' | 'other';

export interface VaultItem {
  id: string;
  name: string;
  category: SecretCategory;
  value: string; // Encrypted
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultState {
  items: VaultItem[];
  isUnlocked: boolean;
  lastUnlock: number | null;
}

// ============================================
// Security Scanner Types
// ============================================

export type SecurityCheckStatus = 'pass' | 'warning' | 'fail' | 'unknown';

export interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: SecurityCheckStatus;
  details?: string;
  lastChecked: number;
}

export interface SecurityState {
  checks: SecurityCheck[];
  overallScore: number;
  lastScan: number | null;
  isScanning: boolean;
}

// ============================================
// Research Hub Types
// ============================================

export interface ResearchItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  content?: string; // Extracted content
  tags: string[];
  projectId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  itemCount: number;
}

// ============================================
// App Settings Types
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  biometricEnabled: boolean;
  autoLockMinutes: number;
  notificationsEnabled: boolean;
  gatewayUrl: string;
  gatewayToken: string;
}

// ============================================
// WebSocket Types
// ============================================

export interface WSMessage {
  type: 'message' | 'typing' | 'status' | 'error';
  payload: unknown;
}

export interface WSConfig {
  url: string;
  token: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}
