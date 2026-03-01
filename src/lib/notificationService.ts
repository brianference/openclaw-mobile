/**
 * Push Notification Service for OpenClaw Mobile
 * 
 * Handles push notifications for new messages, delivery status, and system alerts.
 * Uses Expo Notifications API with APNs (iOS) and FCM (Android) backends.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification settings keys
const SETTINGS_KEY = 'notification_settings';
const TOKEN_KEY = 'expo_push_token';

export interface NotificationSettings {
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  sound: 'default' | 'subtle' | 'none';
  vibrate: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  sound: 'default',
  vibrate: true,
};

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Load saved settings
      await this.loadSettings();

      // Register for push notifications if enabled
      if (this.settings.enabled) {
        await this.registerForPushNotifications();
      }

      // Set up notification listeners
      this.setupListeners();

      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  /**
   * Register device for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Get notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '47a46e5d-89f9-4e39-9248-a44ef5e8c37d', // Replace with actual Expo project ID
      });

      this.expoPushToken = tokenData.data;

      // Save token
      await AsyncStorage.setItem(TOKEN_KEY, this.expoPushToken);

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      console.log('Push token registered:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    // Messages channel
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      description: 'New chat messages from AI',
      importance: Notifications.AndroidImportance.HIGH,
      sound: this.settings.sound === 'none' ? undefined : 'default',
      vibrationPattern: this.settings.vibrate ? [0, 250, 250, 250] : undefined,
      lightColor: '#4ECDC4',
      enableVibrate: this.settings.vibrate,
    });

    // System channel
    await Notifications.setNotificationChannelAsync('system', {
      name: 'System Alerts',
      description: 'Important system notifications',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      enableVibrate: true,
    });

    // Status updates channel
    await Notifications.setNotificationChannelAsync('status', {
      name: 'Message Status',
      description: 'Message delivery and read receipts',
      importance: Notifications.AndroidImportance.LOW,
      sound: this.settings.sound === 'none' ? undefined : 'subtle',
      vibrationPattern: this.settings.vibrate ? [0, 100] : undefined,
      enableVibrate: this.settings.vibrate,
    });
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // Handle foreground notification (could show in-app alert)
    });

    // Listener for user interaction with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const { notification } = response;
      const data = notification.request.content.data;

      // Navigate to relevant conversation based on notification data
      if (data.conversationId) {
        // TODO: Navigate to conversation using expo-router
        console.log('Navigate to conversation:', data.conversationId);
      }
    });
  }

  /**
   * Send local notification for new message
   */
  async notifyNewMessage(message: {
    id: string;
    conversationId: string;
    content: string;
    sender: string;
    timestamp: number;
  }): Promise<void> {
    try {
      // Check if notifications are enabled
      if (!this.settings.enabled) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours()) {
        console.log('Quiet hours active, skipping notification');
        return;
      }

      // Truncate message preview to 50 characters
      const preview = message.content.length > 50
        ? message.content.substring(0, 47) + '...'
        : message.content;

      const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.sender,
          body: preview,
          data: {
            conversationId: message.conversationId,
            messageId: message.id,
            type: 'new_message',
          },
          sound: this.settings.sound === 'none' ? undefined : 'default',
          badge: 1,
        },
        trigger: null, // Show immediately
      });

      console.log('New message notification sent');
    } catch (error) {
      console.error('Failed to send new message notification:', error);
    }
  }

  /**
   * Send notification for message status change
   */
  async notifyMessageStatus(message: {
    id: string;
    conversationId: string;
    status: 'delivered' | 'read';
  }): Promise<void> {
    try {
      if (!this.settings.enabled || this.isQuietHours()) {
        return;
      }

      const title = message.status === 'delivered' ? 'Message Delivered' : 'Message Read';
      const body = message.status === 'delivered'
        ? 'Your message was delivered'
        : 'Your message was read';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            conversationId: message.conversationId,
            messageId: message.id,
            type: 'status_update',
          },
          sound: this.settings.sound === 'subtle' ? 'subtle' : undefined,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send status notification:', error);
    }
  }

  /**
   * Send system alert notification
   */
  async notifySystemAlert(alert: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<void> {
    try {
      if (!this.settings.enabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: alert.title,
          body: alert.message,
          data: {
            type: 'system_alert',
            priority: alert.priority,
          },
          sound: alert.priority === 'high' ? 'default' : undefined,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send system alert:', error);
    }
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const { quietHoursStart, quietHoursEnd } = this.settings;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (quietHoursStart > quietHoursEnd) {
      return currentTime >= quietHoursStart || currentTime < quietHoursEnd;
    }

    // Handle same-day quiet hours (e.g., 12:00 - 14:00)
    return currentTime >= quietHoursStart && currentTime < quietHoursEnd;
  }

  /**
   * Load notification settings from storage
   */
  async loadSettings(): Promise<NotificationSettings> {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
      return this.settings;
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save notification settings
   */
  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));

      // If notifications were just enabled, register
      if (settings.enabled && !this.expoPushToken) {
        await this.registerForPushNotifications();
      }

      // Update Android channels if settings changed
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      throw error;
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Get Expo push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Clear all notifications
   */
  async clearNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Clear notification badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }

  /**
   * Cleanup listeners on unmount
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
