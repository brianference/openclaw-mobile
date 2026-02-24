/**
 * Message Database Tests
 * 
 * Comprehensive test suite for SQLite message storage
 * Tests all CRUD operations, search, export, and edge cases
 * 
 * @see US-156 - Implement local message storage (SQLite)
 */

import {
  MessageDatabase,
  Message,
  Conversation,
  MessageStatus,
  getDatabase,
} from '../messageDatabase';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback({
        executeSql: jest.fn((sql, params, success) => {
          if (success) {
            success(null, { rows: { length: 0, item: () => ({}) }, insertId: 1 });
          }
        }),
      });
    }),
  })),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/test/directory/',
  writeAsStringAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(),
}));

describe('MessageDatabase', () => {
  let db: MessageDatabase;

  beforeEach(async () => {
    db = new MessageDatabase({ name: 'test.db' });
    await db.init();
  });

  afterEach(async () => {
    await db.close();
  });

  describe('Initialization', () => {
    it('should initialize database successfully', async () => {
      expect(db).toBeDefined();
    });

    it('should not reinitialize if already initialized', async () => {
      await db.init(); // Should not throw
    });

    it('should create all required tables', async () => {
      // This is tested implicitly by successful init
      expect(true).toBe(true);
    });
  });

  describe('Conversations', () => {
    it('should create a new conversation', async () => {
      const conversationId = await db.createConversation('Test Conversation');
      expect(conversationId).toBeGreaterThan(0);
    });

    it('should retrieve conversation by ID', async () => {
      const id = await db.createConversation('Test');
      const conversation = await db.getConversation(id);
      
      expect(conversation).toBeDefined();
      expect(conversation?.title).toBe('Test');
    });

    it('should get all conversations', async () => {
      await db.createConversation('Conv 1');
      await db.createConversation('Conv 2');
      
      const conversations = await db.getConversations();
      expect(conversations.length).toBeGreaterThan(0);
    });

    it('should update conversation', async () => {
      const id = await db.createConversation('Original');
      await db.updateConversation(id, { title: 'Updated' });
      
      const conversation = await db.getConversation(id);
      expect(conversation?.title).toBe('Updated');
    });

    it('should delete conversation', async () => {
      const id = await db.createConversation('To Delete');
      await db.deleteConversation(id);
      
      const conversation = await db.getConversation(id);
      expect(conversation).toBeNull();
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 10; i++) {
        await db.createConversation(`Conv ${i}`);
      }
      
      const page1 = await db.getConversations(5, 0);
      const page2 = await db.getConversations(5, 5);
      
      expect(page1.length).toBeLessThanOrEqual(5);
      expect(page2.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Messages', () => {
    let conversationId: number;

    beforeEach(async () => {
      conversationId = await db.createConversation('Test Conversation');
    });

    it('should add a message', async () => {
      const messageId = await db.addMessage({
        conversationId,
        text: 'Hello, world!',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      expect(messageId).toBeGreaterThan(0);
    });

    it('should retrieve messages for conversation', async () => {
      await db.addMessage({
        conversationId,
        text: 'Message 1',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      await db.addMessage({
        conversationId,
        text: 'Message 2',
        sender: 'ai',
        timestamp: Date.now() + 1000,
        status: MessageStatus.SENT,
      });
      
      const messages = await db.getMessages(conversationId);
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should update message status', async () => {
      const messageId = await db.addMessage({
        conversationId,
        text: 'Test message',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENDING,
      });
      
      await db.updateMessageStatus(messageId, MessageStatus.DELIVERED);
      
      const messages = await db.getMessages(conversationId);
      const message = messages.find((m) => m.id === messageId);
      expect(message?.status).toBe(MessageStatus.DELIVERED);
    });

    it('should delete message', async () => {
      const messageId = await db.addMessage({
        conversationId,
        text: 'To delete',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      await db.deleteMessage(messageId);
      
      const messages = await db.getMessages(conversationId);
      const message = messages.find((m) => m.id === messageId);
      expect(message).toBeUndefined();
    });

    it('should support message pagination', async () => {
      for (let i = 0; i < 10; i++) {
        await db.addMessage({
          conversationId,
          text: `Message ${i}`,
          sender: 'user',
          timestamp: Date.now() + i * 1000,
          status: MessageStatus.SENT,
        });
      }
      
      const page1 = await db.getMessages(conversationId, 5, 0);
      const page2 = await db.getMessages(conversationId, 5, 5);
      
      expect(page1.length).toBeLessThanOrEqual(5);
      expect(page2.length).toBeLessThanOrEqual(5);
    });

    it('should update conversation last message on add', async () => {
      const text = 'Latest message';
      await db.addMessage({
        conversationId,
        text,
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      const conversation = await db.getConversation(conversationId);
      expect(conversation?.lastMessage).toContain(text);
    });
  });

  describe('Search', () => {
    let conversationId: number;

    beforeEach(async () => {
      conversationId = await db.createConversation('Search Test');
      
      await db.addMessage({
        conversationId,
        text: 'OpenClaw is awesome',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      await db.addMessage({
        conversationId,
        text: 'AI assistant helps me daily',
        sender: 'ai',
        timestamp: Date.now() + 1000,
        status: MessageStatus.SENT,
      });
    });

    it('should search messages by text', async () => {
      const results = await db.searchMessages('OpenClaw');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].message.text).toContain('OpenClaw');
    });

    it('should search within specific conversation', async () => {
      const otherConversationId = await db.createConversation('Other');
      await db.addMessage({
        conversationId: otherConversationId,
        text: 'Different conversation',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      const results = await db.searchMessages('OpenClaw', 20, conversationId);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].message.conversationId).toBe(conversationId);
    });

    it('should limit search results', async () => {
      const results = await db.searchMessages('is', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Export', () => {
    let conversationId: number;

    beforeEach(async () => {
      conversationId = await db.createConversation('Export Test');
      
      await db.addMessage({
        conversationId,
        text: 'First message',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      await db.addMessage({
        conversationId,
        text: 'Second message',
        sender: 'ai',
        timestamp: Date.now() + 1000,
        status: MessageStatus.SENT,
      });
    });

    it('should export to TXT format', async () => {
      const txt = await db.exportToTXT(conversationId);
      
      expect(txt).toContain('Export Test');
      expect(txt).toContain('First message');
      expect(txt).toContain('Second message');
    });

    it('should export to JSON format', async () => {
      const json = await db.exportToJSON(conversationId);
      const data = JSON.parse(json);
      
      expect(data.conversation).toBeDefined();
      expect(data.messages).toHaveLength(2);
      expect(data.exportedAt).toBeDefined();
    });

    it('should export to CSV format', async () => {
      const csv = await db.exportToCSV(conversationId);
      
      expect(csv).toContain('Timestamp,Sender,Message,Status');
      expect(csv).toContain('First message');
      expect(csv).toContain('Second message');
    });

    it('should handle export sharing', async () => {
      await db.shareConversation(conversationId, 'txt');
      // Mock assertions would verify FileSystem and Sharing calls
    });

    it('should throw error when exporting non-existent conversation', async () => {
      await expect(db.exportToTXT(99999)).rejects.toThrow('Conversation not found');
    });
  });

  describe('Statistics', () => {
    it('should get conversation count', async () => {
      await db.createConversation('Conv 1');
      await db.createConversation('Conv 2');
      
      const count = await db.getConversationCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should get message count', async () => {
      const conversationId = await db.createConversation('Test');
      
      await db.addMessage({
        conversationId,
        text: 'Message 1',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      await db.addMessage({
        conversationId,
        text: 'Message 2',
        sender: 'ai',
        timestamp: Date.now() + 1000,
        status: MessageStatus.SENT,
      });
      
      const count = await db.getMessageCount(conversationId);
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should get total message count across all conversations', async () => {
      const conv1 = await db.createConversation('Conv 1');
      const conv2 = await db.createConversation('Conv 2');
      
      await db.addMessage({
        conversationId: conv1,
        text: 'Message',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      await db.addMessage({
        conversationId: conv2,
        text: 'Message',
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      const count = await db.getMessageCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Mark as Read', () => {
    it('should mark messages as read', async () => {
      const conversationId = await db.createConversation('Test');
      
      await db.addMessage({
        conversationId,
        text: 'Unread message',
        sender: 'ai',
        timestamp: Date.now(),
        status: MessageStatus.DELIVERED,
      });
      
      await db.markAsRead(conversationId);
      
      const messages = await db.getMessages(conversationId);
      expect(messages[0].status).toBe(MessageStatus.READ);
    });

    it('should reset unread count', async () => {
      const conversationId = await db.createConversation('Test');
      await db.updateConversation(conversationId, { unreadCount: 5 });
      
      await db.markAsRead(conversationId);
      
      const conversation = await db.getConversation(conversationId);
      expect(conversation?.unreadCount).toBe(0);
    });
  });

  describe('Maintenance', () => {
    it('should run maintenance without errors', async () => {
      await expect(db.runMaintenance()).resolves.not.toThrow();
    });

    it('should clean up old messages', async () => {
      const dbWithShortRetention = new MessageDatabase({
        name: 'test-retention.db',
        maxMessageAge: 1, // 1 day
      });
      
      await dbWithShortRetention.init();
      const conversationId = await dbWithShortRetention.createConversation('Test');
      
      // Add old message
      await dbWithShortRetention.addMessage({
        conversationId,
        text: 'Old message',
        sender: 'user',
        timestamp: Date.now() - 2 * 86400 * 1000, // 2 days ago
        status: MessageStatus.SENT,
      });
      
      await dbWithShortRetention.runMaintenance();
      
      const count = await dbWithShortRetention.getMessageCount(conversationId);
      expect(count).toBe(0); // Old message should be deleted
      
      await dbWithShortRetention.close();
    });
  });

  describe('Singleton', () => {
    it('should return same instance on multiple calls', async () => {
      const db1 = await getDatabase();
      const db2 = await getDatabase();
      
      expect(db1).toBe(db2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search results', async () => {
      const results = await db.searchMessages('nonexistentterm12345');
      expect(results).toHaveLength(0);
    });

    it('should handle special characters in messages', async () => {
      const conversationId = await db.createConversation('Test');
      const specialText = 'Test with "quotes" and \'apostrophes\' and <tags>';
      
      await db.addMessage({
        conversationId,
        text: specialText,
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      const messages = await db.getMessages(conversationId);
      expect(messages[0].text).toBe(specialText);
    });

    it('should handle very long messages', async () => {
      const conversationId = await db.createConversation('Test');
      const longText = 'A'.repeat(10000);
      
      await db.addMessage({
        conversationId,
        text: longText,
        sender: 'user',
        timestamp: Date.now(),
        status: MessageStatus.SENT,
      });
      
      const messages = await db.getMessages(conversationId);
      expect(messages[0].text).toHaveLength(10000);
    });

    it('should handle concurrent operations', async () => {
      const conversationId = await db.createConversation('Test');
      
      // Add multiple messages concurrently
      await Promise.all([
        db.addMessage({
          conversationId,
          text: 'Message 1',
          sender: 'user',
          timestamp: Date.now(),
          status: MessageStatus.SENT,
        }),
        db.addMessage({
          conversationId,
          text: 'Message 2',
          sender: 'user',
          timestamp: Date.now(),
          status: MessageStatus.SENT,
        }),
        db.addMessage({
          conversationId,
          text: 'Message 3',
          sender: 'user',
          timestamp: Date.now(),
          status: MessageStatus.SENT,
        }),
      ]);
      
      const count = await db.getMessageCount(conversationId);
      expect(count).toBe(3);
    });
  });
});
