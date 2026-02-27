/**
 * Telegram Webhook Handler
 * Handles incoming Telegram updates and routes to appropriate handlers
 */

import { OpenRouterClient, createOpenRouterClient, extractTextResponse, type ChatMessage } from '../openrouter/client';
import { UserStorage, createUserStorage, SkillStorage, createSkillStorage } from '../openrouter/storage';
import { modelSupportsTools, generateDailyBriefing, geocodeCity, type SandboxLike } from '../openrouter/tools';
import { getUsage, getUsageRange, formatUsageSummary, formatWeekSummary } from '../openrouter/costs';
import { loadLearnings, getRelevantLearnings, formatLearningsForPrompt, formatLearningSummary, loadLastTaskSummary, formatLastTaskForPrompt, loadSessionHistory, getRelevantSessions, formatSessionsForPrompt } from '../openrouter/learnings';
import { createAcontextClient, formatSessionsList } from '../acontext/client';
import {
  buildInitPrompt,
  buildRunPrompt,
  buildRedoPrompt,
  parseOrchestraCommand,
  parseOrchestraResult,
  generateTaskSlug,
  loadOrchestraHistory,
  storeOrchestraTask,
  formatOrchestraHistory,
  fetchRoadmapFromGitHub,
  formatRoadmapStatus,
  findMatchingTasks,
  resetRoadmapTasks,
  createRoadmapResetPR,
  type OrchestraTask,
} from '../orchestra/orchestra';
import type { TaskProcessor, TaskRequest } from '../durable-objects/task-processor';
import { fetchDOWithRetry } from '../utils/do-retry';
import { runSmokeTests, formatTestResults, getTestNames } from './smoke-tests';
import { classifyTaskComplexity } from '../utils/task-classifier';
import { routeByComplexity } from '../openrouter/model-router';
import { markdownToTelegramHtml } from '../utils/telegram-format';
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
  getAutoSyncedModelCount,
  blockModels,
  unblockModels,
  getBlockedAliases,
  applyModelOverrides,
  removeModelOverride,
  getAllModelOverrides,
  isCuratedModel,
  detectToolIntent,
  getFreeToolModels,
  formatOrchestraModelRecs,
  categorizeModel,
  getValueTier,
  resolveTaskModel,
  type ModelInfo,
  type ReasoningLevel,
  type RouterCheckpointMeta,
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
   * Set bot menu commands visible in Telegram UI
   */
  async setMyCommands(commands: { command: string; description: string }[]): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
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
 * Sync session state for interactive /syncmodels picker (persisted in R2)
 */
interface SyncModelCandidate {
  alias: string;
  name: string;
  modelId: string;
  contextK: number;
  vision: boolean;
  tools?: boolean;
  reasoning?: boolean;
  category?: 'coding' | 'reasoning' | 'fast' | 'general';
  description?: string;
}

/** A replacement recommendation: new model is better than existing one in same category */
interface SyncReplacement {
  newAlias: string;
  oldAlias: string;
  reason: string;
}

interface SyncSession {
  newModels: SyncModelCandidate[];
  staleModels: SyncModelCandidate[];
  replacements: SyncReplacement[];
  selectedAdd: string[];
  selectedRemove: string[];
  selectedReplace: string[]; // newAlias values — each replace = add new + block old
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
  private r2Bucket: R2Bucket;
  private defaultSkill: string;
  private cachedSkillPrompt: string | null = null;
  private allowedUsers: Set<string> | null = null; // null = allow all, Set = allowlist
  private githubToken?: string; // GitHub token for tool calls
  private telegramToken: string; // Store for DO
  private openrouterKey: string; // Store for DO
  private braveSearchKey?: string; // Brave Search API key for web_search tool
  private taskProcessor?: DurableObjectNamespace<TaskProcessor>; // For long-running tasks
  private browser?: Fetcher; // Browser binding for browse_url tool
  private sandbox?: SandboxLike; // Sandbox container for sandbox_exec tool
  // Direct API keys
  private dashscopeKey?: string;
  private moonshotKey?: string;
  private deepseekKey?: string;
  // Acontext observability
  private acontextKey?: string;
  private acontextBaseUrl?: string;
  private cloudflareApiToken?: string; // Cloudflare API token for Code Mode MCP
  // (sync sessions now persisted in R2 via storage.saveSyncSession)

  constructor(
    telegramToken: string,
    openrouterKey: string,
    r2Bucket: R2Bucket,
    workerUrl?: string,
    defaultSkill: string = 'storia-orchestrator',
    allowedUserIds?: string[], // Pass user IDs to restrict access
    githubToken?: string, // GitHub token for tool authentication
    braveSearchKey?: string, // Brave Search API key
    taskProcessor?: DurableObjectNamespace<TaskProcessor>, // DO for long tasks
    browser?: Fetcher, // Browser binding for browse_url tool
    dashscopeKey?: string, // DashScope API key (Qwen)
    moonshotKey?: string, // Moonshot API key (Kimi)
    deepseekKey?: string, // DeepSeek API key
    sandbox?: SandboxLike, // Sandbox container for code execution
    acontextKey?: string, // Acontext API key for observability
    acontextBaseUrl?: string, // Acontext API base URL
    cloudflareApiToken?: string // Cloudflare API token for Code Mode MCP
  ) {
    this.bot = new TelegramBot(telegramToken);
    this.openrouter = createOpenRouterClient(openrouterKey, workerUrl);
    this.storage = createUserStorage(r2Bucket);
    this.skills = createSkillStorage(r2Bucket);
    this.r2Bucket = r2Bucket;
    this.defaultSkill = defaultSkill;
    this.githubToken = githubToken;
    this.telegramToken = telegramToken;
    this.openrouterKey = openrouterKey;
    this.braveSearchKey = braveSearchKey;
    this.taskProcessor = taskProcessor;
    this.browser = browser;
    this.sandbox = sandbox;
    this.dashscopeKey = dashscopeKey;
    this.moonshotKey = moonshotKey;
    this.deepseekKey = deepseekKey;
    this.acontextKey = acontextKey;
    this.acontextBaseUrl = acontextBaseUrl;
    this.cloudflareApiToken = cloudflareApiToken;
    if (allowedUserIds && allowedUserIds.length > 0) {
      this.allowedUsers = new Set(allowedUserIds);
    }
    // Load dynamic models from R2 (async, non-blocking)
    this.loadDynamicModelsFromR2();
  }

  /**
   * Load previously synced dynamic models and blocked list from R2 into runtime.
   * Also loads auto-synced full catalog models.
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

    // Also load auto-synced full catalog models
    try {
      const { loadAutoSyncedModels } = await import('../openrouter/model-sync/sync');
      const count = await loadAutoSyncedModels(this.r2Bucket);
      if (count > 0) {
        console.log(`[Telegram] Loaded ${count} auto-synced models from R2`);
      }
    } catch (error) {
      console.error('[Telegram] Failed to load auto-synced models from R2:', error);
    }

    // Load model overrides (patches to curated models, e.g. from /modelupdate).
    // Must run AFTER dynamic models since applyModelOverrides writes to DYNAMIC_MODELS.
    try {
      const overrideData = await this.storage.loadModelOverrides();
      if (overrideData && Object.keys(overrideData.overrides).length > 0) {
        const applied = applyModelOverrides(overrideData.overrides);
        console.log(`[Telegram] Applied ${applied} model overrides from R2`);
      }
    } catch (error) {
      console.error('[Telegram] Failed to load model overrides from R2:', error);
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
   * Get relevant past learnings formatted for system prompt injection.
   * Returns empty string if no relevant learnings found or on error.
   */
  private async getLearningsHint(userId: string, userMessage: string): Promise<string> {
    try {
      const history = await loadLearnings(this.r2Bucket, userId);
      if (!history) return '';
      const relevant = getRelevantLearnings(history, userMessage);
      return formatLearningsForPrompt(relevant);
    } catch {
      return ''; // Non-fatal: skip learnings on error
    }
  }

  /**
   * Get the last completed task summary for cross-task context.
   * Returns empty string if no recent task or on error.
   */
  private async getLastTaskHint(userId: string): Promise<string> {
    try {
      const summary = await loadLastTaskSummary(this.r2Bucket, userId);
      return formatLastTaskForPrompt(summary);
    } catch {
      return ''; // Non-fatal: skip on error
    }
  }

