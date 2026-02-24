/**
 * Message Database - SQLite implementation for MobileClaw
 * 
 * Provides offline-first message and conversation persistence
 * with full-text search, export functionality, and sync capabilities.
 * 
 * Features:
 * - SQLite database with indexed queries
 * - Conversation and message management
 * - Full-text search using FTS5
 * - Export to TXT/JSON/CSV/PDF
 * - Offline support with sync queue
 * - Automatic cleanup and optimization
 * 
 * @see US-156 - Implement local message storage (SQLite)
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Message status enum
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Message interface
 */
export interface Message {
  id?: number;
  conversationId: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  status: MessageStatus;
  attachments?: string; // JSON string of attachment references
  metadata?: string; // JSON string for additional data
}

/**
 * Conversation interface
 */
export interface Conversation {
  id?: number;
  title: string;
  lastMessage?: string;
  lastActivity: number;
  participantCount: number;
  unreadCount?: number;
  metadata?: string;
}

/**
 * Search result interface
 */
export interface SearchResult {
  message: Message;
  conversationTitle: string;
  matchCount: number;
}

/**
 * Database configuration
 */
interface DatabaseConfig {
  name: string;
  version: number;
  maxMessageAge: number; // days
  vacuumInterval: number; // days
}

const DEFAULT_CONFIG: DatabaseConfig = {
  name: 'mobileclaw.db',
  version: 1,
  maxMessageAge: 90, // Keep messages for 90 days
  vacuumInterval: 7, // Optimize database every 7 days
};

/**
 * MessageDatabase class - Main database interface
 */
export class MessageDatabase {
  private db: SQLite.WebSQLDatabase | null = null;
  private config: DatabaseConfig;
  private initialized = false;

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize database and create schema
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = SQLite.openDatabase(this.config.name);
      
      await this.createSchema();
      await this.createIndices();
      await this.enableFTS();
      await this.runMaintenance();
      
