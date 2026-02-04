/**
 * Telegram Webhook Handler
 * Handles incoming Telegram updates and routes to appropriate handlers
 */

import { OpenRouterClient, createOpenRouterClient, extractTextResponse, type ChatMessage } from '../openrouter/client';
import { UserStorage, createUserStorage, SkillStorage, createSkillStorage } from '../openrouter/storage';
import { modelSupportsTools } from '../openrouter/tools';
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

  constructor(
    telegramToken: string,
    openrouterKey: string,
    r2Bucket: R2Bucket,
    workerUrl?: string,
    defaultSkill: string = 'storia-orchestrator',
    allowedUserIds?: string[] // Pass user IDs to restrict access
  ) {
    this.bot = new TelegramBot(telegramToken);
    this.openrouter = createOpenRouterClient(openrouterKey, workerUrl);
    this.storage = createUserStorage(r2Bucket);
    this.skills = createSkillStorage(r2Bucket);
    this.defaultSkill = defaultSkill;
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
        'Usage: /img <prompt>\n' +
        'Or: /img <model> <prompt>\n\n' +
        'Available models:\n' +
        '  fluxpro - FLUX 2 Pro (default)\n' +
        '  fluxmax - FLUX 2 Max (higher quality)\n\n' +
        'Examples:\n' +
        '  /img a cat in space\n' +
        '  /img fluxmax a detailed portrait'
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
        // Send initial status message
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

        // Use tool-calling chat completion
        const { finalText, toolsUsed } = await this.openrouter.chatCompletionWithTools(
          modelAlias,
          messages,
          {
            maxToolCalls: 15,
            onToolCall: (toolName, _args) => {
              updateStatus(toolName);
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
   * Handle callback queries (from inline keyboards)
   */
  private async handleCallback(query: TelegramCallbackQuery): Promise<void> {
    // Handle callback query if needed
    console.log('[Telegram] Callback query:', query.data);
  }

  /**
   * Get help message
   */
  private getHelpMessage(): string {
    return `Welcome to Moltworker AI Bot!

Commands:
/models - List all available AI models
/use <alias> - Set your default model
/model - Show your current model
/clear - Clear conversation history
/img <prompt> - Generate an image
/credits - Check OpenRouter credits
/skill - Show/reload AI skill from R2

Quick model switch (just type the alias):
/auto - Auto-route (default, best value)
/deep - DeepSeek V3.2
/gpt - GPT-4o
/sonnet - Claude Sonnet 4.5
/haiku - Claude Haiku 4.5
/flash - Gemini 3 Flash

Free models:
/trinity - Free premium reasoning
/deepchimera - Free deep reasoning
/llama405free - Llama 3.1 405B
/fluxpro - Free image generation

Just send a message to chat with your selected AI!
Send a photo with a caption to use vision.`;
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
  allowedUserIds?: string[]
): TelegramHandler {
  return new TelegramHandler(
    telegramToken,
    openrouterKey,
    r2Bucket,
    workerUrl,
    defaultSkill,
    allowedUserIds
  );
}