  /**
   * Get relevant session history for cross-session context continuity.
   * Returns empty string if no relevant sessions or on error.
   */
  private async getSessionContext(userId: string, userMessage: string): Promise<string> {
    try {
      const history = await loadSessionHistory(this.r2Bucket, userId);
      if (!history) return '';
      const relevant = getRelevantSessions(history, userMessage);
      return formatSessionsForPrompt(relevant);
    } catch {
      return ''; // Non-fatal: skip on error
    }
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

    // Detect "continue" keyword — route through resume path instead of regular chat.
    // When a task hits the iteration limit, it tells the user to send "continue".
    // Without this, "continue" creates a brand-new task that immediately re-hits the limit.
    if (text.trim().toLowerCase() === 'continue' && this.taskProcessor) {
      await this.handleContinueResume(message);
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
        await this.sendStartMenu(chatId);
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
        const statusAutoRoute = await this.storage.getUserAutoRoute(userId);
        const hasGithub = !!this.githubToken;
        const hasBrowser = !!this.browser;
        const hasSandbox = !!this.sandbox;
        await this.bot.sendMessage(
          chatId,
          `📊 Bot Status\n\n` +
          `Model: ${statusModelInfo?.name || statusModel}\n` +
          `Conversation: ${statusHistory.length} messages\n` +
          `Auto-resume: ${statusAutoResume ? `✓ Enabled (${statusModelInfo?.isFree ? '15x free' : '10x paid'})` : '✗ Disabled'}\n` +
          `Auto-route: ${statusAutoRoute ? '✓ Simple queries → fast model' : '✗ Disabled'}\n` +
          `GitHub Tools: ${hasGithub ? '✓ Configured (read + PR creation)' : '✗ Not configured'}\n` +
          `Browser Tools: ${hasBrowser ? '✓ Configured' : '✗ Not configured'}\n` +
          `Sandbox: ${hasSandbox ? '✓ Available (code execution)' : '✗ Not available'}\n` +
          `Skill: ${this.defaultSkill}\n\n` +
          `Use /automode to toggle auto-resume\n` +
          `Use /autoroute to toggle fast-model routing\n` +
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
            ? '✓ Auto-resume enabled. Tasks will automatically retry on timeout (up to 10x paid, 15x free).'
            : '✗ Auto-resume disabled. You will need to manually tap Resume when tasks timeout.'
        );
        break;

      case '/autoroute': {
        // Toggle auto-routing of simple queries to fast models
        const currentAutoRoute = await this.storage.getUserAutoRoute(userId);
        const newAutoRoute = !currentAutoRoute;
        await this.storage.setUserAutoRoute(userId, newAutoRoute);
        await this.bot.sendMessage(
          chatId,
          newAutoRoute
            ? '✓ Auto-routing enabled. Simple queries (weather, greetings, crypto) will use a fast model for lower latency.'
            : '✗ Auto-routing disabled. All queries will use your selected model.'
        );
        break;
      }

      case '/learnings': {
        // Show task history and learning summary
        const learningHistory = await loadLearnings(this.r2Bucket, userId);
        if (!learningHistory || learningHistory.learnings.length === 0) {
          await this.bot.sendMessage(chatId, '📚 No task history yet. Complete some tasks and check back!');
          break;
        }
        const summary = formatLearningSummary(learningHistory);
        await this.bot.sendMessage(chatId, summary);
        break;
      }

      case '/sessions': {
        // Show recent Acontext sessions
        if (!this.acontextKey) {
          await this.bot.sendMessage(chatId, '⚠️ Acontext not configured. Set ACONTEXT_API_KEY to enable session tracking.');
          break;
        }
        try {
          const acontext = createAcontextClient(this.acontextKey, this.acontextBaseUrl);
          if (!acontext) {
            await this.bot.sendMessage(chatId, '⚠️ Failed to create Acontext client.');
            break;
          }
          const response = await acontext.listSessions({ user: userId, limit: 10, timeDesc: true });
          const formatted = formatSessionsList(response.items);
          await this.bot.sendMessage(chatId, formatted);
        } catch (err) {
          console.error('[Telegram] Failed to list Acontext sessions:', err);
          await this.bot.sendMessage(chatId, '⚠️ Failed to fetch sessions. Try again later.');
        }
        break;
      }

      case '/resume':
        // Resume from checkpoint with optional model override
        if (!this.taskProcessor) {
          await this.bot.sendMessage(chatId, '⚠️ Task processor not available.');
          break;
        }
        await this.handleResumeCommand(chatId, userId, args);
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
            const response = await fetchDOWithRetry(doStub, new Request('https://do/cancel', { method: 'POST' }));
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

      case '/steer': {
        // Inject a steering message into a running task
        const steerInstruction = args.join(' ').trim();
        if (!steerInstruction) {
          await this.bot.sendMessage(chatId,
            '🧭 *Steer a running task*\n\n' +
            'Usage: `/steer <instruction>`\n' +
            'Example: `/steer Use TypeScript instead of Python`\n\n' +
            'The instruction is injected on the next iteration.',
            { parseMode: 'Markdown' }
          );
          break;
        }
        if (this.taskProcessor) {
          try {
            const doId = this.taskProcessor.idFromName(userId);
            const doStub = this.taskProcessor.get(doId);
            const response = await fetchDOWithRetry(doStub, new Request('https://do/steer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ instruction: steerInstruction }),
            }));
            const result = await response.json() as { status: string; queued?: number; error?: string };
            if (result.status === 'steered') {
              await this.bot.sendMessage(chatId, `🧭 Steering message queued. The task will pick it up on its next iteration.`);
            } else if (result.status === 'not_processing') {
              await this.bot.sendMessage(chatId, 'No task is currently running.');
            } else {
              await this.bot.sendMessage(chatId, `Failed to steer: ${result.error || 'unknown'}`);
            }
          } catch (error) {
            await this.bot.sendMessage(chatId, 'Failed to send steering message.');
          }
        } else {
          await this.bot.sendMessage(chatId, 'Task processor not available.');
        }
        break;
      }

      case '/cloudflare':
      case '/cf': {
        // Cloudflare API via Code Mode MCP
        const cfQuery = args.join(' ').trim();
        if (!cfQuery) {
          await this.bot.sendMessage(chatId,
            '☁️ *Cloudflare Code Mode MCP*\n\n' +
            'Access the entire Cloudflare API (2500+ endpoints) in ~1k tokens.\n\n' +
            '*Usage:*\n' +
            '`/cloudflare search list R2 buckets`\n' +
            '`/cloudflare execute <typescript code>`\n' +
            '`/cf search workers list`\n\n' +
            `*Status:* ${this.cloudflareApiToken ? '✅ Token configured' : '❌ CLOUDFLARE_API_TOKEN not set'}`
          );
          break;
        }

        if (!this.cloudflareApiToken) {
          await this.bot.sendMessage(chatId, '❌ CLOUDFLARE_API_TOKEN is not configured. Set it in your environment variables.');
          break;
        }

        // Parse action: first word can be "search" or "execute", default to "search"
        const cfParts = cfQuery.split(/\s+/);
        let cfAction: 'search' | 'execute' = 'search';
        let cfArg = cfQuery;
        if (cfParts[0] === 'search' || cfParts[0] === 'execute') {
          cfAction = cfParts[0] as 'search' | 'execute';
          cfArg = cfParts.slice(1).join(' ');
        }

        if (!cfArg) {
          await this.bot.sendMessage(chatId, '❌ Please provide a query or code after the action.');
          break;
        }

        await this.bot.sendMessage(chatId, cfAction === 'search'
          ? `🔍 Searching Cloudflare API: "${cfArg}"...`
          : '⚡ Executing against Cloudflare API...');

        try {
          const { cloudflareApi: cfApiCall } = await import('../openrouter/tools-cloudflare');
          const cfResult = await cfApiCall(cfAction, cfAction === 'search' ? cfArg : undefined, cfAction === 'execute' ? cfArg : undefined, this.cloudflareApiToken);
          // Truncate for Telegram (max 4096 chars)
          const truncated = cfResult.length > 3900 ? cfResult.slice(0, 3900) + '\n...(truncated)' : cfResult;
          await this.bot.sendMessage(chatId, `☁️ *Cloudflare ${cfAction}:*\n\`\`\`\n${truncated}\n\`\`\``);
        } catch (error) {
          await this.bot.sendMessage(chatId, `❌ Cloudflare API error: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      }

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
          const modelTag = cp.modelAlias ? ` [${cp.modelAlias}]` : '';
          msg += `${status} \`${cp.slotName}\` - ${cp.iterations} iters, ${cp.toolsUsed} tools${modelTag} (${age})${prompt}\n`;
        }
        msg += '\n✅=completed ⏸️=interrupted\n_Use /delsave <name> to delete, /saveas <name> to backup_';
        await this.bot.sendMessage(chatId, msg, { parseMode: 'Markdown' });
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
          await this.bot.sendMessage(chatId, '⚠️ Please specify a slot name.\nUsage: `/delsave <name>`\n\nUse `/saves` to see available checkpoints.', { parseMode: 'Markdown' });
          break;
        }

        const deleted = await this.storage.deleteCheckpoint(userId, slotToDelete);
        if (deleted) {
          await this.bot.sendMessage(chatId, `✅ Deleted checkpoint: \`${slotToDelete}\``, { parseMode: 'Markdown' });
        } else {
          await this.bot.sendMessage(chatId, `❌ Checkpoint not found: \`${slotToDelete}\``, { parseMode: 'Markdown' });
        }
        break;
      }

      case '/saveas': {
        // Copy current checkpoint to a named slot (backup)
        const newSlotName = args[0];
        if (!newSlotName) {
          await this.bot.sendMessage(chatId, '⚠️ Please specify a name for the backup.\nUsage: `/saveas <name>`\n\nExample: `/saveas myproject`', { parseMode: 'Markdown' });
          break;
        }

        // Validate slot name (alphanumeric + dash/underscore only)
        if (!/^[a-zA-Z0-9_-]+$/.test(newSlotName)) {
          await this.bot.sendMessage(chatId, '❌ Invalid slot name. Use only letters, numbers, dash, and underscore.');
          break;
        }

        const copied = await this.storage.copyCheckpoint(userId, 'latest', newSlotName);
        if (copied) {
          await this.bot.sendMessage(chatId, `✅ Current progress backed up to: \`${newSlotName}\`\n\nUse \`/load ${newSlotName}\` to restore later.`, { parseMode: 'Markdown' });
        } else {
          await this.bot.sendMessage(chatId, '❌ No current checkpoint to backup. Start a long-running task first.');
        }
        break;
      }

      case '/load': {
        // Copy a named slot back to latest (restore)
        const slotToLoad = args[0];
        if (!slotToLoad) {
          await this.bot.sendMessage(chatId, '⚠️ Please specify a slot name to load.\nUsage: `/load <name>`\n\nUse `/saves` to see available checkpoints.', { parseMode: 'Markdown' });
          break;
        }

        const info = await this.storage.getCheckpointInfo(userId, slotToLoad);
        if (!info) {
          await this.bot.sendMessage(chatId, `❌ Checkpoint not found: \`${slotToLoad}\``, { parseMode: 'Markdown' });
          break;
        }

        const loaded = await this.storage.copyCheckpoint(userId, slotToLoad, 'latest');
        if (loaded) {
          await this.bot.sendMessage(
            chatId,
            `✅ Loaded checkpoint: \`${slotToLoad}\`\n\n📊 ${info.iterations} iterations, ${info.toolsUsed} tools\n\nUse Resume button or start a new task to continue.`,
            { parseMode: 'Markdown' }
          );
        } else {
          await this.bot.sendMessage(chatId, '❌ Failed to load checkpoint.');
        }
        break;
      }

      case '/orchestra':
      case '/orch':
        await this.handleOrchestraCommand(message, chatId, userId, args);
        break;

      case '/briefing':
      case '/brief':
        await this.handleBriefingCommand(chatId, userId, args);
        break;

      case '/costs':
      case '/usage':
        await this.handleCostsCommand(chatId, userId, args);
        break;

      case '/syncmodels':
      case '/sync':
        await this.handleSyncModelsCommand(chatId, userId);
        break;

      case '/syncall':
        await this.handleSyncAllCommand(chatId, userId);
        break;

      case '/synccheck':
        await this.handleSyncCheckCommand(chatId);
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

      case '/modelupdate':
        await this.handleModelUpdateCommand(chatId, args);
        break;

      case '/test': {
        // Run smoke tests against TaskProcessor DO
        if (!this.taskProcessor) {
          await this.bot.sendMessage(chatId, 'Task processor not available.');
          break;
        }

        const testFilter = args.length > 0 ? args[0] : undefined;

        if (testFilter === 'list') {
          const names = getTestNames();
          await this.bot.sendMessage(chatId,
            'Available smoke tests:\n\n' + names.map(n => `  ${n}`).join('\n') +
            '\n\nUsage: /test [name] — run one test, or /test to run all'
          );
          break;
        }

        await this.bot.sendMessage(chatId,
          `Running smoke tests${testFilter ? ` (filter: ${testFilter})` : ''}...\nThis may take up to 2 minutes.`
        );

        try {
          const results = await runSmokeTests({
            taskProcessor: this.taskProcessor,
            userId,
            chatId,
            telegramToken: this.telegramToken,
            openrouterKey: this.openrouterKey,
            githubToken: this.githubToken,
            braveSearchKey: this.braveSearchKey,
          }, testFilter);

          const summary = formatTestResults(results);
          await this.bot.sendMessage(chatId, summary);
        } catch (err) {
          console.error('[Telegram] Smoke test error:', err);
          await this.bot.sendMessage(chatId, `Smoke test runner failed: ${err instanceof Error ? err.message : String(err)}`);
        }
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

    // Store canonical alias (from model definition), not the user's raw input.
    // This ensures exact-match lookups on subsequent requests.
    const canonicalAlias = model.alias;
    await this.storage.setUserModel(userId, canonicalAlias, username);
    await this.bot.sendMessage(
      chatId,
      `Model set to: ${model.name}\n` +
      `Alias: /${canonicalAlias}\n` +
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
   * Handle /orchestra (/orch) command
   *
   * Subcommands:
   *   /orch set owner/repo  — Lock default repo
   *   /orch unset           — Clear locked repo
   *   /orch init [repo] <description> — Create roadmap
   *   /orch run [repo] [task]         — Execute specific task
   *   /orch next [task]               — Execute next task (uses locked repo)
   *   /orch history                   — Show past tasks
   *   /orch roadmap [repo]            — Display roadmap status
   *   /orch                           — Show help
   */
  private async handleOrchestraCommand(
    message: TelegramMessage,
    chatId: number,
    userId: string,
    args: string[]
  ): Promise<void> {
    const sub = args.length > 0 ? args[0].toLowerCase() : '';

    // /orch history
    if (sub === 'history') {
      const history = await loadOrchestraHistory(this.r2Bucket, userId);
      await this.bot.sendMessage(chatId, formatOrchestraHistory(history));
      return;
    }

    // /orch roadmap [owner/repo] — fetch and display ROADMAP.md status
    if (sub === 'roadmap' || sub === 'status') {
      const maybeRepo = args[1];
      const hasExplicitRepo = maybeRepo && /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(maybeRepo);
      const repo = hasExplicitRepo ? maybeRepo : await this.storage.getOrchestraRepo(userId);
      if (!repo) {
        await this.bot.sendMessage(
          chatId,
          '❌ No repo specified.\n\nUsage: /orch roadmap owner/repo\nOr: /orch set owner/repo first'
        );
        return;
      }
      try {
        const [owner, repoName] = repo.split('/');
        const { content, path } = await fetchRoadmapFromGitHub(owner, repoName, this.githubToken);
        const formatted = formatRoadmapStatus(content, repo, path);
        await this.bot.sendMessage(chatId, formatted);
      } catch (error) {
        await this.bot.sendMessage(
          chatId,
          `❌ ${error instanceof Error ? error.message : 'Failed to fetch roadmap'}`
        );
      }
      return;
    }

    // /orch reset <task|phase> — uncheck completed tasks so /orch next re-runs them
    if (sub === 'reset') {
      const query = args.slice(1).join(' ').trim();
      if (!query) {
        await this.bot.sendMessage(
          chatId,
          '❌ Please specify which task(s) to reset.\n\n' +
          'Usage:\n' +
          '  /orch reset <task name> — Reset a specific task\n' +
          '  /orch reset Phase 2 — Reset all tasks in Phase 2\n\n' +
          'This unchecks completed tasks so `/orch next` picks them up again.\n' +
          'A PR will be created with the roadmap changes.'
        );
        return;
      }
      const lockedRepo = await this.storage.getOrchestraRepo(userId);
      if (!lockedRepo) {
        await this.bot.sendMessage(chatId, '❌ No default repo set.\n\nFirst run: /orch set owner/repo');
        return;
      }
      if (!this.githubToken) {
        await this.bot.sendMessage(chatId, '❌ GitHub token not configured. Cannot create reset PR.');
        return;
      }
      const [owner, repoName] = lockedRepo.split('/');
      try {
        // Fetch roadmap
        await this.bot.sendMessage(chatId, `🔍 Looking for roadmap in ${lockedRepo}...`);
        const { content, path: filePath } = await fetchRoadmapFromGitHub(owner, repoName, this.githubToken);

        // Find and preview matching tasks
        const matchedTasks = findMatchingTasks(content, query);
        if (matchedTasks.length === 0) {
          await this.bot.sendMessage(
            chatId,
            `❌ No tasks found matching "${query}".\n\n` +
            'Use `/orch roadmap` to see all tasks and their exact names.'
          );
          return;
        }

        const doneTasks = matchedTasks.filter(t => t.done);
        if (doneTasks.length === 0) {
          const names = matchedTasks.map(t => `  ⬜ ${t.title}`).join('\n');
          await this.bot.sendMessage(
            chatId,
            `ℹ️ Found ${matchedTasks.length} matching task(s), but none are completed:\n${names}\n\n` +
            'Nothing to reset — these tasks are already pending.'
          );
          return;
        }

        // Perform the reset
        const { modified, resetCount, taskNames } = resetRoadmapTasks(content, query);

        // Create PR
        await this.bot.sendMessage(
          chatId,
          `📝 Resetting ${resetCount} task(s):\n${taskNames.map(t => `  ✅ → ⬜ ${t}`).join('\n')}\n\nCreating PR...`
        );

        const { prUrl } = await createRoadmapResetPR({
          owner,
          repo: repoName,
          filePath,
          newContent: modified,
          taskNames,
          githubToken: this.githubToken,
        });

        await this.bot.sendMessage(
          chatId,
          `✅ Reset PR created!\n\n` +
          `📋 ${resetCount} task(s) unchecked:\n${taskNames.map(t => `  ⬜ ${t}`).join('\n')}\n\n` +
          `🔗 PR: ${prUrl}\n\n` +
          `Once merged, run \`/orch next\` to re-execute these tasks.`
        );
      } catch (error) {
        await this.bot.sendMessage(
          chatId,
          `❌ Reset failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      return;
    }

    // /orch redo <task> — re-implement a previously completed task
    if (sub === 'redo') {
      const taskQuery = args.slice(1).join(' ').trim();
      if (!taskQuery) {
        await this.bot.sendMessage(
          chatId,
          '❌ Please specify which task to redo.\n\n' +
          'Usage:\n' +
          '  /orch redo <task name> — Re-implement a task that was done incorrectly\n\n' +
          'The bot will:\n' +
          '1. Read the current roadmap and find the task\n' +
          '2. Examine what the previous attempt did wrong\n' +
          '3. Re-implement it properly\n' +
          '4. Create a PR with the fix + updated roadmap'
        );
        return;
      }
      const lockedRepo = await this.storage.getOrchestraRepo(userId);
      if (!lockedRepo) {
        await this.bot.sendMessage(chatId, '❌ No default repo set.\n\nFirst run: /orch set owner/repo');
        return;
      }
      // Delegate to executeOrchestra with redo mode
      return this.executeOrchestra(chatId, userId, 'redo', lockedRepo, taskQuery);
    }

    // /orch set owner/repo — lock the default repo
    if (sub === 'set') {
      const repo = args[1];
      if (!repo || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
        await this.bot.sendMessage(chatId, '❌ Usage: /orch set owner/repo\nExample: /orch set PetrAnto/moltworker');
        return;
      }
      await this.storage.setOrchestraRepo(userId, repo);
      await this.bot.sendMessage(chatId, `✅ Default orchestra repo set to: ${repo}\n\nNow you can use:\n  /orch next — execute next roadmap task\n  /orch init <description> — create roadmap`);
      return;
    }

    // /orch unset — clear locked repo
    if (sub === 'unset') {
      await this.storage.setOrchestraRepo(userId, undefined);
      await this.bot.sendMessage(chatId, '✅ Default orchestra repo cleared.');
      return;
    }

    // /orch next [specific task] — shorthand for run with locked repo
    if (sub === 'next') {
      const lockedRepo = await this.storage.getOrchestraRepo(userId);
      if (!lockedRepo) {
        await this.bot.sendMessage(
          chatId,
          '❌ No default repo set.\n\nFirst run: /orch set owner/repo\nThen: /orch next'
        );
        return;
      }
      // Treat remaining args as optional specific task
      const specificTask = args.slice(1).join(' ').trim();
      return this.executeOrchestra(chatId, userId, 'run', lockedRepo, specificTask);
    }

    // /orch init ... — try parsing with init/run/legacy syntax
    // Allow init and run to use locked repo when repo arg is omitted
    if (sub === 'init') {
      const maybeRepo = args[1];
      const hasExplicitRepo = maybeRepo && /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(maybeRepo);
      if (hasExplicitRepo) {
        // /orch init owner/repo <description>
        const prompt = args.slice(2).join(' ').trim();
        if (!prompt) {
          await this.bot.sendMessage(chatId, '❌ Usage: /orch init owner/repo <project description>');
          return;
        }
        // Auto-lock the repo on init
        await this.storage.setOrchestraRepo(userId, maybeRepo);
        return this.executeOrchestra(chatId, userId, 'init', maybeRepo, prompt);
      } else {
        // /orch init <description> — use locked repo
        const lockedRepo = await this.storage.getOrchestraRepo(userId);
        if (!lockedRepo) {
          await this.bot.sendMessage(
            chatId,
            '❌ No default repo set.\n\nEither: /orch init owner/repo <description>\nOr: /orch set owner/repo first'
          );
          return;
        }
        const prompt = args.slice(1).join(' ').trim();
        if (!prompt) {
          await this.bot.sendMessage(chatId, '❌ Usage: /orch init <project description>');
          return;
        }
        return this.executeOrchestra(chatId, userId, 'init', lockedRepo, prompt);
      }
    }

    if (sub === 'run') {
      const maybeRepo = args[1];
      const hasExplicitRepo = maybeRepo && /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(maybeRepo);
      if (hasExplicitRepo) {
        const specificTask = args.slice(2).join(' ').trim();
        return this.executeOrchestra(chatId, userId, 'run', maybeRepo, specificTask);
      } else {
        // /orch run [task] — use locked repo
        const lockedRepo = await this.storage.getOrchestraRepo(userId);
        if (!lockedRepo) {
          await this.bot.sendMessage(
            chatId,
            '❌ No default repo set.\n\nEither: /orch run owner/repo\nOr: /orch set owner/repo first'
          );
          return;
        }
        const specificTask = args.slice(1).join(' ').trim();
        return this.executeOrchestra(chatId, userId, 'run', lockedRepo, specificTask);
      }
    }

    // Legacy: /orch owner/repo <prompt> — treated as run
    const parsed = parseOrchestraCommand(args);
    if (parsed) {
      return this.executeOrchestra(chatId, userId, parsed.mode, parsed.repo, parsed.prompt);
    }

    // No valid subcommand — show help
    const lockedRepo = await this.storage.getOrchestraRepo(userId);
    const repoLine = lockedRepo
      ? `📦 Current repo: ${lockedRepo}\n\n`
      : '📦 No repo set — use /orch set owner/repo first\n\n';

    const modelRecs = formatOrchestraModelRecs();

    await this.bot.sendMessage(
      chatId,
      '🎼 Orchestra Mode — AI-Driven Project Execution\n\n' +
      repoLine +
      '━━━ Quick Start ━━━\n' +
      '/orch set owner/repo — Lock your repo\n' +
      '/orch init <description> — Create roadmap + work log\n' +
      '/orch next — Execute next roadmap task\n\n' +
      '━━━ Full Commands ━━━\n' +
      '/orch init owner/repo <desc> — Create roadmap (explicit repo)\n' +
      '/orch run owner/repo [task] — Run task (explicit repo)\n' +
      '/orch next [task] — Run next task (locked repo)\n' +
      '/orch set owner/repo — Lock default repo\n' +
      '/orch unset — Clear locked repo\n' +
      '/orch history — View past tasks\n' +
      '/orch roadmap — View roadmap status\n' +
      '/orch reset <task> — Uncheck task(s) for re-run\n' +
      '/orch redo <task> — Re-implement a failed task\n\n' +
      modelRecs + '\n\n' +
      '━━━ Workflow ━━━\n' +
      '1. /orch set PetrAnto/myapp\n' +
      '2. /orch init Build a user auth system\n' +
      '3. /orch next  (repeat until done)\n\n' +
      '━━━ Fixing Mistakes ━━━\n' +
      '/orch redo <task> — Bot re-does a bad task\n' +
      '/orch reset <task> — Uncheck, then /orch next\n' +
      '/orch reset Phase 2 — Reset an entire phase'
    );
  }

  /**
   * Execute an orchestra init or run task.
   * Extracted from handleOrchestraCommand to share between subcommands.
   */
  private async executeOrchestra(
    chatId: number,
    userId: string,
    mode: 'init' | 'run' | 'redo',
    repo: string,
    prompt: string
  ): Promise<void> {
    // Verify prerequisites
    if (!this.githubToken) {
      await this.bot.sendMessage(chatId, '❌ GitHub token not configured. Orchestra mode requires GITHUB_TOKEN.');
      return;
    }
    if (!this.taskProcessor) {
      await this.bot.sendMessage(chatId, '❌ Task processor not available. Orchestra mode requires Durable Objects.');
      return;
    }

    const modelAlias = await this.storage.getUserModel(userId);
    const modelInfo = getModel(modelAlias);

    if (!modelInfo?.supportsTools) {
      await this.bot.sendMessage(
        chatId,
        `⚠️ Model /${modelAlias} doesn't support tools. Orchestra needs tool-calling.\n` +
        `Switch to: ${getFreeToolModels().slice(0, 3).map(a => `/${a}`).join(' ')} (free) or /deep /grok /sonnet (paid)`
      );
      return;
    }

    await this.bot.sendChatAction(chatId, 'typing');

    // Load orchestra history for context injection
    const history = await loadOrchestraHistory(this.r2Bucket, userId);
    const previousTasks = history?.tasks.filter(t => t.repo === repo) || [];

    // Build mode-specific system prompt
    let orchestraSystemPrompt: string;
    if (mode === 'init') {
      orchestraSystemPrompt = buildInitPrompt({ repo, modelAlias });
    } else if (mode === 'redo') {
      orchestraSystemPrompt = buildRedoPrompt({
        repo,
        modelAlias,
        previousTasks,
        taskToRedo: prompt,
      });
    } else {
      orchestraSystemPrompt = buildRunPrompt({
        repo,
        modelAlias,
        previousTasks,
        specificTask: prompt || undefined,
      });
    }

    // Inject learnings and last task context
    const contextPrompt = prompt || (mode === 'init' ? 'Create roadmap' : 'Execute next roadmap task');
    const learningsHint = await this.getLearningsHint(userId, contextPrompt);
    const lastTaskHint = await this.getLastTaskHint(userId);
    const sessionContext = await this.getSessionContext(userId, contextPrompt);

    const toolHint = modelInfo.parallelCalls
      ? '\n\nCall multiple tools in parallel when possible (e.g., read multiple files at once).'
      : '';

    // Build messages for the task
    const userMessage = mode === 'init'
      ? prompt
      : mode === 'redo'
      ? `Redo this task: ${prompt}`
      : (prompt || 'Execute the next uncompleted task from the roadmap.');
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: orchestraSystemPrompt + toolHint + learningsHint + lastTaskHint + sessionContext,
      },
      { role: 'user', content: userMessage },
    ];

    // Determine branch name
    const taskSlug = mode === 'init'
      ? 'roadmap-init'
      : mode === 'redo'
      ? `redo-${generateTaskSlug(prompt)}`
      : generateTaskSlug(prompt || 'next-task');
    const branchName = `bot/${taskSlug}-${modelAlias}`;

    // Store the orchestra task entry as "started"
    // OrchestraTask.mode only supports 'init' | 'run', treat redo as run
    const orchestraTask: OrchestraTask = {
      taskId: `orch-${userId}-${Date.now()}`,
      timestamp: Date.now(),
      modelAlias,
      repo,
      mode: mode === 'redo' ? 'run' : mode,
      prompt: (prompt || (mode === 'init' ? 'Roadmap creation' : 'Next roadmap task')).substring(0, 200),
      branchName,
      status: 'started',
      filesChanged: [],
    };
    await storeOrchestraTask(this.r2Bucket, userId, orchestraTask);

    // Dispatch to TaskProcessor DO
    const taskId = `${userId}-${Date.now()}`;
    const autoResume = await this.storage.getUserAutoResume(userId);
    const modeLabel = mode === 'init' ? 'Init' : mode === 'redo' ? 'Redo' : 'Run';
    const taskRequest: TaskRequest = {
      taskId,
      chatId,
      userId,
      modelAlias,
      messages,
      telegramToken: this.telegramToken,
      openrouterKey: this.openrouterKey,
      githubToken: this.githubToken,
      braveSearchKey: this.braveSearchKey,
      cloudflareApiToken: this.cloudflareApiToken,
      dashscopeKey: this.dashscopeKey,
      moonshotKey: this.moonshotKey,
      deepseekKey: this.deepseekKey,
      autoResume,
      prompt: `[Orchestra ${modeLabel}] ${repo}: ${(prompt || 'next task').substring(0, 150)}`,
      acontextKey: this.acontextKey,
      acontextBaseUrl: this.acontextBaseUrl,
    };

    const doId = this.taskProcessor.idFromName(userId);
    const doStub = this.taskProcessor.get(doId);
    await fetchDOWithRetry(doStub, new Request('https://do/process', {
      method: 'POST',
      body: JSON.stringify(taskRequest),
    }));

    await this.storage.addMessage(userId, 'user', `[Orchestra ${modeLabel}: ${repo}] ${prompt || 'next task'}`);

    // Mode-specific confirmation message
    if (mode === 'init') {
      await this.bot.sendMessage(
        chatId,
        `🎼 Orchestra INIT started!\n\n` +
        `📦 Repo: ${repo}\n` +
        `🤖 Model: /${modelAlias}\n` +
        `🌿 Branch: ${branchName}\n\n` +
        `The bot will analyze the repo, create ROADMAP.md + WORK_LOG.md, and open a PR.\n` +
        `Use /cancel to stop.`
      );
    } else if (mode === 'redo') {
      await this.bot.sendMessage(
        chatId,
        `🎼 Orchestra REDO started!\n\n` +
        `📦 Repo: ${repo}\n` +
        `🤖 Model: /${modelAlias}\n` +
        `🌿 Branch: ${branchName}\n` +
        `🔄 Redoing: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}\n\n` +
        `The bot will:\n` +
        `1. Read the roadmap and find the task\n` +
        `2. Examine what the previous attempt did wrong\n` +
        `3. Re-implement it properly\n` +
        `4. Create a PR with the fix + updated roadmap\n\n` +
        `Use /cancel to stop.`
      );
    } else {
      const taskDesc = prompt
        ? `📝 Task: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`
        : '📝 Task: next uncompleted from roadmap';
      await this.bot.sendMessage(
        chatId,
        `🎼 Orchestra RUN started!\n\n` +
        `📦 Repo: ${repo}\n` +
        `🤖 Model: /${modelAlias}\n` +
        `🌿 Branch: ${branchName}\n` +
        `${taskDesc}\n\n` +
        `The bot will read the roadmap, implement the task, update ROADMAP.md + WORK_LOG.md, and create a PR.\n` +
        `Use /cancel to stop.`
      );
    }
  }

  /**
   * Handle /briefing command
   * Usage: /briefing — use saved location (or prompt to set one)
   * Usage: /briefing set <city> — save location for future briefings
   * Usage: /briefing <city> — one-off briefing for that city
   * Usage: /briefing <lat,lon> [subreddit] [arxiv_category] — explicit coords
   */
  private async handleBriefingCommand(chatId: number, userId: string, args: string[]): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');

    let subreddit = 'technology';
    let arxivCategory = 'cs.AI';

    // Handle "set <city>" subcommand
    if (args.length >= 2 && args[0].toLowerCase() === 'set') {
      const cityQuery = args.slice(1).join(' ');
      const geo = await geocodeCity(cityQuery);
      if (!geo) {
        await this.bot.sendMessage(chatId, `Could not find location "${cityQuery}". Try a different city name.`);
        return;
      }
      // Save to user preferences
      const prefs = await this.storage.getPreferences(userId);
      prefs.locationLat = geo.lat;
      prefs.locationLon = geo.lon;
      prefs.locationName = geo.displayName;
      await this.storage.setPreferences(prefs);
      await this.bot.sendMessage(chatId, `Location saved: ${geo.displayName}\nYour briefings will now use this location.`);
      return;
    }

    // Resolve coordinates: explicit coords > city arg > saved pref > no default
    let latitude: string | undefined;
    let longitude: string | undefined;

    if (args.length > 0) {
      // Check for lat,lon format
      const coordMatch = args[0].match(/^(-?[\d.]+),(-?[\d.]+)$/);
      if (coordMatch) {
        latitude = coordMatch[1];
        longitude = coordMatch[2];
        if (args.length > 1) subreddit = args[1];
        if (args.length > 2) arxivCategory = args[2];
      } else {
        // Treat as city name for one-off geocoding
        const cityQuery = args.join(' ');
        const geo = await geocodeCity(cityQuery);
        if (!geo) {
          await this.bot.sendMessage(chatId, `Could not find location "${cityQuery}". Try a different city name or use /briefing set <city> to save your location.`);
          return;
        }
        latitude = geo.lat;
        longitude = geo.lon;
      }
    } else {
      // No args — use saved location
      const prefs = await this.storage.getPreferences(userId);
      if (prefs.locationLat && prefs.locationLon) {
        latitude = prefs.locationLat;
        longitude = prefs.locationLon;
      } else {
        await this.bot.sendMessage(chatId, 'No location set. Use /briefing set <city> to save your location, or /briefing <city> for a one-off briefing.');
        return;
      }
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
        const visionModelInfo = getModel(modelAlias);
        const visionParallelHint = visionModelInfo?.parallelCalls
          ? ' Call multiple tools in parallel when possible.'
          : '';
        const toolHint = `\n\nYou have access to tools (web browsing, GitHub, weather, news, currency conversion, charts, code execution, etc). Use them proactively — don't guess when you can look up real data.${visionParallelHint} Tools are fast and free; prefer using them over making assumptions.`;
        const learningsHint = await this.getLearningsHint(userId, caption);
        const lastTaskHint = await this.getLastTaskHint(userId);
        const sessionCtx = await this.getSessionContext(userId, caption);

        const messages: ChatMessage[] = [
          { role: 'system', content: systemPrompt + toolHint + learningsHint + lastTaskHint + sessionCtx },
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
            braveSearchKey: this.braveSearchKey,
            dashscopeKey: this.dashscopeKey,
            moonshotKey: this.moonshotKey,
            deepseekKey: this.deepseekKey,
            autoResume,
            acontextKey: this.acontextKey,
            acontextBaseUrl: this.acontextBaseUrl,
          };

          const doId = this.taskProcessor.idFromName(userId);
          const doStub = this.taskProcessor.get(doId);
          await fetchDOWithRetry(doStub, new Request('https://do/process', {
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
            toolContext: { githubToken: this.githubToken, braveSearchKey: this.braveSearchKey, cloudflareApiToken: this.cloudflareApiToken, browser: this.browser, sandbox: this.sandbox },
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
   * Resolve the model to use for resume, with escalation logic.
   * If the last checkpoint was on a weak free model and the task is coding-related,
   * suggest (or auto-switch to) a stronger model.
   * @param overrideAlias - User-specified model override from /resume <model>
   * @returns { modelAlias, escalationMsg } - resolved model + optional user message
   */
  private async resolveResumeModel(
    userId: string,
    overrideAlias?: string
  ): Promise<{ modelAlias: string; escalationMsg?: string }> {
    // Get the user's current model
    const userModel = await this.storage.getUserModel(userId);

    // Build checkpoint metadata for the Task Router
    const cpInfo = await this.storage.getCheckpointInfo(userId, 'latest');
    const checkpoint: RouterCheckpointMeta | null = cpInfo
      ? {
          modelAlias: cpInfo.modelAlias,
          iterations: cpInfo.iterations,
          toolsUsed: cpInfo.toolsUsed,
          completed: cpInfo.completed,
          taskPrompt: cpInfo.taskPrompt,
        }
      : null;

    // Delegate to Task Router (single source of truth)
    const decision = resolveTaskModel(userModel, checkpoint, overrideAlias);

    // If the router provided a rationale with escalation hints, surface it
    const escalationMsg = decision.rationale.startsWith('⚠️') || decision.rationale.startsWith('User override')
      ? decision.rationale
      : undefined;

    return { modelAlias: decision.modelAlias, escalationMsg };
  }

  /**
   * Handle "continue" keyword by resuming from checkpoint.
   * Mirrors the resume button callback logic but triggered by text message.
   */
  private async handleContinueResume(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const userId = String(message.from?.id || chatId);

    if (!this.taskProcessor) return;

    await this.bot.sendChatAction(chatId, 'typing');

    // Get the last user message from storage (the original task, not "continue")
    const history = await this.storage.getConversation(userId, 1);
    const lastUserMessage = history.find(m => m.role === 'user');

    if (!lastUserMessage) {
      await this.bot.sendMessage(chatId, 'No previous task found to continue.');
      return;
    }

    // Build minimal messages — checkpoint will be loaded by the TaskProcessor
    const systemPrompt = await this.getSystemPrompt();
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: lastUserMessage.content },
    ];

    const { modelAlias, escalationMsg } = await this.resolveResumeModel(userId);
    if (escalationMsg) {
      await this.bot.sendMessage(chatId, escalationMsg);
    }
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
      braveSearchKey: this.braveSearchKey,
      cloudflareApiToken: this.cloudflareApiToken,
      dashscopeKey: this.dashscopeKey,
      moonshotKey: this.moonshotKey,
      deepseekKey: this.deepseekKey,
      autoResume,
      acontextKey: this.acontextKey,
      acontextBaseUrl: this.acontextBaseUrl,
    };

    const doId = this.taskProcessor.idFromName(userId);
    const doStub = this.taskProcessor.get(doId);
    await fetchDOWithRetry(doStub, new Request('https://do/process', {
      method: 'POST',
      body: JSON.stringify(taskRequest),
    }));

    // Don't add "continue" to conversation history — it's a control command, not content
  }

  /**
   * Handle /resume [model] command — resume from checkpoint with optional model override.
   */
  private async handleResumeCommand(chatId: number, userId: string, args: string[]): Promise<void> {
    if (!this.taskProcessor) return;

    await this.bot.sendChatAction(chatId, 'typing');

    const history = await this.storage.getConversation(userId, 1);
    const lastUserMessage = history.find(m => m.role === 'user');

    if (!lastUserMessage) {
      await this.bot.sendMessage(chatId, 'No previous task found to resume.\n\nUsage: /resume [model]\nExample: /resume deep');
      return;
    }

    // Validate optional model override
    const overrideAlias = args[0]?.toLowerCase();
    if (overrideAlias && !getModel(overrideAlias)) {
      await this.bot.sendMessage(chatId, `Unknown model: ${overrideAlias}\nType /models to see available models.\n\nUsage: /resume [model]`);
      return;
    }

    const { modelAlias, escalationMsg } = await this.resolveResumeModel(userId, overrideAlias);
    if (escalationMsg) {
      await this.bot.sendMessage(chatId, escalationMsg);
    }

    const systemPrompt = await this.getSystemPrompt();
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: lastUserMessage.content },
    ];

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
      braveSearchKey: this.braveSearchKey,
      cloudflareApiToken: this.cloudflareApiToken,
      dashscopeKey: this.dashscopeKey,
      moonshotKey: this.moonshotKey,
      deepseekKey: this.deepseekKey,
      autoResume,
      acontextKey: this.acontextKey,
      acontextBaseUrl: this.acontextBaseUrl,
    };

    const doId = this.taskProcessor.idFromName(userId);
    const doStub = this.taskProcessor.get(doId);
    await fetchDOWithRetry(doStub, new Request('https://do/process', {
      method: 'POST',
      body: JSON.stringify(taskRequest),
    }));
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

    // If user's model was removed/blocked/sunset, fall back to best free model (not /auto)
    if (modelAlias !== DEFAULT_MODEL && !getModel(modelAlias)) {
      const unavailableAlias = modelAlias;
      // Try to find a free model with tools instead of expensive /auto
      const freeModels = getFreeToolModels();
      if (freeModels.length > 0) {
        modelAlias = freeModels[0]; // Best free model (sorted by context size)
        await this.bot.sendMessage(
          chatId,
          `⚠️ Model /${unavailableAlias} is no longer available. Switching to /${modelAlias} (free).\nRun /pick to choose a different model.`
        );
      } else {
        modelAlias = DEFAULT_MODEL;
        await this.bot.sendMessage(
          chatId,
          `⚠️ Model /${unavailableAlias} is no longer available. No free models found — switching to /${DEFAULT_MODEL}.\nRun /pick to choose a model.`
        );
      }
      await this.storage.setUserModel(userId, modelAlias);
    }
    // Classify task complexity to skip expensive R2 reads for trivial queries (Phase 7A.2)
    const fullHistory = await this.storage.getConversation(userId, 10);
    const complexity = classifyTaskComplexity(messageText, fullHistory.length);

    // Route simple queries to fast models when user is on default 'auto' (Phase 7B.2)
    // Use message-only complexity (ignoring conversation length) so that simple messages
    // in long conversations still get routed to fast models.
    const autoRouteEnabled = await this.storage.getUserAutoRoute(userId);
    const routingComplexity = classifyTaskComplexity(messageText, 0);
    const routing = routeByComplexity(modelAlias, routingComplexity, autoRouteEnabled);
    if (routing.wasRouted) {
      console.log(`[ModelRouter] ${routing.reason} (user=${userId})`);
      modelAlias = routing.modelAlias;
    }

    // Simple queries: skip learnings/sessions, keep only last 5 messages
    const history = complexity === 'simple' ? fullHistory.slice(-5) : fullHistory;
    const systemPrompt = await this.getSystemPrompt();

    // Augment system prompt with tool hints for tool-supporting models
    const hasTools = modelSupportsTools(modelAlias);
    const modelInfo = getModel(modelAlias);
    const parallelHint = modelInfo?.parallelCalls
      ? ' Call multiple tools in parallel when possible (e.g., read multiple files at once, fetch multiple URLs simultaneously).'
      : '';
    const toolIntent = detectToolIntent(messageText);
    // Only encourage proactive tool use when the message clearly needs tools
    const toolHint = hasTools
      ? toolIntent.needsTools
        ? `\n\nYou have access to tools (web browsing, GitHub, weather, news, currency conversion, charts, code execution, etc). Use them proactively — don't guess when you can look up real data.${parallelHint} Tools are fast and free; prefer using them over making assumptions.`
        : `\n\nYou have access to tools (web browsing, GitHub, weather, news, currency conversion, charts, code execution, etc). Use them ONLY when the user asks for specific data or actions — do NOT call tools for greetings, capability questions, or general conversation.${parallelHint}`
      : '';

    // Warn user if message needs tools but model doesn't support them
    if (!hasTools) {
      const intent = detectToolIntent(messageText);
      if (intent.needsTools) {
        await this.bot.sendMessage(
          chatId,
          `⚠️ ${intent.reason}\nModel /${modelAlias} doesn't support tools. Switch to a tool model:\n${getFreeToolModels().slice(0, 3).map(a => `/${a}`).join(' ')} (free)\n/deep /grok /gpt (paid)\n\nSending your message anyway — the model will try its best without tools.`
        );
      }
    }

    // Gate expensive R2 loads based on task complexity (Phase 7A.2)
    // Simple queries skip learnings, last-task summary, and session history
    let learningsHint = '';
    let lastTaskHint = '';
    let sessionContext = '';
    if (complexity === 'complex') {
      learningsHint = await this.getLearningsHint(userId, messageText);
      lastTaskHint = await this.getLastTaskHint(userId);
      sessionContext = await this.getSessionContext(userId, messageText);
    }

    // Add conversation boundary hint when history exists to prevent context bleed
    const conversationBoundary = history.length > 0
      ? '\n\nIMPORTANT: Previous messages are provided for context only. Answer ONLY the latest user message. Do NOT re-execute tools or repeat answers from previous turns.'
      : '';

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt + toolHint + learningsHint + lastTaskHint + sessionContext + conversationBoundary,
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: messageText },
    ];

    try {
      let responseText: string;

      // Route through Durable Object when available (unlimited time, checkpointing, auto-resume)
      // All models benefit from DO: tool-supporting models get tools, others get timeout protection
      if (this.taskProcessor) {
        const taskId = `${userId}-${Date.now()}`;
        const autoResume = await this.storage.getUserAutoResume(userId);
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
          braveSearchKey: this.braveSearchKey,
          dashscopeKey: this.dashscopeKey,
          moonshotKey: this.moonshotKey,
          deepseekKey: this.deepseekKey,
          autoResume,
          reasoningLevel: reasoningLevel ?? undefined,
          responseFormat,
          acontextKey: this.acontextKey,
          acontextBaseUrl: this.acontextBaseUrl,
        };

        const doId = this.taskProcessor.idFromName(userId);
        const doStub = this.taskProcessor.get(doId);
        await fetchDOWithRetry(doStub, new Request('https://do/process', {
          method: 'POST',
          body: JSON.stringify(taskRequest),
        }));

        await this.storage.addMessage(userId, 'user', text);
        return;
      }

      // Fallback: Worker-based processing (only when DO not available)
      if (modelSupportsTools(modelAlias)) {
        // Fallback: Direct tool-calling processing (with timeout)
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
              cloudflareApiToken: this.cloudflareApiToken,
              browser: this.browser,
              sandbox: this.sandbox,
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

      // Send response with HTML formatting (handle long messages)
      if (responseText.length > 4000) {
        // Split into chunks for long responses
        const chunks = this.splitMessage(responseText, 4000);
        for (const chunk of chunks) {
          try {
            await this.bot.sendMessage(chatId, markdownToTelegramHtml(chunk), { parseMode: 'HTML' });
          } catch {
            await this.bot.sendMessage(chatId, chunk); // Fallback: plain text
          }
        }
      } else {
        try {
          await this.bot.sendMessage(chatId, markdownToTelegramHtml(responseText), { parseMode: 'HTML' });
        } catch {
          await this.bot.sendMessage(chatId, responseText); // Fallback: plain text
        }
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

            // Check for model escalation (e.g., stalled on weak free model)
            const { modelAlias, escalationMsg } = await this.resolveResumeModel(userId);
            if (escalationMsg) {
              await this.bot.sendMessage(chatId, escalationMsg);
            }
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
              braveSearchKey: this.braveSearchKey,
              dashscopeKey: this.dashscopeKey,
              moonshotKey: this.moonshotKey,
              deepseekKey: this.deepseekKey,
              autoResume,
              acontextKey: this.acontextKey,
              acontextBaseUrl: this.acontextBaseUrl,
            };

            const doId = this.taskProcessor.idFromName(userId);
            const doStub = this.taskProcessor.get(doId);
            await fetchDOWithRetry(doStub, new Request('https://do/process', {
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

      case 'start':
        // /start feature exploration: start:coding, start:research, etc.
        await this.handleStartCallback(parts, chatId, userId);
        break;

      case 'mu':
        // Model update from /synccheck: mu:cost:alias:newcost or mu:allcost
        await this.handleModelUpdateCallback(parts, chatId, query);
        break;

      case 'sa':
        // Sync-all quick-use: sa:<alias> — switch active model
        await this.handleSyncAllUseCallback(query, parts, userId, chatId);
        break;

      default:
        console.log('[Telegram] Unknown callback action:', action);
    }
  }

  /**
   * Handle /start menu button callbacks
   */
  private async handleStartCallback(parts: string[], chatId: number, userId: string): Promise<void> {
    const feature = parts[1];

    // Direct-action buttons
    if (feature === 'pick') {
      await this.sendModelPicker(chatId);
      return;
    }

    if (feature === 'sync') {
      await this.handleSyncAllCommand(chatId, userId);
      return;
    }

    if (feature === 'help') {
      await this.bot.sendMessage(chatId, this.getHelpMessage());
      return;
    }

    if (feature === 'menu') {
      await this.sendStartMenu(chatId);
      return;
    }

    // Sub-menu buttons: start:sub:<group>
    if (feature === 'sub') {
      const group = parts[2];
      await this.sendStartSubMenu(chatId, userId, group);
      return;
    }

    // Action buttons: start:cmd:<command>
    if (feature === 'cmd') {
      await this.handleStartCommandAction(chatId, userId, parts.slice(2).join(':'));
      return;
    }

    // Feature info pages (coding, research, images, etc.)
    const text = this.getStartFeatureText(feature);
    if (text) {
      const buttons: InlineKeyboardButton[][] = [
        [
          { text: '⬅️ Back to Menu', callback_data: 'start:menu' },
          { text: '🤖 Pick Model', callback_data: 'start:pick' },
        ],
      ];
      await this.bot.sendMessageWithButtons(chatId, text, buttons);
    }
  }

  /**
   * Send a sub-menu with action buttons for a specific command group.
   */
  private async sendStartSubMenu(chatId: number, userId: string, group: string): Promise<void> {
    let text: string;
    let buttons: InlineKeyboardButton[][];

    switch (group) {
      case 'models': {
        const current = await this.storage.getUserModel(userId);
        const model = getModel(current);
        text = `🤖 Models\n\nCurrent: ${model?.name || current} (/${current})\n\nQuick switch or browse the full catalog:`;
        buttons = [
          [
            { text: '🤖 Pick a Model', callback_data: 'start:pick' },
            { text: '📋 Full Catalog', callback_data: 'start:cmd:models' },
          ],
          [
            { text: '📊 Current Model', callback_data: 'start:cmd:model' },
          ],
          [
            { text: '⬅️ Back to Menu', callback_data: 'start:menu' },
          ],
        ];
        break;
      }

      case 'saves': {
        text = '💾 Checkpoints & History\n\nSave and restore conversation states:';
        buttons = [
          [
            { text: '📁 List Saves', callback_data: 'start:cmd:saves' },
            { text: '📝 Learnings', callback_data: 'start:cmd:learnings' },
          ],
          [
            { text: '📚 Sessions', callback_data: 'start:cmd:sessions' },
          ],
          [
            { text: '⬅️ Back to Menu', callback_data: 'start:menu' },
          ],
        ];
        break;
      }

      case 'stats': {
        text = '📊 Stats & Monitoring\n\nUsage, costs, and bot health:';
        buttons = [
          [
            { text: '💰 Credits', callback_data: 'start:cmd:credits' },
            { text: '📈 Costs', callback_data: 'start:cmd:costs' },
          ],
          [
            { text: '📋 Weekly Costs', callback_data: 'start:cmd:costsweek' },
            { text: '🏓 Ping', callback_data: 'start:cmd:ping' },
          ],
          [
            { text: 'ℹ️ Status', callback_data: 'start:cmd:status' },
            { text: '🧪 Smoke Tests', callback_data: 'start:cmd:test' },
          ],
          [
            { text: '📰 Daily Briefing', callback_data: 'start:cmd:briefing' },
          ],
          [
            { text: '⬅️ Back to Menu', callback_data: 'start:menu' },
          ],
        ];
        break;
      }

      case 'sync': {
        text = '🔄 Model Sync\n\nKeep your model catalog up to date with OpenRouter:';
        buttons = [
          [
            { text: '🔄 Free Models Sync', callback_data: 'start:cmd:syncmodels' },
            { text: '🌐 Full Sync + Top 20', callback_data: 'start:sync' },
          ],
          [
            { text: '🔍 Check for Updates', callback_data: 'start:cmd:synccheck' },
          ],
          [
            { text: '📋 Model Overrides', callback_data: 'start:cmd:modelupdatelist' },
            { text: '🗑️ Reset Dynamic', callback_data: 'start:cmd:syncreset' },
          ],
          [
            { text: '⬅️ Back to Menu', callback_data: 'start:menu' },
          ],
        ];
        break;
      }

      case 'settings': {
        text = '⚙️ Settings\n\nConfigure bot behavior:';
        buttons = [
          [
            { text: '🔁 Auto-Resume', callback_data: 'start:cmd:ar' },
            { text: '🛤️ Auto-Route', callback_data: 'start:cmd:autoroute' },
          ],
          [
            { text: '🗑️ Clear Chat', callback_data: 'start:cmd:clear' },
            { text: '🎭 Skills', callback_data: 'start:cmd:skill' },
          ],
          [
            { text: '⬅️ Back to Menu', callback_data: 'start:menu' },
          ],
        ];
        break;
      }

      default:
        return;
    }

    await this.bot.sendMessageWithButtons(chatId, text, buttons);
  }

  /**
   * Execute a command from a /start sub-menu button press.
   * Each case mirrors the logic from the main command switch in handleMessage.
   */
  private async handleStartCommandAction(chatId: number, userId: string, cmd: string): Promise<void> {
    switch (cmd) {
      // === Models group ===
      case 'models':
        await this.bot.sendMessage(chatId, formatModelsList());
        break;
      case 'model': {
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
      }

      // === Saves group ===
      case 'saves': {
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
          const modelTag = cp.modelAlias ? ` [${cp.modelAlias}]` : '';
          msg += `${status} \`${cp.slotName}\` - ${cp.iterations} iters, ${cp.toolsUsed} tools${modelTag} (${age})${prompt}\n`;
        }
        msg += '\n✅=completed ⏸️=interrupted\n_Use /delsave <name> to delete, /saveas <name> to backup_';
        await this.bot.sendMessage(chatId, msg, { parseMode: 'Markdown' });
        break;
      }
      case 'learnings': {
        const learningHistory = await loadLearnings(this.r2Bucket, userId);
        if (!learningHistory || learningHistory.learnings.length === 0) {
          await this.bot.sendMessage(chatId, '📚 No task history yet. Complete some tasks and check back!');
          break;
        }
        await this.bot.sendMessage(chatId, formatLearningSummary(learningHistory));
        break;
      }
      case 'sessions': {
        if (!this.acontextKey) {
          await this.bot.sendMessage(chatId, '⚠️ Acontext not configured. Set ACONTEXT_API_KEY to enable session tracking.');
          break;
        }
        try {
          const acontext = createAcontextClient(this.acontextKey, this.acontextBaseUrl);
          if (!acontext) {
            await this.bot.sendMessage(chatId, '⚠️ Failed to create Acontext client.');
            break;
          }
          const response = await acontext.listSessions({ user: userId, limit: 10, timeDesc: true });
          await this.bot.sendMessage(chatId, formatSessionsList(response.items));
        } catch {
          await this.bot.sendMessage(chatId, '⚠️ Failed to fetch sessions. Try again later.');
        }
        break;
      }

      // === Stats group ===
      case 'credits':
        try {
          const credits = await this.openrouter.getCredits();
          await this.bot.sendMessage(
            chatId,
            `OpenRouter Credits\nRemaining: $${credits.credits.toFixed(4)}\nUsed: $${credits.usage.toFixed(4)}`
          );
        } catch (error) {
          await this.bot.sendMessage(chatId, `Failed to get credits: ${error}`);
        }
        break;
      case 'costs':
        await this.handleCostsCommand(chatId, userId, []);
        break;
      case 'costsweek':
        await this.handleCostsCommand(chatId, userId, ['week']);
        break;
      case 'ping': {
        const pingStart = Date.now();
        const pingMsg = await this.bot.sendMessage(chatId, '🏓 Pong!');
        const pingLatency = Date.now() - pingStart;
        await this.bot.editMessage(chatId, pingMsg.message_id, `🏓 Pong! (${pingLatency}ms)`);
        break;
      }
      case 'status': {
        const statusModel = await this.storage.getUserModel(userId);
        const statusModelInfo = getModel(statusModel);
        const statusHistory = await this.storage.getConversation(userId, 100);
        const statusAutoResume = await this.storage.getUserAutoResume(userId);
        const statusAutoRoute = await this.storage.getUserAutoRoute(userId);
        await this.bot.sendMessage(
          chatId,
          `📊 Bot Status\n\n` +
          `Model: ${statusModelInfo?.name || statusModel}\n` +
          `Conversation: ${statusHistory.length} messages\n` +
          `Auto-resume: ${statusAutoResume ? '✓ Enabled' : '✗ Disabled'}\n` +
          `Auto-route: ${statusAutoRoute ? '✓ Enabled' : '✗ Disabled'}\n` +
          `GitHub: ${this.githubToken ? '✓' : '✗'} | Browser: ${this.browser ? '✓' : '✗'} | Sandbox: ${this.sandbox ? '✓' : '✗'}`
        );
        break;
      }
      case 'test':
        if (!this.taskProcessor) {
          await this.bot.sendMessage(chatId, 'Task processor not available.');
          break;
        }
        await this.bot.sendMessage(chatId, 'Running smoke tests...\nThis may take up to 2 minutes.');
        try {
          const testResults = await runSmokeTests({
            taskProcessor: this.taskProcessor,
            userId,
            chatId,
            telegramToken: this.telegramToken,
            openrouterKey: this.openrouterKey,
            githubToken: this.githubToken,
            braveSearchKey: this.braveSearchKey,
          });
          await this.bot.sendMessage(chatId, formatTestResults(testResults));
        } catch (error) {
          await this.bot.sendMessage(chatId, `❌ Test error: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      case 'briefing':
        await this.handleBriefingCommand(chatId, userId, []);
        break;

      // === Sync group ===
      case 'syncmodels':
        await this.handleSyncModelsCommand(chatId, userId);
        break;
      case 'synccheck':
        await this.handleSyncCheckCommand(chatId);
        break;
      case 'syncreset': {
        await this.storage.saveDynamicModels({}, []);
        registerDynamicModels({});
        const blocked = getBlockedAliases();
        if (blocked.length > 0) unblockModels(blocked);
        await this.bot.sendMessage(chatId, '🗑️ Dynamic models and blocked list cleared.\nOnly static catalog models are available now.');
        break;
      }
      case 'modelupdatelist':
        await this.handleModelUpdateCommand(chatId, ['list']);
        break;

      // === Settings group ===
      case 'ar': {
        const curAR = await this.storage.getUserAutoResume(userId);
        const newAR = !curAR;
        await this.storage.setUserAutoResume(userId, newAR);
        await this.bot.sendMessage(chatId, newAR
          ? '✓ Auto-resume enabled. Tasks will automatically retry on timeout.'
          : '✗ Auto-resume disabled.');
        break;
      }
      case 'autoroute': {
        const curRoute = await this.storage.getUserAutoRoute(userId);
        const newRoute = !curRoute;
        await this.storage.setUserAutoRoute(userId, newRoute);
        await this.bot.sendMessage(chatId, newRoute
          ? '✓ Auto-routing enabled. Simple queries → fast model.'
          : '✗ Auto-routing disabled.');
        break;
      }
      case 'clear':
        await this.storage.clearConversation(userId);
        await this.bot.sendMessage(chatId, '🆕 Conversation history cleared.');
        break;
      case 'skill':
        await this.handleSkillCommand(chatId, []);
        break;
    }
  }

  /**
   * Send a quick model picker
   */
  async sendModelPicker(chatId: number): Promise<void> {
    const all = Object.values(getAllModels());
    const toolModels = all.filter(m => m.supportsTools && !m.isImageGen);

    // Score models for picker ranking (higher = better pick)
    const scored = toolModels.map(m => {
      let score = 0;
      const lower = (m.name + ' ' + m.specialty + ' ' + m.score).toLowerCase();
      // SWE-Bench scores
      const sweMatch = m.score.match(/(\d+(?:\.\d+)?)%\s*SWE/i);
      if (sweMatch) score += parseFloat(sweMatch[1]);
      // Agentic / coding keywords
      if (/agentic|coding/i.test(lower)) score += 15;
      // Large context is a bonus
      if ((m.maxContext || 0) >= 200000) score += 5;
      // Vision is nice
      if (m.supportsVision) score += 3;
      // Parallel calls
      if (m.parallelCalls) score += 2;
      return { m, score };
    });

    // Free models with tools — top 3 by score
    const freeScored = scored
      .filter(s => s.m.isFree)
      .sort((a, b) => b.score - a.score);
    const freeTop = freeScored.slice(0, 3);

    // Paid value models (exceptional + great tier) — top 3 by score
    const paidValue = scored
      .filter(s => !s.m.isFree && ['exceptional', 'great'].includes(getValueTier(s.m)))
      .sort((a, b) => b.score - a.score);
    const valueTop = paidValue.slice(0, 3);

    // Premium flagships — top 3 by score
    const premium = scored
      .filter(s => !s.m.isFree && ['good', 'premium'].includes(getValueTier(s.m)))
      .sort((a, b) => b.score - a.score);
    const premiumTop = premium.slice(0, 3);

    const makeButton = (m: ModelInfo, prefix: string): InlineKeyboardButton => {
      const icons = [m.supportsTools && '🔧', m.supportsVision && '👁️'].filter(Boolean).join('');
      // Truncate name to fit Telegram button (max ~20 chars visible)
      const shortName = m.name.length > 14 ? m.name.slice(0, 13) + '…' : m.name;
      return { text: `${prefix} ${shortName} ${icons}`, callback_data: `model:${m.alias}` };
    };

    const buttons: InlineKeyboardButton[][] = [];
    if (freeTop.length > 0) {
      buttons.push(freeTop.map(s => makeButton(s.m, '🆓')));
    }
    if (valueTop.length > 0) {
      buttons.push(valueTop.map(s => makeButton(s.m, '🏆')));
    }
    if (premiumTop.length > 0) {
      buttons.push(premiumTop.map(s => makeButton(s.m, '💎')));
    }

    const totalCount = all.filter(m => !m.isImageGen).length;
    await this.bot.sendMessageWithButtons(
      chatId,
      `🤖 Top models (${totalCount} available):\n🆓 = free  🏆 = best value  💎 = premium\n🔧 = tools  👁️ = vision\n\nFull list: /models`,
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
   * Detect replacement recommendations: new models that are better than existing ones in the same category.
   */
  private detectReplacements(newModels: SyncModelCandidate[], currentModels: Record<string, ModelInfo>): SyncReplacement[] {
    const replacements: SyncReplacement[] = [];
    const existingFree = Object.values(currentModels).filter(m => m.isFree && !m.isImageGen);

    for (const newModel of newModels) {
      const newCat = newModel.category || 'general';

      for (const existing of existingFree) {
        const existingCat = categorizeModel(existing.id, existing.name, false);
        if (existingCat !== newCat) continue;

        const existingCtxK = existing.maxContext ? Math.round(existing.maxContext / 1024) : 0;
        const reasons: string[] = [];

        // Bigger context window is a significant upgrade
        if (newModel.contextK > existingCtxK * 1.5 && existingCtxK > 0) {
          reasons.push(`${newModel.contextK}K vs ${existingCtxK}K ctx`);
        }
        // Gains tool support
        if (newModel.tools && !existing.supportsTools) {
          reasons.push('adds tool support 🔧');
        }
        // Gains reasoning
        if (newModel.reasoning && !existing.reasoning) {
          reasons.push('adds reasoning');
        }

        if (reasons.length > 0) {
          replacements.push({
            newAlias: newModel.alias,
            oldAlias: existing.alias,
            reason: reasons.join(', '),
          });
        }
      }
    }
    return replacements;
  }

  /**
   * Build the sync picker message text from session state.
   */
  private buildSyncMessage(session: SyncSession): string {
    const currentModels = getAllModels();
    const catalogCount = Object.values(currentModels).filter(m => m.isFree && !m.isImageGen).length;

    const categoryLabels: Record<string, string> = {
      coding: '💻 Coding & Agents',
      reasoning: '🧠 Reasoning & Math',
      fast: '⚡ Fast & Light',
      general: '🌐 General',
    };

    let msg = `🔄 Free Models Sync\n`;
    msg += `📊 ${catalogCount} free models in catalog\n`;

    // Group new models by category
    if (session.newModels.length > 0) {
      const byCategory = new Map<string, SyncModelCandidate[]>();
      for (const m of session.newModels) {
        const cat = m.category || 'general';
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(m);
      }

      // Show categories in priority order: coding > reasoning > fast > general
      const catOrder = ['coding', 'reasoning', 'fast', 'general'];
      for (const cat of catOrder) {
        const models = byCategory.get(cat);
        if (!models || models.length === 0) continue;

        msg += `\n━━━ ${categoryLabels[cat] || cat} (new) ━━━\n`;
        for (const m of models) {
          const isAdded = session.selectedAdd.includes(m.alias);
          const isReplacing = session.selectedReplace.includes(m.alias);
          const sel = (isAdded || isReplacing) ? '☑' : '☐';
          const badges = [m.vision ? '👁️' : '', m.tools ? '🔧' : '', m.reasoning ? '💭' : ''].filter(Boolean).join('');
          const badgeStr = badges ? ` ${badges}` : '';
          msg += `${sel} /${m.alias} — ${m.name}${badgeStr}\n`;
          // Show replacement recommendation if exists
          const repl = session.replacements.find(r => r.newAlias === m.alias);
          if (repl) {
            msg += `   ${m.contextK}K ctx | ↑ replaces /${repl.oldAlias} (${repl.reason})\n`;
          } else {
            msg += `   ${m.contextK}K ctx\n`;
          }
          if (m.description) {
            // Truncate description to keep message manageable
            const desc = m.description.length > 60 ? m.description.slice(0, 57) + '...' : m.description;
            msg += `   ${desc}\n`;
          }
        }
      }
    }

    if (session.staleModels.length > 0) {
      msg += `\n━━━ ❌ No Longer Free ━━━\n`;
      for (const m of session.staleModels) {
        const sel = session.selectedRemove.includes(m.alias) ? '☑' : '☐';
        msg += `${sel} /${m.alias} — ${m.name}\n`;
      }
    }

    if (session.newModels.length === 0 && session.staleModels.length === 0) {
      msg += `\n✅ Catalog is up to date — no changes needed.`;
    } else {
      const addCount = session.selectedAdd.length;
      const replCount = session.selectedReplace.length;
      const rmCount = session.selectedRemove.length;
      msg += `\nTap to select. ↻ = add & replace old.`;
      const parts: string[] = [];
      if (addCount > 0) parts.push(`${addCount} add`);
      if (replCount > 0) parts.push(`${replCount} replace`);
      if (rmCount > 0) parts.push(`${rmCount} remove`);
      if (parts.length > 0) msg += ` (${parts.join(', ')})`;
    }

    return msg;
  }

  /**
   * Build inline keyboard buttons for the sync picker.
   */
  private buildSyncButtons(session: SyncSession): InlineKeyboardButton[][] {
    const buttons: InlineKeyboardButton[][] = [];

    // New models — each gets Add button, plus Replace button if replacement exists
    for (const m of session.newModels) {
      const row: InlineKeyboardButton[] = [];
      const isAdded = session.selectedAdd.includes(m.alias);
      const isReplacing = session.selectedReplace.includes(m.alias);

      // Capability badges for buttons
      const btnBadges = [m.tools ? '🔧' : '', m.vision ? '👁️' : ''].filter(Boolean).join('');
      const badgeSuffix = btnBadges ? ` ${btnBadges}` : '';

      // Add button
      const addSel = isAdded ? '☑' : '☐';
      row.push({ text: `${addSel} + ${m.alias}${badgeSuffix}`, callback_data: `s:a:${m.alias}` });

      // Replace button (if this model has a replacement recommendation)
      const repl = session.replacements.find(r => r.newAlias === m.alias);
      if (repl) {
        const replSel = isReplacing ? '☑' : '☐';
        row.push({ text: `${replSel} ↻ ${m.alias}→${repl.oldAlias}`, callback_data: `s:rp:${m.alias}` });
      }

      buttons.push(row);
    }

    // Stale models — 2 per row
    for (let i = 0; i < session.staleModels.length; i += 2) {
      const row: InlineKeyboardButton[] = [];
      for (let j = i; j < Math.min(i + 2, session.staleModels.length); j++) {
        const m = session.staleModels[j];
        const sel = session.selectedRemove.includes(m.alias) ? '☑' : '☐';
        row.push({ text: `${sel} ✕ ${m.alias}`, callback_data: `s:r:${m.alias}` });
      }
      buttons.push(row);
    }

    // Bottom row: Validate + Cancel
    const addCount = session.selectedAdd.length;
    const replCount = session.selectedReplace.length;
    const rmCount = session.selectedRemove.length;
    const total = addCount + replCount + rmCount;
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
        description?: string;
        context_length: number;
        architecture: { modality: string };
        pricing: { prompt: string; completion: string };
        supported_parameters?: string[];
      }> };

      const allApiModels = rawData.data.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        contextLength: m.context_length,
        modality: m.architecture?.modality || 'text->text',
        promptCost: parseFloat(m.pricing?.prompt || '0'),
        completionCost: parseFloat(m.pricing?.completion || '0'),
        supportsTools: Array.isArray(m.supported_parameters) && m.supported_parameters.includes('tools'),
        supportsReasoning: Array.isArray(m.supported_parameters) && m.supported_parameters.includes('reasoning'),
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

        const hasReasoning = m.supportsReasoning;
        const contextK = Math.round(m.contextLength / 1024);
        newModels.push({
          alias,
          name: m.name,
          modelId: m.id,
          contextK,
          vision: m.modality.includes('image'),
          tools: m.supportsTools,
          reasoning: hasReasoning,
          category: categorizeModel(m.id, m.name, hasReasoning),
          description: m.description ? m.description.split(/[.\n]/)[0].trim() : undefined,
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
            tools: !!m.supportsTools,
          });
        }
      }

      // 4. Detect replacement recommendations
      const replacements = this.detectReplacements(newModels, currentModels);

      // 5. Create session
      const session: SyncSession = {
        newModels,
        staleModels,
        replacements,
        selectedAdd: [],
        selectedRemove: [],
        selectedReplace: [],
        chatId,
        messageId: 0,
      };

      // 5. Build message + buttons and send
      const text = this.buildSyncMessage(session);
      const buttons = this.buildSyncButtons(session);

      if (newModels.length === 0 && staleModels.length === 0) {
        await this.bot.sendMessage(chatId, text);
        return;
      }

      const sent = await this.bot.sendMessageWithButtons(chatId, text, buttons);
      session.messageId = sent.message_id;

      // Persist session to R2 (Workers are stateless — in-memory state lost between requests)
      await this.storage.saveSyncSession(userId, session);

    } catch (error) {
      await this.bot.sendMessage(chatId, `Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle /syncall — run full model catalog sync from OpenRouter.
   * Syncs ALL models (not just free), updates R2, registers in runtime,
   * and shows top 20 recommended models with quick-use buttons.
   */
  private async handleSyncAllCommand(chatId: number, userId: string): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');
    await this.bot.sendMessage(chatId, '🌐 Running full model catalog sync from OpenRouter...');

    try {
      const { runFullSync } = await import('../openrouter/model-sync/sync');
      const result = await runFullSync(this.r2Bucket, this.openrouterKey);

      if (result.success) {
        // Stats message
        const lines = [
          '✅ Full catalog sync complete!\n',
          `📊 ${result.totalFetched} models fetched from OpenRouter`,
          `📦 ${result.totalSynced} models synced (explore tier)`,
          `🆕 ${result.newModels} new models`,
          `⏳ ${result.staleModels} stale/deprecated`,
          `🗑️ ${result.removedModels} removed`,
          `⚡ ${result.durationMs}ms`,
        ];
        await this.bot.sendMessage(chatId, lines.join('\n'));

        // Top 20 recommendations with buttons
        if (result.topModels && result.topModels.length > 0) {
          const currentModel = await this.storage.getUserModel(userId);
          const { text, buttons } = this.buildTopModelsMessage(result.topModels, currentModel);
          await this.bot.sendMessageWithButtons(chatId, text, buttons);
        }
      } else {
        await this.bot.sendMessage(chatId, `❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Sync error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build the top models recommendation message with quick-use buttons.
   */
  private buildTopModelsMessage(
    topModels: Array<{ alias: string; name: string; score: number; contextK: number; tools: boolean; vision: boolean; reasoning: boolean; isFree: boolean; cost: string; category: string }>,
    currentModel: string,
  ): { text: string; buttons: InlineKeyboardButton[][] } {
    const categoryLabels: Record<string, string> = {
      coding: '💻 Coding',
      reasoning: '🧠 Reasoning',
      fast: '⚡ Fast',
      general: '🌐 General',
    };

    let text = '🏆 Top 20 Recommended Models\n';
    text += 'Ranked by capabilities, context, cost & provider.\n';
    text += 'Tap to switch your active model.\n';

    // Group by category
    const byCategory = new Map<string, typeof topModels>();
    for (const m of topModels) {
      const cat = m.category || 'general';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(m);
    }

    const catOrder = ['coding', 'reasoning', 'fast', 'general'];
    for (const cat of catOrder) {
      const models = byCategory.get(cat);
      if (!models || models.length === 0) continue;

      text += `\n━━━ ${categoryLabels[cat] || cat} ━━━\n`;
      for (const m of models) {
        const badges = [
          m.tools ? '🔧' : '',
          m.vision ? '👁️' : '',
          m.reasoning ? '💭' : '',
        ].filter(Boolean).join('');
        const badgeStr = badges ? ` ${badges}` : '';
        const active = m.alias === currentModel ? ' ◀️' : '';
        const freeTag = m.isFree ? ' FREE' : ` ${m.cost}`;
        text += `/${m.alias} — ${m.name}${badgeStr}${active}\n`;
        text += `   ${m.contextK}K ctx |${freeTag}\n`;
      }
    }

    // Build buttons: 2 per row
    const buttons: InlineKeyboardButton[][] = [];
    for (let i = 0; i < topModels.length; i += 2) {
      const row: InlineKeyboardButton[] = [];
      for (let j = i; j < Math.min(i + 2, topModels.length); j++) {
        const m = topModels[j];
        const badges = [m.tools ? '🔧' : '', m.vision ? '👁️' : ''].filter(Boolean).join('');
        const suffix = badges ? ` ${badges}` : '';
        const active = m.alias === currentModel ? ' ◀️' : '';
        row.push({
          text: `${m.alias}${suffix}${active}`,
          callback_data: `sa:${m.alias}`,
        });
      }
      buttons.push(row);
    }

    return { text, buttons };
  }

  /**
   * Handle /synccheck — compare curated models against live OpenRouter catalog.
   * Detects missing models, price changes, and new models from tracked families.
   */
  private async handleSyncCheckCommand(chatId: number): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');
    await this.bot.sendMessage(chatId, '🔍 Checking curated models against live OpenRouter catalog...');

    try {
      const { runSyncCheck, formatSyncCheckMessage } = await import('../openrouter/model-sync/synccheck');
      const result = await runSyncCheck(this.openrouterKey);
      const message = formatSyncCheckMessage(result);

      // Build actionable buttons for price changes and missing models
      const priceChanged = result.curatedChecks.filter(c => c.status === 'price_changed');
      const buttons: InlineKeyboardButton[][] = [];

      if (priceChanged.length > 0) {
        // Offer to update cost for each changed model
        for (const m of priceChanged.slice(0, 5)) { // Cap at 5 buttons
          buttons.push([{
            text: `💰 Update /${m.alias} cost → ${m.liveCost}`,
            callback_data: `mu:cost:${m.alias}:${m.liveCost}`,
          }]);
        }
      }

      // Offer to apply ALL price updates at once if multiple
      if (priceChanged.length > 1) {
        buttons.push([{
          text: `⚡ Apply all ${priceChanged.length} price updates`,
          callback_data: 'mu:allcost',
        }]);
      }

      if (buttons.length > 0) {
        await this.bot.sendMessageWithButtons(chatId, message, buttons);
      } else {
        await this.bot.sendMessage(chatId, message);
      }
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Sync check error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle /modelupdate command — patch curated model fields without code deploy.
   *
   * Usage:
   *   /modelupdate <alias> <key>=<value> [key=value ...]
   *   /modelupdate sonnet id=anthropic/claude-sonnet-4.6 name="Claude Sonnet 4.6"
   *   /modelupdate sonnet revert   (remove override, revert to static catalog)
   *   /modelupdate list             (show all active overrides)
   *
   * Allowed keys: id, name, cost, score, specialty, maxContext, supportsTools,
   *               supportsVision, parallelCalls, structuredOutput, reasoning
   */
  private async handleModelUpdateCommand(chatId: number, args: string[]): Promise<void> {
    if (args.length === 0) {
      await this.bot.sendMessage(chatId, `🔧 /modelupdate — Patch curated models without deploy

Usage:
  /modelupdate <alias> <key>=<value> ...
  /modelupdate <alias> revert
  /modelupdate list

Examples:
  /modelupdate sonnet id=anthropic/claude-sonnet-4.6 name="Claude Sonnet 4.6"
  /modelupdate sonnet cost=$3/$15 score="81% SWE, 200K ctx"
  /modelupdate opus45 revert

Allowed keys: id, name, cost, score, specialty, maxContext, supportsTools, supportsVision, parallelCalls, structuredOutput, reasoning`);
      return;
    }

    // /modelupdate list — show active overrides
    if (args[0] === 'list') {
      const overrides = getAllModelOverrides();
      if (Object.keys(overrides).length === 0) {
        await this.bot.sendMessage(chatId, '📋 No active model overrides. All models using static catalog values.');
        return;
      }
      const lines = ['📋 Active model overrides:\n'];
      for (const [alias, patch] of Object.entries(overrides)) {
        const base = MODELS[alias];
        const fields = Object.entries(patch)
          .map(([k, v]) => `  ${k}: ${(base as unknown as Record<string, unknown>)?.[k]} → ${v}`)
          .join('\n');
        lines.push(`/${alias}:\n${fields}`);
      }
      await this.bot.sendMessage(chatId, lines.join('\n\n'));
      return;
    }

    const alias = args[0].replace(/^\//, '').toLowerCase();

    // Validate alias exists in static catalog
    if (!isCuratedModel(alias)) {
      await this.bot.sendMessage(chatId, `❌ /${alias} is not a curated model. Only static catalog models can be overridden.`);
      return;
    }

    // /modelupdate <alias> revert — remove override
    if (args[1] === 'revert') {
      const removed = removeModelOverride(alias);
      if (removed) {
        // Persist to R2
        const overrides = getAllModelOverrides();
        await this.storage.saveModelOverrides(overrides);
        const base = MODELS[alias];
        await this.bot.sendMessage(chatId, `✅ /${alias} reverted to static catalog.\nModel ID: ${base.id}\nName: ${base.name}`);
      } else {
        await this.bot.sendMessage(chatId, `ℹ️ /${alias} has no override — already using static catalog.`);
      }
      return;
    }

    // Parse key=value pairs
    const ALLOWED_STRING_KEYS = new Set(['id', 'name', 'cost', 'score', 'specialty', 'reasoning']);
    const ALLOWED_NUMBER_KEYS = new Set(['maxContext']);
    const ALLOWED_BOOL_KEYS = new Set(['supportsTools', 'supportsVision', 'parallelCalls', 'structuredOutput']);

    const patch: Record<string, unknown> = {};
    const rawPairs = args.slice(1).join(' ');

    // Parse key=value and key="quoted value" pairs
    const pairRegex = /(\w+)=("(?:[^"\\]|\\.)*"|[^\s]+)/g;
    let match;
    while ((match = pairRegex.exec(rawPairs)) !== null) {
      const key = match[1];
      let value: string = match[2];
      // Strip surrounding quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"');
      }

      if (ALLOWED_STRING_KEYS.has(key)) {
        patch[key] = value;
      } else if (ALLOWED_NUMBER_KEYS.has(key)) {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          await this.bot.sendMessage(chatId, `❌ Invalid number for ${key}: ${value}`);
          return;
        }
        patch[key] = num;
      } else if (ALLOWED_BOOL_KEYS.has(key)) {
        patch[key] = value === 'true' || value === '1' || value === 'yes';
      } else {
        await this.bot.sendMessage(chatId, `❌ Unknown key: ${key}\nAllowed: ${[...ALLOWED_STRING_KEYS, ...ALLOWED_NUMBER_KEYS, ...ALLOWED_BOOL_KEYS].join(', ')}`);
        return;
      }
    }

    if (Object.keys(patch).length === 0) {
      await this.bot.sendMessage(chatId, '❌ No valid key=value pairs found.\nExample: /modelupdate sonnet id=anthropic/claude-sonnet-4.6');
      return;
    }

    // Apply the override
    const applied = applyModelOverrides({ [alias]: patch as Partial<ModelInfo> });
    if (applied === 0) {
      await this.bot.sendMessage(chatId, `❌ Failed to apply override for /${alias}.`);
      return;
    }

    // Persist to R2
    const allOverrides = getAllModelOverrides();
    await this.storage.saveModelOverrides(allOverrides);

    // Show result
    const updatedModel = getModel(alias);
    const base = MODELS[alias];
    const changes = Object.entries(patch)
      .map(([k, v]) => `  ${k}: ${(base as unknown as Record<string, unknown>)?.[k]} → ${v}`)
      .join('\n');

    await this.bot.sendMessage(chatId,
      `✅ /${alias} updated:\n${changes}\n\nNow: ${updatedModel?.name} (${updatedModel?.id})\nCost: ${updatedModel?.cost}\n\n💡 Use /modelupdate ${alias} revert to undo.`
    );
  }

  /**
   * Handle model update button callbacks from /synccheck actionable results.
   * Callback data formats:
   *   mu:cost:<alias>:<newCost>  — update cost for single model
   *   mu:allcost                 — apply all price updates (re-runs synccheck)
   */
  private async handleModelUpdateCallback(
    parts: string[],
    chatId: number,
    query: TelegramCallbackQuery
  ): Promise<void> {
    const subAction = parts[1];

    if (subAction === 'cost' && parts[2] && parts[3]) {
      const alias = parts[2];
      const newCost = parts.slice(3).join(':'); // Cost may contain $
      if (!isCuratedModel(alias)) {
        await this.bot.sendMessage(chatId, `❌ /${alias} is not a curated model.`);
        return;
      }
      applyModelOverrides({ [alias]: { cost: newCost } });
      const allOverrides = getAllModelOverrides();
      await this.storage.saveModelOverrides(allOverrides);
      // Remove buttons from message
      if (query.message) {
        await this.bot.editMessageReplyMarkup(chatId, query.message.message_id, null);
      }
      await this.bot.sendMessage(chatId, `✅ /${alias} cost updated → ${newCost}`);
    } else if (subAction === 'allcost') {
      // Re-run synccheck and apply all price changes
      try {
        const { runSyncCheck } = await import('../openrouter/model-sync/synccheck');
        const result = await runSyncCheck(this.openrouterKey);
        const priceChanged = result.curatedChecks.filter(c => c.status === 'price_changed');
        if (priceChanged.length === 0) {
          await this.bot.sendMessage(chatId, 'ℹ️ No price changes found (already up to date).');
          return;
        }
        const overridePatches: Record<string, Partial<ModelInfo>> = {};
        for (const m of priceChanged) {
          if (m.liveCost) {
            overridePatches[m.alias] = { cost: m.liveCost };
          }
        }
        applyModelOverrides(overridePatches);
        const allOverrides = getAllModelOverrides();
        await this.storage.saveModelOverrides(allOverrides);
        // Remove buttons from message
        if (query.message) {
          await this.bot.editMessageReplyMarkup(chatId, query.message.message_id, null);
        }
        const lines = priceChanged.map(m => `  /${m.alias}: ${m.curatedCost} → ${m.liveCost}`);
        await this.bot.sendMessage(chatId, `✅ Updated ${priceChanged.length} model prices:\n${lines.join('\n')}`);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Failed to apply: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Handle /syncall top-model quick-use button: immediately switch active model.
   * Callback data: sa:<alias>
   */
  private async handleSyncAllUseCallback(
    query: TelegramCallbackQuery,
    parts: string[],
    userId: string,
    chatId: number,
  ): Promise<void> {
    const alias = parts[1];
    if (!alias) {
      await this.bot.answerCallbackQuery(query.id, { text: 'Invalid button data.' });
      return;
    }

    const model = getModel(alias);
    if (!model) {
      await this.bot.answerCallbackQuery(query.id, { text: `Model /${alias} not found.` });
      return;
    }

    await this.storage.setUserModel(userId, model.alias);
    await this.bot.answerCallbackQuery(query.id, {
      text: `Switched to ${model.name}`,
    });
    await this.bot.sendMessage(
      chatId,
      `✅ Model set to: ${model.name}\n` +
      `Alias: /${model.alias}\n` +
      `${model.specialty}\n` +
      `Cost: ${model.cost}`
    );
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
    // Load session from R2 (persists across Worker instances)
    const session = await this.storage.loadSyncSession(userId) as SyncSession | null;
    if (!session) {
      await this.bot.answerCallbackQuery(query.id, { text: 'Session expired. Run /syncmodels again.' });
      return;
    }

    const subAction = parts[1]; // a=add, r=remove, rp=replace, ok=validate, x=cancel
    const alias = parts[2];

    switch (subAction) {
      case 'a': { // Toggle add selection (deselect replace if active)
        const idx = session.selectedAdd.indexOf(alias);
        if (idx >= 0) {
          session.selectedAdd.splice(idx, 1);
        } else {
          session.selectedAdd.push(alias);
          // Deselect replace for same alias (mutually exclusive)
          const rpIdx = session.selectedReplace.indexOf(alias);
          if (rpIdx >= 0) session.selectedReplace.splice(rpIdx, 1);
        }
        break;
      }

      case 'rp': { // Toggle replace selection (deselect add if active)
        const idx = session.selectedReplace.indexOf(alias);
        if (idx >= 0) {
          session.selectedReplace.splice(idx, 1);
        } else {
          session.selectedReplace.push(alias);
          // Deselect add for same alias (mutually exclusive)
          const addIdx = session.selectedAdd.indexOf(alias);
          if (addIdx >= 0) session.selectedAdd.splice(addIdx, 1);
        }
        break;
      }

      case 'r': { // Toggle remove selection
        const idx = session.selectedRemove.indexOf(alias);
        if (idx >= 0) {
          session.selectedRemove.splice(idx, 1);
        } else {
          session.selectedRemove.push(alias);
        }
        break;
      }

      case 'ok': { // Validate — apply changes
        const totalSelections = session.selectedAdd.length + session.selectedReplace.length + session.selectedRemove.length;
        if (totalSelections === 0) {
          await this.bot.answerCallbackQuery(query.id, { text: 'No models selected!' });
          return;
        }

        // Load existing dynamic models to merge
        const existing = await this.storage.loadDynamicModels();
        const dynamicModels = existing?.models || {};
        const blockedList = existing?.blocked || [];

        // Helper to create ModelInfo from candidate
        const candidateToModelInfo = (candidate: SyncModelCandidate): ModelInfo => ({
          id: candidate.modelId,
          alias: candidate.alias,
          name: candidate.name,
          specialty: candidate.category
            ? `Free ${candidate.category.charAt(0).toUpperCase() + candidate.category.slice(1)} (synced)`
            : 'Free (synced from OpenRouter)',
          score: `${candidate.contextK}K context`,
          cost: 'FREE',
          isFree: true,
          supportsVision: candidate.vision || undefined,
          supportsTools: candidate.tools || undefined,
          maxContext: candidate.contextK * 1024,
        });

        // Add selected new models
        const addedNames: string[] = [];
        for (const addAlias of session.selectedAdd) {
          const candidate = session.newModels.find(m => m.alias === addAlias);
          if (!candidate) continue;
          dynamicModels[addAlias] = candidateToModelInfo(candidate);
          addedNames.push(addAlias);
        }

        // Process replacements (add new + block old)
        const replacedNames: string[] = [];
        for (const replAlias of session.selectedReplace) {
          const repl = session.replacements.find(r => r.newAlias === replAlias);
          if (!repl) continue;
          const candidate = session.newModels.find(m => m.alias === replAlias);
          if (!candidate) continue;

          // Add new model
          dynamicModels[replAlias] = candidateToModelInfo(candidate);

          // Block old model
          if (!blockedList.includes(repl.oldAlias)) {
            blockedList.push(repl.oldAlias);
          }
          delete dynamicModels[repl.oldAlias];
          replacedNames.push(`/${replAlias} ↻ /${repl.oldAlias}`);
        }

        // Block selected stale models
        const removedNames: string[] = [];
        for (const rmAlias of session.selectedRemove) {
          if (!blockedList.includes(rmAlias)) {
            blockedList.push(rmAlias);
          }
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
        if (replacedNames.length > 0) {
          result += `Replaced ${replacedNames.length} model(s):\n`;
          for (const a of replacedNames) result += `  ${a}\n`;
        }
        if (removedNames.length > 0) {
          result += `Removed ${removedNames.length} model(s):\n`;
          for (const a of removedNames) result += `  /${a}\n`;
        }
        result += '\nChanges are active now and persist across deploys.';

        // Update message, remove buttons, clean up session
        await this.bot.editMessageWithButtons(chatId, session.messageId, result, null);
        await this.storage.deleteSyncSession(userId);
        return;
      }

      case 'x': // Cancel
        await this.bot.editMessageWithButtons(chatId, session.messageId, '🔄 Sync cancelled.', null);
        await this.storage.deleteSyncSession(userId);
        return;
    }

    // Save updated session to R2 and re-render the message
    await this.storage.saveSyncSession(userId, session);
    const text = this.buildSyncMessage(session);
    const buttons = this.buildSyncButtons(session);
    await this.bot.editMessageWithButtons(chatId, session.messageId, text, buttons);
  }

  /**
   * Send /start welcome menu with inline buttons
   */
  private async sendStartMenu(chatId: number): Promise<void> {
    const welcome = `🤖 Welcome to Moltworker!

Your multi-model AI assistant with 15 real-time tools and 30+ AI models.

Just type a message to chat, or tap a button below to explore:`;

    const buttons: InlineKeyboardButton[][] = [
      // Row 1-2: Feature guides
      [
        { text: '💻 Coding', callback_data: 'start:coding' },
        { text: '🔍 Research', callback_data: 'start:research' },
        { text: '🎨 Images', callback_data: 'start:images' },
      ],
      [
        { text: '🔧 Tools & Data', callback_data: 'start:tools' },
        { text: '👁️ Vision', callback_data: 'start:vision' },
        { text: '🧠 Reasoning', callback_data: 'start:reasoning' },
      ],
      // Row 3: Workflows
      [
        { text: '🎼 Orchestra', callback_data: 'start:orchestra' },
        { text: '☁️ Cloudflare', callback_data: 'start:cloudflare' },
      ],
      // Row 4-5: Action sub-menus
      [
        { text: '🤖 Models ▸', callback_data: 'start:sub:models' },
        { text: '💾 Saves ▸', callback_data: 'start:sub:saves' },
        { text: '📊 Stats ▸', callback_data: 'start:sub:stats' },
      ],
      [
        { text: '🔄 Sync ▸', callback_data: 'start:sub:sync' },
        { text: '⚙️ Settings ▸', callback_data: 'start:sub:settings' },
      ],
      // Row 6: Help
      [
        { text: '📖 All Commands', callback_data: 'start:help' },
      ],
    ];

    await this.bot.sendMessageWithButtons(chatId, welcome, buttons);
  }

  /**
   * Get feature detail text for /start button callbacks
   */
  private getStartFeatureText(feature: string): string {
    switch (feature) {
      case 'coding':
        return `💻 Coding with Moltworker

Just describe what you need — I'll read repos, write code, create PRs, and run tests.

What I can do:
• Read files from any GitHub repo
• Create PRs with multi-file changes
• Run code in a sandbox (git, node, npm)
• Analyze code, refactor, debug

🆓 Free models with tools (🔧):
/qwencoderfree — Qwen3 Coder 480B MoE 🔧 (262K ctx)
/trinity — Trinity Large 400B MoE 🔧 (128K ctx)
/devstral — Devstral Small 🔧 (131K ctx)
/gptoss — GPT-OSS 120B 🔧 (128K ctx)

💰 Best paid models for coding:
/deep — DeepSeek V3.2 🔧 ($0.25/M)
/grok — Grok 4.1 🔧 (#1 agentic)
/sonnet — Claude Sonnet 4.5 🔧👁️

⚠️ Models without 🔧 can't use tools (no GitHub, no web fetch).

Try it: "Read the README of PetrAnto/moltworker and summarize it"`;

      case 'research':
        return `🔍 Research & Web

I can fetch any URL, browse JS-heavy sites, pull news, and analyze content.

What I can do:
• Fetch & summarize any webpage
• Browse JS-rendered sites (screenshots, PDFs)
• Get top stories from HackerNews, Reddit, arXiv
• Extract metadata (title, author, images)

Try it: "What's on the front page of Hacker News?"
Try it: "Summarize https://example.com"`;

      case 'images':
        return `🎨 Image Generation

Create images with FLUX.2 models — from quick drafts to high-quality renders.

Usage: /img <prompt>
Example: /img a cat astronaut floating in space

Models (pick by quality):
/img fluxklein — Fast draft ($0.014/MP)
/img fluxpro — Default, great quality ($0.05/MP)
/img fluxflex — Best for text in images ($0.06/MP)
/img fluxmax — Highest quality ($0.07/MP)`;

      case 'tools':
        return `🔧 Tools & Live Data

I have 14 tools that run automatically — just ask naturally:

📊 Data:
• "What's the weather in Prague?"
• "Bitcoin price" / "Top 10 crypto"
• "Convert 100 EUR to CZK"

📰 News:
• "Top stories on HN" / "Reddit r/programming"
• "Latest arXiv papers on cs.AI"

🌐 Web:
• Paste any URL — I'll fetch it
• "Browse https://example.com" for JS sites

📈 Charts:
• "Chart showing quarterly revenue: Q1=10, Q2=15, Q3=22, Q4=30"

🌍 Other:
• "Geolocate IP 8.8.8.8"
• /briefing for a daily digest (weather + news)`;

      case 'vision':
        return `👁️ Vision & Image Analysis

Send a photo and I'll analyze it. Add a caption to guide the analysis.

What I can do:
• Identify objects, text, scenes
• Analyze code from screenshots
• Combine vision with tools (see a city → get its weather)

How to use:
• Send a photo → I describe what I see
• Send a photo + caption → I follow your instructions
• Works with: /gpt, /flash, /haiku, /sonnet, /kimi

Try it: Send a screenshot and ask "What's in this image?"`;

      case 'reasoning':
        return `🧠 Deep Reasoning

Activate extended thinking for complex problems — math, logic, planning.

Usage: Prefix your message with think:high
Example: "think:high Prove that the square root of 2 is irrational"

Levels: think:low, think:medium, think:high, think:off

Also works with JSON: "think:high json: Analyze these metrics..."

Best reasoning models:
/deep — Great value, configurable thinking
/flash — Strong reasoning + 1M context
/opus — Maximum quality`;

      case 'cloudflare':
        return `☁️ Cloudflare API Integration

Query and execute Cloudflare API calls directly from chat.

━━━ Commands ━━━
/cf search <query> — Search Cloudflare API endpoints
/cf execute <code> — Run TypeScript against Cloudflare SDK

━━━ Examples ━━━
/cf search workers
/cf execute list all zones
/cf search dns records

Uses Code Mode MCP for full Cloudflare SDK access. Requires CLOUDFLARE_API_TOKEN.`;

      case 'orchestra':
        return `🎼 Orchestra Mode — AI Project Execution

Give the bot a complex project. It will break it into phases, create a roadmap, then execute tasks one by one — each as a separate PR.

━━━ How it works ━━━

Step 1: Lock your repo
  /orch set PetrAnto/myapp

Step 2: Create a roadmap
  /orch init Build a user auth system with JWT and OAuth
  → Creates ROADMAP.md + WORK_LOG.md as a PR

Step 3: Execute tasks
  /orch next
  → Reads the roadmap, picks the next task, implements it
  → Updates ROADMAP.md (✅) + WORK_LOG.md in the same PR

Step 4: Repeat
  /orch next  (keep going until done)

━━━ Commands ━━━
/orch set owner/repo — Lock default repo
/orch init <description> — Create roadmap
/orch next — Execute next task
/orch next <specific task> — Execute specific task
/orch run owner/repo — Run with explicit repo
/orch roadmap — View roadmap status
/orch history — View past tasks
/orch unset — Clear locked repo

━━━ Fixing Mistakes ━━━
/orch redo <task> — Re-implement a task that was done wrong
  → Bot examines what went wrong and creates a fix PR
/orch reset <task> — Uncheck a completed task
  → Creates a PR that flips ✅→⬜, then /orch next re-runs it
/orch reset Phase 2 — Reset all tasks in a phase

━━━ What gets created ━━━
📋 ROADMAP.md — Phased task list with - [ ] / - [x] checkboxes
📝 WORK_LOG.md — Table: Date | Task | Model | Branch | PR | Status

Each /orch next picks up where the last one left off.`;

      default:
        return '';
    }
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
/test — Run smoke tests (DO health check)
/test list — Show available tests

━━━ Costs & Credits ━━━
/credits — OpenRouter balance
/costs — Token usage summary
/costs week — Past 7 days breakdown

━━━ Daily Briefing ━━━
/briefing — Weather + HN + Reddit + arXiv digest

━━━ Task History ━━━
/learnings — View task patterns, success rates, top tools
/sessions — Recent Acontext sessions (replay & analysis)

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
/autoroute — Toggle fast-model routing for simple queries
/resume [model] — Resume with optional model override

━━━ Models (quick switch) ━━━
Paid:  /deep /grok /gpt /sonnet /haiku /flash /mimo
Free:  /trinity /deepfree /qwencoderfree /devstral
Direct: /dcode /dreason /q3coder /kimidirect
All:   /models for full list
/syncmodels — Fetch latest free models (interactive picker)
/syncall — Full catalog sync + top 20 recommendations
/synccheck — Check for updates (actionable: apply price changes)
/modelupdate <alias> key=val — Patch a model without deploy
/modelupdate list — Show active overrides

━━━ Cloudflare API ━━━
/cloudflare search <query> — Search CF API endpoints
/cloudflare execute <code> — Run TypeScript against CF SDK
/cf — Shortcut alias

━━━ 15 Live Tools ━━━
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
 • github_create_pr — Create PR with file changes
 • sandbox_exec — Run commands in sandbox container
 • cloudflare_api — Full Cloudflare API via Code Mode MCP

━━━ Orchestra Mode ━━━
/orch set owner/repo — Lock default repo
/orch init <desc> — Create ROADMAP.md + WORK_LOG.md
/orch next — Execute next roadmap task
/orch next <task> — Execute specific task
/orch roadmap — View roadmap status
/orch history — View past tasks
/orch redo <task> — Re-implement a failed task
/orch reset <task> — Uncheck task(s) for re-run

━━━ Special Prefixes ━━━
think:high <msg> — Deep reasoning (also: low, medium, off)
json: <msg> — Structured JSON output
Both work together: think:high json: analyze X

━━━ Vision ━━━
Send a photo with a caption — the bot analyzes the image and can call tools based on what it sees (e.g. identify a city, then look up its weather).
Send a photo without caption — defaults to "What is in this image?"
Models with vision: gpt, sonnet, haiku, flash, geminipro, kimi, kimidirect`;
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
  braveSearchKey?: string,
  taskProcessor?: DurableObjectNamespace<TaskProcessor>,
  browser?: Fetcher,
  dashscopeKey?: string,
  moonshotKey?: string,
  deepseekKey?: string,
  sandbox?: SandboxLike,
  acontextKey?: string,
  acontextBaseUrl?: string,
  cloudflareApiToken?: string
): TelegramHandler {
  return new TelegramHandler(
    telegramToken,
    openrouterKey,
    r2Bucket,
    workerUrl,
    defaultSkill,
    allowedUserIds,
    githubToken,
    braveSearchKey,
    taskProcessor,
    browser,
    dashscopeKey,
    moonshotKey,
    deepseekKey,
    sandbox,
    acontextKey,
    acontextBaseUrl,
    cloudflareApiToken
  );
}