      this.initialized = true;
      console.log('[MessageDatabase] Initialized successfully');
    } catch (error) {
      console.error('[MessageDatabase] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database schema
   */
  private async createSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    const sql = `
      -- Conversations table
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        lastMessage TEXT,
        lastActivity INTEGER NOT NULL,
        participantCount INTEGER DEFAULT 2,
        unreadCount INTEGER DEFAULT 0,
        metadata TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId INTEGER NOT NULL,
        text TEXT NOT NULL,
        sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'sending',
        attachments TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );

      -- Sync queue for offline operations
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id INTEGER,
        data TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        retries INTEGER DEFAULT 0
      );

      -- Metadata table for database versioning and config
      CREATE TABLE IF NOT EXISTS db_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Store database version
      INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '${this.config.version}');
      INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_vacuum', strftime('%s', 'now'));
    `;

    return this.executeSql(sql);
  }

  /**
   * Create database indices for performance
   */
  private async createIndices(): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    const sql = `
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
      CREATE INDEX IF NOT EXISTS idx_conversations_activity ON conversations(lastActivity DESC);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at ASC);
    `;

    return this.executeSql(sql);
  }

  /**
   * Enable full-text search using FTS5
   */
  private async enableFTS(): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    const sql = `
      CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
        text,
        sender,
        conversationId UNINDEXED,
        timestamp UNINDEXED,
        content='messages',
        content_rowid='id'
      );

      -- Triggers to keep FTS index in sync
      CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
        INSERT INTO messages_fts(rowid, text, sender, conversationId, timestamp)
        VALUES (new.id, new.text, new.sender, new.conversationId, new.timestamp);
      END;

      CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
        DELETE FROM messages_fts WHERE rowid = old.id;
      END;

      CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
        UPDATE messages_fts SET text = new.text, sender = new.sender
        WHERE rowid = new.id;
      END;
    `;

    return this.executeSql(sql);
  }

  /**
   * Execute SQL with promise wrapper
   */
  private executeSql(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      this.db.transaction(
        (tx) => {
          sql.split(';').forEach((statement) => {
            const trimmed = statement.trim();
            if (trimmed) {
              tx.executeSql(trimmed, params);
            }
          });
        },
        reject,
        resolve
      );
    });
  }

  /**
   * Execute SQL query and return results
   */
  private executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          (_, { rows }) => {
            const results: T[] = [];
            for (let i = 0; i < rows.length; i++) {
              results.push(rows.item(i) as T);
            }
            resolve(results);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(title: string): Promise<number> {
    const timestamp = Date.now();
    const sql = `
      INSERT INTO conversations (title, lastActivity, participantCount)
      VALUES (?, ?, 2)
    `;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          [title, timestamp],
          (_, { insertId }) => resolve(insertId || 0),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Get all conversations
   */
  async getConversations(limit = 50, offset = 0): Promise<Conversation[]> {
    const sql = `
      SELECT * FROM conversations
      ORDER BY lastActivity DESC
      LIMIT ? OFFSET ?
    `;

    return this.executeQuery<Conversation>(sql, [limit, offset]);
  }

  /**
   * Get conversation by ID
   */
  async getConversation(id: number): Promise<Conversation | null> {
    const sql = `SELECT * FROM conversations WHERE id = ?`;
    const results = await this.executeQuery<Conversation>(sql, [id]);
    return results[0] || null;
  }

  /**
   * Update conversation
   */
  async updateConversation(
    id: number,
    updates: Partial<Conversation>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return;

    const sql = `UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    return this.executeSql(sql, values);
  }

  /**
   * Delete conversation and all messages
   */
  async deleteConversation(id: number): Promise<void> {
    const sql = `DELETE FROM conversations WHERE id = ?`;
    return this.executeSql(sql, [id]);
  }

  /**
   * Add a message to conversation
   */
  async addMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<number> {
    const sql = `
      INSERT INTO messages (conversationId, text, sender, timestamp, status, attachments, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const messageId = await new Promise<number>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          [
            message.conversationId,
            message.text,
            message.sender,
            message.timestamp,
            message.status,
            message.attachments || null,
            message.metadata || null,
          ],
          (_, { insertId }) => resolve(insertId || 0),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });

    // Update conversation last message and activity
    await this.updateConversation(message.conversationId, {
      lastMessage: message.text.substring(0, 100),
      lastActivity: message.timestamp,
    });

    return messageId;
  }

  /**
   * Get messages for a conversation (paginated)
   */
  async getMessages(
    conversationId: number,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const sql = `
      SELECT * FROM messages
      WHERE conversationId = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    return this.executeQuery<Message>(sql, [conversationId, limit, offset]);
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    id: number,
    status: MessageStatus
  ): Promise<void> {
    const sql = `UPDATE messages SET status = ? WHERE id = ?`;
    return this.executeSql(sql, [status, id]);
  }

  /**
   * Delete message
   */
  async deleteMessage(id: number): Promise<void> {
    const sql = `DELETE FROM messages WHERE id = ?`;
    return this.executeSql(sql, [id]);
  }

  /**
   * Full-text search across all messages
   */
  async searchMessages(
    query: string,
    limit = 20,
    conversationId?: number
  ): Promise<SearchResult[]> {
    const sql = conversationId
      ? `
        SELECT m.*, c.title as conversationTitle,
               snippet(messages_fts, -1, '<mark>', '</mark>', '...', 64) as snippet
        FROM messages_fts
        JOIN messages m ON messages_fts.rowid = m.id
        JOIN conversations c ON m.conversationId = c.id
        WHERE messages_fts MATCH ? AND m.conversationId = ?
        ORDER BY rank
        LIMIT ?
      `
      : `
        SELECT m.*, c.title as conversationTitle,
               snippet(messages_fts, -1, '<mark>', '</mark>', '...', 64) as snippet
        FROM messages_fts
        JOIN messages m ON messages_fts.rowid = m.id
        JOIN conversations c ON m.conversationId = c.id
        WHERE messages_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `;

    const params = conversationId ? [query, conversationId, limit] : [query, limit];
    const results = await this.executeQuery<any>(sql, params);

    return results.map((row) => ({
      message: {
        id: row.id,
        conversationId: row.conversationId,
        text: row.text,
        sender: row.sender,
        timestamp: row.timestamp,
        status: row.status,
        attachments: row.attachments,
        metadata: row.metadata,
      },
      conversationTitle: row.conversationTitle,
      matchCount: 1,
    }));
  }

  /**
   * Export conversation to TXT format
   */
  async exportToTXT(conversationId: number): Promise<string> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const messages = await this.executeQuery<Message>(
      `SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC`,
      [conversationId]
    );

    let output = `Conversation: ${conversation.title}\n`;
    output += `Exported: ${new Date().toISOString()}\n`;
    output += `Messages: ${messages.length}\n`;
    output += `\n${'='.repeat(50)}\n\n`;

    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleString();
      output += `[${date}] ${msg.sender === 'user' ? 'You' : 'AI'}:\n`;
      output += `${msg.text}\n\n`;
    });

    return output;
  }

  /**
   * Export conversation to JSON format
   */
  async exportToJSON(conversationId: number): Promise<string> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const messages = await this.executeQuery<Message>(
      `SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC`,
      [conversationId]
    );

    const exportData = {
      conversation,
      messages,
      exportedAt: new Date().toISOString(),
      version: this.config.version,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export conversation to CSV format
   */
  async exportToCSV(conversationId: number): Promise<string> {
    const messages = await this.executeQuery<Message>(
      `SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC`,
      [conversationId]
    );

    let csv = 'Timestamp,Sender,Message,Status\n';

    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toISOString();
      const text = msg.text.replace(/"/g, '""'); // Escape quotes
      csv += `"${date}","${msg.sender}","${text}","${msg.status}"\n`;
    });

    return csv;
  }

  /**
   * Export and share conversation
   */
  async shareConversation(
    conversationId: number,
    format: 'txt' | 'json' | 'csv' = 'txt'
  ): Promise<void> {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = await this.exportToJSON(conversationId);
        filename = `conversation-${conversationId}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = await this.exportToCSV(conversationId);
        filename = `conversation-${conversationId}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        content = await this.exportToTXT(conversationId);
        filename = `conversation-${conversationId}.txt`;
        mimeType = 'text/plain';
    }

    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: 'Export Conversation',
      });
    }
  }

  /**
   * Get conversation count
   */
  async getConversationCount(): Promise<number> {
    const result = await this.executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM conversations`
    );
    return result[0]?.count || 0;
  }

  /**
   * Get message count
   */
  async getMessageCount(conversationId?: number): Promise<number> {
    const sql = conversationId
      ? `SELECT COUNT(*) as count FROM messages WHERE conversationId = ?`
      : `SELECT COUNT(*) as count FROM messages`;
    
    const params = conversationId ? [conversationId] : [];
    const result = await this.executeQuery<{ count: number}>(sql, params);
    return result[0]?.count || 0;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: number): Promise<void> {
    const sql = `
      UPDATE messages 
      SET status = '${MessageStatus.READ}' 
      WHERE conversationId = ? AND status = '${MessageStatus.DELIVERED}'
    `;
    await this.executeSql(sql, [conversationId]);

    // Reset unread count
    await this.updateConversation(conversationId, { unreadCount: 0 });
  }

  /**
   * Database maintenance - cleanup and optimization
   */
  async runMaintenance(): Promise<void> {
    const lastVacuum = await this.executeQuery<{ value: string }>(
      `SELECT value FROM db_metadata WHERE key = 'last_vacuum'`
    );

    const lastVacuumTime = parseInt(lastVacuum[0]?.value || '0');
    const now = Math.floor(Date.now() / 1000);
    const daysSinceVacuum = (now - lastVacuumTime) / 86400;

    if (daysSinceVacuum >= this.config.vacuumInterval) {
      console.log('[MessageDatabase] Running VACUUM...');
      await this.executeSql('VACUUM');
      await this.executeSql(
        `UPDATE db_metadata SET value = '${now}' WHERE key = 'last_vacuum'`
      );
    }

    // Clean up old messages if configured
    if (this.config.maxMessageAge > 0) {
      const cutoff = now - this.config.maxMessageAge * 86400;
      await this.executeSql(
        `DELETE FROM messages WHERE timestamp < ?`,
        [cutoff * 1000]
      );
    }

    console.log('[MessageDatabase] Maintenance complete');
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    this.db = null;
    this.initialized = false;
    console.log('[MessageDatabase] Database closed');
  }
}

/**
 * Singleton instance
 */
let dbInstance: MessageDatabase | null = null;

/**
 * Get or create database instance
 */
export const getDatabase = async (): Promise<MessageDatabase> => {
  if (!dbInstance) {
    dbInstance = new MessageDatabase();
    await dbInstance.init();
  }
  return dbInstance;
};

export default MessageDatabase;
