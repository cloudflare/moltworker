/**
 * Telegram Webhook Handler
 * Handles incoming Telegram updates and routes to appropriate handlers
 */

import { OpenRouterClient, createOpenRouterClient, extractTextResponse, type ChatMessage } from '../openrouter/client';
import { UserStorage, createUserStorage, SkillStorage, createSkillStorage } from '../openrouter/storage';
import { modelSupportsTools, generateDailyBriefing } from '../openrouter/tools';
import { getUsage, getUsageRange, formatUsageSummary, formatWeekSummary } from '../openrouter/costs';
import type { TaskProcessor, TaskRequest } from '../durable-objects/task-processor';
import {
  MODELS,
  getModel,
  getAllModels,
  getModelId,
  formatModelsList,
  supportsVision,
  isImageGenModel,
  DEFAULT_MODEL,
  parseReasoningOverride,
  parseJsonPrefix,
  supportsStructuredOutput,
  registerDynamicModels,
  getDynamicModelCount,
  blockModels,
  unblockModels,
  getBlockedAliases,
  type ModelInfo,
  type ReasoningLevel,
} from '../openrouter/models';
import type { ResponseFormat } from '../openrouter/client';

// Telegram Types
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: TelegramPhotoSize[];
  caption?: string;
  reply_to_message?: TelegramMessage;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

// Inline keyboard types
export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Telegram Bot API client
 */
export class TelegramBot {
  private token: string;
  private baseUrl: string;

