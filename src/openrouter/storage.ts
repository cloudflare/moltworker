/**
 * User Preferences Storage
 * Stores per-user model preferences and conversation history in R2
 */

import { DEFAULT_MODEL } from './models';

export interface UserPreferences {
  userId: string;
  username?: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface UserConversation {
  userId: string;
  messages: ConversationMessage[];
  updatedAt: string;
}

/**
 * User preferences storage using R2
 */
export class UserStorage {
  private bucket: R2Bucket;
  private prefix: string;

  constructor(bucket: R2Bucket, prefix: string = 'telegram-users') {
    this.bucket = bucket;
    this.prefix = prefix;
  }

  /**
   * Get the R2 key for user preferences
   */
  private getPrefsKey(userId: string): string {
    return `${this.prefix}/${userId}/preferences.json`;
  }

  /**
   * Get the R2 key for user conversation
   */
  private getConversationKey(userId: string): string {
    return `${this.prefix}/${userId}/conversation.json`;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    const key = this.getPrefsKey(userId);
    const object = await this.bucket.get(key);

    if (!object) {
      // Return default preferences
      return {
        userId,
        model: DEFAULT_MODEL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const data = await object.json() as UserPreferences;
    return data;
  }

  /**
   * Set user preferences
   */
  async setPreferences(prefs: UserPreferences): Promise<void> {
    const key = this.getPrefsKey(prefs.userId);
    prefs.updatedAt = new Date().toISOString();

    await this.bucket.put(key, JSON.stringify(prefs, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });
  }

  /**
   * Get user's selected model
   */
  async getUserModel(userId: string): Promise<string> {
    const prefs = await this.getPreferences(userId);
    return prefs.model;
  }

  /**
   * Set user's selected model
   */
  async setUserModel(userId: string, model: string, username?: string): Promise<void> {
    const prefs = await this.getPreferences(userId);
    prefs.model = model;
    prefs.username = username || prefs.username;
    await this.setPreferences(prefs);
  }

  /**
   * Get user conversation history
   */
  async getConversation(userId: string, maxMessages: number = 20): Promise<ConversationMessage[]> {
    const key = this.getConversationKey(userId);
    const object = await this.bucket.get(key);

    if (!object) {
      return [];
    }

    const data = await object.json() as UserConversation;
    // Return last N messages
    return data.messages.slice(-maxMessages);
  }

  /**
   * Add message to conversation history
   */
  async addMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const key = this.getConversationKey(userId);
    const existing = await this.bucket.get(key);

    let conversation: UserConversation;
    if (existing) {
      conversation = await existing.json() as UserConversation;
    } else {
      conversation = {
        userId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
    }

    conversation.messages.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 messages to avoid growing too large
    if (conversation.messages.length > 50) {
      conversation.messages = conversation.messages.slice(-50);
    }

    conversation.updatedAt = new Date().toISOString();

    await this.bucket.put(key, JSON.stringify(conversation, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });
  }

  /**
   * Clear conversation history
   */
  async clearConversation(userId: string): Promise<void> {
    const key = this.getConversationKey(userId);
    await this.bucket.delete(key);
  }

  /**
   * List all users (for admin purposes)
   */
  async listUsers(limit: number = 100): Promise<string[]> {
    const listed = await this.bucket.list({
      prefix: `${this.prefix}/`,
      limit,
    });

    const userIds = new Set<string>();
    for (const object of listed.objects) {
      const parts = object.key.split('/');
      if (parts.length >= 2) {
        userIds.add(parts[1]);
      }
    }

    return Array.from(userIds);
  }
}

/**
 * Create a user storage instance
 */
export function createUserStorage(bucket: R2Bucket): UserStorage {
  return new UserStorage(bucket, 'telegram-users');
}
