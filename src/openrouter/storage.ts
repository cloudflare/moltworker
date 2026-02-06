/**
 * User Preferences Storage
 * Stores per-user model preferences and conversation history in R2
 */

import { DEFAULT_MODEL } from './models';

export interface UserPreferences {
  userId: string;
  username?: string;
  model: string;
  autoResume?: boolean; // Auto-resume tasks on timeout
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
 * Checkpoint info returned from listing/getting checkpoints
 */
export interface CheckpointInfo {
  slotName: string;
  iterations: number;
  toolsUsed: number;
  savedAt: number;
  taskPrompt?: string;
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
   * Get user's auto-resume setting
   */
  async getUserAutoResume(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.autoResume ?? false;
  }

  /**
   * Set user's auto-resume setting
   */
  async setUserAutoResume(userId: string, autoResume: boolean): Promise<void> {
    const prefs = await this.getPreferences(userId);
    prefs.autoResume = autoResume;
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

  // === CHECKPOINT MANAGEMENT ===

  /**
   * List all checkpoints for a user
   */
  async listCheckpoints(userId: string): Promise<CheckpointInfo[]> {
    const prefix = `checkpoints/${userId}/`;
    const listed = await this.bucket.list({ prefix });

    const checkpoints: CheckpointInfo[] = [];
    for (const obj of listed.objects) {
      // Extract slot name from key: checkpoints/{userId}/{slotName}.json
      const slotName = obj.key.replace(prefix, '').replace('.json', '');

      // Get checkpoint details
      const info = await this.getCheckpointInfo(userId, slotName);
      if (info) {
        checkpoints.push(info);
      }
    }

    // Sort by savedAt descending (newest first)
    return checkpoints.sort((a, b) => b.savedAt - a.savedAt);
  }

  /**
   * Get checkpoint info without loading full messages
   */
  async getCheckpointInfo(userId: string, slotName: string = 'latest'): Promise<CheckpointInfo | null> {
    const key = `checkpoints/${userId}/${slotName}.json`;
    const obj = await this.bucket.get(key);
    if (!obj) return null;

    try {
      const data = await obj.json() as {
        iterations: number;
        toolsUsed: string[];
        savedAt: number;
        taskPrompt?: string;
      };
      return {
        slotName,
        iterations: data.iterations,
        toolsUsed: data.toolsUsed?.length ?? 0,
        savedAt: data.savedAt,
        taskPrompt: data.taskPrompt,
      };
    } catch {
      return null;
    }
  }

  /**
   * Delete a checkpoint
   */
  async deleteCheckpoint(userId: string, slotName: string = 'latest'): Promise<boolean> {
    const key = `checkpoints/${userId}/${slotName}.json`;
    const exists = await this.bucket.head(key);
    if (!exists) return false;

    await this.bucket.delete(key);
    return true;
  }

  /**
   * Copy checkpoint to a named slot (backup/restore)
   */
  async copyCheckpoint(userId: string, fromSlot: string, toSlot: string): Promise<boolean> {
    const fromKey = `checkpoints/${userId}/${fromSlot}.json`;
    const toKey = `checkpoints/${userId}/${toSlot}.json`;

    const obj = await this.bucket.get(fromKey);
    if (!obj) return false;

    const data = await obj.text();
    await this.bucket.put(toKey, data);
    return true;
  }
}

/**
 * Create a user storage instance
 */
export function createUserStorage(bucket: R2Bucket): UserStorage {
  return new UserStorage(bucket, 'telegram-users');
}

/**
 * Skills storage for reading skills from R2
 */
export class SkillStorage {
  private bucket: R2Bucket;
  private prefix: string;

  constructor(bucket: R2Bucket, prefix: string = 'skills') {
    this.bucket = bucket;
    this.prefix = prefix;
  }

  /**
   * Get a skill by name
   * Looks for skill content in: skills/{skillName}/prompt.md or skills/{skillName}/system.md
   */
  async getSkill(skillName: string): Promise<string | null> {
    // Try different common file names
    const possibleFiles = [
      `${this.prefix}/${skillName}/prompt.md`,
      `${this.prefix}/${skillName}/system.md`,
      `${this.prefix}/${skillName}/index.md`,
      `${this.prefix}/${skillName}.md`,
    ];

    for (const key of possibleFiles) {
      const object = await this.bucket.get(key);
      if (object) {
        return await object.text();
      }
    }

    return null;
  }

  /**
   * List available skills
   */
  async listSkills(): Promise<string[]> {
    const listed = await this.bucket.list({
      prefix: `${this.prefix}/`,
      delimiter: '/',
    });

    const skills: string[] = [];
    for (const prefix of listed.delimitedPrefixes || []) {
      // Extract skill name from prefix like "skills/storia-orchestrator/"
      const name = prefix.replace(`${this.prefix}/`, '').replace(/\/$/, '');
      if (name) {
        skills.push(name);
      }
    }

    return skills;
  }

  /**
   * Check if a skill exists
   */
  async hasSkill(skillName: string): Promise<boolean> {
    const skill = await this.getSkill(skillName);
    return skill !== null;
  }
}

/**
 * Create a skill storage instance
 */
export function createSkillStorage(bucket: R2Bucket): SkillStorage {
  return new SkillStorage(bucket, 'skills');
}