  constructor(token: string) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: number, text: string, options?: {
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
    replyToMessageId?: number;
  }): Promise<TelegramMessage> {
    // Truncate if too long (Telegram limit is 4096)
    if (text.length > 4000) {
      text = text.slice(0, 3997) + '...';
    }

    const response = await fetch(`${this.baseUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        reply_to_message_id: options?.replyToMessageId,
      }),
    });

    const result = await response.json() as { ok: boolean; result?: TelegramMessage; description?: string };
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return result.result!;
  }

  /**
   * Send a "typing" action
   */
  async sendChatAction(chatId: number, action: 'typing' | 'upload_photo' = 'typing'): Promise<void> {
    await fetch(`${this.baseUrl}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action,
      }),
    });
  }

  /**
   * Send a photo from URL
   */
  async sendPhoto(chatId: number, photoUrl: string, caption?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
      }),
    });

    const result = await response.json() as { ok: boolean; description?: string };
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
  }

  /**
   * Send a photo from base64 data
   */
  async sendPhotoBase64(chatId: number, base64Data: string, caption?: string): Promise<void> {
    // Extract the actual base64 content (remove data:image/xxx;base64, prefix)
    const base64Match = base64Data.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid base64 image data');
    }

    const mimeType = base64Match[1];
    const base64Content = base64Match[2];

    // Convert base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('chat_id', String(chatId));
    formData.append('photo', new Blob([bytes], { type: `image/${mimeType}` }), `image.${mimeType}`);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await fetch(`${this.baseUrl}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json() as { ok: boolean; description?: string };
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
  }

  /**
   * Get file info
   */
  async getFile(fileId: string): Promise<TelegramFile> {
    const response = await fetch(`${this.baseUrl}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId }),
    });

    const result = await response.json() as { ok: boolean; result?: TelegramFile; description?: string };
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return result.result!;
  }

  /**
   * Download a file and return as base64
   */
  async downloadFileBase64(filePath: string): Promise<string> {
    const url = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64;
  }

  /**
   * Edit a message
   */
  async editMessage(chatId: number, messageId: number, text: string): Promise<void> {
    // Truncate if too long (Telegram limit is 4096)
    if (text.length > 4000) {
      text = text.slice(0, 3997) + '...';
    }

    await fetch(`${this.baseUrl}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
      }),
    });
  }

  /**
   * Edit a message with inline keyboard buttons
   */
  async editMessageWithButtons(
    chatId: number,
    messageId: number,
    text: string,
    buttons: InlineKeyboardButton[][] | null
  ): Promise<void> {
    if (text.length > 4000) {
      text = text.slice(0, 3997) + '...';
    }

    await fetch(`${this.baseUrl}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
      }),
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(chatId: number, messageId: number): Promise<void> {
    await fetch(`${this.baseUrl}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
      }),
    });
  }

  /**
   * Set webhook URL
   */
  async setWebhook(url: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const result = await response.json() as { ok: boolean; description?: string };
    return result.ok;
  }

  /**
   * Send a message with inline keyboard buttons
   */
  async sendMessageWithButtons(
    chatId: number,
    text: string,
    buttons: InlineKeyboardButton[][],
    options?: { parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML' }
  ): Promise<TelegramMessage> {
    // Truncate if too long
    if (text.length > 4000) {
      text = text.slice(0, 3997) + '...';
    }

    const response = await fetch(`${this.baseUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        reply_markup: {
          inline_keyboard: buttons,
        },
      }),
    });

    const result = await response.json() as { ok: boolean; result?: TelegramMessage; description?: string };
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return result.result!;
  }

  /**
   * Answer a callback query (acknowledge button press)
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    options?: { text?: string; showAlert?: boolean }
  ): Promise<void> {
    await fetch(`${this.baseUrl}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: options?.text,
        show_alert: options?.showAlert,
      }),
    });
  }

  /**
   * Edit message reply markup (update buttons)
   */
  async editMessageReplyMarkup(
    chatId: number,
    messageId: number,
    buttons: InlineKeyboardButton[][] | null
  ): Promise<void> {
    await fetch(`${this.baseUrl}/editMessageReplyMarkup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
      }),
    });
  }
}

/**
 * Sync session state for interactive /syncmodels picker
 */
interface SyncModelCandidate {
  alias: string;
  name: string;
  modelId: string;
  contextK: number;
  vision: boolean;
}

interface SyncSession {
  newModels: SyncModelCandidate[];
  staleModels: SyncModelCandidate[];
  selectedAdd: Set<string>;
  selectedRemove: Set<string>;
  chatId: number;
  messageId: number;
}

/**
 * Main handler for Telegram updates
 */
export class TelegramHandler {
  private bot: TelegramBot;
  private openrouter: OpenRouterClient;
  private storage: UserStorage;
  private skills: SkillStorage;
  private defaultSkill: string;
  private cachedSkillPrompt: string | null = null;
  private allowedUsers: Set<string> | null = null; // null = allow all, Set = allowlist
  private githubToken?: string; // GitHub token for tool calls
  private telegramToken: string; // Store for DO
  private openrouterKey: string; // Store for DO
  private taskProcessor?: DurableObjectNamespace<TaskProcessor>; // For long-running tasks
  private browser?: Fetcher; // Browser binding for browse_url tool
  // Direct API keys
  private dashscopeKey?: string;
  private moonshotKey?: string;
  private deepseekKey?: string;
  // Interactive sync sessions (keyed by userId)
  private syncSessions = new Map<string, SyncSession>();

  constructor(
    telegramToken: string,
    openrouterKey: string,
    r2Bucket: R2Bucket,
    workerUrl?: string,
    defaultSkill: string = 'storia-orchestrator',
    allowedUserIds?: string[], // Pass user IDs to restrict access
    githubToken?: string, // GitHub token for tool authentication
    taskProcessor?: DurableObjectNamespace<TaskProcessor>, // DO for long tasks
    browser?: Fetcher, // Browser binding for browse_url tool
    dashscopeKey?: string, // DashScope API key (Qwen)
    moonshotKey?: string, // Moonshot API key (Kimi)
    deepseekKey?: string // DeepSeek API key
  ) {
    this.bot = new TelegramBot(telegramToken);
    this.openrouter = createOpenRouterClient(openrouterKey, workerUrl);
    this.storage = createUserStorage(r2Bucket);
    this.skills = createSkillStorage(r2Bucket);
    this.defaultSkill = defaultSkill;
    this.githubToken = githubToken;
    this.telegramToken = telegramToken;
    this.openrouterKey = openrouterKey;
    this.taskProcessor = taskProcessor;
    this.browser = browser;
    this.dashscopeKey = dashscopeKey;
    this.moonshotKey = moonshotKey;
    this.deepseekKey = deepseekKey;
    if (allowedUserIds && allowedUserIds.length > 0) {
      this.allowedUsers = new Set(allowedUserIds);
    }
    // Load dynamic models from R2 (async, non-blocking)
    this.loadDynamicModelsFromR2();
  }

  /**
   * Load previously synced dynamic models and blocked list from R2 into runtime.
   */
  private async loadDynamicModelsFromR2(): Promise<void> {
    try {
      const data = await this.storage.loadDynamicModels();
      if (data) {
        if (data.models && Object.keys(data.models).length > 0) {
          registerDynamicModels(data.models);
          console.log(`[Telegram] Loaded ${Object.keys(data.models).length} dynamic models from R2`);
        }
        if (data.blocked && data.blocked.length > 0) {
          blockModels(data.blocked);
          console.log(`[Telegram] Loaded ${data.blocked.length} blocked models from R2`);
        }
      }
    } catch (error) {
      console.error('[Telegram] Failed to load dynamic models from R2:', error);
    }
  }

  /**
   * Check if a user is allowed to use the bot
   */
  private isUserAllowed(userId: string): boolean {
    if (this.allowedUsers === null) {
      return true; // No allowlist = allow everyone
    }
    return this.allowedUsers.has(userId);
  }

  /**
   * Get the system prompt from the skill (cached)
   */
  private async getSystemPrompt(): Promise<string> {
    if (this.cachedSkillPrompt) {
      return this.cachedSkillPrompt;
    }

    const skillContent = await this.skills.getSkill(this.defaultSkill);
    if (skillContent) {
      this.cachedSkillPrompt = skillContent;
      return skillContent;
    }

    // Fallback default prompt
    return 'You are a helpful AI assistant. Be concise but thorough. Use markdown formatting when appropriate.';
  }

  /**
   * Handle an incoming update
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallback(update.callback_query);
      }
    } catch (error) {
      console.error('[Telegram] Error handling update:', error);
      // Try to send error message if we have a chat
      const chatId = update.message?.chat.id || update.callback_query?.message?.chat.id;
      if (chatId) {
        try {
          await this.bot.sendMessage(chatId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } catch {
          // Ignore send errors
        }
      }
    }
  }

  /**
   * Handle a message
   */
  private async handleMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const userId = String(message.from?.id || chatId);
    const username = message.from?.username;
    const text = message.text || message.caption || '';

    console.log(`[Telegram] Message from ${userId} (${username}): ${text.slice(0, 100)}`);

    // Check if user is allowed
    if (!this.isUserAllowed(userId)) {
      console.log(`[Telegram] Unauthorized user ${userId} (${username}) blocked`);
      await this.bot.sendMessage(chatId, '⛔ Access denied. This bot is private.');
      return;
    }

    // Check for commands
    if (text.startsWith('/')) {
      await this.handleCommand(message, text);
      return;
    }

    // Check for photo with caption (vision)
    if (message.photo && message.photo.length > 0) {
      await this.handleVision(message);
      return;
    }

    // Regular text message - chat with AI
    if (text) {
      await this.handleChat(message, text);
    }
  }

  /**
   * Handle commands
   */
  private async handleCommand(message: TelegramMessage, text: string): Promise<void> {
    const chatId = message.chat.id;
    const userId = String(message.from?.id || chatId);
    const username = message.from?.username;

    const [command, ...args] = text.split(/\s+/);
    const cmd = command.toLowerCase().replace('@.*$', ''); // Remove bot username if present

    switch (cmd) {
      case '/start':
        await this.bot.sendMessage(chatId, this.getStartMessage());
        break;
      case '/help':
        await this.bot.sendMessage(chatId, this.getHelpMessage());
        break;

      case '/models':
        await this.bot.sendMessage(chatId, formatModelsList());
        break;

      case '/use':
        await this.handleUseCommand(chatId, userId, username, args);
        break;

      case '/model':
        const currentModel = await this.storage.getUserModel(userId);
        const modelInfo = getModel(currentModel);
        await this.bot.sendMessage(
          chatId,
          `Current model: ${modelInfo?.name || currentModel}\n` +
          `Alias: /${currentModel}\n` +
          `${modelInfo?.specialty || ''}\n` +
          `Cost: ${modelInfo?.cost || 'N/A'}`
        );
        break;

      case '/clear':
        await this.storage.clearConversation(userId);
        await this.bot.sendMessage(chatId, 'Conversation history cleared.');
        break;

      case '/img':
        await this.handleImageCommand(chatId, args.join(' '));
        break;

      case '/credits':
        try {
          const credits = await this.openrouter.getCredits();
          await this.bot.sendMessage(
            chatId,
            `OpenRouter Credits\n` +
            `Remaining: $${credits.credits.toFixed(4)}\n` +
            `Used: $${credits.usage.toFixed(4)}`
          );
        } catch (error) {
          await this.bot.sendMessage(chatId, `Failed to get credits: ${error}`);
        }
        break;

      case '/skill':
        await this.handleSkillCommand(chatId, args);
        break;

      case '/ping':
        const startTime = Date.now();
        const pingMsg = await this.bot.sendMessage(chatId, '🏓 Pong!');
        const latency = Date.now() - startTime;
        await this.bot.editMessage(chatId, pingMsg.message_id, `🏓 Pong! (${latency}ms)`);
        break;

      case '/status':
      case '/info':
        const statusModel = await this.storage.getUserModel(userId);
        const statusModelInfo = getModel(statusModel);
        const statusHistory = await this.storage.getConversation(userId, 100);
        const statusAutoResume = await this.storage.getUserAutoResume(userId);
        const hasGithub = !!this.githubToken;
        const hasBrowser = !!this.browser;
        await this.bot.sendMessage(
          chatId,
          `📊 Bot Status\n\n` +
          `Model: ${statusModelInfo?.name || statusModel}\n` +
          `Conversation: ${statusHistory.length} messages\n` +
          `Auto-resume: ${statusAutoResume ? '✓ Enabled' : '✗ Disabled'}\n` +
          `GitHub Tools: ${hasGithub ? '✓ Configured' : '✗ Not configured'}\n` +
          `Browser Tools: ${hasBrowser ? '✓ Configured' : '✗ Not configured'}\n` +
          `Skill: ${this.defaultSkill}\n\n` +
          `Use /automode to toggle auto-resume\n` +
          `Use /clear to reset conversation\n` +
          `Use /models to see available models`
        );
        break;

      case '/new':
        // Alias for /clear - fresh conversation
        await this.storage.clearConversation(userId);
        await this.bot.sendMessage(chatId, '🆕 New conversation started. How can I help you?');
        break;

      case '/automode':
      case '/autoresume':
      case '/ar':
        // Toggle auto-resume mode
        const currentAutoResume = await this.storage.getUserAutoResume(userId);
        const newAutoResume = !currentAutoResume;
        await this.storage.setUserAutoResume(userId, newAutoResume);
        await this.bot.sendMessage(
          chatId,
          newAutoResume
            ? '✓ Auto-resume enabled. Tasks will automatically retry on timeout (up to 10 times).'
            : '✗ Auto-resume disabled. You will need to manually tap Resume when tasks timeout.'
        );
        break;

      case '/pick':
        // Show model picker with inline buttons
        await this.sendModelPicker(chatId);
        break;

      case '/cancel':
        // Cancel any running task
        if (this.taskProcessor) {
          try {
            const doId = this.taskProcessor.idFromName(userId);
            const doStub = this.taskProcessor.get(doId);
            const response = await doStub.fetch(new Request('https://do/cancel', { method: 'POST' }));
            const result = await response.json() as { status: string };
            if (result.status === 'cancelled') {
              // Message already sent by DO
            } else {
              await this.bot.sendMessage(chatId, 'No task is currently running.');
            }
          } catch (error) {
            await this.bot.sendMessage(chatId, 'Failed to cancel task.');
          }
        } else {
          await this.bot.sendMessage(chatId, 'Task processor not available.');
        }
        break;

      case '/saves':
      case '/checkpoints': {
        // List all saved checkpoints
        const checkpoints = await this.storage.listCheckpoints(userId);
        if (checkpoints.length === 0) {
          await this.bot.sendMessage(chatId, '📭 No saved checkpoints found.\n\nCheckpoints are automatically created during long-running tasks.');
          break;
        }

        let msg = '💾 *Saved Checkpoints:*\n\n';
        for (const cp of checkpoints) {
          const age = this.formatAge(cp.savedAt);
          const status = cp.completed ? '✅' : '⏸️';
          const prompt = cp.taskPrompt ? `\n   _${this.escapeMarkdown(cp.taskPrompt.substring(0, 50))}${cp.taskPrompt.length > 50 ? '...' : ''}_` : '';
          msg += `${status} \`${cp.slotName}\` - ${cp.iterations} iters, ${cp.toolsUsed} tools (${age})${prompt}\n`;
        }
        msg += '\n✅=completed ⏸️=interrupted\n_Use /delsave <name> to delete, /saveas <name> to backup_';
        await this.bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
        break;
      }

      case '/saveinfo':
      case '/save': {
        // Show checkpoint details + AI-generated conversation summary
        const slotName = args[0] || 'latest';
        const info = await this.storage.getCheckpointInfo(userId, slotName);
        if (!info) {
          await this.bot.sendMessage(chatId, `📭 No checkpoint found for slot: \`${slotName}\``, { parseMode: 'Markdown' });
          break;
        }

        const age = this.formatAge(info.savedAt);
        const savedDate = new Date(info.savedAt).toLocaleString();
        const statusEmoji = info.completed ? '✅' : '⏸️';
        const statusText = info.completed ? 'Completed' : 'Interrupted';
        let msg = `💾 Checkpoint: ${info.slotName} ${statusEmoji}\n\n`;
        msg += `Iterations: ${info.iterations}\n`;
        msg += `Tools used: ${info.toolsUsed}\n`;
        msg += `Status: ${statusText}\n`;
        msg += `Saved: ${savedDate} (${age})\n`;
        if (info.taskPrompt) {
          msg += `\nTask: ${info.taskPrompt}\n`;
        }

        // Generate a brief AI summary of the conversation content
        try {
          const conversation = await this.storage.getCheckpointConversation(userId, slotName, 15);
          if (conversation && conversation.length > 0) {
            const conversationText = conversation
              .map(m => `${m.role}: ${m.content}`)
              .join('\n');

            const summaryResponse = await this.openrouter.chatCompletion('auto', [
              { role: 'system', content: 'Summarize this conversation in 2-3 short sentences. Focus on what the user asked and what was accomplished. Be concise.' },
              { role: 'user', content: conversationText },
            ], { maxTokens: 150 });

            const summary = extractTextResponse(summaryResponse);
            if (summary) {
              msg += `\n--- Conversation Summary ---\n${summary}`;
            }
          }
        } catch {
          // Summary generation failed, just show metadata
        }

        await this.bot.sendMessage(chatId, msg);
        break;
      }

      case '/delsave':
      case '/delcheckpoint': {
        // Delete a checkpoint
        const slotToDelete = args[0];
        if (!slotToDelete) {
          await this.bot.sendMessage(chatId, '⚠️ Please specify a slot name.\nUsage: `/delsave <name>`\n\nUse `/saves` to see available checkpoints.', { parse_mode: 'Markdown' });
          break;
        }

        const deleted = await this.storage.deleteCheckpoint(userId, slotToDelete);
        if (deleted) {
          await this.bot.sendMessage(chatId, `✅ Deleted checkpoint: \`${slotToDelete}\``, { parse_mode: 'Markdown' });
        } else {
          await this.bot.sendMessage(chatId, `❌ Checkpoint not found: \`${slotToDelete}\``, { parse_mode: 'Markdown' });
        }
        break;
      }

      case '/saveas': {
        // Copy current checkpoint to a named slot (backup)
        const newSlotName = args[0];
        if (!newSlotName) {
          await this.bot.sendMessage(chatId, '⚠️ Please specify a name for the backup.\nUsage: `/saveas <name>`\n\nExample: `/saveas myproject`', { parse_mode: 'Markdown' });
          break;
        }

        // Validate slot name (alphanumeric + dash/underscore only)
        if (!/^[a-zA-Z0-9_-]+$/.test(newSlotName)) {
          await this.bot.sendMessage(chatId, '❌ Invalid slot name. Use only letters, numbers, dash, and underscore.');
          break;
        }

        const copied = await this.storage.copyCheckpoint(userId, 'latest', newSlotName);
        if (copied) {
          await this.bot.sendMessage(chatId, `✅ Current progress backed up to: \`${newSlotName}\`\n\nUse \`/load ${newSlotName}\` to restore later.`, { parse_mode: 'Markdown' });
        } else {
          await this.bot.sendMessage(chatId, '❌ No current checkpoint to backup. Start a long-running task first.');
        }
        break;
      }

      case '/load': {
        // Copy a named slot back to latest (restore)
        const slotToLoad = args[0];
        if (!slotToLoad) {
          await this.bot.sendMessage(chatId, '⚠️ Please specify a slot name to load.\nUsage: `/load <name>`\n\nUse `/saves` to see available checkpoints.', { parse_mode: 'Markdown' });
          break;
        }

        const info = await this.storage.getCheckpointInfo(userId, slotToLoad);
        if (!info) {
          await this.bot.sendMessage(chatId, `❌ Checkpoint not found: \`${slotToLoad}\``, { parse_mode: 'Markdown' });
          break;
        }

        const loaded = await this.storage.copyCheckpoint(userId, slotToLoad, 'latest');
        if (loaded) {
          await this.bot.sendMessage(
            chatId,
            `✅ Loaded checkpoint: \`${slotToLoad}\`\n\n📊 ${info.iterations} iterations, ${info.toolsUsed} tools\n\nUse Resume button or start a new task to continue.`,
            { parse_mode: 'Markdown' }
          );
        } else {
          await this.bot.sendMessage(chatId, '❌ Failed to load checkpoint.');
        }
        break;
      }

      case '/briefing':
      case '/brief':
        await this.handleBriefingCommand(chatId, args);
        break;

      case '/costs':
      case '/usage':
        await this.handleCostsCommand(chatId, userId, args);
        break;

      case '/syncmodels':
      case '/sync':
        await this.handleSyncModelsCommand(chatId, userId);
        break;

      case '/syncreset': {
        // Clear all dynamic models and blocked list from R2
        await this.storage.saveDynamicModels({}, []);
        registerDynamicModels({});
        const currentBlocked = getBlockedAliases();
        if (currentBlocked.length > 0) {
          unblockModels(currentBlocked);
        }
        await this.bot.sendMessage(chatId, '🗑️ Dynamic models and blocked list cleared.\nOnly static catalog models are available now.');
        break;
      }

      default:
        // Check if it's a model alias command (e.g., /deep, /gpt)
        const modelAlias = cmd.slice(1); // Remove leading /
        if (getModel(modelAlias)) {
          await this.handleUseCommand(chatId, userId, username, [modelAlias]);
        } else {
          await this.bot.sendMessage(chatId, `Unknown command: ${cmd}\nType /help for available commands.`);
        }
    }
  }

  /**
   * Handle /use command
   */
  private async handleUseCommand(
    chatId: number,
    userId: string,
    username: string | undefined,
    args: string[]
  ): Promise<void> {
    if (args.length === 0) {
      const currentModel = await this.storage.getUserModel(userId);
      await this.bot.sendMessage(
        chatId,
        `Usage: /use <alias>\nCurrent model: ${currentModel}\n\nExample: /use deep`
      );
      return;
    }

    const alias = args[0].toLowerCase();
    const model = getModel(alias);

    if (!model) {
      await this.bot.sendMessage(
        chatId,
        `Unknown model: ${alias}\nType /models to see available models.`
      );
      return;
    }

    await this.storage.setUserModel(userId, alias, username);
    await this.bot.sendMessage(
      chatId,
      `Model set to: ${model.name}\n` +
      `Alias: /${alias}\n` +
      `${model.specialty}\n` +
      `Cost: ${model.cost}`
    );
  }

  /**
   * Handle /skill command
   */
  private async handleSkillCommand(chatId: number, args: string[]): Promise<void> {
    if (args.length === 0 || args[0] === 'info') {
      // Show current skill info
      const hasSkill = await this.skills.hasSkill(this.defaultSkill);
      const availableSkills = await this.skills.listSkills();

      await this.bot.sendMessage(
        chatId,
        `Current skill: ${this.defaultSkill}\n` +
        `Status: ${hasSkill ? '✓ Loaded from R2' : '✗ Not found (using fallback)'}\n` +
        `Cached: ${this.cachedSkillPrompt ? 'Yes' : 'No'}\n` +
        `\nAvailable skills in R2:\n${availableSkills.length > 0 ? availableSkills.map(s => `  - ${s}`).join('\n') : '  (none found)'}`
      );
      return;
    }

    if (args[0] === 'reload') {
      // Clear cache and reload
      this.cachedSkillPrompt = null;
      const prompt = await this.getSystemPrompt();
      const loaded = prompt !== 'You are a helpful AI assistant. Be concise but thorough. Use markdown formatting when appropriate.';
      await this.bot.sendMessage(
        chatId,
        loaded
          ? `✓ Skill "${this.defaultSkill}" reloaded (${prompt.length} chars)`
          : `✗ Skill "${this.defaultSkill}" not found in R2, using fallback prompt`
      );
      return;
    }

    if (args[0] === 'preview') {
      // Show first 500 chars of the skill prompt
      const prompt = await this.getSystemPrompt();
      const preview = prompt.length > 500 ? prompt.slice(0, 500) + '...' : prompt;
      await this.bot.sendMessage(chatId, `Skill preview:\n\n${preview}`);
      return;
    }

    await this.bot.sendMessage(
      chatId,
      `Usage:\n` +
      `/skill - Show current skill info\n` +
      `/skill reload - Reload skill from R2\n` +
      `/skill preview - Preview skill content`
    );
  }

  /**
   * Handle /img command
   * Usage: /img <prompt> or /img <model> <prompt>
   * Example: /img a cat in space
   * Example: /img fluxmax a detailed portrait
   */
  private async handleImageCommand(chatId: number, promptInput: string): Promise<void> {
    if (!promptInput) {
      await this.bot.sendMessage(
        chatId,
        '🎨 Image Generation\n\n' +
        'Usage: /img <prompt>\n' +
        'Or: /img <model> <prompt>\n\n' +
        'Available models:\n' +
        '  fluxklein - FLUX.2 Klein (fastest, cheapest)\n' +
        '  fluxpro - FLUX.2 Pro (default, balanced)\n' +
        '  fluxflex - FLUX.2 Flex (best for text)\n' +
        '  fluxmax - FLUX.2 Max (highest quality)\n\n' +
        'Examples:\n' +
        '  /img a cat in a basket\n' +
        '  /img fluxmax detailed portrait of a wizard\n' +
        '  /img fluxflex logo with text "HELLO"'
      );
      return;
    }

    // Check if first word is a model alias
    const words = promptInput.split(/\s+/);
    let modelAlias: string | undefined;
    let prompt: string;

    if (words.length > 1 && isImageGenModel(words[0].toLowerCase())) {
      modelAlias = words[0].toLowerCase();
      prompt = words.slice(1).join(' ');
    } else {
      prompt = promptInput;
    }

    await this.bot.sendChatAction(chatId, 'upload_photo');

    try {
      const result = await this.openrouter.generateImage(prompt, modelAlias);
      const imageUrl = result.data[0]?.url;

      if (imageUrl) {
        const caption = modelAlias ? `[${modelAlias}] ${prompt}` : prompt;
        // Check if it's a base64 data URL or regular URL
        if (imageUrl.startsWith('data:image/')) {
          await this.bot.sendPhotoBase64(chatId, imageUrl, caption);
        } else {
          await this.bot.sendPhoto(chatId, imageUrl, caption);
        }
      } else if (result.data[0]?.b64_json) {
        // Handle raw b64_json format
        const caption = modelAlias ? `[${modelAlias}] ${prompt}` : prompt;
        await this.bot.sendPhotoBase64(chatId, `data:image/png;base64,${result.data[0].b64_json}`, caption);
      } else {
        await this.bot.sendMessage(chatId, 'No image was generated. Try a different prompt.');
      }
    } catch (error) {
      await this.bot.sendMessage(chatId, `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle /briefing command
   * Usage: /briefing [lat,lon] [subreddit] [arxiv_category]
   * Example: /briefing
   * Example: /briefing 40.71,-74.01 programming cs.LG
   */
  private async handleBriefingCommand(chatId: number, args: string[]): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');

    // Parse optional arguments
    let latitude = '50.08'; // Prague default
    let longitude = '14.44';
    let subreddit = 'technology';
    let arxivCategory = 'cs.AI';

    if (args.length > 0) {
      // First arg: lat,lon
      const coordMatch = args[0].match(/^(-?[\d.]+),(-?[\d.]+)$/);
      if (coordMatch) {
        latitude = coordMatch[1];
        longitude = coordMatch[2];
      }
    }
    if (args.length > 1) {
      subreddit = args[1];
    }
    if (args.length > 2) {
      arxivCategory = args[2];
    }

    try {
      const briefing = await generateDailyBriefing(latitude, longitude, subreddit, arxivCategory);

      // Split and send if too long for Telegram
      if (briefing.length > 4000) {
        const chunks = this.splitMessage(briefing, 4000);
        for (const chunk of chunks) {
          await this.bot.sendMessage(chatId, chunk);
        }
      } else {
        await this.bot.sendMessage(chatId, briefing);
      }
    } catch (error) {
      await this.bot.sendMessage(chatId, `Briefing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle /costs command
   * Usage: /costs - today's usage
   *        /costs week - 7-day breakdown
   */
  private async handleCostsCommand(chatId: number, userId: string, args: string[]): Promise<void> {
    if (args.length > 0 && args[0].toLowerCase() === 'week') {
      const records = getUsageRange(userId, 7);
      await this.bot.sendMessage(chatId, formatWeekSummary(records));
    } else {
      const record = getUsage(userId);
      await this.bot.sendMessage(chatId, formatUsageSummary(record));
    }
  }

  /**
   * Handle vision (image + text)
   */
  private async handleVision(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const userId = String(message.from?.id || chatId);
    const caption = message.caption || 'What is in this image?';

    await this.bot.sendChatAction(chatId, 'typing');

    // Get user's model
    let modelAlias = await this.storage.getUserModel(userId);

    // Check if model supports vision, fallback if not
    if (!supportsVision(modelAlias)) {
      modelAlias = 'gpt'; // Fallback to GPT-4o for vision
    }

    try {
      // Get the largest photo
      const photo = message.photo![message.photo!.length - 1];
      const file = await this.bot.getFile(photo.file_id);

      if (!file.file_path) {
        await this.bot.sendMessage(chatId, 'Could not download image.');
        return;
      }

      const base64 = await this.bot.downloadFileBase64(file.file_path);

      // Build multimodal user message with image + text
      const visionMessage: ChatMessage = {
        role: 'user',
        content: [
          { type: 'text', text: caption },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
        ],
      };

      // If model supports tools, route through tool-calling path (DO or fallback)
      if (modelSupportsTools(modelAlias)) {
        const history = await this.storage.getConversation(userId, 10);
        const systemPrompt = await this.getSystemPrompt();
        const toolHint = '\n\nYou have access to tools (web browsing, GitHub, weather, news, currency conversion, charts, etc). Use them proactively when a question could benefit from real-time data, external lookups, or verification.';

        const messages: ChatMessage[] = [
          { role: 'system', content: systemPrompt + toolHint },
          ...history.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          visionMessage,
        ];

        if (this.taskProcessor) {
          // Route to Durable Object for vision + tools
          const taskId = `${userId}-${Date.now()}`;
          const autoResume = await this.storage.getUserAutoResume(userId);
          const taskRequest: TaskRequest = {
            taskId,
            chatId,
            userId,
            modelAlias,
            messages,
            telegramToken: this.telegramToken,
            openrouterKey: this.openrouterKey,
            githubToken: this.githubToken,
            dashscopeKey: this.dashscopeKey,
            moonshotKey: this.moonshotKey,
            deepseekKey: this.deepseekKey,
            autoResume,
          };

          const doId = this.taskProcessor.idFromName(userId);
          const doStub = this.taskProcessor.get(doId);
          await doStub.fetch(new Request('https://do/process', {
            method: 'POST',
            body: JSON.stringify(taskRequest),
          }));

          await this.storage.addMessage(userId, 'user', `[Image] ${caption}`);
          return;
        }

        // Fallback: direct tool-calling with vision
        const { finalText, toolsUsed } = await this.openrouter.chatCompletionWithTools(
          modelAlias, messages, {
            maxToolCalls: 10,
            maxTimeMs: 120000,
            toolContext: { githubToken: this.githubToken, browser: this.browser },
          }
        );

        await this.storage.addMessage(userId, 'user', `[Image] ${caption}`);
        await this.storage.addMessage(userId, 'assistant', finalText);
        const toolSuffix = toolsUsed.length > 0 ? `\n\n[Tools: ${toolsUsed.join(', ')}]` : '';
        await this.bot.sendMessage(chatId, finalText + toolSuffix);
        return;
      }

      // Non-tool model: use simple vision call
      const response = await this.openrouter.chatCompletionWithVision(
        modelAlias,
        caption,
        base64,
        'image/jpeg'
      );

      const responseText = extractTextResponse(response);
      await this.storage.addMessage(userId, 'user', `[Image] ${caption}`);
      await this.storage.addMessage(userId, 'assistant', responseText);
      await this.bot.sendMessage(chatId, responseText);
    } catch (error) {
      await this.bot.sendMessage(chatId, `Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle regular chat
   */
  private async handleChat(message: TelegramMessage, text: string): Promise<void> {
    const chatId = message.chat.id;
    const userId = String(message.from?.id || chatId);

    await this.bot.sendChatAction(chatId, 'typing');

    // Parse optional think:LEVEL prefix (e.g., "think:high how do I ...")
    const { level: reasoningLevel, cleanMessage } = parseReasoningOverride(text);
    // Parse optional json: prefix (e.g., "json: list 5 cities")
    const { requestJson, cleanMessage: messageText } = parseJsonPrefix(cleanMessage);

    // Get user's model and conversation history
    let modelAlias = await this.storage.getUserModel(userId);

    // If user's model is image-gen only, fall back to default text model
    if (isImageGenModel(modelAlias)) {
      await this.bot.sendMessage(chatId, `Model /${modelAlias} is image-only. Use /img <prompt> to generate images.\nFalling back to /${DEFAULT_MODEL} for text.`);
      modelAlias = DEFAULT_MODEL;
    }
    const history = await this.storage.getConversation(userId, 10);
    const systemPrompt = await this.getSystemPrompt();

    // Augment system prompt with tool hints for tool-supporting models
    const toolHint = modelSupportsTools(modelAlias)
      ? '\n\nYou have access to tools (web browsing, GitHub, weather, news, currency conversion, charts, etc). Use them proactively when a question could benefit from real-time data, external lookups, or verification. Don\'t hesitate to call tools — they are fast and free.'
      : '';

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt + toolHint,
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: messageText },
    ];

    try {
      let responseText: string;

      // Check if model supports tools
      if (modelSupportsTools(modelAlias)) {
        // Use Durable Object for tool-calling models (unlimited time)
        if (this.taskProcessor) {
          // Route to Durable Object for long-running processing
          const taskId = `${userId}-${Date.now()}`;
          const autoResume = await this.storage.getUserAutoResume(userId);
          // Determine responseFormat if json: prefix was used and model supports it
          const responseFormat: ResponseFormat | undefined =
            requestJson && supportsStructuredOutput(modelAlias)
              ? { type: 'json_object' }
              : undefined;

          const taskRequest: TaskRequest = {
            taskId,
            chatId,
            userId,
            modelAlias,
            messages,
            telegramToken: this.telegramToken,
            openrouterKey: this.openrouterKey,
            githubToken: this.githubToken,
            dashscopeKey: this.dashscopeKey,
            moonshotKey: this.moonshotKey,
            deepseekKey: this.deepseekKey,
            autoResume,
            reasoningLevel: reasoningLevel ?? undefined,
            responseFormat,
          };

          // Get or create DO instance for this user
          const doId = this.taskProcessor.idFromName(userId);
          const doStub = this.taskProcessor.get(doId);

          // Start processing in DO (it will send results directly to Telegram)
          await doStub.fetch(new Request('https://do/process', {
            method: 'POST',
            body: JSON.stringify(taskRequest),
          }));

          // Save user message to history (DO will handle the rest)
          await this.storage.addMessage(userId, 'user', text);

          // Return early - DO handles everything from here
          return;
        }

        // Fallback: Direct processing (with timeout) if DO not available
        let statusMessage: TelegramMessage | null = null;
        let toolCallCount = 0;
        const uniqueTools = new Set<string>();

        try {
          statusMessage = await this.bot.sendMessage(chatId, '⏳ Thinking...');
        } catch {
          // Ignore if status message fails
        }

        const updateStatus = async (toolName: string) => {
          toolCallCount++;
          uniqueTools.add(toolName);

          // Map tool names to user-friendly descriptions
          const toolDescriptions: Record<string, string> = {
            'fetch_url': '🌐 Fetching URL',
            'github_read_file': '📄 Reading file from GitHub',
            'github_list_files': '📁 Listing GitHub files',
            'github_api': '🔧 Calling GitHub API',
          };

          const status = toolDescriptions[toolName] || `🔧 Using ${toolName}`;

          if (statusMessage) {
            try {
              await this.bot.editMessage(
                chatId,
                statusMessage.message_id,
                `⏳ ${status}... (${toolCallCount} tool call${toolCallCount > 1 ? 's' : ''})`
              );
            } catch {
              // Ignore edit failures, send typing instead
              this.bot.sendChatAction(chatId, 'typing');
            }
          } else {
            this.bot.sendChatAction(chatId, 'typing');
          }
        };

        let lastIterationUpdate = 0;
        const updateIteration = async (iteration: number, totalTools: number) => {
          // Update status every 3 iterations to avoid rate limits
          if (iteration - lastIterationUpdate >= 3 || iteration === 1) {
            lastIterationUpdate = iteration;
            if (statusMessage) {
              try {
                await this.bot.editMessage(
                  chatId,
                  statusMessage.message_id,
                  `⏳ Processing... (iteration ${iteration}, ${totalTools} tool calls)`
                );
              } catch {
                // Ignore edit failures
              }
            }
            // Send typing indicator as heartbeat
            this.bot.sendChatAction(chatId, 'typing');
          }
        };

        // Use tool-calling chat completion with higher limits for complex tasks
        // Paid Workers plan allows longer execution via waitUntil()
        const { finalText, toolsUsed, hitLimit } = await this.openrouter.chatCompletionWithTools(
          modelAlias,
          messages,
          {
            maxToolCalls: 50, // High limit for complex multi-file tasks
            maxTimeMs: 120000, // 2 minutes for paid Workers plan
            onToolCall: (toolName, _args) => {
              updateStatus(toolName);
            },
            onIteration: (iteration, totalTools) => {
              updateIteration(iteration, totalTools);
            },
            toolContext: {
              githubToken: this.githubToken,
              browser: this.browser,
            },
            reasoningLevel: reasoningLevel ?? undefined,
            responseFormat: requestJson && supportsStructuredOutput(modelAlias)
              ? { type: 'json_object' }
              : undefined,
          }
        );

        // Delete status message before sending response
        if (statusMessage) {
          try {
            await this.bot.deleteMessage(chatId, statusMessage.message_id);
          } catch {
            // Ignore delete failures
          }
        }

        responseText = finalText;

        // If tools were used, prepend a summary
        if (toolsUsed.length > 0) {
          const toolsSummary = `[Used ${toolsUsed.length} tool(s): ${[...new Set(toolsUsed)].join(', ')}]\n\n`;
          responseText = toolsSummary + responseText;
        }

        // If we hit the limit, add a warning
        if (hitLimit) {
          responseText += '\n\n⚠️ Task was too complex and hit time/iteration limit. Send "continue" to keep going, or break into smaller steps.'
        }
      } else {
        // Regular chat completion without tools
        const response = await this.openrouter.chatCompletion(modelAlias, messages, {
          reasoningLevel: reasoningLevel ?? undefined,
          responseFormat: requestJson && supportsStructuredOutput(modelAlias)
            ? { type: 'json_object' }
            : undefined,
        });
        responseText = extractTextResponse(response);
      }

      // Save to history (use cleaned message without think: prefix)
      await this.storage.addMessage(userId, 'user', messageText);
      await this.storage.addMessage(userId, 'assistant', responseText);

      // Send response (handle long messages)
      if (responseText.length > 4000) {
        // Split into chunks for long responses
        const chunks = this.splitMessage(responseText, 4000);
        for (const chunk of chunks) {
          await this.bot.sendMessage(chatId, chunk);
        }
      } else {
        await this.bot.sendMessage(chatId, responseText);
      }
    } catch (error) {
      await this.bot.sendMessage(chatId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Split a long message into chunks
   */
  private splitMessage(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }

      // Try to split at a newline
      let splitIndex = remaining.lastIndexOf('\n', maxLength);
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        // No good newline, split at space
        splitIndex = remaining.lastIndexOf(' ', maxLength);
      }
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        // No good space, hard split
        splitIndex = maxLength;
      }

      chunks.push(remaining.slice(0, splitIndex));
      remaining = remaining.slice(splitIndex).trim();
    }

    return chunks;
  }

  /**
   * Format a timestamp as relative age (e.g., "2 hours ago")
   */
  private formatAge(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  /**
   * Escape special characters for Telegram Markdown
   */
  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  /**
   * Handle callback queries (from inline keyboards)
   */
  private async handleCallback(query: TelegramCallbackQuery): Promise<void> {
    const callbackData = query.data;
    const userId = String(query.from.id);
    const chatId = query.message?.chat.id;

    console.log('[Telegram] Callback query:', callbackData);

    // Acknowledge the callback immediately
    await this.bot.answerCallbackQuery(query.id);

    if (!callbackData || !chatId) {
      return;
    }

    // Check if user is allowed
    if (!this.isUserAllowed(userId)) {
      return;
    }

    // Parse callback data format: action:param1:param2...
    const parts = callbackData.split(':');
    const action = parts[0];

    switch (action) {
      case 'model':
        // Quick model switch: model:alias
        const modelAlias = parts[1];
        if (modelAlias) {
          await this.handleUseCommand(chatId, userId, query.from.username, [modelAlias]);
          // Remove buttons after selection
          if (query.message) {
            await this.bot.editMessageReplyMarkup(chatId, query.message.message_id, null);
          }
        }
        break;

      case 'confirm':
        // Confirmation action: confirm:yes or confirm:no
        const confirmed = parts[1] === 'yes';
        const confirmAction = parts[2]; // What was being confirmed
        if (query.message) {
          await this.bot.editMessageReplyMarkup(chatId, query.message.message_id, null);
        }
        if (confirmed && confirmAction) {
          await this.bot.sendMessage(chatId, `✓ Confirmed: ${confirmAction}`);
          // Handle the confirmed action based on confirmAction value
        } else {
          await this.bot.sendMessage(chatId, '✗ Cancelled');
        }
        break;

      case 'clear':
        // Clear conversation confirmation
        if (parts[1] === 'yes') {
          await this.storage.clearConversation(userId);
          await this.bot.sendMessage(chatId, '✓ Conversation cleared');
        }
        if (query.message) {
          await this.bot.editMessageReplyMarkup(chatId, query.message.message_id, null);
        }
        break;

      case 'resume':
        // Resume a failed task from checkpoint
        if (this.taskProcessor) {
          // Remove button
          if (query.message) {
            await this.bot.editMessageReplyMarkup(chatId, query.message.message_id, null);
          }

          // Get the last user message from storage to resume with
          const history = await this.storage.getConversation(userId, 1);
          const lastUserMessage = history.find(m => m.role === 'user');

          if (lastUserMessage) {
            // Restart the task - checkpoint will be loaded by DO
            const systemPrompt = await this.getSystemPrompt();
            const messages: ChatMessage[] = [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: lastUserMessage.content },
            ];

            const modelAlias = await this.storage.getUserModel(userId);
            const autoResume = await this.storage.getUserAutoResume(userId);
            const taskId = `${userId}-${Date.now()}`;
            const taskRequest: TaskRequest = {
              taskId,
              chatId,
              userId,
              modelAlias,
              messages,
              telegramToken: this.telegramToken,
              openrouterKey: this.openrouterKey,
              githubToken: this.githubToken,
              dashscopeKey: this.dashscopeKey,
              moonshotKey: this.moonshotKey,
              deepseekKey: this.deepseekKey,
              autoResume,
            };

            const doId = this.taskProcessor.idFromName(userId);
            const doStub = this.taskProcessor.get(doId);
            await doStub.fetch(new Request('https://do/process', {
              method: 'POST',
              body: JSON.stringify(taskRequest),
            }));
          } else {
            await this.bot.sendMessage(chatId, 'No previous message found to resume.');
          }
        }
        break;

      case 's':
        // Sync models picker: s:a:alias (toggle add), s:r:alias (toggle remove), s:ok, s:x
        await this.handleSyncCallback(query, parts, userId, chatId);
        break;

      default:
        console.log('[Telegram] Unknown callback action:', action);
    }
  }

  /**
   * Send a quick model picker
   */
  async sendModelPicker(chatId: number): Promise<void> {
    const buttons: InlineKeyboardButton[][] = [
      [
        { text: '🧠 DeepSeek', callback_data: 'model:deep' },
        { text: '⚡ Grok', callback_data: 'model:grok' },
        { text: '🤖 GPT-4o', callback_data: 'model:gpt' },
      ],
      [
        { text: '🎭 Claude Sonnet', callback_data: 'model:sonnet' },
        { text: '💨 Claude Haiku', callback_data: 'model:haiku' },
        { text: '🔮 Qwen', callback_data: 'model:qwennext' },
      ],
      [
        { text: '🆓 Trinity (Free)', callback_data: 'model:trinity' },
        { text: '🤖 MiMo', callback_data: 'model:mimo' },
      ],
    ];

    await this.bot.sendMessageWithButtons(
      chatId,
      '🤖 Select a model:',
      buttons
    );
  }

  /**
   * Send a confirmation dialog
   */
  async sendConfirmation(
    chatId: number,
    message: string,
    actionId: string
  ): Promise<void> {
    const buttons: InlineKeyboardButton[][] = [
      [
        { text: '✓ Yes', callback_data: `confirm:yes:${actionId}` },
        { text: '✗ No', callback_data: `confirm:no:${actionId}` },
      ],
    ];

    await this.bot.sendMessageWithButtons(chatId, message, buttons);
  }

  /**
   * Generate a short alias from an OpenRouter model ID.
   */
  private generateModelAlias(modelId: string): string {
    return modelId
      .replace(/:free$/, '')
      .replace(/^[^/]+\//, '')   // Remove provider prefix
      .replace(/-(instruct|preview|base|chat)$/i, '')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .substring(0, 14);
  }

  /**
   * Build the sync picker message text from session state.
   */
  private buildSyncMessage(session: SyncSession, totalFree: number, totalApi: number): string {
    const currentModels = getAllModels();
    const catalogCount = Object.values(currentModels).filter(m => m.isFree && !m.isImageGen).length;

    let msg = `🔄 OpenRouter Free Models Sync\n\n`;
    msg += `📊 ${totalFree} free text models on API, ${catalogCount} in catalog\n`;

    if (session.newModels.length > 0) {
      msg += `\n━━━ New (can add) ━━━\n`;
      for (const m of session.newModels) {
        const sel = session.selectedAdd.has(m.alias) ? '☑' : '☐';
        const vis = m.vision ? ' [vision]' : '';
        msg += `${sel} /${m.alias} — ${m.name}${vis}\n`;
        msg += `   ${m.contextK}K ctx | ${m.modelId}\n`;
      }
    }

    if (session.staleModels.length > 0) {
      msg += `\n━━━ Stale (can remove) ━━━\n`;
      for (const m of session.staleModels) {
        const sel = session.selectedRemove.has(m.alias) ? '☑' : '☐';
        msg += `${sel} /${m.alias} — ${m.name}\n`;
        msg += `   No longer free on OpenRouter\n`;
      }
    }

    if (session.newModels.length === 0 && session.staleModels.length === 0) {
      msg += `\n✅ Catalog is up to date — no changes needed.`;
    } else {
      const addCount = session.selectedAdd.size;
      const rmCount = session.selectedRemove.size;
      msg += `\nTap models to select, then Validate.`;
      if (addCount > 0 || rmCount > 0) {
        msg += ` (${addCount} to add, ${rmCount} to remove)`;
      }
    }

    return msg;
  }

  /**
   * Build inline keyboard buttons for the sync picker.
   */
  private buildSyncButtons(session: SyncSession): InlineKeyboardButton[][] {
    const buttons: InlineKeyboardButton[][] = [];

    // New models — 2 per row
    for (let i = 0; i < session.newModels.length; i += 2) {
      const row: InlineKeyboardButton[] = [];
      for (let j = i; j < Math.min(i + 2, session.newModels.length); j++) {
        const m = session.newModels[j];
        const sel = session.selectedAdd.has(m.alias) ? '☑' : '☐';
        row.push({ text: `${sel} ${m.alias}`, callback_data: `s:a:${m.alias}` });
      }
      buttons.push(row);
    }

    // Stale models — 2 per row
    for (let i = 0; i < session.staleModels.length; i += 2) {
      const row: InlineKeyboardButton[] = [];
      for (let j = i; j < Math.min(i + 2, session.staleModels.length); j++) {
        const m = session.staleModels[j];
        const sel = session.selectedRemove.has(m.alias) ? '☑' : '☐';
        row.push({ text: `${sel} ✕ ${m.alias}`, callback_data: `s:r:${m.alias}` });
      }
      buttons.push(row);
    }

    // Bottom row: Validate + Cancel
    const addCount = session.selectedAdd.size;
    const rmCount = session.selectedRemove.size;
    const total = addCount + rmCount;
    buttons.push([
      { text: `✓ Validate${total > 0 ? ` (${total})` : ''}`, callback_data: 's:ok' },
      { text: '✗ Cancel', callback_data: 's:x' },
    ]);

    return buttons;
  }

  /**
   * Handle /syncmodels — fetch free models from OpenRouter and show interactive picker.
   */
  private async handleSyncModelsCommand(chatId: number, userId: string): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');

    try {
      // 1. Fetch models from OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.openrouterKey}`,
          'HTTP-Referer': 'https://moltworker.com',
        },
      });

      if (!response.ok) {
        await this.bot.sendMessage(chatId, `Failed to fetch models from OpenRouter: HTTP ${response.status}`);
        return;
      }

      const rawData = await response.json() as { data: Array<{
        id: string;
        name: string;
        context_length: number;
        architecture: { modality: string };
        pricing: { prompt: string; completion: string };
      }> };

      const allApiModels = rawData.data.map(m => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length,
        modality: m.architecture?.modality || 'text->text',
        promptCost: parseFloat(m.pricing?.prompt || '0'),
        completionCost: parseFloat(m.pricing?.completion || '0'),
      }));

      // 2. Filter for free text models
      const freeApiModels = allApiModels.filter(m =>
        m.promptCost === 0 && m.completionCost === 0 &&
        !m.id.includes('flux') &&
        !m.id.includes('stable-diffusion') &&
        m.modality.includes('text')
      );

      // 3. Compare with current catalog (including dynamic)
      const currentModels = getAllModels();
      const currentIds = new Set(Object.values(currentModels).map(m => m.id));

      // New free models not in our catalog
      const newModels: SyncModelCandidate[] = [];
      const usedAliases = new Set(Object.keys(currentModels));
      for (const m of freeApiModels) {
        if (currentIds.has(m.id)) continue;

        let alias = this.generateModelAlias(m.id);
        // Avoid conflicts
        while (usedAliases.has(alias)) alias = alias + 'f';
        usedAliases.add(alias);

        newModels.push({
          alias,
          name: m.name,
          modelId: m.id,
          contextK: Math.round(m.contextLength / 1024),
          vision: m.modality.includes('image'),
        });
      }

      // Stale: models in catalog as isFree but not found as free on OpenRouter
      const freeApiIds = new Set(freeApiModels.map(m => m.id));
      const staleModels: SyncModelCandidate[] = [];
      for (const m of Object.values(currentModels)) {
        if (!m.isFree || m.isImageGen || m.alias === 'auto') continue;
        if (!freeApiIds.has(m.id)) {
          staleModels.push({
            alias: m.alias,
            name: m.name,
            modelId: m.id,
            contextK: m.maxContext ? Math.round(m.maxContext / 1024) : 0,
            vision: !!m.supportsVision,
          });
        }
      }

      // 4. Create session
      const session: SyncSession = {
        newModels,
        staleModels,
        selectedAdd: new Set(),
        selectedRemove: new Set(),
        chatId,
        messageId: 0, // Set after sending
      };

      // 5. Build message + buttons and send
      const text = this.buildSyncMessage(session, freeApiModels.length, allApiModels.length);
      const buttons = this.buildSyncButtons(session);

      if (newModels.length === 0 && staleModels.length === 0) {
        await this.bot.sendMessage(chatId, text);
        return;
      }

      const sent = await this.bot.sendMessageWithButtons(chatId, text, buttons);
      session.messageId = sent.message_id;
      this.syncSessions.set(userId, session);

    } catch (error) {
      await this.bot.sendMessage(chatId, `Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle sync picker callback queries (toggle, validate, cancel).
   */
  private async handleSyncCallback(
    query: TelegramCallbackQuery,
    parts: string[],
    userId: string,
    chatId: number
  ): Promise<void> {
    const session = this.syncSessions.get(userId);
    if (!session) {
      await this.bot.answerCallbackQuery(query.id, { text: 'Session expired. Run /syncmodels again.' });
      return;
    }

    const subAction = parts[1]; // a=add toggle, r=remove toggle, ok=validate, x=cancel
    const alias = parts[2];

    switch (subAction) {
      case 'a': // Toggle add selection
        if (session.selectedAdd.has(alias)) {
          session.selectedAdd.delete(alias);
        } else {
          session.selectedAdd.add(alias);
        }
        break;

      case 'r': // Toggle remove selection
        if (session.selectedRemove.has(alias)) {
          session.selectedRemove.delete(alias);
        } else {
          session.selectedRemove.add(alias);
        }
        break;

      case 'ok': { // Validate — apply changes
        const addCount = session.selectedAdd.size;
        const rmCount = session.selectedRemove.size;

        if (addCount === 0 && rmCount === 0) {
          await this.bot.answerCallbackQuery(query.id, { text: 'No models selected!' });
          return;
        }

        // Load existing dynamic models to merge
        const existing = await this.storage.loadDynamicModels();
        const dynamicModels = existing?.models || {};
        const blockedList = existing?.blocked || [];

        // Add selected new models
        const addedNames: string[] = [];
        for (const addAlias of session.selectedAdd) {
          const candidate = session.newModels.find(m => m.alias === addAlias);
          if (!candidate) continue;
          dynamicModels[addAlias] = {
            id: candidate.modelId,
            alias: addAlias,
            name: candidate.name,
            specialty: 'Free (synced from OpenRouter)',
            score: `${candidate.contextK}K context`,
            cost: 'FREE',
            isFree: true,
            supportsVision: candidate.vision || undefined,
            maxContext: candidate.contextK * 1024,
          };
          addedNames.push(addAlias);
        }

        // Block selected stale models
        const removedNames: string[] = [];
        for (const rmAlias of session.selectedRemove) {
          if (!blockedList.includes(rmAlias)) {
            blockedList.push(rmAlias);
          }
          // Also remove from dynamic models if present
          delete dynamicModels[rmAlias];
          removedNames.push(rmAlias);
        }

        // Save to R2 and register in runtime
        await this.storage.saveDynamicModels(dynamicModels, blockedList, {
          syncedAt: Date.now(),
          totalFetched: 0,
        });
        registerDynamicModels(dynamicModels);
        blockModels(blockedList);

        // Build result message
        let result = '✅ Sync complete!\n\n';
        if (addedNames.length > 0) {
          result += `Added ${addedNames.length} model(s):\n`;
          for (const a of addedNames) result += `  /${a}\n`;
        }
        if (removedNames.length > 0) {
          result += `Removed ${removedNames.length} model(s):\n`;
          for (const a of removedNames) result += `  /${a}\n`;
        }
        result += '\nChanges are active now and persist across deploys.';

        // Update message, remove buttons
        await this.bot.editMessageWithButtons(chatId, session.messageId, result, null);
        this.syncSessions.delete(userId);
        return;
      }

      case 'x': // Cancel
        await this.bot.editMessageWithButtons(chatId, session.messageId, '🔄 Sync cancelled.', null);
        this.syncSessions.delete(userId);
        return;
    }

    // Re-render the message with updated selections
    const text = this.buildSyncMessage(session, 0, 0);
    const buttons = this.buildSyncButtons(session);
    await this.bot.editMessageWithButtons(chatId, session.messageId, text, buttons);
  }

  /**
   * Get welcome message for /start
   */
  private getStartMessage(): string {
    return `🤖 Welcome to Moltworker!

A multi-model AI assistant with real-time tools.

💬 What can I do?

Chat — Just type a message. I'll answer using whichever AI model you've selected (default: auto-route).

Vision — Send a photo (with or without a caption). I'll analyze it and can combine that with live data lookups.

Tools — When you ask about weather, crypto, news, GitHub repos, or URLs, I automatically call the right tool to get fresh data. No special syntax needed.

Images — /img a cat in space creates an image using FLUX.

Reasoning — Prefix with think:high to activate deep reasoning on models that support it.

JSON — Prefix with json: to get structured JSON output (on supported models).

Briefing — /briefing gives you a daily snapshot: weather, top HN stories, Reddit, and arXiv.

🔧 Quick start:
/pick — Choose a model (button menu)
/models — Full model list with prices
/help — All commands & reference
/new — Clear conversation & start fresh

Tip: /deep and /gpt are good defaults. DeepSeek is cheap with great tools; GPT-4o adds vision.`;
  }

  private getHelpMessage(): string {
    return `📖 Moltworker — Command Reference

━━━ Core ━━━
/use <alias> — Set your model (e.g. /use deep)
/pick — Model picker (buttons)
/model — Show current model
/models — Full model catalog with prices
/new or /clear — Reset conversation
/cancel — Stop a running task
/status — Bot status
/ping — Latency check

━━━ Costs & Credits ━━━
/credits — OpenRouter balance
/costs — Token usage summary
/costs week — Past 7 days breakdown

━━━ Daily Briefing ━━━
/briefing — Weather + HN + Reddit + arXiv digest

━━━ Image Generation ━━━
/img <prompt> — Generate (default: FLUX.2 Pro)
/img fluxmax <prompt> — Pick model
Available: fluxklein, fluxpro, fluxflex, fluxmax

━━━ Checkpoints ━━━
/saves — List saved slots
/saveas <name> — Save current state
/load <name> — Restore state
/delsave <name> — Delete slot
/ar — Toggle auto-resume

━━━ Models (quick switch) ━━━
Paid:  /deep /grok /gpt /sonnet /haiku /flash /mimo
Free:  /trinity /deepfree /qwencoderfree /devstral
All:   /models for full list
/syncmodels — Fetch latest free models from OpenRouter

━━━ 12 Live Tools ━━━
The bot calls these automatically when relevant:
 • get_weather — Current conditions + 7-day forecast
 • get_crypto — Coin price, top N, DEX pairs
 • convert_currency — Live exchange rates
 • fetch_news — HackerNews, Reddit, arXiv
 • fetch_url — Read any web page
 • browse_url — JS-rendered pages, screenshots, PDFs
 • url_metadata — Page title/description/image
 • generate_chart — Chart.js image via QuickChart
 • geolocate_ip — IP to city/country/timezone
 • github_read_file — Read file from any repo
 • github_list_files — List repo directory
 • github_api — Full GitHub API access

━━━ Special Prefixes ━━━
think:high <msg> — Deep reasoning (also: low, medium, off)
json: <msg> — Structured JSON output
Both work together: think:high json: analyze X

━━━ Vision ━━━
Send a photo with a caption — the bot analyzes the image and can call tools based on what it sees (e.g. identify a city, then look up its weather).
Send a photo without caption — defaults to "What is in this image?"
Models with vision: gpt, sonnet, haiku, flash, geminipro, kimi`;
  }

  /**
   * Get the Telegram bot instance (for webhook setup)
   */
  getBot(): TelegramBot {
    return this.bot;
  }
}

/**
 * Create a Telegram handler
 */
export function createTelegramHandler(
  telegramToken: string,
  openrouterKey: string,
  r2Bucket: R2Bucket,
  workerUrl?: string,
  defaultSkill?: string,
  allowedUserIds?: string[],
  githubToken?: string,
  taskProcessor?: DurableObjectNamespace<TaskProcessor>,
  browser?: Fetcher,
  dashscopeKey?: string,
  moonshotKey?: string,
  deepseekKey?: string
): TelegramHandler {
  return new TelegramHandler(
    telegramToken,
    openrouterKey,
    r2Bucket,
    workerUrl,
    defaultSkill,
    allowedUserIds,
    githubToken,
    taskProcessor,
    browser,
    dashscopeKey,
    moonshotKey,
    deepseekKey
  );
}
