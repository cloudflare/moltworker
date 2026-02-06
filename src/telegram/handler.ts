/**
 * Telegram Webhook Handler
 * Handles incoming Telegram updates and routes to appropriate handlers
 */

import { OpenRouterClient, createOpenRouterClient, extractTextResponse, type ChatMessage } from '../openrouter/client';
import { UserStorage, createUserStorage, SkillStorage, createSkillStorage } from '../openrouter/storage';
import { modelSupportsTools } from '../openrouter/tools';
import type { TaskProcessor, TaskRequest } from '../durable-objects/task-processor';
import {
  MODELS,
  getModel,
  getModelId,
  formatModelsList,
  supportsVision,
  isImageGenModel,
  DEFAULT_MODEL,
} from '../openrouter/models';

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
        // Show current save state
        const slotName = args[0] || 'latest';
        const info = await this.storage.getCheckpointInfo(userId, slotName);
        if (!info) {
          await this.bot.sendMessage(chatId, `📭 No checkpoint found for slot: \`${slotName}\``, { parse_mode: 'Markdown' });
          break;
        }

        const age = this.formatAge(info.savedAt);
        const savedDate = new Date(info.savedAt).toLocaleString();
        const statusEmoji = info.completed ? '✅' : '⏸️';
        const statusText = info.completed ? 'Completed' : 'Interrupted';
        let msg = `💾 *Checkpoint: ${info.slotName}* ${statusEmoji}\n\n`;
        msg += `📊 Iterations: ${info.iterations}\n`;
        msg += `🔧 Tools used: ${info.toolsUsed}\n`;
        msg += `📋 Status: ${statusText}\n`;
        msg += `⏰ Saved: ${savedDate} (${age})\n`;
        if (info.taskPrompt) {
          msg += `\n📝 Task:\n_${this.escapeMarkdown(info.taskPrompt)}_`;
        }
        await this.bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
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

      default:
        // Check if it's a model alias command (e.g., /deep, /gpt)
        const modelAlias = cmd.slice(1); // Remove leading /
        if (MODELS[modelAlias]) {
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

    // Get user's model and conversation history
    const modelAlias = await this.storage.getUserModel(userId);
    const history = await this.storage.getConversation(userId, 10);
    const systemPrompt = await this.getSystemPrompt();

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: text },
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
        const response = await this.openrouter.chatCompletion(modelAlias, messages);
        responseText = extractTextResponse(response);
      }

      // Save to history
      await this.storage.addMessage(userId, 'user', text);
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
        { text: '🆓 Mimo (Free)', callback_data: 'model:mimo' },
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
   * Get help message
   */
  private getHelpMessage(): string {
    return `🤖 Moltworker AI Bot

📋 Commands:
/models - List all AI models
/use <alias> - Set your model
/pick - Quick model picker (buttons)
/model - Show current model
/status - Show bot status
/new - Start fresh conversation
/clear - Clear history
/cancel - Cancel running task
/credits - Check OpenRouter credits
/ping - Test bot response

💾 Checkpoint Management:
/saves - List all saved checkpoints
/save [name] - Show checkpoint info
/saveas <name> - Backup current to slot
/load <name> - Restore from slot
/delsave <name> - Delete a checkpoint
/ar - Toggle auto-resume (/automode)

🎨 Image Generation:
/img <prompt> - Generate image
/img fluxmax <prompt> - Use specific model
Models: fluxklein, fluxpro, fluxflex, fluxmax

🔧 Quick Model Switch:
/auto - Auto-route (default)
/deep - DeepSeek V3
/grok - Grok 4.1 (tools)
/qwennext - Qwen3 Coder (tools)
/gpt - GPT-4o (vision+tools)
/sonnet - Claude Sonnet 4.5
/haiku - Claude Haiku 4.5

🆓 Free Models:
/trinity - Premium reasoning
/deepfree - DeepSeek R1
/qwencoderfree - Qwen3 Coder
/llama70free - Llama 3.3 70B
/devstral - Devstral Small

🛠️ Tools:
Models with tools can use GitHub, browse URLs, and more.

💬 Just send a message to chat!
📷 Send a photo with caption for vision.`;
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
